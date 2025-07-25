#!/usr/bin/env node

/**
 * Script de déploiement automatique pour la production
 * Usage: node scripts/deploy-production.cjs
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Déploiement Production - MusiqueConnect');
console.log('==========================================\n');

// Fonction pour exécuter une commande avec gestion d'erreur
const runCommand = (command, description) => {
  console.log(`📋 ${description}...`);
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} - Succès`);
    return result;
  } catch (error) {
    console.error(`❌ ${description} - Erreur:`);
    console.error(error.message);
    throw error;
  }
};

// Fonction pour vérifier la configuration Firebase
const checkFirebaseConfig = () => {
  console.log('🔧 Vérification de la configuration Firebase...');
  
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error('Fichier .env.local non trouvé !');
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#][^=]+)=(.*)$/);
    if (match) {
      envVars[match[1]] = match[2];
    }
  });
  
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => {
    const value = envVars[varName];
    return !value || value === 'AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' || value.includes('your-');
  });
  
  if (missingVars.length > 0) {
    throw new Error(`Configuration Firebase incomplète. Variables manquantes: ${missingVars.join(', ')}`);
  }
  
  console.log('✅ Configuration Firebase valide');
};

// Fonction pour nettoyer et construire
const buildProject = () => {
  console.log('🏗️  Construction du projet...');
  
  // Nettoyer le dossier dist
  if (fs.existsSync('dist')) {
    runCommand('rm -rf dist', 'Nettoyage du dossier dist');
  }
  
  // Installer les dépendances si nécessaire
  if (!fs.existsSync('node_modules')) {
    runCommand('npm install', 'Installation des dépendances');
  }
  
  // Construire le projet
  runCommand('npm run build', 'Build de production');
  
  console.log('✅ Construction terminée');
};

// Fonction pour déployer sur Firebase
const deployToFirebase = () => {
  console.log('🔥 Déploiement sur Firebase...');
  
  // Vérifier que Firebase CLI est installé
  try {
    execSync('firebase --version', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('Firebase CLI non installé. Installez-le avec: npm install -g firebase-tools');
  }
  
  // Vérifier la connexion Firebase
  runCommand('firebase login:ci --no-localhost', 'Vérification de la connexion Firebase');
  
  // Déployer
  runCommand('firebase deploy --only hosting', 'Déploiement sur Firebase Hosting');
  
  console.log('✅ Déploiement Firebase terminé');
};

// Fonction pour vérifier le déploiement
const verifyDeployment = () => {
  console.log('🔍 Vérification du déploiement...');
  
  const projectId = 'musiqueconnect-ac841';
  const hostingUrl = `https://${projectId}.web.app`;
  
  console.log(`🌐 URL de l'application: ${hostingUrl}`);
  console.log(`📊 Console Firebase: https://console.firebase.google.com/project/${projectId}/hosting`);
  
  console.log('✅ Vérification terminée');
};

// Fonction principale
const main = async () => {
  try {
    // 1. Vérifier la configuration Firebase
    checkFirebaseConfig();
    
    // 2. Construire le projet
    buildProject();
    
    // 3. Déployer sur Firebase
    deployToFirebase();
    
    // 4. Vérifier le déploiement
    verifyDeployment();
    
    console.log('\n🎉 Déploiement réussi !');
    console.log('========================');
    console.log('🌐 Votre application est maintenant accessible à:');
    console.log('   https://musiqueconnect-ac841.web.app');
    console.log('   https://musiqueconnect-ac841.firebaseapp.com');
    console.log('\n📊 Pour surveiller votre application:');
    console.log('   https://console.firebase.google.com/project/musiqueconnect-ac841/hosting');
    
  } catch (error) {
    console.error('\n❌ Déploiement échoué !');
    console.error('========================');
    console.error('Erreur:', error.message);
    console.log('\n🔧 Solutions possibles:');
    console.log('1. Vérifiez votre connexion internet');
    console.log('2. Assurez-vous d\'être connecté à Firebase: firebase login');
    console.log('3. Vérifiez la configuration Firebase dans .env.local');
    console.log('4. Consultez les logs pour plus de détails');
    process.exit(1);
  }
};

// Exécuter le script
main(); 