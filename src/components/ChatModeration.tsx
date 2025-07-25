import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  Users, 
  MessageSquare, 
  Ban, 
  Eye, 
  EyeOff, 
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  User,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';

interface ChatModerationProps {
  groupId: string;
  onBackToChat?: () => void;
}

interface ModerationAlert {
  id: string;
  type: 'inappropriate' | 'spam' | 'bullying' | 'off_topic' | 'personal_info';
  studentId: string;
  studentName: string;
  messageId: string;
  messageContent: string;
  timestamp: Date;
  status: 'pending' | 'reviewed' | 'resolved';
  action?: 'warned' | 'banned' | 'ignored';
}

interface BannedStudent {
  studentId: string;
  studentName: string;
  bannedAt: Date;
  bannedBy: string;
  reason: string;
  expiresAt?: Date;
}

export default function ChatModeration({ groupId, onBackToChat }: ChatModerationProps) {
  const [alerts, setAlerts] = useState<ModerationAlert[]>([]);
  const [bannedStudents, setBannedStudents] = useState<BannedStudent[]>([]);
  const [showBannedStudents, setShowBannedStudents] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<ModerationAlert | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState<'1h' | '24h' | '7d' | 'permanent'>('24h');
  const { user } = useAuth();
  const { groups, messages, users } = useData();

  const group = groups.find(g => g.id === groupId);
  const groupStudents = users.filter(u => group?.studentIds.includes(u.id));

  // Simuler des alertes de modération (dans un vrai système, ceci viendrait d'un système de détection automatique)
  useEffect(() => {
    const mockAlerts: ModerationAlert[] = [
      {
        id: '1',
        type: 'bullying',
        studentId: 'student1',
        studentName: 'Marie Dubois',
        messageId: 'msg1',
        messageContent: 'Message potentiellement intimidant...',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        status: 'pending'
      },
      {
        id: '2',
        type: 'personal_info',
        studentId: 'student2',
        studentName: 'Jean Tremblay',
        messageId: 'msg2',
        messageContent: 'Partage d\'informations personnelles...',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        status: 'pending'
      }
    ];
    setAlerts(mockAlerts);
  }, [groupId]);

  const getAlertTypeInfo = (type: string) => {
    switch (type) {
      case 'inappropriate':
        return { label: 'Contenu inapproprié', color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertTriangle };
      case 'spam':
        return { label: 'Spam répétitif', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: Bell };
      case 'bullying':
        return { label: 'Intimidation/Harcèlement', color: 'text-red-700', bgColor: 'bg-red-100', icon: Shield };
      case 'personal_info':
        return { label: 'Informations personnelles', color: 'text-purple-600', bgColor: 'bg-purple-50', icon: User };
      default:
        return { label: 'Autre', color: 'text-gray-600', bgColor: 'bg-gray-50', icon: AlertTriangle };
    }
  };

  const handleWarnStudent = (alert: ModerationAlert) => {
    setAlerts(prev => prev.map(a => 
      a.id === alert.id 
        ? { ...a, status: 'resolved', action: 'warned' }
        : a
    ));
    // Ici, on enverrait une notification d'avertissement à l'élève
  };

  const handleBanStudent = (alert: ModerationAlert) => {
    if (!banReason.trim()) return;

    const student = users.find(u => u.id === alert.studentId);
    if (!student) return;

    const bannedStudent: BannedStudent = {
      studentId: alert.studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      bannedAt: new Date(),
      bannedBy: user?.id || '',
      reason: banReason,
      expiresAt: banDuration === 'permanent' ? undefined : 
        new Date(Date.now() + (banDuration === '1h' ? 3600000 : banDuration === '24h' ? 86400000 : 604800000))
    };

    setBannedStudents(prev => [...prev, bannedStudent]);
    setAlerts(prev => prev.map(a => 
      a.id === alert.id 
        ? { ...a, status: 'resolved', action: 'banned' }
        : a
    ));
    setBanReason('');
    setSelectedAlert(null);
  };

  const handleIgnoreAlert = (alert: ModerationAlert) => {
    setAlerts(prev => prev.map(a => 
      a.id === alert.id 
        ? { ...a, status: 'resolved', action: 'ignored' }
        : a
    ));
  };

  const handleUnbanStudent = (bannedStudent: BannedStudent) => {
    setBannedStudents(prev => prev.filter(b => b.studentId !== bannedStudent.studentId));
  };

  const isStudentBanned = (studentId: string) => {
    const banned = bannedStudents.find(b => b.studentId === studentId);
    if (!banned) return false;
    if (!banned.expiresAt) return true; // Permanent ban
    return new Date() < banned.expiresAt;
  };

  const pendingAlerts = alerts.filter(a => a.status === 'pending');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBackToChat && (
                <button
                  onClick={onBackToChat}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour au chat
                </button>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Sécurité du Clavardage</h2>
                <p className="text-gray-600 mt-1">Assurez un environnement sécuritaire pour les discussions du groupe {group?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{pendingAlerts.length}</p>
                <p className="text-xs text-gray-500">Alertes de sécurité</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes en attente */}
      {pendingAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Alertes de sécurité ({pendingAlerts.length})
            </h3>
            <p className="text-sm text-gray-600 mt-1">Messages nécessitant votre attention pour assurer la sécurité des élèves</p>
          </div>
          <div className="p-6 space-y-4">
            {pendingAlerts.map((alert) => {
              const typeInfo = getAlertTypeInfo(alert.type);
              const Icon = typeInfo.icon;
              
              return (
                <div key={alert.id} className={`p-4 rounded-lg border ${typeInfo.bgColor} border-gray-200`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-0.5 ${typeInfo.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-sm font-medium ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(alert.timestamp, 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {alert.studentName}
                        </p>
                        <p className="text-sm text-gray-600 mb-3">
                          "{alert.messageContent}"
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleWarnStudent(alert)}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
                          >
                            Conseiller
                          </button>
                          <button
                            onClick={() => setSelectedAlert(alert)}
                            className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-md text-sm font-medium hover:bg-orange-200 transition-colors"
                          >
                            Suspendre temporairement
                          </button>
                          <button
                            onClick={() => handleIgnoreAlert(alert)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            Pas de problème
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Élèves suspendus temporairement */}
      {bannedStudents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Élèves suspendus temporairement ({bannedStudents.length})
              </h3>
              <button
                onClick={() => setShowBannedStudents(!showBannedStudents)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                {showBannedStudents ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showBannedStudents ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">Suspensions temporaires pour assurer la sécurité du groupe</p>
          </div>
          {showBannedStudents && (
            <div className="p-6 space-y-3">
              {bannedStudents.map((banned) => (
                <div key={banned.studentId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900">{banned.studentName}</p>
                      <p className="text-sm text-gray-600">Banni le {format(banned.bannedAt, 'dd/MM/yyyy à HH:mm')}</p>
                      <p className="text-xs text-red-600">Raison: {banned.reason}</p>
                      {banned.expiresAt && (
                        <p className="text-xs text-gray-500">
                          Expire le {format(banned.expiresAt, 'dd/MM/yyyy à HH:mm')}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnbanStudent(banned)}
                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    Réintégrer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Statistiques de sécurité */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alertes de sécurité</p>
              <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Résolues</p>
              <p className="text-2xl font-bold text-green-600">{resolvedAlerts.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Suspensions actives</p>
              <p className="text-2xl font-bold text-orange-600">{bannedStudents.filter(b => isStudentBanned(b.studentId)).length}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Modal de suspension temporaire */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suspendre temporairement un élève</h3>
            <p className="text-sm text-gray-600 mb-4">Cette action protège l'élève et le groupe en cas de comportement problématique</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison de la suspension
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Expliquez la raison de la suspension temporaire..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée de la suspension
                </label>
                <select
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="1h">1 heure</option>
                  <option value="24h">24 heures</option>
                  <option value="7d">7 jours</option>
                  <option value="permanent">Indéfinie (nécessite révision)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleBanStudent(selectedAlert)}
                  disabled={!banReason.trim()}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suspendre
                </button>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 