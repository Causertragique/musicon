#!/usr/bin/env node

/**
 * Script de configuration rapide pour la production
 * Usage: node scripts/setup-production.cjs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('⚡ Configuration Rapide Production - MusiqueConnect');
console.log('==================================================\n');

// Fonction pour afficher les étapes
const showSteps = () => {
  console.log('📋 Étapes pour déployer MusiqueConnect :');
  console.log('========================================\n');
  
  console.log('🔧 ÉTAPE 1 : Configuration Firebase (OBLIGATOIRE)');
  console.log('--------------------------------------------------');
  console.log('1. Allez sur : https://console.firebase.google.com/project/musiqueconnect-ac841');
  console.log('2. Paramètres du projet > Général > Vos applications');
  console.log('3. Créez une application web si nécessaire');
  console.log('4. Copiez l\'API Key et l\'App ID');
  console.log('5. Mettez à jour le fichier .env.local');
  console.log('');
  
  console.log('🔐 ÉTAPE 2 : Configuration des Permissions');
  console.log('-------------------------------------------');
  console.log('1. Règles Firestore : https://console.firebase.google.com/project/musiqueconnect-ac841/firestore/rules');
  console.log('2. Domaines autorisés : https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/settings');
  console.log('3. Méthodes d\'authentification : https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/providers');
  console.log('');
  
  console.log('🚀 ÉTAPE 3 : Déploiement');
  console.log('-------------------------');
  console.log('1. Vérifiez la configuration : node scripts/test-firebase-config.cjs');
  console.log('2. Déployez : node scripts/deploy-production.cjs');
  console.log('');
  
  console.log('🌐 ÉTAPE 4 : Accès à l\'Application');
  console.log('-----------------------------------');
  console.log('URLs de votre application :');
  console.log('- https://musiqueconnect-ac841.web.app');
  console.log('- https://musiqueconnect-ac841.firebaseapp.com');
  console.log('');
};

// Fonction pour vérifier l'état actuel
const checkCurrentStatus = () => {
  console.log('🔍 Vérification de l\'état actuel :');
  console.log('===================================\n');
  
  // Vérifier Firebase CLI
  try {
    const firebaseVersion = execSync('firebase --version', { encoding: 'utf8' });
    console.log(`✅ Firebase CLI installé : ${firebaseVersion.trim()}`);
  } catch (error) {
    console.log('❌ Firebase CLI non installé');
    console.log('   Installez-le avec : npm install -g firebase-tools');
  }
  
  // Vérifier la connexion Firebase
  try {
    const firebaseProjects = execSync('firebase projects:list', { encoding: 'utf8' });
    if (firebaseProjects.includes('musiqueconnect-ac841')) {
      console.log('✅ Connecté à Firebase');
    } else {
      console.log('❌ Non connecté à Firebase');
      console.log('   Connectez-vous avec : firebase login');
    }
  } catch (error) {
    console.log('❌ Erreur de connexion Firebase');
    console.log('   Connectez-vous avec : firebase login');
  }
  
  // Vérifier le fichier .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasApiKey = envContent.includes('VITE_FIREBASE_API_KEY=');
    const hasAppId = envContent.includes('VITE_FIREBASE_APP_ID=');
    
    if (hasApiKey && hasAppId) {
      console.log('✅ Fichier .env.local trouvé');
    } else {
      console.log('❌ Fichier .env.local incomplet');
    }
  } else {
    console.log('❌ Fichier .env.local manquant');
    console.log('   Créez-le avec : node scripts/create-env-local.cjs');
  }
  
  console.log('');
};

// Fonction pour afficher les URLs importantes
const showImportantUrls = () => {
  console.log('🔗 URLs Importantes :');
  console.log('=====================\n');
  
  const urls = [
    { name: 'Console Firebase', url: 'https://console.firebase.google.com/project/musiqueconnect-ac841' },
    { name: 'Hosting', url: 'https://console.firebase.google.com/project/musiqueconnect-ac841/hosting' },
    { name: 'Authentication', url: 'https://console.firebase.google.com/project/musiqueconnect-ac841/authentication' },
    { name: 'Firestore', url: 'https://console.firebase.google.com/project/musiqueconnect-ac841/firestore' },
    { name: 'Storage', url: 'https://console.firebase.google.com/project/musiqueconnect-ac841/storage' },
    { name: 'Analytics', url: 'https://console.firebase.google.com/project/musiqueconnect-ac841/analytics' },
  ];
  
  urls.forEach(({ name, url }) => {
    console.log(`${name.padEnd(15)} : ${url}`);
  });
  
  console.log('');
};

// Fonction pour afficher les commandes utiles
const showUsefulCommands = () => {
  console.log('💻 Commandes Utiles :');
  console.log('=====================\n');
  
  const commands = [
    { cmd: 'node scripts/test-firebase-config.cjs', desc: 'Vérifier la configuration Firebase' },
    { cmd: 'node scripts/create-env-local.cjs', desc: 'Créer le fichier .env.local' },
    { cmd: 'node scripts/deploy-production.cjs', desc: 'Déployer en production' },
    { cmd: 'npm run dev', desc: 'Lancer en mode développement' },
    { cmd: 'npm run build', desc: 'Construire pour la production' },
    { cmd: 'firebase deploy --only hosting', desc: 'Déployer uniquement le hosting' },
    { cmd: 'firebase login', desc: 'Se connecter à Firebase' },
    { cmd: 'firebase logout', desc: 'Se déconnecter de Firebase' },
  ];
  
  commands.forEach(({ cmd, desc }) => {
    console.log(`${cmd.padEnd(40)} : ${desc}`);
  });
  
  console.log('');
};

// Fonction principale
const main = () => {
  showSteps();
  checkCurrentStatus();
  showImportantUrls();
  showUsefulCommands();
  
  console.log('🎯 Prochaines Actions :');
  console.log('=======================\n');
  console.log('1. Configurez Firebase dans la console web');
  console.log('2. Mettez à jour le fichier .env.local');
  console.log('3. Testez la configuration : node scripts/test-firebase-config.cjs');
  console.log('4. Déployez : node scripts/deploy-production.cjs');
  console.log('');
  console.log('📖 Pour plus de détails, consultez :');
  console.log('   docs/deployment/DEPLOIEMENT_PRODUCTION.md');
  console.log('');
  console.log('🚀 Votre application sera alors accessible à tout le monde !');
};

// Exécuter le script
main(); 