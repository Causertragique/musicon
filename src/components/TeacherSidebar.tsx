import React from 'react';
import { 
  Users, Music, MessageSquare, Megaphone, LogOut, Settings, UserPlus, BookOpen, FileText, DollarSign, Home, ChevronDown, BarChart2, Wrench, LayoutDashboard, Brain, User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { HeaderLogo } from './Logo';

type TabType = 'homework' | 'messages' | 'announcements' | 'profile' | 'groups' | 'students' | 'assignments' | 'notes' | 'finance' | 'dashboard' | 'tools' | 'ai' | 'settings';

const TABS = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'homework', label: 'Devoirs', icon: Music },
  { id: 'messages', label: 'Clavardage', icon: MessageSquare },
  { id: 'announcements', label: 'Annonces', icon: Megaphone },
  { id: 'groups', label: 'Groupes', icon: Users },
  { id: 'students', label: 'Élèves', icon: Users },
  { id: 'assignments', label: 'Exercices', icon: BookOpen },
  { id: 'notes', label: 'Notes de Cours', icon: FileText },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'tools', label: 'Outils', icon: Wrench },
  { id: 'ai', label: 'Intelligence Artificielle', icon: Brain },
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'settings', label: 'Paramètres', icon: Settings }
];

const TeacherSidebar = ({ activeTab, setActiveTab, selectedGroupId, setSelectedGroupId }: { 
  activeTab: TabType; 
  setActiveTab: (tab: TabType) => void; 
  selectedGroupId: string;
  setSelectedGroupId: (id: string) => void;
}) => {
  const { user, logout } = useAuth();
  const { getActiveGroups } = useData();
  const teacherGroups = getActiveGroups(user?.id || '');
  const selectedGroup = teacherGroups.find(g => g.id === selectedGroupId);

  return (
    <aside className="w-72 flex flex-col bg-white border-r border-gray-200 p-4 space-y-6">
      {/* Logo */}
      <div className="px-2">
        <HeaderLogo />
      </div>

      {/* Bloc 1: Sélection du groupe */}
      <div className="px-2">
        <label htmlFor="group-select" className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Groupe Actif</label>
        <div className="relative">
          <select
            id="group-select"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-800 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:bg-white focus:border-primary-500 text-sm"
          >
            <option value="">Tous les groupes</option>
            {teacherGroups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Bloc 2: Catégories/Navigation */}
      <nav className="flex-1 space-y-1.5 px-2">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Menu</p>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Bloc 3: Analyse */}
      <div className="px-2">
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Analyse</p>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <BarChart2 className="w-5 h-5 text-primary-600" />
            <h4 className="font-semibold text-gray-800">Statistiques</h4>
          </div>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between"><span>Élèves actifs:</span><span className="font-medium text-gray-800">12</span></div>
            <div className="flex justify-between"><span>Devoirs en attente:</span><span className="font-medium text-gray-800">5</span></div>
            <div className="flex justify-between"><span>Messages non lus:</span><span className="font-medium text-gray-800">3</span></div>
          </div>
        </div>
      </div>

      {/* Profil utilisateur et Déconnexion */}
      <div className="mt-auto border-t border-gray-200 pt-4 px-2">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={user?.picture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
            alt="Profil"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">Enseignant</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default TeacherSidebar; 