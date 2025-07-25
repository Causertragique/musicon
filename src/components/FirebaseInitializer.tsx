import React, { useEffect, useState } from 'react';
import { initializeFirebaseData, checkFirebaseData } from '../utils/firebaseInit';
import { useFirebaseData } from '../contexts/FirebaseDataContext';
import { Loader2, Database, CheckCircle, AlertCircle } from 'lucide-react';

interface FirebaseInitializerProps {
  children: React.ReactNode;
}

export default function FirebaseInitializer({ children }: FirebaseInitializerProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshData } = useFirebaseData();

  useEffect(() => {
    checkAndInitializeData();
  }, []);

  const checkAndInitializeData = async () => {
    try {
      setIsChecking(true);
      setError(null);

      // Vérifier si les données existent déjà
      const dataStatus = await checkFirebaseData();
      setHasData(dataStatus.hasUsers && dataStatus.hasGroups);

      if (!dataStatus.hasUsers || !dataStatus.hasGroups) {
        // Afficher l'option d'initialisation
        setIsChecking(false);
      } else {
        // Les données existent, rafraîchir et continuer
        await refreshData();
        setIsChecking(false);
      }
    } catch (err) {
      console.error('Erreur lors de la vérification des données:', err);
      setError('Erreur de connexion à Firebase. Vérifiez votre configuration.');
      setIsChecking(false);
    }
  };

  const handleInitializeData = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      // Initialiser les données Firebase
      await initializeFirebaseData();
      
      // Rafraîchir les données
      await refreshData();
      
      setHasData(true);
      setIsInitializing(false);
    } catch (err) {
      console.error('Erreur lors de l\'initialisation:', err);
      setError('Erreur lors de l\'initialisation des données. Veuillez réessayer.');
      setIsInitializing(false);
    }
  };

  // Écran de chargement initial
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Connexion à Firebase...
          </h2>
          <p className="text-gray-600">
            Vérification de la configuration de la base de données
          </p>
        </div>
      </div>
    );
  }

  // Écran d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Erreur de connexion
          </h2>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <button
            onClick={checkAndInitializeData}
            className="btn-primary"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Écran d'initialisation des données
  if (!hasData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Database className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Configuration initiale
          </h2>
          <p className="text-gray-600 mb-6">
            Aucune donnée trouvée dans Firebase. Voulez-vous initialiser la base de données avec des données de démonstration ?
          </p>
          
          {isInitializing ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin mr-2" />
              <span>Initialisation en cours...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleInitializeData}
                className="btn-primary w-full"
              >
                Initialiser avec des données de démonstration
              </button>
              <button
                onClick={() => setHasData(true)}
                className="btn-outline w-full"
              >
                Continuer sans données
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Application normale
  return <>{children}</>;
} 