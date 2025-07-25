import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Invoice } from '../types';

interface InvoiceManagerProps {
  schoolYear: string;
  userRole: string;
}

const InvoiceManager: React.FC<InvoiceManagerProps> = ({ schoolYear, userRole }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVendor, setFilterVendor] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    vendor: '',
    invoiceNumber: '',
    amount: 0,
    invoiceDate: new Date().toISOString().split('T')[0],
    status: 'pending' as 'pending' | 'paid',
    url: '',
    description: ''
  });

  useEffect(() => {
    loadInvoices();
  }, [schoolYear]);

  const loadInvoices = async () => {
    try {
      const invoicesRef = collection(db, 'invoices');
      const q = query(invoicesRef, where('schoolYear', '==', schoolYear));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Invoice[];
      setInvoices(data);
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const invoiceData = {
        ...formData,
        schoolYear,
        uploadedAt: new Date(),
        uploadedBy: 'admin',
        uploadedByName: 'Admin'
      };
      await addDoc(collection(db, 'invoices'), invoiceData);
      setShowAddForm(false);
      resetForm();
      loadInvoices();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (invoiceId: string) => {
    if (window.confirm('Supprimer cette facture ?')) {
      try {
        await deleteDoc(doc(db, 'invoices', invoiceId));
        loadInvoices();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      vendor: '',
      invoiceNumber: '',
      amount: 0,
      invoiceDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      url: '',
      description: ''
    });
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filterStatus !== 'all' && invoice.status !== filterStatus) return false;
    if (filterVendor !== 'all' && invoice.vendor !== filterVendor) return false;
    if (filterYear !== 'all') {
      const year = new Date(invoice.invoiceDate || '').getFullYear().toString();
      if (year !== filterYear) return false;
    }
    return true;
  });

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  const pendingAmount = filteredInvoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + (i.amount || 0), 0);
  const paidAmount = filteredInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount || 0), 0);

  // Menu latéral
  const sidebar = (
    <aside className="w-64 bg-gray-100 h-full p-4 border-r flex flex-col space-y-6">
      <div>
        <label className="block text-xs font-semibold mb-1">Statut</label>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full border px-2 py-1 rounded">
          <option value="all">Tous</option>
          <option value="pending">En attente</option>
          <option value="paid">Payée</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Fournisseur</label>
        <select value={filterVendor} onChange={e => setFilterVendor(e.target.value)} className="w-full border px-2 py-1 rounded">
          <option value="all">Tous</option>
          {Array.from(new Set(invoices.map(i => i.vendor))).map((vendor, idx) => (
            <option key={idx} value={vendor}>{vendor}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1">Année</label>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="w-full border px-2 py-1 rounded">
          <option value="all">Toutes</option>
          {Array.from(new Set(invoices.map(i => new Date(i.invoiceDate || '').getFullYear().toString()))).map((year, idx) => (
            <option key={idx} value={year}>{year}</option>
          ))}
        </select>
      </div>
      {userRole === 'admin' && (
        <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-3 py-2 rounded mt-4">Ajouter une facture</button>
      )}
    </aside>
  );

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des factures...</div>;
  }

  return (
    <div className="flex h-full min-h-[600px]">
      {sidebar}
      <main className="flex-1 p-6 overflow-x-auto">
        <table className="min-w-full border text-xs">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Fournisseur</th>
              <th className="border px-2 py-1">N° Facture</th>
              <th className="border px-2 py-1">Montant</th>
              <th className="border px-2 py-1">Statut</th>
              <th className="border px-2 py-1">Justificatif</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('fr-CA') : ''}</td>
                <td className="border px-2 py-1">{invoice.vendor}</td>
                <td className="border px-2 py-1">{invoice.invoiceNumber}</td>
                <td className="border px-2 py-1 text-right">{invoice.amount ? invoice.amount.toFixed(2) : ''}</td>
                <td className="border px-2 py-1">{invoice.status}</td>
                <td className="border px-2 py-1">
                  {invoice.url && (
                    <a href={invoice.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-700">Voir</a>
                  )}
                </td>
                <td className="border px-2 py-1">
                  {userRole === 'admin' && (
                    <button onClick={() => handleDelete(invoice.id)} className="text-red-600 hover:underline">Supprimer</button>
                  )}
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
              <tr><td colSpan={7} className="text-center text-gray-400 py-4">Aucune facture</td></tr>
            )}
          </tbody>
        </table>
        {/* Formulaire d'ajout (drawer simple) */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-96">
              <h3 className="text-lg font-semibold mb-4">Ajouter une facture</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Fournisseur</label>
                  <input type="text" value={formData.vendor} onChange={e => setFormData({ ...formData, vendor: e.target.value })} className="w-full border px-2 py-1 rounded" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">N° Facture</label>
                  <input type="text" value={formData.invoiceNumber} onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })} className="w-full border px-2 py-1 rounded" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Montant</label>
                  <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} className="w-full border px-2 py-1 rounded" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Date</label>
                  <input type="date" value={formData.invoiceDate} onChange={e => setFormData({ ...formData, invoiceDate: e.target.value })} className="w-full border px-2 py-1 rounded" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Statut</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full border px-2 py-1 rounded">
                    <option value="pending">En attente</option>
                    <option value="paid">Payée</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">URL du justificatif</label>
                  <input type="url" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full border px-2 py-1 rounded" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border px-2 py-1 rounded" rows={2} />
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button type="button" onClick={() => { setShowAddForm(false); resetForm(); }} className="px-3 py-1 border rounded">Annuler</button>
                  <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Ajouter</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InvoiceManager; 