import React, { useState } from 'react';
import { DollarSign, TrendingUp, PieChart, BarChart } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useData } from '../contexts/DataContext';

export default function BudgetOverviewV2() {
  console.log('BudgetOverviewV2 rendu !');
  const { settings } = useSettings();
  const { budgets } = useData();

  // Formatage devise
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-CA', {
      style: 'currency',
      currency: settings.currency
    });
  };

  // Années disponibles
  const budgetYears = React.useMemo(() => {
    const years = budgets.map(b => b.schoolYear);
    return Array.from(new Set(years)).sort((a, b) => b.localeCompare(a));
  }, [budgets]);

  // Année sélectionnée
  const [selectedYear, setSelectedYear] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const current = month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    if (budgets.some(b => b.schoolYear === current)) return current;
    return budgetYears[0] || current;
  });

  // Budget sélectionné
  const selectedBudget = budgets.find(b => b.schoolYear === selectedYear);

  // Poste sélectionné (enveloppe)
  const [selectedEnvelopeName, setSelectedEnvelopeName] = useState<string | null>(null);
  const selectedEnvelope = React.useMemo(() => {
    if (!selectedEnvelopeName) return null;
    return selectedBudget?.envelopes?.find(e => e.name === selectedEnvelopeName) || null;
  }, [selectedEnvelopeName, selectedBudget]);

  // Bloc 1 : Soldes des postes budgétaires
  const envelopes = selectedBudget?.envelopes || [];

  // Bloc 3 : Totaux globaux
  const totalBudget = selectedBudget?.totalBudget || 0;
  const totalExpenses = selectedBudget?.totalExpenses || 0;
  const totalRevenue = selectedBudget?.totalRevenue || 0;
  const soldeGlobal = totalRevenue - totalExpenses;

  // Affichage principal
  if (!selectedBudget) {
    return <div className="p-8 text-center text-gray-400">Aucun budget pour l'année sélectionnée.</div>;
  }

  return (
    <div className="space-y-6">
      {/* ENTÊTE */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion Budgétaire (V2)</h1>
          {selectedEnvelopeName && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Poste : {selectedEnvelopeName}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
          >
            {budgetYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {/* Boutons contextuels */}
          {selectedEnvelopeName && (
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Supprimer ce poste</button>
          )}
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Créer un nouveau budget</button>
        </div>
      </div>

      {/* GRILLE 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bloc 1 : Soldes des postes budgétaires */}
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Soldes des postes budgétaires</h3>
          <div className="space-y-2">
            {envelopes.length > 0 ? (
              envelopes.map((env: any) => (
                <div key={env.id} className="flex items-center justify-between border-b last:border-b-0 py-1">
                  <span className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => setSelectedEnvelopeName(env.name)}>{env.displayName || env.name}</span>
                  <span className="text-sm text-gray-600">{formatCurrency(env.budgetRemaining)}</span>
                </div>
              ))
            ) : (
              <span className="text-gray-400 text-sm">Aucun poste défini</span>
            )}
          </div>
        </div>

        {/* Bloc 2 : Actions rapides */}
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="flex flex-row gap-4">
            <button className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <DollarSign className="w-4 h-4" />
              Dépenses
            </button>
            <button className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
              <TrendingUp className="w-4 h-4" />
              Revenus
            </button>
            <button className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
              <PieChart className="w-4 h-4" />
              Contact
            </button>
          </div>
        </div>

        {/* Bloc 3 : État global du compte */}
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">État global du compte</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Budget de départ</span>
              <span className="text-sm text-gray-600">{formatCurrency(totalBudget)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Dépenses totales</span>
              <span className="text-sm text-gray-600">{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Solde global</span>
              <span className="text-sm text-gray-600">{formatCurrency(soldeGlobal)}</span>
            </div>
          </div>
        </div>

        {/* Bloc 4 : Tendances */}
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendances</h3>
          <div className="flex flex-col items-center justify-center h-full">
            <BarChart className="w-12 h-12 text-blue-400 mb-2" />
            <span className="text-gray-400 text-sm">Graphique à venir…</span>
          </div>
        </div>
      </div>
    </div>
  );
} 