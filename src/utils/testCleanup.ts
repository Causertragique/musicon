// Script de test pour vérifier le nettoyage des erreurs MSAL
export function testMSALCleanup(): void {
  console.log('🧪 Test du nettoyage MSAL...');
  
  // Simuler les erreurs MSAL
  console.error('MSIFrameController.js:14 windows.ms.IFrameController ALREADY EXISTS');
  console.error('MSAutoLoginController.js:1841 ERROR CAUGHT IN ON FOCUS HANDLER: processedFieldsOriginal is not iterable');
  console.log('Fetch finished loading: POST "https://play.google.com/log?format=json&hasfast=true&authuser=0"');
  
  // Tester une erreur normale (devrait s'afficher)
  console.error('Erreur normale de test - devrait s\'afficher');
  console.log('Log normal de test - devrait s\'afficher');
  
  console.log('✅ Test terminé - vérifiez la console');
}

// Fonction pour vérifier si le nettoyage est actif
export function checkCleanupStatus(): void {
  console.log('🔍 Vérification du statut du nettoyage...');
  
  // Vérifier si les fonctions de nettoyage sont en place
  const originalError = console.error;
  const originalLog = console.log;
  
  console.log('Fonctions console originales:', {
    error: typeof originalError,
    log: typeof originalLog
  });
  
  // Tester une erreur MSAL
  console.error('Test MSIFrameController ALREADY EXISTS');
  
  console.log('✅ Vérification terminée');
} 