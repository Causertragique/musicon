import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Vérifier si nous sommes en mode démonstration (clés de test)
const isDemoMode = firebaseConfig.apiKey === 'test-api-key' || 
                   firebaseConfig.apiKey === 'your-api-key-here' ||
                   !firebaseConfig.apiKey;

let app: any = null;
let db: any = null;
let auth: any = null;

if (!isDemoMode) {
  // Mode Firebase réel
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('✅ Firebase initialisé en mode réel');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation Firebase:', error);
    console.log('🔄 Passage en mode démonstration');
  }
} else {
  console.log('🎭 Mode démonstration activé - Firebase désactivé');
}

// Firebase App Check (optionnel - décommentez si nécessaire)
// if (typeof window !== 'undefined') {
//   // Mode debug pour le développement
//   (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
//   
//   // initializeAppCheck(app, {
//   //   provider: new ReCaptchaV3Provider('your-recaptcha-site-key'),
//   //   isTokenAutoRefreshEnabled: true
//   // });
// }

export { db, auth };
export default app; 