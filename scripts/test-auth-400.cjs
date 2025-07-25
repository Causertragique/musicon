#!/usr/bin/env node

/**
 * Test spécifique de l'authentification pour identifier l'erreur 400
 * Usage: node scripts/test-auth-400.cjs
 */

console.log('🔐 Test Spécifique Authentification - Erreur 400');
console.log('===============================================\n');

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎯 Test de l\'Authentification Firebase :');
console.log('========================================\n');

// 1. Vérifier la configuration d'authentification
console.log('1️⃣  Configuration d\'authentification...');
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const authDomain = envContent.match(/VITE_FIREBASE_AUTH_DOMAIN=([^\n]+)/);
    
    if (authDomain) {
      console.log(`   ✅ Domaine d'authentification: ${authDomain[1]}`);
    } else {
      console.log('   ❌ Domaine d\'authentification manquant');
    }
  }
} catch (error) {
  console.log('   ❌ Erreur lors de la vérification');
}

// 2. Vérifier les domaines autorisés
console.log('\n2️⃣  Domaines autorisés...');
console.log('   ⚠️  Cette vérification nécessite un accès manuel à Firebase Console');
console.log('   Allez sur : https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/settings');
console.log('   Vérifiez que ces domaines sont ajoutés :');
console.log('     - localhost');
console.log('     - musiqueconnect-ac841.web.app');
console.log('     - musiqueconnect-ac841.firebaseapp.com');

// 3. Vérifier les fournisseurs d'authentification
console.log('\n3️⃣  Fournisseurs d\'authentification...');
console.log('   ⚠️  Cette vérification nécessite un accès manuel à Firebase Console');
console.log('   Allez sur : https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/providers');
console.log('   Vérifiez que Google est activé');

console.log('\n🔍 Causes Spécifiques de l\'Erreur 400 en Authentification :');
console.log('==========================================================\n');

const authErrors = [
  {
    error: '400 - Bad Request',
    cause: 'Domaine non autorisé',
    solution: 'Ajouter le domaine dans Firebase Auth > Settings'
  },
  {
    error: '400 - Invalid Client',
    cause: 'Client ID Google incorrect',
    solution: 'Vérifier la configuration OAuth Google'
  },
  {
    error: '400 - Redirect URI Mismatch',
    cause: 'URI de redirection incorrect',
    solution: 'Configurer les URIs de redirection dans Google Cloud Console'
  },
  {
    error: '400 - Invalid Scope',
    cause: 'Scopes OAuth incorrects',
    solution: 'Vérifier les scopes dans la configuration Google'
  },
  {
    error: '400 - Authentication Failed',
    cause: 'Authentification Firebase non configurée',
    solution: 'Activer l\'authentification dans Firebase Console'
  }
];

authErrors.forEach(({ error, cause, solution }, index) => {
  console.log(`${index + 1}. ${error}`);
  console.log(`   Cause: ${cause}`);
  console.log(`   Solution: ${solution}`);
  console.log('');
});

console.log('🔧 Solutions Immédiates :');
console.log('=========================\n');

console.log('1️⃣  Configurer l\'authentification Google :');
console.log('   URL: https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/providers');
console.log('   Étapes:');
console.log('   1. Cliquez sur "Google"');
console.log('   2. Activez "Autoriser"');
console.log('   3. Ajoutez votre email comme utilisateur de test');
console.log('   4. Cliquez sur "Enregistrer"');
console.log('');

console.log('2️⃣  Configurer les domaines autorisés :');
console.log('   URL: https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/settings');
console.log('   Étapes:');
console.log('   1. Section "Domaines autorisés"');
console.log('   2. Ajoutez: localhost');
console.log('   3. Ajoutez: musiqueconnect-ac841.web.app');
console.log('   4. Ajoutez: musiqueconnect-ac841.firebaseapp.com');
console.log('   5. Cliquez sur "Enregistrer"');
console.log('');

console.log('3️⃣  Créer un utilisateur de test :');
console.log('   URL: https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/users');
console.log('   Étapes:');
console.log('   1. Cliquez sur "Ajouter un utilisateur"');
console.log('   2. Entrez votre email');
console.log('   3. Entrez un mot de passe temporaire');
console.log('   4. Cliquez sur "Ajouter"');
console.log('');

console.log('🧪 Test de l\'Application :');
console.log('==========================\n');

console.log('1. Ouvrez : https://musiqueconnect-ac841.web.app');
console.log('2. Appuyez sur F12 (outils de développement)');
console.log('3. Allez dans l\'onglet "Console"');
console.log('4. Allez dans l\'onglet "Network"');
console.log('5. Cliquez sur "Se connecter" ou "Login"');
console.log('6. Choisissez "Google"');
console.log('7. Regardez les erreurs dans la console');
console.log('8. Notez l\'URL exacte qui retourne 400');
console.log('');

console.log('🔗 URLs de Configuration :');
console.log('==========================\n');

const configUrls = [
  { name: 'Auth Providers', url: 'https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/providers', desc: 'Configurer Google Auth' },
  { name: 'Auth Settings', url: 'https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/settings', desc: 'Domaines autorisés' },
  { name: 'Auth Users', url: 'https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/users', desc: 'Gérer les utilisateurs' },
  { name: 'Google Cloud', url: 'https://console.cloud.google.com/apis/credentials', desc: 'Configuration OAuth' },
  { name: 'Application', url: 'https://musiqueconnect-ac841.web.app', desc: 'Tester l\'application' },
];

configUrls.forEach(({ name, url, desc }) => {
  console.log(`${name.padEnd(15)} : ${url}`);
  console.log(`${' '.repeat(15)}   ${desc}`);
});

console.log('\n📋 Checklist de Résolution :');
console.log('============================\n');

const checklist = [
  'Google Auth activé dans Firebase',
  'Domaines autorisés configurés',
  'Utilisateur de test créé',
  'Application testée avec F12',
  'Erreur 400 identifiée et notée',
  'Configuration OAuth vérifiée'
];

checklist.forEach((item, index) => {
  console.log(`[ ] ${index + 1}. ${item}`);
});

console.log('\n🚨 Si l\'erreur 400 persiste :');
console.log('==============================\n');

console.log('1. Notez l\'URL exacte de l\'erreur 400');
console.log('2. Copiez le message d\'erreur complet');
console.log('3. Vérifiez si c\'est une requête vers :');
console.log('   - accounts.google.com (OAuth Google)');
console.log('   - firebaseapp.com (Firebase Auth)');
console.log('   - googleapis.com (Google APIs)');
console.log('4. Utilisez cette information pour identifier la cause exacte');
console.log('');

console.log('🎯 Résultat Attendu :');
console.log('=====================\n');

console.log('✅ Après configuration, vous devriez pouvoir :');
console.log('   - Vous connecter avec Google sans erreur 400');
console.log('   - Accéder à toutes les fonctionnalités');
console.log('   - Voir les données Firestore chargées');
console.log('   - Utiliser le système de chat et de gestion');
console.log('');

console.log('💡 Conseil Final :');
console.log('==================\n');

console.log('L\'erreur 400 en authentification est généralement causée par :');
console.log('• Un domaine non autorisé dans Firebase Auth');
console.log('• Une configuration OAuth Google incorrecte');
console.log('• Des URIs de redirection mal configurés');
console.log('• Une authentification Firebase non activée');
console.log('');

console.log('Configurez d\'abord l\'authentification Firebase, puis testez à nouveau !'); 