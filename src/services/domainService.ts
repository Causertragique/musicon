// Service de gestion des domaines pour MusiqueConnect

import { secureLog } from '../utils/security';
import { PartnerSchool } from '../types';
import { DOMAIN_CONFIGS, getDomainConfig, isMainDomain, getAvailableFeatures } from '../config/domainConfig';

// Interface pour une école partenaire
interface PartnerSchool {
  id: string;
  name: string;
  domain: string;
  address: string;
  city: string;
  province: string;
  contactEmail: string;
  contactPhone: string;
  subscriptionPlan: 'basic' | 'premium' | 'enterprise';
  maxStudents: number;
  maxTeachers: number;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Base de données des écoles partenaires (en production, ceci serait dans Firebase)
const PARTNER_SCHOOLS: PartnerSchool[] = Object.values(DOMAIN_CONFIGS).map(config => ({
  id: config.id,
  name: config.name,
  domain: config.domain,
  address: '1234 Rue de la Musique',
  city: 'Montréal',
  province: 'QC',
  contactEmail: `contact@${config.domain}`,
  contactPhone: '(514) 555-0000',
  subscriptionPlan: config.subscriptionPlan,
  maxStudents: config.maxStudents,
  maxTeachers: config.maxTeachers,
  features: config.features,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15')
}));

// Validation d'un domaine
export const validateDomain = (domain: string): boolean => {
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return domainRegex.test(domain) && domain.length <= 253;
};

// Recherche d'une école par domaine
export const findSchoolByDomain = (domain: string): PartnerSchool | null => {
  const normalizedDomain = domain.toLowerCase().trim();
  
  const school = PARTNER_SCHOOLS.find(school => 
    school.domain.toLowerCase() === normalizedDomain && school.isActive
  );

  if (school) {
    secureLog('info', 'École trouvée par domaine', { domain, schoolId: school.id });
  } else {
    secureLog('warn', 'Domaine non trouvé', { domain });
  }

  return school || null;
};

// Vérification de l'accès à une école
export const checkSchoolAccess = (domain: string, userEmail?: string): {
  hasAccess: boolean;
  school?: PartnerSchool;
  reason?: string;
} => {
  const school = findSchoolByDomain(domain);
  
  if (!school) {
    return {
      hasAccess: false,
      reason: 'Domaine non reconnu'
    };
  }

  if (!school.isActive) {
    return {
      hasAccess: false,
      school,
      reason: 'École inactive'
    };
  }

  // Vérification des limites d'utilisateurs (simulation)
  const currentUsers = Math.floor(Math.random() * school.maxStudents * 0.8); // Simulation
  const currentTeachers = Math.floor(Math.random() * school.maxTeachers * 0.8); // Simulation

  if (currentUsers >= school.maxStudents) {
    return {
      hasAccess: false,
      school,
      reason: 'Limite d\'élèves atteinte'
    };
  }

  if (currentTeachers >= school.maxTeachers) {
    return {
      hasAccess: false,
      school,
      reason: 'Limite d\'enseignants atteinte'
    };
  }

  secureLog('info', 'Accès à l\'école vérifié', { 
    domain, 
    schoolId: school.id, 
    hasAccess: true 
  });

  return {
    hasAccess: true,
    school
  };
};

// Création d'un compte utilisateur pour une école
export const createSchoolUser = async (
  domain: string,
  userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'teacher' | 'student' | 'admin';
    instrument?: string;
  }
): Promise<{ success: boolean; userId?: string; error?: string }> => {
  try {
    const accessCheck = checkSchoolAccess(domain, userData.email);
    
    if (!accessCheck.hasAccess) {
      return {
        success: false,
        error: accessCheck.reason || 'Accès refusé'
      };
    }

    const school = accessCheck.school!;

    // Vérification des fonctionnalités disponibles selon le plan
    if (userData.role === 'teacher' && !school.features.includes('pfeq')) {
      return {
        success: false,
        error: 'Plan d\'abonnement insuffisant pour les enseignants'
      };
    }

    // Simulation de création d'utilisateur
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newUser = {
      id: userId,
      ...userData,
      schoolId: school.id,
      schoolDomain: domain,
      subscriptionPlan: school.subscriptionPlan,
      createdAt: new Date(),
      isActive: true
    };

    secureLog('info', 'Utilisateur créé pour école', { 
      userId, 
      schoolId: school.id, 
      domain,
      role: userData.role 
    });

    // En production, sauvegarder dans Firebase
    // await addUserToSchool(newUser);

    return {
      success: true,
      userId
    };

  } catch (error) {
    secureLog('error', 'Erreur lors de la création d\'utilisateur', { 
      domain, 
      userData, 
      error 
    });
    
    return {
      success: false,
      error: 'Erreur lors de la création du compte'
    };
  }
};

// Récupération des informations d'une école
export const getSchoolInfo = (domain: string): PartnerSchool | null => {
  return findSchoolByDomain(domain);
};

// Liste des écoles partenaires
export const getPartnerSchools = (): PartnerSchool[] => {
  return PARTNER_SCHOOLS.filter(school => school.isActive);
};

// Vérification du statut d'une école
export const getSchoolStatus = (domain: string): {
  isActive: boolean;
  subscriptionPlan?: string;
  features?: string[];
  maxStudents?: number;
  maxTeachers?: number;
} => {
  const school = findSchoolByDomain(domain);
  
  if (!school) {
    return { isActive: false };
  }

  return {
    isActive: school.isActive,
    subscriptionPlan: school.subscriptionPlan,
    features: school.features,
    maxStudents: school.maxStudents,
    maxTeachers: school.maxTeachers
  };
}; 