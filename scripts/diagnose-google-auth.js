#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Diagnostic complet de l\'authentification Google\n');

// 1. Vérifier la configuration Firebase
console.log('1. Configuration Firebase:');
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const apiKey = envContent.match(/VITE_FIREBASE_API_KEY=(.+)/)?.[1];
  const projectId = envContent.match(/VITE_FIREBASE_PROJECT_ID=(.+)/)?.[1];
  const authDomain = envContent.match(/VITE_FIREBASE_AUTH_DOMAIN=(.+)/)?.[1];
  const appId = envContent.match(/VITE_FIREBASE_APP_ID=(.+)/)?.[1];
  const googleClientId = envContent.match(/VITE_GOOGLE_CLIENT_ID=(.+)/)?.[1];
  
  console.log(`   ✅ API Key: ${apiKey?.substring(0, 10)}...`);
  console.log(`   ✅ Project ID: ${projectId}`);
  console.log(`   ✅ Auth Domain: ${authDomain}`);
  console.log(`   ${appId?.includes('your-app-id') ? '❌' : '✅'} App ID: ${appId}`);
  console.log(`   ${googleClientId?.includes('your-google-client-id') ? '❌' : '✅'} Google Client ID: ${googleClientId}`);
} else {
  console.log('   ❌ Fichier .env.local non trouvé');
}

// 2. Instructions de vérification
console.log('\n2. Vérifications à faire dans Firebase Console:');
console.log('   🔗 https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/providers');
console.log('   - Vérifier que Google est activé');
console.log('   - Dans "Domaines autorisés", ajouter:');
console.log('     * localhost');
console.log('     * localhost:5184');
console.log('     * musiqueconnect.app');
console.log('     * musiqueconnect-ac841.web.app');

console.log('\n3. Vérifications à faire dans Google Cloud Console:');
console.log('   🔗 https://console.cloud.google.com/apis/credentials?project=musiqueconnect-ac841');
console.log('   - Cliquer sur l\'OAuth 2.0 Client ID');
console.log('   - Dans "Authorized JavaScript origins", ajouter:');
console.log('     * http://localhost:5184');
console.log('     * https://musiqueconnect.app');
console.log('     * https://musiqueconnect-ac841.web.app');
console.log('   - Dans "Authorized redirect URIs", ajouter:');
console.log('     * http://localhost:5184/__/auth/handler');
console.log('     * https://musiqueconnect.app/__/auth/handler');
console.log('     * https://musiqueconnect-ac841.web.app/__/auth/handler');

console.log('\n4. APIs à activer dans Google Cloud:');
console.log('   🔗 https://console.cloud.google.com/apis/library?project=musiqueconnect-ac841');
console.log('   - Identity Toolkit API');
console.log('   - Firebase Authentication API');

console.log('\n5. Test de diagnostic:');
console.log('   - Redémarrer le serveur: npm run dev');
console.log('   - Vider le cache du navigateur');
console.log('   - Aller sur: http://localhost:5184/test-google');
console.log('   - Ouvrir la console (F12) et regarder les erreurs réseau');

console.log('\n🔧 Solutions possibles:');
console.log('1. Le port 5184 n\'est pas autorisé');
console.log('2. Les APIs ne sont pas activées');
console.log('3. Le Google Client ID est incorrect');
console.log('4. Les redirect URIs sont mal configurés');
console.log('5. Le domaine localhost n\'est pas autorisé');

console.log('\n📞 URLs importantes:');
console.log('- Firebase Auth: https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/providers');
console.log('- Google Cloud: https://console.cloud.google.com/apis/credentials?project=musiqueconnect-ac841');
console.log('- APIs Library: https://console.cloud.google.com/apis/library?project=musiqueconnect-ac841'); 