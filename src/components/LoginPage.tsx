import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Music, Mail, Lock, Eye, EyeOff, Globe } from 'lucide-react';

// Composant pour une note animée aléatoire
function AnimatedNote() {
  // Position équilibrée sur la page (évite les bords)
  const [x] = useState(10 + Math.random() * 75); // % left (10-85)
  const [y] = useState(10 + Math.random() * 75); // % top (10-85)
  const [size] = useState(18 + Math.random() * 18); // px (18-36)
  const [opacity, setOpacity] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    setTimeout(() => setOpacity(0.4), 200); // fade in
    const fadeOutTimeout = setTimeout(() => setOpacity(0), 3500); // fade out
    const removeTimeout = setTimeout(() => setVisible(false), 4000); // disparition
    return () => {
      clearTimeout(fadeOutTimeout);
      clearTimeout(removeTimeout);
    };
  }, []);
  if (!visible) return null;
  return (
    <svg
      className="absolute animate-note-float pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, opacity, width: size, height: size, transition: 'opacity 1.2s' }}
      viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M9 19V6l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMusiqueConnectDomain, setIsMusiqueConnectDomain] = useState(false);
  const [notes, setNotes] = useState<number[]>([]);
  
  const { login, loginWithGoogle, loginWithMicrosoft } = useAuth();

  useEffect(() => {
    // Vérifier si nous sommes sur le domaine musiqueconnect.app
    setIsMusiqueConnectDomain(window.location.hostname === 'musiqueconnect.app');
  }, []);

  useEffect(() => {
    // Générer des notes animées aléatoires
    const interval = setInterval(() => {
      setNotes(prev => [...prev, Date.now()]);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Email ou mot de passe incorrect');
      }
    } catch (error) {
      setError('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const success = await loginWithGoogle();
      if (!success) {
        setError('Erreur lors de la connexion Google');
      }
    } catch (error) {
      setError('Erreur lors de la connexion Google');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const success = await loginWithMicrosoft();
      if (!success) {
        setError('Erreur lors de la connexion Microsoft');
      }
    } catch (error) {
      setError('Erreur lors de la connexion Microsoft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#1473AA' }}>
      {/* Notes de musique animées aléatoires */}
      {notes.map((id) => <AnimatedNote key={id} />)}
      {/* Plus d'image clarinette ni overlay dégradé animé */}
      {/* Notes de musique animées (optionnelles, à commenter si non souhaité) */}
      <svg className="absolute left-10 top-20 w-10 h-10 text-white opacity-40 animate-note-float" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 19V6l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      <svg className="absolute right-16 bottom-24 w-8 h-8 text-white opacity-30 animate-note-float2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 19V6l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      <svg className="absolute left-1/2 top-1/3 w-6 h-6 text-white opacity-20 animate-note-float3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 19V6l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      {/* Carte de connexion glassmorphism */}
      <div className="max-w-lg w-full rounded-2xl shadow-2xl p-8 relative z-20 backdrop-blur-lg bg-white/70 border border-white/30 animate-fade-in">
        {/* Logo et slogan */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="flex items-center justify-center mb-4">
            <img src="/logos/NoTitle.png" alt="MusiqueConnect" className="h-24 mx-auto animate-fade-in" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1473AA] mb-2 animate-fade-in-up">
            MusiqueConnect
          </h1>
          <p className="text-lg font-medium text-gray-700 animate-fade-in-up delay-100">
            Rejoignez la révolution musicale au Québec&nbsp;!
          </p>
        </div>

        {/* Formulaire de connexion par email */}
        <form onSubmit={handleLogin} className="space-y-6 animate-fade-in-up delay-150">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse e-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1473AA] text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-[#1473AA] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Connexion en cours...
              </div>
            ) : (
              'Se Connecter'
            )}
          </button>
        </form>

        {/* Séparateur */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">ou</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Boutons de connexion sociale */}
        <div className="space-y-3 animate-fade-in-up delay-200">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 border border-[#1473AA] rounded-lg font-semibold text-[#1473AA] bg-white hover:bg-[#1473AA] hover:text-white focus:ring-2 focus:ring-[#1473AA] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>
        </div>

        {/* Informations de sécurité */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <Lock className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Connexion Sécurisée
              </h3>
              <p className="text-xs text-blue-700">
                Votre connexion est protégée par chiffrement SSL et authentification sécurisée.
              </p>
            </div>
          </div>
        </div>

        {/* Liens utiles */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Nouvelle école ?{' '}
            <button className="text-blue-600 hover:underline">
              Contactez-nous
            </button>
          </p>
          
          {/* Bouton pour accéder à la page d'accueil (seulement sur musiqueconnect.app) */}
          {isMusiqueConnectDomain && (
            <div className="mt-4">
              <button 
                onClick={() => window.location.href = '/?home=true'}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Voir la page d'accueil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}