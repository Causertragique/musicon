# 🚀 Déploiement Google Cloud Run - MusiqueConnect

## ✅ Configuration Prête

Votre application est maintenant configurée pour Google Cloud Run avec :
- ✅ Serveur Express sur le port 8080
- ✅ Dockerfile configuré
- ✅ Build de production fonctionnel

## 🔧 Étapes de Déploiement

### 1. **Activer les APIs Google Cloud**

```bash
# Activer Cloud Run API
gcloud services enable run.googleapis.com

# Activer Container Registry API
gcloud services enable containerregistry.googleapis.com
```

### 2. **Configurer le projet**

```bash
# Définir votre projet
gcloud config set project VOTRE_PROJECT_ID

# Activer Docker pour gcloud
gcloud auth configure-docker
```

### 3. **Construire et déployer**

```bash
# Construire l'image Docker
docker build -t gcr.io/musiqueconnect-ac841/musiqueconnect .

# Pousser l'image vers Google Container Registry
docker push gcr.io/musiqueconnect-ac841/musiqueconnect

# Déployer sur Cloud Run
gcloud run deploy musiqueconnect \
  --image gcr.io/musiqueconnect-ac841/musiqueconnect \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

### 4. **Variables d'environnement (optionnel)**

Si vous avez des variables d'environnement :

```bash
gcloud run deploy musiqueconnect \
  --image gcr.io/musiqueconnect-ac841/musiqueconnect \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "VITE_FIREBASE_API_KEY=votre_clé,VITE_FIREBASE_PROJECT_ID=votre_projet"
```

## 🔍 Vérification

1. **URL de déploiement** : Vous recevrez une URL comme :
   ```
   https://musiqueconnect-xxxxx-uc.a.run.app
   ```

2. **Test de l'application** :
   - Ouvrez l'URL dans votre navigateur
   - Vérifiez que l'application se charge correctement
   - Testez la connexion et les fonctionnalités

## 🛠️ Dépannage

### Erreur "Container failed to start"
- ✅ **Résolu** : Le serveur écoute maintenant sur le port 8080
- ✅ **Résolu** : Express est configuré pour servir l'application

### Erreur "Port not listening"
- ✅ **Résolu** : Le Dockerfile expose le port 8080
- ✅ **Résolu** : Le serveur démarre sur le bon port

## 📝 Commandes Utiles

```bash
# Voir les logs
gcloud logs read --service=musiqueconnect --limit=50

# Mettre à jour le déploiement
gcloud run deploy musiqueconnect --image gcr.io/musiqueconnect-ac841/musiqueconnect

# Supprimer le service
gcloud run services delete musiqueconnect
```

## 🌐 Configuration des Domaines

Après déploiement, vous pouvez :
1. Configurer un domaine personnalisé
2. Mettre en place HTTPS automatique
3. Configurer un CDN pour de meilleures performances

## 🔐 Sécurité

- L'application est déployée avec `--allow-unauthenticated`
- Pour restreindre l'accès, retirez cette option
- Configurez l'authentification IAM si nécessaire 