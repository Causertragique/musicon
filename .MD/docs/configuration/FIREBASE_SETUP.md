# Configuration Firebase - Guide Complet

## 🚀 Étape 1 : Créer un projet Firebase

1. **Aller sur Firebase Console**
   - Visitez https://console.firebase.google.com/
   - Cliquez sur "Créer un projet"

2. **Configurer le projet**
   - Nom du projet : `teacher-student-app` (ou votre nom préféré)
   - Activer Google Analytics (optionnel)
   - Cliquez sur "Créer le projet"

## 🗄️ Étape 2 : Configurer Firestore Database

1. **Activer Firestore**
   - Dans le menu de gauche, cliquez sur "Firestore Database"
   - Cliquez sur "Créer une base de données"
   - Choisissez "Mode production" ou "Mode test" (pour commencer)
   - Sélectionnez une région (ex: europe-west1)

2. **Configurer les règles de sécurité**
   - Allez dans l'onglet "Règles"
   - Remplacez par ces règles de base :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permettre la lecture/écriture pour tous les utilisateurs authentifiés
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🔐 Étape 3 : Configurer Authentication

1. **Activer l'authentification**
   - Dans le menu de gauche, cliquez sur "Authentication"
   - Cliquez sur "Commencer"

2. **Configurer les fournisseurs**
   - **Google** : Cliquez sur "Google" → Activez → Sauvegardez
   - **Microsoft** : Cliquez sur "Microsoft" → Activez → Sauvegardez

## ⚙️ Étape 4 : Obtenir les clés de configuration

1. **Configuration de l'app web**
   - Dans le menu de gauche, cliquez sur l'icône ⚙️ (Paramètres du projet)
   - Cliquez sur "Paramètres du projet"
   - Dans l'onglet "Général", faites défiler jusqu'à "Vos applications"
   - Cliquez sur l'icône web (</>) pour ajouter une app web
   - Nommez-la "Teacher Student App"
   - Copiez la configuration

2. **Créer le fichier .env.local**
   ```bash
   # Créez un fichier .env.local à la racine du projet
   touch .env.local
   ```

3. **Ajouter les variables d'environnement**
   ```env
   # Configuration Firebase
   VITE_FIREBASE_API_KEY=votre-api-key
   VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=votre-projet-id
   VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=votre-app-id

   # Configuration Google OAuth
   VITE_GOOGLE_CLIENT_ID=votre-google-client-id

   # Configuration Microsoft OAuth
   VITE_MICROSOFT_CLIENT_ID=votre-microsoft-client-id
   ```

## 🔄 Étape 5 : Migrer vers Firebase

1. **Remplacer DataContext**
   - Dans `src/App.tsx`, remplacez `DataProvider` par `FirebaseDataProvider`
   - Dans tous les composants, remplacez `useData` par `useFirebaseData`

2. **Tester la connexion**
   ```bash
   npm run dev
   ```

## 📊 Étape 6 : Créer les données initiales

1. **Ajouter un utilisateur de test**
   - Utilisez l'interface d'authentification
   - Ou ajoutez manuellement dans Firestore

2. **Créer des groupes de test**
   - Utilisez l'interface de l'application
   - Ou ajoutez manuellement dans Firestore

## 🚀 Étape 7 : Déployer

1. **Build de production**
   ```bash
   npm run build
   ```

2. **Déployer sur Vercel**
   - Connectez votre projet GitHub à Vercel
   - Ajoutez les variables d'environnement dans Vercel
   - Déployez !

## 🔧 Dépannage

### Erreur de connexion Firebase
- Vérifiez que les variables d'environnement sont correctes
- Vérifiez que Firestore est activé
- Vérifiez les règles de sécurité

### Erreur d'authentification
- Vérifiez que les fournisseurs sont activés dans Firebase
- Vérifiez les domaines autorisés

### Erreur de permissions
- Vérifiez les règles Firestore
- Assurez-vous que l'utilisateur est authentifié

## 📝 Notes importantes

- **Mode test** : Permet toutes les opérations (pour le développement)
- **Mode production** : Nécessite des règles de sécurité strictes
- **Variables d'environnement** : Ne jamais commiter le fichier `.env.local`
- **Sauvegarde** : Firebase sauvegarde automatiquement vos données 