import React, { useState, useEffect } from 'react';
import { DollarSign, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services/firebaseService';
import { DebtReminder } from '../types';

export default function DebtReminders() {
  const { user } = useAuth();
  const [debtReminders, setDebtReminders] = useState<DebtReminder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadDebtReminders();
    }
  }, [user?.id]);

  const loadDebtReminders = async () => {
    setLoading(true);
    try {
      const reminders = await notificationService.getDebtReminders(user!.id);
      setDebtReminders(reminders);
    } catch (error) {
      console.error('Erreur lors du chargement des rappels de dettes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (totalDebt: number) => {
    if (totalDebt > 100) return 'border-l-red-500 bg-red-50';
    if (totalDebt > 50) return 'border-l-yellow-500 bg-yellow-50';
    return 'border-l-blue-500 bg-blue-50';
  };

  const getPriorityIcon = (totalDebt: number) => {
    if (totalDebt > 100) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (totalDebt > 50) return <Clock className="w-5 h-5 text-yellow-500" />;
    return <DollarSign className="w-5 h-5 text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (debtReminders.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucune dette en attente</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Rappels de Dettes</h3>
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {debtReminders.length}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {debtReminders.map((debt) => (
          <div
            key={debt.studentId}
            className={`p-4 rounded-lg border-l-4 ${getPriorityColor(debt.totalDebt)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getPriorityIcon(debt.totalDebt)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-500" />
                    <h4 className="font-medium text-gray-900">
                      {debt.studentName}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Dette totale: <span className="font-semibold text-red-600">{debt.totalDebt.toFixed(2)} $</span>
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{debt.unpaidSales} achat{debt.unpaidSales > 1 ? 's' : ''} en attente</span>
                    {debt.lastReminder && (
                      <span>
                        Dernier rappel: {debt.lastReminder.toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Ici on pourrait ajouter une action pour contacter l'élève
                    alert(`Contacter ${debt.studentName} concernant sa dette de ${debt.totalDebt.toFixed(2)} $`);
                  }}
                  className="px-3 py-1 text-xs bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
                >
                  Contacter
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total des dettes: {debtReminders.reduce((total, debt) => total + debt.totalDebt, 0).toFixed(2)} $</span>
          <button
            onClick={loadDebtReminders}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Actualiser
          </button>
        </div>
      </div>
    </div>
  );
} 