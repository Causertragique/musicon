import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, 
  MessageSquare, 
  Megaphone, 
  LogOut,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  Home,
  School,
  Plus,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  X,
  Eye,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Mic,
  BookOpen,
  Target,
  Video,
  Headphones,
  Share2,
  Download,
  Star,
  Heart,
  ThumbsUp,
  Send,
  Paperclip,
  Image,
  Phone,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { format, isAfter, isBefore, addDays, startOfMonth, endOfMonth, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import StudentProfile from './StudentProfile';
import StudentChat from './StudentChat';
import StudentFinance from './StudentFinance';
import RoleSwitcher from './RoleSwitcher';

type TabType = 'homework' | 'messages' | 'announcements' | 'profile' | 'finance';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('homework');
  const [showPracticeForm, setShowPracticeForm] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logout } = useAuth();
  const { groups, homework, messages, announcements, submitHomework, addPracticeReport, getStudentPracticeReports, getStudentDebt } = useData();

  const studentGroup = groups.find(group => group.studentIds.includes(user?.id || ''));
  const studentHomework = homework.filter(hw => hw.groupId === studentGroup?.id);
  const studentMessages = messages.filter(msg => 
    msg.groupId === studentGroup?.id || msg.receiverId === user?.id
  );
  const studentAnnouncements = announcements.filter(ann => 
    !ann.groupId || ann.groupId === studentGroup?.id
  );

  // Get student's practice reports
  const practiceReports = user ? getStudentPracticeReports(user.id) : [];

  // Get student's debt information
  const studentDebt = user ? getStudentDebt(user.id) : { studentId: '', totalDebt: 0, purchases: [] };

  // Filter practice reports by date
  const getFilteredReports = () => {
    let filtered = practiceReports;

    // Date filter
    const now = new Date();
    switch (dateFilter) {
      case 'thisMonth':
        filtered = filtered.filter(report => 
          isWithinInterval(report.practiceDate, { start: startOfMonth(now), end: endOfMonth(now) })
        );
        break;
      case 'lastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        filtered = filtered.filter(report => 
          isWithinInterval(report.practiceDate, { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) })
        );
        break;
      case 'last7Days':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(report => report.practiceDate >= sevenDaysAgo);
        break;
      case 'last30Days':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(report => report.practiceDate >= thirtyDaysAgo);
        break;
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.nextGoals.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.homeworkTitle && report.homeworkTitle.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  const filteredReports = getFilteredReports();

  // Calculate statistics
  const totalPracticeTime = practiceReports.reduce((total, report) => total + report.duration, 0);
  const averagePracticeTime = practiceReports.length > 0 ? Math.round(totalPracticeTime / practiceReports.length) : 0;
  
  // Calculate weekly average
  const getWeeklyAverage = () => {
    if (practiceReports.length === 0) return 0;
    
    const now = new Date();
    const weeksToCheck = 4; // Check last 4 weeks
    let totalWeeklyTime = 0;
    let weeksWithPractice = 0;
    
    for (let i = 0; i < weeksToCheck; i++) {
      const weekStart = startOfWeek(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = endOfWeek(weekStart);
      
      const weekPractices = practiceReports.filter(report => 
        isWithinInterval(report.practiceDate, { start: weekStart, end: weekEnd })
      );
      
      if (weekPractices.length > 0) {
        totalWeeklyTime += weekPractices.reduce((sum, report) => sum + report.duration, 0);
        weeksWithPractice++;
      }
    }
    
    return weeksWithPractice > 0 ? Math.round(totalWeeklyTime / weeksWithPractice) : 0;
  };

  const weeklyAverage = getWeeklyAverage();

  const tabs = [
    { id: 'homework', label: 'Pratique', icon: Music, count: studentHomework.length },
    { id: 'messages', label: 'Chat', icon: MessageSquare, count: studentMessages.length },
    { id: 'announcements', label: 'Annonces', icon: Megaphone, count: studentAnnouncements.length },
    { id: 'finance', label: 'Finance', icon: DollarSign, count: studentDebt.purchases.length },
    { id: 'profile', label: 'Profil', icon: User, count: 0 }
  ];

  const getHomeworkStatus = (hw: any) => {
    const hasSubmission = hw.submissions.some((sub: any) => sub.studentId === user?.id);
    const isOverdue = isAfter(new Date(), hw.dueDate);
    const isDueSoon = isBefore(new Date(), hw.dueDate) && isAfter(addDays(new Date(), 2), hw.dueDate);

    if (hasSubmission) return { status: 'soumis', color: 'green', icon: CheckCircle };
    if (isOverdue) return { status: 'en retard', color: 'red', icon: AlertCircle };
    if (isDueSoon) return { status: 'bientôt dû', color: 'yellow', icon: Clock };
    return { status: 'en attente', color: 'blue', icon: Calendar };
  };

  const handleSubmitHomework = (homeworkId: string, practiceData: {
    practiceDate: Date;
    duration: number;
    location: 'school' | 'home';
    content: string;
    nextGoals: string;
  }) => {
    if (user) {
      submitHomework({
        homeworkId,
        studentId: user.id,
        ...practiceData
      });
    }
  };

  const handleSubmitGeneralPractice = (practiceData: {
    practiceDate: Date;
    duration: number;
    location: 'school' | 'home';
    content: string;
    nextGoals: string;
  }) => {
    if (user) {
      addPracticeReport({
        studentId: user.id,
        type: 'general',
        ...practiceData
      });
    }
    setShowPracticeForm(false);
  };

  const renderHomeworkTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mes Exercices de Pratique</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            Groupe : {studentGroup?.name || 'Aucun groupe assigné'}
          </div>
          <button
            onClick={() => setShowPracticeForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Soumettre une Pratique
          </button>
        </div>
      </div>

      {/* Statistiques de pratique - toujours visibles */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            Mes Statistiques de Pratique
          </h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans les pratiques..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-64"
              />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input w-48"
            >
              <option value="all">Toutes les dates</option>
              <option value="last7Days">7 derniers jours</option>
              <option value="last30Days">30 derniers jours</option>
              <option value="thisMonth">Ce mois-ci</option>
              <option value="lastMonth">Mois dernier</option>
            </select>
          </div>
        </div>

        {/* Résumé des statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{practiceReports.length}</div>
            <div className="text-sm text-blue-600">Total Pratiques</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{Math.round(totalPracticeTime / 60)}h {totalPracticeTime % 60}min</div>
            <div className="text-sm text-green-600">Temps Total</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{averagePracticeTime}min</div>
            <div className="text-sm text-purple-600">Durée Moyenne</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{weeklyAverage}min</div>
            <div className="text-sm text-orange-600">Durée Moyenne par Semaine</div>
          </div>
        </div>

        {/* Tableau des pratiques */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Durée</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Lieu</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Contenu</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    {searchTerm || dateFilter !== 'all' 
                      ? 'Aucune pratique trouvée avec ces filtres'
                      : 'Aucune pratique enregistrée'
                    }
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{format(report.practiceDate, 'dd/MM/yyyy')}</div>
                      <div className="text-xs text-gray-500">
                        Soumis le {format(report.submittedAt, 'dd/MM HH:mm')}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{report.duration} min</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1">
                        {report.location === 'home' ? (
                          <>
                            <Home className="w-3 h-3" />
                            Maison
                          </>
                        ) : (
                          <>
                            <School className="w-3 h-3" />
                            École
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="truncate" title={report.content}>
                        {report.content}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedPractice(selectedPractice === report.id ? null : report.id)}
                        className="btn-outline text-xs flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        {selectedPractice === report.id ? 'Masquer' : 'Voir'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredReports.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            {filteredReports.length} pratique{filteredReports.length > 1 ? 's' : ''} affichée{filteredReports.length > 1 ? 's' : ''}
            {(searchTerm || dateFilter !== 'all') && ` sur ${practiceReports.length} au total`}
          </div>
        )}
      </div>

      {/* Détails de la pratique sélectionnée */}
      {selectedPractice && (
        <div className="card">
          {(() => {
            const practice = practiceReports.find(p => p.id === selectedPractice);
            if (!practice) return null;
            
            return (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Détails de la Pratique - {format(practice.practiceDate, 'dd MMMM yyyy')}
                  </h3>
                  <button
                    onClick={() => setSelectedPractice(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-green-600 font-medium">Durée</div>
                    <div className="text-lg font-bold text-green-900">{practice.duration} minutes</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-purple-600 font-medium">Lieu</div>
                    <div className="text-lg font-bold text-purple-900 flex items-center gap-2">
                      {practice.location === 'home' ? (
                        <>
                          <Home className="w-4 h-4" />
                          Maison
                        </>
                      ) : (
                        <>
                          <School className="w-4 h-4" />
                          École
                        </>
                      )}
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-sm text-orange-600 font-medium">Date de Soumission</div>
                    <div className="text-lg font-bold text-orange-900">
                      {format(practice.submittedAt, 'dd/MM HH:mm')}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Contenu de la Pratique</h4>
                    <p className="text-gray-700 leading-relaxed">{practice.content}</p>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Objectifs pour la Prochaine Pratique</h4>
                    <p className="text-blue-800 leading-relaxed">{practice.nextGoals}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Exercices assignés */}
      {studentHomework.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Exercices Assignés</h3>
          <div className="grid gap-6">
            {studentHomework.map((hw) => {
              const statusInfo = getHomeworkStatus(hw);
              const StatusIcon = statusInfo.icon;
              const hasSubmitted = hw.submissions.some((sub: any) => sub.studentId === user?.id);
              const submission = hw.submissions.find((sub: any) => sub.studentId === user?.id);

              return (
                <div key={hw.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{hw.title}</h3>
                      <p className="text-gray-600 mb-4">{hw.description}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                      statusInfo.color === 'red' ? 'bg-red-100 text-red-800' :
                      statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      <StatusIcon className="w-4 h-4" />
                      {statusInfo.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Échéance : {format(hw.dueDate, 'dd MMM yyyy')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(hw.dueDate, 'HH:mm')}
                    </div>
                  </div>

                  {hasSubmitted ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Pratique Soumise</span>
                      </div>
                      <p className="text-green-700 text-sm mb-3">
                        Soumis le {format(submission?.submittedAt || new Date(), 'dd MMM yyyy HH:mm')}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <strong>Date de pratique :</strong> {format(submission?.practiceDate || new Date(), 'dd MMM yyyy')}
                          </div>
                          <div>
                            <strong>Durée :</strong> {submission?.duration} minutes
                          </div>
                          <div className="flex items-center gap-1">
                            <strong>Lieu :</strong>
                            {submission?.location === 'home' ? (
                              <span className="flex items-center gap-1">
                                <Home className="w-3 h-3" />
                                Maison
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <School className="w-3 h-3" />
                                École
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-white rounded p-3 text-sm">
                          <strong>Contenu de la pratique :</strong>
                          <p className="mt-1">{submission?.content}</p>
                        </div>
                        
                        <div className="bg-white rounded p-3 text-sm">
                          <strong>Objectifs pour la prochaine pratique :</strong>
                          <p className="mt-1">{submission?.nextGoals}</p>
                        </div>
                      </div>
                      
                      {submission?.grade && (
                        <div className="mt-3 p-3 bg-blue-50 rounded">
                          <p className="text-sm"><strong>Note :</strong> {submission.grade}/100</p>
                          {submission.feedback && (
                            <p className="text-sm mt-1"><strong>Commentaire du Professeur :</strong> {submission.feedback}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <HomeworkSubmissionForm 
                      homeworkId={hw.id}
                      onSubmit={handleSubmitHomework}
                      isOverdue={isAfter(new Date(), hw.dueDate)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Popup du formulaire de pratique générale */}
      {showPracticeForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="practice-form-title"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 
                  id="practice-form-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  Soumettre un Rapport de Pratique
                </h3>
                <button
                  onClick={() => setShowPracticeForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  aria-label="Fermer le formulaire de pratique"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <GeneralPracticeForm 
                onSubmit={handleSubmitGeneralPractice}
                onCancel={() => setShowPracticeForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderMessagesTab = () => (
    <StudentChat groupId={studentGroup?.id} />
  );

  const renderAnnouncementsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Annonces Musicales</h2>
      
      {studentAnnouncements.length === 0 ? (
        <div className="text-center py-12">
          <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucune annonce pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {studentAnnouncements.map((announcement) => (
            <div key={announcement.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  announcement.priority === 'high' ? 'bg-red-100 text-red-800' :
                  announcement.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {announcement.priority === 'high' ? 'haute priorité' :
                   announcement.priority === 'medium' ? 'priorité moyenne' : 'faible priorité'}
                </span>
              </div>
              <p className="text-gray-700 mb-3">{announcement.content}</p>
              <p className="text-sm text-gray-600">
                Publié le {format(announcement.createdAt, 'dd MMM yyyy HH:mm')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFinanceTab = () => (
    <StudentFinance />
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'homework':
        return renderHomeworkTab();
      case 'messages':
        return renderMessagesTab();
      case 'announcements':
        return renderAnnouncementsTab();
      case 'finance':
        return renderFinanceTab();
      case 'profile':
        return <StudentProfile />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec photo de profil et informations */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt="Photo de profil"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              )}
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-sm text-gray-600">Élève en Musique</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={logout}
                className="btn-outline flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Barre latérale */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </div>
                    {tab.count > 0 && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activeTab === tab.id
                          ? 'bg-primary-200 text-primary-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Informations personnelles */}
            <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Mes Informations</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Instrument</span>
                  <span className="font-medium">{user?.instrument || 'Non spécifié'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Groupe</span>
                  <span className="font-medium">{studentGroup?.name || 'Aucun'}</span>
                </div>
              </div>
            </div>

            {/* Statistiques rapides */}
            <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Statistiques de Pratique</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Pratiques</span>
                  <span className="font-medium">{practiceReports.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Exercices Assignés</span>
                  <span className="font-medium">{studentHomework.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Terminées</span>
                  <span className="font-medium text-green-600">
                    {studentHomework.filter(hw => 
                      hw.submissions.some(sub => sub.studentId === user?.id)
                    ).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">En attente</span>
                  <span className="font-medium text-yellow-600">
                    {studentHomework.filter(hw => 
                      !hw.submissions.some(sub => sub.studentId === user?.id) && 
                      isAfter(hw.dueDate, new Date())
                    ).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Temps Total</span>
                  <span className="font-medium text-blue-600">
                    {Math.round(totalPracticeTime / 60)}h {totalPracticeTime % 60}min
                  </span>
                </div>
              </div>
            </div>

            {/* Alerte dette si nécessaire */}
            {studentDebt.totalDebt > 0 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Dette en Cours
                </h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600">Montant dû</span>
                    <span className="font-medium text-red-800">{studentDebt.totalDebt.toFixed(2)}$ CAD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600">Achats en attente</span>
                    <span className="font-medium text-red-800">
                      {studentDebt.purchases.filter(p => p.status === 'credit').length}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('finance')}
                  className="mt-2 text-xs text-red-700 hover:text-red-800 underline"
                >
                  Voir les détails
                </button>
              </div>
            )}
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneralPracticeForm({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (data: {
    practiceDate: Date;
    duration: number;
    location: 'school' | 'home';
    content: string;
    nextGoals: string;
  }) => void;
  onCancel: () => void;
}) {
  const [practiceDate, setPracticeDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState<'school' | 'home'>('home');
  const [content, setContent] = useState('');
  const [nextGoals, setNextGoals] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !nextGoals.trim() || !duration) return;

    setIsSubmitting(true);
    try {
      onSubmit({
        practiceDate: new Date(practiceDate),
        duration: parseInt(duration),
        location,
        content,
        nextGoals
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-blue-900 mb-2">Rapport de Pratique Générale</h4>
        <p className="text-blue-700 text-sm">
          Utilisez ce formulaire pour soumettre un rapport de pratique même sans exercice assigné.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="practiceDate" className="block text-sm font-medium text-gray-700 mb-2">
            Date de Pratique
          </label>
          <input
            type="date"
            id="practiceDate"
            value={practiceDate}
            onChange={(e) => setPracticeDate(e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            Durée (minutes)
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="input"
            placeholder="ex: 30"
            min="1"
            max="300"
            required
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Lieu de Pratique
          </label>
          <select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value as 'school' | 'home')}
            className="input"
            required
          >
            <option value="home">🏠 Maison</option>
            <option value="school">🏫 École</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Contenu de la Pratique
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="textarea"
          rows={4}
          placeholder="Décrivez ce que vous avez pratiqué : exercices techniques, morceaux travaillés, difficultés rencontrées, progrès réalisés..."
          required
        />
      </div>

      <div>
        <label htmlFor="nextGoals" className="block text-sm font-medium text-gray-700 mb-2">
          Objectifs pour la Prochaine Pratique
        </label>
        <textarea
          id="nextGoals"
          value={nextGoals}
          onChange={(e) => setNextGoals(e.target.value)}
          className="textarea"
          rows={3}
          placeholder="Quels sont vos objectifs pour la prochaine session de pratique ? Sur quoi voulez-vous vous concentrer ?"
          required
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim() || !nextGoals.trim() || !duration}
          className="btn-primary"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Soumettre le Rapport'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

function HomeworkSubmissionForm({ 
  homeworkId, 
  onSubmit, 
  isOverdue 
}: { 
  homeworkId: string; 
  onSubmit: (id: string, data: {
    practiceDate: Date;
    duration: number;
    location: 'school' | 'home';
    content: string;
    nextGoals: string;
  }) => void;
  isOverdue: boolean;
}) {
  const [practiceDate, setPracticeDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState<'school' | 'home'>('home');
  const [content, setContent] = useState('');
  const [nextGoals, setNextGoals] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !nextGoals.trim() || !duration) return;

    setIsSubmitting(true);
    try {
      onSubmit(homeworkId, {
        practiceDate: new Date(practiceDate),
        duration: parseInt(duration),
        location,
        content,
        nextGoals
      });
      setPracticeDate(format(new Date(), 'yyyy-MM-dd'));
      setDuration('');
      setLocation('home');
      setContent('');
      setNextGoals('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={`border rounded-lg p-4 mb-4 ${
        isOverdue 
          ? 'bg-red-50 border-red-200' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <h4 className={`font-medium mb-2 ${
          isOverdue ? 'text-red-900' : 'text-blue-900'
        }`}>
          {isOverdue ? '⚠️ Soumission en Retard' : 'Soumettre votre Rapport de Pratique'}
        </h4>
        <p className={`text-sm ${
          isOverdue ? 'text-red-700' : 'text-blue-700'
        }`}>
          {isOverdue 
            ? 'L\'échéance est dépassée, mais vous pouvez encore soumettre votre travail. Il sera marqué comme "en retard".'
            : 'Remplissez ce formulaire pour envoyer votre rapport de pratique au professeur.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="practiceDate" className="block text-sm font-medium text-gray-700 mb-2">
            Date de Pratique
          </label>
          <input
            type="date"
            id="practiceDate"
            value={practiceDate}
            onChange={(e) => setPracticeDate(e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            Durée (minutes)
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="input"
            placeholder="ex: 30"
            min="1"
            max="300"
            required
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Lieu de Pratique
          </label>
          <select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value as 'school' | 'home')}
            className="input"
            required
          >
            <option value="home">🏠 Maison</option>
            <option value="school">🏫 École</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Contenu de la Pratique
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="textarea"
          rows={4}
          placeholder="Décrivez ce que vous avez pratiqué : exercices techniques, morceaux travaillés, difficultés rencontrées, progrès réalisés..."
          required
        />
      </div>

      <div>
        <label htmlFor="nextGoals" className="block text-sm font-medium text-gray-700 mb-2">
          Objectifs pour la Prochaine Pratique
        </label>
        <textarea
          id="nextGoals"
          value={nextGoals}
          onChange={(e) => setNextGoals(e.target.value)}
          className="textarea"
          rows={3}
          placeholder="Quels sont vos objectifs pour la prochaine session de pratique ? Sur quoi voulez-vous vous concentrer ?"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !content.trim() || !nextGoals.trim() || !duration}
        className={`${
          isOverdue 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'btn-primary'
        } flex items-center gap-2`}
      >
        {isOverdue && <AlertCircle className="w-4 h-4" />}
        {isSubmitting 
          ? 'Envoi en cours...' 
          : isOverdue 
            ? 'Soumettre en Retard' 
            : 'Envoyer le Rapport au Professeur'
        }
      </button>
    </form>
  );
}