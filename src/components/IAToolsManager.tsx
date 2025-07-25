import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Brain, 
  Music, 
  FileText, 
  BookOpen, 
  Target, 
  Settings, 
  Play, 
  Pause, 
  Download,
  Upload,
  Search,
  FileAudio,
  FileVideo,
  BarChart3,
  Lightbulb,
  Sparkles,
  Zap,
  Star,
  Award,
  Trophy,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';

interface IATool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  status: 'active' | 'inactive' | 'beta';
  features: string[];
  usage: number;
  rating: number;
  recentUsage: number;
  isNew: boolean;
  category: 'evaluation' | 'creation' | 'analysis' | 'resources';
}

const IAToolsManager: React.FC = () => {
  const { user } = useAuth();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showToolModal, setShowToolModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'evaluation' | 'creation' | 'analysis' | 'resources'>('evaluation');

  // Outils IA disponibles
  const aiTools: IATool[] = [
    // CATÉGORIE ÉVALUATION (Violet)
    {
      id: 'smart-quiz',
      name: 'Générateur de Quiz Intelligents',
      description: 'Crée des quiz adaptatifs qui s\'ajustent selon les réponses des élèves',
      icon: <Target className="w-8 h-8" />,
      color: 'bg-purple-500',
      status: 'active',
      features: ['Questions adaptatives', 'Analyse en temps réel', 'Différents types de questions', 'Rapports de performance'],
      usage: 156,
      rating: 4.6,
      recentUsage: 42,
      isNew: false,
      category: 'evaluation'
    },
    {
      id: 'performance-analyzer',
      name: 'Analyseur de Performance',
      description: 'Évalue automatiquement les performances musicales avec critères PFEQ',
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'bg-purple-500',
      status: 'active',
      features: ['Critères PFEQ intégrés', 'Évaluation rythmique', 'Analyse mélodique', 'Grilles personnalisables'],
      usage: 89,
      rating: 4.8,
      recentUsage: 23,
      isNew: false,
      category: 'evaluation'
    },
    {
      id: 'progress-tracker',
      name: 'Suivi de Progrès IA',
      description: 'Suivi intelligent des progrès avec prédictions et recommandations',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'bg-purple-500',
      status: 'beta',
      features: ['Prédictions de progression', 'Recommandations personnalisées', 'Graphiques interactifs', 'Alertes automatiques'],
      usage: 67,
      rating: 4.7,
      recentUsage: 15,
      isNew: true,
      category: 'evaluation'
    },
    {
      id: 'competency-assessor',
      name: 'Évaluateur de Compétences',
      description: 'Évaluation automatique des compétences selon le PFEQ québécois',
      icon: <Award className="w-8 h-8" />,
      color: 'bg-purple-500',
      status: 'active',
      features: ['Compétences PFEQ', 'Évaluation continue', 'Portfolio numérique', 'Rapports détaillés'],
      usage: 134,
      rating: 4.9,
      recentUsage: 38,
      isNew: false,
      category: 'evaluation'
    },

    // CATÉGORIE CRÉATION (Orange)
    {
      id: 'score-creator',
      name: 'Créateur de Partitions Adaptées',
      description: 'Transpose et adapte automatiquement les partitions selon le niveau et l\'instrument',
      icon: <Music className="w-8 h-8" />,
      color: 'bg-orange-500',
      status: 'active',
      features: ['Transposition automatique', 'Simplification de difficulté', 'Arrangements multi-instruments', 'Export PDF', 'Export MusicXML'],
      usage: 78,
      rating: 4.9,
      recentUsage: 25,
      isNew: false,
      category: 'creation'
    },
    {
      id: 'composition-assistant',
      name: 'Assistant de Composition',
      description: 'Aide à la composition avec suggestions harmoniques et mélodiques',
      icon: <Sparkles className="w-8 h-8" />,
      color: 'bg-orange-500',
      status: 'active',
      features: ['Suggestions harmoniques', 'Génération mélodique', 'Analyse de style', 'Export MIDI'],
      usage: 92,
      rating: 4.5,
      recentUsage: 31,
      isNew: false,
      category: 'creation'
    },
    {
      id: 'arrangement-generator',
      name: 'Générateur d\'Arrangements',
      description: 'Crée des arrangements automatiques pour différents ensembles',
      icon: <Zap className="w-8 h-8" />,
      color: 'bg-orange-500',
      status: 'beta',
      features: ['Arrangements multi-voix', 'Adaptation d\'ensemble', 'Styles variés', 'Partitions séparées'],
      usage: 45,
      rating: 4.3,
      recentUsage: 12,
      isNew: true,
      category: 'creation'
    },
    {
      id: 'improvisation-trainer',
      name: 'Entraîneur d\'Improvisation',
      description: 'Développe les compétences d\'improvisation avec accompagnement IA',
      icon: <Play className="w-8 h-8" />,
      color: 'bg-orange-500',
      status: 'active',
      features: ['Accompagnement automatique', 'Suggestions de phrases', 'Analyse en temps réel', 'Enregistrement'],
      usage: 73,
      rating: 4.6,
      recentUsage: 19,
      isNew: false,
      category: 'creation'
    },

    // CATÉGORIE ANALYSE (Vert)
    {
      id: 'audio-analyzer',
      name: 'Analyseur de Pratique Audio',
      description: 'Analyse automatique des enregistrements audio des élèves pour détecter erreurs rythmiques et mélodiques',
      icon: <FileAudio className="w-8 h-8" />,
      color: 'bg-green-500',
      status: 'beta',
      features: ['Analyse rythmique', 'Détection de fausses notes', 'Feedback en temps réel', 'Rapports détaillés'],
      usage: 45,
      rating: 4.8,
      recentUsage: 12,
      isNew: true,
      category: 'analysis'
    },
    {
      id: 'style-analyzer',
      name: 'Analyseur de Style Musical',
      description: 'Analyse et identifie les styles musicaux et les influences',
      icon: <Search className="w-8 h-8" />,
      color: 'bg-green-500',
      status: 'active',
      features: ['Identification de style', 'Analyse harmonique', 'Comparaisons stylistiques', 'Historique musical'],
      usage: 58,
      rating: 4.4,
      recentUsage: 16,
      isNew: false,
      category: 'analysis'
    },
    {
      id: 'practice-insights',
      name: 'Insights de Pratique',
      description: 'Analyse approfondie des habitudes de pratique des élèves',
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'bg-green-500',
      status: 'active',
      features: ['Analyse temporelle', 'Identification des difficultés', 'Recommandations', 'Suivi de motivation'],
      usage: 81,
      rating: 4.7,
      recentUsage: 28,
      isNew: false,
      category: 'analysis'
    },
    {
      id: 'ensemble-analyzer',
      name: 'Analyseur d\'Ensemble',
      description: 'Analyse la cohésion et l\'équilibre des performances d\'ensemble',
      icon: <Users className="w-8 h-8" />,
      color: 'bg-green-500',
      status: 'beta',
      features: ['Analyse d\'équilibre', 'Détection de désynchronisation', 'Feedback d\'ensemble', 'Rapports de groupe'],
      usage: 34,
      rating: 4.2,
      recentUsage: 8,
      isNew: true,
      category: 'analysis'
    },

    // CATÉGORIE RESSOURCES (Bleu)
    {
      id: 'repertoire-assistant',
      name: 'Assistant de Répertoire',
      description: 'Suggère des œuvres adaptées au niveau en utilisant la base de données Twigg-partitions.com avec extraits audio et descriptions',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'bg-blue-500',
      status: 'active',
      features: ['Recherche par difficulté', 'Extraits audio Twigg', 'Descriptions détaillées', 'Liens d\'achat directs'],
      usage: 92,
      rating: 4.7,
      recentUsage: 18,
      isNew: false,
      category: 'resources'
    },
    {
      id: 'resource-generator',
      name: 'Générateur de Ressources',
      description: 'Crée automatiquement des fiches d\'exercices, grilles d\'évaluation et documents pédagogiques',
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-blue-500',
      status: 'active',
      features: ['Fiches d\'exercices', 'Grilles d\'évaluation', 'Plans de cours', 'Templates personnalisables'],
      usage: 203,
      rating: 4.9,
      recentUsage: 67,
      isNew: false,
      category: 'resources'
    },
    {
      id: 'lesson-planner',
      name: 'Planificateur de Cours IA',
      description: 'Génère des plans de cours adaptés au PFEQ pour l\'enseignement en grand ensemble (orchestre, harmonie)',
      icon: <Calendar className="w-8 h-8" />,
      color: 'bg-blue-500',
      status: 'active',
      features: ['Plans PFEQ grand ensemble', 'Répertoire d\'orchestre', 'Ressources intégrées', 'Suivi de progression'],
      usage: 167,
      rating: 4.8,
      recentUsage: 45,
      isNew: false,
      category: 'resources'
    },
    {
      id: 'theory-tutor',
      name: 'Tuteur de Théorie Musicale',
      description: 'Assistant intelligent pour l\'apprentissage de la théorie musicale',
      icon: <BookOpen className="w-8 h-8" />,
      color: 'bg-blue-500',
      status: 'beta',
      features: ['Explications interactives', 'Exercices adaptatifs', 'Progression structurée', 'Évaluation continue'],
      usage: 76,
      rating: 4.5,
      recentUsage: 22,
      isNew: true,
      category: 'resources'
    },
    {
      id: 'pedagogical-library',
      name: 'Bibliothèque Pédagogique IA',
      description: 'Base de données intelligente de ressources pédagogiques québécoises',
      icon: <FileText className="w-8 h-8" />,
      color: 'bg-blue-500',
      status: 'active',
      features: ['Ressources PFEQ', 'Recherche intelligente', 'Partage communautaire', 'Mise à jour automatique'],
      usage: 145,
      rating: 4.6,
      recentUsage: 39,
      isNew: false,
      category: 'resources'
    }
  ];

  // Fonction de filtrage par thématique
  const getFilteredTools = () => {
    return aiTools.filter(tool => tool.category === sortBy);
  };

  const filteredTools = getFilteredTools();

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    setShowToolModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'beta':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Beta</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Inactif</span>;
      default:
        return null;
    }
  };

  const renderToolCard = (tool: IATool) => (
    <div 
      key={tool.id}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-105"
      onClick={() => handleToolSelect(tool.id)}
    >
      <div className="flex items-center justify-center mb-4">
        <div className={`${tool.color} p-4 rounded-lg text-white`}>
          {tool.icon}
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
        {tool.name}
      </h3>
      
      <p className="text-gray-600 text-sm mb-4 text-center">
        {tool.description}
      </p>
      
      <div className="flex items-center justify-center">
        <button className="px-6 py-2 bg-[#1473AA] text-white rounded-lg hover:bg-[#0f5a8a] transition-colors text-sm font-medium">
          Utiliser
        </button>
      </div>
    </div>
  );

  const renderToolList = (tool: IATool) => (
    <div 
      key={tool.id}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => handleToolSelect(tool.id)}
    >
      <div className="flex items-center gap-4">
        <div className={`${tool.color} p-3 rounded-lg text-white`}>
          {tool.icon}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {tool.name}
            </h3>
            {getStatusBadge(tool.status)}
          </div>
          
          <p className="text-gray-600 text-sm mb-3">
            {tool.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{tool.features.length} fonctionnalités</span>
          </div>
        </div>
        
        <button className="px-4 py-2 bg-[#1473AA] text-white rounded-lg hover:bg-[#0f5a8a] transition-colors text-sm font-medium">
          Utiliser
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-6 bg-transparent">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-500" />
              Outils IA - Intelligence Artificielle
            </h2>
            <p className="text-gray-600 mt-2">
              Découvrez nos outils IA spécialement conçus pour l'éducation musicale québécoise
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 text-blue-500 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="grid grid-cols-2 gap-1 w-4 h-4">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-600 text-blue-500 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="space-y-1 w-4 h-4">
                  <div className="bg-current rounded-sm h-0.5"></div>
                  <div className="bg-current rounded-sm h-0.5"></div>
                  <div className="bg-current rounded-sm h-0.5"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Outils de tri */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setSortBy('evaluation')}
            className={`rounded-lg p-4 transition-all duration-200 transform hover:scale-105 cursor-pointer ${
              sortBy === 'evaluation'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                : 'bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800 dark:hover:to-purple-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${sortBy === 'evaluation' ? 'text-purple-100' : 'text-purple-600 dark:text-purple-400'}`}>
                  Évaluation
                </p>
                <p className={`text-2xl font-bold ${sortBy === 'evaluation' ? 'text-white' : 'text-purple-900 dark:text-purple-100'}`}>
                  {aiTools.filter(tool => tool.category === 'evaluation').length}
                </p>
              </div>
              <BarChart3 className={`w-8 h-8 ${sortBy === 'evaluation' ? 'text-purple-100' : 'text-purple-500'}`} />
            </div>
            {sortBy === 'evaluation' && (
              <div className="mt-2 text-xs text-purple-100">
                Trié par nombre d'outils
              </div>
            )}
          </button>
          
          <button
            onClick={() => setSortBy('creation')}
            className={`rounded-lg p-4 transition-all duration-200 transform hover:scale-105 cursor-pointer ${
              sortBy === 'creation'
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                : 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-800 dark:hover:to-orange-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${sortBy === 'creation' ? 'text-orange-100' : 'text-orange-600 dark:text-orange-400'}`}>
                  Création
                </p>
                <p className={`text-2xl font-bold ${sortBy === 'creation' ? 'text-white' : 'text-orange-900 dark:text-orange-100'}`}>
                  {aiTools.filter(tool => tool.category === 'creation').length}
                </p>
              </div>
              <Lightbulb className={`w-8 h-8 ${sortBy === 'creation' ? 'text-orange-100' : 'text-orange-500'}`} />
            </div>
            {sortBy === 'creation' && (
              <div className="mt-2 text-xs text-orange-100">
                Trié par nombre d'outils
              </div>
            )}
          </button>
          
          <button
            onClick={() => setSortBy('analysis')}
            className={`rounded-lg p-4 transition-all duration-200 transform hover:scale-105 cursor-pointer ${
              sortBy === 'analysis'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                : 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800 dark:hover:to-green-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${sortBy === 'analysis' ? 'text-green-100' : 'text-green-600 dark:text-green-400'}`}>
                  Analyse
                </p>
                <p className={`text-2xl font-bold ${sortBy === 'analysis' ? 'text-white' : 'text-green-900 dark:text-green-100'}`}>
                  {aiTools.filter(tool => tool.category === 'analysis').length}
                </p>
              </div>
              <BarChart3 className={`w-8 h-8 ${sortBy === 'analysis' ? 'text-green-100' : 'text-green-500'}`} />
            </div>
            {sortBy === 'analysis' && (
              <div className="mt-2 text-xs text-green-100">
                Trié par nombre d'outils
              </div>
            )}
          </button>
          
          <button
            onClick={() => setSortBy('resources')}
            className={`rounded-lg p-4 transition-all duration-200 transform hover:scale-105 cursor-pointer ${
              sortBy === 'resources'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800 dark:hover:to-blue-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${sortBy === 'resources' ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'}`}>
                  Ressources
                </p>
                <p className={`text-2xl font-bold ${sortBy === 'resources' ? 'text-white' : 'text-blue-900 dark:text-blue-100'}`}>
                  {aiTools.filter(tool => tool.category === 'resources').length}
                </p>
              </div>
              <FileText className={`w-8 h-8 ${sortBy === 'resources' ? 'text-blue-100' : 'text-blue-500'}`} />
            </div>
            {sortBy === 'resources' && (
              <div className="mt-2 text-xs text-blue-100">
                Trié par nombre d'outils
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Grille des outils */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredTools.map(tool => viewMode === 'grid' ? renderToolCard(tool) : renderToolList(tool))}
      </div>

      {/* Modal pour l'outil sélectionné */}
      {showToolModal && selectedTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {aiTools.find(t => t.id === selectedTool)?.name}
              </h3>
              <button
                onClick={() => setShowToolModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  {aiTools.find(t => t.id === selectedTool)?.description}
                </p>
                <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Fonctionnalités :</h4>
                  <ul className="space-y-1">
                    {aiTools.find(t => t.id === selectedTool)?.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                        <Sparkles className="w-3 h-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-center">
                  <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold">
                    Commencer à utiliser cet outil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IAToolsManager; 