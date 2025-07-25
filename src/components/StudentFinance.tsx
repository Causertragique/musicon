import React from 'react';
import { DollarSign, CreditCard, Check, Calendar, ShoppingCart, AlertCircle, Receipt } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';

export default function StudentFinance() {
  const { user } = useAuth();
  const { getStudentDebt } = useData();

  if (!user) return null;

  const studentDebt = getStudentDebt(user.id);
  const paidPurchases = studentDebt.purchases.filter(p => p.status === 'paid');
  const creditPurchases = studentDebt.purchases.filter(p => p.status === 'credit');

  const totalSpent = studentDebt.purchases.reduce((total, purchase) => total + purchase.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mes Finances</h2>
      </div>

      {/* Résumé financier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">Dette Actuelle</p>
              <p className="text-2xl font-bold text-red-900">{studentDebt.totalDebt.toFixed(2)} $ CAD</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Total Payé</p>
              <p className="text-2xl font-bold text-green-900">
                {paidPurchases.reduce((total, p) => total + p.amount, 0).toFixed(2)} $ CAD
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Dépensé</p>
              <p className="text-2xl font-bold text-blue-900">{totalSpent.toFixed(2)} $ CAD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerte dette */}
      {studentDebt.totalDebt > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-medium text-red-800">Attention : Vous avez une dette en cours</h3>
              <p className="text-red-700 text-sm mt-1">
                Vous devez {studentDebt.totalDebt.toFixed(2)} $ CAD pour {creditPurchases.length} achat{creditPurchases.length > 1 ? 's' : ''}. 
                Pensez à régler votre dette lors du prochain cours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Achats en attente de paiement */}
      {creditPurchases.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-red-600" />
            Achats à Régler ({creditPurchases.length})
          </h3>
          <div className="space-y-3">
            {creditPurchases.map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{purchase.item}</p>
                  <p className="text-sm text-gray-600">
                    Acheté le {format(purchase.createdAt, 'dd MMMM yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{purchase.amount.toFixed(2)} $ CAD</p>
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium bg-red-100 text-red-800">
                    <CreditCard className="w-3 h-3" />
                    À régler
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              💡 <strong>Comment payer :</strong> Apportez l'argent lors de votre prochain cours ou contactez votre professeur pour organiser le paiement.
            </p>
          </div>
        </div>
      )}

      {/* Historique complet des achats */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique de Mes Achats</h3>
        
        {studentDebt.purchases.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun achat enregistré pour le moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Article</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Montant</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date d'Achat</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date de Paiement</th>
                </tr>
              </thead>
              <tbody>
                {studentDebt.purchases
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((purchase) => (
                  <tr key={purchase.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{purchase.item}</td>
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
                            À régler
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {format(purchase.createdAt, 'dd/MM/yyyy')}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {purchase.paidAt ? (
                        <span className="text-green-600">
                          {format(purchase.paidAt, 'dd/MM/yyyy')}
                        </span>
                      ) : (
                        <span className="text-red-600">Non payé</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Conseils financiers */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Conseils pour Gérer Vos Achats Musicaux
        </h3>
        <div className="space-y-2 text-blue-800 text-sm">
          <p>• Planifiez vos achats de matériel musical à l'avance</p>
          <p>• Demandez conseil à votre professeur avant d'acheter des partitions ou accessoires</p>
          <p>• Réglez vos dettes rapidement pour éviter l'accumulation</p>
          <p>• Prenez soin de votre matériel pour éviter les remplacements fréquents</p>
        </div>
      </div>
    </div>
  );
}