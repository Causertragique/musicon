#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Configuration de l\'authentification Google pour Firebase...\n');

// Vérifier si Firebase CLI est installé
try {
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI détecté');
} catch (error) {
  console.error('❌ Firebase CLI non trouvé. Installez-le avec: npm install -g firebase-tools');
  process.exit(1);
}

// Vérifier si l'utilisateur est connecté
try {
  execSync('firebase auth:export --project musiqueconnect-ac841', { stdio: 'pipe' });
  console.log('✅ Connexion Firebase vérifiée');
} catch (error) {
  console.error('❌ Vous devez être connecté à Firebase. Exécutez: firebase login');
  process.exit(1);
}

console.log('\n📋 Étapes pour activer l\'authentification Google:\n');

console.log('1️⃣  Ouvrez la console Firebase:');
console.log('   https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/providers\n');

console.log('2️⃣  Cliquez sur "Google" dans la liste des fournisseurs\n');

console.log('3️⃣  Activez Google comme fournisseur d\'authentification:\n');
console.log('   ☑️  Cochez "Activer"');
console.log('   📧 Ajoutez votre email comme utilisateur de test (optionnel)');
console.log('   💾 Cliquez sur "Enregistrer"\n');

console.log('4️⃣  Configurez les domaines autorisés:\n');
console.log('   🌐 Ajoutez ces domaines dans "Domaines autorisés":');
console.log('      - localhost');
console.log('      - musiqueconnect.app');
console.log('      - *.vercel.app');
console.log('      - *.netlify.app\n');

console.log('5️⃣  Testez la connexion:\n');
console.log('   🚀 Lancez l\'application: npm run dev');
console.log('   🔐 Essayez de vous connecter avec Google\n');

console.log('📚 Documentation complète:');
console.log('   https://firebase.google.com/docs/auth/web/google-signin\n');

console.log('⚠️  Notes importantes:');
console.log('   - L\'authentification Google nécessite HTTPS en production');
console.log('   - Les domaines autorisés doivent être configurés correctement');
console.log('   - Les utilisateurs Google seront automatiquement créés dans Firestore\n');

console.log('🎯 Une fois configuré, l\'authentification Google fonctionnera automatiquement !\n');

// Vérifier si le fichier de configuration existe
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ Fichier .env.local trouvé');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('VITE_FIREBASE_API_KEY')) {
    console.log('✅ Configuration Firebase détectée');
  } else {
    console.log('⚠️  Configuration Firebase manquante dans .env.local');
  }
} else {
  console.log('⚠️  Fichier .env.local non trouvé');
}

console.log('\n🎵 MusiqueConnect - Configuration Google Auth terminée !'); 