#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Vérification de la configuration Google OAuth\n');

// Vérifier le fichier de configuration Firebase
const firebaseConfigPath = path.join(__dirname, '../src/config/firebase.ts');

if (fs.existsSync(firebaseConfigPath)) {
  console.log('✅ Fichier firebase.ts trouvé');
  
  const firebaseConfig = fs.readFileSync(firebaseConfigPath, 'utf8');
  
  // Vérifier la présence des clés Firebase
  const hasApiKey = firebaseConfig.includes('apiKey:');
  const hasAuthDomain = firebaseConfig.includes('authDomain:');
  const hasProjectId = firebaseConfig.includes('projectId:');
  
  console.log(`   - API Key: ${hasApiKey ? '✅' : '❌'}`);
  console.log(`   - Auth Domain: ${hasAuthDomain ? '✅' : '❌'}`);
  console.log(`   - Project ID: ${hasProjectId ? '✅' : '❌'}`);
  
  // Extraire le project ID
  const projectIdMatch = firebaseConfig.match(/projectId:\s*['"`]([^'"`]+)['"`]/);
  if (projectIdMatch) {
    const projectId = projectIdMatch[1];
    console.log(`   - Project ID détecté: ${projectId}`);
    
    console.log('\n📋 Étapes de configuration Google OAuth:');
    console.log('\n1. Firebase Console:');
    console.log(`   - Va sur: https://console.firebase.google.com/project/${projectId}/authentication/providers`);
    console.log('   - Active Google comme fournisseur');
    console.log('   - Ajoute ces domaines autorisés:');
    console.log('     * localhost');
    console.log('     * musiqueconnect.app');
    console.log(`     * ${projectId}.web.app`);
    
    console.log('\n2. Google Cloud Console:');
    console.log(`   - Va sur: https://console.cloud.google.com/apis/credentials?project=${projectId}`);
    console.log('   - Trouve ton OAuth 2.0 Client ID');
    console.log('   - Vérifie les "Authorized JavaScript origins":');
    console.log('     * https://musiqueconnect.app');
    console.log('     * http://localhost:5174');
    console.log(`     * https://${projectId}.web.app`);
    console.log('   - Vérifie les "Authorized redirect URIs":');
    console.log('     * https://musiqueconnect.app/__/auth/handler');
    console.log('     * http://localhost:5174/__/auth/handler');
    console.log(`     * https://${projectId}.web.app/__/auth/handler`);
    
    console.log('\n3. Test de connexion:');
    console.log('   - Lance le serveur: npm run dev');
    console.log('   - Va sur: http://localhost:5174/test-google');
    console.log('   - Clique sur "Tester Google Auth"');
    
  } else {
    console.log('❌ Project ID non trouvé dans la configuration');
  }
  
} else {
  console.log('❌ Fichier firebase.ts non trouvé');
}

console.log('\n🔧 Si tu as des erreurs:');
console.log('1. Vérifie que Google Auth est activé dans Firebase Console');
console.log('2. Vérifie que les domaines sont autorisés');
console.log('3. Vérifie que les redirect URIs sont corrects');
console.log('4. Assure-toi que le projet Google Cloud est le même que Firebase');
console.log('5. Vérifie que l\'API Google+ est activée dans Google Cloud Console');

console.log('\n📞 URLs importantes:');
console.log('- Firebase Auth: https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/providers');
console.log('- Google Cloud: https://console.cloud.google.com/apis/credentials?project=musiqueconnect-ac841');
console.log('- Test local: http://localhost:5174/test-google'); 