import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { RevenueSource, Subvention, TicketSale, Don, StudentSales } from '../types';

interface RevenueManagerProps {
  schoolYear: string;
  userRole: string;
}

const RevenueManager: React.FC<RevenueManagerProps> = ({ schoolYear, userRole }) => {
  const [revenues, setRevenues] = useState<RevenueSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<RevenueSource | null>(null);

  const [formData, setFormData] = useState({
    type: 'subvention' as 'subvention' | 'vente_billet' | 'don' | 'vente_eleves' | 'autre',
    category: '',
    name: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'pending' as 'pending' | 'received' | 'cancelled',
    sourceName: '',
    sourceContactInfo: '',
    sourceType: 'government' as 'government' | 'foundation' | 'private' | 'individual' | 'corporate' | 'students',
    notes: ''
  });

  useEffect(() => {
    loadRevenues();
  }, [schoolYear]);

  const loadRevenues = async () => {
    try {
      const revenuesRef = collection(db, 'revenues');
      const q = query(
        revenuesRef,
        where('schoolYear', '==', schoolYear),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const revenuesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RevenueSource[];
      setRevenues(revenuesData);
    } catch (error) {
      console.error('Erreur lors du chargement des revenus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const revenueData = {
        ...formData,
        schoolYear,
        source: {
          name: formData.sourceName,
          contactInfo: formData.sourceContactInfo,
          type: formData.sourceType
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (editingRevenue) {
        await updateDoc(doc(db, 'revenues', editingRevenue.id), {
          ...revenueData,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'revenues'), revenueData);
      }

      setShowAddForm(false);
      setEditingRevenue(null);
      resetForm();
      loadRevenues();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (revenueId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce revenu ?')) {
      try {
        await deleteDoc(doc(db, 'revenues', revenueId));
        loadRevenues();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'subvention',
      category: '',
      name: '',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      sourceName: '',
      sourceContactInfo: '',
      sourceType: 'government',
      notes: ''
    });
  };

  const filteredRevenues = revenues.filter(revenue => {
    if (filterType !== 'all' && revenue.type !== filterType) return false;
    if (filterStatus !== 'all' && revenue.status !== filterStatus) return false;
    if (filterMonth !== 'all') {
      const revenueMonth = new Date(revenue.date).getMonth();
      const filterMonthNum = parseInt(filterMonth);
      if (revenueMonth !== filterMonthNum) return false;
    }
    return true;
  });

  const totalRevenues = filteredRevenues.reduce((sum, revenue) => sum + revenue.amount, 0);
  const pendingRevenues = filteredRevenues.filter(r => r.status === 'pending');
  const receivedRevenues = filteredRevenues.filter(r => r.status === 'received');

  const getTypeLabel = (type: string) => {
    const labels = {
      subvention: 'Subvention',
      vente_billet: 'Vente de billets',
      don: 'Don',
      vente_eleves: 'Vente aux élèves',
      autre: 'Autre'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Nom', 'Description', 'Source', 'Montant', 'Statut', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredRevenues.map(revenue => [
        new Date(revenue.date).toLocaleDateString('fr-CA'),
        getTypeLabel(revenue.type),
        `"${revenue.name}"`,
        `"${revenue.description}"`,
        `"${revenue.source?.name || ''}"`,
        revenue.amount.toFixed(2),
        revenue.status,
        `"${revenue.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `revenus_${schoolYear}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des revenus...</div>;
  }

  // Menu latéral
  const sidebar = (
    <aside className="w-64 bg-gray-100 h-full p-4 border-r flex flex-col space-y-4">
      <div>
        <label className="block text-xs font-semibold mb-1">Type</label>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full border px-2 py-1 rounded text-xs">
          <option value="all">Tous</option>
          <option value="subvention">Subventions</option>
          <option value="vente_billet">Ventes de billets</option>
          <option value="don">Dons</option>
          <option value="vente_eleves">Ventes aux élèves</option>
          <option value="autre">Autres</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Statut</label>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full border px-2 py-1 rounded text-xs">
          <option value="all">Tous</option>
          <option value="pending">En attente</option>
          <option value="received">Reçus</option>
          <option value="cancelled">Annulés</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Mois</label>
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-full border px-2 py-1 rounded text-xs">
          <option value="all">Tous</option>
          <option value="0">Janvier</option>
          <option value="1">Février</option>
          <option value="2">Mars</option>
          <option value="3">Avril</option>
          <option value="4">Mai</option>
          <option value="5">Juin</option>
          <option value="6">Juillet</option>
          <option value="7">Août</option>
          <option value="8">Septembre</option>
          <option value="9">Octobre</option>
          <option value="10">Novembre</option>
          <option value="11">Décembre</option>
        </select>
      </div>
      <div className="pt-4 border-t">
        <div className="text-xs font-semibold mb-2">Résumé</div>
        <div className="text-xs space-y-1">
          <div>Total: <span className="font-semibold text-green-600">${totalRevenues.toFixed(2)}</span></div>
          <div>En attente: <span className="font-semibold text-yellow-600">{pendingRevenues.length}</span></div>
          <div>Reçus: <span className="font-semibold text-green-600">{receivedRevenues.length}</span></div>
        </div>
      </div>
      {userRole === 'admin' && (
        <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-3 py-2 rounded text-xs mt-4">
          Ajouter un revenu
        </button>
      )}
      <button onClick={exportToCSV} className="bg-green-600 text-white px-3 py-2 rounded text-xs">
        Exporter CSV
      </button>
    </aside>
  );

  return (
    <div className="flex h-full min-h-[600px]">
      {sidebar}
      <main className="flex-1 p-6 overflow-x-auto">
        <table className="min-w-full border text-xs">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Type</th>
              <th className="border px-2 py-1">Nom</th>
              <th className="border px-2 py-1">Description</th>
              <th className="border px-2 py-1">Source</th>
              <th className="border px-2 py-1">Montant</th>
              <th className="border px-2 py-1">Statut</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRevenues.map((revenue) => (
              <tr key={revenue.id} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{new Date(revenue.date).toLocaleDateString('fr-CA')}</td>
                <td className="border px-2 py-1">{getTypeLabel(revenue.type)}</td>
                <td className="border px-2 py-1">{revenue.name}</td>
                <td className="border px-2 py-1">{revenue.description}</td>
                <td className="border px-2 py-1">{revenue.source?.name || '-'}</td>
                <td className="border px-2 py-1 text-right font-semibold text-green-600">${revenue.amount.toFixed(2)}</td>
                <td className="border px-2 py-1">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(revenue.status)}`}>
                    {revenue.status === 'received' ? 'Reçu' : 
                     revenue.status === 'pending' ? 'En attente' : 'Annulé'}
                  </span>
                </td>
                <td className="border px-2 py-1">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setEditingRevenue(revenue)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Modifier
                    </button>
                    {userRole === 'admin' && (
                      <button
                        onClick={() => handleDelete(revenue.id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredRevenues.length === 0 && (
              <tr><td colSpan={8} className="text-center text-gray-400 py-4">Aucun revenu</td></tr>
            )}
          </tbody>
        </table>

        {/* Formulaire d'ajout/édition */}
        {(showAddForm || editingRevenue) && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-96">
              <h3 className="text-lg font-semibold mb-4">
                {editingRevenue ? 'Modifier le Revenu' : 'Ajouter un Revenu'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full border px-2 py-1 rounded" required>
                    <option value="subvention">Subvention</option>
                    <option value="vente_billet">Vente de billets</option>
                    <option value="don">Don</option>
                    <option value="vente_eleves">Vente aux élèves</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Nom</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border px-2 py-1 rounded" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Description</label>
                  <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border px-2 py-1 rounded" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Montant ($)</label>
                  <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full border px-2 py-1 rounded" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Date</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border px-2 py-1 rounded" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Statut</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full border px-2 py-1 rounded" required>
                    <option value="pending">En attente</option>
                    <option value="received">Reçu</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Source</label>
                  <input type="text" value={formData.sourceName} onChange={e => setFormData({...formData, sourceName: e.target.value})} className="w-full border px-2 py-1 rounded" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Type de source</label>
                  <select value={formData.sourceType} onChange={e => setFormData({...formData, sourceType: e.target.value as any})} className="w-full border px-2 py-1 rounded">
                    <option value="government">Gouvernement</option>
                    <option value="foundation">Fondation</option>
                    <option value="private">Privé</option>
                    <option value="individual">Individuel</option>
                    <option value="corporate">Entreprise</option>
                    <option value="students">Élèves</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Notes</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border px-2 py-1 rounded" rows={2} />
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button type="button" onClick={() => { setShowAddForm(false); setEditingRevenue(null); resetForm(); }} className="px-3 py-1 border rounded">Annuler</button>
                  <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">{editingRevenue ? 'Modifier' : 'Ajouter'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RevenueManager; 