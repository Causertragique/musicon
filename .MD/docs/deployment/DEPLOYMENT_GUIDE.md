# 🚀 Guide de Déploiement Vercel

## 📋 Variables d'environnement à configurer

Dans votre projet Vercel, ajoutez ces variables d'environnement :

```env
VITE_FIREBASE_API_KEY=AIzaSyBK8mPYyVcDmteWOXL3dlzON0_HfYHbxhI
VITE_FIREBASE_AUTH_DOMAIN=musiqueconnect-ac841.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=musiqueconnect-ac841
VITE_FIREBASE_STORAGE_BUCKET=musiqueconnect-ac841.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=844946743727
VITE_FIREBASE_APP_ID=1:844946743727:web:bab44c41d0923021440f5a
```

## 🔗 Étapes de déploiement

1. **Connecter votre repository GitHub**
   - Allez sur https://vercel.com
   - Connectez votre compte GitHub
   - Importez votre repository

2. **Configurer les variables d'environnement**
   - Dans les paramètres du projet Vercel
   - Onglet "Environment Variables"
   - Ajoutez toutes les variables ci-dessus

3. **Déployer**
   - Vercel détectera automatiquement Vite
   - Le déploiement se lancera automatiquement

4. **Vérifier le déploiement**
   - Testez l'authentification
   - Vérifiez la connexion Firebase
   - Testez les fonctionnalités principales

## 🔧 Configuration Firebase pour la production

1. **Autoriser votre domaine Vercel**
   - Dans Firebase Console > Authentication
   - Ajoutez votre domaine Vercel (ex: your-app.vercel.app)
   - Dans "Authorized domains"

2. **Règles Firestore pour la production**
   - Vérifiez que les règles sont appropriées
   - Testez les permissions

## 📞 Support

En cas de problème :
1. Vérifiez les logs de build dans Vercel
2. Testez localement avec `npm run build`
3. Vérifiez la configuration Firebase

---
*Généré automatiquement le 19/06/2025*
