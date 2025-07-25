// Service de sécurité Firebase pour MusiqueConnect

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  limit,
  orderBy,
  startAfter,
  deleteDoc,
  updateDoc,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { secureLog, checkRateLimit } from '../utils/security';

// Types de sécurité
interface SecurityContext {
  userId: string;
  userRole: string;
  timestamp: number;
}

interface QueryOptions {
  limit?: number;
  orderBy?: string;
  startAfter?: any;
  where?: Array<{ field: string; operator: string; value: any }>;
}

// Validation des permissions d'accès
export const validateAccess = async (
  collectionName: string, 
  documentId: string, 
  context: SecurityContext
): Promise<boolean> => {
  try {
    // Rate limiting pour les vérifications d'accès
    if (!checkRateLimit(`access-${context.userId}`, 100, 60000)) {
      secureLog('warn', 'Rate limit dépassé pour les vérifications d\'accès', { userId: context.userId });
      return false;
    }

    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    const data = docSnap.data();

    // Règles de sécurité selon le type de collection
    switch (collectionName) {
      case 'users':
        // Les enseignants peuvent voir leurs élèves et les admins peuvent voir tout
        return context.userRole === 'admin' || 
               data.teacherId === context.userId ||
               data.id === context.userId;

      case 'groups':
        // Les enseignants peuvent voir leurs groupes
        return context.userRole === 'admin' || 
               data.teacherId === context.userId;

      case 'homework':
        // Les enseignants peuvent voir les devoirs de leurs élèves
        return context.userRole === 'admin' || 
               data.teacherId === context.userId ||
               data.studentId === context.userId;

      case 'messages':
        // Les utilisateurs peuvent voir leurs messages
        return context.userRole === 'admin' || 
               data.senderId === context.userId ||
               data.receiverId === context.userId;

      default:
        return context.userRole === 'admin';
    }
  } catch (error) {
    secureLog('error', 'Erreur lors de la validation d\'accès', { error, collectionName, documentId });
    return false;
  }
};

// Lecture sécurisée d'un document
export const secureGetDoc = async (
  collectionName: string,
  documentId: string,
  context: SecurityContext
) => {
  if (!await validateAccess(collectionName, documentId, context)) {
    throw new Error('Accès non autorisé');
  }

  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('Document non trouvé');
  }

  secureLog('info', 'Document lu avec succès', { collectionName, documentId, userId: context.userId });
  return docSnap.data();
};

// Lecture sécurisée d'une collection
export const secureGetDocs = async (
  collectionName: string,
  context: SecurityContext,
  options: QueryOptions = {}
) => {
  // Rate limiting pour les requêtes
  if (!checkRateLimit(`query-${context.userId}`, 50, 60000)) {
    throw new Error('Trop de requêtes. Veuillez attendre un moment.');
  }

  let q: any = collection(db, collectionName);

  // Appliquer les filtres selon le rôle utilisateur
  if (context.userRole !== 'admin') {
    switch (collectionName) {
      case 'users':
        q = query(q, where('teacherId', '==', context.userId));
        break;
      case 'groups':
        q = query(q, where('teacherId', '==', context.userId));
        break;
      case 'homework':
        q = query(q, where('teacherId', '==', context.userId));
        break;
      case 'messages':
        q = query(q, where('senderId', '==', context.userId));
        break;
    }
  }

  // Appliquer les options de requête
  if (options.where) {
    options.where.forEach(condition => {
      q = query(q, where(condition.field, condition.operator as any, condition.value));
    });
  }

  if (options.orderBy) {
    q = query(q, orderBy(options.orderBy));
  }

  if (options.limit) {
    q = query(q, limit(options.limit));
  }

  if (options.startAfter) {
    q = query(q, startAfter(options.startAfter));
  }

  const querySnapshot = await getDocs(q);
  const documents = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Record<string, any>)
  }));

  secureLog('info', 'Collection lue avec succès', { 
    collectionName, 
    count: documents.length, 
    userId: context.userId 
  });

  return documents;
};

