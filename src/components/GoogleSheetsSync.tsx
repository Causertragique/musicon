import React, { useState, useEffect } from 'react';
import GoogleSheetsService from '../services/googleSheetsService';

interface GoogleSheetsSyncProps {
  onDataImported?: (data: any) => void;
  onSyncComplete?: () => void;
}

const GoogleSheetsSync: React.FC<GoogleSheetsSyncProps> = ({ 
  onDataImported, 
  onSyncComplete 
}) => {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [importedData, setImportedData] = useState<any>(null);
  const [showCreateNew, setShowCreateNew] = useState(false);

  const handleConnectExistingSheet = async () => {
    if (!spreadsheetId.trim()) {
      setSyncStatus('Veuillez entrer l\'ID du Google Sheet');
      return;
    }

    setIsConnecting(true);
    setSyncStatus('Connexion en cours...');

    try {
      const data = await GoogleSheetsService.importExistingSheet(spreadsheetId);
      setImportedData(data);
      setSyncStatus('Connexion réussie ! Données importées.');
      
      if (onDataImported) {
        onDataImported(data);
      }
    } catch (error) {
      setSyncStatus('Erreur lors de la connexion. Vérifiez l\'ID du Google Sheet.');
      console.error('Erreur de connexion:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreateNewSheet = async () => {
    setIsConnecting(true);
    setSyncStatus('Création du nouveau Google Sheet...');

    try {
      const newSheet = await GoogleSheetsService.createMusiqueConnectSheet(
        `MusiqueConnect - ${new Date().toLocaleDateString('fr-CA')}`
      );
      
      setSpreadsheetId(newSheet.spreadsheetId);
      setSyncStatus('Nouveau Google Sheet créé !');
      setShowCreateNew(false);
      
      // Ouvrir le Google Sheet dans un nouvel onglet
      window.open(newSheet.spreadsheetUrl, '_blank');
    } catch (error) {
      setSyncStatus('Erreur lors de la création du Google Sheet.');
      console.error('Erreur de création:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncToSheets = async () => {
    if (!spreadsheetId) {
      setSyncStatus('Veuillez d\'abord connecter un Google Sheet');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Synchronisation vers Google Sheets...');

    try {
      // Exemple de synchronisation des données
      const sampleData = {
        type: 'students',
        data: [
          { id: '1', nom: 'Dupont', prenom: 'Marie', email: 'marie.dupont@ecole.ca', groupe: '5A', niveau: 'Primaire' },
          { id: '2', nom: 'Tremblay', prenom: 'Pierre', email: 'pierre.tremblay@ecole.ca', groupe: '5A', niveau: 'Primaire' },
        ],
        lastSync: new Date().toISOString(),
      };

      await GoogleSheetsService.syncToGoogleSheets(spreadsheetId, sampleData);
      setSyncStatus('Synchronisation réussie !');
      
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error) {
      setSyncStatus('Erreur lors de la synchronisation.');
      console.error('Erreur de synchronisation:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncFromSheets = async () => {
    if (!spreadsheetId) {
      setSyncStatus('Veuillez d\'abord connecter un Google Sheet');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Synchronisation depuis Google Sheets...');

    try {
      const data = await GoogleSheetsService.importExistingSheet(spreadsheetId);
      setImportedData(data);
      setSyncStatus('Synchronisation réussie ! Données mises à jour.');
      
      if (onDataImported) {
        onDataImported(data);
      }
    } catch (error) {
      setSyncStatus('Erreur lors de la synchronisation.');
      console.error('Erreur de synchronisation:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔗 Synchronisation Google Sheets
        </h2>
        <p className="text-gray-600">
          Connectez vos Google Sheets existants ou créez-en un nouveau pour synchroniser vos données MusiqueConnect.
        </p>
      </div>

      {/* Connexion Google Sheet existant */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Connecter un Google Sheet existant
        </h3>
        
        <div className="flex gap-3 mb-3">
          <input
            type="text"
            value={spreadsheetId}
            onChange={(e) => setSpreadsheetId(e.target.value)}
            placeholder="ID du Google Sheet (ex: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleConnectExistingSheet}
            disabled={isConnecting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isConnecting ? 'Connexion...' : 'Connecter'}
          </button>
        </div>

        <div className="text-sm text-gray-500 mb-3">
          💡 <strong>Comment trouver l'ID :</strong> Ouvrez votre Google Sheet et copiez l'ID dans l'URL après /d/ et avant /edit
        </div>

        <button
          onClick={() => setShowCreateNew(!showCreateNew)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {showCreateNew ? 'Annuler' : 'Ou créer un nouveau Google Sheet'}
        </button>
      </div>

      {/* Créer un nouveau Google Sheet */}
      {showCreateNew && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Créer un nouveau Google Sheet
          </h3>
          <p className="text-gray-600 mb-3">
            Un nouveau Google Sheet sera créé avec la structure PFEQ préconfigurée.
          </p>
          <button
            onClick={handleCreateNewSheet}
            disabled={isConnecting}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isConnecting ? 'Création...' : 'Créer un nouveau Google Sheet'}
          </button>
        </div>
      )}

      {/* Synchronisation */}
      {spreadsheetId && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Synchronisation
          </h3>
          
          <div className="flex gap-3 mb-3">
            <button
              onClick={handleSyncToSheets}
              disabled={isSyncing}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isSyncing ? 'Synchronisation...' : '📤 Vers Google Sheets'}
            </button>
            
            <button
              onClick={handleSyncFromSheets}
              disabled={isSyncing}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {isSyncing ? 'Synchronisation...' : '📥 Depuis Google Sheets'}
            </button>
          </div>

          <div className="text-sm text-gray-500">
            💡 <strong>Conseil :</strong> Synchronisez régulièrement pour garder vos données à jour
          </div>
        </div>
      )}

      {/* Statut */}
      {syncStatus && (
        <div className={`p-3 rounded-md ${
          syncStatus.includes('Erreur') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {syncStatus}
        </div>
      )}

      {/* Données importées */}
      {importedData && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Données importées
          </h3>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <strong>Élèves :</strong> {importedData.students?.length || 0}
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <strong>Budget :</strong> {importedData.budget?.length || 0} entrées
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <strong>Évaluations :</strong> {importedData.evaluations?.length || 0}
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <strong>Groupes :</strong> {importedData.groups?.length || 0}
            </div>
          </div>
        </div>
      )}

      {/* Lien vers Google Sheet */}
      {spreadsheetId && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Accéder à votre Google Sheet
          </h3>
          <a
            href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Ouvrir dans Google Sheets →
          </a>
        </div>
      )}
    </div>
  );
};

export default GoogleSheetsSync; 