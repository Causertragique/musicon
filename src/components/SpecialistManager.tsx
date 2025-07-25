import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ExternalSpecialist, SpecialistSession, SpecialistAllocation } from '../types';

interface SpecialistManagerProps {
  schoolYear: string;
  userRole: string;
}

const SpecialistManager: React.FC<SpecialistManagerProps> = ({ schoolYear, userRole }) => {
  const [specialists, setSpecialists] = useState<ExternalSpecialist[]>([]);
  const [sessions, setSessions] = useState<SpecialistSession[]>([]);
  const [allocations, setAllocations] = useState<SpecialistAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterInstrument, setFilterInstrument] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState<ExternalSpecialist | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    instrument: 'flute' as 'flute' | 'clarinette' | 'saxophone' | 'trompette' | 'trombone' | 'tuba' | 'cor' | 'euphonium' | 'percussion' | 'basse-electrique',
    hourlyRate: 0,
    studentTypes: [] as ('regular' | 'profile')[],
    totalHoursAllocated: 0,
    isActive: true,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [schoolYear]);

  const loadData = async () => {
    try {
      const [specialistsRef, sessionsRef, allocationsRef] = [
        collection(db, 'specialists'),
        collection(db, 'specialistSessions'),
        collection(db, 'specialistAllocations')
      ];

      const [specialistsSnapshot, sessionsSnapshot, allocationsSnapshot] = await Promise.all([
        getDocs(query(specialistsRef, orderBy('name'))),
        getDocs(query(sessionsRef, where('schoolYear', '==', schoolYear), orderBy('date', 'desc'))),
        getDocs(query(allocationsRef, where('year', '==', parseInt(schoolYear.split('-')[0])), orderBy('specialistName')))
      ]);

      const specialistsData = specialistsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ExternalSpecialist[];

      const sessionsData = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SpecialistSession[];

      const allocationsData = allocationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SpecialistAllocation[];

      setSpecialists(specialistsData);
      setSessions(sessionsData);
      setAllocations(allocationsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const specialistData = {
        ...formData,
        displayName: getInstrumentDisplayName(formData.instrument),
        totalHoursUsed: 0,
        totalHoursRemaining: formData.totalHoursAllocated,
        totalCost: formData.totalHoursAllocated * formData.hourlyRate,
        costUsed: 0,
        costRemaining: formData.totalHoursAllocated * formData.hourlyRate,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (editingSpecialist) {
        await updateDoc(doc(db, 'specialists', editingSpecialist.id), {
          ...specialistData,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'specialists'), specialistData);
      }

      setShowAddForm(false);
      setEditingSpecialist(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (specialistId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce spécialiste ?')) {
      try {
        await deleteDoc(doc(db, 'specialists', specialistId));
        loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      instrument: 'flute',
      hourlyRate: 0,
      studentTypes: [],
      totalHoursAllocated: 0,
      isActive: true,
      notes: ''
    });
  };

  const getInstrumentDisplayName = (instrument: string) => {
    const names = {
      flute: 'Flûte traversière',
      clarinette: 'Clarinette',
      saxophone: 'Saxophone',
      trompette: 'Trompette',
      trombone: 'Trombone',
      tuba: 'Tuba',
      cor: 'Cor',
      euphonium: 'Euphonium',
      percussion: 'Percussion',
      'basse-electrique': 'Basse électrique'
    };
    return names[instrument as keyof typeof names] || instrument;
  };

  const filteredSpecialists = specialists.filter(specialist => {
    if (filterInstrument !== 'all' && specialist.instrument !== filterInstrument) return false;
    if (filterStatus !== 'all') {
      if (filterStatus === 'active' && !specialist.isActive) return false;
      if (filterStatus === 'inactive' && specialist.isActive) return false;
    }
    return true;
  });

  const filteredSessions = sessions.filter(session => {
    if (filterInstrument !== 'all' && session.instrument !== filterInstrument) return false;
    if (filterStatus !== 'all' && session.status !== filterStatus) return false;
    if (filterMonth !== 'all') {
      const sessionMonth = new Date(session.date).getMonth();
      const filterMonthNum = parseInt(filterMonth);
      if (sessionMonth !== filterMonthNum) return false;
    }
    return true;
  });

  const totalHoursAllocated = filteredSpecialists.reduce((sum, s) => sum + s.totalHoursAllocated, 0);
  const totalHoursUsed = filteredSpecialists.reduce((sum, s) => sum + s.totalHoursUsed, 0);
  const totalCostAllocated = filteredSpecialists.reduce((sum, s) => sum + s.totalCost, 0);
  const totalCostUsed = filteredSpecialists.reduce((sum, s) => sum + s.costUsed, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'scheduled': return 'text-blue-600 bg-blue-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const exportToCSV = () => {
    const headers = ['Nom', 'Instrument', 'Taux horaire', 'Heures allouées', 'Heures utilisées', 'Heures restantes', 'Coût alloué', 'Coût utilisé', 'Coût restant', 'Statut'];
    const csvContent = [
      headers.join(','),
      ...filteredSpecialists.map(specialist => [
        `"${specialist.name}"`,
        getInstrumentDisplayName(specialist.instrument),
        specialist.hourlyRate.toFixed(2),
        specialist.totalHoursAllocated,
        specialist.totalHoursUsed,
        specialist.totalHoursRemaining,
        specialist.totalCost.toFixed(2),
        specialist.costUsed.toFixed(2),
        specialist.costRemaining.toFixed(2),
        specialist.isActive ? 'Actif' : 'Inactif'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `specialistes_${schoolYear}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des spécialistes...</div>;
  }

  // Menu latéral
  const sidebar = (
    <aside className="w-64 bg-gray-100 h-full p-4 border-r flex flex-col space-y-4">
      <div>
        <label className="block text-xs font-semibold mb-1">Instrument</label>
        <select value={filterInstrument} onChange={e => setFilterInstrument(e.target.value)} className="w-full border px-2 py-1 rounded text-xs">
          <option value="all">Tous</option>
          <option value="flute">Flûte traversière</option>
          <option value="clarinette">Clarinette</option>
          <option value="saxophone">Saxophone</option>
          <option value="trompette">Trompette</option>
          <option value="trombone">Trombone</option>
          <option value="tuba">Tuba</option>
          <option value="cor">Cor</option>
          <option value="euphonium">Euphonium</option>
          <option value="percussion">Percussion</option>
          <option value="basse-electrique">Basse électrique</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Statut</label>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full border px-2 py-1 rounded text-xs">
          <option value="all">Tous</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
          <option value="scheduled">Programmées</option>
          <option value="completed">Terminées</option>
          <option value="cancelled">Annulées</option>
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
          <div>Heures allouées: <span className="font-semibold text-blue-600">{totalHoursAllocated}</span></div>
          <div>Heures utilisées: <span className="font-semibold text-green-600">{totalHoursUsed}</span></div>
          <div>Coût alloué: <span className="font-semibold text-blue-600">${totalCostAllocated.toFixed(2)}</span></div>
          <div>Coût utilisé: <span className="font-semibold text-green-600">${totalCostUsed.toFixed(2)}</span></div>
        </div>
      </div>
      {userRole === 'admin' && (
        <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-3 py-2 rounded text-xs mt-4">
          Ajouter un spécialiste
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
              <th className="border px-2 py-1">Nom</th>
              <th className="border px-2 py-1">Instrument</th>
              <th className="border px-2 py-1">Taux horaire</th>
              <th className="border px-2 py-1">Heures allouées</th>
              <th className="border px-2 py-1">Heures utilisées</th>
              <th className="border px-2 py-1">Heures restantes</th>
              <th className="border px-2 py-1">Coût alloué</th>
              <th className="border px-2 py-1">Coût utilisé</th>
              <th className="border px-2 py-1">Coût restant</th>
              <th className="border px-2 py-1">Statut</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSpecialists.map((specialist) => (
              <tr key={specialist.id} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{specialist.name}</td>
                <td className="border px-2 py-1">{getInstrumentDisplayName(specialist.instrument)}</td>
                <td className="border px-2 py-1 text-right">${specialist.hourlyRate.toFixed(2)}</td>
                <td className="border px-2 py-1 text-right">{specialist.totalHoursAllocated}</td>
                <td className="border px-2 py-1 text-right text-green-600">{specialist.totalHoursUsed}</td>
                <td className="border px-2 py-1 text-right">{specialist.totalHoursRemaining}</td>
                <td className="border px-2 py-1 text-right">${specialist.totalCost.toFixed(2)}</td>
                <td className="border px-2 py-1 text-right text-green-600">${specialist.costUsed.toFixed(2)}</td>
                <td className="border px-2 py-1 text-right">${specialist.costRemaining.toFixed(2)}</td>
                <td className="border px-2 py-1">
                  <span className={`px-2 py-1 rounded text-xs ${specialist.isActive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {specialist.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="border px-2 py-1">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setEditingSpecialist(specialist)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Modifier
                    </button>
                    {userRole === 'admin' && (
                      <button
                        onClick={() => handleDelete(specialist.id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredSpecialists.length === 0 && (
              <tr><td colSpan={11} className="text-center text-gray-400 py-4">Aucun spécialiste</td></tr>
            )}
          </tbody>
        </table>

        {/* Formulaire d'ajout/édition */}
        {(showAddForm || editingSpecialist) && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-96">
              <h3 className="text-lg font-semibold mb-4">
                {editingSpecialist ? 'Modifier le Spécialiste' : 'Ajouter un Spécialiste'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Nom</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border px-2 py-1 rounded" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Instrument</label>
                  <select value={formData.instrument} onChange={e => setFormData({...formData, instrument: e.target.value as any})} className="w-full border px-2 py-1 rounded" required>
                    <option value="flute">Flûte traversière</option>
                    <option value="clarinette">Clarinette</option>
                    <option value="saxophone">Saxophone</option>
                    <option value="trompette">Trompette</option>
                    <option value="trombone">Trombone</option>
                    <option value="tuba">Tuba</option>
                    <option value="cor">Cor</option>
                    <option value="euphonium">Euphonium</option>
                    <option value="percussion">Percussion</option>
                    <option value="basse-electrique">Basse électrique</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Taux horaire ($)</label>
                  <input type="number" step="0.01" value={formData.hourlyRate} onChange={e => setFormData({...formData, hourlyRate: parseFloat(e.target.value)})} className="w-full border px-2 py-1 rounded" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Heures allouées</label>
                  <input type="number" value={formData.totalHoursAllocated} onChange={e => setFormData({...formData, totalHoursAllocated: parseInt(e.target.value)})} className="w-full border px-2 py-1 rounded" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Types d'élèves</label>
                  <div className="space-y-1">
                    <label className="flex items-center">
                      <input type="checkbox" checked={formData.studentTypes.includes('regular')} onChange={e => {
                        const types = e.target.checked 
                          ? [...formData.studentTypes, 'regular' as const]
                          : formData.studentTypes.filter(t => t !== 'regular');
                        setFormData({...formData, studentTypes: types});
                      }} className="mr-2" />
                      <span className="text-xs">Régulier</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked={formData.studentTypes.includes('profile')} onChange={e => {
                        const types = e.target.checked 
                          ? [...formData.studentTypes, 'profile' as const]
                          : formData.studentTypes.filter(t => t !== 'profile');
                        setFormData({...formData, studentTypes: types});
                      }} className="mr-2" />
                      <span className="text-xs">Profil</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Statut</label>
                  <select value={formData.isActive ? 'active' : 'inactive'} onChange={e => setFormData({...formData, isActive: e.target.value === 'active'})} className="w-full border px-2 py-1 rounded" required>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Notes</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border px-2 py-1 rounded" rows={2} />
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button type="button" onClick={() => { setShowAddForm(false); setEditingSpecialist(null); resetForm(); }} className="px-3 py-1 border rounded">Annuler</button>
                  <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">{editingSpecialist ? 'Modifier' : 'Ajouter'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SpecialistManager; 