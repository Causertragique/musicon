import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
// import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
// import { auth, db } from '../config/firebase';
import { db } from '../config/firebase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Lock, Mail, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import Logo from './Logo';

interface InvitationInfo {
  teacherId: string;
  teacherName: string;
  invitationId: string;
}

export default function StudentJoinPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [invitationCode, setInvitationCode] = useState(searchParams.get('code') || '');
  const [invitationInfo, setInvitationInfo] = useState<InvitationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'code' | 'form'>('code');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validateInvitationCode = async () => {
    if (!invitationCode.trim()) {
      setError('Veuillez entrer un code d\'invitation');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const functions = getFunctions();
      const validateInvitationCode = httpsCallable(functions, 'validateInvitationCode');
      
      const result = await validateInvitationCode({ code: invitationCode });
      const data = result.data as InvitationInfo;
      
      setInvitationInfo(data);
      setStep('form');
      setSuccess('Code d\'invitation valide ! Vous pouvez maintenant créer votre compte.');
    } catch (error: any) {
      console.error('Erreur lors de la validation du code:', error);
      setError(error.message || 'Code d\'invitation invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Créer le compte utilisateur
      // const userCredential = await createUserWithEmailAndPassword(
      //   auth,
      //   formData.email,
      //   formData.password
      // );

      // const user = userCredential.user;

      // Mettre à jour le profil avec le nom
      // await updateProfile(user, {
      //   displayName: `${formData.firstName} ${formData.lastName}`
      // });

      // Créer le document utilisateur dans Firestore
      await setDoc(doc(db, 'users', 'user-uid'), {
        uid: 'user-uid',
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'student',
        teacherId: invitationInfo?.teacherId,
        createdAt: new Date(),
        isActive: true
      });

      setSuccess('Compte créé avec succès ! Redirection...');
      
      // Rediriger vers le tableau de bord élève après 2 secondes
      setTimeout(() => {
        navigate('/student-dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Erreur lors de la création du compte:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setError('Cette adresse email est déjà utilisée');
      } else if (error.code === 'auth/weak-password') {
        setError('Le mot de passe est trop faible');
      } else {
        setError('Erreur lors de la création du compte');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo variant="hero" className="h-16" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Rejoindre une Classe
          </h1>
          <p className="text-gray-600">
            {step === 'code' 
              ? 'Entrez le code d\'invitation de votre enseignant'
              : `Vous rejoignez la classe de ${invitationInfo?.teacherName}`
            }
          </p>
        </div>

        {/* Messages d'erreur et de succès */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Étape 1: Code d'invitation */}
        {step === 'code' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code d'Invitation
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                  placeholder="Ex: ABC12345"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg font-mono tracking-wider"
                  maxLength={8}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Le code vous a été fourni par votre enseignant
              </p>
            </div>

            <button
              onClick={validateInvitationCode}
              disabled={loading || !invitationCode.trim()}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserCheck className="w-5 h-5" />
              )}
              {loading ? 'Vérification...' : 'Valider le Code'}
            </button>
          </div>
        )}

        {/* Étape 2: Formulaire d'inscription */}
        {step === 'form' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <User className="w-5 h-5" />
                )}
                {loading ? 'Création du compte...' : 'Créer mon Compte'}
              </button>
            </form>
          </div>
        )}

        {/* Lien de retour */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
} 