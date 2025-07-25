import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { secureLog } from '../utils/security';
import { Globe, Lock, Users, Music } from 'lucide-react';

interface DomainLoginProps {
  onSuccess?: () => void;
}

export default function DomainLogin({ onSuccess }: DomainLoginProps) {
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginWithDomain } = useAuth();

  const handleDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!domain.trim()) {
      setError('Veuillez entrer un domaine valide');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      secureLog('info', 'Tentative de connexion par domaine', { domain });
      
      const success = await loginWithDomain(domain.trim());
      
      if (success) {
        secureLog('info', 'Connexion par domaine réussie', { domain });
        onSuccess?.();
      } else {
        setError('Domaine non reconnu ou accès refusé');
        secureLog('warn', 'Connexion par domaine échouée', { domain });
      }
    } catch (error) {
      setError('Erreur lors de la connexion');
      secureLog('error', 'Erreur lors de la connexion par domaine', { domain, error });
    } finally {
      setIsLoading(false);
    }
  };

  const predefinedDomains = [
    'musiqueconnect.app',
    'ecole-musique-quebec.com',
    'conservatoire-montreal.ca',
    'academie-musique-laval.org',
    'studio-musique-gatineau.ca'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Music className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            MusiqueConnect
          </h1>
          <p className="text-gray-600">
            Plateforme éducative de musique au Québec
          </p>
        </div>

        {/* Formulaire de connexion par domaine */}
        <form onSubmit={handleDomainSubmit} className="space-y-6">
          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
              Domaine de votre école
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="votre-ecole.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !domain.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Connexion en cours...
              </div>
            ) : (
              'Se Connecter'
            )}
          </button>
        </form>

        {/* Domaines prédéfinis */}
        <div className="mt-8">
          <p className="text-sm text-gray-600 mb-3">Domaines partenaires :</p>
          <div className="space-y-2">
            {predefinedDomains.map((predefinedDomain) => (
              <button
                key={predefinedDomain}
                onClick={() => setDomain(predefinedDomain)}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Lock className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    {predefinedDomain}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Informations de sécurité */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <Lock className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Connexion Sécurisée
              </h3>
              <p className="text-xs text-blue-700">
                Votre connexion est protégée par chiffrement SSL et authentification sécurisée.
              </p>
            </div>
          </div>
        </div>

        {/* Liens utiles */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Nouvelle école ?{' '}
            <button className="text-blue-600 hover:underline">
              Contactez-nous
            </button>
          </p>
        </div>
      </div>
    </div>
  );
} 