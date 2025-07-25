#!/usr/bin/env node

/**
 * Diagnostic de l'erreur 400 - MusiqueConnect
 * Usage: node scripts/diagnose-400-error.cjs
 */

console.log('🔍 Diagnostic de l\'Erreur 400 - MusiqueConnect');
console.log('==============================================\n');

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📋 Vérifications Système :');
console.log('==========================\n');

// 1. Vérifier la configuration Firebase
console.log('1️⃣  Configuration Firebase...');
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasFirebaseConfig = envContent.includes('VITE_FIREBASE_API_KEY') && 
                             envContent.includes('VITE_FIREBASE_AUTH_DOMAIN');
    
    if (hasFirebaseConfig) {
      console.log('   ✅ Configuration Firebase trouvée');
    } else {
      console.log('   ❌ Configuration Firebase manquante');
    }
  } else {
    console.log('   ❌ Fichier .env.local non trouvé');
  }
} catch (error) {
  console.log('   ❌ Erreur lors de la vérification de la configuration');
}

// 2. Vérifier l'état de Firebase
console.log('\n2️⃣  État de Firebase...');
try {
  const firebaseStatus = execSync('firebase projects:list', { encoding: 'utf8' });
  if (firebaseStatus.includes('musiqueconnect-ac841')) {
    console.log('   ✅ Projet Firebase actif');
  } else {
    console.log('   ❌ Projet Firebase non trouvé');
  }
} catch (error) {
  console.log('   ❌ Erreur lors de la vérification Firebase');
}

// 3. Vérifier les fonctions Firebase
console.log('\n3️⃣  Fonctions Firebase...');
try {
  const functions = execSync('firebase functions:list', { encoding: 'utf8' });
  if (functions.includes('us-central1')) {
    console.log('   ✅ Fonctions Firebase déployées');
  } else {
    console.log('   ❌ Fonctions Firebase non déployées');
  }
} catch (error) {
  console.log('   ❌ Erreur lors de la vérification des fonctions');
}

// 4. Vérifier l'application en ligne
console.log('\n4️⃣  Application en ligne...');
try {
  const response = execSync('curl -s -o /dev/null -w "%{http_code}" https://musiqueconnect-ac841.web.app', { encoding: 'utf8' });
  if (response.trim() === '200') {
    console.log('   ✅ Application accessible (HTTP 200)');
  } else {
    console.log(`   ⚠️  Application retourne HTTP ${response.trim()}`);
  }
} catch (error) {
  console.log('   ❌ Erreur lors de la vérification de l\'application');
}

console.log('\n🔍 Causes Possibles de l\'Erreur 400 :');
console.log('=====================================\n');

const possibleCauses = [
  {
    cause: 'Authentification Firebase non configurée',
    symptoms: ['Erreur lors de la connexion Google', 'Popup d\'authentification qui échoue'],
    solution: 'Configurer l\'authentification dans Firebase Console'
  },
  {
    cause: 'Règles Firestore trop restrictives',
    symptoms: ['Erreur de permissions', 'Données non accessibles'],
    solution: 'Vérifier et ajuster les règles Firestore'
  },
  {
    cause: 'Fonctions Firebase non déployées',
    symptoms: ['Erreur lors de l\'appel de fonctions', 'Fonctionnalités non disponibles'],
    solution: 'Déployer les fonctions Firebase'
  },
  {
    cause: 'Configuration CORS incorrecte',
    symptoms: ['Erreur lors des requêtes API', 'Blocage par le navigateur'],
    solution: 'Vérifier la configuration CORS'
  },
  {
    cause: 'Variables d\'environnement manquantes',
    symptoms: ['Erreur d\'initialisation Firebase', 'Configuration incomplète'],
    solution: 'Vérifier le fichier .env.local'
  },
  {
    cause: 'Problème de domaine autorisé',
    symptoms: ['Erreur d\'authentification Google', 'Redirection échouée'],
    solution: 'Ajouter le domaine dans Firebase Auth'
  }
];

possibleCauses.forEach(({ cause, symptoms, solution }, index) => {
  console.log(`${index + 1}. ${cause}`);
  console.log(`   Symptômes: ${symptoms.join(', ')}`);
  console.log(`   Solution: ${solution}`);
  console.log('');
});

