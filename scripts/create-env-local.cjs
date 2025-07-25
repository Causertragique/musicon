#!/usr/bin/env node

/**
 * Script pour créer le fichier .env.local avec la configuration Firebase
 * Usage: node scripts/create-env-local.cjs
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Création du fichier .env.local');
console.log('==================================\n');

const envContent = `# Configuration Firebase
VITE_FIREBASE_API_KEY=AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=musiqueconnect-ac841.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=musiqueconnect-ac841
VITE_FIREBASE_STORAGE_BUCKET=musiqueconnect-ac841.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=844946743727
VITE_FIREBASE_APP_ID=1:844946743727:web:your-app-id-here
VITE_FIREBASE_DATABASE_URL=https://musiqueconnect-ac841-default-rtdb.firebaseio.com

# Configuration Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Configuration Microsoft OAuth
VITE_MICROSOFT_CLIENT_ID=your-microsoft-client-id-here
VITE_MICROSOFT_TENANT_ID=your-microsoft-tenant-id-here

# Configuration Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key-here
VITE_STRIPE_SECRET_KEY=sk_test_your-stripe-secret-here

# Configuration de l'application
VITE_APP_NAME=MusiqueConnect
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
`;

const envPath = path.join(process.cwd(), '.env.local');

try {
  // Vérifier si le fichier existe déjà
  if (fs.existsSync(envPath)) {
    console.log('⚠️  Le fichier .env.local existe déjà.');
    console.log('📝 Voulez-vous le remplacer ? (y/N)');
    
    // En mode automatique, on remplace
    console.log('🔄 Remplacement automatique du fichier .env.local...');
  }
  
  // Écrire le fichier
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Fichier .env.local créé avec succès !');
  console.log(`📁 Emplacement: ${envPath}`);
  
  console.log('\n📋 Prochaines étapes:');
  console.log('=====================');
  console.log('1. Allez sur la Console Firebase: https://console.firebase.google.com/project/musiqueconnect-ac841');
  console.log('2. Paramètres du projet > Général > Vos applications');
  console.log('3. Créez une application web si nécessaire');
  console.log('4. Copiez l\'API Key et l\'App ID');
  console.log('5. Remplacez les valeurs dans .env.local');
  console.log('6. Testez avec: npm run dev');
  
  console.log('\n🔗 URLs importantes:');
  console.log('===================');
  console.log('🌐 Console Firebase: https://console.firebase.google.com/project/musiqueconnect-ac841');
  console.log('🚀 Hosting URL: https://musiqueconnect-ac841.web.app');
  console.log('🔐 Authentication: https://console.firebase.google.com/project/musiqueconnect-ac841/authentication');
  
} catch (error) {
  console.error('❌ Erreur lors de la création du fichier .env.local:', error.message);
  console.log('\n🔧 Solutions:');
  console.log('1. Vérifiez les permissions du dossier');
  console.log('2. Créez manuellement le fichier .env.local');
  console.log('3. Copiez le contenu ci-dessus');
} 