// Configuration de sécurité pour MusiqueConnect

export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMITS: {
    CREATE_STUDENT: { maxRequests: 5, windowMs: 60000 },
    CREATE_GROUP: { maxRequests: 3, windowMs: 60000 },
    SEND_MESSAGE: { maxRequests: 20, windowMs: 60000 },
    QUERY_DATA: { maxRequests: 50, windowMs: 60000 },
    UPDATE_DATA: { maxRequests: 30, windowMs: 60000 },
    DELETE_DATA: { maxRequests: 10, windowMs: 60000 },
    BATCH_OPERATIONS: { maxRequests: 5, windowMs: 60000 }
  },

  // Validation des données
  VALIDATION: {
    MAX_NAME_LENGTH: 50,
    MAX_EMAIL_LENGTH: 254,
    MAX_MESSAGE_LENGTH: 1000,
    MAX_GROUP_NAME_LENGTH: 50,
    MAX_DESCRIPTION_LENGTH: 500,
    MIN_PASSWORD_LENGTH: 8,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  },

  // Permissions par rôle
  PERMISSIONS: {
    admin: {
      canCreateUsers: true,
      canDeleteUsers: true,
      canManageAllGroups: true,
      canAccessAllData: true,
      canManageSystem: true
    },
    teacher: {
      canCreateStudents: true,
      canDeleteStudents: false,
      canManageOwnGroups: true,
      canAccessOwnData: true,
      canManageSystem: false
    },
    student: {
      canCreateUsers: false,
      canDeleteUsers: false,
      canManageGroups: false,
      canAccessOwnData: true,
      canManageSystem: false
    }
  },

  // Configuration Firebase
  FIREBASE: {
    MAX_BATCH_SIZE: 500,
    MAX_QUERY_LIMIT: 1000,
    TIMEOUT_MS: 30000,
    RETRY_ATTEMPTS: 3
  },

  // Configuration de session
  SESSION: {
    TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
    REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
    MAX_CONCURRENT_SESSIONS: 3
  },

  // Configuration de logging
  LOGGING: {
    ENABLE_CONSOLE: true,
    ENABLE_REMOTE: false,
    LOG_LEVEL: import.meta.env.PROD ? 'warn' : 'info',
    SENSITIVE_FIELDS: ['password', 'token', 'apiKey', 'secret']
  },

  // Configuration de chiffrement
  ENCRYPTION: {
    ALGORITHM: 'AES-256-GCM',
    KEY_LENGTH: 32,
    IV_LENGTH: 16
  },

  // Configuration des CORS
  CORS: {
    ALLOWED_ORIGINS: [
      'http://localhost:5176',
      'http://localhost:3000',
      'https://musiqueconnect.ca',
      'https://www.musiqueconnect.ca'
    ],
    ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  // Configuration des en-têtes de sécurité
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://firebase.googleapis.com https://identitytoolkit.googleapis.com;"
  }
};

// Fonctions utilitaires de sécurité
export const isProduction = () => import.meta.env.PROD;

export const isDevelopment = () => import.meta.env.DEV;

export const getSecurityLevel = () => {
  if (isProduction()) {
    return 'high';
  } else if (isDevelopment()) {
    return 'medium';
  }
  return 'low';
};

export const shouldLogSensitiveData = () => {
  return !isProduction() && SECURITY_CONFIG.LOGGING.LOG_LEVEL === 'debug';
};

export const getRateLimit = (operation: keyof typeof SECURITY_CONFIG.RATE_LIMITS) => {
  return SECURITY_CONFIG.RATE_LIMITS[operation];
};

export const hasPermission = (userRole: string, permission: string): boolean => {
  const rolePermissions = SECURITY_CONFIG.PERMISSIONS[userRole as keyof typeof SECURITY_CONFIG.PERMISSIONS];
  if (!rolePermissions) return false;
  
  return rolePermissions[permission as keyof typeof rolePermissions] === true;
};

// Validation des URLs
export const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return SECURITY_CONFIG.CORS.ALLOWED_ORIGINS.includes(parsedUrl.origin);
  } catch {
    return false;
  }
};

// Validation des types de fichiers
export const isValidFileType = (fileType: string): boolean => {
  return SECURITY_CONFIG.VALIDATION.ALLOWED_FILE_TYPES.includes(fileType);
};

// Validation de la taille de fichier
export const isValidFileSize = (fileSize: number): boolean => {
  return fileSize <= SECURITY_CONFIG.VALIDATION.MAX_FILE_SIZE;
}; 