import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Users, FileText, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ExpenseManager from './ExpenseManager';
import RevenueManager from './RevenueManager';
import SpecialistManager from './SpecialistManager';
import BudgetOverview from './BudgetOverview';
import BudgetExpenseManager from './BudgetExpenseManager';
import { parseSchoolYearId } from '../utils/schoolYearUtils';

type BudgetTabType = 'overview' | 'fournitures' | 'evenements' | 'reparations' | 'specialistes';

interface BudgetDashboardProps {
  selectedGroupId?: string;
  onBudgetCreated?: (year: string) => void;
}

interface BudgetItem {
  id: string;
  category: string;
  customCategory?: string;
  amount: string;
}

export default function BudgetDashboard({ selectedGroupId, onBudgetCreated }: BudgetDashboardProps) {
  const [activeTab, setActiveTab] = useState<BudgetTabType>('overview');
  const { user } = useAuth();
  const schoolYear = '2025-2026'; // Année scolaire actuelle
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  
  // États pour le formulaire de création de budget
  const [budgetYear, setBudgetYear] = useState('2025-2026');
  const [residualBalance, setResidualBalance] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [subventionsDonations, setSubventionsDonations] = useState('');
  
  // États pour les revenus personnalisés
  const [customRevenues, setCustomRevenues] = useState<Array<{id: string, label: string, amount: string}>>([]);
  
  // États pour les alertes
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'deficit' | 'tight' | 'balanced' | 'surplus'>('balanced');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  
  // États pour le budget créé
  const [createdBudget, setCreatedBudget] = useState<any>(null);
  const [showCreatedBudget, setShowCreatedBudget] = useState(false);
  
  // Liste des années scolaires disponibles
  const schoolYears = [
    '2024-2025',
    '2025-2026',
    '2026-2027',
    '2027-2028',
    '2028-2029',
    '2029-2030'
  ];
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { id: '1', category: '', amount: '' },
    { id: '2', category: '', amount: '' },
    { id: '3', category: '', amount: '' },
    { id: '4', category: '', amount: '' }
  ]);

  // Liste des catégories prédéfinies
  const predefinedCategories = [
    'Matériel pédagogique',
    'Instruments de musique',
    'Sorties éducatives',
    'Réparations',
    'Fournitures de bureau',
    'Événements spéciaux',
    'Formation continue',
    'Spécialistes',
    'Concerts',
    'Autres'
  ];

  // Gestion des changements de catégorie
  const handleCategoryChange = (id: string, value: string) => {
    setBudgetItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, category: value, customCategory: value === 'new' ? '' : undefined }
        : item
    ));
  };

  // Gestion des changements de catégorie personnalisée
  const handleCustomCategoryChange = (id: string, value: string) => {
    setBudgetItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, customCategory: value }
        : item
    ));
  };

  // Gestion des changements de montant
  const handleAmountChange = (id: string, value: string) => {
    setBudgetItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, amount: value }
        : item
    ));
  };

  // Ajouter un nouveau poste budgétaire
  const addBudgetItem = () => {
    const newId = (budgetItems.length + 1).toString();
    setBudgetItems(prev => [...prev, { id: newId, category: '', amount: '' }]);
  };

  // Supprimer un poste budgétaire
  const removeBudgetItem = (id: string) => {
    if (budgetItems.length > 1) {
      setBudgetItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Ajouter un nouveau revenu personnalisé
  const addCustomRevenue = () => {
    const newId = Date.now().toString();
    setCustomRevenues(prev => [...prev, { id: newId, label: '', amount: '' }]);
  };

  // Supprimer un revenu personnalisé
  const removeCustomRevenue = (id: string) => {
    setCustomRevenues(prev => prev.filter(item => item.id !== id));
  };

  // Gestion des changements de revenus personnalisés
  const handleCustomRevenueChange = (id: string, field: 'label' | 'amount', value: string) => {
    setCustomRevenues(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calcul du total des revenus
    const residual = parseFloat(residualBalance) || 0;
    const total = parseFloat(totalBudget) || 0;
    const subventions = parseFloat(subventionsDonations) || 0;
    const customTotal = customRevenues.reduce((sum, rev) => sum + (parseFloat(rev.amount) || 0), 0);
    const totalRevenues = residual + total + subventions + customTotal;
    
    // Calcul du total des dépenses
    const totalExpenses = budgetItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    
    // Calcul du solde
    const balance = totalRevenues - totalExpenses;
    const balancePercentage = totalRevenues > 0 ? (balance / totalRevenues) * 100 : 0;
    
    // Analyse du budget et définition des alertes
    if (balance < 0) {
      // Déficit
      setAlertType('deficit');
      setAlertTitle('⚠️ Budget en déficit');
      setAlertMessage(`Votre budget présente un déficit de ${formatCurrency(Math.abs(balance))}. Cela peut être acceptable si vous prévoyez des sources de revenus supplémentaires ou si vous acceptez ce déficit. Voulez-vous continuer ?`);
    } else if (balancePercentage < 5 && balancePercentage > 0) {
      // Budget serré (moins de 5% de marge)
      setAlertType('tight');
      setAlertTitle('⚠️ Budget serré');
      setAlertMessage(`Votre budget a une marge de seulement ${formatCurrency(balance)} (${balancePercentage.toFixed(1)}%). Il serait prudent de prévoir une marge pour les imprévus. Souhaitez-vous ajuster votre budget ?`);
    } else if (balancePercentage >= 5 && balancePercentage <= 15) {
      // Budget équilibré
      setAlertType('balanced');
      setAlertTitle('✅ Budget équilibré');
      setAlertMessage(`Excellent travail ! Votre budget est bien équilibré avec une marge de ${formatCurrency(balance)} (${balancePercentage.toFixed(1)}%). C'est un budget responsable et réaliste.`);
    } else {
      // Surplus important
      setAlertType('surplus');
      setAlertTitle('💰 Budget avec surplus');
      setAlertMessage(`Votre budget présente un surplus de ${formatCurrency(balance)} (${balancePercentage.toFixed(1)}%). Vous pourriez envisager d'augmenter certains postes ou de prévoir des projets supplémentaires.`);
    }
    
    setShowAlert(true);
  };

  // Fonction pour confirmer la création du budget
  const confirmBudgetCreation = () => {
    // Création de l'objet budget
    const budgetData = {
      id: Date.now().toString(),
      year: budgetYear,
      residualBalance: parseFloat(residualBalance) || 0,
      totalBudget: parseFloat(totalBudget) || 0,
      subventionsDonations: parseFloat(subventionsDonations) || 0,
      customRevenues: customRevenues.map(rev => ({
        ...rev,
        amount: parseFloat(rev.amount) || 0
      })),
      budgetItems: budgetItems.map(item => ({
        ...item,
        amount: parseFloat(item.amount) || 0,
        spent: 0, // Montant dépensé (initialisé à 0)
        remaining: parseFloat(item.amount) || 0 // Montant restant
      })),
      createdAt: new Date().toISOString()
    };
    
    // Sauvegarde du budget
    setCreatedBudget(budgetData);
    setShowCreatedBudget(true);
    
    // Callback pour signaler la création au parent
    if (onBudgetCreated) {
      onBudgetCreated(budgetYear);
    }
    
    // Fermeture des alertes et du formulaire
    setShowAlert(false);
    setShowBudgetForm(false);
  };

  // Fonction pour annuler et revenir au formulaire
  const cancelAlert = () => {
    setShowAlert(false);
  };

  // Simulation de la liste des budgets (à remplacer par la vraie source de données)
  const budgets: any[] = [];

  // Fonction utilitaire pour formater les montants
  const formatCurrency = (amount: number): string => {
    return `${amount.toFixed(2)} $`;
  };

  // Fonction pour formater un champ de saisie monétaire
  const formatInputCurrency = (value: string): string => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    return formatCurrency(numValue);
  };

  // Fonction pour nettoyer un champ de saisie monétaire (enlever le symbole $)
  const cleanCurrencyInput = (value: string): string => {
    return value.replace(/[^\d.]/g, '');
  };

  // Affichage du budget créé
  if (showCreatedBudget && createdBudget) {
    const totalRevenues = createdBudget.residualBalance + createdBudget.totalBudget + 
                         createdBudget.subventionsDonations + 
                         createdBudget.customRevenues.reduce((sum: number, rev: any) => sum + rev.amount, 0);
    
    const totalBudgeted = createdBudget.budgetItems.reduce((sum: number, item: any) => sum + item.amount, 0);
    const totalSpent = createdBudget.budgetItems.reduce((sum: number, item: any) => sum + item.spent, 0);
    const totalRemaining = createdBudget.budgetItems.reduce((sum: number, item: any) => sum + item.remaining, 0);
    const overallBalance = totalRevenues - totalSpent;

    return (
      <div className="space-y-6">
        {/* Résumé financier */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Résumé Financier</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-green-50 p-6 rounded-xl shadow-sm">
              <div className="text-base font-medium text-green-600 mb-2">Revenus Totaux</div>
              <div className="text-3xl font-bold text-green-700">{formatCurrency(totalRevenues)}</div>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl shadow-sm">
              <div className="text-base font-medium text-blue-600 mb-2">Budget Alloué</div>
              <div className="text-3xl font-bold text-blue-700">{formatCurrency(totalBudgeted)}</div>
            </div>
            <div className="bg-orange-50 p-6 rounded-xl shadow-sm">
              <div className="text-base font-medium text-orange-600 mb-2">Dépensé</div>
              <div className="text-3xl font-bold text-orange-700">{formatCurrency(totalSpent)}</div>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl shadow-sm">
              <div className="text-base font-medium text-purple-600 mb-2">Solde Actuel</div>
              <div className={`text-3xl font-bold ${overallBalance >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
                {formatCurrency(overallBalance)}
              </div>
            </div>
          </div>
        </div>

        {/* Postes budgétaires */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Postes Budgétaires</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {createdBudget.budgetItems.map((item: any) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">
                      {item.category === 'new' ? item.customCategory : item.category}
                    </h3>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(item.spent)} / {formatCurrency(item.amount)}
                    </div>
                  </div>
                  
                  {/* Barre de progression */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.spent > item.amount ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min((item.spent / item.amount) * 100, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Restant: <span className={`font-medium ${item.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(item.remaining)}
                      </span>
                    </span>
                    <span className="text-gray-600">
                      {((item.spent / item.amount) * 100).toFixed(1)}% utilisé
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bouton pour revenir à la création */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              setShowCreatedBudget(false);
              setCreatedBudget(null);
              setShowBudgetForm(true);
            }}
            className="px-6 py-2 bg-[#1473AA] text-white rounded-md font-medium hover:bg-[#125e8c] transition-colors"
          >
            Créer un nouveau budget
          </button>
        </div>
      </div>
    );
  }

  if (budgets.length === 0) {
    if (showBudgetForm) {
      return (
        <div className="min-h-[400px] p-0">
          <form
            className="bg-white border rounded-lg p-6 w-full space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="flex justify-between items-center mb-6">
              <div></div>
              <div className="text-right">
                <label className="block text-sm font-medium text-gray-700 mb-1">Année scolaire</label>
                <select
                  value={budgetYear}
                  onChange={(e) => setBudgetYear(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                >
                  {schoolYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ligne des titres */}
            <div className="grid grid-cols-2 gap-8 border border-gray-300 rounded-lg p-4 bg-gray-50">
              {/* Colonne Revenus */}
              <div className="space-y-4 border border-gray-300 rounded-lg bg-white p-4">
                <h3 className="text-lg font-medium text-gray-900">Revenus</h3>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Solde résiduel pour l'année précédente
                  </label>
                  <input
                    type="text"
                    value={residualBalance}
                    onChange={(e) => setResidualBalance(e.target.value)}
                    onBlur={(e) => setResidualBalance(formatInputCurrency(e.target.value))}
                    onFocus={(e) => setResidualBalance(cleanCurrencyInput(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0.00 $"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Budget total pour l'année
                  </label>
                  <input
                    type="text"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    onBlur={(e) => setTotalBudget(formatInputCurrency(e.target.value))}
                    onFocus={(e) => setTotalBudget(cleanCurrencyInput(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0.00 $"
                    required
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Subventions et dons
                  </label>
                  <input
                    type="text"
                    value={subventionsDonations}
                    onChange={(e) => setSubventionsDonations(e.target.value)}
                    onBlur={(e) => setSubventionsDonations(formatInputCurrency(e.target.value))}
                    onFocus={(e) => setSubventionsDonations(cleanCurrencyInput(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0.00 $"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Ajouter une source de revenus
                  </label>
                  <button
                    type="button"
                    onClick={addCustomRevenue}
                    className="w-full px-3 py-2 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors border border-green-200"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Ajouter une source de revenus
                  </button>
                </div>
              </div>
              {/* Colonne Dépenses */}
              <div className="space-y-4 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900">Postes budgétaires</h3>
                {budgetItems.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex gap-2">
                        <select
                          value={item.category}
                          onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          required
                        >
                          <option value="">Sélectionner une catégorie</option>
                          {predefinedCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="new">Nouveau...</option>
                        </select>
                        
                        {item.category === 'new' && (
                          <input
                            type="text"
                            value={item.customCategory || ''}
                            onChange={(e) => handleCustomCategoryChange(item.id, e.target.value)}
                            placeholder="Nom du poste"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                            required
                          />
                        )}
                      </div>
                    </div>
                    
                    <input
                      type="text"
                      value={item.amount}
                      onChange={(e) => handleAmountChange(item.id, e.target.value)}
                      onBlur={(e) => handleAmountChange(item.id, formatInputCurrency(e.target.value))}
                      onFocus={(e) => handleAmountChange(item.id, cleanCurrencyInput(e.target.value))}
                      placeholder="Montant"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    />
                    
                    {budgetItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBudgetItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={addBudgetItem}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter un poste
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
                onClick={() => setShowBudgetForm(false)}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#1473AA] text-white rounded-md font-medium hover:bg-[#125e8c] transition-colors"
              >
                Créer
              </button>
            </div>
          </form>

          {/* Alerte de validation du budget */}
          {showAlert && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{alertTitle}</h3>
                </div>
                <p className="text-gray-600 mb-6">{alertMessage}</p>
                <div className="flex gap-3 justify-end">
                  {alertType === 'deficit' || alertType === 'tight' ? (
                    <>
                      <button
                        onClick={cancelAlert}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
                      >
                        Ajuster le budget
                      </button>
                      <button
                        onClick={confirmBudgetCreation}
                        className={`px-4 py-2 text-white rounded-md font-medium transition-colors ${
                          alertType === 'deficit' 
                            ? 'bg-orange-500 hover:bg-orange-600' 
                            : 'bg-yellow-500 hover:bg-yellow-600'
                        }`}
                      >
                        Continuer
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={cancelAlert}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
                      >
                        Ajuster
                      </button>
                      <button
                        onClick={confirmBudgetCreation}
                        className={`px-4 py-2 text-white rounded-md font-medium transition-colors ${
                          alertType === 'balanced' 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                      >
                        Créer le budget
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <DollarSign className="w-12 h-12 text-gray-400 mb-4" />
        <p className="mb-4 text-gray-500 text-center">Aucun exercice financier pour le moment</p>
        <button
          className="px-4 py-2 bg-[#1473AA] text-white rounded font-semibold text-base hover:bg-[#125e8c] transition-colors"
          onClick={() => setShowBudgetForm(true)}
        >
          Mon premier budget
        </button>
      </div>
    );
  }

  const tabs = [
    {
      id: 'overview' as BudgetTabType,
      label: 'Vue d\'ensemble',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Résumé global du budget'
    },
    {
      id: 'fournitures' as BudgetTabType,
      label: 'Fournitures',
      icon: <TrendingDown className="w-4 h-4" />,
      description: 'Gestion des dépenses'
    },
    {
      id: 'evenements' as BudgetTabType,
      label: 'Événements',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Gestion des revenus'
    },
    {
      id: 'reparations' as BudgetTabType,
      label: 'Réparations',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Gestion des spécialistes'
    },
    {
      id: 'specialistes' as BudgetTabType,
      label: 'Spécialistes',
      icon: <Users className="w-4 h-4" />,
      description: 'Suivi des spécialistes'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <BudgetOverview />;
      case 'fournitures':
        return <BudgetExpenseManager />;
      case 'evenements':
        return <BudgetExpenseManager />;
      case 'reparations':
        return <BudgetExpenseManager />;
      case 'specialistes':
        return <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-gray-600">Interface dédiée aux spécialistes - À développer</p>
          </div>
        </div>;
      default:
        return <BudgetOverview />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Contenu de l'onglet */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  );
} 