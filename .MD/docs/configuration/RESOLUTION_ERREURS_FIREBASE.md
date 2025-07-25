# 🚨 Résolution Rapide des Erreurs Firebase

## ❌ Erreurs Courantes et Solutions

### 1. "API key not valid. Please pass a valid API key."

**Cause** : L'API Key dans `.env.local` est un placeholder.

**Solution Rapide** :
1. Allez sur : https://console.firebase.google.com/project/musiqueconnect-ac841
2. Paramètres du projet > Général > Vos applications
3. Créez une application web si nécessaire
4. Copiez l'API Key réelle
5. Remplacez dans `.env.local` :
   ```bash
   VITE_FIREBASE_API_KEY=votre-vraie-api-key-ici
   ```

### 2. "Missing or insufficient permissions."

**Cause** : Règles Firestore trop restrictives ou authentification non configurée.

**Solution Rapide** :
1. Allez sur : https://console.firebase.google.com/project/musiqueconnect-ac841/firestore/rules
2. Remplacez les règles par :
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
3. Cliquez sur "Publier"

### 3. "Firebase: Error (auth/unauthorized-domain)"

**Cause** : Votre domaine n'est pas autorisé.

**Solution Rapide** :
1. Allez sur : https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/settings
2. Section "Authorized domains"
3. Ajoutez : `localhost`, `musiqueconnect-ac841.web.app`, `musiqueconnect-ac841.firebaseapp.com`

### 4. "Firebase: Error (auth/operation-not-allowed)"

**Cause** : Méthode d'authentification non activée.

**Solution Rapide** :
1. Allez sur : https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/providers
2. Activez "Google" et "Microsoft" si nécessaire

## 🔧 Scripts de Diagnostic

### Vérifier la Configuration
```bash
node scripts/test-firebase-config.cjs
```

### Recréer le fichier .env.local
```bash
node scripts/create-env-local.cjs
```

### Tester l'Application
```bash
npm run dev
```

## 📋 Checklist de Configuration

- [ ] Application web créée dans Firebase Console
- [ ] API Key réelle dans `.env.local`
- [ ] App ID réel dans `.env.local`
- [ ] Règles Firestore publiées
- [ ] Domaines autorisés dans Authentication
- [ ] Méthodes d'authentification activées

## 🚀 Mode Local Temporaire

Si Firebase n'est pas configuré, l'application fonctionne en mode local avec :
- Données en mémoire
- Pas d'authentification
- Fonctionnalités limitées

Pour activer Firebase complet, suivez le guide : `docs/configuration/RECUPERER_CONFIG_FIREBASE.md`

## 📞 Support

Si les erreurs persistent :
1. Vérifiez la console du navigateur pour plus de détails
2. Consultez les logs Firebase dans la console
3. Vérifiez que toutes les variables d'environnement sont correctes
4. Redémarrez le serveur de développement après les modifications 