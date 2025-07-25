import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings } from 'lucide-react';

export default function RoleSwitcher() {
  const { user, switchRole, availableRoles } = useAuth();

  // Afficher le sélecteur pour info@guillaumehetu.com et les utilisateurs educrm.ca
  if (!user || (user.email !== 'info@guillaumehetu.com' && !user.email.endsWith('@educrm.ca'))) {
    return null;
  }

  // Déterminer quels rôles sont disponibles selon le rôle actuel
  const getAvailableRolesForUser = () => {
    if (user.role === 'admin') {
      return ['teacher', 'student', 'admin']; // Admin peut tout faire
    } else if (user.role === 'teacher') {
      return ['teacher', 'student']; // Enseignant peut devenir élève
    } else {
      return ['student']; // Élève ne peut que rester élève
    }
  };

  const userAvailableRoles = getAvailableRolesForUser();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Settings className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-medium text-blue-900">Sélecteur de Rôle</h3>
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-blue-700">Rôle actuel :</span>
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {user.role === 'teacher' && '👨‍🏫 Enseignant'}
          {user.role === 'student' && '👨‍🎓 Élève'}
          {user.role === 'admin' && '👑 Administrateur'}
        </span>
      </div>
      
      <div className="flex gap-2">
        {availableRoles.map((role) => {
          // Vérifier si l'utilisateur peut accéder à ce rôle
          const canAccessRole = userAvailableRoles.includes(role);
          
          return (
            <button
              key={role}
              onClick={() => canAccessRole && switchRole(role)}
              disabled={!canAccessRole}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                user.role === role
                  ? 'bg-blue-600 text-white'
                  : canAccessRole
                  ? 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                  : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
              }`}
              title={!canAccessRole ? 'Vous n\'avez pas les permissions pour ce rôle' : ''}
            >
              {role === 'teacher' && '👨‍🏫 Enseignant'}
              {role === 'student' && '👨‍🎓 Élève'}
              {role === 'admin' && '👑 Admin'}
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-blue-600 mt-2">
        {user.role === 'admin' 
          ? 'Vous pouvez changer de rôle pour tester les différentes fonctionnalités de l\'application.'
          : user.role === 'teacher'
          ? 'Vous pouvez basculer vers le rôle d\'élève pour tester l\'interface étudiante.'
          : 'Vous êtes en mode élève. Seuls les administrateurs peuvent changer de rôle.'
        }
      </p>
    </div>
  );
} 