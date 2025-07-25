#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🎯 Démarrage Rapide - Application Teacher-Student\n');
  console.log('='.repeat(60));
  
  // Vérifier si Firebase est déjà configuré
  const envPath = path.join(process.cwd(), '.env.local');
  const isFirebaseConfigured = fs.existsSync(envPath);
  
  if (isFirebaseConfigured) {
    console.log('✅ Firebase déjà configuré !');
    console.log('📋 Que souhaitez-vous faire ?\n');
    
    const choice = await question(`
1️⃣ Tester l'application localement
2️⃣ Préparer le déploiement Vercel
3️⃣ Tout faire (test + déploiement)
4️⃣ Quitter

Votre choix (1-4) : `);
    
    switch (choice.trim()) {
      case '1':
        await testApplication();
        break;
      case '2':
        await prepareDeployment();
        break;
      case '3':
        await testApplication();
        await prepareDeployment();
        break;
      case '4':
        console.log('👋 Au revoir !');
        rl.close();
        return;
      default:
        console.log('❌ Choix invalide');
        rl.close();
        return;
    }
  } else {
    console.log('❌ Firebase non configuré');
    console.log('📋 Configuration requise avant de continuer\n');
    
    const setupChoice = await question(`
1️⃣ Configurer Firebase maintenant
2️⃣ Voir le guide de configuration
3️⃣ Quitter

Votre choix (1-3) : `);
    
    switch (setupChoice.trim()) {
      case '1':
        await setupFirebase();
        break;
      case '2':
        showSetupGuide();
        break;
      case '3':
        console.log('👋 Au revoir !');
        rl.close();
        return;
      default:
        console.log('❌ Choix invalide');
        rl.close();
        return;
    }
  }
  
  rl.close();
}

async function setupFirebase() {
  console.log('\n🔥 Configuration Firebase...\n');
  
  console.log('📋 Étapes à suivre :');
  console.log('1. Ouvrez la console Firebase : https://console.firebase.google.com/');
  console.log('2. Créez un nouveau projet');
  console.log('3. Activez Firestore Database');
  console.log('4. Configurez Authentication (Google + Microsoft)');
  console.log('5. Ajoutez une application web');
  console.log('6. Copiez la configuration\n');
  
  const ready = await question('Avez-vous terminé la configuration Firebase ? (oui/non) : ');
  
  if (ready.toLowerCase().includes('oui')) {
    console.log('\n🔧 Lancement du script de configuration...');
    const { execSync } = require('child_process');
    
    try {
      execSync('npm run setup-firebase', { stdio: 'inherit' });
      console.log('\n✅ Configuration Firebase terminée !');
      
      const continueChoice = await question('\nVoulez-vous continuer avec les tests ? (oui/non) : ');
      if (continueChoice.toLowerCase().includes('oui')) {
        await testApplication();
      }
    } catch (error) {
      console.log('❌ Erreur lors de la configuration');
    }
  } else {
    console.log('💡 Consultez FIREBASE_SETUP_STEPS.md pour le guide détaillé');
  }
}

function showSetupGuide() {
  console.log('\n📖 Guide de configuration Firebase :');
  console.log('📄 Fichier : FIREBASE_SETUP_STEPS.md');
  console.log('🌐 Console Firebase : https://console.firebase.google.com/');
  console.log('\n💡 Une fois configuré, relancez ce script');
}

async function testApplication() {
  console.log('\n🧪 Test de l\'application...\n');
  
  // Test de la configuration Firebase
  console.log('1️⃣ Test de la configuration Firebase...');
  const { execSync } = require('child_process');
  
  try {
    execSync('npm run test-firebase', { stdio: 'inherit' });
  } catch (error) {
    console.log('❌ Configuration Firebase invalide');
    return;
  }
  
  // Test du build
  console.log('\n2️⃣ Test du build...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build réussi !');
  } catch (error) {
    console.log('❌ Erreur lors du build');
    return;
  }
  
  // Lancer l'application
  console.log('\n3️⃣ Lancement de l\'application...');
  console.log('🚀 L\'application va se lancer dans votre navigateur');
  console.log('📱 Testez les fonctionnalités suivantes :');
  console.log('   - Connexion avec Google/Microsoft');
  console.log('   - Création de groupes');
  console.log('   - Ajout d\'élèves');
  console.log('   - Gestion des devoirs');
  console.log('   - Chat et annonces');
  console.log('\n💡 Appuyez sur Ctrl+C pour arrêter le serveur\n');
  
  const launchChoice = await question('Lancer l\'application maintenant ? (oui/non) : ');
  
  if (launchChoice.toLowerCase().includes('oui')) {
    try {
      execSync('npm run dev', { stdio: 'inherit' });
    } catch (error) {
      console.log('❌ Erreur lors du lancement');
    }
  }
}

async function prepareDeployment() {
  console.log('\n🚀 Préparation du déploiement...\n');
  
  const { execSync } = require('child_process');
  
  try {
    execSync('npm run prepare-deployment', { stdio: 'inherit' });
    
    console.log('\n📋 Prochaines étapes pour le déploiement :');
    console.log('1. Poussez votre code sur GitHub');
    console.log('2. Connectez votre repo à Vercel : https://vercel.com');
    console.log('3. Configurez les variables d\'environnement');
    console.log('4. Déployez !');
    
    const deployChoice = await question('\nVoulez-vous ouvrir Vercel maintenant ? (oui/non) : ');
    
    if (deployChoice.toLowerCase().includes('oui')) {
      const { exec } = require('child_process');
      exec('open https://vercel.com');
      console.log('🌐 Vercel ouvert dans votre navigateur');
    }
  } catch (error) {
    console.log('❌ Erreur lors de la préparation');
  }
}

// Gestion de l'interruption
process.on('SIGINT', () => {
  console.log('\n👋 Au revoir !');
  rl.close();
  process.exit(0);
});

// Lancer le script
main().catch(console.error); 