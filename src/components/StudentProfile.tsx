import React, { useState } from 'react';
import { User, Camera, Save, X, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import AppSettings from './AppSettings';

export default function StudentProfile() {
  const { user, updateProfile } = useAuth();
  const { groups } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'settings'>('profile');
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    instrument: user?.instrument || '',
    picture: user?.picture || ''
  });

  const studentGroup = groups.find(group => group.id === user?.groupId);

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
      instrument: user?.instrument || '',
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

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mon Profil</h2>
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
        <div className="card">
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
                    className="input"
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
                    className="input"
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
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="instrument" className="block text-sm font-medium text-gray-700 mb-2">
                  Instrument Principal
                </label>
                <select
                  id="instrument"
                  value={formData.instrument}
                  onChange={(e) => setFormData(prev => ({ ...prev, instrument: e.target.value }))}
                  className="input"
                  required
                >
                  <option value="">Sélectionner un instrument</option>
                  <option value="Piano">Piano</option>
                  <option value="Guitare">Guitare</option>
                  <option value="Violon">Violon</option>
                  <option value="Violoncelle">Violoncelle</option>
                  <option value="Flûte">Flûte</option>
                  <option value="Clarinette">Clarinette</option>
                  <option value="Saxophone">Saxophone</option>
                  <option value="Saxophone Alto">Saxophone Alto</option>
                  <option value="Saxophone Tenor">Saxophone Tenor</option>
                  <option value="Trompette">Trompette</option>
                  <option value="Trombone">Trombone</option>
                  <option value="Euphonium">Euphonium</option>
                  <option value="Tuba">Tuba</option>
                  <option value="Batterie">Batterie</option>
                  <option value="Chant">Chant</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-outline flex items-center gap-2"
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

              {/* Informations personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Prénom</h3>
                  <p className="text-lg text-gray-900">{user.firstName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Nom de famille</h3>
                  <p className="text-lg text-gray-900">{user.lastName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Adresse e-mail</h3>
                  <p className="text-lg text-gray-900">{user.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Groupe</h3>
                  <p className="text-lg text-gray-900">{studentGroup?.name || 'Aucun groupe assigné'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Instrument Principal</h3>
                  <p className="text-lg text-gray-900">{user.instrument || 'Non spécifié'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSection === 'settings' && (
        <div className="card">
          <AppSettings userRole="student" />
        </div>
      )}
    </div>
  );
}