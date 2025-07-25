#!/usr/bin/env node

/**
 * Script interactif pour récupérer la vraie configuration Firebase
 * Usage: node scripts/get-real-firebase-config.cjs
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Récupération de la Configuration Firebase Réelle');
console.log('====================================================\n');

console.log('📋 Instructions étape par étape :');
console.log('================================\n');

console.log('1️⃣  OUVREZ VOTRE NAVIGATEUR');
console.log('   Allez sur : https://console.firebase.google.com/project/musiqueconnect-ac841');
console.log('   Connectez-vous avec votre compte Google\n');

console.log('2️⃣  ACCÉDEZ AUX PARAMÈTRES');
console.log('   - Cliquez sur l\'icône ⚙️ (Paramètres) en haut à gauche');
console.log('   - Sélectionnez "Paramètres du projet"');
console.log('   - Allez dans l\'onglet "Général"\n');

console.log('3️⃣  VÉRIFIEZ LES APPLICATIONS');
console.log('   - Faites défiler jusqu\'à la section "Vos applications"');
console.log('   - Si aucune application web n\'existe, cliquez sur "Ajouter une application" (icône </>)');
console.log('   - Sélectionnez "Web"');
console.log('   - Nom : MusiqueConnect Web');
console.log('   - NE cochez PAS "Configurer Firebase Hosting"');
console.log('   - Cliquez sur "Enregistrer l\'application"\n');

console.log('4️⃣  RÉCUPÉREZ LA CONFIGURATION');
console.log('   - Dans la page de votre application, cliquez sur "Config"');
console.log('   - Vous verrez une configuration comme celle-ci :\n');

console.log('   const firebaseConfig = {');
console.log('     apiKey: "AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz",');
console.log('     authDomain: "musiqueconnect-ac841.firebaseapp.com",');
console.log('     projectId: "musiqueconnect-ac841",');
console.log('     storageBucket: "musiqueconnect-ac841.firebasestorage.app",');
console.log('     messagingSenderId: "844946743727",');
console.log('     appId: "1:844946743727:web:abc123def456ghi789"');
console.log('   };\n');

console.log('5️⃣  COPIEZ LES VALEURS');
console.log('   - Copiez la valeur de "apiKey" (commence par AIzaSy...)');
console.log('   - Copiez la valeur de "appId" (commence par 1:844946743727:web...)\n');

// Fonction pour demander l'API Key
const askApiKey = () => {
  return new Promise((resolve) => {
    rl.question('🔑 Collez votre API Key Firebase (commence par AIzaSy...) : ', (apiKey) => {
      if (apiKey && apiKey.startsWith('AIzaSy')) {
        resolve(apiKey);
      } else {
        console.log('❌ API Key invalide. Elle doit commencer par "AIzaSy"');
        resolve(askApiKey());
      }
    });
  });
};

// Fonction pour demander l'App ID
const askAppId = () => {
  return new Promise((resolve) => {
    rl.question('🆔 Collez votre App ID Firebase (commence par 1:844946743727:web...) : ', (appId) => {
      if (appId && appId.startsWith('1:844946743727:web')) {
        resolve(appId);
      } else {
        console.log('❌ App ID invalide. Il doit commencer par "1:844946743727:web"');
        resolve(askAppId());
      }
    });
  });
};

// Fonction pour mettre à jour le fichier .env.local
const updateEnvFile = (apiKey, appId) => {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ Fichier .env.local non trouvé !');
    console.log('   Créez-le d\'abord avec : node scripts/create-env-local.cjs');
    return false;
  }
  
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Remplacer l'API Key
  envContent = envContent.replace(
    /VITE_FIREBASE_API_KEY=.*/,
    `VITE_FIREBASE_API_KEY=${apiKey}`
  );
  
  // Remplacer l'App ID
  envContent = envContent.replace(
    /VITE_FIREBASE_APP_ID=.*/,
    `VITE_FIREBASE_APP_ID=${appId}`
  );
  
  // Écrire le fichier mis à jour
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Fichier .env.local mis à jour avec succès !');
  return true;
};

// Fonction principale
const main = async () => {
  try {
    console.log('🚀 Prêt à configurer Firebase ? Appuyez sur Entrée pour continuer...');
    await new Promise(resolve => rl.question('', resolve));
    
    console.log('\n📝 Saisie des valeurs Firebase :');
    console.log('================================\n');
    
    const apiKey = await askApiKey();
    const appId = await askAppId();
    
    console.log('\n💾 Mise à jour du fichier .env.local...');
    const success = updateEnvFile(apiKey, appId);
    
    if (success) {
      console.log('\n🎉 Configuration Firebase terminée !');
      console.log('====================================\n');
      
      console.log('🔍 Vérification de la configuration :');
      console.log('====================================');
      
      // Exécuter le test de configuration
      const { execSync } = require('child_process');
      try {
        execSync('node scripts/test-firebase-config.cjs', { stdio: 'inherit' });
      } catch (error) {
        console.log('⚠️  Test de configuration échoué, mais la configuration a été mise à jour');
      }
      
      console.log('\n🚀 Prochaines étapes :');
      console.log('=====================');
      console.log('1. Testez l\'application : npm run dev');
      console.log('2. Déployez en production : node scripts/deploy-production.cjs');
      console.log('3. Votre application sera accessible à :');
      console.log('   - https://musiqueconnect-ac841.web.app');
      console.log('   - https://musiqueconnect-ac841.firebaseapp.com');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration :', error.message);
  } finally {
    rl.close();
  }
};

// Exécuter le script
main(); 