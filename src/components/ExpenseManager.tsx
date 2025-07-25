import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Expense, ExpenseCategory, ExpenseType } from '../types';

interface ExpenseManagerProps {
  schoolYear: string;
  userRole: string;
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({ schoolYear, userRole }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    category: 'supplies' as ExpenseCategory,
    type: 'anches' as ExpenseType,
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    invoiceNumber: '',
    notes: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected'
  });

  useEffect(() => {
    loadExpenses();
  }, [schoolYear]);

  const loadExpenses = async () => {
    try {
      const expensesRef = collection(db, 'expenses');
      const q = query(
        expensesRef,
        where('schoolYear', '==', schoolYear),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const expensesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];
      setExpenses(expensesData);
    } catch (error) {
      console.error('Erreur lors du chargement des dépenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const expenseData = {
        ...formData,
        schoolYear,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (editingExpense) {
        await updateDoc(doc(db, 'expenses', editingExpense.id), {
          ...expenseData,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'expenses'), expenseData);
      }

      setShowAddForm(false);
      setEditingExpense(null);
      resetForm();
      loadExpenses();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (expenseId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      try {
        await deleteDoc(doc(db, 'expenses', expenseId));
        loadExpenses();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      category: 'supplies',
      type: 'anches',
      date: new Date().toISOString().split('T')[0],
      supplier: '',
      invoiceNumber: '',
      notes: '',
      status: 'pending'
    });
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filterCategory !== 'all' && expense.category !== filterCategory) return false;
    if (filterType !== 'all' && expense.type !== filterType) return false;
    if (filterStatus !== 'all' && expense.status !== filterStatus) return false;
    if (filterMonth !== 'all') {
      const expenseMonth = new Date(expense.date).getMonth();
      const filterMonthNum = parseInt(filterMonth);
      if (expenseMonth !== filterMonthNum) return false;
    }
    return true;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = filteredExpenses.filter(e => e.status === 'pending');
  const approvedExpenses = filteredExpenses.filter(e => e.status === 'approved');

  const getCategoryLabel = (category: ExpenseCategory) => {
    const labels = {
      supplies: 'Fournitures',
      specialists: 'Spécialistes',
      events: 'Événements',
      repairs: 'Réparations',
      formation: 'Formation'
    };
    return labels[category];
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      // Fournitures
      anches: 'Anches',
      embouchures: 'Embouchures',
      partitions: 'Partitions',
      accessoires: 'Accessoires',
      // Spécialistes
      flute: 'Flûte',
      clarinette: 'Clarinette',
      saxophone: 'Saxophone',
      trompette: 'Trompette',
      trombone: 'Trombone',
      tuba: 'Tuba',
      percussion: 'Percussion',
      // Événements
      concert: 'Concert',
      camp: 'Camp',
      concours: 'Concours',
      festival: 'Festival',
      // Réparations
      instruments: 'Instruments',
      equipement: 'Équipement',
      urgent: 'Urgent',
      // Formation
      conference: 'Conférence',
      atelier: 'Atelier',
      masterclass: 'Masterclass'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeOptions = (category: ExpenseCategory): ExpenseType[] => {
    switch (category) {
      case 'supplies':
        return ['anches', 'embouchures', 'partitions', 'accessoires'];
      case 'specialists':
        return ['flute', 'clarinette', 'saxophone', 'trompette', 'trombone', 'tuba', 'percussion'];
      case 'events':
        return ['concert', 'camp', 'concours', 'festival'];
      case 'repairs':
        return ['instruments', 'equipement', 'urgent'];
      case 'formation':
        return ['conference', 'atelier', 'masterclass'];
      default:
        return [];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Catégorie', 'Type', 'Fournisseur', 'N° Facture', 'Montant', 'Statut', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredExpenses.map(expense => [
        new Date(expense.date).toLocaleDateString('fr-CA'),
        `"${expense.description}"`,
        getCategoryLabel(expense.category),
        getTypeLabel(expense.type),
        `"${expense.supplier || ''}"`,
        `"${expense.invoiceNumber || ''}"`,
        expense.amount.toFixed(2),
        expense.status,
        `"${expense.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `depenses_${schoolYear}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des dépenses...</div>;
  }

  // Menu latéral
  const sidebar = (
    <aside className="w-64 bg-gray-100 h-full p-4 border-r flex flex-col space-y-4">
      <div>
        <label className="block text-xs font-semibold mb-1">Catégorie</label>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full border px-2 py-1 rounded text-xs">
          <option value="all">Toutes</option>
          <option value="supplies">Fournitures</option>
          <option value="specialists">Spécialistes</option>
          <option value="events">Événements</option>
          <option value="repairs">Réparations</option>
          <option value="formation">Formation</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Type</label>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full border px-2 py-1 rounded text-xs">
          <option value="all">Tous</option>
          <option value="supplies">Fournitures</option>
          <option value="specialists">Spécialistes</option>
          <option value="events">Événements</option>
          <option value="repairs">Réparations</option>
          <option value="formation">Formation</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Statut</label>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full border px-2 py-1 rounded text-xs">
          <option value="all">Tous</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvées</option>
          <option value="rejected">Rejetées</option>
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
          <div>Total: <span className="font-semibold text-red-600">${totalExpenses.toFixed(2)}</span></div>
          <div>En attente: <span className="font-semibold text-yellow-600">{pendingExpenses.length}</span></div>
          <div>Approuvées: <span className="font-semibold text-green-600">{approvedExpenses.length}</span></div>
        </div>
      </div>
      {userRole === 'admin' && (
        <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-3 py-2 rounded text-xs mt-4">
          Ajouter une dépense
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
              <th className="border px-2 py-1">Description</th>
              <th className="border px-2 py-1">Catégorie</th>
              <th className="border px-2 py-1">Type</th>
              <th className="border px-2 py-1">Fournisseur</th>
              <th className="border px-2 py-1">N° Facture</th>
              <th className="border px-2 py-1">Montant</th>
              <th className="border px-2 py-1">Statut</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{new Date(expense.date).toLocaleDateString('fr-CA')}</td>
                <td className="border px-2 py-1">{expense.description}</td>
                <td className="border px-2 py-1">{getCategoryLabel(expense.category)}</td>
                <td className="border px-2 py-1">{getTypeLabel(expense.type)}</td>
                <td className="border px-2 py-1">{expense.supplier || '-'}</td>
                <td className="border px-2 py-1">{expense.invoiceNumber || '-'}</td>
                <td className="border px-2 py-1 text-right font-semibold text-red-600">${expense.amount.toFixed(2)}</td>
                <td className="border px-2 py-1">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(expense.status)}`}>
                    {expense.status === 'approved' ? 'Approuvée' : 
                     expense.status === 'pending' ? 'En attente' : 'Rejetée'}
                  </span>
                </td>
                <td className="border px-2 py-1">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Modifier
                    </button>
                    {userRole === 'admin' && (
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredExpenses.length === 0 && (
              <tr><td colSpan={9} className="text-center text-gray-400 py-4">Aucune dépense</td></tr>
            )}
          </tbody>
        </table>

        {/* Formulaire d'ajout/édition */}
        {(showAddForm || editingExpense) && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-96">
              <h3 className="text-lg font-semibold mb-4">
                {editingExpense ? 'Modifier la Dépense' : 'Ajouter une Dépense'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Description</label>
                  <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border px-2 py-1 rounded" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Montant ($)</label>
                  <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full border px-2 py-1 rounded" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Catégorie</label>
                  <select value={formData.category} onChange={e => {
                    const newCategory = e.target.value as ExpenseCategory;
                    setFormData({
                      ...formData, 
                      category: newCategory,
                      type: getTypeOptions(newCategory)[0] || 'anches'
                    });
                  }} className="w-full border px-2 py-1 rounded" required>
                    <option value="supplies">Fournitures</option>
                    <option value="specialists">Spécialistes</option>
                    <option value="events">Événements</option>
                    <option value="repairs">Réparations</option>
                    <option value="formation">Formation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ExpenseType})} className="w-full border px-2 py-1 rounded" required>
                    {getTypeOptions(formData.category).map(type => (
                      <option key={type} value={type}>{getTypeLabel(type)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Date</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border px-2 py-1 rounded" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Fournisseur</label>
                  <input type="text" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full border px-2 py-1 rounded" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">N° Facture</label>
                  <input type="text" value={formData.invoiceNumber} onChange={e => setFormData({...formData, invoiceNumber: e.target.value})} className="w-full border px-2 py-1 rounded" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Statut</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full border px-2 py-1 rounded" required>
                    <option value="pending">En attente</option>
                    <option value="approved">Approuvée</option>
                    <option value="rejected">Rejetée</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Notes</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border px-2 py-1 rounded" rows={2} />
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button type="button" onClick={() => { setShowAddForm(false); setEditingExpense(null); resetForm(); }} className="px-3 py-1 border rounded">Annuler</button>
                  <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">{editingExpense ? 'Modifier' : 'Ajouter'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExpenseManager; 