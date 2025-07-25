import React, { useState } from 'react';
import { Plus, DollarSign, CreditCard, Check, X, User, Calendar, ShoppingCart, AlertCircle, TrendingUp, Receipt, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';

interface FinanceManagerProps {
  selectedGroupId?: string;
}

export default function FinanceManager({ selectedGroupId }: FinanceManagerProps) {
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'credit'>('all');
  const { user } = useAuth();
  const { groups, purchases, addPurchase, markPurchaseAsPaid, getStudentDebt, getStudentsByGroup, users, getActiveGroups } = useData();

  const teacherGroups = getActiveGroups(user?.id || '');
  
  // Filter purchases based on selected group and status
  const filteredPurchases = purchases
    .filter(purchase => purchase.teacherId === user?.id)
    .filter(purchase => {
      if (selectedGroupId) {
        return purchase.groupId === selectedGroupId;
      }
      return true;
    })
    .filter(purchase => {
      if (filterStatus !== 'all') {
        return purchase.status === filterStatus;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Get all students for debt calculation
  const allStudents = selectedGroupId 
    ? getStudentsByGroup(selectedGroupId)
    : teacherGroups.flatMap(group => getStudentsByGroup(group.id));

  const handleCreatePurchase = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const student = users.find(u => u.id === selectedStudent);
    const group = groups.find(g => g.id === selectedGroup);
    
    if (!student || !group) return;
    
    addPurchase({
      studentId: selectedStudent,
      studentName: `${student.firstName} ${student.lastName}`,
      groupId: selectedGroup,
      groupName: group.name,
      item: formData.get('item') as string,
      amount: parseFloat(formData.get('amount') as string),
      status: formData.get('status') as 'paid' | 'credit',
      teacherId: user?.id || ''
    });

    setShowPurchaseForm(false);
    setSelectedGroup('');
    setSelectedStudent('');
    e.currentTarget.reset();
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
    setSelectedStudent(''); // Reset student selection when group changes
  };

  const handleMarkAsPaid = (purchaseId: string) => {
    markPurchaseAsPaid(purchaseId);
  };

  const getGroupStudents = (groupId: string) => {
    return getStudentsByGroup(groupId);
  };

  const getStudentPicture = (studentId: string) => {
    const student = users.find(u => u.id === studentId);
    return student?.picture;
  };

  // Calculate statistics
  const totalSales = filteredPurchases
    .filter(p => p.status === 'paid')
    .reduce((total, purchase) => total + purchase.amount, 0);

  const totalCredit = filteredPurchases
    .filter(p => p.status === 'credit')
    .reduce((total, purchase) => total + purchase.amount, 0);

  const totalTransactions = filteredPurchases.length;

  const studentsWithDebt = allStudents
    .map(student => ({
      ...student,
      debt: getStudentDebt(student.id)
    }))
    .filter(student => student.debt.totalDebt > 0)
    .sort((a, b) => b.debt.totalDebt - a.debt.totalDebt);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {selectedGroupId ? `Finance - Groupe ${groups.find(g => g.id === selectedGroupId)?.name}` : 'Gestion Financière'}
        </h2>
        <button
          onClick={() => setShowPurchaseForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvel Achat
        </button>
      </div>

      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus du mois</p>
              <p className="text-2xl font-semibold text-gray-900">{totalSales.toFixed(2)} $ CAD</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="mt-2 text-sm text-green-600">
            +15% vs mois dernier
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paiements en attente</p>
              <p className="text-2xl font-semibold text-gray-900">{totalCredit.toFixed(2)} $ CAD</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <div className="mt-2 text-sm text-yellow-600">
            3 paiements en retard
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Élèves actifs</p>
              <p className="text-2xl font-semibold text-gray-900">{studentsWithDebt.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <User className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-2 text-sm text-blue-600">
            2 nouveaux ce mois-ci
          </div>
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de paiement</p>
              <p className="text-2xl font-semibold text-gray-900">95%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <CheckCircle className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-2 text-sm text-purple-600">
            +5% vs mois dernier
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Statut :</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'paid' | 'credit')}
            className="input w-40"
          >
            <option value="all">Tous</option>
            <option value="paid">Payés</option>
            <option value="credit">À crédit</option>
          </select>
        </div>
      </div>

      {/* Formulaire de nouvel achat */}
      {showPurchaseForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Enregistrer un Nouvel Achat</h3>
          <form onSubmit={handleCreatePurchase} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="groupSelect" className="block text-sm font-medium text-gray-700 mb-2">
                  Groupe de l'Élève
                </label>
                <select
                  id="groupSelect"
                  value={selectedGroup}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Sélectionner un groupe</option>
                  {teacherGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      Groupe {group.name} ({getGroupStudents(group.id).length} élèves)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="studentSelect" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'Élève
                </label>
                <select
                  id="studentSelect"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="input"
                  disabled={!selectedGroup}
                  required
                >
                  <option value="">Sélectionner un élève</option>
                  {selectedGroup && getGroupStudents(selectedGroup).map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.instrument})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="item" className="block text-sm font-medium text-gray-700 mb-2">
                Article Acheté
              </label>
              <input
                type="text"
                id="item"
                name="item"
                className="input"
                placeholder="ex: Méthode de Piano, Cordes de Guitare, Partition, Colophane..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Montant ($ CAD)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  className="input"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de Paiement
                </label>
                <select
                  id="status"
                  name="status"
                  className="input"
                  required
                >
                  <option value="paid">Payé immédiatement</option>
                  <option value="credit">À crédit</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={!selectedGroup || !selectedStudent}>
                Enregistrer l'Achat
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPurchaseForm(false);
                  setSelectedGroup('');
                  setSelectedStudent('');
                }}
                className="btn-outline"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des élèves endettés */}
      {studentsWithDebt.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Élèves avec Dettes en Cours
          </h3>
          <div className="grid gap-4">
            {studentsWithDebt.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {student.picture ? (
                      <img
                        src={student.picture}
                        alt={`${student.firstName} ${student.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Groupe {groups.find(g => g.id === student.groupId)?.name} • {student.instrument}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600">
                    {student.debt.totalDebt.toFixed(2)} $ CAD
                  </p>
                  <p className="text-sm text-orange-600">
                    {student.debt.purchases.filter(p => p.status === 'credit').length} achat{student.debt.purchases.filter(p => p.status === 'credit').length > 1 ? 's' : ''} en attente
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des achats */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des Achats</h3>
        
        {filteredPurchases.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {filterStatus !== 'all' 
                ? `Aucun achat ${filterStatus === 'paid' ? 'payé' : 'à crédit'} pour le moment`
                : 'Aucun achat enregistré pour le moment'
              }
            </p>
            <button
              onClick={() => setShowPurchaseForm(true)}
              className="btn-primary"
            >
              Enregistrer le Premier Achat
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Élève</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Groupe</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Article</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Montant</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {getStudentPicture(purchase.studentId) ? (
                            <img
                              src={getStudentPicture(purchase.studentId)}
                              alt={purchase.studentName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900">{purchase.studentName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">Groupe {purchase.groupName}</td>
                    <td className="py-3 px-4 text-gray-900">{purchase.item}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{purchase.amount.toFixed(2)} $ CAD</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${
                        purchase.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {purchase.status === 'paid' ? (
                          <>
                            <Check className="w-3 h-3" />
                            Payé
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-3 h-3" />
                            À crédit
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <div>
                        <div>{format(purchase.createdAt, 'dd/MM/yyyy')}</div>
                        {purchase.paidAt && (
                          <div className="text-xs text-green-600">
                            Payé le {format(purchase.paidAt, 'dd/MM/yyyy')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {purchase.status === 'credit' && (
                        <button
                          onClick={() => handleMarkAsPaid(purchase.id)}
                          className="btn-outline text-sm flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Marquer Payé
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}