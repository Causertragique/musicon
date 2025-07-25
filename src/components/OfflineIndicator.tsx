import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const OfflineIndicator: React.FC = () => {
  const { isOffline, forceOfflineAccess, user } = useAuth();

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">Mode Hors Ligne</span>
      </div>
      
      {/* Menu d'accès forcé */}
      <div 
        className="mt-2 bg-white rounded-lg shadow-lg p-3 w-[180px]" 
      >
        <h3 className="font-bold text-gray-800 mb-2 text-sm flex items-center">
          <span className="mr-2">🔧</span> Accès Forcé
        </h3>
        
        <div className="space-y-1">
          <button
            onClick={() => forceOfflineAccess('owner')}
            className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white px-2 py-1.5 rounded text-xs font-medium transition-colors"
          >
            <span className="mr-1.5">👑</span> Propriétaire
          </button>
          
          <button
            onClick={() => forceOfflineAccess('teacher')}
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded text-xs font-medium transition-colors"
          >
            <span className="mr-1.5">👨‍🏫</span> Enseignant
          </button>
          
          <button
            onClick={() => forceOfflineAccess('student')}
            className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 rounded text-xs font-medium transition-colors"
          >
            <span className="mr-1.5">👨‍🎓</span> Élève
          </button>
          
          <button
            onClick={() => forceOfflineAccess('admin')}
            className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-2 py-1.5 rounded text-xs font-medium transition-colors"
          >
            <span className="mr-1.5">👨‍💼</span> Admin
          </button>
        </div>
        
        {user && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600 truncate">
              Actuel: <strong>{user.firstName}</strong>
            </p>
            <p className="text-xs text-gray-600">
              Rôle: <strong>{user.role}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator; 