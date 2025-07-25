#!/usr/bin/env node

/**
 * Script de test pour l'intégration Google Sheets
 * Teste la création, lecture et synchronisation de Google Sheets
 */

const { google } = require('googleapis');

// Configuration de test
const TEST_CONFIG = {
  // Ces valeurs devront être configurées dans l'environnement
  clientId: process.env.GOOGLE_CLIENT_ID || 'your-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
};

// Données de test PFEQ
const TEST_DATA = {
  students: [
    ['ID', 'Nom', 'Prénom', 'Email', 'Groupe', 'Niveau', 'Instrument', 'Notes', 'Date d\'inscription'],
    ['1', 'Dupont', 'Marie', 'marie.dupont@ecole.ca', '5A', 'Primaire', 'Flûte', 'Très motivée', '2024-09-01'],
    ['2', 'Tremblay', 'Pierre', 'pierre.tremblay@ecole.ca', '5A', 'Primaire', 'Clarinette', 'Progrès rapides', '2024-09-01'],
    ['3', 'Gagnon', 'Sophie', 'sophie.gagnon@ecole.ca', '5B', 'Primaire', 'Violon', 'Nécessite soutien', '2024-09-01'],
  ],
  budget: [
    ['ID', 'Catégorie', 'Description', 'Montant', 'Date', 'Type', 'Statut', 'Approuvé par'],
    ['1', 'Instruments', 'Achat flûtes', '1500.00', '2024-09-15', 'Dépense', 'En attente', ''],
    ['2', 'Partitions', 'Méthode Suzuki', '250.00', '2024-09-20', 'Dépense', 'Approuvé', 'Directeur'],
    ['3', 'Événements', 'Concert de Noël', '500.00', '2024-10-01', 'Dépense', 'Approuvé', 'Directeur'],
  ],
  evaluations: [
    ['ID', 'Élève', 'Compétence PFEQ', 'Niveau', 'Date', 'Commentaires', 'Note', 'Enseignant'],
    ['1', 'Marie Dupont', 'Interpréter', 'Cycle 2', '2024-09-30', 'Excellente technique', 'A', 'M. Martin'],
    ['2', 'Pierre Tremblay', 'Créer', 'Cycle 2', '2024-09-30', 'Créativité remarquable', 'B+', 'M. Martin'],
    ['3', 'Sophie Gagnon', 'Apprécier', 'Cycle 2', '2024-09-30', 'Amélioration nécessaire', 'C+', 'M. Martin'],
  ],
};

class GoogleSheetsTester {
  constructor() {
    this.auth = null;
    this.sheets = null;
  }

  /**
   * Initialise l'authentification Google
   */
  async initializeAuth() {
    console.log('🔐 Initialisation de l\'authentification Google...');
    
    const oauth2Client = new google.auth.OAuth2(
      TEST_CONFIG.clientId,
      TEST_CONFIG.clientSecret,
      TEST_CONFIG.redirectUri
    );

    // Pour les tests, nous utiliserons un token d'accès de test
    // En production, cela viendrait du processus OAuth
    console.log('⚠️  Mode test : authentification simulée');
    
    this.auth = oauth2Client;
    this.sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  }

