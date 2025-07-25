import React, { useState } from 'react';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface BudgetSetupWizardProps {
  onComplete: () => void;
  schoolYear: string;
}

interface BudgetEnvelope {
  id: string;
  name: string;
  displayName: string;
  description: string;
  budgetAllocated: number;
  budgetSpent: number;
  budgetRemaining: number;
  isRevenue: boolean;
  accountNumber?: string;
}

const BudgetSetupWizard: React.FC<BudgetSetupWizardProps> = ({ onComplete, schoolYear }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Étape 1: Informations générales
    departmentName: '',
    totalBudget: 0,
    hasExternalBudget: false,
    externalBudgetSource: '',
    
    // Étape 2: Postes de dépenses
    expenseEnvelopes: [] as BudgetEnvelope[],
    
    // Étape 3: Postes de revenus
    revenueEnvelopes: [] as BudgetEnvelope[],
    
    // Étape 4: Spécialistes
    hasSpecialists: false,
    specialistInstruments: [] as string[],
    specialistHourlyRate: 0,
    
    // Étape 5: Événements
    hasEvents: false,
    eventTypes: [] as string[],
    
    // Étape 6: Fournitures
    hasSupplies: false,
    supplyCategories: [] as string[],
  });

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const addExpenseEnvelope = () => {
    const newEnvelope: BudgetEnvelope = {
      id: `expense_${Date.now()}`,
      name: '',
      displayName: '',
      description: '',
      budgetAllocated: 0,
      budgetSpent: 0,
      budgetRemaining: 0,
      isRevenue: false,
      accountNumber: '',
    };
    setFormData({
      ...formData,
      expenseEnvelopes: [...formData.expenseEnvelopes, newEnvelope]
    });
  };

  const updateExpenseEnvelope = (index: number, field: keyof BudgetEnvelope, value: any) => {
    const updated = [...formData.expenseEnvelopes];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, expenseEnvelopes: updated });
  };

  const removeExpenseEnvelope = (index: number) => {
    setFormData({
      ...formData,
      expenseEnvelopes: formData.expenseEnvelopes.filter((_, i) => i !== index)
    });
  };

  const addRevenueEnvelope = () => {
    const newEnvelope: BudgetEnvelope = {
      id: `revenue_${Date.now()}`,
      name: '',
      displayName: '',
      description: '',
      budgetAllocated: 0,
      budgetSpent: 0,
      budgetRemaining: 0,
      isRevenue: true,
      accountNumber: '',
    };
    setFormData({
      ...formData,
      revenueEnvelopes: [...formData.revenueEnvelopes, newEnvelope]
    });
  };

  const updateRevenueEnvelope = (index: number, field: keyof BudgetEnvelope, value: any) => {
    const updated = [...formData.revenueEnvelopes];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, revenueEnvelopes: updated });
  };

  const removeRevenueEnvelope = (index: number) => {
    setFormData({
      ...formData,
      revenueEnvelopes: formData.revenueEnvelopes.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async () => {
    try {
      // Sauvegarder la configuration
      const configRef = doc(db, 'budgetConfig', schoolYear);
      await setDoc(configRef, {
        ...formData,
        schoolYear,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Créer les enveloppes budgétaires
      const envelopesRef = collection(db, 'budgetEnvelopes');
      const allEnvelopes = [...formData.expenseEnvelopes, ...formData.revenueEnvelopes];
      
      for (const envelope of allEnvelopes) {
        await addDoc(envelopesRef, {
          ...envelope,
          schoolYear,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      onComplete();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Configuration initiale du budget</h2>
      
      <div>
        <label className="block text-sm font-medium mb-2">
          Nom du département de musique
        </label>
        <input
          type="text"
          value={formData.departmentName}
          onChange={(e) => setFormData({...formData, departmentName: e.target.value})}
          className="w-full border rounded px-3 py-2"
          placeholder="Ex: Département de musique - École secondaire"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Budget annuel total (en dollars)
        </label>
        <input
          type="number"
          value={formData.totalBudget}
          onChange={(e) => setFormData({...formData, totalBudget: parseFloat(e.target.value) || 0})}
          className="w-full border rounded px-3 py-2"
          placeholder="50000"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="hasExternalBudget"
          checked={formData.hasExternalBudget}
          onChange={(e) => setFormData({...formData, hasExternalBudget: e.target.checked})}
        />
        <label htmlFor="hasExternalBudget">
          Avez-vous des postes budgétaires gérés par d'autres services ?
        </label>
      </div>

      {formData.hasExternalBudget && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Nom du service externe
          </label>
          <input
            type="text"
            value={formData.externalBudgetSource}
            onChange={(e) => setFormData({...formData, externalBudgetSource: e.target.value})}
            className="w-full border rounded px-3 py-2"
            placeholder="Ex: Formation continue, Développement professionnel"
          />
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Postes de dépenses</h2>
      <p className="text-gray-600">Définissez vos postes budgétaires de dépenses avec leurs numéros de compte</p>

      {formData.expenseEnvelopes.map((envelope, index) => (
        <div key={envelope.id} className="border rounded p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Poste {index + 1}</h3>
            <button
              onClick={() => removeExpenseEnvelope(index)}
              className="text-red-600 hover:text-red-800"
            >
              Supprimer
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Numéro de compte</label>
              <input
                type="text"
                value={envelope.accountNumber || ''}
                onChange={(e) => updateExpenseEnvelope(index, 'accountNumber', e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="4001"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Nom du poste</label>
              <input
                type="text"
                value={envelope.displayName}
                onChange={(e) => updateExpenseEnvelope(index, 'displayName', e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="Fournitures"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium mb-1">Description</label>
            <input
              type="text"
              value={envelope.description}
              onChange={(e) => updateExpenseEnvelope(index, 'description', e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="Anches, partitions, accessoires..."
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium mb-1">Budget alloué ($)</label>
            <input
              type="number"
              value={envelope.budgetAllocated}
              onChange={(e) => updateExpenseEnvelope(index, 'budgetAllocated', parseFloat(e.target.value) || 0)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="15000"
            />
          </div>
        </div>
      ))}

      <button
        onClick={addExpenseEnvelope}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Ajouter un poste de dépense
      </button>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Postes de revenus</h2>
      <p className="text-gray-600">Définissez vos sources de revenus</p>

      {formData.revenueEnvelopes.map((envelope, index) => (
        <div key={envelope.id} className="border rounded p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Revenu {index + 1}</h3>
            <button
              onClick={() => removeRevenueEnvelope(index)}
              className="text-red-600 hover:text-red-800"
            >
              Supprimer
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Numéro de compte</label>
              <input
                type="text"
                value={envelope.accountNumber || ''}
                onChange={(e) => updateRevenueEnvelope(index, 'accountNumber', e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="3001"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Type de revenu</label>
              <input
                type="text"
                value={envelope.displayName}
                onChange={(e) => updateRevenueEnvelope(index, 'displayName', e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
                placeholder="Subventions"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium mb-1">Description</label>
            <input
              type="text"
              value={envelope.description}
              onChange={(e) => updateRevenueEnvelope(index, 'description', e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="Subventions gouvernementales, dons..."
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium mb-1">Montant prévu ($)</label>
            <input
              type="number"
              value={envelope.budgetAllocated}
              onChange={(e) => updateRevenueEnvelope(index, 'budgetAllocated', parseFloat(e.target.value) || 0)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="30000"
            />
          </div>
        </div>
      ))}

      <button
        onClick={addRevenueEnvelope}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Ajouter une source de revenu
      </button>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Spécialistes</h2>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="hasSpecialists"
          checked={formData.hasSpecialists}
          onChange={(e) => setFormData({...formData, hasSpecialists: e.target.checked})}
        />
        <label htmlFor="hasSpecialists">
          Avez-vous des spécialistes externes qui interviennent ?
        </label>
      </div>

      {formData.hasSpecialists && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">
              Taux horaire standard des spécialistes ($)
            </label>
            <input
              type="number"
              value={formData.specialistHourlyRate}
              onChange={(e) => setFormData({...formData, specialistHourlyRate: parseFloat(e.target.value) || 0})}
              className="w-full border rounded px-3 py-2"
              placeholder="75"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Instruments des spécialistes
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Flûte', 'Clarinette', 'Saxophone', 'Trompette', 'Trombone', 'Tuba', 'Cor', 'Percussion', 'Basse électrique'].map((instrument) => (
                <label key={instrument} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.specialistInstruments.includes(instrument)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          specialistInstruments: [...formData.specialistInstruments, instrument]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          specialistInstruments: formData.specialistInstruments.filter(i => i !== instrument)
                        });
                      }
                    }}
                  />
                  <span className="text-sm">{instrument}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Événements</h2>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="hasEvents"
          checked={formData.hasEvents}
          onChange={(e) => setFormData({...formData, hasEvents: e.target.checked})}
        />
        <label htmlFor="hasEvents">
          Organisez-vous des événements (concerts, sorties, festivals) ?
        </label>
      </div>

      {formData.hasEvents && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Types d'événements organisés
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['Concerts', 'Sorties culturelles', 'Festivals', 'Concours', 'Camps musicaux', 'Tournées'].map((eventType) => (
              <label key={eventType} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.eventTypes.includes(eventType)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        eventTypes: [...formData.eventTypes, eventType]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        eventTypes: formData.eventTypes.filter(et => et !== eventType)
                      });
                    }
                  }}
                />
                <span className="text-sm">{eventType}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Fournitures</h2>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="hasSupplies"
          checked={formData.hasSupplies}
          onChange={(e) => setFormData({...formData, hasSupplies: e.target.checked})}
        />
        <label htmlFor="hasSupplies">
          Achetez-vous des fournitures pour les élèves ?
        </label>
      </div>

      {formData.hasSupplies && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Catégories de fournitures
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['Anches', 'Embouchures', 'Baguettes', 'Méthodes', 'Partitions', 'Accessoires'].map((supply) => (
              <label key={supply} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.supplyCategories.includes(supply)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        supplyCategories: [...formData.supplyCategories, supply]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        supplyCategories: formData.supplyCategories.filter(sc => sc !== supply)
                      });
                    }
                  }}
                />
                <span className="text-sm">{supply}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep7 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Récapitulatif</h2>
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-medium mb-3">Configuration résumée</h3>
        
        <div className="space-y-2 text-sm">
          <p><strong>Département :</strong> {formData.departmentName}</p>
          <p><strong>Budget total :</strong> {formData.totalBudget.toLocaleString()} $</p>
          <p><strong>Postes de dépenses :</strong> {formData.expenseEnvelopes.length}</p>
          <p><strong>Sources de revenus :</strong> {formData.revenueEnvelopes.length}</p>
          {formData.hasSpecialists && <p><strong>Spécialistes :</strong> {formData.specialistInstruments.join(', ')}</p>}
          {formData.hasEvents && <p><strong>Événements :</strong> {formData.eventTypes.join(', ')}</p>}
          {formData.hasSupplies && <p><strong>Fournitures :</strong> {formData.supplyCategories.join(', ')}</p>}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded">
        <p className="text-sm text-blue-800">
          <strong>Note :</strong> Cette configuration peut être modifiée ultérieurement dans les paramètres du système.
        </p>
      </div>
    </div>
  );

  const steps = [
    { title: 'Informations générales', component: renderStep1 },
    { title: 'Postes de dépenses', component: renderStep2 },
    { title: 'Sources de revenus', component: renderStep3 },
    { title: 'Spécialistes', component: renderStep4 },
    { title: 'Événements', component: renderStep5 },
    { title: 'Fournitures', component: renderStep6 },
    { title: 'Récapitulatif', component: renderStep7 },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Configuration du budget</h1>
          <div className="text-sm text-gray-500">
            Étape {step} sur {steps.length}
          </div>
        </div>
        
        <div className="flex space-x-2">
          {steps.map((s, index) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded ${
                index + 1 <= step ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6">
        {steps[step - 1].component()}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrev}
          disabled={step === 1}
          className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>
        
        {step < steps.length ? (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Suivant
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Terminer la configuration
          </button>
        )}
      </div>
    </div>
  );
};

export default BudgetSetupWizard; 