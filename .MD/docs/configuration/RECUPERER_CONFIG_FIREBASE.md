# 🔧 Guide : Récupérer la Configuration Firebase Réelle

## 🚨 Problème Actuel

Votre application affiche ces erreurs :
- `API key not valid. Please pass a valid API key.`
- `Missing or insufficient permissions.`

Cela signifie que l'API Key dans `.env.local` est un placeholder et non une vraie clé Firebase.

## 📋 Étapes pour Récupérer la Vraie Configuration

### 1. Accéder à la Console Firebase

1. Ouvrez votre navigateur
2. Allez sur : https://console.firebase.google.com/project/musiqueconnect-ac841
3. Connectez-vous avec votre compte Google

### 2. Vérifier/Créer l'Application Web

1. Dans la Console Firebase, cliquez sur l'icône **⚙️ (Paramètres)** en haut à gauche
2. Sélectionnez **"Paramètres du projet"**
3. Allez dans l'onglet **"Général"**
4. Faites défiler jusqu'à la section **"Vos applications"**

#### Si aucune application web n'existe :
1. Cliquez sur **"Ajouter une application"** (icône `</>`)
2. Sélectionnez **"Web"**
3. Donnez un nom à votre application : `MusiqueConnect Web`
4. **Ne cochez PAS** "Configurer Firebase Hosting" (nous l'avons déjà)
5. Cliquez sur **"Enregistrer l'application"**

#### Si une application web existe déjà :
1. Cliquez sur l'application web existante
2. Notez le nom de l'application

### 3. Récupérer la Configuration

1. Dans la page de votre application web, vous verrez une section **"Configuration SDK"**
2. Cliquez sur **"Config"** pour voir la configuration complète
3. Vous verrez quelque chose comme :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz",
  authDomain: "musiqueconnect-ac841.firebaseapp.com",
  projectId: "musiqueconnect-ac841",
  storageBucket: "musiqueconnect-ac841.firebasestorage.app",
  messagingSenderId: "844946743727",
  appId: "1:844946743727:web:abc123def456ghi789"
};
```

### 4. Mettre à Jour le Fichier .env.local

1. Ouvrez le fichier `.env.local` dans votre éditeur
2. Remplacez les valeurs par les vraies valeurs de la console :

```bash
# Configuration Firebase
VITE_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
VITE_FIREBASE_AUTH_DOMAIN=musiqueconnect-ac841.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=musiqueconnect-ac841
VITE_FIREBASE_STORAGE_BUCKET=musiqueconnect-ac841.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=844946743727
VITE_FIREBASE_APP_ID=1:844946743727:web:abc123def456ghi789
VITE_FIREBASE_DATABASE_URL=https://musiqueconnect-ac841-default-rtdb.firebaseio.com
```

**⚠️ Important** : Remplacez `AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz` par votre vraie API Key !

### 5. Vérifier la Configuration

Après avoir mis à jour `.env.local`, testez :

```bash
node scripts/test-firebase-config.cjs
```

Vous devriez voir tous les ✅ verts.

### 6. Tester l'Application

```bash
npm run dev
```

L'application devrait maintenant fonctionner sans erreurs Firebase.

## 🔐 Configuration des Permissions Firestore

Si vous avez encore des erreurs de permissions :

1. Allez sur : https://console.firebase.google.com/project/musiqueconnect-ac841/firestore
2. Cliquez sur **"Règles"**
3. Vérifiez que les règles sont correctes :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Cliquez sur **"Publier"**

## 🔐 Configuration de l'Authentification

1. Allez sur : https://console.firebase.google.com/project/musiqueconnect-ac841/authentication
2. Cliquez sur **"Sign-in method"**
3. Activez **"Google"** si ce n'est pas déjà fait
4. Ajoutez votre domaine dans **"Authorized domains"** :
   - `localhost`
   - `musiqueconnect-ac841.web.app`
   - `musiqueconnect-ac841.firebaseapp.com`

## 🚨 Problèmes Courants

### API Key invalide
- **Cause** : L'API Key est un placeholder
- **Solution** : Récupérez la vraie API Key depuis la console Firebase

### Permissions insuffisantes
- **Cause** : Les règles Firestore sont trop restrictives
- **Solution** : Vérifiez les règles Firestore et l'authentification

### Domain non autorisé
- **Cause** : Votre domaine n'est pas dans la liste des domaines autorisés
- **Solution** : Ajoutez votre domaine dans Authentication > Settings

## 📞 Support

Si vous rencontrez encore des problèmes :
1. Vérifiez que toutes les valeurs dans `.env.local` sont correctes
2. Assurez-vous que l'application web existe dans Firebase Console
3. Vérifiez les règles Firestore
4. Vérifiez la configuration de l'authentification 