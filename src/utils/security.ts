// Utilitaires de sécurité pour MusiqueConnect

// Validation des emails
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Validation des noms (prénom, nom de famille)
export const isValidName = (name: string): boolean => {
  // Permet les lettres, espaces, tirets, apostrophes
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
  return nameRegex.test(name.trim());
};

// Validation des instruments
export const isValidInstrument = (instrument: string): boolean => {
  const validInstruments = [
    'Piano', 'Guitare', 'Violon', 'Violoncelle', 'Flûte', 'Clarinette',
    'Saxophone', 'Saxophone Alto', 'Saxophone Tenor', 'Trompette',
    'Trombone', 'Euphonium', 'Tuba', 'Batterie', 'Chant', 'Autre'
  ];
  return validInstruments.includes(instrument);
};

// Sanitisation des chaînes de caractères
export const sanitizeString = (str: string): string => {
  return str
    .trim()
    .replace(/[<>]/g, '') // Supprime les balises HTML basiques
    .substring(0, 1000); // Limite la longueur
};

// Validation des IDs
export const isValidId = (id: string): boolean => {
  return typeof id === 'string' && id.length > 0 && id.length <= 50;
};

// Validation des groupes
export const isValidGroupName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

// Validation des messages
export const isValidMessage = (message: string): boolean => {
  return message.trim().length > 0 && message.trim().length <= 1000;
};

// Validation des notes
export const isValidGrade = (grade: number): boolean => {
  return typeof grade === 'number' && grade >= 0 && grade <= 100;
};

// Validation des prix
export const isValidPrice = (price: number): boolean => {
  return typeof price === 'number' && price >= 0 && price <= 10000;
};

// Rate limiting simple (en mémoire)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier);

  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userRequests.count >= maxRequests) {
    return false;
  }

  userRequests.count++;
  return true;
};

// Validation des données d'élève
export const validateStudentData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.firstName || !isValidName(data.firstName)) {
    errors.push('Prénom invalide');
  }

  if (!data.lastName || !isValidName(data.lastName)) {
    errors.push('Nom de famille invalide');
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Email invalide');
  }

  if (!data.instrument || !isValidInstrument(data.instrument)) {
    errors.push('Instrument invalide');
  }

  if (data.groupId && !isValidId(data.groupId)) {
    errors.push('ID de groupe invalide');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation des données de groupe
export const validateGroupData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name || !isValidGroupName(data.name)) {
    errors.push('Nom de groupe invalide');
  }

  if (data.studentIds && !Array.isArray(data.studentIds)) {
    errors.push('Liste d\'élèves invalide');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Protection contre les injections XSS basiques
export const escapeHtml = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

// Validation des permissions utilisateur
export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy = {
    'admin': 3,
    'teacher': 2,
    'student': 1
  };

  return (roleHierarchy[userRole as keyof typeof roleHierarchy] || 0) >= 
         (roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0);
};

// Logging sécurisé
export const secureLog = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data: data ? JSON.stringify(data) : undefined
  };

  // En production, envoyer vers un service de logging sécurisé
  if (import.meta.env.PROD) {
    // TODO: Implémenter un service de logging sécurisé
    console.log(`[${level.toUpperCase()}] ${message}`, data);
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`, data);
  }
}; 