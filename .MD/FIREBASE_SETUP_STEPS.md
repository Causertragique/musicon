# 🔥 Configuration Firebase - Étapes Détaillées

## 📋 Étape 1 : Créer le projet Firebase

### 1.1 Aller sur Firebase Console
- La console Firebase devrait être ouverte dans votre navigateur
- Si non, allez sur : https://console.firebase.google.com/

### 1.2 Créer un nouveau projet
1. Cliquez sur **"Créer un projet"**
2. Nom du projet : `teacher-student-app` (ou votre nom préféré)
3. Activer Google Analytics : ✅ **Oui** (recommandé)
4. Cliquez sur **"Continuer"**
5. Cliquez sur **"Créer le projet"**

### 1.3 Attendre la création
- Le projet se crée (30-60 secondes)
- Cliquez sur **"Continuer"** quand c'est prêt

## 🗄️ Étape 2 : Configurer Firestore Database

### 2.1 Activer Firestore
1. Dans le menu de gauche, cliquez sur **"Firestore Database"**
2. Cliquez sur **"Créer une base de données"**
3. Choisir le mode : **"Mode test"** (pour commencer)
4. Cliquez sur **"Suivant"**
5. Choisir une région : **"europe-west1 (Belgique)"** (ou plus proche de vous)
6. Cliquez sur **"Terminé"**

### 2.2 Configurer les règles de sécurité
1. Dans Firestore Database, cliquez sur l'onglet **"Règles"**
2. Remplacez le contenu par :

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

3. Cliquez sur **"Publier"**

## 🔐 Étape 3 : Configurer Authentication

### 3.1 Activer l'authentification
1. Dans le menu de gauche, cliquez sur **"Authentication"**
2. Cliquez sur **"Commencer"**

### 3.2 Configurer Google
1. Cliquez sur **"Google"** dans la liste des fournisseurs
2. Activez Google en cliquant sur le bouton toggle
3. Email de support : votre email
4. Cliquez sur **"Enregistrer"**

### 3.3 Configurer Microsoft (optionnel)
1. Cliquez sur **"Microsoft"** dans la liste des fournisseurs
2. Activez Microsoft en cliquant sur le bouton toggle
3. Cliquez sur **"Enregistrer"**

## ⚙️ Étape 4 : Obtenir la configuration

### 4.1 Accéder aux paramètres
1. Dans le menu de gauche, cliquez sur l'icône ⚙️ (Paramètres du projet)
2. Cliquez sur **"Paramètres du projet"**

### 4.2 Ajouter une application web - GUIDE DÉTAILLÉ

**🎯 Où trouver "Vos applications" :**
1. Dans les paramètres du projet, vous êtes dans l'onglet **"Général"**
2. **Faites défiler vers le bas** jusqu'à la section **"Vos applications"**
3. Cette section se trouve **tout en bas** de la page, après les autres paramètres

**🔍 Si vous ne voyez pas "Vos applications" :**
- Assurez-vous d'être dans l'onglet **"Général"** (pas "Utilisateurs et autorisations")
- Faites défiler **jusqu'en bas** de la page
- La section peut être masquée, cherchez un bouton "Afficher plus" ou "Expand"

**📱 Ajouter l'application web :**
1. Dans la section **"Vos applications"**, cliquez sur l'icône **web** (</>) 
   - C'est la première icône, avec des balises HTML
   - Elle ressemble à ceci : `</>`
2. Une fenêtre popup s'ouvre
3. Dans le champ **"Surnom de l'app"**, tapez : `Teacher Student App`
4. **DÉCOCHEZ** la case "Configurer Firebase Hosting" (nous n'en avons pas besoin)
5. Cliquez sur **"Enregistrer l'app"**

**❌ Problèmes courants et solutions :**

**Problème : "Vos applications" n'apparaît pas**
- Solution : Vous êtes peut-être dans le mauvais onglet
- Vérifiez que vous êtes dans **"Paramètres du projet"** → **"Général"**
- Pas dans "Utilisateurs et autorisations"

**Problème : L'icône web n'est pas cliquable**
- Solution : Attendez que la page se charge complètement
- Rafraîchissez la page (F5)
- Essayez un autre navigateur

**Problème : Erreur lors de l'ajout de l'app**
- Solution : Vérifiez que vous avez les permissions d'administrateur
- Essayez de vous déconnecter/reconnecter à Firebase

### 4.3 Copier la configuration
Après avoir ajouté l'application web, vous verrez une configuration comme celle-ci :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "teacher-student-app.firebaseapp.com",
  projectId: "teacher-student-app",
  storageBucket: "teacher-student-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

**⚠️ IMPORTANT : Notez ces valeurs, vous en aurez besoin pour la prochaine étape !**

**💡 Conseil :** Copiez cette configuration dans un fichier temporaire ou prenez une capture d'écran.

## 🔧 Étape 5 : Configurer l'application

### 5.1 Lancer le script de configuration
Dans votre terminal, exécutez :
```bash
npm run setup-firebase
```

### 5.2 Saisir les informations
Le script vous demandera de saisir :
- **API Key** : `AIzaSyC...` (depuis la configuration)
- **Auth Domain** : `teacher-student-app.firebaseapp.com`
- **Project ID** : `teacher-student-app`
- **Storage Bucket** : `teacher-student-app.appspot.com`
- **Messaging Sender ID** : `123456789`
- **App ID** : `1:123456789:web:abc123`

### 5.3 Vérifier la configuration
Le script créera automatiquement le fichier `.env.local` avec vos clés.

## ✅ Étape 6 : Vérifier la configuration

### 6.1 Vérifier le fichier .env.local
Le fichier devrait contenir :
```env
VITE_FIREBASE_API_KEY=votre-api-key
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre-projet-id
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=votre-app-id
```

### 6.2 Tester la connexion
Lancez l'application :
```bash
npm run dev
```

L'application devrait se connecter à Firebase et vous proposer d'initialiser les données.

## 🎯 Prochaines étapes

Une fois Firebase configuré :
1. **Tester l'application** localement
2. **Initialiser les données** de démonstration
3. **Préparer le déploiement** sur Vercel

---

**💡 Conseil : Gardez cette page ouverte pendant la configuration pour suivre les étapes !** 