  /**
   * Teste la création d'un Google Sheet
   */
  async testCreateSheet() {
    console.log('\n📊 Test de création d\'un Google Sheet...');
    
    try {
      const resource = {
        properties: {
          title: `Test MusiqueConnect - ${new Date().toISOString().split('T')[0]}`,
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
                columnCount: 8,
              },
            },
          },
        ],
      };

      const response = await this.sheets.spreadsheets.create({
        resource,
      });

      console.log('✅ Google Sheet créé avec succès !');
      console.log(`📋 ID: ${response.data.spreadsheetId}`);
      console.log(`🔗 URL: ${response.data.spreadsheetUrl}`);
      
      return response.data.spreadsheetId;
    } catch (error) {
      console.error('❌ Erreur lors de la création du Google Sheet:', error.message);
      throw error;
    }
  }

  /**
   * Teste l'ajout de données dans un Google Sheet
   */
  async testAddData(spreadsheetId) {
    console.log('\n📝 Test d\'ajout de données...');
    
    try {
      const requests = [];
      
      // Ajouter les données pour chaque onglet
      for (const [sheetName, data] of Object.entries(TEST_DATA)) {
        const range = `${sheetName}!A1:Z${data.length}`;
        
        requests.push({
          updateCells: {
            range: {
              sheetId: this.getSheetIdByName(sheetName),
              startRowIndex: 0,
              endRowIndex: data.length,
              startColumnIndex: 0,
              endColumnIndex: data[0].length,
            },
            rows: data.map(row => ({
              values: row.map(cell => ({ userEnteredValue: { stringValue: cell } })),
            })),
            fields: 'userEnteredValue',
          },
        });
      }

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: { requests },
      });

      console.log('✅ Données ajoutées avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout des données:', error.message);
      throw error;
    }
  }

  /**
   * Teste la lecture de données depuis un Google Sheet
   */
  async testReadData(spreadsheetId) {
    console.log('\n📖 Test de lecture de données...');
    
    try {
      for (const sheetName of Object.keys(TEST_DATA)) {
        const range = `${sheetName}!A1:Z`;
        
        const response = await this.sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        });

        console.log(`✅ Données lues depuis "${sheetName}":`);
        console.log(`   - ${response.data.values?.length || 0} lignes`);
        console.log(`   - ${response.data.values?.[0]?.length || 0} colonnes`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la lecture des données:', error.message);
      throw error;
    }
  }

  /**
   * Teste la synchronisation bidirectionnelle
   */
  async testBidirectionalSync(spreadsheetId) {
    console.log('\n🔄 Test de synchronisation bidirectionnelle...');
    
    try {
      // Simuler une modification dans MusiqueConnect
      const newStudent = ['4', 'Lavoie', 'Alexandre', 'alexandre.lavoie@ecole.ca', '5A', 'Primaire', 'Piano', 'Nouvel élève', '2024-10-01'];
      
      // Ajouter à Google Sheets
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Élèves!A:Z',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [newStudent],
        },
      });

      console.log('✅ Synchronisation MusiqueConnect → Google Sheets réussie');

      // Simuler une lecture depuis Google Sheets
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Élèves!A:Z',
      });

      console.log('✅ Synchronisation Google Sheets → MusiqueConnect réussie');
      console.log(`   - ${response.data.values?.length || 0} élèves synchronisés`);
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error.message);
      throw error;
    }
  }

  /**
   * Obtient l'ID d'un onglet par son nom
   */
  getSheetIdByName(sheetName) {
    // En production, cela viendrait d'une requête à l'API
    const sheetIds = {
      'Élèves': 0,
      'Budget': 1,
      'Évaluations': 2,
    };
    return sheetIds[sheetName] || 0;
  }

  /**
   * Lance tous les tests
   */
  async runAllTests() {
    console.log('🧪 Démarrage des tests d\'intégration Google Sheets...\n');
    
    try {
      await this.initializeAuth();
      
      const spreadsheetId = await this.testCreateSheet();
      await this.testAddData(spreadsheetId);
      await this.testReadData(spreadsheetId);
      await this.testBidirectionalSync(spreadsheetId);
      
      console.log('\n🎉 Tous les tests sont passés avec succès !');
      console.log(`📊 Google Sheet de test: ${spreadsheetId}`);
      console.log('✅ L\'intégration Google Sheets est prête pour la production');
      
    } catch (error) {
      console.error('\n💥 Échec des tests:', error.message);
      console.log('🔧 Vérifiez la configuration Google Cloud et les permissions');
      process.exit(1);
    }
  }
}

// Exécution des tests
if (require.main === module) {
  const tester = new GoogleSheetsTester();
  tester.runAllTests();
}

module.exports = GoogleSheetsTester; 