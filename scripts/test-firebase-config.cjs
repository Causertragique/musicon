#!/usr/bin/env node

/**
 * Script pour tester la configuration Firebase
 * Usage: node scripts/test-firebase-config.cjs
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Test de la Configuration Firebase');
console.log('====================================\n');

// Charger les variables d'environnement
const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ Fichier .env.local non trouvé !');
  console.log('🔧 Créez-le avec: node scripts/create-env-local.cjs');
  process.exit(1);
}

// Lire le fichier .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

// Parser les variables d'environnement
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

console.log('📋 Variables d\'environnement trouvées:');
console.log('======================================');

const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_DATABASE_URL'
];

let allPresent = true;

requiredVars.forEach(varName => {
  const value = envVars[varName];
  const status = value && value !== 'your-api-key-here' && !value.includes('your-') ? '✅' : '❌';
  const displayValue = value ? (value.length > 20 ? value.substring(0, 20) + '...' : value) : 'Non défini';
  
  console.log(`${status} ${varName}: ${displayValue}`);
  
  if (!value || value === 'your-api-key-here' || value.includes('your-')) {
    allPresent = false;
  }
});

console.log('\n🔧 Configuration Firebase complète:');
console.log('====================================');

const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_FIREBASE_APP_ID,
  databaseURL: envVars.VITE_FIREBASE_DATABASE_URL,
};

console.log(JSON.stringify(firebaseConfig, null, 2));

console.log('\n📊 Résultat du test:');
console.log('===================');

if (allPresent) {
  console.log('✅ Configuration Firebase complète et prête !');
  console.log('\n🚀 Vous pouvez maintenant:');
  console.log('1. Lancer le serveur de développement: npm run dev');
  console.log('2. Tester l\'application: http://localhost:5173');
  console.log('3. Déployer: npm run build && firebase deploy');
} else {
  console.log('❌ Configuration Firebase incomplète !');
  console.log('\n🔧 Actions nécessaires:');
  console.log('1. Allez sur la Console Firebase: https://console.firebase.google.com/project/musiqueconnect-ac841');
  console.log('2. Paramètres du projet > Général > Vos applications');
  console.log('3. Créez une application web si nécessaire');
  console.log('4. Copiez l\'API Key et l\'App ID');
  console.log('5. Mettez à jour le fichier .env.local');
  console.log('6. Relancez ce test: node scripts/test-firebase-config.cjs');
}

console.log('\n🔗 URLs utiles:');
console.log('===============');
console.log('🌐 Console Firebase: https://console.firebase.google.com/project/musiqueconnect-ac841');
console.log('🚀 Hosting URL: https://musiqueconnect-ac841.web.app');
console.log('🔐 Authentication: https://console.firebase.google.com/project/musiqueconnect-ac841/authentication');
console.log('📊 Firestore: https://console.firebase.google.com/project/musiqueconnect-ac841/firestore');
console.log('💾 Storage: https://console.firebase.google.com/project/musiqueconnect-ac841/storage');
console.log('🗄️  Realtime Database: https://console.firebase.google.com/project/musiqueconnect-ac841/database'); 