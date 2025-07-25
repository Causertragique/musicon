#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔥 Configuration Firebase - Assistant de configuration\n');

const questions = [
  {
    name: 'apiKey',
    question: 'Votre API Key Firebase: ',
    required: true
  },
  {
    name: 'authDomain',
    question: 'Votre Auth Domain Firebase (ex: votre-projet.firebaseapp.com): ',
    required: true
  },
  {
    name: 'projectId',
    question: 'Votre Project ID Firebase: ',
    required: true
  },
  {
    name: 'storageBucket',
    question: 'Votre Storage Bucket Firebase (ex: votre-projet.appspot.com): ',
    required: true
  },
  {
    name: 'messagingSenderId',
    question: 'Votre Messaging Sender ID Firebase: ',
    required: true
  },
  {
    name: 'appId',
    question: 'Votre App ID Firebase: ',
    required: true
  },
  {
    name: 'googleClientId',
    question: 'Votre Google Client ID (optionnel, appuyez sur Entrée pour ignorer): ',
    required: false
  },
  {
    name: 'microsoftClientId',
    question: 'Votre Microsoft Client ID (optionnel, appuyez sur Entrée pour ignorer): ',
    required: false
  }
];

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function runSetup() {
  const answers = {};

  for (const q of questions) {
    let answer;
    do {
      answer = await askQuestion(q.question);
      if (q.required && !answer) {
        console.log('❌ Cette valeur est requise. Veuillez la saisir.');
      }
    } while (q.required && !answer);
    
    answers[q.name] = answer;
  }

  // Générer le contenu du fichier .env.local
  const envContent = `# Configuration Firebase
VITE_FIREBASE_API_KEY=${answers.apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${answers.authDomain}
VITE_FIREBASE_PROJECT_ID=${answers.projectId}
VITE_FIREBASE_STORAGE_BUCKET=${answers.storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${answers.messagingSenderId}
VITE_FIREBASE_APP_ID=${answers.appId}

# Configuration Google OAuth
VITE_GOOGLE_CLIENT_ID=${answers.googleClientId || 'your-google-client-id'}

# Configuration Microsoft OAuth
VITE_MICROSOFT_CLIENT_ID=${answers.microsoftClientId || 'your-microsoft-client-id'}
`;

  // Écrire le fichier .env.local
  const envPath = path.join(__dirname, '.env.local');
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Configuration Firebase terminée !');
  console.log('📁 Fichier .env.local créé avec succès');
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Vérifiez que votre projet Firebase est configuré correctement');
  console.log('2. Activez Firestore Database dans la console Firebase');
  console.log('3. Configurez les règles de sécurité Firestore');
  console.log('4. Lancez l\'application avec : npm run dev');
  console.log('\n🚀 Pour déployer sur Vercel :');
  console.log('1. Ajoutez ces variables d\'environnement dans Vercel');
  console.log('2. Connectez votre projet GitHub à Vercel');
  console.log('3. Déployez !');

  rl.close();
}

runSetup().catch(console.error); 