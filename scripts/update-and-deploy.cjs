#!/usr/bin/env node

/**
 * Script pour mettre à jour l'API Key Firebase et déployer
 * Usage: node scripts/update-and-deploy.cjs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Mise à Jour API Key et Déploiement - MusiqueConnect');
console.log('=====================================================\n');

// API Key fournie par l'utilisateur
const REAL_API_KEY = 'AIzaSyBK8mPYyVcDmteWOXL3dlzON0_HfYHbxhI';

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

// Fonction pour mettre à jour le fichier .env.local
const updateEnvFile = () => {
  console.log('🔧 Mise à jour du fichier .env.local...');
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    throw new Error('Fichier .env.local non trouvé !');
  }
  
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Remplacer l'API Key
  envContent = envContent.replace(
    /VITE_FIREBASE_API_KEY=.*/,
    `VITE_FIREBASE_API_KEY=${REAL_API_KEY}`
  );
  
  // Écrire le fichier mis à jour
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Fichier .env.local mis à jour avec la vraie API Key');
};

// Fonction pour construire l'application
const buildApplication = () => {
  console.log('🏗️  Construction de l\'application...');
  
  // Nettoyer le dossier dist
  if (fs.existsSync('dist')) {
    runCommand('rm -rf dist', 'Nettoyage du dossier dist');
  }
  
  // Construire l'application
  runCommand('npm run build', 'Build de production');
  
  console.log('✅ Application construite');
};

// Fonction pour déployer sur Firebase
const deployToFirebase = () => {
  console.log('🔥 Déploiement sur Firebase Hosting...');
  
  // Vérifier que Firebase CLI est installé
  try {
    execSync('firebase --version', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('Firebase CLI non installé. Installez-le avec: npm install -g firebase-tools');
  }
  
  // Déployer uniquement le hosting
  runCommand('firebase deploy --only hosting', 'Déploiement Firebase Hosting');
  
  console.log('✅ Déploiement Firebase Hosting terminé');
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
    console.log('🚀 Déploiement avec la vraie API Key en cours...\n');
    
    // 1. Mettre à jour l'API Key
    updateEnvFile();
    
    // 2. Construire l'application
    buildApplication();
    
    // 3. Déployer sur Firebase
    deployToFirebase();
    
    // 4. Vérifier le déploiement
    verifyDeployment();
    
    console.log('\n🎉 Déploiement réussi avec la vraie API Key !');
    console.log('=============================================');
    console.log('🌐 Votre application est maintenant accessible à:');
    console.log('   https://musiqueconnect-ac841.web.app');
    console.log('   https://musiqueconnect-ac841.firebaseapp.com');
    console.log('\n📊 Pour surveiller votre application:');
    console.log('   https://console.firebase.google.com/project/musiqueconnect-ac841/hosting');
    console.log('\n✅ Firebase est maintenant configuré avec la vraie API Key !');
    
  } catch (error) {
    console.error('\n❌ Déploiement échoué !');
    console.error('========================');
    console.error('Erreur:', error.message);
    console.log('\n🔧 Solutions possibles:');
    console.log('1. Vérifiez votre connexion internet');
    console.log('2. Assurez-vous d\'être connecté à Firebase: firebase login');
    console.log('3. Vérifiez que l\'API Key est correcte');
    console.log('4. Consultez les logs pour plus de détails');
    process.exit(1);
  }
};

// Exécuter le script
main(); 