import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  Music, 
  MessageSquare, 
  Megaphone, 
  Plus, 
  LogOut,
  Filter,
  Calendar,
  Clock,
  ChevronDown,
  User,
  Settings,
  UserPlus,
  BookOpen,
  FileText,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Share2,
  Bell,
  X,
  Key,
  Target,
  Trophy,
  AlertCircle,
  RotateCcw,
  Volume2,
  Monitor,
  ShoppingCart,
  Wrench,
  MessageCircle,
  BarChart,
  TrendingUp,
  LineChart,
  Package,
  Brain,
  Lightbulb,
  Database,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useSettings } from '../contexts/SettingsContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, getDaysInMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import GroupManager from './GroupManager';
import HomeworkManager from './HomeworkManager';
import ChatCenter from './ChatCenter';
import AnnouncementManager from './AnnouncementManager';
import TeacherProfile from './TeacherProfile';
import StudentManager from './StudentManager';
import AssignmentManager from './AssignmentManager';
import CourseNotesManager from './CourseNotesManager';
import BudgetDashboard from './BudgetDashboard';
import AppSettings from './AppSettings';
import Logo from './Logo';
import SalesManager from './SalesManager';
import NotificationCenter from './NotificationCenter';
import GamificationManager from './GamificationManager';
import IA from './IA';
import IAToolsManager from './IAToolsManager';
import Metronome from './Metronome';
import Tuner from './Tuner';
import MacBookChat from './MacBookChat';
import BudgetExpenseManager from './BudgetExpenseManager';
import RoleSwitcher from './RoleSwitcher';
import EducrnBanner from './EducrnBanner';
import GoogleSheetsSync from './GoogleSheetsSync';


type TabType = 'homework' | 'messages' | 'announcements' | 'profile' | 'groups' | 'students' | 'assignments' | 'notes' | 'inventory' | 'sales' | 'licenses' | 'gamification' | 'ia-quebec' | 'tools' | 'macbook-chat' | 'ia' | 'google-sheets' | 'share-code' | 'budget';

interface CalendarEvent {
  type: string;
  title: string;
  color: string;
}

