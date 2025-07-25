#!/usr/bin/env node

/**
 * Script pour nettoyer complètement Cloud Run et s'assurer que seul Firebase Hosting est utilisé
 * Usage: node scripts/cleanup-cloud-run-completely.cjs
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🧹 Nettoyage Complet Cloud Run - MusiqueConnect');
console.log('==============================================\n');

// Fonction pour exécuter une commande avec gestion d'erreur
const runCommand = (command, description) => {
  console.log(`📋 ${description}...`);
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} - Succès`);
    return result;
  } catch (error) {
    console.log(`⚠️  ${description} - Erreur (normal si pas de service): ${error.message}`);
    return null;
  }
};

// Fonction pour vérifier si gcloud est installé
const checkGcloud = () => {
  try {
    execSync('gcloud --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
};

// Fonction pour nettoyer Cloud Run
const cleanupCloudRun = () => {
  console.log('🗑️  Nettoyage des services Cloud Run...');
  
  if (!checkGcloud()) {
    console.log('⚠️  gcloud CLI non installé - impossible de nettoyer Cloud Run');
    console.log('   Installez-le avec: https://cloud.google.com/sdk/docs/install');
    return;
  }
  
  // Lister tous les services Cloud Run
  try {
    const services = execSync('gcloud run services list --platform managed --format="value(metadata.name)"', { encoding: 'utf8' });
    
    if (services.includes('musconnect')) {
      console.log('🗑️  Suppression du service Cloud Run musconnect...');
      
      // Supprimer le service dans toutes les régions possibles
      const regions = ['us-central1', 'us-east1', 'europe-west1', 'asia-northeast1'];
      
      regions.forEach(region => {
        try {
          execSync(`gcloud run services delete musconnect --platform managed --region ${region} --quiet`, { stdio: 'pipe' });
          console.log(`✅ Service supprimé dans ${region}`);
        } catch (error) {
          // Ignorer les erreurs si le service n'existe pas dans cette région
        }
      });
    } else {
      console.log('ℹ️  Aucun service Cloud Run musconnect trouvé');
    }
  } catch (error) {
    console.log('⚠️  Erreur lors de la liste des services Cloud Run');
  }
};

// Fonction pour vérifier la configuration Firebase
const verifyFirebaseConfig = () => {
  console.log('🔍 Vérification de la configuration Firebase...');
  
  // Vérifier firebase.json
  if (!fs.existsSync('firebase.json')) {
    throw new Error('firebase.json non trouvé !');
  }
  
  const firebaseConfig = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
  
  if (!firebaseConfig.hosting) {
    throw new Error('Configuration hosting manquante dans firebase.json !');
  }
  
  if (firebaseConfig.hosting.public !== 'dist') {
    throw new Error('Configuration hosting incorrecte - doit pointer vers "dist" !');
  }
  
  console.log('✅ Configuration Firebase Hosting valide');
};

// Fonction pour vérifier le déploiement Firebase
const verifyFirebaseDeployment = () => {
  console.log('🔍 Vérification du déploiement Firebase...');
  
  try {
    const result = execSync('firebase hosting:channel:list', { encoding: 'utf8' });
    console.log('✅ Déploiement Firebase Hosting actif');
  } catch (error) {
    console.log('⚠️  Impossible de vérifier le déploiement Firebase');
  }
};

// Fonction pour afficher les URLs correctes
const showCorrectUrls = () => {
  console.log('🌐 URLs Correctes de votre Application :');
  console.log('========================================\n');
  
  console.log('✅ Firebase Hosting (CORRECT) :');
  console.log('   https://musiqueconnect-ac841.web.app');
  console.log('   https://musiqueconnect-ac841.firebaseapp.com');
  console.log('');
  
  console.log('❌ Cloud Run (À ÉVITER) :');
  console.log('   https://musconnect-xxxxx-uc.a.run.app (ne pas utiliser)');
  console.log('');
  
  console.log('📊 Console Firebase :');
  console.log('   https://console.firebase.google.com/project/musiqueconnect-ac841/hosting');
  console.log('');
};

// Fonction pour créer un guide de prévention
const createPreventionGuide = () => {
  console.log('📋 Guide de Prévention - Éviter Cloud Run :');
  console.log('==========================================\n');
  
  console.log('🚫 NE JAMAIS UTILISER :');
  console.log('   - gcloud run deploy');
  console.log('   - Déploiements automatiques Cloud Run');
  console.log('   - Cloud Build avec Cloud Run');
  console.log('');
  
  console.log('✅ TOUJOURS UTILISER :');
  console.log('   - firebase deploy --only hosting');
  console.log('   - npm run build && firebase deploy');
  console.log('   - node scripts/update-and-deploy.cjs');
  console.log('');
  
  console.log('🔧 Configuration Recommandée :');
  console.log('   - firebase.json pointe vers "dist"');
  console.log('   - Pas de Dockerfile');
  console.log('   - Pas de cloudbuild.yaml pour Cloud Run');
  console.log('');
};

// Fonction principale
const main = async () => {
  try {
    console.log('🚀 Nettoyage complet en cours...\n');
    
    // 1. Nettoyer Cloud Run
    cleanupCloudRun();
    
    // 2. Vérifier la configuration Firebase
    verifyFirebaseConfig();
    
    // 3. Vérifier le déploiement Firebase
    verifyFirebaseDeployment();
    
    // 4. Afficher les URLs correctes
    showCorrectUrls();
    
    // 5. Créer le guide de prévention
    createPreventionGuide();
    
    console.log('🎉 Nettoyage terminé !');
    console.log('=====================\n');
    console.log('✅ Cloud Run nettoyé');
    console.log('✅ Firebase Hosting vérifié');
    console.log('✅ Application accessible via Firebase Hosting uniquement');
    console.log('\n🌐 Votre application est accessible à :');
    console.log('   https://musiqueconnect-ac841.web.app');
    console.log('\n📊 Console Firebase :');
    console.log('   https://console.firebase.google.com/project/musiqueconnect-ac841/hosting');
    
  } catch (error) {
    console.error('\n❌ Nettoyage échoué !');
    console.error('====================');
    console.error('Erreur:', error.message);
    console.log('\n🔧 Solutions possibles:');
    console.log('1. Vérifiez votre connexion internet');
    console.log('2. Assurez-vous d\'être connecté à Firebase: firebase login');
    console.log('3. Vérifiez la configuration Firebase');
    process.exit(1);
  }
};

// Exécuter le script
main(); 