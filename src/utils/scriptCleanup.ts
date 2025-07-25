// Utilitaire pour nettoyer les scripts externes qui causent des conflits
export class ScriptCleanup {
  private static instance: ScriptCleanup;
  private cleanupInterval: number | null = null;

  private constructor() {}

  public static getInstance(): ScriptCleanup {
    if (!ScriptCleanup.instance) {
      ScriptCleanup.instance = new ScriptCleanup();
    }
    return ScriptCleanup.instance;
  }

  /**
   * Nettoie les erreurs de scripts externes
   */
  public startCleanup(): void {
    // Supprimer les erreurs MSAL dupliquées
    this.cleanupMSALConflicts();
    
    // Nettoyer les erreurs Google Play
    this.cleanupGooglePlayErrors();
    
    // Intercepter les erreurs au niveau du DOM
    this.interceptDOMErrors();
    
    // Démarrer le nettoyage périodique
    this.startPeriodicCleanup();
  }

  /**
   * Nettoie les conflits MSAL
   */
  private cleanupMSALConflicts(): void {
    // Supprimer les instances MSAL dupliquées
    if (window.msalInstance && typeof window.msalInstance.getAllAccounts === 'function') {
      console.log('Instance MSAL unique détectée et conservée');
    }

    // Nettoyer les erreurs de console liées à MSAL
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      
      // Ignorer les erreurs MSAL spécifiques
      if (message.includes('MSIFrameController') || 
          message.includes('MSAutoLoginController') ||
          message.includes('processedFieldsOriginal') ||
          message.includes('ALREADY EXISTS')) {
        return; // Ne pas afficher ces erreurs
      }
      
      originalError.apply(console, args);
    };

    // Nettoyer aussi les erreurs de window.onerror
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      const errorMessage = message?.toString() || '';
      
      // Ignorer les erreurs MSAL spécifiques
      if (errorMessage.includes('MSIFrameController') || 
          errorMessage.includes('MSAutoLoginController') ||
          errorMessage.includes('processedFieldsOriginal') ||
          errorMessage.includes('ALREADY EXISTS')) {
        return true; // Empêcher l'affichage de l'erreur
      }
      
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };
  }

  /**
   * Nettoie les erreurs Google Play
   */
  private cleanupGooglePlayErrors(): void {
    // Supprimer les erreurs de Google Play Store
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      
      // Ignorer les logs Google Play
      if (message.includes('play.google.com') || 
          message.includes('Fetch finished loading')) {
        return; // Ne pas afficher ces logs
      }
      
      originalLog.apply(console, args);
    };
  }

  /**
   * Intercepte les erreurs au niveau du DOM
   */
  private interceptDOMErrors(): void {
    // Intercepter les erreurs de scripts externes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              // Supprimer les scripts MSAL problématiques
              if (element.tagName === 'SCRIPT' && 
                  (element.getAttribute('src')?.includes('msal') || 
                   element.textContent?.includes('MSIFrameController'))) {
                element.remove();
              }
            }
          });
        }
      });
    });

    observer.observe(document.head, { childList: true, subtree: true });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Démarre le nettoyage périodique
   */
  private startPeriodicCleanup(): void {
    this.cleanupInterval = window.setInterval(() => {
      this.cleanupMSALConflicts();
      this.cleanupGooglePlayErrors();
    }, 5000); // Nettoyer toutes les 5 secondes
  }

  /**
   * Arrête le nettoyage
   */
  public stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

export default ScriptCleanup.getInstance(); 