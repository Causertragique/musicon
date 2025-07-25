// import { auth } from '../config/firebase';
// import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../types';

const demoUsers = [
  {
    email: 'teacher@demo.com',
    password: 'demo123',
    firstName: 'Marie',
    lastName: 'Dupont',
    role: 'teacher' as const,
    instrument: 'Piano',
    picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    email: 'student@demo.com',
    password: 'demo123',
    firstName: 'Jean',
    lastName: 'Martin',
    role: 'student' as const,
    instrument: 'Guitare',
    groupId: '1',
    picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    email: 'sophie@demo.com',
    password: 'demo123',
    firstName: 'Sophie',
    lastName: 'Bernard',
    role: 'student' as const,
    instrument: 'Violon',
    groupId: '1',
    picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    email: 'lucas@demo.com',
    password: 'demo123',
    firstName: 'Lucas',
    lastName: 'Petit',
    role: 'student' as const,
    instrument: 'Batterie',
    groupId: '2',
    picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    id: 'student-1',
    firstName: 'Thomas',
    lastName: 'Dupont',
    email: 'thomas.dupont@example.com',
    role: 'student' as const,
    instrument: 'Clarinette',
    groupId: 'group-1',
    picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    id: 'student-2',
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'sophie.martin@example.com',
    role: 'student' as const,
    instrument: 'Saxophone Alto',
    groupId: 'group-1',
    picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isActive: true
  }
];

export async function createDemoUsers() {
  console.log('🚀 Création des utilisateurs de démonstration...');
  
  for (const userData of demoUsers) {
    try {
      console.log(`📝 Création de ${userData.firstName} ${userData.lastName}...`);
      
      // Créer l'utilisateur directement dans Firestore (sans Firebase Auth)
      const userId = userData.id || `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Créer l'utilisateur dans Firestore
      const user: User = {
        id: userId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        instrument: userData.instrument,
        groupId: userData.groupId || '',
        picture: userData.picture
      };
      
      await setDoc(doc(db, 'users', userId), user);
      
      console.log(`✅ Utilisateur créé: ${userData.firstName} ${userData.lastName} (${userId})`);
    } catch (error: any) {
      console.error(`❌ Erreur lors de la création de ${userData.firstName}:`, error);
    }
  }
  
  console.log('🎉 Création des utilisateurs terminée !');
}

// Fonction pour exécuter depuis la console du navigateur
if (typeof window !== 'undefined') {
  (window as any).createDemoUsers = createDemoUsers;
}

// Données de base pour les catégories de produits musicaux
export const productCategories = [
  {
    id: 'reeds-clarinet',
    name: 'Anches de Clarinette',
    type: 'reeds' as const,
    instruments: ['Clarinette'],
    strengths: [2, 2.5, 3, 3.5],
    brands: ['Vandoren', 'Juno']
  },
  {
    id: 'reeds-bass-clarinet',
    name: 'Anches de Clarinette Basse',
    type: 'reeds' as const,
    instruments: ['Clarinette Basse'],
    strengths: [2, 2.5, 3, 3.5],
    brands: ['Vandoren', 'Juno']
  },
  {
    id: 'reeds-alto-sax',
    name: 'Anches de Saxophone Alto',
    type: 'reeds' as const,
    instruments: ['Saxophone Alto'],
    strengths: [2, 2.5, 3, 3.5],
    brands: ['Vandoren', 'Juno']
  },
  {
    id: 'reeds-tenor-sax',
    name: 'Anches de Saxophone Ténor',
    type: 'reeds' as const,
    instruments: ['Saxophone Ténor'],
    strengths: [2, 2.5, 3, 3.5],
    brands: ['Vandoren', 'Juno']
  },
  {
    id: 'reeds-bari-sax',
    name: 'Anches de Saxophone Baryton',
    type: 'reeds' as const,
    instruments: ['Saxophone Baryton'],
    strengths: [2, 2.5, 3, 3.5],
    brands: ['Vandoren', 'Juno']
  },
  {
    id: 'mouthpieces-clarinet',
    name: 'Embouchures de Clarinette',
    type: 'mouthpieces' as const,
    instruments: ['Clarinette', 'Clarinette Basse']
  },
  {
    id: 'mouthpieces-sax',
    name: 'Embouchures de Saxophone',
    type: 'mouthpieces' as const,
    instruments: ['Saxophone Alto', 'Saxophone Ténor', 'Saxophone Baryton']
  },
  {
    id: 'mouthpieces-brass',
    name: 'Embouchures de Cuivres',
    type: 'mouthpieces' as const,
    instruments: ['Trompette', 'Cor', 'Trombone', 'Euphonium', 'Tuba']
  },
  {
    id: 'sticks',
    name: 'Baguettes de Drum',
    type: 'sticks' as const
  },
  {
    id: 'methods',
    name: 'Méthodes',
    type: 'methods' as const
  },
  {
    id: 'other',
    name: 'Autres',
    type: 'other' as const
  }
];

// Produits de démonstration
export const demoProducts = [
  {
    id: 'reed-clarinet-vandoren-2',
    name: 'Anche Vandoren Clarinette Force 2',
    categoryId: 'reeds-clarinet',
    instrument: 'Clarinette',
    strength: 2,
    brand: 'Vandoren',
    currentPrice: 3.50,
    stockQuantity: 25,
    minStockLevel: 5
  },
  {
    id: 'reed-clarinet-vandoren-2-5',
    name: 'Anche Vandoren Clarinette Force 2.5',
    categoryId: 'reeds-clarinet',
    instrument: 'Clarinette',
    strength: 2.5,
    brand: 'Vandoren',
    currentPrice: 3.50,
    stockQuantity: 30,
    minStockLevel: 5
  },
  {
    id: 'reed-clarinet-vandoren-3',
    name: 'Anche Vandoren Clarinette Force 3',
    categoryId: 'reeds-clarinet',
    instrument: 'Clarinette',
    strength: 3,
    brand: 'Vandoren',
    currentPrice: 3.50,
    stockQuantity: 20,
    minStockLevel: 5
  },
  {
    id: 'reed-alto-sax-vandoren-2',
    name: 'Anche Vandoren Saxophone Alto Force 2',
    categoryId: 'reeds-alto-sax',
    instrument: 'Saxophone Alto',
    strength: 2,
    brand: 'Vandoren',
    currentPrice: 4.00,
    stockQuantity: 15,
    minStockLevel: 3
  },
  {
    id: 'mouthpiece-clarinet-b45',
    name: 'Embouchure Clarinette B45',
    categoryId: 'mouthpieces-clarinet',
    instrument: 'Clarinette',
    currentPrice: 45.00,
    stockQuantity: 3,
    minStockLevel: 1
  },
  {
    id: 'sticks-vic-firth-5a',
    name: 'Baguettes Vic Firth 5A',
    categoryId: 'sticks',
    currentPrice: 12.00,
    stockQuantity: 8,
    minStockLevel: 2
  },
  {
    id: 'method-clarinet-rose',
    name: 'Méthode Rose Clarinette',
    categoryId: 'methods',
    currentPrice: 18.00,
    stockQuantity: 5,
    minStockLevel: 2
  }
]; 