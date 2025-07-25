import React, { useState } from 'react';
import { 
  DollarSign, 
  Package, 
  Calendar, 
  Wrench, 
  Users, 
  Plus, 
  FileText,
  TrendingUp,
  BarChart,
  X
} from 'lucide-react';

type BudgetCategory = 'overview' | 'supplies' | 'events' | 'repairs' | 'specialists';

interface BudgetExpense {
  id: string;
  title: string;
  amount: number;
  category: BudgetCategory;
  supplier: string;
  budgetCode: string;
  date: string;
  status: 'pending' | 'approved' | 'paid';
  description: string;
}

interface BudgetRevenue {
  id: string;
  title: string;
  amount: number;
  source: string;
  date: string;
  status: 'pending' | 'received';
}

export default function BudgetSystem({ onClose }: { onClose: () => void }) {
  const [activeCategory, setActiveCategory] = useState<BudgetCategory>('overview');
  const [expenses, setExpenses] = useState<BudgetExpense[]>([]);
  const [revenues, setRevenues] = useState<BudgetRevenue[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showRevenueForm, setShowRevenueForm] = useState(false);

  const categories = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: BarChart },
    { id: 'supplies', name: 'Fournitures', icon: Package },
    { id: 'events', name: 'Événements', icon: Calendar },
    { id: 'repairs', name: 'Réparations', icon: Wrench },
    { id: 'specialists', name: 'Spécialistes', icon: Users }
  ];

  const getCategoryExpenses = (category: BudgetCategory) => {
    if (category === 'overview') return expenses;
    return expenses.filter(expense => expense.category === category);
  };

  const getCategoryRevenues = (category: BudgetCategory) => {
    if (category === 'overview') return revenues;
    return revenues.filter(revenue => revenue.source === category);
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalRevenues = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
  const balance = totalRevenues - totalExpenses;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gestion Budgétaire</h2>
              <p className="text-sm text-gray-600">Gérez vos finances et postes budgétaires</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Menu horizontal */}
        <div className="flex border-b border-gray-200">
          {categories.map((category) => {
            const Icon = category.icon;
            const categoryExpenses = getCategoryExpenses(category.id as BudgetCategory);
            const categoryRevenues = getCategoryRevenues(category.id as BudgetCategory);
            const categoryTotal = categoryRevenues.reduce((sum, r) => sum + r.amount, 0) - 
                                categoryExpenses.reduce((sum, e) => sum + e.amount, 0);

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as BudgetCategory)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                  activeCategory === category.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{category.name}</span>
                {category.id !== 'overview' && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    categoryTotal >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {categoryTotal >= 0 ? '+' : ''}{categoryTotal}€
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Contenu principal */}
        <div className="flex-1 overflow-auto p-6">
          {activeCategory === 'overview' && (
            <div className="space-y-6">
              {/* Résumé financier */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
                      <p className="text-2xl font-semibold text-green-600">{totalRevenues}€</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Dépenses totales</p>
                      <p className="text-2xl font-semibold text-red-600">{totalExpenses}€</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <DollarSign className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Solde</p>
                      <p className={`text-2xl font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {balance >= 0 ? '+' : ''}{balance}€
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                      <BarChart className={`w-6 h-6 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowExpenseForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nouvelle dépense
                </button>
                <button
                  onClick={() => setShowRevenueForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau revenu
                </button>
              </div>

              {/* Dernières transactions */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Dernières transactions</h3>
                </div>
                <div className="p-4">
                  {expenses.length === 0 && revenues.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Aucune transaction enregistrée</p>
                  ) : (
                    <div className="space-y-3">
                      {[...expenses, ...revenues]
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10)
                        .map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${
                                'amount' in item && item.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                                <DollarSign className={`w-4 h-4 ${
                                  'amount' in item && item.amount > 0 ? 'text-green-600' : 'text-red-600'
                                }`} />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{item.title}</p>
                                <p className="text-sm text-gray-500">
                                  {new Date(item.date).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${
                                'amount' in item && item.amount > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {('amount' in item && item.amount > 0 ? '+' : '-')}{Math.abs(item.amount)}€
                              </p>
                              <p className="text-sm text-gray-500">
                                {('status' in item) ? item.status : 'transaction'}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Interface pour les postes budgétaires spécifiques */}
          {activeCategory !== 'overview' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Gestion - {categories.find(c => c.id === activeCategory)?.name}
                </h3>
                <button
                  onClick={() => setShowExpenseForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nouvelle dépense
                </button>
              </div>

              {/* Liste des dépenses du poste */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900">Dépenses</h4>
                </div>
                <div className="p-4">
                  {getCategoryExpenses(activeCategory).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Aucune dépense enregistrée pour ce poste</p>
                  ) : (
                    <div className="space-y-3">
                      {getCategoryExpenses(activeCategory).map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-full">
                              <DollarSign className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{expense.title}</p>
                              <p className="text-sm text-gray-500">
                                {expense.supplier} • {expense.budgetCode}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-red-600">-{expense.amount}€</p>
                            <p className="text-sm text-gray-500">
                              {new Date(expense.date).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 