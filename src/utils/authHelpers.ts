import { User } from '../types';
import { GoogleUserInfo } from '../services/googleAuth';
import { MicrosoftUserInfo } from '../services/microsoftAuth';

/**
 * Convertit les informations utilisateur Google en objet User
 */
export function convertGoogleUserToUser(googleUser: GoogleUserInfo): User {
  return {
    id: `google_${googleUser.id}`,
    firstName: googleUser.given_name || 'Prénom',
    lastName: googleUser.family_name || 'Nom',
    email: googleUser.email,
    role: 'teacher', // Par défaut, assigné comme professeur
    picture: googleUser.picture
  };
}

/**
 * Convertit les informations utilisateur Microsoft en objet User
 */
export function convertMicrosoftUserToUser(microsoftUser: MicrosoftUserInfo): User {
  return {
    id: `microsoft_${microsoftUser.id}`,
    firstName: microsoftUser.givenName || 'Prénom',
    lastName: microsoftUser.surname || 'Nom',
    email: microsoftUser.mail || microsoftUser.userPrincipalName,
    role: 'teacher', // Par défaut, assigné comme professeur
    picture: undefined // Microsoft Graph peut fournir une photo, mais nécessite des permissions supplémentaires
  };
}

/**
 * Détermine le rôle de l'utilisateur basé sur son email
 * Cette fonction peut être personnalisée selon vos besoins
 */
export function determineUserRole(email: string): 'teacher' | 'student' {
  // Logique personnalisée pour déterminer le rôle
  // Par exemple, les emails se terminant par @school.edu pourraient être des professeurs
  if (email.includes('teacher') || email.includes('prof') || email.includes('@school.')) {
    return 'teacher';
  }
  
  // Par défaut, considérer comme professeur pour les connexions OAuth
  return 'teacher';
}

/**
 * Valide les informations utilisateur OAuth
 */
export function validateOAuthUser(user: Partial<User>): boolean {
  return !!(
    user.email &&
    user.firstName &&
    user.lastName &&
    user.role
  );
}

/**
 * Génère un ID unique pour un utilisateur OAuth
 */
export function generateOAuthUserId(provider: 'google' | 'microsoft', originalId: string): string {
  return `${provider}_${originalId}_${Date.now()}`;
}

/**
 * Extrait le domaine d'un email
 */
export function extractEmailDomain(email: string): string {
  const parts = email.split('@');
  return parts.length > 1 ? parts[1] : '';
}

/**
 * Vérifie si un email appartient à un domaine éducatif
 */
export function isEducationalDomain(email: string): boolean {
  const domain = extractEmailDomain(email).toLowerCase();
  const educationalDomains = [
    '.edu',
    '.ac.',
    'school.',
    'university.',
    'college.',
    'academy.'
  ];
  
  return educationalDomains.some(eduDomain => domain.includes(eduDomain));
}

/**
 * Formate le nom complet d'un utilisateur
 */
export function formatUserFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

/**
 * Génère des initiales à partir du nom d'un utilisateur
 */
export function generateUserInitials(user: User): string {
  const firstInitial = user.firstName.charAt(0).toUpperCase();
  const lastInitial = user.lastName.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
}