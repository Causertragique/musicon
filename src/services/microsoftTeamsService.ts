// Service d'intégration Microsoft Teams
import { MicrosoftAuthService } from './microsoftAuth';

// Interfaces pour Microsoft Teams
export interface MicrosoftTeamsTeam {
  id: string;
  displayName: string;
  description: string;
  visibility: string;
  mail: string;
  createdDateTime: string;
  updatedDateTime: string;
  webUrl: string;
  isArchived: boolean;
  memberSettings: {
    allowCreateUpdateChannels: boolean;
    allowDeleteChannels: boolean;
    allowAddRemoveApps: boolean;
    allowCreateUpdateRemoveTabs: boolean;
    allowCreateUpdateRemoveConnectors: boolean;
  };
  guestSettings: {
    allowCreateUpdateChannels: boolean;
    allowDeleteChannels: boolean;
  };
  messagingSettings: {
    allowUserEditMessages: boolean;
    allowUserDeleteMessages: boolean;
    allowOwnerDeleteMessages: boolean;
    allowTeamMentions: boolean;
    allowChannelMentions: boolean;
  };
  funSettings: {
    allowGiphy: boolean;
    giphyContentRating: string;
    allowStickersAndMemes: boolean;
    allowCustomMemes: boolean;
  };
}

export interface MicrosoftTeamsMember {
  id: string;
  displayName: string;
  givenName: string;
  surname: string;
  email: string;
  userPrincipalName: string;
  jobTitle: string;
  department: string;
  officeLocation: string;
  mobilePhone: string;
  businessPhones: string[];
  photoUrl?: string;
  roles: string[];
  tenantId: string;
}

export interface MicrosoftTeamsChannel {
  id: string;
  displayName: string;
  description: string;
  email: string;
  webUrl: string;
  membershipType: string;
  createdDateTime: string;
  isFavoriteByDefault: boolean;
}

export class MicrosoftTeamsService {
  private static instance: MicrosoftTeamsService;
  private baseUrl = 'https://graph.microsoft.com/v1.0';

  public static getInstance(): MicrosoftTeamsService {
    if (!MicrosoftTeamsService.instance) {
      MicrosoftTeamsService.instance = new MicrosoftTeamsService();
    }
    return MicrosoftTeamsService.instance;
  }

  /**
   * Récupère la liste des équipes Microsoft Teams
   */
  public async getTeams(): Promise<MicrosoftTeamsTeam[]> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/me/joinedTeams`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API Microsoft Teams: ${response.status}`);
      }

      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des équipes:', error);
      throw error;
    }
  }

  /**
   * Récupère les membres d'une équipe spécifique
   */
  public async getTeamMembers(teamId: string): Promise<MicrosoftTeamsMember[]> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/teams/${teamId}/members`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API Microsoft Teams: ${response.status}`);
      }

      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des membres:', error);
      throw error;
    }
  }

  /**
   * Récupère les canaux d'une équipe
   */
  public async getTeamChannels(teamId: string): Promise<MicrosoftTeamsChannel[]> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/teams/${teamId}/channels`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API Microsoft Teams: ${response.status}`);
      }

      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des canaux:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau canal dans une équipe
   */
  public async createChannel(
    teamId: string,
    displayName: string,
    description: string = ''
  ): Promise<MicrosoftTeamsChannel> {
    try {
      const accessToken = await this.getAccessToken();
      const channel = {
        displayName,
        description,
        membershipType: 'standard',
      };

      const response = await fetch(`${this.baseUrl}/teams/${teamId}/channels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(channel),
      });

      if (!response.ok) {
        throw new Error(`Erreur API Microsoft Teams: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création du canal:', error);
      throw error;
    }
  }

  /**
   * Envoie un message dans un canal
   */
  public async sendMessage(
    teamId: string,
    channelId: string,
    content: string
  ): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const message = {
        body: {
          content,
          contentType: 'html',
        },
      };

      const response = await fetch(
        `${this.baseUrl}/teams/${teamId}/channels/${channelId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur API Microsoft Teams: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  }

  /**
   * Synchronise les équipes avec MusiqueConnect
   */
  public async syncTeamsWithMusiqueConnect(): Promise<void> {
    try {
      const teams = await this.getTeams();
      
      for (const team of teams) {
        // Récupérer les membres de l'équipe
        const members = await this.getTeamMembers(team.id);
        
        // Créer ou mettre à jour le groupe dans MusiqueConnect
        await this.createOrUpdateGroup(team, members);
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation Teams:', error);
      throw error;
    }
  }

  /**
   * Crée ou met à jour un groupe dans MusiqueConnect
   */
  private async createOrUpdateGroup(
    team: MicrosoftTeamsTeam,
    members: MicrosoftTeamsMember[]
  ): Promise<void> {
    // Cette fonction sera implémentée pour synchroniser avec la base de données MusiqueConnect
    console.log('Synchronisation de l\'équipe:', team.displayName);
    console.log('Nombre de membres:', members.length);
    
    // TODO: Implémenter la synchronisation avec la base de données Firebase
  }

  /**
   * Récupère le token d'accès Microsoft
   */
  private async getAccessToken(): Promise<string> {
    try {
      const { MicrosoftAuthService } = await import('./microsoftAuth');
      const authService = MicrosoftAuthService.getInstance();
      
      // Initialiser MSAL si nécessaire
      if (!authService.isAuthenticated()) {
        await authService.initiateAuth();
      }
      
      return await authService.getAccessToken();
    } catch (error) {
      console.error('Erreur lors de la récupération du token Microsoft:', error);
      throw new Error('Authentification Microsoft requise');
    }
  }
}

export default MicrosoftTeamsService.getInstance(); 