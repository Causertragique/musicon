#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Préparation du déploiement Vercel...\n');

// Vérifier la configuration Firebase
console.log('1️⃣ Vérification de la configuration Firebase...');
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ Fichier .env.local non trouvé !');
  console.log('💡 Exécutez d\'abord : npm run setup-firebase');
  process.exit(1);
}

// Lire les variables d'environnement
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

console.log('✅ Configuration Firebase trouvée');

// Vérifier le build
console.log('\n2️⃣ Test du build de production...');
const { execSync } = require('child_process');

try {
  console.log('🔨 Construction de l\'application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build réussi !');
} catch (error) {
  console.log('❌ Erreur lors du build !');
  console.log('💡 Vérifiez les erreurs ci-dessus');
  process.exit(1);
}

// Vérifier les fichiers de build
console.log('\n3️⃣ Vérification des fichiers de build...');
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  console.log(`✅ Dossier dist créé avec ${files.length} fichiers`);
  
  // Vérifier les fichiers essentiels
  const essentialFiles = ['index.html', 'assets'];
  essentialFiles.forEach(file => {
    if (fs.existsSync(path.join(distPath, file))) {
      console.log(`✅ ${file} : Présent`);
    } else {
      console.log(`❌ ${file} : Manquant`);
    }
  });
} else {
  console.log('❌ Dossier dist non trouvé !');
  process.exit(1);
}

// Créer le fichier vercel.json s'il n'existe pas
console.log('\n4️⃣ Configuration Vercel...');
const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
if (!fs.existsSync(vercelConfigPath)) {
  const vercelConfig = {
    "buildCommand": "npm run build",
    "outputDirectory": "dist",
    "framework": "vite",
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  };
  
  fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));
  console.log('✅ Fichier vercel.json créé');
} else {
  console.log('✅ Fichier vercel.json déjà présent');
}

// Créer un guide de déploiement
console.log('\n5️⃣ Création du guide de déploiement...');
const deploymentGuide = `# 🚀 Guide de Déploiement Vercel

## 📋 Variables d'environnement à configurer

Dans votre projet Vercel, ajoutez ces variables d'environnement :

\`\`\`env
VITE_FIREBASE_API_KEY=${envVars.VITE_FIREBASE_API_KEY || 'VOTRE_API_KEY'}
VITE_FIREBASE_AUTH_DOMAIN=${envVars.VITE_FIREBASE_AUTH_DOMAIN || 'VOTRE_AUTH_DOMAIN'}
VITE_FIREBASE_PROJECT_ID=${envVars.VITE_FIREBASE_PROJECT_ID || 'VOTRE_PROJECT_ID'}
VITE_FIREBASE_STORAGE_BUCKET=${envVars.VITE_FIREBASE_STORAGE_BUCKET || 'VOTRE_STORAGE_BUCKET'}
VITE_FIREBASE_MESSAGING_SENDER_ID=${envVars.VITE_FIREBASE_MESSAGING_SENDER_ID || 'VOTRE_SENDER_ID'}
VITE_FIREBASE_APP_ID=${envVars.VITE_FIREBASE_APP_ID || 'VOTRE_APP_ID'}
\`\`\`

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
2. Testez localement avec \`npm run build\`
3. Vérifiez la configuration Firebase

---
*Généré automatiquement le ${new Date().toLocaleDateString('fr-FR')}*
`;

fs.writeFileSync(path.join(process.cwd(), 'DEPLOYMENT_GUIDE.md'), deploymentGuide);
console.log('✅ Guide de déploiement créé (DEPLOYMENT_GUIDE.md)');

// Résultat final
console.log('\n' + '='.repeat(60));
console.log('🎉 Préparation du déploiement terminée !');
console.log('\n📋 Prochaines étapes :');
console.log('1. Poussez votre code sur GitHub');
console.log('2. Connectez votre repo à Vercel');
console.log('3. Configurez les variables d\'environnement');
console.log('4. Déployez !');
console.log('\n📖 Consultez DEPLOYMENT_GUIDE.md pour les détails');
console.log('='.repeat(60)); 