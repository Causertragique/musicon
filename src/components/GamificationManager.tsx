import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Trophy, Star, Award, Target, TrendingUp, Users, BookOpen, Calendar } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  pointsRequired: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

interface StudentProgress {
  totalPoints: number;
  level: number;
  badges: Badge[];
  streak: number;
  lessonsCompleted: number;
  assignmentsCompleted: number;
  lastActivity: Date;
}

const TeacherGamificationOverview = ({ viewMode, setViewMode }: { viewMode: 'grid' | 'list'; setViewMode: React.Dispatch<React.SetStateAction<'grid' | 'list'>> }) => {
  const [activeStudents, setActiveStudents] = useState(12);
  const [totalPoints, setTotalPoints] = useState(2847);
  const [averageLevel, setAverageLevel] = useState(3.2);
  const [badgesUnlocked, setBadgesUnlocked] = useState(47);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [messageText, setMessageText] = useState('');
  const [pointsToAward, setPointsToAward] = useState(10);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeDescription, setChallengeDescription] = useState('');
  const [customBadgeName, setCustomBadgeName] = useState('');
  const [customBadgeDescription, setCustomBadgeDescription] = useState('');
  const [customBadgeIcon, setCustomBadgeIcon] = useState('🏆');
  const [customBadgeCriteria, setCustomBadgeCriteria] = useState('');
  const [showAISuggestion, setShowAISuggestion] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [customBadgeImage, setCustomBadgeImage] = useState<File | null>(null);
  const [useCustomImage, setUseCustomImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showCreateBadgeForm, setShowCreateBadgeForm] = useState(false);
  const [editingBadgeId, setEditingBadgeId] = useState<string | null>(null);
  const [editingBadgeCriteria, setEditingBadgeCriteria] = useState<string>('');
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [showQuebecEvaluationModal, setShowQuebecEvaluationModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<'primaire' | 'secondaire' | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedCompetency, setSelectedCompetency] = useState<string | null>(null);

  // Bloquer le scroll du body quand une modale est ouverte
  useEffect(() => {
    const isModalOpen = showMessageModal || showPointsModal || showChallengeModal || showBadgesModal || showReportsModal || showLeaderboardModal || showCoachModal || showQuebecEvaluationModal;
    
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // Cleanup quand le composant se démonte
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [showMessageModal, showPointsModal, showChallengeModal, showBadgesModal, showReportsModal, showLeaderboardModal, showCoachModal, showQuebecEvaluationModal]);

  // Simuler des étudiants pour la démo
  const students = [
    { id: '1', name: 'Marie Dubois', avatar: 'https://ui-avatars.com/api/?name=Marie+Dubois&background=1473AA&color=fff&size=32' },
    { id: '2', name: 'Lucas Martin', avatar: 'https://ui-avatars.com/api/?name=Lucas+Martin&background=10B981&color=fff&size=32' },
    { id: '3', name: 'Sophie Bernard', avatar: 'https://ui-avatars.com/api/?name=Sophie+Bernard&background=8B5CF6&color=fff&size=32' },
    { id: '4', name: 'Thomas Moreau', avatar: 'https://ui-avatars.com/api/?name=Thomas+Moreau&background=F59E0B&color=fff&size=32' },
    { id: '5', name: 'Emma Leroy', avatar: 'https://ui-avatars.com/api/?name=Emma+Leroy&background=EF4444&color=fff&size=32' }
  ];

  // Badges automatiques et personnalisés
  const automaticBadges = [
    { id: '1', name: 'Premier Pas', icon: '👣', description: 'Première pratique complétée', criteria: 'Compléter sa première pratique', customCriteria: '1', unlocked: true, editable: true },
    { id: '2', name: 'Débutant', icon: '🎵', description: 'Pratiques complétées', criteria: 'Compléter 5 pratiques', customCriteria: '5', unlocked: true, editable: true },
    { id: '3', name: 'Persévérant', icon: '💪', description: 'Jours de pratique consécutifs', criteria: 'Pratiquer 7 jours consécutifs', customCriteria: '7', unlocked: true, editable: true },
    { id: '4', name: 'Ponctuel', icon: '⏰', description: 'Cours à l\'heure consécutifs', criteria: 'Arriver à l\'heure à 5 cours consécutifs', customCriteria: '5', unlocked: false, editable: true },
    { id: '5', name: 'Pratique Régulière', icon: '📅', description: 'Jours de pratique', criteria: 'Pratiquer pendant 30 jours', customCriteria: '30', unlocked: false, editable: true },
    { id: '6', name: 'Intermédiaire', icon: '🎼', description: 'Pratiques complétées', criteria: 'Compléter 50 pratiques', customCriteria: '50', unlocked: false, editable: true },
    { id: '7', name: 'Virtuose', icon: '🎼', description: 'Pratiques complétées', criteria: 'Compléter 100 pratiques', customCriteria: '100', unlocked: false, editable: true },
    { id: '8', name: 'Excellence', icon: '⭐', description: 'Note parfaite', criteria: 'Obtenir une note parfaite sur un devoir', customCriteria: '100%', unlocked: false, editable: true },
    { id: '9', name: 'Collaborateur', icon: '🤝', description: 'Étudiants aidés', criteria: 'Aider 5 autres étudiants', customCriteria: '5', unlocked: false, editable: true },
    { id: '10', name: 'Maître', icon: '👑', description: 'Niveau expert atteint', criteria: 'Atteindre le niveau expert', customCriteria: 'Expert', unlocked: false, editable: true },
    { id: '11', name: 'Rythmicien', icon: '🥁', description: 'Maîtrise du rythme', criteria: 'Compléter 20 exercices de rythme', customCriteria: '20', unlocked: false, editable: true },
    { id: '12', name: 'Harmoniste', icon: '🎹', description: 'Compréhension harmonique', criteria: 'Analyser 10 pièces musicales', customCriteria: '10', unlocked: false, editable: true },
    { id: '13', name: 'Mélodiste', icon: '🎤', description: 'Création mélodique', criteria: 'Composer 5 mélodies originales', customCriteria: '5', unlocked: false, editable: true },
    { id: '14', name: 'Auditeur', icon: '👂', description: 'Écoute active', criteria: 'Participer à 15 sessions d\'écoute', customCriteria: '15', unlocked: false, editable: true },
    { id: '15', name: 'Théoricien', icon: '📚', description: 'Connaissances théoriques', criteria: 'Réussir 8 tests de théorie', customCriteria: '8', unlocked: false, editable: true },
    { id: '16', name: 'Performeur', icon: '🎭', description: 'Performance en public', criteria: 'Participer à 3 concerts', customCriteria: '3', unlocked: false, editable: true },
    { id: '17', name: 'Innovateur', icon: '💡', description: 'Créativité musicale', criteria: 'Créer 2 arrangements originaux', customCriteria: '2', unlocked: false, editable: true },
    { id: '18', name: 'Déterminé', icon: '🎯', description: 'Objectifs atteints', criteria: 'Atteindre 10 objectifs personnels', customCriteria: '10', unlocked: false, editable: true },
    { id: '19', name: 'Motivé', icon: '🔥', description: 'Motivation constante', criteria: 'Maintenir 60 jours de pratique', customCriteria: '60', unlocked: false, editable: true },
    { id: '20', name: 'Légende', icon: '🌟', description: 'Accomplissement ultime', criteria: 'Débloquer tous les autres badges', customCriteria: 'Tous', unlocked: false, editable: true }
  ];

  const customBadges = [
    { id: 'c1', name: 'Badge Spécial Piano', icon: '🎹', description: 'Maîtrise du piano', criteria: 'Compléter le niveau intermédiaire', unlocked: false },
    { id: 'c2', name: 'Créateur', icon: '🎨', description: 'Création musicale', criteria: 'Composer une pièce originale', unlocked: false },
    { id: 'c3', name: 'Jazz Master', icon: '🎷', description: 'Maîtrise du jazz', criteria: 'Improviser en jazz pendant 10 minutes', unlocked: false },
    { id: 'c4', name: 'Classique', icon: '🎻', description: 'Répertoire classique', criteria: 'Interpréter 5 pièces classiques', unlocked: false },
    { id: 'c5', name: 'Rock Star', icon: '🎸', description: 'Style rock', criteria: 'Maîtriser 3 techniques rock', unlocked: false },
    { id: 'c6', name: 'Blues Man', icon: '🎵', description: 'Blues authentique', criteria: 'Jouer 5 standards de blues', unlocked: false },
    { id: 'c7', name: 'Folk Artist', icon: '🪕', description: 'Musique folk', criteria: 'Apprendre 4 chansons folk', unlocked: false },
    { id: 'c8', name: 'Electronic', icon: '🎛️', description: 'Musique électronique', criteria: 'Créer 2 morceaux électroniques', unlocked: false },
    { id: 'c9', name: 'World Music', icon: '🌍', description: 'Musiques du monde', criteria: 'Explorer 3 styles ethniques', unlocked: false },
    { id: 'c10', name: 'Film Composer', icon: '🎬', description: 'Musique de film', criteria: 'Composer une bande sonore', unlocked: false }
  ];

  // Suggestions IA pour les badges
  const aiBadgeSuggestions = [
    {
      name: 'Compositeur en Herbe',
      icon: '🎼',
      description: 'Création musicale originale',
      criteria: 'Composer une pièce de 2 minutes minimum'
    },
    {
      name: 'Mémoire Musicale',
      icon: '🧠',
      description: 'Mémorisation de pièces',
      criteria: 'Jouer 3 pièces par cœur sans partition'
    },
    {
      name: 'Improvisateur',
      icon: '🎹',
      description: 'Improvisation musicale',
      criteria: 'Improviser pendant 5 minutes sur un thème donné'
    },
    {
      name: 'Mentor',
      icon: '👨‍🏫',
      description: 'Aide aux nouveaux élèves',
      criteria: 'Former 3 nouveaux élèves sur une technique'
    },
    {
      name: 'Perfectionniste',
      icon: '✨',
      description: 'Excellence technique',
      criteria: 'Obtenir 95% ou plus sur 5 devoirs consécutifs'
    },
    {
      name: 'Explorateur',
      icon: '🔍',
      description: 'Découverte de nouveaux styles',
      criteria: 'Apprendre 3 styles musicaux différents'
    }
  ];

  // Fonctions pour les actions
  const handleSendMessage = () => {
    if (selectedStudent && messageText.trim()) {
      // Ici on enverrait le message à l'étudiant via Firebase
      console.log(`Message envoyé à ${selectedStudent}: ${messageText}`);
      alert(`Message d'encouragement envoyé à ${students.find(s => s.id === selectedStudent)?.name}!`);
      setShowMessageModal(false);
      setMessageText('');
      setSelectedStudent('');
    }
  };

  const handleAwardPoints = () => {
    if (selectedStudent && pointsToAward > 0) {
      // Ici on ajouterait les points à l'étudiant via Firebase
      console.log(`${pointsToAward} points attribués à ${selectedStudent}`);
      alert(`${pointsToAward} points attribués à ${students.find(s => s.id === selectedStudent)?.name}!`);
      setShowPointsModal(false);
      setPointsToAward(10);
      setSelectedStudent('');
    }
  };

  const handleCreateChallenge = () => {
    if (challengeTitle.trim() && challengeDescription.trim()) {
      // Ici on créerait le challenge via Firebase
      console.log(`Challenge créé: ${challengeTitle}`);
      alert(`Challenge "${challengeTitle}" créé avec succès!`);
      setShowChallengeModal(false);
      setChallengeTitle('');
      setChallengeDescription('');
    }
  };

  const handleCreateCustomBadge = () => {
    if (customBadgeName.trim() && customBadgeDescription.trim() && customBadgeCriteria.trim()) {
      // Ici on créerait le badge personnalisé via Firebase
      console.log(`Badge personnalisé créé: ${customBadgeName}`);
      alert(`Badge "${customBadgeName}" créé avec succès! Il se débloquera automatiquement quand les critères seront remplis.`);
      setShowBadgesModal(false);
      setCustomBadgeName('');
      setCustomBadgeDescription('');
      setCustomBadgeIcon('🏆');
      setCustomBadgeCriteria('');
    }
  };

  // Fonction pour générer une suggestion IA
  const generateAISuggestion = () => {
    const randomSuggestion = aiBadgeSuggestions[Math.floor(Math.random() * aiBadgeSuggestions.length)];
    setCustomBadgeName(randomSuggestion.name);
    setCustomBadgeDescription(randomSuggestion.description);
    setCustomBadgeIcon(randomSuggestion.icon);
    setCustomBadgeCriteria(randomSuggestion.criteria);
    setAiSuggestion(`💡 Suggestion IA générée : "${randomSuggestion.name}"`);
    setShowAISuggestion(true);
    
    // Masquer la suggestion après 3 secondes
    setTimeout(() => setShowAISuggestion(false), 3000);
  };

  // Fonction pour gérer l'upload d'image
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image valide (JPG, PNG, GIF, SVG)');
        return;
      }
      
      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('L\'image doit faire moins de 2MB');
        return;
      }
      
      setCustomBadgeImage(file);
      setUseCustomImage(true);
      
      // Créer la prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fonction pour supprimer l'image
  const removeCustomImage = () => {
    setCustomBadgeImage(null);
    setUseCustomImage(false);
    setImagePreview('');
  };

  const handleEditBadgeCriteria = (badgeId: string, currentCriteria: string) => {
    setEditingBadgeId(badgeId);
    setEditingBadgeCriteria(currentCriteria);
  };

  const handleSaveBadgeCriteria = (badgeId: string) => {
    // Mettre à jour les critères du badge dans la liste
    const updatedBadges = automaticBadges.map(badge => 
      badge.id === badgeId 
        ? { ...badge, criteria: editingBadgeCriteria, customCriteria: editingBadgeCriteria }
        : badge
    );
    // Ici vous pourriez sauvegarder dans Firebase
    console.log('Critères mis à jour pour le badge:', badgeId, editingBadgeCriteria);
    setEditingBadgeId(null);
    setEditingBadgeCriteria('');
  };

  const handleCancelEdit = () => {
    setEditingBadgeId(null);
    setEditingBadgeCriteria('');
  };

  // Outils de gamification de base avec actions
  const baseTools = [
    {
      id: 'messages',
      name: 'Messages d\'Encouragement',
      icon: '💬',
      status: 'active',
      usage: 'Utilisé 3 fois cette semaine',
      action: 'Envoyer un message',
      onClick: () => setShowMessageModal(true)
    },
    {
      id: 'reports',
      name: 'Rapports et Analyses',
      icon: '📊',
      status: 'active',
      usage: 'Dernier rapport : il y a 2 jours',
      action: 'Voir les rapports',
      onClick: () => setShowReportsModal(true)
    },
    {
      id: 'challenges',
      name: 'Challenges et Défis',
      icon: '🎯',
      status: 'active',
      usage: '2 challenges actifs',
      action: 'Gérer les challenges',
      onClick: () => setShowChallengeModal(true)
    },
    {
      id: 'badges',
      name: 'Badges',
      icon: '🏆',
      status: 'active',
      usage: '15 badges débloqués automatiquement ce mois',
      action: 'Gérer les badges',
      onClick: () => setShowBadgesModal(true)
    },
    {
      id: 'leaderboard',
      name: 'Classements',
      icon: '🥇',
      status: 'active',
      usage: 'Mis à jour automatiquement',
      action: 'Voir le classement',
      onClick: () => setShowLeaderboardModal(true)
    },
    {
      id: 'ai-coach',
      name: 'Coach IA',
      icon: '🤖',
      status: 'active',
      usage: '5 suggestions cette semaine',
      action: 'Voir les suggestions',
      onClick: () => setShowCoachModal(true)
    },
    {
      id: 'quebec-evaluation',
      name: 'Évaluation IA Québec',
      icon: '🇨🇦',
      status: 'active',
      usage: 'Système d\'évaluation adapté au Québec',
      action: 'Ouvrir l\'outil',
      onClick: () => setShowQuebecEvaluationModal(true)
    }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-[#1473AA] to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Vue d'ensemble de la Gamification</h2>
        <p className="text-blue-100">Gère tes outils de gamification et surveille l'engagement de tes étudiants</p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-[#1473AA]">{activeStudents}</div>
              <div className="text-sm text-gray-600">Étudiants actifs</div>
            </div>
            <div className="text-2xl">👥</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">{totalPoints}</div>
              <div className="text-sm text-gray-600">Points totaux</div>
            </div>
            <div className="text-2xl">⭐</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">{averageLevel}</div>
              <div className="text-sm text-gray-600">Niveau moyen</div>
            </div>
            <div className="text-2xl">📈</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">{badgesUnlocked}</div>
              <div className="text-sm text-gray-600">Badges débloqués</div>
            </div>
            <div className="text-2xl">🏆</div>
          </div>
        </div>
      </div>

      {/* Outils de gamification de base */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">🛠️ Outils de Gamification</h3>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">Tous les outils de base sont actifs</div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'grid' 
                    ? 'bg-[#1473AA] text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Grille
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'list' 
                    ? 'bg-[#1473AA] text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Liste
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {baseTools.map((tool) => (
              <div key={tool.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl">{tool.icon}</div>
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    Actif
                  </div>
                </div>
                
                <h4 className="font-semibold mb-2 text-gray-800">{tool.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{tool.usage}</p>
                
                <button 
                  onClick={tool.onClick}
                  className="w-full bg-[#1473AA] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#0f5a8a] transition-colors"
                >
                  {tool.action}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {baseTools.map((tool) => (
              <div key={tool.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{tool.icon}</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{tool.name}</h4>
                    <p className="text-sm text-gray-600">{tool.usage}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                    Actif
                  </div>
                  <button 
                    onClick={tool.onClick}
                    className="bg-[#1473AA] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#0f5a8a] transition-colors"
                  >
                    {tool.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      {/* Modale pour envoyer un message */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Envoyer un message d'encouragement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un étudiant</label>
                <select 
                  value={selectedStudent} 
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Choisir un étudiant...</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Écris ton message d'encouragement..."
                  className="w-full p-2 border border-gray-300 rounded-lg h-24"
                />
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSendMessage}
                  className="flex-1 px-4 py-2 bg-[#1473AA] text-white rounded-lg hover:bg-[#0f5a8a]"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale pour attribuer des points */}
      {showPointsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Attribuer des points</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un étudiant</label>
                <select 
                  value={selectedStudent} 
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Choisir un étudiant...</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de points</label>
                <input 
                  type="number"
                  value={pointsToAward}
                  onChange={(e) => setPointsToAward(parseInt(e.target.value) || 0)}
                  min="1"
                  max="100"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowPointsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleAwardPoints}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Attribuer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale pour créer un challenge */}
      {showChallengeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Créer un challenge</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre du challenge</label>
                <input 
                  type="text"
                  value={challengeTitle}
                  onChange={(e) => setChallengeTitle(e.target.value)}
                  placeholder="Ex: 7 jours de pratique consécutifs"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                  value={challengeDescription}
                  onChange={(e) => setChallengeDescription(e.target.value)}
                  placeholder="Décris le challenge et ses objectifs..."
                  className="w-full p-2 border border-gray-300 rounded-lg h-24"
                />
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowChallengeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleCreateChallenge}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale pour gérer les badges */}
      {showBadgesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <h3 className="text-lg font-semibold mb-4">Gestion des Badges</h3>
            
            {/* Explication du système automatique */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">🎯 Système Automatique</h4>
              <p className="text-sm text-blue-800 mb-2">
                Les badges se débloquent automatiquement quand les élèves accomplissent des tâches spécifiques. 
                Tu peux créer tes propres badges personnalisés qui se débloqueront selon tes critères.
              </p>
              <p className="text-sm text-blue-800">
                <strong>✨ Nouveau :</strong> Tu peux maintenant personnaliser les critères des badges automatiques 
                en cliquant sur le bouton ✏️ pour les adapter à tes objectifs pédagogiques !
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
              {/* Badges automatiques existants */}
              <div className="overflow-hidden">
                <h4 className="font-semibold text-gray-800 mb-3">🏆 Badges Automatiques</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {automaticBadges.map((badge) => (
                    <div key={badge.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border">
                      <div className="text-2xl">{badge.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{badge.name}</div>
                        <div className="text-xs text-gray-600">{badge.description}</div>
                        {editingBadgeId === badge.id ? (
                          <div className="mt-2 space-y-2">
                            <input
                              type="text"
                              value={editingBadgeCriteria}
                              onChange={(e) => setEditingBadgeCriteria(e.target.value)}
                              placeholder="Entrez les nouveaux critères..."
                              className="w-full p-2 border border-gray-300 rounded text-xs"
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSaveBadgeCriteria(badge.id)}
                                className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                              >
                                Sauvegarder
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-blue-600 mt-1">
                            Critères: {badge.criteria}
                            {badge.customCriteria && badge.customCriteria !== badge.criteria && (
                              <span className="text-purple-600 ml-1">(Personnalisé)</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 text-xs rounded-full ${
                          badge.unlocked 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {badge.unlocked ? 'Débloqué' : 'Verrouillé'}
                        </div>
                        {editingBadgeId !== badge.id && (
                          <button
                            onClick={() => handleEditBadgeCriteria(badge.id, badge.criteria)}
                            className="text-gray-500 hover:text-blue-600 transition-colors"
                            title="Modifier les critères"
                          >
                            ✏️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges personnalisés */}
              <div className="overflow-hidden">
                <h4 className="font-semibold text-gray-800 mb-3">🎨 Badges Personnalisés</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                  {customBadges.map((badge) => (
                    <div key={badge.id} className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-2xl">{badge.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{badge.name}</div>
                        <div className="text-xs text-gray-600">{badge.description}</div>
                        <div className="text-xs text-purple-600 mt-1">Critères: {badge.criteria}</div>
                      </div>
                      <div className="text-xs text-purple-600">Personnalisé</div>
                    </div>
                  ))}
                </div>

                {/* Formulaire pour créer un nouveau badge */}
                <div className="border-t pt-4">
                  {!showCreateBadgeForm ? (
                    <div className="text-center">
                      <button
                        onClick={() => setShowCreateBadgeForm(true)}
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-all"
                      >
                        <span className="text-xl">➕</span>
                        <span className="font-medium">Créer un nouveau badge</span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-800">➕ Créer un nouveau badge</h5>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={generateAISuggestion}
                            className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm hover:from-purple-600 hover:to-pink-600 transition-all"
                          >
                            <span>🤖</span>
                            Inspiration IA
                          </button>
                          <button
                            onClick={() => {
                              setShowCreateBadgeForm(false);
                              setCustomBadgeName('');
                              setCustomBadgeDescription('');
                              setCustomBadgeIcon('🏆');
                              setCustomBadgeCriteria('');
                              setUseCustomImage(false);
                              setCustomBadgeImage(null);
                              setImagePreview('');
                            }}
                            className="px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      
                      {/* Notification de suggestion IA */}
                      {showAISuggestion && (
                        <div className="mb-3 p-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">{aiSuggestion}</p>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nom du badge</label>
                          <input 
                            type="text"
                            value={customBadgeName}
                            onChange={(e) => setCustomBadgeName(e.target.value)}
                            placeholder="Ex: Maîtrise du piano"
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea 
                            value={customBadgeDescription}
                            onChange={(e) => setCustomBadgeDescription(e.target.value)}
                            placeholder="Décris ce que représente ce badge..."
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm h-16"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Icône</label>
                            <input 
                              type="text"
                              value={customBadgeIcon}
                              onChange={(e) => setCustomBadgeIcon(e.target.value)}
                              placeholder="Ex: 🎹"
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                              disabled={useCustomImage}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Critères</label>
                            <input 
                              type="text"
                              value={customBadgeCriteria}
                              onChange={(e) => setCustomBadgeCriteria(e.target.value)}
                              placeholder="Ex: Compléter le niveau intermédiaire"
                              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </div>

                        {/* Section pour l'image personnalisée */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h6 className="font-medium text-gray-700">🖼️ Image personnalisée (optionnel)</h6>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={useCustomImage}
                                onChange={(e) => {
                                  setUseCustomImage(e.target.checked);
                                  if (!e.target.checked) {
                                    removeCustomImage();
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-sm text-gray-600">Utiliser une image</span>
                            </label>
                          </div>
                          
                          {useCustomImage && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <label className="flex-1">
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer">
                                    <div className="text-gray-500">
                                      <div className="text-2xl mb-2">📁</div>
                                      <div className="text-sm">Cliquez pour sélectionner une image</div>
                                      <div className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, SVG (max 2MB)</div>
                                    </div>
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                  />
                                </label>
                                
                                {imagePreview && (
                                  <div className="relative">
                                    <img
                                      src={imagePreview}
                                      alt="Aperçu du badge"
                                      className="w-16 h-16 rounded-lg object-cover border"
                                    />
                                    <button
                                      onClick={removeCustomImage}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="text-sm text-blue-800">
                                  <div className="font-medium mb-1">💡 Conseils pour l'image :</div>
                                  <ul className="text-xs space-y-1">
                                    <li>• Format carré recommandé (ex: 128x128px)</li>
                                    <li>• Fond transparent pour un meilleur rendu</li>
                                    <li>• Couleurs vives pour attirer l'attention</li>
                                    <li>• Design simple et reconnaissable</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button 
                onClick={() => setShowBadgesModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Fermer
              </button>
              <button 
                onClick={handleCreateCustomBadge}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Créer le Badge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale pour les rapports et analyses */}
      {showReportsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <h3 className="text-lg font-semibold mb-4">📊 Rapports et Analyses</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Statistiques d'engagement */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">📈 Engagement des Étudiants</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Taux de participation</span>
                    <span className="font-semibold text-blue-600">87%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Temps moyen par session</span>
                    <span className="font-semibold text-blue-600">45 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Devoirs complétés</span>
                    <span className="font-semibold text-blue-600">142/180</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Badges débloqués</span>
                    <span className="font-semibold text-blue-600">89</span>
                  </div>
                </div>
              </div>

              {/* Progression par niveau */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">🎯 Progression par Niveau</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Niveau 1-3</span>
                    <span className="font-semibold text-green-600">12 étudiants</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Niveau 4-6</span>
                    <span className="font-semibold text-green-600">8 étudiants</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Niveau 7-9</span>
                    <span className="font-semibold text-green-600">5 étudiants</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Niveau 10+</span>
                    <span className="font-semibold text-green-600">3 étudiants</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphiques et tendances */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">📊 Tendances sur 30 jours</h4>
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📈</div>
                <p>Graphiques interactifs en cours de développement</p>
                <p className="text-sm">Visualisation des tendances d'engagement, progression et performance</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button 
                onClick={() => setShowReportsModal(false)}
                className="px-4 py-2 bg-[#1473AA] text-white rounded-lg hover:bg-[#0f5a8a]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale pour le classement */}
      {showLeaderboardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <h3 className="text-lg font-semibold mb-4">🥇 Classement des Étudiants</h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Top 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🥇</div>
                  <div className="font-bold text-lg">Marie Dubois</div>
                  <div className="text-yellow-600 font-semibold">1,250 points</div>
                  <div className="text-sm text-gray-600">Niveau 12</div>
                </div>
                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🥈</div>
                  <div className="font-bold text-lg">Lucas Martin</div>
                  <div className="text-gray-600 font-semibold">1,180 points</div>
                  <div className="text-sm text-gray-600">Niveau 11</div>
                </div>
                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🥉</div>
                  <div className="font-bold text-lg">Emma Bernard</div>
                  <div className="text-orange-600 font-semibold">1,120 points</div>
                  <div className="text-sm text-gray-600">Niveau 10</div>
                </div>
              </div>

              {/* Liste complète */}
              <div className="space-y-2">
                {[
                  { name: 'Thomas Leroy', points: 980, level: 9, badges: 8 },
                  { name: 'Sophie Moreau', points: 920, level: 8, badges: 7 },
                  { name: 'Alexandre Petit', points: 870, level: 8, badges: 6 },
                  { name: 'Camille Roux', points: 820, level: 7, badges: 6 },
                  { name: 'Hugo Simon', points: 780, level: 7, badges: 5 },
                  { name: 'Léa Durand', points: 740, level: 6, badges: 5 },
                  { name: 'Jules Mercier', points: 700, level: 6, badges: 4 },
                  { name: 'Chloé Blanc', points: 660, level: 5, badges: 4 }
                ].map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-semibold text-gray-500 w-8">#{index + 4}</div>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-600">Niveau {student.level} • {student.badges} badges</div>
                      </div>
                    </div>
                    <div className="font-semibold text-[#1473AA]">{student.points} points</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button 
                onClick={() => setShowLeaderboardModal(false)}
                className="px-4 py-2 bg-[#1473AA] text-white rounded-lg hover:bg-[#0f5a8a]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale pour le coach IA */}
      {showCoachModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <h3 className="text-lg font-semibold mb-4">🤖 Coach IA - Suggestions Personnalisées</h3>
            
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {/* Suggestions d'engagement */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">💡 Suggestions d'Engagement</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <div className="font-medium">Créer un challenge de groupe</div>
                      <div className="text-sm text-gray-600">Marie et Lucas ont des niveaux similaires. Un défi commun pourrait les motiver mutuellement.</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">🏆</div>
                    <div>
                      <div className="font-medium">Attribuer des badges de progression</div>
                      <div className="text-sm text-gray-600">3 étudiants sont proches du niveau suivant. Un badge intermédiaire pourrait les encourager.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analyse des performances */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">📊 Analyse des Performances</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">📈</div>
                    <div>
                      <div className="font-medium">Progression exceptionnelle</div>
                      <div className="text-sm text-gray-600">Emma Bernard a amélioré ses performances de 25% ce mois. Considérer un badge spécial.</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">⚠️</div>
                    <div>
                      <div className="font-medium">Attention requise</div>
                      <div className="text-sm text-gray-600">Thomas Leroy n'a pas pratiqué depuis 5 jours. Envoyer un message d'encouragement.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommandations pédagogiques */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3">🎓 Recommandations Pédagogiques</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">📚</div>
                    <div>
                      <div className="font-medium">Adapter la difficulté</div>
                      <div className="text-sm text-gray-600">Le groupe de niveau 6-8 pourrait bénéficier d'exercices plus avancés pour maintenir l'engagement.</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">🤝</div>
                    <div>
                      <div className="font-medium">Encourager l'entraide</div>
                      <div className="text-sm text-gray-600">Créer des binômes entre étudiants de niveaux différents pour favoriser l'apprentissage collaboratif.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button 
                onClick={() => setShowCoachModal(false)}
                className="px-4 py-2 bg-[#1473AA] text-white rounded-lg hover:bg-[#0f5a8a]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale pour l'évaluation IA québécoise */}
      {showQuebecEvaluationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <h3 className="text-lg font-semibold mb-4">🇨🇦 Évaluation IA - Système Québécois</h3>
            
            <div className="space-y-6">
              {/* Étape 1: Ordre d'enseignement */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">1️⃣ Sélectionner l'ordre d'enseignement</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setSelectedOrder('primaire');
                      setSelectedCycle(null);
                      setSelectedLevel(null);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedOrder === 'primaire'
                        ? 'border-blue-500 bg-blue-100 text-blue-800'
                        : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">🎒</div>
                    <div className="font-semibold">Primaire</div>
                    <div className="text-sm text-gray-600">1re à 6e année</div>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOrder('secondaire');
                      setSelectedCycle(null);
                      setSelectedLevel(null);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedOrder === 'secondaire'
                        ? 'border-blue-500 bg-blue-100 text-blue-800'
                        : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">🎓</div>
                    <div className="font-semibold">Secondaire</div>
                    <div className="text-sm text-gray-600">Sec I à Sec V</div>
                  </button>
                </div>
              </div>

              {/* Étape 2: Cycle (si ordre sélectionné) */}
              {selectedOrder && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-3">2️⃣ Sélectionner le cycle</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedOrder === 'primaire' ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedCycle('cycle1');
                            setSelectedLevel(null);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedCycle === 'cycle1'
                              ? 'border-green-500 bg-green-100 text-green-800'
                              : 'border-gray-300 bg-white hover:border-green-300 hover:bg-green-50'
                          }`}
                        >
                          <div className="font-semibold">Cycle 1</div>
                          <div className="text-sm text-gray-600">1re et 2e année</div>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCycle('cycle2');
                            setSelectedLevel(null);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedCycle === 'cycle2'
                              ? 'border-green-500 bg-green-100 text-green-800'
                              : 'border-gray-300 bg-white hover:border-green-300 hover:bg-green-50'
                          }`}
                        >
                          <div className="font-semibold">Cycle 2</div>
                          <div className="text-sm text-gray-600">3e et 4e année</div>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCycle('cycle3');
                            setSelectedLevel(null);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedCycle === 'cycle3'
                              ? 'border-green-500 bg-green-100 text-green-800'
                              : 'border-gray-300 bg-white hover:border-green-300 hover:bg-green-50'
                          }`}
                        >
                          <div className="font-semibold">Cycle 3</div>
                          <div className="text-sm text-gray-600">5e et 6e année</div>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setSelectedCycle('cycle1');
                            setSelectedLevel(null);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedCycle === 'cycle1'
                              ? 'border-green-500 bg-green-100 text-green-800'
                              : 'border-gray-300 bg-white hover:border-green-300 hover:bg-green-50'
                          }`}
                        >
                          <div className="font-semibold">Cycle 1</div>
                          <div className="text-sm text-gray-600">Sec I et Sec II</div>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCycle('cycle2');
                            setSelectedLevel(null);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedCycle === 'cycle2'
                              ? 'border-green-500 bg-green-100 text-green-800'
                              : 'border-gray-300 bg-white hover:border-green-300 hover:bg-green-50'
                          }`}
                        >
                          <div className="font-semibold">Cycle 2</div>
                          <div className="text-sm text-gray-600">Sec III, IV et V</div>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Étape 3: Niveau (si cycle sélectionné) */}
              {selectedCycle && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-3">3️⃣ Sélectionner le niveau</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedOrder === 'primaire' && selectedCycle === 'cycle1' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedLevel('1re');
                            setSelectedCompetency(null);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedLevel === '1re'
                              ? 'border-purple-500 bg-purple-100 text-purple-800'
                              : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <div className="font-semibold">1re année</div>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLevel('2e');
                            setSelectedCompetency(null);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedLevel === '2e'
                              ? 'border-purple-500 bg-purple-100 text-purple-800'
                              : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <div className="font-semibold">2e année</div>
                        </button>
                      </>
                    )}
                    {selectedOrder === 'primaire' && selectedCycle === 'cycle2' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedLevel('3e');
                            setSelectedCompetency(null);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedLevel === '3e'
                              ? 'border-purple-500 bg-purple-100 text-purple-800'
                              : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <div className="font-semibold">3e année</div>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLevel('4e');
                            setSelectedCompetency(null);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedLevel === '4e'
                              ? 'border-purple-500 bg-purple-100 text-purple-800'
                              : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <div className="font-semibold">4e année</div>
                        </button>
                      </>
                    )}
                    {selectedOrder === 'primaire' && selectedCycle === 'cycle3' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedLevel('5e');
                            setSelectedCompetency(null);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedLevel === '5e'
                              ? 'border-purple-500 bg-purple-100 text-purple-800'
                              : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <div className="font-semibold">5e année</div>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLevel('6e');
                            setSelectedCompetency(null);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedLevel === '6e'
                              ? 'border-purple-500 bg-purple-100 text-purple-800'
                              : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <div className="font-semibold">6e année</div>
                        </button>
                      </>
                    )}
                    {selectedOrder === 'secondaire' && selectedCycle === 'cycle1' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedLevel('Sec I');
                            setSelectedCompetency(null);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedLevel === 'Sec I'
                              ? 'border-purple-500 bg-purple-100 text-purple-800'
                              : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <div className="font-semibold">Sec I</div>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLevel('Sec II');
                            setSelectedCompetency(null);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedLevel === 'Sec II'
                              ? 'border-purple-500 bg-purple-100 text-purple-800'
                              : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <div className="font-semibold">Sec II</div>
                        </button>
                      </>
                    )}
                    {selectedOrder === 'secondaire' && selectedCycle === 'cycle2' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedLevel('Sec III');
                            setSelectedCompetency(null);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedLevel === 'Sec III'
                              ? 'border-purple-500 bg-purple-100 text-purple-800'
                              : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <div className="font-semibold">Sec III</div>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLevel('Sec IV');
                            setSelectedCompetency(null);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedLevel === 'Sec IV'
                              ? 'border-purple-500 bg-purple-100 text-purple-800'
                              : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <div className="font-semibold">Sec IV</div>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLevel('Sec V');
                            setSelectedCompetency(null);
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedLevel === 'Sec V'
                              ? 'border-purple-500 bg-purple-100 text-purple-800'
                              : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <div className="font-semibold">Sec V</div>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Étape 4: Compétences musicales (si niveau sélectionné) */}
              {selectedLevel && (
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-3">4️⃣ Sélectionner la compétence musicale</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setSelectedCompetency('creation')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedCompetency === 'creation'
                          ? 'border-orange-500 bg-orange-100 text-orange-800'
                          : 'border-gray-300 bg-white hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      <div className="text-2xl mb-2">🎼</div>
                      <div className="font-semibold">
                        {selectedOrder === 'primaire' ? 'Inventer' : 'Créer'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedOrder === 'primaire' 
                          ? 'Inventer des pièces vocales ou instrumentales'
                          : 'Créer des œuvres musicales'
                        }
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedCompetency('interpretation')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedCompetency === 'interpretation'
                          ? 'border-orange-500 bg-orange-100 text-orange-800'
                          : 'border-gray-300 bg-white hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      <div className="text-2xl mb-2">🎵</div>
                      <div className="font-semibold">Interpréter</div>
                      <div className="text-sm text-gray-600">
                        {selectedOrder === 'primaire' 
                          ? 'Interpréter des pièces musicales'
                          : 'Interpréter des œuvres musicales'
                        }
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedCompetency('appreciation')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedCompetency === 'appreciation'
                          ? 'border-orange-500 bg-orange-100 text-orange-800'
                          : 'border-gray-300 bg-white hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      <div className="text-2xl mb-2">👂</div>
                      <div className="font-semibold">Apprécier</div>
                      <div className="text-sm text-gray-600">
                        {selectedOrder === 'primaire' 
                          ? 'Apprécier des œuvres musicales, ses réalisations et celles de ses camarades'
                          : 'Apprécier des œuvres musicales'
                        }
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Résumé de la sélection */}
              {selectedCompetency && (
                <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg p-4 border-2 border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">✅ Sélection confirmée</h4>
                  <div className="text-lg font-medium text-blue-800">
                    {selectedOrder === 'primaire' ? '🎒 Primaire' : '🎓 Secondaire'} • 
                    {selectedCycle === 'cycle1' ? ' Cycle 1' : selectedCycle === 'cycle2' ? ' Cycle 2' : ' Cycle 3'} • 
                    {selectedLevel} • 
                    {selectedCompetency === 'creation' ? '🎼 ' + (selectedOrder === 'primaire' ? 'Inventer' : 'Créer') :
                     selectedCompetency === 'interpretation' ? '🎵 Interpréter' :
                     '👂 Apprécier'}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    Prêt pour l'évaluation IA adaptée au système québécois
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t">
              <button 
                onClick={() => {
                  setShowQuebecEvaluationModal(false);
                  setSelectedOrder(null);
                  setSelectedCycle(null);
                  setSelectedLevel(null);
                  setSelectedCompetency(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Fermer
              </button>
              {selectedCompetency && (
                <button 
                  className="px-4 py-2 bg-[#1473AA] text-white rounded-lg hover:bg-[#0f5a8a]"
                >
                  Continuer vers l'évaluation IA
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherGamificationOverview;
