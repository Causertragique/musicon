// Configuration Google OAuth
const config = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5174/auth/google/callback',
  scope: 'openid profile email',
};

// Interface pour la réponse Google
export interface GoogleAuthResponse {
  access_token: string;
  id_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

// Interface pour les informations utilisateur Google
export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

// Service d'authentification Google
export class GoogleAuthService {
  private static instance: GoogleAuthService;
  private clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  private clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';
  private redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5174/auth/google/callback';
  private scopes = [
    'openid',
    'profile',
    'email',
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.rosters.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.me',
    'https://www.googleapis.com/auth/classroom.profile.emails',
    'https://www.googleapis.com/auth/classroom.profile.photos'
  ];

  public static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService();
    }
    return GoogleAuthService.instance;
  }

  /**
   * Redirige vers l'authentification Google
   */
  public initiateAuth(): void {
    console.log('🔐 Début initiateAuth()');
    
    // Vérifier si nous sommes en mode démonstration
    const isDemoMode = this.clientId === 'test-google-client-id' || 
                       this.clientId === 'your-google-client-id' ||
                       !this.clientId;
    
    if (isDemoMode) {
      console.log('🎭 Mode démonstration - Authentification Google désactivée');
      alert('Mode démonstration activé. L\'authentification Google OAuth est désactivée.');
      return;
    }
    
    console.log('Client ID:', this.clientId ? '✅ Présent' : '❌ Manquant');
    console.log('Redirect URI:', this.redirectUri);
    console.log('Scopes:', this.scopes);
    
    if (!this.clientId) {
      console.error('❌ Client ID manquant - impossible de lancer l\'authentification');
      alert('Configuration Google manquante. Contactez l\'administrateur.');
      return;
    }
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', this.clientId);
    authUrl.searchParams.append('redirect_uri', this.redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', this.scopes.join(' '));
    authUrl.searchParams.append('access_type', 'offline');
    authUrl.searchParams.append('prompt', 'consent');

    console.log('🔗 URL d\'authentification générée:', authUrl.toString());
    console.log('🔄 Redirection vers Google...');
    
    window.location.href = authUrl.toString();
  }

  /**
   * Échange le code d'autorisation contre un token d'accès
   */
  public async exchangeCodeForToken(code: string): Promise<any> {
    try {
      // Log de debug pour vérifier les valeurs envoyées à Google
      console.log('Envoi à Google :', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      });

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur d'échange de token: ${response.status}`);
      }

      const tokenData = await response.json();

      // Stocker le token dans localStorage
      localStorage.setItem('google_access_token', tokenData.access_token);
      if (tokenData.refresh_token) {
        localStorage.setItem('google_refresh_token', tokenData.refresh_token);
      }
      localStorage.setItem('google_token_expiry', (Date.now() + tokenData.expires_in * 1000).toString());
      
      return tokenData;
    } catch (error) {
      console.error('Erreur lors de l\'échange du token:', error);
      throw error;
    }
  }

  /**
   * Rafraîchit le token d'accès
   */
  public async refreshAccessToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem('google_refresh_token');
      if (!refreshToken) {
        throw new Error('Aucun refresh token disponible');
      }
      console.log('Envoi à Google :', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur de rafraîchissement du token: ${response.status}`);
      }

      const tokenData = await response.json();
      
      // Mettre à jour le token stocké
      localStorage.setItem('google_access_token', tokenData.access_token);
      localStorage.setItem('google_token_expiry', (Date.now() + tokenData.expires_in * 1000).toString());

      return tokenData.access_token;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      throw error;
        }
  }

  /**
   * Récupère le token d'accès actuel
   */
  public async getAccessToken(): Promise<string> {
    const accessToken = localStorage.getItem('google_access_token');
    const tokenExpiry = localStorage.getItem('google_token_expiry');

    if (!accessToken) {
      throw new Error('Aucun token d\'accès disponible');
    }

    // Vérifier si le token a expiré
    if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
      return await this.refreshAccessToken();
    }

    return accessToken;
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  public isAuthenticated(): boolean {
    // Authentifié si un access_token est présent dans le localStorage
    const accessToken = localStorage.getItem('google_access_token');
    return !!accessToken;
  }

  /**
   * Déconnecte l'utilisateur
   */
  public logout(): void {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('google_token_expiry');
  }

  /**
   * Récupère les informations de l'utilisateur
   */
  public async getUserInfo(): Promise<any> {
    const accessToken = await this.getAccessToken();
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des informations utilisateur: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Gère le retour après authentification Google
   */
  public async handleAuthCallback(): Promise<void> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('Erreur lors de l\'authentification Google:', error);
      // Rediriger vers le dashboard avec un message d'erreur
      window.location.href = '/dashboard?error=google_auth_failed';
      return;
    }

    if (code) {
      try {
        console.log('Code d\'autorisation reçu, échange contre un token...');
        await this.exchangeCodeForToken(code);
        
        // Récupérer les informations utilisateur Google
        const userInfo = await this.getUserInfo();
        console.log('Informations utilisateur Google récupérées:', userInfo);
        
        // Synchroniser avec Firebase Auth
        try {
          const { signInWithCredential, GoogleAuthProvider } = await import('firebase/auth');
          const { auth } = await import('../config/firebase');
          
          // Créer un credential Firebase avec le token Google
          const credential = GoogleAuthProvider.credential(null, await this.getAccessToken());
          
          // Se connecter à Firebase avec le credential
          const userCredential = await signInWithCredential(auth, credential);
          console.log('Utilisateur connecté à Firebase:', userCredential.user);
          
          // Vérifier s'il y avait un import en attente
          const pendingImport = localStorage.getItem('pending_google_import');
          
          if (pendingImport === 'true') {
            console.log('Import en attente détecté, redirection vers le dashboard...');
            window.location.href = '/dashboard?import=pending';
          } else {
            console.log('Authentification Google + Firebase réussie, redirection vers le dashboard...');
            window.location.href = '/dashboard?auth=google_success';
          }
        } catch (firebaseError) {
          console.error('Erreur lors de la synchronisation avec Firebase:', firebaseError);
          // Même si Firebase échoue, on peut continuer avec Google OAuth
          window.location.href = '/dashboard?auth=google_only';
        }
    } catch (error) {
        console.error('Erreur lors de l\'échange du code:', error);
        window.location.href = '/dashboard?error=token_exchange_failed';
      }
    } else {
      // Pas de code, rediriger vers le dashboard
      window.location.href = '/dashboard';
    }
  }
}

export default GoogleAuthService.getInstance();