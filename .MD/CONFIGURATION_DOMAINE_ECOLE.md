# 🏫 Configuration Google Classroom pour Domaine d'École

## 📋 Prérequis
- Compte Google Workspace (anciennement G Suite) pour votre école
- Accès administrateur à la console Google Cloud
- Projet Firebase configuré

## 🔧 Étape 1 : Configurer Firebase OAuth

### 1.1 Ajouter votre domaine dans Firebase
1. **Console Firebase** → https://console.firebase.google.com/
2. **Sélectionnez votre projet**
3. **Authentication** → **Sign-in method** → **Google**
4. **Cliquez sur "Modifier"**
5. **Ajoutez votre domaine d'école** dans "Domaines autorisés"
   - Exemple : `votre-ecole.ca`
6. **Sauvegardez**

### 1.2 Configurer les domaines autorisés
1. **Authentication** → **Settings** → **Authorized domains**
2. **Ajoutez votre domaine** : `votre-ecole.ca`
3. **Sauvegardez**

## 🌐 Étape 2 : Configurer Google Cloud Console

### 2.1 Accéder à Google Cloud Console
1. **Google Cloud Console** → https://console.cloud.google.com/
2. **Sélectionnez votre projet Firebase** (même projet ID)

### 2.2 Configurer l'écran de consentement OAuth
1. **APIs & Services** → **OAuth consent screen**
2. **User Type** : Sélectionnez **"External"** ou **"Internal"** selon votre configuration
3. **App name** : `MusiqueConnect`
4. **User support email** : Votre email d'école
5. **Developer contact information** : Votre email
6. **Authorized domains** : Ajoutez votre domaine d'école
7. **Sauvegardez et continuez**

### 2.3 Configurer les scopes OAuth
1. **Scopes** → **Add or remove scopes**
2. **Ajoutez ces scopes** :
   - `https://www.googleapis.com/auth/classroom.courses.readonly`
   - `https://www.googleapis.com/auth/classroom.rosters.readonly`
   - `https://www.googleapis.com/auth/classroom.coursework.me`
   - `https://www.googleapis.com/auth/classroom.profile.emails`
   - `https://www.googleapis.com/auth/classroom.profile.photos`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
3. **Sauvegardez et continuez**

### 2.4 Ajouter des utilisateurs de test (si externe)
1. **Test users** → **Add users**
2. **Ajoutez votre email d'école** : `votre-email@votre-ecole.ca`
3. **Sauvegardez et continuez**

## 🔌 Étape 3 : Activer l'API Google Classroom

### 3.1 Activer l'API
1. **APIs & Services** → **Library**
2. **Recherchez** : "Google Classroom API"
3. **Cliquez sur l'API**
4. **Cliquez sur "Enable"**

### 3.2 Vérifier les APIs activées
Vous devriez avoir ces APIs activées :
- ✅ Google Classroom API
- ✅ Google Drive API (si nécessaire)
- ✅ Gmail API (si nécessaire)

## 🔑 Étape 4 : Configurer les identifiants OAuth

### 4.1 Créer des identifiants OAuth
1. **APIs & Services** → **Credentials**
2. **Create Credentials** → **OAuth 2.0 Client IDs**
3. **Application type** : **Web application**
4. **Name** : `MusiqueConnect Web Client`
5. **Authorized JavaScript origins** :
   - `http://localhost:5174`
   - `http://localhost:3000`
   - `https://votre-app.vercel.app` (si déployé)
6. **Authorized redirect URIs** :
   - `http://localhost:5174`
   - `http://localhost:5174/auth/callback`
   - `https://votre-app.vercel.app/auth/callback` (si déployé)
7. **Cliquez sur "Create"**

### 4.2 Noter les identifiants
- **Client ID** : `123456789-abcdef...`
- **Client Secret** : `GOCSPX-...`

## ⚙️ Étape 5 : Configurer l'application

### 5.1 Mettre à jour la configuration Firebase
1. **Console Firebase** → **Project Settings**
2. **Vérifiez que votre domaine est dans "Authorized domains"**
3. **Copiez la configuration** si nécessaire

### 5.2 Vérifier le fichier .env.local
Assurez-vous que votre fichier `.env.local` contient :
```env
VITE_FIREBASE_API_KEY=votre-api-key
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre-projet-id
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=votre-app-id
```

## 🧪 Étape 6 : Tester la configuration

### 6.1 Tester la connexion
1. **Lancez l'application** : `npm run dev`
2. **Allez sur** : http://localhost:5174
3. **Cliquez sur "Se connecter avec Google"**
4. **Utilisez votre email d'école** : `votre-email@votre-ecole.ca`
5. **Autorisez les permissions** Google Classroom

### 6.2 Tester l'import des groupes
1. **Allez dans "Groupes"**
2. **Cliquez sur "Importer depuis Google Classroom"**
3. **Vérifiez que vos groupes s'affichent**

## 🔍 Étape 7 : Dépannage

### Problème : "Vous devez vous connecter avec votre compte Google"
**Solutions :**
1. Vérifiez que votre domaine est dans "Authorized domains" Firebase
2. Vérifiez que votre email est dans "Test users" (si externe)
3. Vérifiez que l'API Google Classroom est activée
4. Vérifiez que les scopes OAuth sont configurés

### Problème : "Erreur 403 - Access Denied"
**Solutions :**
1. Vérifiez que vous avez les permissions Google Classroom
2. Vérifiez que l'API est activée
3. Vérifiez que les identifiants OAuth sont corrects

### Problème : "No courses found"
**Solutions :**
1. Vérifiez que vous avez des cours dans Google Classroom
2. Vérifiez que vous êtes enseignant dans ces cours
3. Vérifiez que les scopes sont corrects

## 📞 Support

Si vous rencontrez des problèmes :
1. **Vérifiez les logs** dans la console du navigateur
2. **Vérifiez les logs** Firebase dans la console
3. **Contactez l'administrateur** de votre Google Workspace

## ✅ Checklist de vérification

- [ ] Domaine ajouté dans Firebase OAuth
- [ ] Domaine ajouté dans Google Cloud OAuth consent screen
- [ ] API Google Classroom activée
- [ ] Scopes OAuth configurés
- [ ] Identifiants OAuth créés
- [ ] Test de connexion réussi
- [ ] Import des groupes fonctionnel

---

**🎯 Une fois configuré, vous pourrez :**
- Vous connecter avec votre email d'école
- Importer vos groupes Google Classroom
- Voir vos élèves dans le tableau moderne
- Synchroniser les données automatiquement 