// Écriture sécurisée d'un document
export const secureSetDoc = async (
  collectionName: string,
  documentId: string,
  data: any,
  context: SecurityContext
) => {
  // Validation des données avant écriture
  if (!data || typeof data !== 'object') {
    throw new Error('Données invalides');
  }

  // Rate limiting pour les écritures
  if (!checkRateLimit(`write-${context.userId}`, 20, 60000)) {
    throw new Error('Trop d\'écritures. Veuillez attendre un moment.');
  }

  // Ajouter les métadonnées de sécurité
  const secureData = {
    ...data,
    _security: {
      createdBy: context.userId,
      createdAt: context.timestamp,
      lastModifiedBy: context.userId,
      lastModifiedAt: context.timestamp
    }
  };

  const docRef = doc(db, collectionName, documentId);
  await setDoc(docRef, secureData);

  secureLog('info', 'Document créé avec succès', { 
    collectionName, 
    documentId, 
    userId: context.userId 
  });
};

// Mise à jour sécurisée d'un document
export const secureUpdateDoc = async (
  collectionName: string,
  documentId: string,
  data: any,
  context: SecurityContext
) => {
  if (!await validateAccess(collectionName, documentId, context)) {
    throw new Error('Accès non autorisé pour la modification');
  }

  // Rate limiting pour les mises à jour
  if (!checkRateLimit(`update-${context.userId}`, 30, 60000)) {
    throw new Error('Trop de mises à jour. Veuillez attendre un moment.');
  }

  // Ajouter les métadonnées de modification
  const updateData = {
    ...data,
    _security: {
      lastModifiedBy: context.userId,
      lastModifiedAt: context.timestamp
    }
  };

  const docRef = doc(db, collectionName, documentId);
  await updateDoc(docRef, updateData);

  secureLog('info', 'Document mis à jour avec succès', { 
    collectionName, 
    documentId, 
    userId: context.userId 
  });
};

// Suppression sécurisée d'un document
export const secureDeleteDoc = async (
  collectionName: string,
  documentId: string,
  context: SecurityContext
) => {
  if (!await validateAccess(collectionName, documentId, context)) {
    throw new Error('Accès non autorisé pour la suppression');
  }

  // Rate limiting pour les suppressions
  if (!checkRateLimit(`delete-${context.userId}`, 10, 60000)) {
    throw new Error('Trop de suppressions. Veuillez attendre un moment.');
  }

  const docRef = doc(db, collectionName, documentId);
  await deleteDoc(docRef);

  secureLog('info', 'Document supprimé avec succès', { 
    collectionName, 
    documentId, 
    userId: context.userId 
  });
};

// Opérations en lot sécurisées
export const secureBatch = async (
  operations: Array<{
    type: 'set' | 'update' | 'delete';
    collection: string;
    documentId: string;
    data?: any;
  }>,
  context: SecurityContext
) => {
  // Rate limiting pour les opérations en lot
  if (!checkRateLimit(`batch-${context.userId}`, 5, 60000)) {
    throw new Error('Trop d\'opérations en lot. Veuillez attendre un moment.');
  }

  const batch = writeBatch(db);

  for (const operation of operations) {
    const docRef = doc(db, operation.collection, operation.documentId);

    switch (operation.type) {
      case 'set':
        if (operation.data) {
          const secureData = {
            ...operation.data,
            _security: {
              createdBy: context.userId,
              createdAt: context.timestamp,
              lastModifiedBy: context.userId,
              lastModifiedAt: context.timestamp
            }
          };
          batch.set(docRef, secureData);
        }
        break;
      case 'update':
        if (operation.data) {
          const updateData = {
            ...operation.data,
            _security: {
              lastModifiedBy: context.userId,
              lastModifiedAt: context.timestamp
            }
          };
          batch.update(docRef, updateData);
        }
        break;
      case 'delete':
        batch.delete(docRef);
        break;
    }
  }

  await batch.commit();

  secureLog('info', 'Opérations en lot exécutées avec succès', { 
    operationsCount: operations.length, 
    userId: context.userId 
  });
}; 