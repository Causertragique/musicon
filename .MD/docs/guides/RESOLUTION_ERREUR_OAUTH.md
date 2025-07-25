# 🔧 Résolution Erreur OAuth Google - MusiqueConnect

**Erreur** : `403 : access_denied` avec Google OAuth

## 🚨 Diagnostic

### Problème Identifié
- **Client ID** : `129499994666-knvcmkttbq6ei07ojafcq841ksnqa6gc.apps.googleusercontent.com`
- **Erreur** : Application non autorisée
- **Cause** : Configuration OAuth incomplète

## ✅ Solutions

### Solution 1 : Configurer Google Cloud Console

1. **Va sur** : https://console.cloud.google.com/apis/credentials?project=musiqueconnect-ac841

2. **Trouve ton client OAuth** :
   - Client ID : `129499994666-knvcmkttbq6ei07ojafcq841ksnqa6gc.apps.googleusercontent.com`

3. **Ajoute les URI de redirection autorisés** :
   ```
   http://localhost:5175
   http://localhost:5175/auth/google/callback
   https://musiqueconnect-ac841.web.app
   https://musiqueconnect-ac841.web.app/auth/google/callback
   ```

4. **Ajoute les origines JavaScript autorisées** :
   ```
   http://localhost:5175
   https://musiqueconnect-ac841.web.app
   ```

### Solution 2 : Créer un Nouveau Client OAuth

1. **Dans Google Cloud Console** :
   - Clique sur "Créer des identifiants"
   - Sélectionne "ID client OAuth 2.0"

2. **Configuration** :
   - **Type d'application** : Application Web
   - **Nom** : MusiqueConnect Web App
   - **URI de redirection** : Voir Solution 1

3. **Remplacer le Client ID** dans ton code

### Solution 3 : Désactiver Temporairement OAuth

Si tu veux juste tester l'application sans OAuth :

1. **Modifie** `src/components/LoginPage.tsx`
2. **Commente** le bouton Google
3. **Utilise** seulement la connexion email/mot de passe

## 🔧 Configuration Fichier .env.local

Crée un fichier `.env.local` dans la racine du projet :

```env
# Configuration Firebase
VITE_FIREBASE_API_KEY=AIzaSyBqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX
VITE_FIREBASE_AUTH_DOMAIN=musiqueconnect-ac841.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=musiqueconnect-ac841
VITE_FIREBASE_STORAGE_BUCKET=musiqueconnect-ac841.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=844946743727
VITE_FIREBASE_APP_ID=1:844946743727:web:qXqXqXqXqXqXqXqXqXqXq

# Configuration Google OAuth
VITE_GOOGLE_CLIENT_ID=129499994666-knvcmkttbq6ei07ojafcq841ksnqa6gc.apps.googleusercontent.com
```

## 🚀 Test de la Configuration

Après configuration :

1. **Redémarre** le serveur de développement :
   ```bash
   npm run dev
   ```

2. **Teste** la connexion Google

3. **Vérifie** les logs dans la console du navigateur

## ✅ Résultat Attendu

- ✅ **Connexion Google** fonctionne
- ✅ **Pas d'erreur 403**
- ✅ **Redirection** correcte

## 🎯 Recommandation

**Commence par la Solution 1** (configurer les URI de redirection) - c'est souvent suffisant !

---

**🎵 MusiqueConnect - OAuth Google Configuré !** 