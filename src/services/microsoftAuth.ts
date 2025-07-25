// Service d'authentification Microsoft avec MSAL
import { PublicClientApplication, Configuration, AuthenticationResult } from '@azure/msal-browser';

// Protection contre les conflits MSAL
declare global {
  interface Window {
    msalInstance?: PublicClientApplication;
  }
}

// Configuration MSAL
const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common'}`,
    redirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI || window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  }
};

// Scopes requis pour Microsoft Teams
const loginRequest = {
  scopes: [
    'User.Read',
    'Group.Read.All',
    'Team.ReadBasic.All',
    'TeamMember.Read.All'
  ]
};

// Interface pour la réponse Microsoft
export interface MicrosoftAuthResponse {
  accessToken: string;
  idToken: string;
  account: {
    homeAccountId: string;
    environment: string;
    tenantId: string;
    username: string;
    localAccountId: string;
  };
}

// Interface pour les informations utilisateur Microsoft
export interface MicrosoftUserInfo {
  id: string;
  displayName: string;
  givenName: string;
  surname: string;
  userPrincipalName: string;
  mail: string;
  jobTitle?: string;
  officeLocation?: string;
  preferredLanguage?: string;
  mobilePhone?: string;
  businessPhones?: string[];
}

export class MicrosoftAuthService {
  private static instance: MicrosoftAuthService;
  private msalInstance: PublicClientApplication | null = null;

  private constructor() {
    // Vérifier si une instance MSAL existe déjà
    if (window.msalInstance) {
      console.warn('Instance MSAL déjà existante détectée, réutilisation...');
      this.msalInstance = window.msalInstance;
    } else {
      try {
        // Supprimer les erreurs MSAL avant la création
        this.suppressMSALErrors();
        
        this.msalInstance = new PublicClientApplication(msalConfig);
        window.msalInstance = this.msalInstance;
      } catch (error) {
        console.error('Erreur lors de la création de l\'instance MSAL:', error);
        throw error;
      }
    }
  }

  /**
   * Supprime les erreurs MSAL spécifiques
   */
  private suppressMSALErrors(): void {
    // Supprimer les erreurs MSIFrameController
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || '';
      if (message.includes('MSIFrameController') || 
          message.includes('ALREADY EXISTS') ||
          message.includes('MSAutoLoginController')) {
        return; // Ignorer ces erreurs
      }
      originalError.apply(console, args);
    };
  }

  public static getInstance(): MicrosoftAuthService {
    if (!MicrosoftAuthService.instance) {
      MicrosoftAuthService.instance = new MicrosoftAuthService();
    }
    return MicrosoftAuthService.instance;
  }

  /**
   * Initialise l'authentification Microsoft
   */
  public async initialize(): Promise<void> {
    try {
      if (!this.msalInstance) {
        throw new Error('Instance MSAL non initialisée');
      }
      
      // Vérifier si déjà initialisé
      if (this.msalInstance.getActiveAccount()) {
        console.log('MSAL déjà initialisé avec un compte actif');
        return;
      }

      await this.msalInstance.initialize();
      console.log('MSAL initialisé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation MSAL:', error);
      throw error;
    }
  }

  /**
   * Lance l'authentification Microsoft
   */
  public async initiateAuth(): Promise<AuthenticationResult> {
    try {
      if (!this.msalInstance) {
        await this.initialize();
      }

      if (!this.msalInstance) {
        throw new Error('Instance MSAL non disponible');
      }

      const response = await this.msalInstance.loginPopup(loginRequest);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'authentification Microsoft:', error);
      throw error;
    }
  }

  /**
   * Récupère le token d'accès actuel
   */
  public async getAccessToken(): Promise<string> {
    try {
      if (!this.msalInstance) {
        await this.initialize();
      }

      if (!this.msalInstance) {
        throw new Error('Instance MSAL non disponible');
      }

      const account = this.msalInstance.getAllAccounts()[0];
      if (!account) {
        throw new Error('Aucun compte Microsoft connecté');
      }

      const response = await this.msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: account
      });

      return response.accessToken;
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      throw error;
    }
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  public isAuthenticated(): boolean {
    try {
      if (!this.msalInstance) {
        return false;
      }
      const accounts = this.msalInstance.getAllAccounts();
      return accounts.length > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification d\'authentification:', error);
      return false;
    }
  }

  /**
   * Déconnecte l'utilisateur
   */
  public async logout(): Promise<void> {
    try {
      if (this.msalInstance) {
        await this.msalInstance.logoutPopup();
        // Nettoyer l'instance globale
        window.msalInstance = undefined;
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  }

  /**
   * Récupère les informations de l'utilisateur
   */
  public async getUserInfo(): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des informations utilisateur: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur:', error);
      throw error;
    }
  }
}

export default MicrosoftAuthService.getInstance();