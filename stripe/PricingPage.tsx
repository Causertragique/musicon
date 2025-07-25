import React from 'react';
import { Check, Star, Zap, Crown } from 'lucide-react';
const logo = '/logos/brand-primary.png';

const plans = [
  {
    name: 'Jusqu\'à 20 élèves',
    subtitle: 'Idéal pour enseignant à la leçon',
    price: '19$/mois',
    description: '',
    features: [
      'Jusqu\'à 20 élèves',
      'PFEQ intégré',
      'Google Sheets Sync',
      'Support par email',
      'Fonctionnalités de base'
    ],
    icon: <Zap className="w-6 h-6" />,
    popular: false,
    cta: 'Choisir',
    href: 'https://buy.stripe.com/5kQeVfakX6yIay10pY4AU00'
  },
  {
    name: 'École de musique',
    subtitle: 'Pour les écoles de musique en croissance',
    price: '49$/mois',
    description: 'Pour les écoles de musique en croissance',
    features: [
      'Jusqu\'à 75 élèves',
      'Toutes les fonctionnalités Starter',
      'Maestro IA',
      'Gamification',
      'Analytics avancées',
      'Support prioritaire',
      'Personnalisation de marque'
    ],
    icon: <Star className="w-6 h-6" />,
    popular: true,
    cta: 'Choisir',
    href: 'https://buy.stripe.com/9B6bJ3fFhf5e7lP7Sq4AU01'
  },
  {
    name: 'Scolaire',
    subtitle: 'Parfait pour les écoles secondaires et primaires',
    price: '99$/mois',
    description: '',
    features: [
      'Jusqu\'à 200 élèves',
      'Toutes les fonctionnalités Pro',
      'API personnalisée',
      'Intégrations sur mesure',
      'Support dédié 24/7',
      'Formation personnalisée',
      'White-label disponible'
    ],
    icon: <Crown className="w-6 h-6" />,
    popular: false,
    cta: 'Choisir',
    href: 'https://buy.stripe.com/00weVfdx92is5dHegO4AU02'
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1473AA] to-[#3ec6ff] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="MusiqueConnect" className="h-10 md:h-14" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Tarification simple et transparente
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Essai gratuit 1 mois, puis payez selon le nombre d'élèves actifs. Aucun frais caché.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-32 max-w-6xl mx-auto px-2 md:px-8 py-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border flex flex-col ${
                plan.popular 
                  ? 'border-white/40 shadow-2xl scale-105' 
                  : 'border-white/20'
              }`}
              style={{ minHeight: '540px' }}
            >
              {/* Plan header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1473AA] to-[#3ec6ff] rounded-full flex items-center justify-center text-white">
                    {plan.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-white mb-2">{plan.price}</div>
                {/* Sous-titres spécifiques */}
                {plan.name === "Jusqu'à 20 élèves" && (
                  <div className="text-black text-sm font-medium mb-2">Idéal pour l'enseignement à la leçon</div>
                )}
                {plan.name === "Scolaire" && (
                  <div className="text-black text-sm font-medium mb-2">Écoles secondaires et primaires</div>
                )}
                <p className="text-white/70">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-white/90">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <div className="mt-auto flex justify-center">
                <button
                  onClick={() => window.location.href = plan.href}
                  className={`w-full max-w-xs py-3 px-6 rounded-lg font-semibold text-base transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-[#1473AA] ${
                    plan.popular
                      ? 'bg-white text-[#1473AA] hover:bg-[#e6f0f7]'
                      : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sur mesure section */}
        <div className="text-center mt-20">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/30 max-w-2xl mx-auto flex flex-col items-center">
            <h3 className="text-2xl font-bold text-white mb-4">Plus de 200 élèves ?</h3>
            <p className="text-white/80 mb-6">
              Besoin d'une offre sur mesure pour votre institution ? Contactez-nous pour discuter de vos besoins spécifiques.
            </p>
            <button
              onClick={() => window.location.href = 'mailto:info@guillaumehetu.com'}
              className="w-full max-w-xs py-3 px-6 rounded-lg font-semibold text-base transition-all duration-200 shadow-md bg-white text-[#1473AA] hover:bg-[#e6f0f7] focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-[#1473AA]"
            >
              Contactez-nous
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Questions fréquentes</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">Puis-je changer de plan ?</h3>
              <p className="text-white/80">Oui, vous pouvez changer de plan à tout moment. Les changements prennent effet immédiatement.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">Y a-t-il des frais d'installation ?</h3>
              <p className="text-white/80">Non, aucun frais d'installation. Vous commencez immédiatement avec votre plan choisi.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">L'essai gratuit est-il limité ?</h3>
              <p className="text-white/80">Non, l'essai gratuit inclut toutes les fonctionnalités pendant 1 mois, sans carte de crédit.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">Support technique inclus ?</h3>
              <p className="text-white/80">Oui, tous les plans incluent le support. Pro et Enterprise bénéficient d'un support prioritaire.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
