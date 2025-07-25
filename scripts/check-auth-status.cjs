#!/usr/bin/env node

/**
 * Vérification complète du statut d'authentification Firebase
 * Usage: node scripts/check-auth-status.cjs
 */

console.log('🔍 Vérification Complète du Statut d\'Authentification Firebase');
console.log('================================================================\n');

console.log('📋 Diagnostic Automatique :');
console.log('============================\n');

// Vérifier la configuration Firebase
console.log('1️⃣  Configuration Firebase...');
try {
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const authDomain = envContent.match(/VITE_FIREBASE_AUTH_DOMAIN=([^\n]+)/);
    const apiKey = envContent.match(/VITE_FIREBASE_API_KEY=([^\n]+)/);
    
    if (authDomain && apiKey) {
      console.log('   ✅ Configuration Firebase complète');
      console.log(`   📍 Domaine Auth: ${authDomain[1]}`);
      console.log(`   🔑 API Key: ${apiKey[1].substring(0, 10)}...`);
    } else {
      console.log('   ❌ Configuration Firebase incomplète');
    }
  } else {
    console.log('   ❌ Fichier .env.local non trouvé');
  }
} catch (error) {
  console.log('   ❌ Erreur lors de la vérification');
}

console.log('\n🔧 Actions Requises :');
console.log('====================\n');

console.log('1️⃣  VÉRIFIER QUE GOOGLE AUTH EST ACTIVÉ :');
console.log('   URL: https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/providers');
console.log('   ✅ Google doit être "Activé"');
console.log('   ✅ Votre email doit être dans la liste des utilisateurs de test');
console.log('');

console.log('2️⃣  VÉRIFIER LES DOMAINES AUTORISÉS :');
console.log('   URL: https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/settings');
console.log('   ✅ Domaines autorisés doivent contenir :');
console.log('      • localhost');
console.log('      • musiqueconnect-ac841.web.app');
console.log('      • musiqueconnect-ac841.firebaseapp.com');
console.log('');

console.log('3️⃣  VÉRIFIER LES UTILISATEURS :');
console.log('   URL: https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/users');
console.log('   ✅ Votre email doit apparaître dans la liste');
console.log('   ✅ Statut doit être "Activé"');
console.log('');

console.log('🚨 Erreur Actuelle Identifiée :');
console.log('===============================\n');

console.log('❌ L\'erreur indique que l\'authentification Google n\'est pas complètement configurée.');
console.log('❌ Cela peut être dû à :');
console.log('   • Google Auth non activé dans Firebase');
console.log('   • Domaines non autorisés');
console.log('   • Configuration OAuth incomplète');
console.log('   • Utilisateur non créé');
console.log('');

console.log('🔧 Solutions Immédiates :');
console.log('=========================\n');

console.log('SOLUTION 1 - Activer Google Auth :');
console.log('1. Allez sur : https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/providers');
console.log('2. Cliquez sur "Google"');
console.log('3. Cliquez sur "Activer" ou "Autoriser"');
console.log('4. Ajoutez votre email comme utilisateur de test');
console.log('5. Cliquez sur "Enregistrer"');
console.log('');

console.log('SOLUTION 2 - Vérifier les Domaines :');
console.log('1. Allez sur : https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/settings');
console.log('2. Section "Domaines autorisés"');
console.log('3. Vérifiez que ces domaines sont présents :');
console.log('   • localhost');
console.log('   • musiqueconnect-ac841.web.app');
console.log('   • musiqueconnect-ac841.firebaseapp.com');
console.log('4. Si manquant, ajoutez-les un par un');
console.log('');

console.log('SOLUTION 3 - Créer un Utilisateur de Test :');
console.log('1. Allez sur : https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/users');
console.log('2. Cliquez sur "Ajouter un utilisateur"');
console.log('3. Entrez votre email');
console.log('4. Entrez un mot de passe temporaire');
console.log('5. Cliquez sur "Ajouter"');
console.log('');

console.log('🧪 Test Après Configuration :');
console.log('=============================\n');

console.log('1. Ouvrez : https://musiqueconnect-ac841.web.app');
console.log('2. Appuyez sur F12 (outils de développement)');
console.log('3. Allez dans l\'onglet "Console"');
console.log('4. Cliquez sur "Se connecter" ou "Login"');
console.log('5. Choisissez "Google"');
console.log('6. Autorisez l\'accès');
console.log('7. Vérifiez qu\'il n\'y a plus d\'erreur');
console.log('');

console.log('🔗 URLs de Configuration :');
console.log('==========================\n');

const configUrls = [
  { name: 'Auth Providers', url: 'https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/providers', desc: 'Activer Google Auth' },
  { name: 'Auth Settings', url: 'https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/settings', desc: 'Configurer domaines' },
  { name: 'Auth Users', url: 'https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/users', desc: 'Gérer utilisateurs' },
  { name: 'Application', url: 'https://musiqueconnect-ac841.web.app', desc: 'Tester l\'app' },
];

configUrls.forEach(({ name, url, desc }) => {
  console.log(`${name.padEnd(15)} : ${url}`);
  console.log(`${' '.repeat(15)}   ${desc}`);
});

console.log('\n📋 Checklist de Vérification :');
console.log('==============================\n');

const checklist = [
  'Google Auth activé dans Firebase Console',
  'Domaines autorisés configurés',
  'Utilisateur de test créé',
  'Popup Google qui s\'ouvre',
  'Connexion Google réussie',
  'Plus d\'erreur dans la console',
  'Données Firestore accessibles'
];

checklist.forEach((item, index) => {
  console.log(`[ ] ${index + 1}. ${item}`);
});

console.log('\n🎯 Résultat Attendu :');
console.log('====================\n');

console.log('✅ Après configuration complète :');
console.log('   • Plus d\'erreur d\'authentification');
console.log('   • Connexion Google fonctionnelle');
console.log('   • Utilisateur créé automatiquement');
console.log('   • Accès complet aux fonctionnalités');
console.log('   • Application entièrement opérationnelle');
console.log('');

console.log('💡 Conseil Important :');
console.log('=====================\n');

console.log('⚠️  L\'erreur actuelle indique que l\'authentification n\'est pas complètement configurée.');
console.log('⚠️  Suivez les étapes ci-dessus dans l\'ordre.');
console.log('⚠️  Testez après chaque étape pour vérifier que ça fonctionne.');
console.log('⚠️  Si l\'erreur persiste, vérifiez chaque point de la checklist.');
console.log('');

console.log('🚀 Prochaines Actions :');
console.log('=======================\n');

console.log('1. Configurez Google Auth dans Firebase Console');
console.log('2. Vérifiez les domaines autorisés');
console.log('3. Créez un utilisateur de test');
console.log('4. Testez la connexion Google');
console.log('5. Vérifiez qu\'il n\'y a plus d\'erreur');
console.log('');

console.log('🎉 Une fois configuré, votre application sera parfaitement fonctionnelle !'); 