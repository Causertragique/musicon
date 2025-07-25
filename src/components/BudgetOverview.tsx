import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, BarChart, PieChart } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useData } from '../contexts/DataContext';
import BudgetSetupWizard from './BudgetSetupWizard';
import { useNavigate } from 'react-router-dom';
import BudgetDashboard from './BudgetDashboard';

interface BudgetData {
  totalBudget: number;
  totalExpenses: number;
  totalRevenue: number;
  balance: number;
  categories: {
    fournitures: { budget: number; spent: number };
    evenements: { budget: number; spent: number };
    reparations: { budget: number; spent: number };
    specialistes: { budget: number; spent: number };
  };
}

export default function BudgetOverview() {
  const { settings } = useSettings();
  const { budgets } = useData();
  const navigate = useNavigate();
  
  // Fonction pour formater les montants selon la devise configurée
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-CA', { 
      style: 'currency', 
      currency: settings.currency 
    });
  };

  const getCategoryProgress = (spent: number, budget: number) => {
    return Math.min((spent / budget) * 100, 100);
  };

  const getCategoryColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Récupérer tous les postes budgétaires utilisés dans tous les budgets (union sans doublon)
  const allEnvelopes = React.useMemo(() => {
    const map = new Map();
    budgets.forEach(budget => {
      budget.envelopes?.forEach(env => {
        // On déduplique par name (ou id si tu préfères)
        if (!map.has(env.name)) {
          map.set(env.name, { ...env, schoolYear: budget.schoolYear });
        }
      });
    });
    return Array.from(map.values());
  }, [budgets]);

  // Calculer l'année courante pour le wizard
  function getCurrentBudgetYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    if (month >= 6) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  }
  const currentBudgetYear = getCurrentBudgetYear();
  const currentBudget = budgets.find(b => b.schoolYear === currentBudgetYear);

  // Sélection d'enveloppe : on cherche d'abord la version de l'année courante, sinon la dernière connue
  const [selectedEnvelopeName, setSelectedEnvelopeName] = useState<string | null>(null);
  const selectedEnvelope = React.useMemo(() => {
    if (!selectedEnvelopeName) return null;
    // Cherche dans le budget courant
    const envCourant = currentBudget?.envelopes?.find(e => e.name === selectedEnvelopeName);
    if (envCourant) return envCourant;
    // Sinon, cherche la dernière version connue dans tous les budgets (par année décroissante)
    const sortedBudgets = [...budgets].sort((a, b) => b.schoolYear.localeCompare(a.schoolYear));
    for (const b of sortedBudgets) {
      const env = b.envelopes?.find(e => e.name === selectedEnvelopeName);
      if (env) return env;
    }
    return null;
  }, [selectedEnvelopeName, currentBudget, budgets]);

  // Si aucun budget n'existe, on masque les montants et la répartition
  const hasBudgets = budgets && budgets.length > 0;

  // État local pour afficher BudgetDashboard inline
  const [showBudgetDashboard, setShowBudgetDashboard] = useState(false);

  // Liste des années disponibles (triées décroissant)
  const budgetYears = React.useMemo(() => {
    const years = budgets.map(b => b.schoolYear);
    return Array.from(new Set(years)).sort((a, b) => b.localeCompare(a));
  }, [budgets]);

  // État pour l'année sélectionnée
  const [selectedYear, setSelectedYear] = useState(() => {
    // Par défaut, année courante si existante, sinon la plus récente
    const current = getCurrentBudgetYear();
    if (budgets.some(b => b.schoolYear === current)) return current;
    return budgetYears[0] || current;
  });

  // Budget de l'année sélectionnée
  const selectedBudget = budgets.find(b => b.schoolYear === selectedYear);

  // Callback après création d'un budget
  const handleBudgetCreated = (year: string) => {
    setSelectedYear(year);
    setShowBudgetDashboard(false);
  };

  // Affichage principal
  if (budgets.length === 0) {
    // Première utilisation : création du tout premier budget
    return (
      <div className="min-h-[400px] p-0">
        <BudgetDashboard onBudgetCreated={handleBudgetCreated} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ENTÊTE DE ZONE DE TRAVAIL */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion Budgétaire</h1>
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
            <>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Modifier ce poste</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Supprimer ce poste</button>
            </>
          )}
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm" onClick={() => setShowBudgetDashboard(true)}>Créer un nouveau budget</button>
        </div>
      </div>

      {/* GRILLE 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bloc 1 : Soldes des postes budgétaires */}
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Soldes des postes budgétaires</h3>
          <div className="space-y-2">
            {selectedBudget && selectedBudget.envelopes && selectedBudget.envelopes.length > 0 ? (
              selectedBudget.envelopes.map((env: any) => (
                <div key={env.id} className="flex items-center justify-between border-b last:border-b-0 py-1">
                  <span className="text-sm font-medium text-gray-700">{env.displayName || env.name}</span>
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
              <span className="text-sm text-gray-600">{formatCurrency(selectedBudget ? selectedBudget.totalBudget || 0 : 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Dépenses totales</span>
              <span className="text-sm text-gray-600">{formatCurrency(selectedBudget ? selectedBudget.totalExpenses || 0 : 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Solde global</span>
              <span className={`text-sm font-semibold ${(selectedBudget && (selectedBudget.totalRevenue - selectedBudget.totalExpenses) >= 0) ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(selectedBudget ? (selectedBudget.totalRevenue - selectedBudget.totalExpenses) : 0)}</span>
            </div>
          </div>
        </div>

        {/* Bloc 4 : Tendances */}
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendances</h3>
          <div className="w-full h-32 flex items-center justify-center text-gray-400">[Graphique à venir]</div>
        </div>
      </div>

      {/* Affichage dynamique selon existence du budget pour l'année sélectionnée */}
      {showBudgetDashboard ? (
        <div className="py-8 p-0">
          <BudgetDashboard onBudgetCreated={handleBudgetCreated} />
        </div>
      ) : selectedBudget ? (
        <div className="space-y-6">
          {/* Bandeau de boutons des postes budgétaires (tous budgets confondus) */}
          {allEnvelopes.length > 0 && (
            <div className="flex gap-2 mb-4">
              {allEnvelopes.map((env: any) => (
                <button
                  key={env.name}
                  className={`px-4 py-2 rounded bg-blue-100 hover:bg-blue-300 text-blue-900 font-medium border border-blue-200 shadow-sm ${selectedEnvelopeName === env.name ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedEnvelopeName(env.name)}
                >
                  {env.displayName || env.name}
                </button>
              ))}
            </div>
          )}

          {/* Zone d'organisation du poste budgétaire sélectionné */}
          {selectedEnvelope && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-md font-semibold text-blue-900 mb-2">Organisation du poste : {selectedEnvelope.displayName || selectedEnvelope.name}</h4>
              <p className="text-sm text-gray-700 mb-1">{selectedEnvelope.description}</p>
            </div>
          )}

          {/* Affichage des montants et répartition UNIQUEMENT si budgets existe */}
          {hasBudgets ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ligne 1 - Colonne 1: Répartition du budget */}
              <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition du budget</h3>
                <div className="space-y-3">
                  {selectedBudget && selectedBudget.envelopes && selectedBudget.envelopes.length > 0 ? (
                    selectedBudget.envelopes.map((env: any) => (
                      <div key={env.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span className="text-sm font-medium text-gray-700 capitalize">{env.displayName || env.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">{formatCurrency(env.budgetAllocated)}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">Aucune catégorie définie</span>
                  )}
                </div>
              </div>

              {/* Ligne 1 - Colonne 2: Actions rapides */}
              <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                <div className="flex flex-row justify-center gap-4 mt-5">
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    <DollarSign className="w-4 h-4" />
                    Nouvelle dépense
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                    <TrendingUp className="w-4 h-4" />
                    Nouveau revenu
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                    <PieChart className="w-4 h-4" />
                    Rapport détaillé
                  </button>
                </div>
              </div>

              {/* Ligne 2 - Colonne 1: Analyse complète de vos finances */}
              <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyse complète de vos finances</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Budget total</p>
                        <p className="text-xl font-semibold text-blue-700">{formatCurrency(selectedBudget ? selectedBudget.totalBudget || 0 : 0)}</p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-full">
                        <BarChart className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  {/* Calcul du solde dynamique */}
                  <div className={`border rounded-lg p-4 ${(selectedBudget && (selectedBudget.totalRevenue - selectedBudget.totalExpenses) >= 0) ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${(selectedBudget && (selectedBudget.totalRevenue - selectedBudget.totalExpenses) >= 0) ? 'text-green-600' : 'text-red-600'}`}>Solde</p>
                        <p className={`text-xl font-semibold ${(selectedBudget && (selectedBudget.totalRevenue - selectedBudget.totalExpenses) >= 0) ? 'text-green-700' : 'text-red-700'}`}>{selectedBudget && (selectedBudget.totalRevenue - selectedBudget.totalExpenses) >= 0 ? '+' : ''}{formatCurrency(selectedBudget ? (selectedBudget.totalRevenue - selectedBudget.totalExpenses) : 0)}</p>
                      </div>
                      <div className={`p-2 rounded-full ${(selectedBudget && (selectedBudget.totalRevenue - selectedBudget.totalExpenses) >= 0) ? 'bg-green-100' : 'bg-red-100'}`}>
                        <DollarSign className={`w-5 h-5 ${(selectedBudget && (selectedBudget.totalRevenue - selectedBudget.totalExpenses) >= 0) ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Revenus</p>
                        <p className="text-xl font-semibold text-green-700">{formatCurrency(selectedBudget ? selectedBudget.totalRevenue || 0 : 0)}</p>
                      </div>
                      <div className="p-2 bg-green-100 rounded-full">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600">Dépenses</p>
                        <p className="text-xl font-semibold text-red-700">{formatCurrency(selectedBudget ? selectedBudget.totalExpenses || 0 : 0)}</p>
                      </div>
                      <div className="p-2 bg-red-100 rounded-full">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8"><BudgetDashboard /></div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
          <p className="mb-4 text-gray-600">Aucun budget n'existe pour l'année sélectionnée.</p>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm" onClick={() => setShowBudgetDashboard(true)}>
            Créer un budget pour {selectedYear}
          </button>
        </div>
      )}
    </div>
  );
} 