import React, { useState } from 'react';
import { User, Camera, Save, X, Settings, Shield, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AppSettings from './AppSettings';
import { getAuth, PhoneAuthProvider, multiFactor, RecaptchaVerifier } from 'firebase/auth';

export default function TeacherProfile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'settings'>('profile');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    picture: user?.picture || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      picture: user?.picture || ''
    });
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData(prev => ({ ...prev, picture: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Double authentification MFA ---
  async function handleEnableMFA() {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert("Utilisateur non connecté.");
        return;
      }

      // @ts-ignore
      if (!window.recaptchaVerifier) {
        // @ts-ignore
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
          'size': 'invisible'
        }, auth);
      }

      const phoneNumber = prompt("Entrez votre numéro de téléphone (ex: +15145551234)");
      if (!phoneNumber) {
        alert("Numéro de téléphone requis.");
        return;
      }

      // @ts-ignore - Utilisation de l'API Firebase MFA
      const session = await multiFactor(user).getSession();
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        { phoneNumber, session },
        // @ts-ignore
        window.recaptchaVerifier
      );

      const verificationCode = prompt("Entrez le code reçu par SMS");
      if (!verificationCode) {
        alert("Code requis.");
        return;
      }

      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      // @ts-ignore - Enroll avec credential
      await multiFactor(user).enroll(cred, "Téléphone principal");
      alert("Multi-facteur activé avec succès !");
    } catch (error) {
      console.error('Erreur MFA:', error);
      alert("Erreur lors de l'activation du MFA. Vérifiez votre numéro de téléphone.");
    }
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {!isEditing && activeSection === 'profile' && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary"
          >
            Modifier le Profil
          </button>
        )}
      </div>

      {/* Navigation entre sections */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveSection('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Informations Personnelles
            </div>
          </button>
          <button
            onClick={() => setActiveSection('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === 'settings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Paramètres de l'Application
            </div>
          </button>
        </nav>
      </div>

      {/* Contenu des sections */}
      {activeSection === 'profile' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo de profil */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {formData.picture ? (
                      <img
                        src={formData.picture}
                        alt="Photo de profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-600">Cliquez sur l'icône pour changer votre photo</p>
              </div>

              {/* Informations personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de famille
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Photo de profil */}
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt="Photo de profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Informations affichées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <p className="text-gray-900">{user.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom de famille</label>
                  <p className="text-gray-900">{user.lastName}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse e-mail</label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>

              {/* Section Sécurité */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Sécurité
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Double authentification (MFA)</h4>
                        <p className="text-sm text-gray-600">Sécurisez votre compte avec un code SMS</p>
                      </div>
                    </div>
                    <button
                      onClick={handleEnableMFA}
                      className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-sm"
                    >
                      Activer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSection === 'settings' && (
        <AppSettings userRole="teacher" />
      )}

      {/* Container pour reCAPTCHA */}
      <div id="recaptcha-container"></div>
    </div>
  );
}