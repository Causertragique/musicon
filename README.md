# 🎵 Application Teacher-Student - Gestion de Cours de Musique

Une application React/TypeScript moderne pour la gestion des cours de musique entre professeurs et élèves, avec authentification Firebase et déploiement Vercel.

## 🚀 Démarrage Rapide

### Option 1 : Script Automatique (Recommandé)
```bash
npm run quick-start
```
Ce script vous guidera à travers tout le processus : configuration Firebase, tests, et préparation du déploiement.

### Option 2 : Configuration Manuelle

#### 1. Installation des dépendances
```bash
npm install
```

#### 2. Configuration Firebase
```bash
npm run setup-firebase
```
Suivez les instructions pour configurer votre projet Firebase.

#### 3. Test de la configuration
```bash
npm run test-firebase
```

#### 4. Lancement en développement
```bash
npm run dev
```

#### 5. Préparation du déploiement
```bash
npm run prepare-deployment
```

## 🔥 Configuration Firebase

### Étapes Détaillées
Consultez le fichier `FIREBASE_SETUP_STEPS.md` pour un guide complet.

### Services Requis
- **Firestore Database** : Base de données NoSQL
- **Authentication** : Connexion Google/Microsoft
- **Hosting** (optionnel) : Hébergement Firebase

### Variables d'Environnement
Le script de configuration crée automatiquement le fichier `.env.local` avec :
```env
VITE_FIREBASE_API_KEY=votre-api-key
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre-projet-id
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=votre-app-id
```

## 🧪 Tests

### Test de la Configuration Firebase
```bash
npm run test-firebase
```

### Tests Unitaires
```bash
npm test
npm run test:watch
npm run test:coverage
```

### Build de Production
```bash
npm run build
npm run preview
```

## 🚀 Déploiement Vercel

### Préparation Automatique
```bash
npm run prepare-deployment
```

### Étapes Manuelles
1. **Poussez votre code sur GitHub**
2. **Connectez votre repo à Vercel** : https://vercel.com
3. **Configurez les variables d'environnement** dans Vercel
4. **Déployez !**

### Configuration Vercel
Le script crée automatiquement le fichier `vercel.json` avec la configuration optimale pour Vite.

## 📱 Fonctionnalités

### 👨‍🏫 Dashboard Professeur
- **Gestion des groupes** : Création et organisation des groupes d'élèves
- **Gestion des élèves** : Profils détaillés, progression, notes
- **Devoirs et pratiques** : Création, suivi, évaluation
- **Chat et communication** : Messages directs et de groupe
- **Annonces** : Publications importantes pour les groupes
- **Notes de cours** : Organisation des supports pédagogiques
- **Finances** : Suivi des paiements et crédits
- **Calendrier** : Vue d'ensemble des échéances

### 👨‍🎓 Dashboard Élève
- **Profil personnel** : Informations et progression
- **Devoirs** : Consultation et soumission
- **Chat** : Communication avec le professeur
- **Finances** : Suivi des paiements

### 🔐 Authentification
- **Google OAuth** : Connexion rapide et sécurisée
- **Microsoft OAuth** : Intégration avec les comptes Microsoft
- **Gestion des rôles** : Professeur/Élève automatique

## 🛠️ Architecture Technique

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build et le développement
- **Tailwind CSS** pour le styling
- **Lucide React** pour les icônes
- **React Router** pour la navigation

### Backend
- **Firebase Firestore** : Base de données NoSQL
- **Firebase Authentication** : Gestion des utilisateurs
- **Firebase Hosting** (optionnel) : Hébergement

### Structure du Projet
```
src/
├── components/          # Composants React
├── contexts/           # Contextes React (Auth, Data)
├── services/           # Services Firebase
├── types/              # Types TypeScript
├── utils/              # Utilitaires
└── App.tsx            # Composant principal
```

## 📊 Données

### Collections Firestore
- `users` : Profils utilisateurs (professeurs/élèves)
- `groups` : Groupes de cours
- `homework` : Devoirs et pratiques
- `messages` : Messages du chat
- `announcements` : Annonces
- `assignments` : Devoirs structurés
- `courseNotes` : Notes de cours
- `purchases` : Transactions financières

### Initialisation des Données
L'application propose d'initialiser automatiquement des données de démonstration lors de la première utilisation.

## 🔧 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm run quick-start` | Démarrage rapide guidé |
| `npm run setup-firebase` | Configuration Firebase |
| `npm run test-firebase` | Test de la configuration |
| `npm run prepare-deployment` | Préparation Vercel |
| `npm run dev` | Développement local |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualisation build |
| `npm test` | Tests unitaires |

## 🐛 Dépannage

### Problèmes Courants

#### Configuration Firebase
```bash
# Vérifier la configuration
npm run test-firebase

# Reconfigurer si nécessaire
npm run setup-firebase
```

#### Build Échoué
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Reconstruire
npm run build
```

#### Problèmes de Déploiement
1. Vérifiez les variables d'environnement dans Vercel
2. Consultez les logs de build
3. Testez localement avec `npm run build`

## 📚 Documentation

- **Configuration Firebase** : `FIREBASE_SETUP_STEPS.md`
- **Déploiement Vercel** : `VERCEL_DEPLOYMENT.md`
- **Guide de déploiement** : `DEPLOYMENT_GUIDE.md` (généré automatiquement)

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
1. Consultez la documentation
2. Vérifiez les guides de configuration
3. Testez avec les scripts fournis
4. Ouvrez une issue sur GitHub

---

<<<<<<< HEAD
**🎵 Développé avec passion pour les professeurs de musique !** 
=======
**🎵 Développé avec passion pour les professeurs de musique !** 
=======
# Appgestionmus
Application de gestion pour enseignant avec Firebase
>>>>>>> 6ed0b2ed728769bbaddef0c9253500641f859f0a
>>>>>>> d366cc0df25101893658782957fb65b9d95579c4
# Fri Jun 20 00:50:36 EDT 2025
# Test Cloud Build - Thu Jun 26 21:26:04 EDT 2025
