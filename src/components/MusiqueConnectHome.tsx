import React, { useState } from 'react';
import { Music, Users, BookOpen, Brain, BarChart3, Shield, Zap, Star, Globe, ArrowRight } from 'lucide-react';
const logo = '/logos/brand-primary.png';
const logoGuillaumeHetu = '/logos/guillaumehetu.png';

export default function MusiqueConnectHome() {
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickStart = async () => {
    setIsLoading(true);
    try {
      // Rediriger vers la page d'inscription locale
      window.location.href = `/signup`;
    } catch (error) {
      console.error('Erreur lors de la redirection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    // Rediriger vers la page de connexion locale
    window.location.href = '/login';
  };

  const handlePricing = () => {
    // Rediriger vers la page de pricing locale
    window.location.href = '/pricing';
  };

  const features = [
    {
      icon: <BookOpen className="w-8 h-8 text-white" />,
      title: 'PFEQ Intégré',
      description: 'Programme de formation de l\'école québécoise intégré nativement'
    },
    {
      icon: <Globe className="w-8 h-8 text-white" />,
      title: 'Google Sheets Sync',
      description: 'Synchronisation bidirectionnelle avec vos tableurs existants'
    },
    {
      icon: <Brain className="w-8 h-8 text-white" />,
      title: 'Maestro IA',
      description: 'Assistant intelligent pour la pédagogie musicale'
    },
    {
      icon: <Star className="w-8 h-8 text-white" />,
      title: 'Gamification',
      description: 'Système de récompenses et défis pour motiver les élèves'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-white" />,
      title: 'Analytics Avancées',
      description: 'Suivi détaillé des progrès et performances'
    },
    {
      icon: <Shield className="w-8 h-8 text-white" />,
      title: 'Conformité Loi 23',
      description: 'Protection des données selon les standards québécois'
    }
  ];

  // Couleurs du dégradé
  const gradientFrom = '#1473AA';
  const gradientTo = '#3ec6ff';

  // Mots-clés d'impact
  const impactWords = [
    'Rétroaction améliorée',
    'Communication facilitée',
    'Autonomie',
    'Centralisation des outils',
  ];

  // Palette d'accents pour les pastilles
  const impactColors = [
    'from-yellow-400 to-yellow-500', // Rétroaction améliorée
    'from-emerald-400 to-teal-400',  // Communication facilitée
    'from-violet-400 to-purple-500', // Autonomie
    'from-cyan-400 to-blue-400',     // Centralisation des outils
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}>
      {/* Cercles décoratifs SVG */}
      <svg className="absolute top-[-80px] left-[-80px] opacity-30 z-0" width="300" height="300">
        <circle cx="150" cy="150" r="120" fill="#fff" fillOpacity="0.15" />
      </svg>
      <svg className="absolute bottom-[-100px] right-[-100px] opacity-30 z-0" width="350" height="350">
        <circle cx="175" cy="175" r="150" fill="#fff" fillOpacity="0.10" />
      </svg>
      <svg className="absolute top-[30%] left-[-60px] opacity-20 z-0" width="180" height="180">
        <circle cx="90" cy="90" r="80" fill="#fff" fillOpacity="0.10" />
      </svg>
      <svg className="absolute bottom-[20%] right-[-40px] opacity-20 z-0" width="120" height="120">
        <circle cx="60" cy="60" r="50" fill="#fff" fillOpacity="0.10" />
      </svg>

      {/* Header */}
      <header className="bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="MusiqueConnect" className="h-10" />
              <h1 className="text-2xl font-bold text-white">MusiqueConnect</h1>
            </div>
            <div className="flex gap-6 items-center">
              <button
                onClick={handlePricing}
                className="text-white font-medium hover:text-white/80 transition-colors"
              >
                Prix
              </button>
              <button
                onClick={handleQuickStart}
                disabled={isLoading}
                className="text-white font-medium hover:text-white/80 transition-colors"
              >
                {isLoading ? 'Redirection...' : 'Inscription'}
              </button>
              <button
                onClick={handleLogin}
                className="bg-white text-[#1473AA] px-6 py-2 rounded-lg font-medium hover:bg-[#e6f0f7] focus:ring-2 focus:ring-white focus:ring-offset-2 transition-colors shadow-md"
              >
                Connexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero + Impact + CTA compactés */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
            Gérez, organisez et innovez en modernisant la gestion de votre département.<br />
            <span className="block mt-2 text-lg md:text-xl font-normal text-white/90">Tout ce dont vous avez besoin au même endroit.</span>
          </h1>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <span className="backdrop-blur-md bg-gradient-to-r from-yellow-400 to-yellow-500 border border-white/30 rounded-full px-4 py-2 text-base font-semibold text-white shadow flex items-center justify-center min-w-[120px] text-center">Rétroaction améliorée</span>
            <span className="backdrop-blur-md bg-gradient-to-r from-emerald-400 to-teal-400 border border-white/30 rounded-full px-4 py-2 text-base font-semibold text-white shadow flex items-center justify-center min-w-[120px] text-center">Communication facilitée</span>
            <span className="backdrop-blur-md bg-gradient-to-r from-cyan-400 to-blue-500 border border-white/30 rounded-full px-4 py-2 text-base font-semibold text-white shadow flex items-center justify-center min-w-[120px] text-center">Centralisation des outils</span>
            <span className="backdrop-blur-md bg-gradient-to-r from-violet-400 to-purple-500 border border-white/30 rounded-full px-4 py-2 text-base font-semibold text-white shadow flex items-center justify-center min-w-[120px] text-center">Autonomie</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-2">
            <button
              onClick={handleQuickStart}
              disabled={isLoading}
              className="bg-white text-[#1473AA] px-8 py-3 rounded-full font-bold text-base shadow hover:bg-[#e6f0f7] focus:ring-2 focus:ring-white focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1473AA] mr-2"></div>
                  Connexion...
                </div>
              ) : (
                <div className="flex items-center">
                  Commencer Gratuitement
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              )}
            </button>
            <button 
              onClick={handlePricing}
              className="border border-white text-white px-8 py-3 rounded-full font-bold text-base shadow hover:bg-[#125e8c] focus:ring-2 focus:ring-white focus:ring-offset-2 transition-colors"
            >
              Voir les Prix
            </button>
          </div>
        </div>
      </section>

      {/* Features Section compacte avec bulles décoratives */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white/10 relative z-10 overflow-visible">
        {/* 4 bulles colorées décoratives en haut, plus petites */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-8 flex gap-4 z-10 pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 opacity-80 shadow"></div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 opacity-80 shadow -mt-2"></div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 opacity-80 shadow -mt-4"></div>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 opacity-80 shadow mt-1"></div>
        </div>
        <div className="max-w-5xl mx-auto relative z-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Fonctionnalités Innovantes
            </h2>
            <p className="text-base text-white/80 max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour moderniser l'enseignement musical au Québec
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/20 p-4 rounded-xl shadow hover:shadow-xl transition-shadow border border-white/30 relative z-20 flex flex-col items-center">
                <div className="mb-2 flex justify-center">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-1 text-center">
                  {feature.title}
                </h3>
                <p className="text-white/80 text-sm text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer compact */}
      <footer className="bg-transparent text-white py-12 border-t border-white/20 relative z-10 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="flex items-center space-x-3 mb-2">
            <img src={logo} alt="MusiqueConnect Logo" className="h-12 w-auto" />
            <span className="text-lg font-bold mx-3">MusiqueConnect</span>
            <img src={logoGuillaumeHetu} alt="Guillaume Hétu Logo" className="h-12 w-auto ml-3" />
          </div>
          <p className="text-white/80 mb-0">
            Gérez, organisez et innovez en modernisant la gestion de votre département. Tout ce dont vous avez besoin au même endroit.
          </p>
          <p className="text-white/50 mt-1">&copy; 2024 MusiqueConnect. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
} 