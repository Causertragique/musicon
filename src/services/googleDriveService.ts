// Service d'intégration Google Drive
import { GoogleAuthService } from './googleAuth';

// Interfaces pour Google Drive
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  parents?: string[];
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  permissions?: GoogleDrivePermission[];
}

export interface GoogleDrivePermission {
  id: string;
  type: 'user' | 'group' | 'domain' | 'anyone';
  role: 'owner' | 'organizer' | 'fileOrganizer' | 'writer' | 'commenter' | 'reader';
  emailAddress?: string;
  domain?: string;
  allowFileDiscovery?: boolean;
}

export interface GoogleDriveFolder {
  id: string;
  name: string;
  mimeType: 'application/vnd.google-apps.folder';
  createdTime: string;
  modifiedTime: string;
  parents?: string[];
  webViewLink?: string;
}

export class GoogleDriveService {
  private static instance: GoogleDriveService;
  private baseUrl = 'https://www.googleapis.com/drive/v3';

  public static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  /**
   * Crée un dossier dans Google Drive
   */
  public async createFolder(name: string, parentId?: string): Promise<GoogleDriveFolder> {
    try {
      const accessToken = await this.getAccessToken();
      const folderMetadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentId && { parents: [parentId] }),
      };

      const response = await fetch(`${this.baseUrl}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(folderMetadata),
      });

      if (!response.ok) {
        throw new Error(`Erreur API Google Drive: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error);
      throw error;
    }
  }

  /**
   * Télécharge un fichier vers Google Drive
   */
  public async uploadFile(
    file: File,
    folderId?: string,
    fileName?: string
  ): Promise<GoogleDriveFile> {
    try {
      const accessToken = await this.getAccessToken();
      const metadata = {
        name: fileName || file.name,
        ...(folderId && { parents: [folderId] }),
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch(`${this.baseUrl}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: form,
      });

      if (!response.ok) {
        throw new Error(`Erreur API Google Drive: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error);
      throw error;
    }
  }

  /**
   * Récupère la liste des fichiers d'un dossier
   */
  public async listFiles(folderId?: string): Promise<GoogleDriveFile[]> {
    try {
      const accessToken = await this.getAccessToken();
      let url = `${this.baseUrl}/files?fields=files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,webContentLink,thumbnailLink)`;
      
      if (folderId) {
        url += `&q='${folderId}'+in+parents`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API Google Drive: ${response.status}`);
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers:', error);
      throw error;
    }
  }

  /**
   * Partage un fichier ou dossier
   */
  public async shareFile(
    fileId: string,
    email: string,
    role: 'reader' | 'commenter' | 'writer' = 'reader'
  ): Promise<GoogleDrivePermission> {
    try {
      const accessToken = await this.getAccessToken();
      const permission = {
        type: 'user',
        role,
        emailAddress: email,
      };

      const response = await fetch(`${this.baseUrl}/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permission),
      });

      if (!response.ok) {
        throw new Error(`Erreur API Google Drive: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors du partage du fichier:', error);
      throw error;
    }
  }

  /**
   * Supprime un fichier ou dossier
   */
  public async deleteFile(fileId: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API Google Drive: ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      throw error;
    }
  }

  /**
   * Crée la structure de dossiers PFEQ
   */
  public async createPFEQFolderStructure(): Promise<{
    rootFolder: GoogleDriveFolder;
    subFolders: { [key: string]: GoogleDriveFolder };
  }> {
    try {
      // Créer le dossier racine MusiqueConnect
      const rootFolder = await this.createFolder('MusiqueConnect - PFEQ');
      
      // Créer les sous-dossiers pour les cycles
      const subFolders = {
        primaire: await this.createFolder('Primaire', rootFolder.id),
        secondaire: await this.createFolder('Secondaire', rootFolder.id),
        ressources: await this.createFolder('Ressources Pédagogiques', rootFolder.id),
        evaluations: await this.createFolder('Évaluations', rootFolder.id),
        partitions: await this.createFolder('Partitions', rootFolder.id),
        budget: await this.createFolder('Documents Budgétaires', rootFolder.id),
      };

      // Créer les sous-dossiers pour les cycles primaires
      await this.createFolder('Cycle 1', subFolders.primaire.id);
      await this.createFolder('Cycle 2', subFolders.primaire.id);
      await this.createFolder('Cycle 3', subFolders.primaire.id);

      // Créer les sous-dossiers pour les cycles secondaires
      await this.createFolder('1er Cycle', subFolders.secondaire.id);
      await this.createFolder('2e Cycle', subFolders.secondaire.id);

      return { rootFolder, subFolders };
    } catch (error) {
      console.error('Erreur lors de la création de la structure PFEQ:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde automatique des données MusiqueConnect
   */
  public async autoSaveMusiqueConnectData(data: any, fileName: string): Promise<GoogleDriveFile> {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const file = new File([blob], fileName, { type: 'application/json' });

      // Sauvegarder dans le dossier MusiqueConnect
      const folders = await this.listFiles();
      const musiqueConnectFolder = folders.find(f => f.name === 'MusiqueConnect - PFEQ');

      if (musiqueConnectFolder) {
        return await this.uploadFile(file, musiqueConnectFolder.id);
      } else {
        // Créer la structure si elle n'existe pas
        const { rootFolder } = await this.createPFEQFolderStructure();
        return await this.uploadFile(file, rootFolder.id);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
      throw error;
    }
  }

  /**
   * Récupère le token d'accès Google
   */
  private async getAccessToken(): Promise<string> {
    // Cette fonction devra être implémentée pour récupérer le token d'accès
    // depuis le service d'authentification Google
    throw new Error('Méthode getAccessToken à implémenter');
  }
}

export default GoogleDriveService.getInstance(); 