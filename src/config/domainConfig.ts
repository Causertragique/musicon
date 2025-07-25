export interface DomainConfig {
  id: string;
  name: string;
  domain: string;
  isMainDomain: boolean;
  features: string[];
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  maxStudents: number;
  maxTeachers: number;
  customBranding: boolean;
  prioritySupport: boolean;
}

export const DOMAIN_CONFIGS: Record<string, DomainConfig> = {
  'musiqueconnect.app': {
    id: 'musiqueconnect-main',
    name: 'MusiqueConnect - Plateforme Principale',
    domain: 'musiqueconnect.app',
    isMainDomain: true,
    features: [
      'pfeq',
      'google-sheets',
      'gamification',
      'ia-tools',
      'advanced-analytics',
      'custom-branding',
      'priority-support',
      'white-label',
      'api-access',
      'custom-integrations'
    ],
    subscriptionPlan: 'enterprise',
    maxStudents: 10000,
    maxTeachers: 500,
    customBranding: true,
    prioritySupport: true
  },
  'ecole-musique-quebec.com': {
    id: 'ecole-1',
    name: 'École de Musique du Québec',
    domain: 'ecole-musique-quebec.com',
    isMainDomain: false,
    features: ['pfeq', 'google-sheets', 'gamification', 'ia-tools'],
    subscriptionPlan: 'premium',
    maxStudents: 500,
    maxTeachers: 25,
    customBranding: false,
    prioritySupport: false
  },
  'conservatoire-montreal.ca': {
    id: 'conservatoire-1',
    name: 'Conservatoire de Musique de Montréal',
    domain: 'conservatoire-montreal.ca',
    isMainDomain: false,
    features: ['pfeq', 'google-sheets', 'gamification', 'ia-tools', 'advanced-analytics'],
    subscriptionPlan: 'enterprise',
    maxStudents: 1000,
    maxTeachers: 50,
    customBranding: true,
    prioritySupport: true
  },
  'academie-musique-laval.org': {
    id: 'academie-1',
    name: 'Académie de Musique de Laval',
    domain: 'academie-musique-laval.org',
    isMainDomain: false,
    features: ['pfeq', 'google-sheets'],
    subscriptionPlan: 'basic',
    maxStudents: 200,
    maxTeachers: 10,
    customBranding: false,
    prioritySupport: false
  },
  'studio-musique-gatineau.ca': {
    id: 'studio-1',
    name: 'Studio de Musique Gatineau',
    domain: 'studio-musique-gatineau.ca',
    isMainDomain: false,
    features: ['pfeq', 'google-sheets', 'gamification'],
    subscriptionPlan: 'premium',
    maxStudents: 300,
    maxTeachers: 15,
    customBranding: false,
    prioritySupport: false
  }
};

export const getDomainConfig = (domain: string): DomainConfig | null => {
  return DOMAIN_CONFIGS[domain] || null;
};

export const isMainDomain = (domain: string): boolean => {
  const config = getDomainConfig(domain);
  return config?.isMainDomain || false;
};

export const getAvailableFeatures = (domain: string): string[] => {
  const config = getDomainConfig(domain);
  return config?.features || [];
};

export const hasFeature = (domain: string, feature: string): boolean => {
  const features = getAvailableFeatures(domain);
  return features.includes(feature);
};

export const getSubscriptionPlan = (domain: string): string => {
  const config = getDomainConfig(domain);
  return config?.subscriptionPlan || 'basic';
};

export const getLimits = (domain: string) => {
  const config = getDomainConfig(domain);
  return {
    maxStudents: config?.maxStudents || 100,
    maxTeachers: config?.maxTeachers || 5
  };
}; 