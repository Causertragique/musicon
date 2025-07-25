# 🚀 Configuration Firebase Rapide - MusiqueConnect

## ⚡ Étapes Express (5 minutes)

### 1. Créer le projet Firebase
1. Allez sur https://console.firebase.google.com/
2. Cliquez "Créer un projet"
3. Nommez-le `musiqueconnect-app`
4. Activez Google Analytics (optionnel)
5. Cliquez "Créer le projet"

### 2. Activer Firestore Database
1. Menu gauche → "Firestore Database"
2. Cliquez "Créer une base de données"
3. Choisissez "Mode test" (pour commencer)
4. Sélectionnez "europe-west1" (Belgique)
5. Cliquez "Terminé"

### 3. Activer Authentication
1. Menu gauche → "Authentication"
2. Cliquez "Commencer"
3. Onglet "Sign-in method"
4. Activez "Google" et "Microsoft"
5. Sauvegardez

### 4. Obtenir la configuration
1. Menu gauche → ⚙️ (Paramètres) → "Paramètres du projet"
2. Onglet "Général" → "Vos applications"
3. Cliquez l'icône web (</>)
4. Nommez "MusiqueConnect Web"
5. **COPIEZ LA CONFIGURATION** (important !)

### 5. Créer le fichier .env.local
```bash
# À la racine du projet, créez le fichier .env.local
touch .env.local
```

### 6. Ajouter les variables d'environnement
Copiez ceci dans `.env.local` et remplacez par vos vraies valeurs :

```env
# Configuration Firebase (REMPLACEZ PAR VOS VRAIES VALEURS)
VITE_FIREBASE_API_KEY=votre-api-key-ici
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre-projet-id
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=votre-app-id

# Configuration Google OAuth (optionnel pour l'instant)
VITE_GOOGLE_CLIENT_ID=votre-google-client-id

# Configuration Microsoft OAuth (optionnel pour l'instant)
VITE_MICROSOFT_CLIENT_ID=votre-microsoft-client-id
```

### 7. Redémarrer le serveur
```bash
npm run dev
```

## ✅ Test de la Base de Données

1. Allez sur http://localhost:5176/
2. Connectez-vous avec un compte
3. Créez un groupe
4. Ajoutez un élève
5. **Les données doivent maintenant persister !**

## 🔧 Dépannage

### Erreur "Firebase not initialized"
- Vérifiez que `.env.local` existe
- Vérifiez que les variables sont correctes
- Redémarrez le serveur

### Erreur "Permission denied"
- Vérifiez que Firestore est en "Mode test"
- Ou configurez les règles de sécurité

### Erreur "Project not found"
- Vérifiez le `VITE_FIREBASE_PROJECT_ID`
- Assurez-vous que le projet Firebase existe

## 🎯 Résultat Attendu

Après cette configuration :
- ✅ Les groupes restent enregistrés
- ✅ Les élèves restent enregistrés
- ✅ Les données persistent entre les sessions
- ✅ Plus de perte de données lors du changement de port

## 📞 Support

Si vous avez des problèmes :
1. Vérifiez la console du navigateur (F12)
2. Vérifiez les logs du serveur
3. Assurez-vous que Firebase est bien configuré

---

**🎵 MusiqueConnect est maintenant prêt avec une vraie base de données ! 🚀** 