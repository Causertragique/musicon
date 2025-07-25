import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/firebaseService';
import { checkSchoolAccess, createSchoolUser, validateDomain } from '../services/domainService';
import { secureLog } from '../utils/security';
import { auth } from '../config/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface CreateAccountData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'teacher' | 'student';
  instrument?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithMicrosoft: () => Promise<boolean>;
  loginWithDomain: (domain: string) => Promise<boolean>;
  createAccount: (accountData: CreateAccountData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => void;
  switchRole: (role: 'teacher' | 'student' | 'admin') => void;
  availableRoles: ('teacher' | 'student' | 'admin')[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utilisateurs fictifs pour la démonstration
const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Dubois',
    email: 'teacher@demo.com',
    role: 'teacher'
  },
  {
    id: '2',
    firstName: 'Emma',
    lastName: 'Martin',
    email: 'student1@demo.com',
    role: 'student',
    groupId: 'group118',
    instrument: 'Piano',
    picture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '3',
    firstName: 'Lucas',
    lastName: 'Moreau',
    email: 'student2@demo.com',
    role: 'student',
    groupId: 'group119',
    instrument: 'Guitare',
    picture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '4',
    firstName: 'Sofia',
    lastName: 'Rodriguez',
    email: 'student3@demo.com',
    role: 'student',
    groupId: 'group218',
    instrument: 'Violon',
    picture: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Restaurer l'utilisateur depuis le localStorage au démarrage
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Listener Firebase Auth pour synchroniser l'état d'authentification
  useEffect(() => {
    console.log('🔍 === DÉBUT DU LISTENER FIREBASE AUTH ===');
    
    // Vérifier que auth existe avant d'utiliser onAuthStateChanged
    if (!auth) {
      console.log('⚠️ Firebase Auth non initialisé (mode démonstration probable)');
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('🔄 Firebase Auth state changed:', firebaseUser ? firebaseUser.email : 'null');
      
      if (firebaseUser) {
        console.log('✅ Utilisateur Firebase connecté:', firebaseUser.email);
        
        try {
          // Récupérer les données utilisateur depuis Firestore
          const allUsers = await userService.getAll();
          const firestoreUser = allUsers.find(u => u.email === firebaseUser.email);
          
          if (firestoreUser) {
            console.log('✅ Utilisateur trouvé dans Firestore:', firestoreUser);
            setUser(firestoreUser);
          } else {
            console.log('⚠️ Utilisateur Firebase connecté mais pas trouvé dans Firestore');
            // Créer l'utilisateur dans Firestore si nécessaire
            const newUser = {
              firstName: firebaseUser.displayName?.split(' ')[0] || 'Utilisateur',
              lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || 'Google',
              email: firebaseUser.email || '',
              role: 'teacher' as const,
              picture: firebaseUser.photoURL || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
            };
            
            const userId = await userService.create(newUser);
            const createdUser = await userService.getById(userId);
            if (createdUser) {
              console.log('✅ Nouvel utilisateur créé dans Firestore:', createdUser);
              setUser(createdUser);
            }
          }
        } catch (error) {
          console.error('❌ Erreur lors de la récupération des données utilisateur:', error);
        }
      } else {
        console.log('❌ Aucun utilisateur Firebase connecté');
        setUser(null);
      }
    });

    // Cleanup du listener
    return () => {
      console.log('🧹 Nettoyage du listener Firebase Auth');
      unsubscribe();
    };
  }, []);

  // Sauvegarder l'utilisateur dans le localStorage quand il change
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Fonction pour changer de rôle (spécialement pour info@guillaumehetu.com, guillaumehetu1@gmail.com et educrm.ca)
  const switchRole = async (role: 'teacher' | 'student' | 'admin') => {
    if (user && (user.email === 'info@guillaumehetu.com' || user.email === 'guillaumehetu1@gmail.com' || user.email.endsWith('@educrm.ca'))) {
      // Vérifications de sécurité
      if (role === 'admin' && user.role === 'student') {
        console.warn('Tentative d\'élévation de privilèges bloquée: un élève ne peut pas devenir admin');
        return; // Bloquer l'élévation de privilèges
      }
      
      if (role === 'teacher' && user.role === 'student') {
        console.warn('Tentative d\'élévation de privilèges bloquée: un élève ne peut pas devenir enseignant');
        return; // Bloquer l'élévation de privilèges
      }
      
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      
      // Mettre à jour dans Firebase
      try {
        await userService.update(user.id, { role });
        console.log('Rôle mis à jour dans Firebase');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du rôle:', error);
      }
    }
  };

  // Rôles disponibles pour info@guillaumehetu.com et educrm.ca
  const availableRoles: ('teacher' | 'student' | 'admin')[] = ['teacher', 'student', 'admin'];

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔍 === DÉBUT DE LA FONCTION LOGIN DU CONTEXTE PERSONNALISÉ ===');
    console.log('📧 Email reçu:', email);
    console.log('🔑 Mot de passe reçu:', password);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    try {
      console.log('Tentative de connexion avec:', email, 'mot de passe:', password);
      
      // Pour info@guillaumehetu.com et guillaumehetu1@gmail.com, accepter le mot de passe spécifique
      if (email === 'info@guillaumehetu.com' || email === 'guillaumehetu1@gmail.com') {
        console.log('Email reconnu comme compte administrateur:', email);
        
        if (password.trim() === 'Appmus2025') {
          console.log('Mot de passe correct pour le compte administrateur');
          // Vérifier si l'utilisateur existe dans Firebase
          const allUsers = await userService.getAll();
          let adminUser = allUsers.find(u => u.email === email);
          
          if (!adminUser) {
            console.log('Création de l\'utilisateur administrateur dans Firebase');
            // Créer l'utilisateur dans Firebase
            const userId = await userService.create({
              firstName: 'Guillaume',
              lastName: 'Hétu',
              email: email,
              role: 'admin', // Rôle par défaut
              picture: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
            });
            
            adminUser = {
              id: userId,
              firstName: 'Guillaume',
              lastName: 'Hétu',
              email: email,
              role: 'admin',
              picture: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
            };
          } else {
            console.log('Utilisateur administrateur trouvé dans Firebase');
          }
          
          setUser(adminUser);
          console.log('Connexion réussie pour le compte administrateur');
          console.log('=== FIN DE LA FONCTION LOGIN (SUCCÈS) ===');
          return true;
        } else {
          console.log('Mot de passe incorrect pour le compte administrateur');
          console.log('=== FIN DE LA FONCTION LOGIN (ÉCHEC) ===');
          return false;
        }
      }
      
      // Pour les utilisateurs avec le domaine educrm.ca, accès gratuit
      if (email.endsWith('@educrm.ca')) {
        const allUsers = await userService.getAll();
        let educrmUser = allUsers.find(u => u.email === email);
        
        if (!educrmUser) {
          // Extraire le nom depuis l'email
          const emailParts = email.split('@')[0].split('.');
          const firstName = emailParts[0] ? emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1) : 'Utilisateur';
          const lastName = emailParts[1] ? emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1) : 'Educrm';
          
          // Créer l'utilisateur dans Firebase
          const userId = await userService.create({
            firstName,
            lastName,
            email,
            role: 'admin', // Rôle admin par défaut pour les utilisateurs educrm.ca
            picture: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
          });
          
          educrmUser = {
            id: userId,
            firstName,
            lastName,
            email,
            role: 'admin',
            picture: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
          };
        }
        
        setUser(educrmUser);
        return true;
      }
      
      // Pour tous les autres utilisateurs, rediriger vers Google
      console.log('Email non reconnu, redirection vers Google recommandée');
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    }
  };

  const createAccount = async (accountData: CreateAccountData): Promise<boolean> => {
    try {
      // Vérifier si l'email existe déjà dans Firebase
      const allUsers = await userService.getAll();
      const existingUser = allUsers.find(u => u.email === accountData.email);
      
      if (existingUser) {
        return false; // Email déjà utilisé
      }

      // Créer le nouvel utilisateur dans Firebase
      const userId = await userService.create({
        firstName: accountData.firstName,
        lastName: accountData.lastName,
        email: accountData.email,
        role: accountData.role,
        instrument: accountData.instrument,
        // Assigner une photo par défaut selon le rôle
        picture: accountData.role === 'teacher' 
          ? 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
          : 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
      });

      // Récupérer l'utilisateur créé
      const newUser = await userService.getById(userId);
      if (newUser) {
        setUser(newUser);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    console.log('🔍 === DÉBUT DE LA FONCTION LOGIN WITH GOOGLE ===');
    
    // Vérifier si nous sommes en mode démonstration
    const isDemoMode = !auth || import.meta.env.VITE_FIREBASE_API_KEY === 'test-api-key';
    
    if (isDemoMode) {
      console.log('🎭 Mode démonstration - Connexion Google simulée');
      
      // Simuler une connexion Google réussie
      const mockGoogleUser: User = {
        id: 'google-demo-user',
        firstName: 'Guillaume',
        lastName: 'Hétu',
        email: 'guillaume.hetu@musiqueconnect.ca',
        role: 'teacher',
        picture: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
      };
      
      setUser(mockGoogleUser);
      console.log('✅ Connexion Google simulée réussie');
      console.log('=== FIN DE LA FONCTION LOGIN WITH GOOGLE (SUCCÈS DÉMO) ===');
      return true;
    }
    
    try {
      // Utiliser Firebase Auth pour Google
      console.log('📦 Import des modules Firebase...');
      const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
      
      console.log('📦 Imports Firebase Auth réussis');
      console.log('🔧 Auth object:', auth);
      console.log('🔧 Auth currentUser:', auth?.currentUser);
      
      const provider = new GoogleAuthProvider();
      
      // Ajouter les scopes nécessaires pour Google Classroom
      provider.addScope('https://www.googleapis.com/auth/classroom.courses.readonly');
      provider.addScope('https://www.googleapis.com/auth/classroom.rosters.readonly');
      provider.addScope('https://www.googleapis.com/auth/classroom.coursework.me');
      provider.addScope('https://www.googleapis.com/auth/classroom.profile.emails');
      provider.addScope('https://www.googleapis.com/auth/classroom.profile.photos');
      
      console.log('🔐 Scopes Google Classroom ajoutés');
      console.log('🚀 Tentative de connexion avec popup...');
      
      // Vérifier que auth existe avant d'utiliser signInWithPopup
      if (!auth) {
        console.log('⚠️ Firebase Auth non initialisé (mode démonstration probable)');
        console.log('=== FIN DE LA FONCTION LOGIN WITH GOOGLE (AUTH NON INITIALISÉ) ===');
        return false;
      }
      
      const result = await signInWithPopup(auth, provider);
      
      console.log('✅ Connexion Google réussie');
      console.log('👤 Utilisateur Firebase:', result.user);
      console.log('📧 Email:', result.user.email);
      console.log('🖼️ Photo:', result.user.photoURL);
      
      if (result.user) {
        // Vérifier si l'utilisateur existe dans Firestore
        console.log('🔍 Vérification de l\'utilisateur dans Firestore...');
        try {
          const allUsers = await userService.getAll();
          console.log('📋 Tous les utilisateurs:', allUsers);
          let googleUser = allUsers.find(u => u.email === result.user.email);
          console.log('🔍 Utilisateur trouvé dans Firestore:', googleUser);

          // === LOGIQUE DE RÔLE FORCÉE SELON L'EMAIL ===
          let forcedRole: 'admin' | 'teacher' | undefined = undefined;
          if (result.user.email === 'guillaumehetu1@gmail.com') {
            forcedRole = 'admin';
          } else if (result.user.email === 'guillaume.hetu@educrm.ca') {
            forcedRole = 'teacher';
          }

          if (!googleUser) {
            console.log('🆕 Création d\'un nouvel utilisateur dans Firestore...');
            // Créer l'utilisateur dans Firestore
            const userId = await userService.create({
              firstName: result.user.displayName?.split(' ')[0] || 'Utilisateur',
              lastName: result.user.displayName?.split(' ').slice(1).join(' ') || 'Google',
              email: result.user.email || '',
              role: forcedRole || 'teacher', // Par défaut, on assigne le rôle de professeur
              picture: result.user.photoURL || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
            });
            console.log('✅ Utilisateur créé avec ID:', userId);
            googleUser = {
              id: userId,
              firstName: result.user.displayName?.split(' ')[0] || 'Utilisateur',
              lastName: result.user.displayName?.split(' ').slice(1).join(' ') || 'Google',
              email: result.user.email || '',
              role: forcedRole || 'teacher',
              picture: result.user.photoURL || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
            };
          } else if (forcedRole && googleUser.role !== forcedRole) {
            // Si l'utilisateur existe mais n'a pas le bon rôle, on le met à jour
            await userService.update(googleUser.id, { role: forcedRole });
            googleUser = { ...googleUser, role: forcedRole };
          }

          console.log('👤 Utilisateur final à définir:', googleUser);
          setUser(googleUser);
          console.log('✅ Utilisateur défini dans le contexte');
          console.log('=== FIN DE LA FONCTION LOGIN WITH GOOGLE (SUCCÈS) ===');
          return true;
        } catch (firestoreError) {
          console.error('❌ Erreur lors de l\'accès à Firestore:', firestoreError);
          console.log('=== FIN DE LA FONCTION LOGIN WITH GOOGLE (ERREUR FIRESTORE) ===');
          return false;
        }
      }
      
      console.log('❌ Aucun utilisateur dans le résultat');
      console.log('=== FIN DE LA FONCTION LOGIN WITH GOOGLE (ÉCHEC) ===');
      return false;
    } catch (error) {
      console.error('❌ Erreur lors de la connexion Google:', error);
      console.log('=== FIN DE LA FONCTION LOGIN WITH GOOGLE (ERREUR) ===');
      return false;
    }
  };

  const loginWithMicrosoft = async (): Promise<boolean> => {
    console.log('🔍 === DÉBUT DE LA FONCTION LOGIN WITH MICROSOFT ===');
    try {
      console.log('Tentative de connexion avec Microsoft');
      
      // Simulation de connexion Microsoft
      const mockMicrosoftUser: User = {
        id: 'microsoft-user',
        firstName: 'Microsoft',
        lastName: 'User',
        email: 'microsoft@example.com',
        role: 'teacher',
        picture: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
      };
      
      setUser(mockMicrosoftUser);
      console.log('Connexion Microsoft réussie');
      console.log('=== FIN DE LA FONCTION LOGIN WITH MICROSOFT (SUCCÈS) ===');
      return true;
    } catch (error) {
      console.error('Erreur lors de la connexion Microsoft:', error);
      console.log('=== FIN DE LA FONCTION LOGIN WITH MICROSOFT (ÉCHEC) ===');
      return false;
    }
  };

  const loginWithDomain = async (domain: string): Promise<boolean> => {
    console.log('🔍 === DÉBUT DE LA FONCTION LOGIN WITH DOMAIN ===');
    console.log('🌐 Domaine reçu:', domain);
    
    try {
      // Validation du domaine
      if (!validateDomain(domain)) {
        console.log('Domaine invalide:', domain);
        return false;
      }

      // Vérification de l'accès à l'école
      const accessCheck = checkSchoolAccess(domain);
      
      if (!accessCheck.hasAccess) {
        console.log('Accès refusé pour le domaine:', domain, 'Raison:', accessCheck.reason);
        return false;
      }

      const school = accessCheck.school!;
      secureLog('info', 'Connexion par domaine réussie', { domain, schoolId: school.id });

      // Créer un utilisateur temporaire pour l'école
      const tempUser: User = {
        id: `temp_${school.id}_${Date.now()}`,
        firstName: 'Utilisateur',
        lastName: school.name,
        email: `user@${domain}`,
        role: 'teacher', // Par défaut
        schoolId: school.id,
        schoolDomain: domain,
        subscriptionPlan: school.subscriptionPlan,
        picture: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
      };

      setUser(tempUser);
      console.log('Connexion par domaine réussie');
      console.log('=== FIN DE LA FONCTION LOGIN WITH DOMAIN (SUCCÈS) ===');
      return true;

    } catch (error) {
      console.error('Erreur lors de la connexion par domaine:', error);
      secureLog('error', 'Erreur lors de la connexion par domaine', { domain, error });
      console.log('=== FIN DE LA FONCTION LOGIN WITH DOMAIN (ÉCHEC) ===');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      
      // Mettre à jour dans Firebase
      try {
        await userService.update(user.id, profileData);
        console.log('Profil mis à jour dans Firebase');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      loginWithGoogle, 
      loginWithMicrosoft, 
      loginWithDomain,
      createAccount,
      logout, 
      updateProfile,
      switchRole,
      availableRoles
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}