console.log('🔧 Solutions Recommandées :');
console.log('===========================\n');

console.log('1️⃣  Vérifier l\'authentification :');
console.log('   Allez sur : https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/providers');
console.log('   Activez Google et ajoutez votre domaine');
console.log('');

console.log('2️⃣  Vérifier les règles Firestore :');
console.log('   Exécutez: firebase deploy --only firestore:rules');
console.log('   Ou vérifiez: firebase firestore:rules:get');
console.log('');

console.log('3️⃣  Vérifier les fonctions :');
console.log('   Exécutez: firebase deploy --only functions');
console.log('   Ou vérifiez: firebase functions:list');
console.log('');

console.log('4️⃣  Vérifier la configuration :');
console.log('   Exécutez: node scripts/test-firebase-config.cjs');
console.log('   Vérifiez le fichier .env.local');
console.log('');

console.log('5️⃣  Vérifier l\'application :');
console.log('   Ouvrez: https://musiqueconnect-ac841.web.app');
console.log('   Ouvrez les outils de développement (F12)');
console.log('   Regardez l\'onglet Console et Network');
console.log('');

console.log('🔗 URLs de Diagnostic :');
console.log('======================\n');

const diagnosticUrls = [
  { name: 'Firebase Console', url: 'https://console.firebase.google.com/project/musiqueconnect-ac841', desc: 'Vérifier l\'état du projet' },
  { name: 'Authentication', url: 'https://console.firebase.google.com/project/musiqueconnect-ac841/authentication', desc: 'Configurer l\'auth' },
  { name: 'Firestore', url: 'https://console.firebase.google.com/project/musiqueconnect-ac841/firestore', desc: 'Vérifier les données' },
  { name: 'Functions', url: 'https://console.firebase.google.com/project/musiqueconnect-ac841/functions', desc: 'Vérifier les fonctions' },
  { name: 'Hosting', url: 'https://console.firebase.google.com/project/musiqueconnect-ac841/hosting', desc: 'Vérifier le déploiement' },
  { name: 'Application', url: 'https://musiqueconnect-ac841.web.app', desc: 'Tester l\'application' },
];

diagnosticUrls.forEach(({ name, url, desc }) => {
  console.log(`${name.padEnd(15)} : ${url}`);
  console.log(`${' '.repeat(15)}   ${desc}`);
});

console.log('\n📝 Instructions de Test :');
console.log('=========================\n');

console.log('1. Ouvrez l\'application dans votre navigateur');
console.log('2. Appuyez sur F12 pour ouvrir les outils de développement');
console.log('3. Allez dans l\'onglet "Console"');
console.log('4. Allez dans l\'onglet "Network"');
console.log('5. Rechargez la page (F5)');
console.log('6. Regardez les erreurs dans la console');
console.log('7. Regardez les requêtes qui retournent 400 dans Network');
console.log('8. Notez l\'URL exacte qui cause l\'erreur 400');
console.log('');

console.log('🚨 Si vous voyez une erreur 400 spécifique :');
console.log('===========================================\n');

console.log('• Copiez l\'URL exacte de l\'erreur');
console.log('• Notez le message d\'erreur complet');
console.log('• Vérifiez si c\'est une requête Firebase, API, ou autre');
console.log('• Utilisez cette information pour identifier la cause exacte');
console.log('');

console.log('🎯 Prochaines Actions :');
console.log('=======================\n');

console.log('1. Testez l\'application et notez l\'erreur exacte');
console.log('2. Configurez l\'authentification Firebase');
console.log('3. Vérifiez les règles Firestore');
console.log('4. Testez à nouveau l\'application');
console.log('');

console.log('💡 Conseil :');
console.log('============\n');

console.log('L\'erreur 400 est généralement liée à :');
console.log('• Une requête mal formée');
console.log('• Des paramètres manquants');
console.log('• Une authentification échouée');
console.log('• Des permissions insuffisantes');
console.log('');

console.log('Identifiez d\'abord la source exacte de l\'erreur, puis nous pourrons la résoudre !'); 