# Configuration Firebase Complète - MusiqueConnect

## 🔧 Configuration Actuelle

D'après votre message, voici la configuration Firebase actuelle :

```json
{
  "databaseURL": "",
  "projectId": "musiqueconnect-ac841",
  "storageBucket": "musiqueconnect-ac841.firebasestorage.app"
}
```

## 📋 Configuration Complète Nécessaire

### 1. Configuration Firebase de Base

```json
{
  "apiKey": "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "authDomain": "musiqueconnect-ac841.firebaseapp.com",
  "projectId": "musiqueconnect-ac841",
  "storageBucket": "musiqueconnect-ac841.firebasestorage.app",
  "messagingSenderId": "844946743727",
  "appId": "1:844946743727:web:your-app-id-here",
  "databaseURL": "https://musiqueconnect-ac841-default-rtdb.firebaseio.com"
}
```

### 2. Variables d'Environnement (.env.local)

Créez un fichier `.env.local` à la racine du projet avec :

```bash
# Configuration Firebase
VITE_FIREBASE_API_KEY=AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=musiqueconnect-ac841.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=musiqueconnect-ac841
VITE_FIREBASE_STORAGE_BUCKET=musiqueconnect-ac841.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=844946743727
VITE_FIREBASE_APP_ID=1:844946743727:web:your-app-id-here
VITE_FIREBASE_DATABASE_URL=https://musiqueconnect-ac841-default-rtdb.firebaseio.com

# Configuration Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Configuration Microsoft OAuth
VITE_MICROSOFT_CLIENT_ID=your-microsoft-client-id-here
VITE_MICROSOFT_TENANT_ID=your-microsoft-tenant-id-here

# Configuration Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key-here
VITE_STRIPE_SECRET_KEY=sk_test_your-stripe-secret-here

# Configuration de l'application
VITE_APP_NAME=MusiqueConnect
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
```

## 🔗 URLs Importantes

- **Console Firebase**: https://console.firebase.google.com/project/musiqueconnect-ac841
- **Hosting URL**: https://musiqueconnect-ac841.web.app
- **Firestore**: https://console.firebase.google.com/project/musiqueconnect-ac841/firestore
- **Authentication**: https://console.firebase.google.com/project/musiqueconnect-ac841/authentication
- **Storage**: https://console.firebase.google.com/project/musiqueconnect-ac841/storage
- **Realtime Database**: https://console.firebase.google.com/project/musiqueconnect-ac841/database

## 📋 Étapes pour Récupérer les Valeurs Manquantes

### 1. API Key et App ID

1. Allez sur [Console Firebase](https://console.firebase.google.com/project/musiqueconnect-ac841)
2. Cliquez sur l'icône ⚙️ (Paramètres) > **Paramètres du projet**
3. Onglet **"Général"** > Section **"Vos applications"**
4. Si aucune application web n'existe, cliquez sur **"Ajouter une application"** > **"Web"**
5. Donnez un nom à votre application (ex: "MusiqueConnect Web")
6. Copiez la configuration Firebase qui s'affiche

### 2. Google OAuth Client ID

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Sélectionnez le projet `musiqueconnect-ac841`
3. Cliquez sur **"Créer des identifiants"** > **"ID client OAuth 2.0"**
4. Type d'application : **"Application Web"**
5. Nom : `MusiqueConnect Web Client`
6. URIs de redirection autorisés :
   - `http://localhost:5173`
   - `http://localhost:5174`
   - `http://localhost:5175`
   - `https://musiqueconnect-ac841.web.app`
   - `https://musiqueconnect-ac841.firebaseapp.com`

### 3. Microsoft OAuth (Optionnel)

1. Allez sur [Azure Portal](https://portal.azure.com)
2. **Azure Active Directory** > **Inscriptions d'applications**
3. **Nouvelle inscription**
4. Nom : `MusiqueConnect`
5. Types de comptes pris en charge : **"Comptes dans cet annuaire organisationnel uniquement"**
6. URI de redirection : `https://musiqueconnect-ac841.web.app`

### 4. Stripe (Optionnel)

1. Créez un compte sur [Stripe](https://stripe.com)
2. Allez dans **Développeurs** > **Clés API**
3. Copiez les clés de test (commençant par `pk_test_` et `sk_test_`)

## 🔧 Script de Vérification

Exécutez ce script pour vérifier votre configuration :

```bash
node scripts/get-firebase-config.cjs
```

## ✅ Test de la Configuration

Après avoir configuré `.env.local`, testez :

```bash
# Build de développement
npm run dev

# Build de production
npm run build

# Déploiement
npm run deploy
```

## 🚨 Problèmes Courants

### 1. API Key manquante
- **Erreur**: `Firebase: Error (auth/invalid-api-key)`
- **Solution**: Vérifiez que `VITE_FIREBASE_API_KEY` est correct dans `.env.local`

### 2. Domain non autorisé
- **Erreur**: `Firebase: Error (auth/unauthorized-domain)`
- **Solution**: Ajoutez votre domaine dans Firebase Console > Authentication > Settings > Authorized domains

### 3. OAuth non configuré
- **Erreur**: `Firebase: Error (auth/operation-not-allowed)`
- **Solution**: Activez Google/Microsoft dans Firebase Console > Authentication > Sign-in method

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez que toutes les variables d'environnement sont définies
2. Assurez-vous que les domaines sont autorisés dans Firebase
3. Vérifiez les logs dans la console du navigateur
4. Consultez la documentation Firebase officielle 