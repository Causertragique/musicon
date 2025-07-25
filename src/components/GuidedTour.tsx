import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Users, BookOpen, Brain, Star } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string; // Sélecteur CSS pour l'élément à mettre en surbrillance
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur MusiqueConnect',
    description: 'Découvrez comment moderniser la gestion de votre département de musique avec notre plateforme complète.',
    icon: <Play className="w-6 h-6" />
  },
  {
    id: 'dashboard',
    title: 'Tableau de bord intelligent',
    description: 'Vue d\'ensemble de vos élèves, groupes et activités en temps réel.',
    icon: <Users className="w-6 h-6" />
  },
  {
    id: 'pfeq',
    title: 'PFEQ intégré',
    description: 'Programme de formation de l\'école québécoise intégré nativement pour un suivi conforme.',
    icon: <BookOpen className="w-6 h-6" />
  },
  {
    id: 'ai-tools',
    title: 'Maestro IA',
    description: 'Assistant intelligent pour la pédagogie musicale et la création de contenu.',
    icon: <Brain className="w-6 h-6" />
  },
  {
    id: 'gamification',
    title: 'Gamification',
    description: 'Système de récompenses et défis pour motiver vos élèves.',
    icon: <Star className="w-6 h-6" />
  }
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuidedTour({ isOpen, onClose }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const currentTourStep = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1473AA] to-[#3ec6ff] rounded-full flex items-center justify-center text-white">
              {currentTourStep.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Tour guidé</h3>
              <p className="text-sm text-gray-500">
                {currentStep + 1} sur {tourSteps.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {currentTourStep.title}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {currentTourStep.description}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#1473AA] to-[#3ec6ff] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Précédent</span>
          </button>

          <button
            onClick={handleNext}
            className="bg-gradient-to-r from-[#1473AA] to-[#3ec6ff] text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
          >
            {isLastStep ? 'Terminer' : (
              <div className="flex items-center space-x-2">
                <span>Suivant</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>

        {/* Skip button */}
        <div className="text-center mt-4">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Passer le tour
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook pour gérer le tour guidé
export function useGuidedTour() {
  const [isTourOpen, setIsTourOpen] = useState(false);

  const startTour = () => {
    setIsTourOpen(true);
  };

  const closeTour = () => {
    setIsTourOpen(false);
  };

  return {
    isTourOpen,
    startTour,
    closeTour
  };
} 