// Service d'intégration Google Sheets avec synchronisation bidirectionnelle
import { GoogleAuthService } from './googleAuth';

// Interfaces pour Google Sheets
export interface GoogleSheet {
  spreadsheetId: string;
  properties: {
    title: string;
    locale: string;
    timeZone: string;
    autoRecalc: string;
  };
  sheets: GoogleSheetTab[];
  namedRanges: any[];
  spreadsheetUrl: string;
}

export interface GoogleSheetTab {
  properties: {
    sheetId: number;
    title: string;
    index: number;
    sheetType: string;
    gridProperties: {
      rowCount: number;
      columnCount: number;
      frozenRowCount: number;
      frozenColumnCount: number;
    };
  };
}

export interface GoogleSheetData {
  range: string;
  majorDimension: string;
  values: any[][];
}

export interface MusiqueConnectData {
  type: 'students' | 'budget' | 'evaluations' | 'assignments' | 'groups';
  data: any[];
  lastSync: string;
}

export class GoogleSheetsService {
  private static instance: GoogleSheetsService;
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  public static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService();
    }
    return GoogleSheetsService.instance;
  }

  /**
   * Crée un nouveau Google Sheet pour MusiqueConnect
   */
  public async createMusiqueConnectSheet(title: string): Promise<GoogleSheet> {
    try {
      const accessToken = await this.getAccessToken();
      const spreadsheet = {
        properties: {
          title,
          locale: 'fr_CA',
          timeZone: 'America/Montreal',
          autoRecalc: 'ON_CHANGE',
        },
        sheets: [
          {
            properties: {
              title: 'Élèves',
              gridProperties: {
                rowCount: 1000,
                columnCount: 10,
              },
            },
          },
          {
            properties: {
              title: 'Budget',
              gridProperties: {
                rowCount: 500,
                columnCount: 8,
              },
            },
          },
          {
            properties: {
              title: 'Évaluations',
              gridProperties: {
                rowCount: 500,
                columnCount: 12,
              },
            },
          },
          {
            properties: {
              title: 'Devoirs',
              gridProperties: {
                rowCount: 200,
                columnCount: 10,
              },
            },
          },
          {
            properties: {
              title: 'Groupes',
              gridProperties: {
                rowCount: 100,
                columnCount: 6,
              },
            },
          },
        ],
      };

      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(spreadsheet),
      });

      if (!response.ok) {
        throw new Error(`Erreur API Google Sheets: ${response.status}`);
      }

      const newSheet = await response.json();
      
      // Initialiser les en-têtes pour chaque onglet
      await this.initializeSheetHeaders(newSheet.spreadsheetId);
      
      return newSheet;
    } catch (error) {
      console.error('Erreur lors de la création du Google Sheet:', error);
      throw error;
    }
  }

  /**
   * Initialise les en-têtes pour chaque onglet
   */
  private async initializeSheetHeaders(spreadsheetId: string): Promise<void> {
    const headers = {
      'Élèves': ['ID', 'Nom', 'Prénom', 'Email', 'Groupe', 'Niveau', 'Instrument', 'Notes', 'Date d\'inscription'],
      'Budget': ['ID', 'Catégorie', 'Description', 'Montant', 'Date', 'Type', 'Statut', 'Approuvé par'],
      'Évaluations': ['ID', 'Élève', 'Compétence PFEQ', 'Niveau', 'Date', 'Commentaires', 'Note', 'Enseignant'],
      'Devoirs': ['ID', 'Titre', 'Description', 'Groupe', 'Date de remise', 'Statut', 'Notes', 'Fichiers joints'],
      'Groupes': ['ID', 'Nom', 'Niveau', 'Enseignant', 'Nombre d\'élèves', 'Description'],
    };

    for (const [sheetName, headerRow] of Object.entries(headers)) {
      await this.updateSheetRange(spreadsheetId, `${sheetName}!A1:I1`, [headerRow]);
    }
  }

  /**
   * Lit les données d'un Google Sheet existant
   */
  public async readSheetData(spreadsheetId: string, range: string): Promise<GoogleSheetData> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/${spreadsheetId}/values/${range}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API Google Sheets: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la lecture du Google Sheet:', error);
      throw error;
    }
  }

  /**
   * Met à jour les données d'un Google Sheet
   */
  public async updateSheetRange(
    spreadsheetId: string,
    range: string,
    values: any[][]
  ): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();
      const body = {
        values,
      };

      const response = await fetch(`${this.baseUrl}/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Erreur API Google Sheets: ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du Google Sheet:', error);
      throw error;
    }
  }

  /**
   * Synchronise les données de MusiqueConnect vers Google Sheets
   */
  public async syncToGoogleSheets(
    spreadsheetId: string,
    musiqueConnectData: MusiqueConnectData
  ): Promise<void> {
    try {
      const sheetName = this.getSheetNameForDataType(musiqueConnectData.type);
      const range = `${sheetName}!A2:Z`;
      
      // Convertir les données en format tableau
      const values = musiqueConnectData.data.map(item => 
        Object.values(item).map(value => 
          typeof value === 'object' ? JSON.stringify(value) : value
        )
      );

      await this.updateSheetRange(spreadsheetId, range, values);
      console.log(`Synchronisation vers Google Sheets réussie: ${musiqueConnectData.type}`);
    } catch (error) {
      console.error('Erreur lors de la synchronisation vers Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Synchronise les données de Google Sheets vers MusiqueConnect
   */
  public async syncFromGoogleSheets(
    spreadsheetId: string,
    dataType: string
  ): Promise<any[]> {
    try {
      const sheetName = this.getSheetNameForDataType(dataType);
      const range = `${sheetName}!A2:Z`;
      
      const sheetData = await this.readSheetData(spreadsheetId, range);
      
      if (!sheetData.values || sheetData.values.length === 0) {
        return [];
      }

      // Convertir les données en objets structurés
      const headers = await this.getSheetHeaders(spreadsheetId, sheetName);
      const structuredData = sheetData.values.map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });

      console.log(`Synchronisation depuis Google Sheets réussie: ${dataType}`);
      return structuredData;
    } catch (error) {
      console.error('Erreur lors de la synchronisation depuis Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Récupère les en-têtes d'un onglet
   */
  private async getSheetHeaders(spreadsheetId: string, sheetName: string): Promise<string[]> {
    try {
      const headerData = await this.readSheetData(spreadsheetId, `${sheetName}!A1:Z1`);
      return headerData.values?.[0] || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des en-têtes:', error);
      return [];
    }
  }

  /**
   * Détermine le nom de l'onglet selon le type de données
   */
  private getSheetNameForDataType(dataType: string): string {
    const mapping: { [key: string]: string } = {
      'students': 'Élèves',
      'budget': 'Budget',
      'evaluations': 'Évaluations',
      'assignments': 'Devoirs',
      'groups': 'Groupes',
    };
    return mapping[dataType] || 'Élèves';
  }

  /**
   * Configure la synchronisation automatique
   */
  public async setupAutoSync(spreadsheetId: string): Promise<void> {
    try {
      // Créer un déclencheur pour la synchronisation automatique
      // Cette fonction peut être appelée périodiquement ou lors de changements
      console.log('Configuration de la synchronisation automatique pour:', spreadsheetId);
      
      // TODO: Implémenter les webhooks Google Sheets pour la synchronisation en temps réel
    } catch (error) {
      console.error('Erreur lors de la configuration de la synchronisation automatique:', error);
      throw error;
    }
  }

  /**
   * Importe un Google Sheet existant dans MusiqueConnect
   */
  public async importExistingSheet(spreadsheetId: string): Promise<{
    students: any[];
    budget: any[];
    evaluations: any[];
    assignments: any[];
    groups: any[];
  }> {
    try {
      const dataTypes = ['students', 'budget', 'evaluations', 'assignments', 'groups'];
      const result: any = {};
      
      for (const dataType of dataTypes) {
        try {
          const data = await this.syncFromGoogleSheets(spreadsheetId, dataType);
          result[dataType] = data;
        } catch (error) {
          console.warn(`Impossible d'importer ${dataType}:`, error);
        }
      }

      return result;
    } catch (error) {
      console.error('Erreur lors de l\'import du Google Sheet existant:', error);
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

export default GoogleSheetsService.getInstance(); 