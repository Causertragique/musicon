#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌐 Vérification de la configuration Cloudflare pour musiqueconnect.app...\n');

// Fonction pour vérifier les enregistrements DNS
const checkDNSRecords = () => {
  console.log('📋 Vérification des enregistrements DNS...\n');
  
  try {
    // Vérifier les enregistrements A
    console.log('🔍 Enregistrements A:');
    execSync('dig +short musiqueconnect.app A', { stdio: 'inherit' });
    
    console.log('\n🔍 Enregistrements CNAME (www):');
    execSync('dig +short www.musiqueconnect.app CNAME', { stdio: 'inherit' });
    
    console.log('\n🔍 Enregistrements MX:');
    execSync('dig +short musiqueconnect.app MX', { stdio: 'inherit' });
    
    console.log('\n🔍 Enregistrements TXT:');
    execSync('dig +short musiqueconnect.app TXT', { stdio: 'inherit' });
    
  } catch (error) {
    console.log('⚠️  Impossible de vérifier les enregistrements DNS (dig non disponible)');
  }
};

// Fonction pour vérifier la connectivité
const checkConnectivity = () => {
  console.log('\n🌐 Vérification de la connectivité...\n');
  
  try {
    console.log('🔍 Test de connectivité vers musiqueconnect.app:');
    execSync('curl -I https://musiqueconnect.app', { stdio: 'inherit' });
  } catch (error) {
    console.log('❌ Erreur de connectivité vers musiqueconnect.app');
    console.log('💡 Vérifiez que le domaine est bien configuré dans Cloudflare');
  }
};

// Fonction pour vérifier SSL/TLS
const checkSSL = () => {
  console.log('\n🔒 Vérification SSL/TLS...\n');
  
  try {
    console.log('🔍 Test SSL vers musiqueconnect.app:');
    execSync('curl -I --ssl-no-revoke https://musiqueconnect.app', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  Impossible de vérifier SSL (curl non disponible)');
  }
};

// Fonction pour vérifier les headers de sécurité
const checkSecurityHeaders = () => {
  console.log('\n🛡️  Vérification des headers de sécurité...\n');
  
  try {
    console.log('🔍 Headers de sécurité:');
    execSync('curl -I -s https://musiqueconnect.app | grep -E "(Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options|Referrer-Policy)"', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  Impossible de vérifier les headers de sécurité');
  }
};

// Guide de configuration Cloudflare
const showCloudflareGuide = () => {
  console.log('\n📚 GUIDE DE CONFIGURATION CLOUDFLARE\n');
  console.log('1️⃣  Accédez à Cloudflare Dashboard:');
  console.log('   https://dash.cloudflare.com/\n');
  
  console.log('2️⃣  Sélectionnez votre domaine: musiqueconnect.app\n');
  
  console.log('3️⃣  Configuration DNS (dans l\'onglet "DNS"):');
  console.log('   ✅ Type: A');
  console.log('   ✅ Name: @');
  console.log('   ✅ Content: 76.76.19.36 (Vercel)');
  console.log('   ✅ Proxy status: Proxied (orange cloud)\n');
  
  console.log('   ✅ Type: CNAME');
  console.log('   ✅ Name: www');
  console.log('   ✅ Content: cname.vercel-dns.com');
  console.log('   ✅ Proxy status: Proxied (orange cloud)\n');
  
  console.log('4️⃣  Configuration SSL/TLS (dans l\'onglet "SSL/TLS"):');
  console.log('   ✅ Mode: Full (strict)');
  console.log('   ✅ Always Use HTTPS: Activé');
  console.log('   ✅ Minimum TLS Version: TLS 1.2\n');
  
  console.log('5️⃣  Configuration Sécurité (dans l\'onglet "Security"):');
  console.log('   ✅ Security Level: Medium');
  console.log('   ✅ Browser Integrity Check: Activé');
  console.log('   ✅ Rate Limiting: Configuré\n');
  
  console.log('6️⃣  Configuration Performance (dans l\'onglet "Speed"):');
  console.log('   ✅ Auto Minify: JavaScript, CSS, HTML');
  console.log('   ✅ Brotli: Activé');
  console.log('   ✅ Rocket Loader: Activé\n');
  
  console.log('7️⃣  Page Rules (dans l\'onglet "Rules"):');
  console.log('   ✅ URL: musiqueconnect.app/*');
  console.log('   ✅ Settings:');
  console.log('      - Always Use HTTPS');
  console.log('      - Security Level: Medium');
  console.log('      - Browser Integrity Check\n');
};

// Vérification des domaines autorisés Firebase
const checkFirebaseDomains = () => {
  console.log('\n🔥 VÉRIFICATION FIREBASE DOMAINES AUTORISÉS\n');
  console.log('1️⃣  Accédez à Firebase Console:');
  console.log('   https://console.firebase.google.com/project/musiqueconnect-ac841/authentication/providers\n');
  
  console.log('2️⃣  Dans "Domaines autorisés", vérifiez que vous avez:');
  console.log('   ✅ localhost');
  console.log('   ✅ musiqueconnect.app');
  console.log('   ✅ *.vercel.app');
  console.log('   ✅ *.netlify.app\n');
  
  console.log('3️⃣  Si le domaine n\'est pas listé, ajoutez-le manuellement.\n');
};

// Vérification Google OAuth
const checkGoogleOAuth = () => {
  console.log('\n🔐 VÉRIFICATION GOOGLE OAUTH\n');
  console.log('1️⃣  Accédez à Google Cloud Console:');
  console.log('   https://console.cloud.google.com/apis/credentials\n');
  
  console.log('2️⃣  Vérifiez votre client OAuth 2.0:');
  console.log('   ✅ Authorized JavaScript origins:');
  console.log('      - https://musiqueconnect.app');
  console.log('      - http://localhost:5174\n');
  
  console.log('   ✅ Authorized redirect URIs:');
  console.log('      - https://musiqueconnect.app/__/auth/handler');
  console.log('      - http://localhost:5174/__/auth/handler\n');
};

// Exécution des vérifications
const main = () => {
  console.log('🎵 MusiqueConnect - Vérification Cloudflare\n');
  
  checkDNSRecords();
  checkConnectivity();
  checkSSL();
  checkSecurityHeaders();
  
  showCloudflareGuide();
  checkFirebaseDomains();
  checkGoogleOAuth();
  
  console.log('\n✅ Vérification terminée !');
  console.log('📖 Consultez les guides ci-dessus pour corriger les problèmes détectés.\n');
  
  console.log('🚀 Prochaines étapes:');
  console.log('1. Configurez Cloudflare selon le guide');
  console.log('2. Vérifiez les domaines Firebase');
  console.log('3. Testez la connexion Google');
  console.log('4. Redémarrez l\'application: npm run dev\n');
};

main(); 