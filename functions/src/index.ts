import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

// Initialise Firebase Admin
admin.initializeApp();

// Initialise Stripe avec la clé secrète
// À FAIRE : Ajouter votre clé secrète Stripe dans les variables d'environnement
const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: "2024-04-10",
});

/**
 * Crée une session de paiement Stripe pour un utilisateur.
 */
export const createCheckoutSession = functions.runWith({memory: "1GB"})
    .https.onCall(async (data, context) => {
    // Vérifier si l'utilisateur est authentifié
      if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Vous devez être connecté pour effectuer un achat.",
        );
      }

      const {priceId, userId} = data;
      const userEmail = context.auth.token.email;

      if (!priceId || !userId || !userEmail) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Informations manquantes pour créer la session de paiement.",
        );
      }

      try {
        // Vérifier si le client Stripe existe déjà
        let customer;
        const customerList = await stripe.customers.list({email: userEmail,
          limit: 1});
        if (customerList.data.length > 0) {
          customer = customerList.data[0];
        } else {
          customer = await stripe.customers.create({
            email: userEmail,
            metadata: {
              firebaseUID: userId,
            },
          });
        }

        // Créer la session de paiement
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "subscription", // Ou "payment" pour un achat unique
          customer: customer.id,
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          // URLs de retour dynamiques passées depuis le frontend
          success_url: data.successUrl || `${functions.config().app.url}/teacher?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: data.cancelUrl || `${functions.config().app.url}/teacher?canceled=true`,
          metadata: {
            firebaseUID: userId,
          },
        });

        return {id: session.id};
      } catch (error) {
        console.error("Erreur Stripe :", error);
        throw new functions.https.HttpsError(
            "internal",
            "Impossible de créer la session de paiement Stripe.",
        );
      }
    });

/**
 * Écoute les événements de Stripe (webhooks) pour mettre à jour la base de données.
 */
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  // À FAIRE : Logique du webhook
  console.log("Webhook Stripe reçu !");
  res.status(200).send("Webhook reçu");
});

/**
 * Compte les élèves pour chaque professeur abonné et rapporte l'utilisation à Stripe.
 * S'exécute automatiquement tous les jours à 1h du matin.
 */
export const reportUsage = functions.pubsub
    .schedule("every 24 hours")
    .onRun(async () => {
      console.log("Démarrage du rapport d'utilisation quotidien.");

      try {
        // 1. Récupérer tous les abonnements Stripe actifs
        const subscriptions = await stripe.subscriptions.list({
          status: "active",
          limit: 100, // Ajuster si vous avez plus de 100 clients
        });

        console.log(`Trouvé ${subscriptions.data.length} abonnements actifs.`);

        // 2. Pour chaque abonnement, compter les élèves et rapporter l'usage
        for (const subscription of subscriptions.data) {
          const customerId = subscription.customer as string;
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;

          if (customer.deleted) continue;

          const firebaseUID = customer.metadata.firebaseUID;
          if (!firebaseUID) {
            console.warn(`Aucun firebaseUID trouvé pour le client Stripe ${customerId}.`);
            continue;
          }

          // Récupérer tous les élèves de ce professeur
          const studentsSnapshot = await admin.firestore()
              .collection("users")
              .where("role", "==", "student")
              .where("teacherId", "==", firebaseUID) // Hypothèse: les élèves ont un champ teacherId
              .get();

          const studentCount = studentsSnapshot.size;
          console.log(`Professeur ${firebaseUID} a ${studentCount} élèves.`);

          // 3. Rapporter l'utilisation à Stripe
          const subscriptionItemId = subscription.items.data[0]?.id;
          if (!subscriptionItemId) {
            console.error(`Aucun subscription item trouvé pour l'abonnement ${subscription.id}`);
            continue;
          }

          await stripe.subscriptionItems.createUsageRecord(
              subscriptionItemId,
              {
                quantity: studentCount,
                action: "set", // "set" écrase la valeur, "increment" ajoute
              }
          );
          console.log(`Utilisation rapportée pour le professeur ${firebaseUID}: ${studentCount} élèves.`);
        }

        console.log("Rapport d'utilisation terminé avec succès.");
        return null;
      } catch (error) {
        console.error("Erreur lors de l'exécution du rapport d'utilisation:", error);
        return null;
      }
    });

