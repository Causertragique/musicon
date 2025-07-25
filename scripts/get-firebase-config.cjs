#!/usr/bin/env node

/**
 * Script pour récupérer la configuration Firebase complète
 * Usage: node scripts/get-firebase-config.cjs
 */

const { execSync } = require('child_process');

console.log('🔧 Récupération de la Configuration Firebase');
console.log('============================================\n');

try {
  // Récupérer la configuration du projet actuel
  const projectId = execSync('firebase use --json', { encoding: 'utf8' });
  const project = JSON.parse(projectId);
  
  console.log(`📋 Projet actuel: ${project.current}\n`);
  
  // Récupérer les informations du projet
  console.log('🌐 Configuration Firebase Complète:');
  console.log('====================================');
  
  const config = {
    projectId: project.current,
    storageBucket: `${project.current}.firebasestorage.app`,
    databaseURL: `https://${project.current}-default-rtdb.firebaseio.com`,
    authDomain: `${project.current}.firebaseapp.com`,
    messagingSenderId: '844946743727', // ID du projet
    appId: '1:844946743727:web:your-app-id' // À remplacer par le vrai App ID
  };
  
  console.log('📄 Configuration JSON:');
  console.log(JSON.stringify(config, null, 2));
  
  console.log('\n📝 Variables d\'environnement (.env.local):');
  console.log('==========================================');
  console.log(`VITE_FIREBASE_API_KEY=your_api_key_here`);
  console.log(`VITE_FIREBASE_AUTH_DOMAIN=${config.authDomain}`);
  console.log(`VITE_FIREBASE_PROJECT_ID=${config.projectId}`);
  console.log(`VITE_FIREBASE_STORAGE_BUCKET=${config.storageBucket}`);
  console.log(`VITE_FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId}`);
  console.log(`VITE_FIREBASE_APP_ID=${config.appId}`);
  console.log(`VITE_FIREBASE_DATABASE_URL=${config.databaseURL}`);
  
  console.log('\n🔗 URLs importantes:');
  console.log('===================');
  console.log(`🌐 Console Firebase: https://console.firebase.google.com/project/${config.projectId}`);
  console.log(`🚀 Hosting URL: https://${config.projectId}.web.app`);
  console.log(`📊 Firestore: https://console.firebase.google.com/project/${config.projectId}/firestore`);
  console.log(`🔐 Authentication: https://console.firebase.google.com/project/${config.projectId}/authentication`);
  console.log(`💾 Storage: https://console.firebase.google.com/project/${config.projectId}/storage`);
  
  console.log('\n📋 Étapes pour compléter la configuration:');
  console.log('==========================================');
  console.log('1. Allez sur la Console Firebase');
  console.log('2. Cliquez sur l\'icône ⚙️ (Paramètres) > Paramètres du projet');
  console.log('3. Onglet "Général" > Section "Vos applications"');
  console.log('4. Cliquez sur l\'application web ou créez-en une');
  console.log('5. Copiez la configuration Firebase');
  console.log('6. Mettez à jour le fichier .env.local avec les vraies valeurs');
  
} catch (error) {
  console.error('❌ Erreur lors de la récupération de la configuration:', error.message);
  console.log('\n🔧 Solutions:');
  console.log('1. Assurez-vous d\'être connecté: firebase login');
  console.log('2. Vérifiez le projet: firebase projects:list');
  console.log('3. Sélectionnez le projet: firebase use musiqueconnect-ac841');
} 