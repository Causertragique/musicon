// Utilitaires pour la gestion des années scolaires

export interface SchoolYear {
  id: string; // ex: "2025-2026"
  startYear: number; // 2025
  endYear: number; // 2026
  startDate: Date; // 1er septembre
  endDate: Date; // 30 juin
  isCurrent: boolean;
  isPast: boolean;
  isFuture: boolean;
}

/**
 * Génère l'ID d'une année scolaire à partir de l'année de début
 */
export function generateSchoolYearId(startYear: number): string {
  return `${startYear}-${startYear + 1}`;
}

/**
 * Parse un ID d'année scolaire et retourne les années de début et fin
 */
export function parseSchoolYearId(schoolYearId: string): { startYear: number; endYear: number } {
  const [startYearStr, endYearStr] = schoolYearId.split('-');
  const startYear = parseInt(startYearStr);
  const endYear = parseInt(endYearStr);
  
  if (isNaN(startYear) || isNaN(endYear) || endYear !== startYear + 1) {
    throw new Error(`Format d'année scolaire invalide: ${schoolYearId}`);
  }
  
  return { startYear, endYear };
}

/**
 * Crée un objet SchoolYear à partir de l'année de début
 */
export function createSchoolYear(startYear: number): SchoolYear {
  const endYear = startYear + 1;
  const schoolYearId = generateSchoolYearId(startYear);
  
  // 1er septembre de l'année de début
  const startDate = new Date(startYear, 8, 1); // mois 8 = septembre (0-indexed)
  
  // 30 juin de l'année de fin
  const endDate = new Date(endYear, 5, 30); // mois 5 = juin (0-indexed)
  
  const now = new Date();
  const isCurrent = now >= startDate && now <= endDate;
  const isPast = now > endDate;
  const isFuture = now < startDate;
  
  return {
    id: schoolYearId,
    startYear,
    endYear,
    startDate,
    endDate,
    isCurrent,
    isPast,
    isFuture
  };
}

/**
 * Retourne l'année scolaire actuelle
 */
export function getCurrentSchoolYear(): SchoolYear {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  
  // Si on est entre janvier et août, l'année scolaire actuelle a commencé l'année précédente
  let startYear = currentYear;
  if (currentMonth < 8) { // avant septembre
    startYear = currentYear - 1;
  }
  
  return createSchoolYear(startYear);
}

/**
 * Retourne l'année scolaire précédente
 */
export function getPreviousSchoolYear(): SchoolYear {
  const current = getCurrentSchoolYear();
  return createSchoolYear(current.startYear - 1);
}

/**
 * Retourne l'année scolaire suivante
 */
export function getNextSchoolYear(): SchoolYear {
  const current = getCurrentSchoolYear();
  return createSchoolYear(current.startYear + 1);
}

/**
 * Génère une liste d'années scolaires
 */
export function generateSchoolYearList(startYear: number, count: number): SchoolYear[] {
  const years: SchoolYear[] = [];
  for (let i = 0; i < count; i++) {
    years.push(createSchoolYear(startYear + i));
  }
  return years;
}

/**
 * Vérifie si une date est dans une année scolaire donnée
 */
export function isDateInSchoolYear(date: Date, schoolYear: SchoolYear): boolean {
  return date >= schoolYear.startDate && date <= schoolYear.endDate;
}

/**
 * Retourne le nombre de jours restants dans l'année scolaire
 */
export function getDaysRemainingInSchoolYear(schoolYear: SchoolYear): number {
  const now = new Date();
  if (now > schoolYear.endDate) return 0;
  if (now < schoolYear.startDate) return Math.ceil((schoolYear.endDate.getTime() - schoolYear.startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return Math.ceil((schoolYear.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Retourne le pourcentage de progression de l'année scolaire
 */
export function getSchoolYearProgress(schoolYear: SchoolYear): number {
  const now = new Date();
  if (now < schoolYear.startDate) return 0;
  if (now > schoolYear.endDate) return 100;
  
  const totalDays = Math.ceil((schoolYear.endDate.getTime() - schoolYear.startDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((now.getTime() - schoolYear.startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return Math.round((elapsedDays / totalDays) * 100);
}

/**
 * Formate une année scolaire pour l'affichage
 */
export function formatSchoolYear(schoolYear: SchoolYear): string {
  return `${schoolYear.startYear}-${schoolYear.endYear}`;
}

/**
 * Formate une année scolaire avec plus de détails
 */
export function formatSchoolYearDetailed(schoolYear: SchoolYear): string {
  const startMonth = schoolYear.startDate.toLocaleDateString('fr-CA', { month: 'long' });
  const endMonth = schoolYear.endDate.toLocaleDateString('fr-CA', { month: 'long' });
  return `${startMonth} ${schoolYear.startYear} - ${endMonth} ${schoolYear.endYear}`;
}

/**
 * Calcule le montant à reporter vers l'année suivante
 */
export function calculateCarryOverAmount(
  totalBudget: number,
  totalSpent: number,
  totalRevenue: number,
  maxCarryOverPercentage: number = 20 // 20% maximum par défaut
): number {
  const netResult = totalRevenue - totalSpent;
  const surplus = totalBudget + netResult;
  
  if (surplus <= 0) return 0;
  
  const maxCarryOver = totalBudget * (maxCarryOverPercentage / 100);
  return Math.min(surplus, maxCarryOver);
}

/**
 * Valide un ID d'année scolaire
 */
export function isValidSchoolYearId(schoolYearId: string): boolean {
  try {
    parseSchoolYearId(schoolYearId);
    return true;
  } catch {
    return false;
  }
} 