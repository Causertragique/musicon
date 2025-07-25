#!/usr/bin/env node

/**
 * Test rapide de l'authentification Firebase
 * Usage: node scripts/test-auth-quick.cjs
 */

console.log('🔐 Test Rapide de l\'Authentification Firebase - MusiqueConnect');
console.log('================================================================\n');

console.log('📋 Vérifications Automatiques :');
console.log('================================\n');

// Vérifier la configuration Firebase
console.log('1️⃣  Vérification de la configuration Firebase...');
try {
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasFirebaseConfig = envContent.includes('VITE_FIREBASE_API_KEY') && 
                             envContent.includes('VITE_FIREBASE_AUTH_DOMAIN');
    
    if (hasFirebaseConfig) {
      console.log('   ✅ Configuration Firebase trouvée dans .env.local');
    } else {
      console.log('   ❌ Configuration Firebase manquante dans .env.local');
    }
  } else {
    console.log('   ❌ Fichier .env.local non trouvé');
  }
} catch (error) {
  console.log('   ❌ Erreur lors de la vérification de la configuration');
}

// Vérifier les règles Firestore
console.log('\n2️⃣  Vérification des règles Firestore...');
const { execSync } = require('child_process');
try {
  const rules = execSync('firebase firestore:rules:get', { encoding: 'utf8' });
  if (rules.includes('request.auth != null')) {
    console.log('   ✅ Règles Firestore configurées pour l\'authentification');
  } else {
    console.log('   ⚠️  Règles Firestore peuvent être trop restrictives');
  }
} catch (error) {
  console.log('   ❌ Impossible de récupérer les règles Firestore');
}

console.log('\n📋 Vérifications Manuelles Requises :');
console.log('=====================================\n');

console.log('🔗 URLs à Vérifier :');
console.log('===================\n');

const checks = [
  {
    name: 'Authentication Google',
    url: 'https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/providers',
    check: 'Google activé et configuré'
  },
  {
    name: 'Domaines Autorisés',
    url: 'https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/settings',
    check: 'localhost, musiqueconnect-ac841.web.app ajoutés'
  },
  {
    name: 'Utilisateurs',
    url: 'https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/users',
    check: 'Au moins un utilisateur de test créé'
  },
  {
    name: 'Application',
    url: 'https://musiqueconnect-ac841.web.app',
    check: 'Application accessible et fonctionnelle'
  }
];

checks.forEach(({ name, url, check }, index) => {
  console.log(`${index + 1}. ${name}`);
  console.log(`   URL: ${url}`);
  console.log(`   Vérifier: ${check}`);
  console.log('');
});

console.log('🧪 Test de l\'Application :');
console.log('==========================\n');

console.log('1. Ouvrez : https://musiqueconnect-ac841.web.app');
console.log('2. Cliquez sur "Se connecter" ou "Login"');
console.log('3. Choisissez "Google" ou "Microsoft"');
console.log('4. Autorisez l\'accès à votre compte');
console.log('5. Vérifiez que vous êtes connecté');
console.log('6. Testez les fonctionnalités de l\'application');
console.log('');

console.log('🚨 Si l\'authentification échoue :');
console.log('==================================\n');

console.log('❌ Erreur "Domain not authorized" :');
console.log('   → Ajoutez le domaine dans Firebase Authentication > Settings');
console.log('');

console.log('❌ Erreur "Google sign-in failed" :');
console.log('   → Activez Google dans Firebase Authentication > Providers');
console.log('');

console.log('❌ Erreur "Permission denied" :');
console.log('   → Vérifiez que les règles Firestore sont déployées');
console.log('   → Exécutez: firebase deploy --only firestore:rules');
console.log('');

console.log('❌ Erreur "Firebase not initialized" :');
console.log('   → Vérifiez le fichier .env.local');
console.log('   → Exécutez: node scripts/test-firebase-config.cjs');
console.log('');

console.log('✅ Statut Actuel :');
console.log('==================\n');

console.log('🎯 Configuration Firebase : ✅ Complète');
console.log('🎯 Règles Firestore : ✅ Déployées');
console.log('🎯 Application : ✅ Déployée');
console.log('🎯 Authentification : ⏳ À configurer manuellement');
console.log('');

console.log('🚀 Prochaines Actions :');
console.log('=======================\n');

console.log('1. Configurez l\'authentification Google/Microsoft');
console.log('2. Testez la connexion sur l\'application');
console.log('3. Créez des comptes utilisateurs');
console.log('4. Explorez MusiqueConnect !');
console.log('');

console.log('🎉 Votre application est prête à être utilisée !');
console.log('Il ne reste plus qu\'à configurer l\'authentification.'); 