/**
 * Génère un code d'invitation unique pour un enseignant.
 * Ce code permet aux élèves de rejoindre la classe de l'enseignant.
 */
export const generateInvitationCode = functions.https.onCall(async (data, context) => {
  // Vérifier que l'utilisateur est authentifié et est un enseignant
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Utilisateur non authentifié");
  }

  const teacherId = context.auth.uid;

  try {
    // Vérifier que l'utilisateur est un enseignant
    const teacherDoc = await admin.firestore().collection("users").doc(teacherId).get();
    if (!teacherDoc.exists || teacherDoc.data()?.role !== "teacher") {
      throw new functions.https.HttpsError("permission-denied", "Seuls les enseignants peuvent générer des codes d'invitation");
    }

    // Générer un code unique (8 caractères alphanumériques)
    const invitationCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Créer l'invitation dans Firestore
    const invitationRef = await admin.firestore().collection("invitations").add({
      code: invitationCode,
      teacherId: teacherId,
      teacherName: `${teacherDoc.data()?.firstName} ${teacherDoc.data()?.lastName}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expire dans 30 jours
      isActive: true,
      usedCount: 0,
      maxUses: 50, // Limite d'utilisation
    });

    return {
      invitationId: invitationRef.id,
      code: invitationCode,
      teacherName: `${teacherDoc.data()?.firstName} ${teacherDoc.data()?.lastName}`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  } catch (error) {
    console.error("Erreur lors de la génération du code d'invitation:", error);
    throw new functions.https.HttpsError("internal", "Erreur lors de la génération du code d'invitation");
  }
});

/**
 * Valide un code d'invitation et retourne les informations de l'enseignant.
 */
export const validateInvitationCode = functions.https.onCall(async (data) => {
  const {code} = data;

  if (!code) {
    throw new functions.https.HttpsError("invalid-argument", "Code d'invitation requis");
  }

  try {
    // Rechercher l'invitation par code
    const invitationsSnapshot = await admin.firestore()
        .collection("invitations")
        .where("code", "==", code.toUpperCase())
        .where("isActive", "==", true)
        .limit(1)
        .get();

    if (invitationsSnapshot.empty) {
      throw new functions.https.HttpsError("not-found", "Code d'invitation invalide ou expiré");
    }

    const invitation = invitationsSnapshot.docs[0].data();
    const now = new Date();

    // Vérifier si l'invitation a expiré
    if (invitation.expiresAt.toDate() < now) {
      throw new functions.https.HttpsError("failed-precondition", "Code d'invitation expiré");
    }

    // Vérifier si la limite d'utilisation a été atteinte
    if (invitation.usedCount >= invitation.maxUses) {
      throw new functions.https.HttpsError("resource-exhausted", "Limite d'utilisation du code atteinte");
    }

    return {
      teacherId: invitation.teacherId,
      teacherName: invitation.teacherName,
      invitationId: invitationsSnapshot.docs[0].id,
    };
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    console.error("Erreur lors de la validation du code d'invitation:", error);
    throw new functions.https.HttpsError("internal", "Erreur lors de la validation du code d'invitation");
  }
});

/**
 * Crée un compte utilisateur dans Firebase Auth avec un mot de passe temporaire.
 * Cette fonction est appelée par les enseignants pour créer des comptes élèves.
 */
export const createUserAccount = functions.https.onCall(async (data, context) => {
  // Vérifier que l'utilisateur est authentifié et est un enseignant
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Utilisateur non authentifié");
  }

  const {email, firstName, lastName} = data;

  if (!email || !firstName || !lastName) {
    throw new functions.https.HttpsError("invalid-argument", "Email, prénom et nom sont requis");
  }

  try {
    // Générer un mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    // Créer l'utilisateur dans Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: tempPassword,
      displayName: `${firstName} ${lastName}`,
    });

    // Retourner l'UID et le mot de passe temporaire
    return {
      uid: userRecord.uid,
      tempPassword: tempPassword,
    };
  } catch (error) {
    console.error("Erreur lors de la création du compte utilisateur:", error);
    throw new functions.https.HttpsError("internal", "Erreur lors de la création du compte utilisateur");
  }
});

/**
 * Initialise les catégories de produits et les produits de démonstration.
 * Cette fonction ne peut être appelée que par un administrateur.
 */
export const initializeProducts = functions.https.onCall(async (data, context) => {
  // Vérifier que l'utilisateur est authentifié et est un administrateur
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Utilisateur non authentifié");
  }

  const adminId = context.auth.uid;

  try {
    // Vérifier que l'utilisateur est un administrateur
    const adminDoc = await admin.firestore().collection("users").doc(adminId).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== "admin") {
      throw new functions.https.HttpsError("permission-denied", "Seuls les administrateurs peuvent initialiser les produits");
    }

    const batch = admin.firestore().batch();

    // Ajouter les catégories de produits
    const categories = [
      {
        id: "reeds-clarinet",
        name: "Anches de Clarinette",
        type: "reeds",
        instruments: ["Clarinette"],
        strengths: [2, 2.5, 3, 3.5],
        brands: ["Vandoren", "Juno"],
      },
      {
        id: "reeds-bass-clarinet",
        name: "Anches de Clarinette Basse",
        type: "reeds",
        instruments: ["Clarinette Basse"],
        strengths: [2, 2.5, 3, 3.5],
        brands: ["Vandoren", "Juno"],
      },
      {
        id: "reeds-alto-sax",
        name: "Anches de Saxophone Alto",
        type: "reeds",
        instruments: ["Saxophone Alto"],
        strengths: [2, 2.5, 3, 3.5],
        brands: ["Vandoren", "Juno"],
      },
      {
        id: "reeds-tenor-sax",
        name: "Anches de Saxophone Ténor",
        type: "reeds",
        instruments: ["Saxophone Ténor"],
        strengths: [2, 2.5, 3, 3.5],
        brands: ["Vandoren", "Juno"],
      },
      {
        id: "reeds-bari-sax",
        name: "Anches de Saxophone Baryton",
        type: "reeds",
        instruments: ["Saxophone Baryton"],
        strengths: [2, 2.5, 3, 3.5],
        brands: ["Vandoren", "Juno"],
      },
      {
        id: "mouthpieces-clarinet",
        name: "Embouchures de Clarinette",
        type: "mouthpieces",
        instruments: ["Clarinette", "Clarinette Basse"],
      },
      {
        id: "mouthpieces-sax",
        name: "Embouchures de Saxophone",
        type: "mouthpieces",
        instruments: ["Saxophone Alto", "Saxophone Ténor", "Saxophone Baryton"],
      },
      {
        id: "mouthpieces-brass",
        name: "Embouchures de Cuivres",
        type: "mouthpieces",
        instruments: ["Trompette", "Cor", "Trombone", "Euphonium", "Tuba"],
      },
      {
        id: "sticks",
        name: "Baguettes de Drum",
        type: "sticks",
      },
      {
        id: "methods",
        name: "Méthodes",
        type: "methods",
      },
      {
        id: "other",
        name: "Autres",
        type: "other",
      },
    ];

    categories.forEach((category) => {
      const categoryRef = admin.firestore().collection("productCategories").doc(category.id);
      batch.set(categoryRef, {
        ...category,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    // Ajouter les produits de démonstration
    const products = [
      {
        id: "reed-clarinet-vandoren-2",
        name: "Anche Vandoren Clarinette Force 2",
        categoryId: "reeds-clarinet",
        instrument: "Clarinette",
        strength: 2,
        brand: "Vandoren",
        currentPrice: 3.50,
        stockQuantity: 25,
        minStockLevel: 5,
      },
      {
        id: "reed-clarinet-vandoren-2-5",
        name: "Anche Vandoren Clarinette Force 2.5",
        categoryId: "reeds-clarinet",
        instrument: "Clarinette",
        strength: 2.5,
        brand: "Vandoren",
        currentPrice: 3.50,
        stockQuantity: 30,
        minStockLevel: 5,
      },
      {
        id: "reed-clarinet-vandoren-3",
        name: "Anche Vandoren Clarinette Force 3",
        categoryId: "reeds-clarinet",
        instrument: "Clarinette",
        strength: 3,
        brand: "Vandoren",
        currentPrice: 3.50,
        stockQuantity: 20,
        minStockLevel: 5,
      },
      {
        id: "reed-alto-sax-vandoren-2",
        name: "Anche Vandoren Saxophone Alto Force 2",
        categoryId: "reeds-alto-sax",
        instrument: "Saxophone Alto",
        strength: 2,
        brand: "Vandoren",
        currentPrice: 4.00,
        stockQuantity: 15,
        minStockLevel: 3,
      },
      {
        id: "mouthpiece-clarinet-b45",
        name: "Embouchure Clarinette B45",
        categoryId: "mouthpieces-clarinet",
        instrument: "Clarinette",
        currentPrice: 45.00,
        stockQuantity: 3,
        minStockLevel: 1,
      },
      {
        id: "sticks-vic-firth-5a",
        name: "Baguettes Vic Firth 5A",
        categoryId: "sticks",
        currentPrice: 12.00,
        stockQuantity: 8,
        minStockLevel: 2,
      },
      {
        id: "method-clarinet-rose",
        name: "Méthode Rose Clarinette",
        categoryId: "methods",
        currentPrice: 18.00,
        stockQuantity: 5,
        minStockLevel: 2,
      },
    ];

    products.forEach((product) => {
      const productRef = admin.firestore().collection("products").doc(product.id);
      batch.set(productRef, {
        ...product,
        priceHistory: [{
          price: product.currentPrice,
          date: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: adminId,
        }],
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    return {
      success: true,
      categoriesCount: categories.length,
      productsCount: products.length,
    };
  } catch (error) {
    console.error("Erreur lors de l'initialisation des produits:", error);
    throw new functions.https.HttpsError("internal", "Erreur lors de l'initialisation des produits");
  }
});

/**
 * Met à jour le prix d'un produit.
 * Cette fonction ne peut être appelée que par un administrateur.
 */
export const updateProductPrice = functions.https.onCall(async (data, context) => {
  // Vérifier que l'utilisateur est authentifié et est un administrateur
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Utilisateur non authentifié");
  }

  const adminId = context.auth.uid;
  const {productId, newPrice} = data;

  if (!productId || !newPrice || newPrice <= 0) {
    throw new functions.https.HttpsError("invalid-argument", "ID du produit et nouveau prix requis");
  }

  try {
    // Vérifier que l'utilisateur est un administrateur
    const adminDoc = await admin.firestore().collection("users").doc(adminId).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== "admin") {
      throw new functions.https.HttpsError("permission-denied", "Seuls les administrateurs peuvent modifier les prix");
    }

    const productRef = admin.firestore().collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Produit non trouvé");
    }

    const productData = productDoc.data();
    const priceHistory = productData?.priceHistory || [];

    // Ajouter le nouveau prix à l'historique
    priceHistory.push({
      price: newPrice,
      date: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: adminId,
    });

    // Mettre à jour le produit
    await productRef.update({
      currentPrice: newPrice,
      priceHistory: priceHistory,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      productId: productId,
      newPrice: newPrice,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du prix:", error);
    throw new functions.https.HttpsError("internal", "Erreur lors de la mise à jour du prix");
  }
});

/**
 * Enregistre une vente et met à jour l'inventaire.
 */
export const recordSale = functions.https.onCall(async (data, context) => {
  // Vérifier que l'utilisateur est authentifié et est un enseignant ou administrateur
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Utilisateur non authentifié");
  }

  const teacherId = context.auth.uid;
  const {productId, studentId, quantity, totalAmount, status} = data;

  if (!productId || !studentId || !quantity || !totalAmount) {
    throw new functions.https.HttpsError("invalid-argument", "Toutes les informations de vente sont requises");
  }

  try {
    // Vérifier que l'utilisateur est un enseignant ou administrateur
    const teacherDoc = await admin.firestore().collection("users").doc(teacherId).get();
    if (!teacherDoc.exists || !["teacher", "admin"].includes(teacherDoc.data()?.role)) {
      throw new functions.https.HttpsError("permission-denied", "Seuls les enseignants et administrateurs peuvent enregistrer des ventes");
    }

    // Vérifier que l'élève existe
    const studentDoc = await admin.firestore().collection("users").doc(studentId).get();
    if (!studentDoc.exists || studentDoc.data()?.role !== "student") {
      throw new functions.https.HttpsError("not-found", "Élève non trouvé");
    }

    // Vérifier que le produit existe et a assez de stock
    const productRef = admin.firestore().collection("products").doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Produit non trouvé");
    }

    const productData = productDoc.data();
    if (productData?.stockQuantity < quantity) {
      throw new functions.https.HttpsError("failed-precondition", "Stock insuffisant");
    }

    const batch = admin.firestore().batch();

    // Créer la vente
    const saleRef = admin.firestore().collection("sales").doc();
    batch.set(saleRef, {
      productId: productId,
      productName: productData?.name,
      studentId: studentId,
      studentName: `${studentDoc.data()?.firstName} ${studentDoc.data()?.lastName}`,
      teacherId: teacherId,
      quantity: quantity,
      unitPrice: productData?.currentPrice,
      totalAmount: totalAmount,
      status: status || "credit", // 'paid' ou 'credit'
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      paidAt: status === "paid" ? admin.firestore.FieldValue.serverTimestamp() : null,
    });

    // Mettre à jour l'inventaire
    const newStockQuantity = productData?.stockQuantity - quantity;
    batch.update(productRef, {
      stockQuantity: newStockQuantity,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Créer une transaction d'inventaire
    const inventoryRef = admin.firestore().collection("inventoryTransactions").doc();
    batch.set(inventoryRef, {
      productId: productId,
      type: "sale",
      quantity: quantity,
      previousStock: productData?.stockQuantity,
      newStock: newStockQuantity,
      teacherId: teacherId,
      studentId: studentId,
      saleId: saleRef.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return {
      success: true,
      saleId: saleRef.id,
      newStockQuantity: newStockQuantity,
    };
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la vente:", error);
    throw new functions.https.HttpsError("internal", "Erreur lors de l'enregistrement de la vente");
  }
});

/**
 * Crée une notification pour un utilisateur.
 */
export const createNotification = functions.https.onCall(async (data, context) => {
  // Vérifier que l'utilisateur est authentifié
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Utilisateur non authentifié");
  }

  const {recipientId, type, title, message, recipientRole, relatedId, priority} = data;

  if (!recipientId || !type || !title || !message || !recipientRole) {
    throw new functions.https.HttpsError("invalid-argument", "Toutes les informations de notification sont requises");
  }

  try {
    const notificationRef = await admin.firestore().collection("notifications").add({
      recipientId: recipientId,
      type: type,
      title: title,
      message: message,
      recipientRole: recipientRole,
      relatedId: relatedId,
      isRead: false,
      priority: priority || "medium",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: type === "debt_reminder" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null, // 7 jours pour les rappels de dette
    });

    return {
      success: true,
      notificationId: notificationRef.id,
    };
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error);
    throw new functions.https.HttpsError("internal", "Erreur lors de la création de la notification");
  }
});

/**
 * Marque une notification comme lue.
 */
export const markNotificationAsRead = functions.https.onCall(async (data, context) => {
  // Vérifier que l'utilisateur est authentifié
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Utilisateur non authentifié");
  }

  const {notificationId} = data;
  const userId = context.auth.uid;

  if (!notificationId) {
    throw new functions.https.HttpsError("invalid-argument", "ID de notification requis");
  }

  try {
    const notificationRef = admin.firestore().collection("notifications").doc(notificationId);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Notification non trouvée");
    }

    const notificationData = notificationDoc.data();
    if (notificationData?.recipientId !== userId) {
      throw new functions.https.HttpsError("permission-denied", "Vous ne pouvez pas modifier cette notification");
    }

    await notificationRef.update({
      isRead: true,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erreur lors du marquage de la notification:", error);
    throw new functions.https.HttpsError("internal", "Erreur lors du marquage de la notification");
  }
});

/**
 * Fonction programmée pour envoyer des rappels de dettes automatiquement.
 * S'exécute tous les jours à 9h du matin.
 */
export const sendDebtReminders = functions.pubsub
    .schedule("0 9 * * *") // Tous les jours à 9h
    .onRun(async () => {
      console.log("Démarrage de l'envoi des rappels de dettes.");

      try {
      // Récupérer tous les élèves avec des dettes
        const salesSnapshot = await admin.firestore()
            .collection("sales")
            .where("status", "==", "credit")
            .get();

        const studentDebts = new Map<string, { total: number; sales: unknown[] }>();

        // Calculer les dettes par élève
        salesSnapshot.docs.forEach((doc) => {
          const sale = doc.data();
          const studentId = sale.studentId;

          if (!studentDebts.has(studentId)) {
            studentDebts.set(studentId, {total: 0, sales: []});
          }

          const debt = studentDebts.get(studentId)!;
          debt.total += sale.totalAmount;
          debt.sales.push(sale);
        });

        // Créer des notifications pour les enseignants des élèves endettés
        const batch = admin.firestore().batch();
        let notificationCount = 0;

        for (const [studentId, debt] of studentDebts) {
        // Récupérer les informations de l'élève
          const studentDoc = await admin.firestore().collection("users").doc(studentId).get();
          if (!studentDoc.exists) continue;

          const studentData = studentDoc.data();
          const teacherId = studentData?.teacherId;

          if (teacherId) {
          // Créer une notification pour l'enseignant
            const notificationRef = admin.firestore().collection("notifications").doc();
            batch.set(notificationRef, {
              recipientId: teacherId,
              type: "debt_reminder",
              title: "Rappel de dette - Élève",
              message: `${studentData.firstName} ${studentData.lastName} a une dette de ${debt.total.toFixed(2)} $ (${debt.sales.length} achat${debt.sales.length > 1 ? "s" : ""} en attente)`,
              recipientRole: "teacher",
              relatedId: studentId,
              isRead: false,
              priority: debt.total > 50 ? "high" : "medium",
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
            });
            notificationCount++;
          }
        }

        await batch.commit();
        console.log(`${notificationCount} rappels de dettes envoyés.`);
        return null;
      } catch (error) {
        console.error("Erreur lors de l'envoi des rappels de dettes:", error);
        return null;
      }
    });

/**
 * Fonction programmée pour vérifier les stocks et envoyer des alertes.
 * S'exécute tous les jours à 8h du matin.
 */
export const checkLowStock = functions.pubsub
    .schedule("0 8 * * *") // Tous les jours à 8h
    .onRun(async () => {
      console.log("Démarrage de la vérification des stocks.");

      try {
      // Récupérer tous les produits avec stock faible
        const productsSnapshot = await admin.firestore()
            .collection("products")
            .where("stockQuantity", "<=", admin.firestore.FieldValue.serverTimestamp())
            .get();

        if (productsSnapshot.empty) {
          console.log("Aucun produit en stock faible.");
          return null;
        }

        // Récupérer tous les administrateurs
        const adminsSnapshot = await admin.firestore()
            .collection("users")
            .where("role", "==", "admin")
            .get();

        if (adminsSnapshot.empty) {
          console.log("Aucun administrateur trouvé.");
          return null;
        }

        const batch = admin.firestore().batch();
        let notificationCount = 0;

        // Créer des notifications pour chaque admin
        adminsSnapshot.docs.forEach((adminDoc) => {
          const adminId = adminDoc.id;

          productsSnapshot.docs.forEach((productDoc) => {
            const product = productDoc.data();

            const notificationRef = admin.firestore().collection("notifications").doc();
            batch.set(notificationRef, {
              recipientId: adminId,
              type: product.stockQuantity === 0 ? "out_of_stock" : "low_stock",
              title: product.stockQuantity === 0 ? "Rupture de stock" : "Stock faible",
              message: `${product.name} : ${product.stockQuantity} en stock (seuil: ${product.minStockLevel})`,
              recipientRole: "admin",
              relatedId: productDoc.id,
              isRead: false,
              priority: product.stockQuantity === 0 ? "high" : "medium",
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            notificationCount++;
          });
        });

        await batch.commit();
        console.log(`${notificationCount} alertes de stock envoyées.`);
        return null;
      } catch (error) {
        console.error("Erreur lors de la vérification des stocks:", error);
        return null;
      }
    });

/**
 * Crée ou met à jour une projection budgétaire.
 */
export const createBudgetProjection = functions.https.onCall(async (data, context) => {
  // Vérifier que l'utilisateur est authentifié et est un administrateur
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Utilisateur non authentifié");
  }

  const adminId = context.auth.uid;
  const {year, totalBudget, studentTypes} = data;

  if (!year || !totalBudget || !studentTypes) {
    throw new functions.https.HttpsError("invalid-argument", "Toutes les informations de projection sont requises");
  }

  try {
    // Vérifier que l'utilisateur est un administrateur
    const adminDoc = await admin.firestore().collection("users").doc(adminId).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== "admin") {
      throw new functions.https.HttpsError("permission-denied", "Seuls les administrateurs peuvent créer des projections budgétaires");
    }

    // Calculer les coûts totaux par type d'élève
    const regularTotalCost = studentTypes.regular.count * studentTypes.regular.costPerStudent;
    const profileTotalCost = studentTypes.profile.count * studentTypes.profile.costPerStudent;
    const totalProjectedCost = regularTotalCost + profileTotalCost;

    // Créer les enveloppes budgétaires par défaut
    const defaultEnvelopes = [
      {
        id: "fournitures",
        name: "fournitures",
        displayName: "Fournitures",
        description: "Ventes de fournitures aux élèves",
        budgetAllocated: totalProjectedCost * 0.15, // 15% du budget
        budgetSpent: 0,
        budgetRemaining: totalProjectedCost * 0.15,
        isRevenue: true,
      },
      {
        id: "specialistes",
        name: "specialistes",
        displayName: "Spécialistes",
        description: "Engagement de spécialistes pour les leçons",
        budgetAllocated: totalProjectedCost * 0.25, // 25% du budget
        budgetSpent: 0,
        budgetRemaining: totalProjectedCost * 0.25,
        isRevenue: false,
      },
      {
        id: "concours",
        name: "concours",
        displayName: "Concours",
        description: "Participation aux concours musicaux",
        budgetAllocated: totalProjectedCost * 0.15, // 15% du budget
        budgetSpent: 0,
        budgetRemaining: totalProjectedCost * 0.15,
        isRevenue: false,
      },
      {
        id: "camps",
        name: "camps",
        displayName: "Camps Musicaux",
        description: "Organisation de camps musicaux",
        budgetAllocated: totalProjectedCost * 0.20, // 20% du budget
        budgetSpent: 0,
        budgetRemaining: totalProjectedCost * 0.20,
        isRevenue: false,
      },
      {
        id: "concerts",
        name: "concerts",
        displayName: "Concerts",
        description: "Organisation de concerts",
        budgetAllocated: totalProjectedCost * 0.15, // 15% du budget
        budgetSpent: 0,
        budgetRemaining: totalProjectedCost * 0.15,
        isRevenue: false,
      },
      {
        id: "instruments",
        name: "instruments",
        displayName: "Achats d'Instruments",
        description: "Acquisition d'instruments pour le département",
        budgetAllocated: totalProjectedCost * 0.10, // 10% du budget
        budgetSpent: 0,
        budgetRemaining: totalProjectedCost * 0.10,
        isRevenue: false,
      },
    ];

    // Créer la projection budgétaire
    const projectionRef = admin.firestore().collection("budgetProjections").doc();
    await projectionRef.set({
      year: year,
      totalBudget: totalBudget,
      studentTypes: {
        regular: {
          count: studentTypes.regular.count,
          costPerStudent: studentTypes.regular.costPerStudent,
          totalCost: regularTotalCost,
        },
        profile: {
          count: studentTypes.profile.count,
          costPerStudent: studentTypes.profile.costPerStudent,
          totalCost: profileTotalCost,
        },
      },
      envelopes: defaultEnvelopes.map((envelope) => ({
        ...envelope,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })),
      totalProjectedCost: totalProjectedCost,
      totalProjectedRevenue: totalProjectedCost * 0.15, // Revenus des fournitures
      netBudget: totalBudget - totalProjectedCost,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      projectionId: projectionRef.id,
      totalProjectedCost: totalProjectedCost,
      netBudget: totalBudget - totalProjectedCost,
    };
  } catch (error) {
    console.error("Erreur lors de la création de la projection budgétaire:", error);
    throw new functions.https.HttpsError("internal", "Erreur lors de la création de la projection budgétaire");
  }
});

/**
 * Enregistre une transaction budgétaire.
 */
export const recordBudgetTransaction = functions.https.onCall(async (data, context) => {
  // Vérifier que l'utilisateur est authentifié et est un administrateur
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Utilisateur non authentifié");
  }

  const adminId = context.auth.uid;
  const {envelopeId, type, amount, description, category, studentType, date} = data;

  if (!envelopeId || !type || !amount || !description || !category) {
    throw new functions.https.HttpsError("invalid-argument", "Toutes les informations de transaction sont requises");
  }

  try {
    // Vérifier que l'utilisateur est un administrateur
    const adminDoc = await admin.firestore().collection("users").doc(adminId).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== "admin") {
      throw new functions.https.HttpsError("permission-denied", "Seuls les administrateurs peuvent enregistrer des transactions budgétaires");
    }

    // Créer la transaction
    const transactionRef = await admin.firestore().collection("budgetTransactions").add({
      envelopeId: envelopeId,
      type: type,
      amount: amount,
      description: description,
      category: category,
      studentType: studentType,
      date: date ? new Date(date) : admin.firestore.FieldValue.serverTimestamp(),
      approvedBy: adminId,
      status: "approved",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Mettre à jour l'enveloppe budgétaire
    const envelopeRef = admin.firestore().collection("budgetEnvelopes").doc(envelopeId);
    const envelopeDoc = await envelopeRef.get();

    if (envelopeDoc.exists) {
      const envelopeData = envelopeDoc.data();
      const newSpent = envelopeData?.budgetSpent + (type === "expense" ? amount : -amount);
      const newRemaining = envelopeData?.budgetAllocated - newSpent;

      await envelopeRef.update({
        budgetSpent: newSpent,
        budgetRemaining: newRemaining,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return {
      success: true,
      transactionId: transactionRef.id,
    };
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la transaction:", error);
    throw new functions.https.HttpsError("internal", "Erreur lors de l'enregistrement de la transaction");
  }
});

/**
 * Initialise les types d'élèves par défaut.
 */
export const initializeStudentTypes = functions.https.onCall(async (data, context) => {
  // Vérifier que l'utilisateur est authentifié et est un administrateur
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Utilisateur non authentifié");
  }

  const adminId = context.auth.uid;

  try {
    // Vérifier que l'utilisateur est un administrateur
    const adminDoc = await admin.firestore().collection("users").doc(adminId).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== "admin") {
      throw new functions.https.HttpsError("permission-denied", "Seuls les administrateurs peuvent initialiser les types d'élèves");
    }

    const batch = admin.firestore().batch();

    const studentTypes = [
      {
        id: "regular",
        name: "Parcours Régulier",
        description: "Programme de base avec cours standards",
        estimatedCostPerStudent: 500, // Coût estimé par élève
        servicesIncluded: ["Cours de base", "Quelques spécialistes", "Concerts optionnels"],
        specialistFrequency: "low",
        hasPrivateLessons: false,
      },
      {
        id: "profile",
        name: "Profil (Concentration/Musique-Études)",
        description: "Programme intensif avec cours avancés",
        estimatedCostPerStudent: 1200, // Coût estimé par élève
        servicesIncluded: ["Cours avancés", "Spécialistes fréquents", "Cours privés", "Concerts", "Camps", "Concours"],
        specialistFrequency: "high",
        hasPrivateLessons: true,
      },
    ];

    studentTypes.forEach((studentType) => {
      const docRef = admin.firestore().collection("studentTypes").doc(studentType.id);
      batch.set(docRef, {
        ...studentType,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    return {
      success: true,
      studentTypesCount: studentTypes.length,
    };
  } catch (error) {
    console.error("Erreur lors de l'initialisation des types d'élèves:", error);
    throw new functions.https.HttpsError("internal", "Erreur lors de l'initialisation des types d'élèves");
  }
});
