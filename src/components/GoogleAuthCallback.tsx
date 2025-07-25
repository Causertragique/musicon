import React, { useEffect, useState } from 'react';
import { GoogleAuthService } from '../services/googleAuth';

const GoogleAuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Authentification en cours...');

  console.log('🔍 === GOOGLE AUTH CALLBACK COMPONENT ===');
  console.log('📍 URL actuelle:', window.location.href);
  console.log('🔍 Paramètres URL:', window.location.search);

  useEffect(() => {
    console.log('🔄 === DÉBUT DU CALLBACK GOOGLE ===');
    const handleCallback = async () => {
      try {
        console.log('📦 Récupération de l\'instance GoogleAuthService...');
        const googleAuth = GoogleAuthService.getInstance();
        console.log('✅ Instance GoogleAuthService récupérée');
        
        console.log('🚀 Appel de handleAuthCallback...');
        await googleAuth.handleAuthCallback();
        
        // Si on arrive ici, c'est que la redirection n'a pas fonctionné
        console.log('⚠️ Redirection non effectuée, redirection manuelle...');
        setStatus('success');
        setMessage('Authentification réussie ! Redirection...');
        
        // Redirection manuelle après 2 secondes
        setTimeout(() => {
          console.log('🔄 Redirection manuelle vers /dashboard...');
          window.location.href = '/dashboard';
        }, 2000);
        
      } catch (error) {
        console.error('❌ Erreur lors du callback Google:', error);
        setStatus('error');
        setMessage('Erreur lors de l\'authentification. Redirection...');
        
        // Redirection vers le dashboard avec erreur
        setTimeout(() => {
          console.log('🔄 Redirection vers /dashboard avec erreur...');
          window.location.href = '/dashboard?error=auth_failed';
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-blue-600">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            )}
            {status === 'success' && (
              <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === 'error' && (
              <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === 'loading' && 'Authentification Google'}
            {status === 'success' && 'Authentification réussie'}
            {status === 'error' && 'Erreur d\'authentification'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthCallback; 