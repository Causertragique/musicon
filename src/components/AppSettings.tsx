import React, { useState } from 'react';
import { Settings, Globe, DollarSign, Check, RotateCcw } from 'lucide-react';

type Language = 'fr' | 'en';
type Currency = 'CAD' | 'USD' | 'EUR';

interface AppSettingsProps {
  userRole: 'teacher' | 'student';
}

export default function AppSettings({ userRole }: AppSettingsProps) {
  const [settings, setSettings] = useState({
    language: 'fr' as Language,
    currency: 'CAD' as Currency,
  });
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 2000);
  };

  const handleResetSettings = () => {
    setSettings({
      language: 'fr',
      currency: 'CAD',
    });
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 2000);
  };

  const getLanguageLabel = (lang: Language) => {
    switch (lang) {
      case 'fr': return 'Français';
      case 'en': return 'English';
      default: return lang;
    }
  };

  const getCurrencyLabel = (currency: Currency) => {
    switch (currency) {
      case 'CAD': return 'Dollar Canadien (CAD)';
      case 'USD': return 'Dollar Américain (USD)';
      case 'EUR': return 'Euro (EUR)';
      default: return currency;
    }
  };

  const getCurrencySymbol = (currency: Currency) => {
    switch (currency) {
      case 'CAD': return '$ CAD';
      case 'USD': return '$ USD';
      case 'EUR': return '€';
      default: return currency;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary-600" />
          Paramètres de l'Application
        </h3>
        
        {showSaveConfirmation && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm">
            <Check className="w-4 h-4" />
            Paramètres sauvegardés
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {/* Langue de l'application */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Langue de l'Application</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Choisissez la langue d'affichage de l'interface
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(['fr', 'en'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => handleSettingChange('language', lang)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  settings.language === lang
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{getLanguageLabel(lang)}</span>
                  {settings.language === lang && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Devise utilisée */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-gray-900">Devise Utilisée</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Sélectionnez la devise pour l'affichage des montants financiers
          </p>
          <div className="grid grid-cols-1 gap-3">
            {(['CAD', 'USD', 'EUR'] as Currency[]).map((currency) => (
              <button
                key={currency}
                onClick={() => handleSettingChange('currency', currency)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  settings.currency === currency
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <div className="font-medium">{getCurrencyLabel(currency)}</div>
                    <div className="text-sm text-gray-500">{getCurrencySymbol(currency)}</div>
                  </div>
                  {settings.currency === currency && (
                    <Check className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Informations sur les paramètres actuels */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">Paramètres Actuels</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-600 font-medium">Langue :</span>
              <div className="text-blue-800">{getLanguageLabel(settings.language)}</div>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Devise :</span>
              <div className="text-blue-800">{getCurrencySymbol(settings.currency)}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleResetSettings}
            className="btn-outline flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser les Paramètres
          </button>
        </div>

        {/* Note pour les utilisateurs */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">💡 Note Importante</h4>
          <div className="text-yellow-800 text-sm space-y-1">
            <p>• Les paramètres sont sauvegardés automatiquement dans votre navigateur</p>
            <p>• Les changements de devise affectent tous les montants affichés</p>
            {userRole === 'teacher' && (
              <p>• En tant qu'enseignant, vos paramètres n'affectent que votre interface</p>
            )}
            {userRole === 'student' && (
              <p>• En tant qu'élève, vos paramètres personnalisent votre expérience</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}