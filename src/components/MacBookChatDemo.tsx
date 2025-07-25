import React from 'react';
import MacBookChat from './MacBookChat';

export default function MacBookChatDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            MusicChat sur MacBook Pro
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Découvrez notre interface de clavardage moderne intégrée dans un mockup MacBook Pro 16 pouces. 
            Design inspiré de Snapchat avec des couleurs jaune-orange vibrantes.
          </p>
        </div>

        {/* MacBook Chat Component */}
        <MacBookChat />

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white text-xl">🎵</span>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Design Snapchat</h3>
            <p className="text-gray-300">
              Interface moderne avec des couleurs jaune-orange vibrantes, bulles arrondies et animations fluides.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white text-xl">💬</span>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Réactions Interactives</h3>
            <p className="text-gray-300">
              Système de réactions avec pouce en l'air, cœur, étoile et éclair pour exprimer vos émotions.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-white text-xl">📱</span>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Interface Responsive</h3>
            <p className="text-gray-300">
              Design adaptatif qui s'intègre parfaitement dans l'écran du MacBook Pro avec un positionnement précis.
            </p>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-16 bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Détails Techniques</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-3">Fonctionnalités</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Messages en temps réel avec horodatage</li>
                <li>• Système de réactions interactives</li>
                <li>• Interface utilisateur intuitive</li>
                <li>• Design responsive et moderne</li>
                <li>• Animations fluides et transitions</li>
                <li>• Support des emojis et caractères spéciaux</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Technologies</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• React avec TypeScript</li>
                <li>• Tailwind CSS pour le styling</li>
                <li>• Lucide React pour les icônes</li>
                <li>• Positionnement absolu pour l'intégration</li>
                <li>• Gestion d'état avec useState et useRef</li>
                <li>• Mockup MacBook Pro haute résolution</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 