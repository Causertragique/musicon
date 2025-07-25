import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Plus, 
  Filter, 
  Search, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Users,
  Music,
  Wrench,
  BookOpen,
  TrendingUp,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fundingRequestService } from '../services/firebaseService';
import { FundingRequest } from '../types';

interface FundingRequestManagerProps {
  selectedGroupId?: string;
}

export default function FundingRequestManager({ selectedGroupId }: FundingRequestManagerProps) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FundingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FundingRequest['status'] | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<FundingRequest['category'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    processing: 0,
    completed: 0,
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [requestsData, stats] = await Promise.all([
        isAdmin ? fundingRequestService.getAll() : fundingRequestService.getByTeacherId(user?.id || ''),
        fundingRequestService.getStatistics()
      ]);
      
      setRequests(requestsData);
      setStatistics(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: FundingRequest['category']) => {
    switch (category) {
      case 'fournitures':
        return <BookOpen className="w-5 h-5" />;
      case 'specialistes':
        return <Users className="w-5 h-5" />;
      case 'evenements':
        return <Music className="w-5 h-5" />;
      case 'reparations':
        return <Wrench className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const getCategoryName = (category: FundingRequest['category']) => {
    switch (category) {
      case 'fournitures':
        return 'Fournitures';
      case 'specialistes':
        return 'Spécialistes Externes';
      case 'evenements':
        return 'Événements';
      case 'reparations':
        return 'Réparations';
      default:
        return category;
    }
  };

  const getStatusColor = (status: FundingRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status: FundingRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      case 'processing':
        return 'En traitement';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: FundingRequest['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || request.category === filterCategory;
    const matchesSearch = searchTerm === '' || 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des demandes de financement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Sorties d'Argent</h2>
          <p className="text-gray-600">Demandes de financement et suivi des dépenses</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Demande
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Demandes</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-semibold text-yellow-600">{statistics.pending}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approuvées</p>
              <p className="text-2xl font-semibold text-green-600">{statistics.approved}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Montant Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.totalAmount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher une demande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FundingRequest['status'] | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
              <option value="processing">En traitement</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as FundingRequest['category'] | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Toutes les catégories</option>
              <option value="fournitures">Fournitures</option>
              <option value="specialistes">Spécialistes Externes</option>
              <option value="evenements">Événements</option>
              <option value="reparations">Réparations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Demandes de Financement</h3>
          <p className="text-gray-600 mt-1">
            {filteredRequests.length} demande{filteredRequests.length !== 1 ? 's' : ''} trouvée{filteredRequests.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande trouvée</h3>
            <p className="text-gray-600">Aucune demande de financement ne correspond à vos critères de recherche.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getCategoryIcon(request.category)}
                      <h4 className="text-lg font-semibold text-gray-900">{request.title}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                        {request.priority === 'urgent' ? 'Urgent' : 
                         request.priority === 'high' ? 'Élevée' :
                         request.priority === 'medium' ? 'Moyenne' : 'Faible'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{request.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{request.teacherName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{request.requestedDate.toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">{request.amount.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {getStatusName(request.status)}
                    </span>
                    
                    <div className="flex gap-1">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      {isAdmin && request.status === 'pending' && (
                        <>
                          <button className="p-2 text-green-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de création (à implémenter) */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Nouvelle Demande de Financement</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600">Formulaire de création à implémenter...</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="btn-outline"
              >
                Annuler
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="btn-primary"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 