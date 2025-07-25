import React, { useState } from 'react';
import { Plus, Users, Edit, Trash2, Save, X, Check, Download, Grid, List, RefreshCw, Mail, User, Calendar, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';
import GoogleClassroomService from '../services/googleClassroomService';
import MicrosoftTeamsService from '../services/microsoftTeamsService';

interface GroupManagerProps {
  selectedGroupId?: string;
  onGroupSelect?: (groupId: string) => void;
}

interface Group {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  studentIds: string[];
  createdAt: string;
  invitationCode: string;
  source?: string;
  externalId?: string;
  importedAt?: string;
  studentCount: number;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  groupId?: string;
  instrument?: string;
  picture?: string;
}

export default function GroupManager({ selectedGroupId, onGroupSelect }: GroupManagerProps) {
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', description: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  const [showStudentsTable, setShowStudentsTable] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importInProgress, setImportInProgress] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [showCourseSelection, setShowCourseSelection] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { user } = useAuth();
  const { groups, addGroup, updateGroup, deleteGroup, getStudentsByGroup, getActiveGroups } = useData();

  const teacherGroups = getActiveGroups(user?.id || '');
  const displayGroups = selectedGroupId 
    ? teacherGroups.filter(group => group.id === selectedGroupId)
    : teacherGroups;

  const handleEditGroup = (group: any) => {
    setEditingGroup(group.id);
    setEditFormData({
      name: group.name,
      description: group.description
    });
  };

  const handleSaveEdit = () => {
    if (editingGroup && editFormData.name.trim()) {
      if (editingGroup === 'new') {
        // Créer un nouveau groupe
        const newGroup = {
          name: editFormData.name,
          description: editFormData.description,
          teacherId: user?.id || '',
          studentIds: [],
          createdAt: new Date().toISOString(),
          invitationCode: Math.random().toString(36).substring(2, 8).toUpperCase()
        };
        addGroup(newGroup);
      } else {
        // Modifier un groupe existant
      updateGroup(editingGroup, editFormData);
      }
      setEditingGroup(null);
      setEditFormData({ name: '', description: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingGroup(null);
    setEditFormData({ name: '', description: '' });
  };

  const handleDeleteGroup = (groupId: string) => {
    deleteGroup(groupId);
    setDeleteConfirm(null);
  };

  const handleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAllCourses = () => {
    setSelectedCourses(availableCourses.map(course => course.id));
  };

  const handleDeselectAllCourses = () => {
    setSelectedCourses([]);
  };

  const handleImportSelectedCourses = async () => {
    if (selectedCourses.length === 0) {
      alert('Veuillez sélectionner au moins un cours à importer.');
      return;
    }

    setIsImporting(true);
    setImportInProgress(true);
    setImportError(null);

    try {
      let importedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const courseId of selectedCourses) {
        try {
          const course = availableCourses.find(c => c.id === courseId);
          if (!course) continue;

          // Vérifier si le groupe existe déjà
          const existingGroup = groups.find(group => 
            group.externalId === course.id || 
            (group.name === course.name && group.teacherId === user?.id)
          );
          
          if (existingGroup) {
            console.log(`Groupe "${course.name}" existe déjà, ignoré`);
            skippedCount++;
            continue;
          }

          // Déterminer la source et les données selon le type de cours
          let source: 'google-classroom' | 'microsoft-teams';
          let memberCount: number;
          let description: string;

          if (course.members) {
            // C'est une équipe Microsoft Teams
            source = 'microsoft-teams';
            memberCount = course.members.length;
            description = course.description || `Groupe importé depuis Microsoft Teams (${memberCount} membres)`;
          } else {
            // C'est un cours Google Classroom
            source = 'google-classroom';
            const students = await GoogleClassroomService.getStudents(course.id);
            console.log(`Étudiants récupérés pour le cours ${course.name}:`, students);
            memberCount = students.length;
            description = course.description || `Groupe importé depuis Google Classroom (${memberCount} élèves)`;
          }
          
          const newGroup = {
            name: course.name,
            description: description,
            teacherId: user?.id || '',
            studentIds: [],
            source: source,
            externalId: course.id,
            importedAt: new Date().toISOString(),
            studentCount: memberCount
          };
          
          addGroup(newGroup);
          importedCount++;
        } catch (courseError) {
          console.error(`Erreur lors de l'import du cours ${courseId}:`, courseError);
          errorCount++;
        }
      }

      setShowCourseSelection(false);
      setSelectedCourses([]);
      setViewMode('list');

      // Message de résultat
      let message = '';
      if (importedCount > 0) {
        message += `${importedCount} groupe(s) importé(s) avec succès. `;
      }
      if (skippedCount > 0) {
        message += `${skippedCount} groupe(s) déjà existant(s) ignoré(s). `;
      }
      if (errorCount > 0) {
        message += `${errorCount} erreur(s) lors de l'import.`;
      }

      if (message) {
        alert(message);
      } else {
        alert('Aucun nouveau groupe à importer.');
      }

    } catch (error: any) {
      console.error('Erreur lors de l\'import des cours sélectionnés:', error);
      setImportError('Erreur lors de l\'import des cours sélectionnés.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportFromGoogleClassroom = async () => {
    console.log('Début import Google Classroom');
    
    // Empêcher les imports multiples
    if (isImporting) {
      console.log('Import déjà en cours, ignoré');
      return;
    }
    
    setIsImporting(true);
    setImportInProgress(true);
    setImportError(null);
    
    try {
      // Vérifier si nous sommes en mode démonstration
      const isDemoMode = import.meta.env.VITE_GOOGLE_CLIENT_ID === 'test-google-client-id' || 
                         import.meta.env.VITE_GOOGLE_CLIENT_ID === 'your-google-client-id' ||
                         !import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (isDemoMode) {
        console.log('🎭 Mode démonstration - Import Google Classroom simulé');
        alert('Mode démonstration activé. L\'import depuis Google Classroom est désactivé.\n\nEn mode réel, vous pourriez importer vos cours Google Classroom ici.');
        return;
      }
      
      // Vérifier si l'utilisateur est connecté via Firebase Auth
      if (!user) {
        console.log('Utilisateur non connecté');
        setImportError('Vous devez être connecté pour importer depuis Google Classroom.');
        return;
      }

      // Vérifier que l'utilisateur a un email valide
      if (!user.email) {
        console.log('Utilisateur sans email');
        setImportError('Vous devez avoir un email valide pour importer depuis Google Classroom.');
        return;
      }

      // Vérifier si le token Google est disponible
      const googleToken = localStorage.getItem('google_access_token');
      if (!googleToken) {
        console.log('Token Google non trouvé, lancement de l\'authentification...');
        // Lancer l'authentification Google OAuth avec un callback pour continuer l'import
        const { GoogleAuthService } = await import('../services/googleAuth');
        const googleAuth = GoogleAuthService.getInstance();
        
        // Stocker l'intention d'importer pour continuer après l'auth
        localStorage.setItem('pending_google_import', 'true');
        
        googleAuth.initiateAuth();
        return;
      }
      
      // Récupérer la liste des cours disponibles
      const courses = await GoogleClassroomService.getCourses();
      console.log('Courses récupérés:', courses);
      
      if (courses.length === 0) {
        setImportError('Aucun cours trouvé dans Google Classroom. Vérifiez que vous avez des cours actifs.');
        console.log('Aucun cours trouvé dans Google Classroom');
        return;
      }

      // Filtrer les cours qui n'existent pas déjà
      const existingGroups = groups.filter(group => group.teacherId === user?.id);
      const availableCourses = courses.filter(course => 
        !existingGroups.some(group => 
          group.externalId === course.id || 
          group.name === course.name
        )
      );

      if (availableCourses.length === 0) {
        alert('Tous vos cours Google Classroom ont déjà été importés !');
        return;
      }

      // Afficher l'interface de sélection
      setAvailableCourses(availableCourses);
      setSelectedCourses([]);
      setShowCourseSelection(true);
      setViewMode('list'); // S'assurer qu'on reste en mode liste
      
    } catch (error: any) {
      console.error('Erreur lors de la récupération des cours Google Classroom:', error);
      
      const errorMessage = error.message || String(error);
      
      if (errorMessage.includes('Token expiré') || errorMessage.includes('token') || errorMessage.includes('expired')) {
        setImportError('Token expiré. Veuillez vous reconnecter avec Google et réessayer.');
      } else if (errorMessage.includes('Authentification Google requise')) {
        setImportError('Authentification Google requise. Cliquez sur le bouton pour vous connecter.');
      } else if (errorMessage.includes('403')) {
        setImportError('Permissions insuffisantes. Vérifiez que vous avez accès à Google Classroom.');
      } else if (errorMessage.includes('401')) {
        setImportError('Token d\'accès expiré. Veuillez vous reconnecter à Google.');
      } else {
        setImportError('Erreur lors de la récupération des cours. Vérifiez votre connexion et vos permissions Google Classroom.');
      }
    } finally {
      setIsImporting(false);
      setImportInProgress(false);
    }
  };

  // Vérifier si un import était en attente après authentification
  React.useEffect(() => {
    const pendingImport = localStorage.getItem('pending_google_import');
    const googleToken = localStorage.getItem('google_access_token');
    
    if (pendingImport === 'true' && googleToken && user && !importInProgress) {
      console.log('Import en attente détecté, continuation automatique...');
      localStorage.removeItem('pending_google_import');
      
      // Attendre un peu pour s'assurer que tout est bien initialisé
      setTimeout(() => {
        handleImportFromGoogleClassroom();
      }, 1000);
    }
  }, [user, importInProgress]);

  const handleRefreshSingleGroup = async (group: any) => {
    console.log(`Début rafraîchissement du groupe ${group.name}`);
    
    if (isImporting || importInProgress) {
      console.log('Import déjà en cours, ignoré');
      return;
    }
    
    setIsImporting(true);
    setImportError(null);

    try {
      if (!group.externalId) {
        alert('Ce groupe n\'a pas d\'identifiant externe pour la synchronisation.');
        return;
      }
      
      let currentCount: number;
      let newCount: number;
      let platformName: string;
      
      if (group.source === 'microsoft-teams') {
        // Synchronisation Microsoft Teams
        const currentMembers = await MicrosoftTeamsService.getTeamMembers(group.externalId);
        console.log(`Membres actuels pour l'équipe ${group.name}:`, currentMembers);
        
        currentCount = getStudentsByGroup(group.id).length;
        newCount = currentMembers.length;
        platformName = 'Microsoft Teams';
      } else {
        // Synchronisation Google Classroom
        const currentStudents = await GoogleClassroomService.getStudents(group.externalId);
        console.log(`Élèves actuels pour le cours ${group.name}:`, currentStudents);
        
        currentCount = getStudentsByGroup(group.id).length;
        newCount = currentStudents.length;
        platformName = 'Google Classroom';
      }
      
      // Afficher le résultat
      let message = `Groupe "${group.name}" synchronisé avec succès.\n\n`;
      message += `Membres actuels dans ${platformName}: ${newCount}\n`;
      message += `Membres dans MusiqueConnect: ${currentCount}\n\n`;
      
      if (newCount > currentCount) {
        message += `✅ ${newCount - currentCount} nouveau(x) membre(s) détecté(s) !`;
      } else if (newCount < currentCount) {
        message += `⚠️ ${currentCount - newCount} membre(s) a/ont quitté le groupe.`;
      } else {
        message += `✅ Aucun changement détecté.`;
      }
      
      alert(message);

    } catch (error: any) {
      console.error(`Erreur lors de la synchronisation du groupe ${group.name}:`, error);
      const platformName = group.source === 'microsoft-teams' ? 'Microsoft Teams' : 'Google Classroom';
      setImportError(`Erreur lors de la synchronisation de "${group.name}". Vérifiez votre connexion et vos permissions ${platformName}.`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportFromMicrosoftTeams = async () => {
    setIsImporting(true);
    setImportError(null);
    
    try {
      // Vérifier si l'authentification Microsoft est configurée
      const { MicrosoftAuthService } = await import('../services/microsoftAuth');
      const microsoftAuth = MicrosoftAuthService.getInstance();
      
      if (!microsoftAuth.isAuthenticated()) {
        // Proposer l'authentification
        const shouldAuth = confirm(
          'Pour importer depuis Microsoft Teams, vous devez d\'abord vous connecter avec votre compte Microsoft. Voulez-vous continuer ?'
        );
        
        if (shouldAuth) {
          microsoftAuth.initiateAuth();
          return;
        } else {
          setImportError('Authentification Microsoft requise pour l\'import.');
          return;
        }
      }
      
      // Récupérer toutes les équipes Microsoft Teams
      const teams = await MicrosoftTeamsService.getTeams();
      console.log('Équipes Microsoft Teams récupérées:', teams);
      
      if (teams.length === 0) {
        alert('Aucune équipe Microsoft Teams trouvée. Assurez-vous d\'être membre d\'au moins une équipe.');
        return;
      }

      // Récupérer les membres pour chaque équipe
      const teamsWithMembers = await Promise.all(
        teams.map(async (team) => {
          try {
            const members = await MicrosoftTeamsService.getTeamMembers(team.id);
            return {
              ...team,
              members
            };
    } catch (error) {
            console.error(`Erreur lors de la récupération des membres pour l'équipe ${team.displayName}:`, error);
            return {
              ...team,
              members: []
            };
          }
        })
      );

      // Afficher la sélection des équipes
      setAvailableCourses(teamsWithMembers.map(team => ({
        id: team.id,
        name: team.displayName,
        description: team.description || `Équipe Microsoft Teams (${team.members.length} membres)`,
        members: team.members
      })));
      
      setShowCourseSelection(true);
      setViewMode('list');
      
    } catch (error: any) {
      console.error('Erreur lors de l\'import Microsoft Teams:', error);
      
      if (error.message?.includes('Authentification Microsoft requise')) {
        setImportError('Authentification Microsoft requise. Cliquez sur le bouton pour vous connecter.');
      } else if (error.message?.includes('403')) {
        setImportError('Permissions insuffisantes. Vérifiez que vous avez accès à Microsoft Teams.');
      } else if (error.message?.includes('401')) {
        setImportError('Token d\'accès expiré. Veuillez vous reconnecter à Microsoft.');
      } else {
        setImportError('Erreur lors de l\'import. Vérifiez votre connexion et vos permissions Microsoft Teams.');
      }
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec navigation */}
      <div className="flex justify-between items-center bg-transparent">
        {selectedGroupId && (
        <h2 className="text-2xl font-bold text-gray-900">
            Groupe Sélectionné
        </h2>
        )}
        {!selectedGroupId && displayMode === 'list' && (
          <div className="flex items-center gap-2">
            {/* Bouton tableau des élèves */}
            {teacherGroups.length > 0 && (
              <button
                onClick={() => setShowStudentsTable(!showStudentsTable)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  showStudentsTable
                    ? 'bg-[#1473AA] text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                {showStudentsTable ? 'Masquer' : 'Tableau'} des Élèves
              </button>
            )}
            
            {/* Boutons de vue */}
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#1473AA] text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#1473AA] text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Interface de sélection des cours Google Classroom */}
      {showCourseSelection && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sélectionner les Cours à Importer</h3>
            <button
              onClick={() => setShowCourseSelection(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">
              Sélectionnez les cours Google Classroom que vous souhaitez importer comme groupes dans MusiqueConnect.
            </p>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleSelectAllCourses}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
              >
                Sélectionner Tout
              </button>
              <button
                onClick={handleDeselectAllCourses}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
              >
                Désélectionner Tout
              </button>
            </div>
        </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableCourses.map((course) => (
              <div
                key={course.id}
                className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedCourses.includes(course.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleCourseSelection(course.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedCourses.includes(course.id)}
                  onChange={() => handleCourseSelection(course.id)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 flex-shrink-0"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{course.name}</h4>
                  {course.description && (
                    <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {course.id}
                  </p>
                </div>
              </div>
            ))}
            </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {selectedCourses.length} cours sélectionné(s) sur {availableCourses.length}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCourseSelection(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleImportSelectedCourses}
                disabled={selectedCourses.length === 0 || isImporting}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCourses.length === 0 || isImporting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                    Import en cours...
                  </>
                ) : (
                  `Importer ${selectedCourses.length} cours`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des groupes */}
      <div>
      {displayGroups.length === 0 ? (
        <div className="text-center py-12">
            {editingGroup === 'new' ? (
              <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer un nouveau groupe</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du Groupe
                    </label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1473AA]"
                      placeholder="Nom du groupe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1473AA]"
                      rows={3}
                      placeholder="Description du groupe"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 bg-[#1473AA] text-white rounded hover:bg-[#1473AA]/80 text-sm flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      Créer le groupe
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            {selectedGroupId ? 'Groupe non trouvé' : 'Aucun groupe de musique créé pour le moment'}
          </p>
          {!selectedGroupId && (
            <button
                    onClick={() => {
                      setEditingGroup('new');
                      setEditFormData({ name: '', description: '' });
                    }}
                    className="px-4 py-2 bg-[#1473AA] text-white rounded-lg hover:bg-[#1473AA]/80 transition-colors"
            >
              Créer Votre Premier Groupe
            </button>
                )}
              </>
          )}
        </div>
      ) : (
          <div className={displayMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid gap-6'}>
          {displayGroups.map((group) => {
            const students = getStudentsByGroup(group.id);
            const isEditing = editingGroup === group.id;
            const isConfirmingDelete = deleteConfirm === group.id;
            
            return (
                <div key={group.id} className={`bg-white rounded-lg shadow-lg border border-gray-200 ${
                  displayMode === 'grid' ? 'p-4' : 'p-6'
                }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom du Groupe
                          </label>
                          <input
                            type="text"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1473AA]"
                            placeholder="Nom du groupe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={editFormData.description}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1473AA]"
                            rows={2}
                            placeholder="Description du groupe"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                              className="px-3 py-1 bg-[#1473AA] text-white rounded hover:bg-[#1473AA]/80 text-sm flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Sauvegarder
                          </button>
                          <button
                            onClick={handleCancelEdit}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                        <div>
                          <h3 className={`font-semibold text-gray-900 mb-2 ${
                            displayMode === 'grid' ? 'text-base' : 'text-lg'
                          }`}>{group.name}</h3>
                          <p className={`text-gray-600 mb-3 ${
                            displayMode === 'grid' ? 'text-sm line-clamp-2' : ''
                          }`}>{group.description}</p>
                          <div className={`flex items-center gap-4 text-sm text-gray-600 ${
                            displayMode === 'grid' ? 'flex-wrap gap-2' : ''
                          }`}>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {students.length} élèves
                          </div>
                            {displayMode === 'list' && (
                          <div>
                                Créé le {format(new Date(group.createdAt), 'dd MMM yyyy')}
                              </div>
                            )}
                            {group.source && (
                              <div className="flex items-center gap-1">
                                {group.source === 'google-classroom' && (
                                  <img src="/icons/GG classroom.png" alt="Google Classroom" className="w-4 h-4" />
                                )}
                                {group.source === 'microsoft-teams' && (
                                  <img src="/icons/teams.png" alt="Microsoft Teams" className="w-4 h-4" />
                                )}
                                <span className="text-xs text-gray-500">
                                  {group.source === 'google-classroom' ? 'Google Classroom' : 'Microsoft Teams'}
                                </span>
                          </div>
                            )}
                        </div>
                        
                          {/* Code d'invitation - seulement pour les groupes créés manuellement */}
                          {group.invitationCode && !group.source && (
                            <div className={`mt-4 bg-[#1473AA]/10 rounded-lg border border-[#1473AA]/20 ${
                              displayMode === 'grid' ? 'p-3' : 'p-4'
                            }`}>
                              <h4 className={`font-medium text-[#1473AA] mb-2 ${
                                displayMode === 'grid' ? 'text-sm' : ''
                              }`}>Code d'Invitation</h4>
                              <div className={`flex items-center gap-3 ${
                                displayMode === 'grid' ? 'flex-col gap-2' : ''
                              }`}>
                                <div className={`bg-white px-3 py-2 rounded border font-mono font-bold text-[#1473AA] ${
                                  displayMode === 'grid' ? 'text-sm' : 'text-lg'
                                }`}>
                                {group.invitationCode}
                              </div>
                              <button
                                onClick={() => group.invitationCode && navigator.clipboard.writeText(group.invitationCode)}
                                  className={`bg-[#1473AA] text-white rounded hover:bg-[#1473AA]/80 ${
                                    displayMode === 'grid' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
                                  }`}
                              >
                                Copier
                              </button>
                            </div>
                              {displayMode === 'list' && (
                            <p className="text-xs text-[#1473AA]/80 mt-2">
                              Partagez ce code avec vos élèves pour qu'ils rejoignent le groupe
                            </p>
                              )}
                          </div>
                        )}
                        </div>
                    )}
                  </div>
                  
                  {!isEditing && (
                    <div className="flex items-center gap-2">
                        {/* Bouton de sélection */}
                        {onGroupSelect && (
                          <button
                            onClick={() => onGroupSelect(group.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              selectedGroupId === group.id
                                ? 'text-[#1473AA] bg-[#1473AA]/10'
                                : 'text-gray-400 hover:text-[#1473AA] hover:bg-[#1473AA]/10'
                            }`}
                            title={selectedGroupId === group.id ? 'Groupe sélectionné' : 'Sélectionner ce groupe'}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Bouton de modification pour les groupes créés manuellement */}
                        {!group.source && (
                      <button
                        onClick={() => handleEditGroup(group)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                        )}
                        
                        {/* Bouton de synchronisation pour les groupes importés */}
                        {group.source && (
                          <button
                            onClick={() => handleRefreshSingleGroup(group)}
                            disabled={isImporting}
                            className={`p-2 rounded-lg transition-colors ${
                              isImporting
                                ? 'text-gray-300 cursor-not-allowed'
                                : group.source === 'google-classroom'
                                  ? 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                                  : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                            }`}
                          >
                            <RefreshCw className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                        
                        {/* Bouton de suppression */}
                      <button
                        onClick={() => setDeleteConfirm(group.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Confirmation de suppression */}
                {isConfirmingDelete && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Trash2 className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-800">Confirmer la suppression</span>
                    </div>
                    <p className="text-red-700 text-sm mb-3">
                      Êtes-vous sûr de vouloir supprimer le groupe "{group.name}" ? 
                      Cette action est irréversible et supprimera également tous les exercices et messages associés.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Oui, supprimer
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
                      >
                        Annuler
                      </button>
                    </div>
                    </div>
                  )}
                </div>
              );
            })}
                  </div>
                )}

        {/* Tableau des élèves */}
        {showStudentsTable && !selectedGroupId && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Tableau des Élèves
              </h3>
              <div className="text-sm text-gray-600">
                {teacherGroups.reduce((acc, group) => acc + getStudentsByGroup(group.id).length, 0)} élève(s) au total
              </div>
                    </div>
                    
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Photo</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Nom</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Prénom</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Groupe(s)</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Instrument</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherGroups.map(group => {
                    const students = getStudentsByGroup(group.id);
                    return students.map((student, index) => (
                      <tr key={`${student.id}-${group.id}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                              {student.picture ? (
                                <img
                                  src={student.picture}
                                  alt={`${student.firstName} ${student.lastName}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-500 font-medium text-sm">
                                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                                </span>
                              )}
                            </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {student.lastName}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {student.firstName}
                        </td>
                        <td className="py-3 px-4">
                          <a
                            href={`mailto:${student.email}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                          >
                            <Mail className="w-4 h-4" />
                            {student.email}
                          </a>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {group.name}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {student.instrument || 'Non spécifié'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => window.open(`mailto:${student.email}`, '_blank')}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                // Ici on pourrait ouvrir un modal avec les détails de l'élève
                                alert(`Détails de ${student.firstName} ${student.lastName}\n\nEmail: ${student.email}\nInstrument: ${student.instrument || 'Non spécifié'}\nGroupe: ${group.name}`);
                              }}
                              className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
                            >
                              <User className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
            
            {teacherGroups.reduce((acc, group) => acc + getStudentsByGroup(group.id).length, 0) === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucun élève inscrit pour le moment</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
    </div>
  );
}