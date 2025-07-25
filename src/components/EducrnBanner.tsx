import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Crown, Gift } from 'lucide-react';

export default function EducrnBanner() {
  const { user } = useAuth();

  // Afficher la bannière seulement pour les utilisateurs educrm.ca
  if (!user || !user.email.endsWith('@educrm.ca')) {
    return null;
  }

  return (
    <div className="bg-transparent text-white p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5" />
          <div>
            <h3 className="font-semibold text-sm">Accès Premium Gratuit</h3>
            <p className="text-xs opacity-90">
              Bienvenue ! Vous avez un accès complet à toutes les fonctionnalités grâce à votre domaine @educrm.ca
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4" />
          <span className="text-xs font-medium">100% Gratuit</span>
        </div>
      </div>
    </div>
  );
} 