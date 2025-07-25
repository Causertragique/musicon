import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const IA: React.FC = () => {
  const { user } = useAuth();
  const [selectedTool, setSelectedTool] = useState<'evaluation' | 'exercice' | 'plan-cours' | ''>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  // Utiliser les informations du profil enseignant si disponibles
  const teacherOrder = user?.teachingOrder;
  const teacherLevels = user?.teachingLevels;
  const teacherInstruments = user?.teachingInstruments;
  const teacherProgram = user?.teachingProgram;
  const teacherNotes = user?.teachingNotes;

  // Déterminer l'ordre d'enseignement par défaut
  const getDefaultOrder = () => {
    if (teacherOrder === 'primaire') return 'primaire';
    if (teacherOrder === 'secondaire') return 'secondaire';
    return '';
  };

  // Obtenir tous les niveaux disponibles
  const getAvailableLevels = () => {
    const order = getDefaultOrder();
    if (!order) return [];

    const levels = [];
    
    if (order === 'primaire') {
      levels.push({ value: '1re', label: '1re année' });
      levels.push({ value: '2e', label: '2e année' });
      levels.push({ value: '3e', label: '3e année' });
      levels.push({ value: '4e', label: '4e année' });
      levels.push({ value: '5e', label: '5e année' });
      levels.push({ value: '6e', label: '6e année' });
    } else if (order === 'secondaire') {
      levels.push({ value: 'Sec I', label: 'Sec I' });
      levels.push({ value: 'Sec II', label: 'Sec II' });
      levels.push({ value: 'Sec III', label: 'Sec III' });
      levels.push({ value: 'Sec IV', label: 'Sec IV' });
      levels.push({ value: 'Sec V', label: 'Sec V' });
    }
    
    return levels;
  };

  return (
    <div className="p-6">
      <div className="mb-6 bg-transparent">
        {/* Informations sur le programme québécois */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <img 
              src="/images/QC.png" 
              alt="Drapeau du Québec" 
              className="w-8 h-6 object-contain"
            />
            <span className="font-semibold text-blue-900">Programme de formation de l'école québécoise</span>
          </div>
          <p className="text-blue-800 text-sm mb-2">
            Cet outil IA est basé sur le programme de formation de l'école québécoise (PFEQ) 
            et respecte les compétences et critères d'évaluation officiels du ministère de l'Éducation.
          </p>
          <a 
            href="https://www.education.gouv.qc.ca/enseignants/pfeq/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
          >
            📖 Consulter le programme officiel
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Configuration du profil enseignant */}
        {teacherOrder && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-600">✅</span>
              <span className="font-semibold text-green-900">Profil enseignant configuré</span>
            </div>
            <p className="text-green-800 text-sm">
              Votre profil indique que vous enseignez au <strong>
                {teacherOrder === 'primaire' ? 'primaire' : 'secondaire'}
              </strong>
              {teacherLevels && (
                <span>
                  {' '}dans les cycles : {
                    teacherOrder === 'primaire' ? 
                      Object.entries(teacherLevels.primaire || {})
                        .filter(([_, enabled]) => enabled)
                        .map(([cycle, _]) => cycle === 'cycle1' ? '1' : cycle === 'cycle2' ? '2' : '3')
                        .join(', ') : 
                      Object.entries(teacherLevels.secondaire || {})
                        .filter(([_, enabled]) => enabled)
                        .map(([cycle, _]) => cycle === 'cycle1' ? '1' : '2')
                        .join(', ')
                  }
                </span>
              )}
            </p>
            {teacherNotes && (
              <div className="mt-2 p-2 bg-white rounded border border-green-200">
                <p className="text-xs text-green-700 font-medium mb-1">📝 Précisions :</p>
                <p className="text-xs text-green-800">{teacherNotes}</p>
              </div>
            )}
            {teacherInstruments && (
              <div className="mt-2 p-2 bg-white rounded border border-green-200">
                <p className="text-xs text-green-700 font-medium mb-1">🎵 Instruments :</p>
                <p className="text-xs text-green-800">
                  {Object.entries(teacherInstruments)
                    .filter(([_, enabled]) => enabled)
                    .map(([instrument, _]) => {
                      switch(instrument) {
                        case 'chant': return '🎤 Chant';
                        case 'instrumentOrff': return '🥁 Instrument Orff';
                        case 'harmonie': return '🎺 Harmonie';
                        case 'jazzPop': return '🎷 Jazz / Pop';
                        default: return instrument;
                      }
                    })
                    .join(', ')}
                </p>
              </div>
            )}
            {teacherProgram && (
              <div className="mt-2 p-2 bg-white rounded border border-green-200">
                <p className="text-xs text-green-700 font-medium mb-1">📚 Programme :</p>
                <p className="text-xs text-green-800">
                  {teacherProgram === 'regulier' ? '📖 Régulier' : 
                   teacherProgram === 'concentration' ? '🎯 Concentration' : 
                   '🎼 Musique-Études'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form className="space-y-6">
          {/* Outil */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
            <label className="block text-sm font-semibold text-purple-900 mb-2">
              📝 Outil à créer
            </label>
            <select
              value={selectedTool}
              onChange={(e) => {
                setSelectedTool(e.target.value as any);
                setSelectedLevel('');
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Sélectionner un outil</option>
              <option value="evaluation">📝 Évaluation</option>
              <option value="exercice">🎯 Exercice</option>
              <option value="plan-cours">📚 Plan de Cours</option>
            </select>
          </div>

          {/* Niveau */}
          {selectedTool && (
            <div className="bg-purple-50 rounded-lg p-4">
              <label className="block text-sm font-semibold text-purple-900 mb-2">
                📚 Niveau
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Sélectionner le niveau</option>
                {getAvailableLevels().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Résumé de la sélection */}
          {selectedLevel && (
            <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg p-4 border-2 border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">✅ Sélection confirmée</h4>
              <div className="text-lg font-medium text-blue-800">
                {selectedTool === 'evaluation' ? '📝 Évaluation' : 
                 selectedTool === 'exercice' ? '🎯 Exercice' : '📚 Plan de Cours'} • 
                {(teacherOrder === 'primaire' ? '🎒 Primaire' : '🎓 Secondaire')} • 
                {selectedLevel}
              </div>
              <p className="text-blue-700 text-sm mt-2">
                Prêt pour la génération IA adaptée au système québécois
              </p>
            </div>
          )}

          {/* Bouton pour continuer */}
          {selectedLevel && (
            <div className="text-center">
              <button 
                type="submit"
                className="px-6 py-3 bg-[#1473AA] text-white rounded-lg hover:bg-[#0f5a8a] transition-colors font-semibold"
              >
                🚀 Générer avec l'IA
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default IA; 