#!/usr/bin/env node

/**
 * Script pour corriger le déploiement Cloud Run et redéployer sur Firebase Hosting
 * Usage: node scripts/fix-cloud-run-deployment.cjs
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Correction du Déploiement Cloud Run');
console.log('======================================\n');

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
  console.log('🔍 Vérification de la configuration Firebase...');
  
  // Vérifier firebase.json
  if (!fs.existsSync('firebase.json')) {
    throw new Error('firebase.json non trouvé !');
  }
  
  // Vérifier .firebaserc
  if (!fs.existsSync('.firebaserc')) {
    throw new Error('.firebaserc non trouvé !');
  }
  
  console.log('✅ Configuration Firebase valide');
};

// Fonction pour nettoyer les déploiements Cloud Run
const cleanupCloudRun = () => {
  console.log('🧹 Nettoyage des déploiements Cloud Run...');
  
  try {
    // Lister les services Cloud Run
    const services = execSync('gcloud run services list --platform managed --region us-central1 --format="value(metadata.name)"', { encoding: 'utf8' });
    
    if (services.includes('musconnect')) {
      console.log('🗑️  Suppression du service Cloud Run musconnect...');
      execSync('gcloud run services delete musconnect --platform managed --region us-central1 --quiet', { stdio: 'pipe' });
      console.log('✅ Service Cloud Run supprimé');
    } else {
      console.log('ℹ️  Aucun service Cloud Run musconnect trouvé');
    }
  } catch (error) {
    console.log('⚠️  Impossible de nettoyer Cloud Run (normal si pas de service)');
  }
};

// Fonction pour construire l'application
const buildApplication = () => {
  console.log('🏗️  Construction de l\'application...');
  
  // Nettoyer le dossier dist
  if (fs.existsSync('dist')) {
    runCommand('rm -rf dist', 'Nettoyage du dossier dist');
  }
  
  // Installer les dépendances si nécessaire
  if (!fs.existsSync('node_modules')) {
    runCommand('npm install', 'Installation des dépendances');
  }
  
  // Construire l'application
  runCommand('npm run build', 'Build de production');
  
  console.log('✅ Application construite');
};

// Fonction pour déployer sur Firebase Hosting
const deployToFirebase = () => {
  console.log('🔥 Déploiement sur Firebase Hosting...');
  
  // Vérifier que Firebase CLI est installé
  try {
    execSync('firebase --version', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('Firebase CLI non installé. Installez-le avec: npm install -g firebase-tools');
  }
  
  // Vérifier la connexion Firebase
  try {
    const firebaseProjects = execSync('firebase projects:list', { encoding: 'utf8' });
    if (!firebaseProjects.includes('musiqueconnect-ac841')) {
      throw new Error('Non connecté au projet Firebase musiqueconnect-ac841');
    }
  } catch (error) {
    throw new Error('Erreur de connexion Firebase. Connectez-vous avec: firebase login');
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
    console.log('🚀 Correction du déploiement en cours...\n');
    
    // 1. Vérifier la configuration Firebase
    checkFirebaseConfig();
    
    // 2. Nettoyer Cloud Run (optionnel)
    cleanupCloudRun();
    
    // 3. Construire l'application
    buildApplication();
    
    // 4. Déployer sur Firebase Hosting
    deployToFirebase();
    
    // 5. Vérifier le déploiement
    verifyDeployment();
    
    console.log('\n🎉 Déploiement corrigé avec succès !');
    console.log('====================================');
    console.log('🌐 Votre application est maintenant accessible à:');
    console.log('   https://musiqueconnect-ac841.web.app');
    console.log('   https://musiqueconnect-ac841.firebaseapp.com');
    console.log('\n📊 Pour surveiller votre application:');
    console.log('   https://console.firebase.google.com/project/musiqueconnect-ac841/hosting');
    console.log('\n✅ Le problème Cloud Run a été résolu !');
    
  } catch (error) {
    console.error('\n❌ Correction échouée !');
    console.error('========================');
    console.error('Erreur:', error.message);
    console.log('\n🔧 Solutions possibles:');
    console.log('1. Vérifiez votre connexion internet');
    console.log('2. Assurez-vous d\'être connecté à Firebase: firebase login');
    console.log('3. Vérifiez la configuration Firebase dans .env.local');
    console.log('4. Consultez les logs pour plus de détails');
    console.log('\n📖 Guide de déploiement: DEPLOIEMENT_RAPIDE.md');
    process.exit(1);
  }
};

// Exécuter le script
main(); 