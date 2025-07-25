import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../config/security';
import { secureLog } from '../utils/security';

interface SecureRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

export default function SecureRoute({ 
  children, 
  requiredRole, 
  requiredPermission, 
  fallback 
}: SecureRouteProps) {
  const { user } = useAuth();

  // Vérification de l'authentification
  if (!user) {
    secureLog('warn', 'Tentative d\'accès à une route sécurisée sans authentification');
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès Requis</h2>
          <p className="text-gray-600 mb-4">Vous devez être connecté pour accéder à cette page.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn-primary"
          >
            Se Connecter
          </button>
        </div>
      </div>
    );
  }

  // Vérification du rôle requis
  if (requiredRole && user.role !== requiredRole) {
    secureLog('warn', 'Tentative d\'accès avec un rôle insuffisant', { 
      userRole: user.role, 
      requiredRole,
      userId: user.id 
    });
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès Refusé</h2>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <p className="text-sm text-gray-500">
            Rôle requis: {requiredRole} | Votre rôle: {user.role}
          </p>
        </div>
      </div>
    );
  }

  // Vérification de la permission spécifique
  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    secureLog('warn', 'Tentative d\'accès sans permission spécifique', { 
      userRole: user.role, 
      requiredPermission,
      userId: user.id 
    });
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Permission Requise</h2>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas la permission "{requiredPermission}" pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  // Accès autorisé
  secureLog('info', 'Accès autorisé à une route sécurisée', { 
    userId: user.id, 
    userRole: user.role,
    requiredRole,
    requiredPermission 
  });

  return <>{children}</>;
}

// Composant de protection pour les enseignants uniquement
export function TeacherOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <SecureRoute requiredRole="teacher" fallback={fallback}>
      {children}
    </SecureRoute>
  );
}

// Composant de protection pour les administrateurs uniquement
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <SecureRoute requiredRole="admin" fallback={fallback}>
      {children}
    </SecureRoute>
  );
}

// Composant de protection pour les élèves uniquement
export function StudentOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <SecureRoute requiredRole="student" fallback={fallback}>
      {children}
    </SecureRoute>
  );
}

// Composant de protection avec permission spécifique
export function PermissionRequired({ 
  children, 
  permission, 
  fallback 
}: { 
  children: React.ReactNode; 
  permission: string; 
  fallback?: React.ReactNode 
}) {
  return (
    <SecureRoute requiredPermission={permission} fallback={fallback}>
      {children}
    </SecureRoute>
  );
} 