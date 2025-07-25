import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'fr' | 'en';
export type Currency = 'CAD' | 'USD' | 'EUR';
export type Theme = 'light' | 'dark' | 'auto';

export interface AppSettings {
  language: Language;
  currency: Currency;
  theme: Theme;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  language: 'fr',
  currency: 'CAD',
  theme: 'auto'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Charger les paramètres depuis localStorage
    const savedSettings = localStorage.getItem('musicapp-settings');
    if (savedSettings) {
      try {
        return { ...defaultSettings, ...JSON.parse(savedSettings) };
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Sauvegarder les paramètres dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('musicapp-settings', JSON.stringify(settings));
  }, [settings]);

  // Appliquer le thème
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.theme === 'auto') {
      // Détecter la préférence système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', settings.theme === 'dark');
    }
  }, [settings.theme]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings doit être utilisé dans un SettingsProvider');
  }
  return context;
}