// Composant utilitaire pour les boutons de sidebar (gauche et droite)
type SidebarButtonProps = {
  icon: React.ReactNode;
  label: string;
  count?: number | null;
  active: boolean;
  onClick: () => void;
};
function SidebarButton({ icon, label, count, active, onClick }: SidebarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 border border-gray-200 hover:border-gray-300 transform hover:scale-[1.01] shadow-md ${
        active 
          ? 'bg-[#1473AA] text-white border-[#1473AA] shadow-[#1473AA]/20 shadow-lg' 
          : 'text-gray-700 hover:bg-gray-50 hover:shadow-lg hover:border-[#1473AA]/20 hover:scale-[1.005]'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium text-sm">{label}</span>
      </div>
      {count !== null && count !== undefined && (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
          active 
            ? 'bg-white text-[#1473AA] shadow-sm' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

interface TeacherDashboardProps {
  activeTab?: TabType;
}

// Fonction utilitaire pour déterminer l'année budgétaire courante
function getCurrentBudgetYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = janvier, 7 = août
  if (month >= 6) {
    // Juillet à décembre
    return `${year}-${year + 1}`;
  } else {
    // Janvier à juin
    return `${year - 1}-${year}`;
  }
}

function getNextBudgetYear() {
  const current = getCurrentBudgetYear();
  const [start, end] = current.split('-').map(Number);
  return `${start + 1}-${end + 1}`;
}

const currentBudgetYear = getCurrentBudgetYear();
const nextBudgetYear = getNextBudgetYear();

export default function TeacherDashboard({ activeTab: initialActiveTab }: TeacherDashboardProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType | null>(initialActiveTab || null);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [toolView, setToolView] = useState<'metronome' | 'tuner'>('metronome');
  const { user, logout } = useAuth();
  const { groups, homework, messages, announcements, assignments, courseNotes, purchases, getStudentsByGroup, loading, budgets } = useData();
  const { resetSettings } = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [showGamificationMessageModal, setShowGamificationMessageModal] = useState(false);
  const [showGamificationPointsModal, setShowGamificationPointsModal] = useState(false);
  const [showGamificationChallengeModal, setShowGamificationChallengeModal] = useState(false);
  const [selectedGamificationStudent, setSelectedGamificationStudent] = useState('');
  const [gamificationMessageText, setGamificationMessageText] = useState('');
  const [gamificationPointsToAward, setGamificationPointsToAward] = useState(10);
  const [gamificationChallengeTitle, setGamificationChallengeTitle] = useState('');
  const [gamificationChallengeDescription, setGamificationChallengeDescription] = useState('');
  const [isInitializingData, setIsInitializingData] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const teacherGroups = groups;
  const selectedGroup = selectedGroupId ? groups.find(g => g.id === selectedGroupId) : null;
  
  // Mettre à jour l'onglet actif quand la prop change
  useEffect(() => {
    if (initialActiveTab) {
      setActiveTab(initialActiveTab);
    }
  }, [initialActiveTab]);
  
  // Détecter l'URL actuelle et mettre à jour l'onglet actif
  useEffect(() => {
    const pathToTab: Record<string, TabType> = {
      '/devoirs': 'homework',
      '/devoirs-assignes': 'assignments',
      '/notes-de-cours': 'notes',
      '/ventes': 'sales',
      '/annonces': 'announcements',
      '/messages': 'messages',
      '/ia': 'ia',
      '/outils-ia': 'tools',
      '/groupes': 'groups',
      '/etudiants': 'students',
      // '/budget': 'overview', // Correction : "overview" n'est pas un TabType valide, donc on retire cette ligne pour éviter l'erreur de typage.
      '/profil': 'profile'
    };
    
    const currentTab = pathToTab[location.pathname];
    if (currentTab && currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [location.pathname, activeTab]);
  
  // Fonction pour naviguer vers les différentes pages
  const navigateToTab = (tab: TabType) => {
    setActiveTab(tab);
    const routeMap: Record<TabType, string> = {
      'homework': '/devoirs',
      'assignments': '/devoirs-assignes',
      'notes': '/notes-de-cours',
      'sales': '/ventes',
      'announcements': '/annonces',
      'messages': '/messages',
      'ia': '/ia',
      'gamification': '/gamification',
      'tools': '/outils-ia',
      'groups': '/groupes',
      'students': '/etudiants',
      'profile': '/profil',
      'inventory': '/inventory',
      'licenses': '/licenses',
      'ia-quebec': '/ia-quebec',
      'macbook-chat': '/macbook-chat',
      'google-sheets': '/google-sheets',
      'share-code': '/share-code',
      'budget': '/budget'
    };
    const route = routeMap[tab];
    if (route && location.pathname !== route) {
      navigate(route);
    }
  };
  
  // Fonction pour obtenir le nom de la page actuelle
  const getCurrentPageName = () => {
    const pageNames: Record<string, string> = {
      '/dashboard': 'Tableau de bord',
      '/devoirs': 'Devoirs',
      '/devoirs-assignes': 'Devoirs assignés',
      '/notes-de-cours': 'Notes de cours',
      '/ventes': 'Ventes',
      '/annonces': 'Annonces',
      '/messages': 'Messages',
      '/ia': 'Intelligence artificielle',
      '/outils-ia': 'Outils IA',
      '/groupes': 'Groupes',
      '/etudiants': 'Étudiants',
      '/budget': 'Budget',
      '/profil': 'Profil'
    };
    return pageNames[location.pathname] || 'Tableau de bord';
  };
  
  // Gérer les messages d'authentification et d'import depuis l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const importStatus = urlParams.get('import');
    const error = urlParams.get('error');

    if (authStatus === 'google_success') {
      setAuthMessage({ type: 'success', text: 'Authentification Google réussie !' });
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (importStatus === 'pending') {
      setAuthMessage({ type: 'success', text: 'Import Google Classroom en cours...' });
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      let errorMessage = 'Une erreur est survenue.';
      if (error === 'google_auth_failed') {
        errorMessage = 'Échec de l\'authentification Google.';
      } else if (error === 'token_exchange_failed') {
        errorMessage = 'Erreur lors de l\'échange du token Google.';
      } else if (error === 'auth_failed') {
        errorMessage = 'Erreur d\'authentification.';
      }
      setAuthMessage({ type: 'error', text: errorMessage });
      // Nettoyer l'URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Masquer le message après 5 secondes
    if (authMessage) {
      const timer = setTimeout(() => {
        setAuthMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [authMessage]);
  
  // Charger les notifications
  useEffect(() => {
    if (user?.id) {
      const loadNotificationCount = async () => {
        try {
          // Vérifier si Firebase est configuré
          const firebaseConfig = {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID,
          };

          if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'test-api-key') {
            // Mode démonstration - pas de notifications
            setUnreadNotificationCount(0);
            return;
          }

          const { notificationService } = await import('../services/firebaseService');
          const count = await notificationService.getUnreadCount(user.id);
          setUnreadNotificationCount(count);
        } catch (error) {
          console.error('Erreur lors du chargement du compteur de notifications:', error);
          setUnreadNotificationCount(0);
        }
      };
      
      loadNotificationCount();
      
      // Mettre à jour le compteur toutes les 30 secondes
      const interval = setInterval(loadNotificationCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);
  
  // Bloquer le défilement quand le modal est ouvert
  useEffect(() => {
    if (showSettings) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Nettoyer lors du démontage du composant
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSettings]);
  
  // Filter data based on selected group
  const filteredHomework = selectedGroupId 
    ? homework.filter(hw => hw.groupId === selectedGroupId)
    : homework;
  
  const filteredMessages = selectedGroupId
    ? messages.filter(msg => msg.groupId === selectedGroupId)
    : messages;
    
  const filteredAnnouncements = selectedGroupId
    ? announcements.filter(ann => ann.groupId === selectedGroupId)
    : announcements;

  const filteredAssignments = selectedGroupId
    ? assignments.filter(assign => assign.groupIds.includes(selectedGroupId))
    : assignments;

  const filteredCourseNotes = selectedGroupId
    ? courseNotes.filter(note => !note.groupId || note.groupId === selectedGroupId)
    : courseNotes;

  const filteredPurchases = selectedGroupId
    ? purchases.filter(purchase => purchase.groupId === selectedGroupId)
    : purchases;

  // Calendar functions
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Fonction pour initialiser les données de test
  const initializeTestData = async () => {
    setIsInitializingData(true);
    try {
      // Créer des élèves de test
      const testStudents = [
        { firstName: 'Emma', lastName: 'Martin', email: 'emma@test.com', instrument: 'Piano' },
        { firstName: 'Lucas', lastName: 'Moreau', email: 'lucas@test.com', instrument: 'Guitare' },
        { firstName: 'Sofia', lastName: 'Rodriguez', email: 'sofia@test.com', instrument: 'Violon' }
      ];

      // Créer un groupe de test
      const testGroup = {
        name: 'Groupe Test',
        description: 'Groupe de test pour le chat',
        teacherId: user?.id || '',
        studentIds: []
      };

      // Simuler la création des données (en mode test)
      console.log('Initialisation des données de test...');
      
      // Ajouter les élèves au groupe
      const updatedGroup = {
        ...testGroup,
        studentIds: ['student-1', 'student-2', 'student-3']
      };

      // Forcer la mise à jour des données
      setTimeout(() => {
        console.log('✅ Données de test initialisées !');
        setIsInitializingData(false);
        alert('Données de test créées ! Vous pouvez maintenant vous connecter en tant qu\'étudiant pour tester le chat.');
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      setIsInitializingData(false);
      alert('Erreur lors de l\'initialisation des données de test.');
    }
  };

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    const events: CalendarEvent[] = [];
    const homeworkDue = homework.filter(hw => isSameDay(hw.dueDate, day));
    events.push(...homeworkDue.map(hw => ({ type: 'homework', title: hw.title, color: 'bg-blue-500' })));
    const assignmentsDue = assignments.filter(assign => isSameDay(assign.dueDate, day));
    events.push(...assignmentsDue.map(assign => ({ type: 'assignment', title: assign.title, color: 'bg-green-500' })));
    return events;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'homework':
        return <HomeworkManager selectedGroupId={selectedGroupId} />;
      case 'messages':
        return <ChatCenter selectedGroupId={selectedGroupId} />;
      case 'announcements':
        return <AnnouncementManager selectedGroupId={selectedGroupId} />;
      case 'profile':
        return <TeacherProfile />;
      case 'groups':
        return <GroupManager selectedGroupId={selectedGroupId} onGroupSelect={setSelectedGroupId} />;
      case 'students':
        return <StudentManager selectedGroupId={selectedGroupId} />;
      case 'assignments':
        return <AssignmentManager selectedGroupId={selectedGroupId} />;
      case 'notes':
        return <CourseNotesManager selectedGroupId={selectedGroupId} />;
      case 'sales':
        return <SalesManager selectedGroupId={selectedGroupId} />;
      case 'licenses':
        return <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Licences</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Statut des licences */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Statut des Licences</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Licences actives :</span>
                    <span className="font-semibold text-blue-900">25/30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Licences disponibles :</span>
                    <span className="font-semibold text-green-600">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date d'expiration :</span>
                    <span className="font-semibold text-orange-600">15 décembre 2024</span>
                  </div>
                </div>
              </div>

              {/* Acheter des licences */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Acheter des Licences</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input type="number" min="1" max="100" className="w-20 px-2 py-1 border border-gray-300 rounded" placeholder="1" />
                    <span className="text-gray-600">licences supplémentaires</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Prix : <span className="font-semibold">15$/licence/mois</span>
                  </div>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    Acheter via Stripe
                  </button>
                </div>
              </div>
            </div>

            {/* Historique des achats */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Historique des Achats</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <div>
                      <span className="font-medium">+10 licences</span>
                      <span className="text-gray-500 ml-2">15 novembre 2024</span>
                    </div>
                    <span className="text-green-600 font-semibold">150$</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <div>
                      <span className="font-medium">+5 licences</span>
                      <span className="text-gray-500 ml-2">1 octobre 2024</span>
                    </div>
                    <span className="text-green-600 font-semibold">75$</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>;
      case 'gamification':
        return <GamificationManager viewMode={viewMode} setViewMode={setViewMode} />;
      case 'ia':
        return <IA />;
      case 'ia-quebec':
        return <IAToolsManager />;
      case 'tools':
        return (
          <div className="space-y-6">
            {/* En-tête avec boutons de basculement */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-center">
                  {/* Boutons de basculement */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setToolView('metronome')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        toolView === 'metronome'
                          ? 'bg-white text-[#1473AA] shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Métronome</span>
                    </button>
                    <button
                      onClick={() => setToolView('tuner')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        toolView === 'tuner'
                          ? 'bg-white text-[#1473AA] shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Accordeur</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Affichage conditionnel des outils */}
            {toolView === 'metronome' ? <Metronome /> : <Tuner />}
          </div>
        );
      case 'macbook-chat':
        return <MacBookChat />;
      case 'google-sheets':
        return <GoogleSheetsSync />;
      case 'share-code':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Partager MusiqueConnect</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Code QR de Partage</h3>
                  <p className="text-gray-600 mb-4">
                    Scannez ce code QR pour partager MusiqueConnect avec vos collègues
                  </p>
                </div>
                
                {/* Code QR simulé */}
                <div className="inline-block p-4 bg-white border-2 border-gray-300 rounded-lg mb-6">
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-black mx-auto mb-2"></div>
                      <p className="text-xs text-gray-500">Code QR MusiqueConnect</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Lien de Partage</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value="https://musiqueconnect.ca/join/ABC123"
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                      />
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                        Copier
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Code d'Invitation</h4>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">ABC-123</div>
                      <p className="text-sm text-green-700">
                        Partagez ce code avec vos collègues pour qu'ils rejoignent MusiqueConnect
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'budget':
        return <BudgetDashboard selectedGroupId={selectedGroupId} />;
      default:
        return null;
    }
  };

  const getGroupStats = (groupId: string) => {
    const students = getStudentsByGroup(groupId);
    const groupHomework = homework.filter(hw => hw.groupId === groupId);
    const activeHomework = groupHomework.filter(hw => hw.dueDate > new Date());
    const groupMessages = messages.filter(msg => msg.groupId === groupId);
    const groupAnnouncements = announcements.filter(ann => ann.groupId === groupId);
    const groupAssignments = assignments.filter(assign => assign.groupIds.includes(groupId));
    
    return {
      studentCount: students.length,
      homeworkCount: activeHomework.length,
      messageCount: groupMessages.length,
      announcementCount: groupAnnouncements.length,
      assignmentCount: groupAssignments.length
    };
  };

  // Calculate finance statistics
  const totalSales = filteredPurchases
    .filter(p => p.status === 'paid')
    .reduce((total, purchase) => total + purchase.amount, 0);

  const totalCredit = filteredPurchases
    .filter(p => p.status === 'credit')
    .reduce((total, purchase) => total + purchase.amount, 0);

  // Simuler des étudiants pour la gamification
  const gamificationStudents = [
    { id: '1', name: 'Marie Dubois', avatar: 'https://ui-avatars.com/api/?name=Marie+Dubois&background=1473AA&color=fff&size=32' },
    { id: '2', name: 'Lucas Martin', avatar: 'https://ui-avatars.com/api/?name=Lucas+Martin&background=10B981&color=fff&size=32' },
    { id: '3', name: 'Sophie Bernard', avatar: 'https://ui-avatars.com/api/?name=Sophie+Bernard&background=8B5CF6&color=fff&size=32' },
    { id: '4', name: 'Thomas Leroy', avatar: 'https://ui-avatars.com/api/?name=Thomas+Leroy&background=F59E0B&color=fff&size=32' },
    { id: '5', name: 'Emma Rousseau', avatar: 'https://ui-avatars.com/api/?name=Emma+Rousseau&background=EF4444&color=fff&size=32' }
  ];

  // Fonctions pour les actions de gamification
  const handleGamificationSendMessage = () => {
    if (selectedGamificationStudent && gamificationMessageText.trim()) {
      console.log(`Message envoyé à ${selectedGamificationStudent}: ${gamificationMessageText}`);
      alert(`Message d'encouragement envoyé à ${gamificationStudents.find(s => s.id === selectedGamificationStudent)?.name}!`);
      setShowGamificationMessageModal(false);
      setGamificationMessageText('');
      setSelectedGamificationStudent('');
    }
  };

  const handleGamificationAwardPoints = () => {
    if (selectedGamificationStudent && gamificationPointsToAward > 0) {
      console.log(`${gamificationPointsToAward} points attribués à ${selectedGamificationStudent}`);
      alert(`${gamificationPointsToAward} points attribués à ${gamificationStudents.find(s => s.id === selectedGamificationStudent)?.name}!`);
      setShowGamificationPointsModal(false);
      setGamificationPointsToAward(10);
      setSelectedGamificationStudent('');
    }
  };

  const handleGamificationCreateChallenge = () => {
    if (gamificationChallengeTitle.trim() && gamificationChallengeDescription.trim()) {
      console.log(`Challenge créé: ${gamificationChallengeTitle}`);
      alert(`Challenge "${gamificationChallengeTitle}" créé avec succès!`);
      setShowGamificationChallengeModal(false);
      setGamificationChallengeTitle('');
      setGamificationChallengeDescription('');
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Fonction pour naviguer vers l'onglet Élèves
  const handleNavigateToStudents = (groupId?: string) => {
    setActiveTab('students');
    if (groupId) {
      setSelectedGroupId(groupId);
    }
  };

  // Vérifier si l'utilisateur a les permissions d'accès
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <User className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Accès refusé</h3>
            <p className="text-sm text-gray-500 mb-4">
              Vous devez être connecté pour accéder à cette page.
            </p>
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vérifier si Firebase est configuré
  const isFirebaseConfigured = () => {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
    return firebaseConfig.apiKey && firebaseConfig.apiKey !== 'test-api-key';
  };

  // DEBUG : log user et activeTab à chaque rendu
  useEffect(() => {
    console.log('[DEBUG] user:', user);
    console.log('[DEBUG] activeTab:', activeTab);
  }, [user, activeTab]);

  // Forcer l'initialisation de l'onglet actif si absent
  useEffect(() => {
    if (!activeTab) {
      setActiveTab('homework');
    }
  }, [activeTab]);

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col overflow-hidden">
      {/* Message d'authentification */}
      {authMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          authMessage.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-800' 
            : 'bg-red-100 border border-red-400 text-red-800'
        }`}>
          <div className="flex items-center">
            {authMessage.type === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{authMessage.text}</span>
            </div>
          </div>
        )}

      {/* Header avec logo, titre et profil */}
      <header className="bg-transparent backdrop-blur-sm px-6 py-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          {/* Logo et titre à gauche */}
          <div className="flex items-center gap-6">
            <img src="/logos/HeaderLogo.png" alt="MusiqueConnect" className="h-16" />

            {activeTab && (
              <div className="flex flex-col ml-20">
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'homework' && 'Pratiques'}
                  {activeTab === 'messages' && 'Messages'}
                  {activeTab === 'announcements' && 'Annonces'}
                  {activeTab === 'groups' && 'Groupes'}
                  {activeTab === 'students' && 'Élèves'}
                  {activeTab === 'assignments' && 'Devoirs assignés'}
                  {activeTab === 'notes' && 'Notes de cours'}
                  {activeTab === 'profile' && 'Profil'}
                  {activeTab === 'ia' && 'Maestro IA'}
                  {activeTab === 'gamification' && 'Gamification'}
                  {activeTab === 'tools' && 'Outils'}
                  {activeTab === 'google-sheets' && 'Synchronisation Google Sheets'}
                  {activeTab === 'share-code' && 'Partager MusiqueConnect'}
                  {activeTab === 'budget' && 'Budget'}
                </h1>
                <p className="text-sm text-gray-500">
                  {activeTab === 'homework' && 'Gérez les pratiques de vos élèves'}
                  {activeTab === 'messages' && 'Communiquez avec vos élèves et leurs parents'}
                  {activeTab === 'announcements' && 'Publiez des annonces importantes'}
                  {activeTab === 'groups' && 'Gérez vos groupes d\'élèves'}
                  {activeTab === 'students' && 'Consultez et gérez vos élèves'}
                  {activeTab === 'assignments' && 'Créez et suivez les devoirs'}
                  {activeTab === 'notes' && 'Organisez vos notes de cours'}
                  {activeTab === 'profile' && 'Gérez vos informations personnelles'}
                  {activeTab === 'ia' && 'Maestro IA'}
                  {activeTab === 'gamification' && 'Système de gamification'}
                  {activeTab === 'tools' && 'Outils pédagogiques'}
                  {activeTab === 'google-sheets' && 'Synchronisation Google Sheets'}
                  {activeTab === 'share-code' && 'Partagez MusiqueConnect avec vos collègues'}
                  {activeTab === 'budget' && 'Gérez votre budget et vos dépenses'}
                </p>
                </div>
            )}
              </div>
              
          {/* Informations profil à droite */}
              <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
                  </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-gray-500">Administrateur</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Se déconnecter"
                >
                  <LogOut className="w-5 h-5" />
                </button>
            </div>
          </div>
        </header>
        
      <div className="flex flex-1 overflow-hidden w-full">
        {/* Menu latéral gauche */}
        <aside className="w-80 flex flex-col gap-4 p-3 bg-transparent overflow-y-auto">
          {/* Bloc 1: Sélecteur de groupe */}
          <div className="border border-gray-200 rounded-xl bg-white shadow-xl shadow-[#1473AA]/20 p-3 backdrop-blur-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sélectionner un groupe</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1473AA] bg-white"
              >
                <option value="">Tous les groupes</option>
                {teacherGroups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
            
          {/* Bloc 2: Catégories */}
          <div className="border border-gray-200 rounded-xl bg-white shadow-xl shadow-[#1473AA]/20 p-4 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Catégories</h2>
            <div className="space-y-2">
                      <SidebarButton icon={<Music className="w-5 h-5 text-blue-500" />} label="Pratique" count={filteredHomework.length} active={activeTab==='homework'} onClick={()=>navigateToTab('homework')} />
        <SidebarButton icon={<BookOpen className="w-5 h-5 text-green-500" />} label="Devoir" count={filteredAssignments.length} active={activeTab==='assignments'} onClick={()=>navigateToTab('assignments')} />
        <SidebarButton icon={<FileText className="w-5 h-5 text-purple-500" />} label="Notes de cours" count={filteredCourseNotes.length} active={activeTab==='notes'} onClick={()=>navigateToTab('notes')} />
        <SidebarButton icon={<ShoppingCart className="w-5 h-5 text-orange-500" />} label="Ventes " count={null} active={activeTab==='sales'} onClick={()=>navigateToTab('sales')} />
        <SidebarButton icon={<Megaphone className="w-5 h-5 text-red-500" />} label="Annonces" count={null} active={activeTab==='announcements'} onClick={()=>navigateToTab('announcements')} />
              <SidebarButton icon={<MessageSquare className="w-5 h-5 text-teal-500" />} label="Musichat" count={filteredMessages.filter(m => !m.readBy.includes(user?.id || '')).length} active={activeTab==='messages'} onClick={()=>navigateToTab('messages')} />
                </div>
                </div>

          {/* Bloc 3: Maestro IA, Gamification, Outils */}
          <div className="border border-gray-200 rounded-xl bg-white shadow-xl shadow-[#1473AA]/20 p-4 backdrop-blur-sm space-y-2">
                    <SidebarButton icon={<Lightbulb className="w-5 h-5 text-yellow-500" />} label="Maestro IA" count={null} active={activeTab==='ia'} onClick={()=>navigateToTab('ia')} />
        <SidebarButton icon={<Target className="w-5 h-5 text-rose-500" />} label="Gamification" count={null} active={activeTab==='gamification'} onClick={()=>navigateToTab('gamification')} />
        <SidebarButton icon={<BarChart className="w-5 h-5 text-cyan-500" />} label="Outils" count={null} active={activeTab==='tools'} onClick={()=>navigateToTab('tools')} />
                </div>
        </aside>

        {/* Panneau central */}
        <main className="flex-1 relative bg-transparent overflow-hidden">
          {!activeTab ? (
            <>
              {/* Logo filigrane au centre */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 select-none">
                <img src="/logos/Logo centre.png" alt="MusiqueConnect" className="max-w-[80vw] max-h-[60vh] w-auto h-auto object-contain" />
                </div>
              
              {/* Message de bienvenue */}
              <div className="absolute z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center max-w-full px-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{getCurrentPageName()}</h1>
                <p className="text-lg md:text-xl text-gray-600">Sélectionnez une option dans le menu pour commencer</p>
                </div>
            </>
          ) : (
            <div className="h-full flex flex-col">
              {/* Indicateur de groupe sélectionné */}
              {selectedGroup && (
                <div className="p-4 bg-transparent">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Groupe sélectionné :</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#1473AA] text-white">
                      <Users className="w-4 h-4 mr-1" />
                      {selectedGroup.name}
                    </span>
              <button
                      onClick={() => setSelectedGroupId('')}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="Désélectionner le groupe"
                    >
                      <X className="w-4 h-4" />
              </button>
            </div>
                </div>
              )}
              


          {/* Contenu principal */}
              <div className="flex-1 overflow-y-auto p-6">
                  {renderTabContent()}
                  </div>
                </div>
              )}
        </main>

        {/* Menu latéral droit */}
        <aside className="w-80 flex flex-col gap-4 p-3 bg-transparent overflow-y-auto">
          {/* Bloc 4: Gestion */}
          <div className="border border-gray-200 rounded-xl bg-white shadow-xl shadow-[#1473AA]/20 p-4 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Gestion</h2>
            <div className="space-y-2">
                      <SidebarButton icon={<Users className="w-5 h-5 text-indigo-500" />} label="Groupes" count={null} active={activeTab==='groups'} onClick={()=>navigateToTab('groups')} />
        <SidebarButton icon={<UserPlus className="w-5 h-5 text-pink-500" />} label="Élèves" count={null} active={activeTab==='students'} onClick={()=>navigateToTab('students')} />
        <SidebarButton icon={<DollarSign className="w-5 h-5 text-emerald-500" />} label="Ventes totales" count={null} active={activeTab==='sales'} onClick={()=>navigateToTab('sales')} />
        <SidebarButton icon={<DollarSign className="w-5 h-5 text-green-600" />} label="Budget" count={null} active={activeTab==='budget'} onClick={()=>navigateToTab('budget')} />
        <SidebarButton icon={<Database className="w-5 h-5 text-green-500" />} label="Google Sheets" count={null} active={activeTab==='google-sheets'} onClick={()=>navigateToTab('google-sheets')} />
                </div>
                </div>

          {/* Bloc 5: Calendrier */}
          <div className="border border-gray-200 rounded-xl bg-white shadow-xl shadow-[#1473AA]/20 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Calendrier</h3>
                <div className="flex items-center gap-1">
                <button onClick={goToPreviousMonth} className="p-1 hover:bg-gray-200 rounded"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
                <button onClick={goToNextMonth} className="p-1 hover:bg-gray-200 rounded"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
                </div>
              </div>
              <div className="text-center mb-2">
              <p className="text-sm font-medium text-gray-900">{format(currentDate, 'MMMM yyyy', { locale: fr })}</p>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                <div key={`day-${index}`} className="text-xs text-gray-500 text-center font-medium">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => {
                  const day = i + 1;
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  return (
                  <div key={day} className={`text-xs text-center p-1 rounded font-medium ${isToday ? 'bg-[#1473AA] text-white' : isCurrentMonth ? 'text-gray-900 hover:bg-gray-200' : 'text-gray-400'}`}>{day}</div>
                  );
                })}
        </div>
      </div>

          {/* Bloc 6: Profil */}
          <div className="border border-gray-200 rounded-xl bg-white shadow-xl shadow-[#1473AA]/20 p-4 mt-2 backdrop-blur-sm">
            <SidebarButton 
              icon={<User className="w-5 h-5 text-blue-500" />} 
              label="Profil" 
              count={null} 
              active={activeTab==='profile'} 
              onClick={()=>navigateToTab('profile')} 
            />
              </div>
        </aside>
            </div>
            

            </div>
  );
}