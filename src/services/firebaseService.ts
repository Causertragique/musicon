import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
  setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, Group, Homework, Message, Announcement, Assignment, CourseNote, Purchase } from '../types';

// Types pour Firebase
interface FirebaseUser extends Omit<User, 'id'> {
  id?: string;
  createdAt?: Timestamp;
}

interface FirebaseGroup extends Omit<Group, 'id' | 'createdAt'> {
  id?: string;
  createdAt?: Timestamp;
}

interface FirebaseHomework extends Omit<Homework, 'id' | 'createdAt' | 'dueDate'> {
  id?: string;
  createdAt?: Timestamp;
  dueDate?: Timestamp;
}

interface FirebaseMessage extends Omit<Message, 'id' | 'createdAt'> {
  id?: string;
  createdAt?: Timestamp;
}

interface FirebaseAnnouncement extends Omit<Announcement, 'id' | 'createdAt'> {
  id?: string;
  createdAt?: Timestamp;
}

interface FirebaseAssignment extends Omit<Assignment, 'id' | 'createdAt' | 'dueDate'> {
  id?: string;
  createdAt?: Timestamp;
  dueDate?: Timestamp;
}

interface FirebaseCourseNote extends Omit<CourseNote, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

interface FirebasePurchase extends Omit<Purchase, 'id' | 'createdAt'> {
  id?: string;
  createdAt?: Timestamp;
}

// Service pour les utilisateurs
export const userService = {
  async getAll(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
  },

  async getById(id: string): Promise<User | null> {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  },

  async getByRole(role: 'teacher' | 'student'): Promise<User[]> {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
  },

  async create(userData: Omit<User, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async createWithId(id: string, userData: Omit<User, 'id'>): Promise<void> {
    const docRef = doc(db, 'users', id);
    await setDoc(docRef, {
      ...userData,
      createdAt: serverTimestamp()
    });
  },

  async update(id: string, updates: Partial<User>): Promise<void> {
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, updates);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'users', id);
    await deleteDoc(docRef);
  }
};

// Service pour les groupes
export const groupService = {
  async getAll(): Promise<Group[]> {
    const querySnapshot = await getDocs(collection(db, 'groups'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Group[];
  },

  async getByTeacherId(teacherId: string): Promise<Group[]> {
    const q = query(
      collection(db, 'groups'), 
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Group[];
  },

  async getById(id: string): Promise<Group | null> {
    const docRef = doc(db, 'groups', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date()
      } as Group;
    }
    return null;
  },

  async create(groupData: Omit<Group, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'groups'), {
      ...groupData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, updates: { name: string; description: string }): Promise<void> {
    const docRef = doc(db, 'groups', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'groups', id);
    await deleteDoc(docRef);
  },

  async addStudentToGroup(groupId: string, studentId: string): Promise<void> {
    const docRef = doc(db, 'groups', groupId);
    await updateDoc(docRef, {
      studentIds: [...(await this.getById(groupId))?.studentIds || [], studentId]
    });
  },

  async removeStudentFromGroup(groupId: string, studentId: string): Promise<void> {
    const group = await this.getById(groupId);
    if (group) {
      const docRef = doc(db, 'groups', groupId);
      await updateDoc(docRef, {
        studentIds: group.studentIds.filter(id => id !== studentId)
      });
    }
  }
};

// Service pour les devoirs
export const homeworkService = {
  async getAll(): Promise<Homework[]> {
    const querySnapshot = await getDocs(collection(db, 'homework'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      dueDate: doc.data().dueDate?.toDate() || new Date()
    })) as Homework[];
  },

  async getByTeacherId(teacherId: string): Promise<Homework[]> {
    const q = query(
      collection(db, 'homework'), 
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      dueDate: doc.data().dueDate?.toDate() || new Date()
    })) as Homework[];
  },

  async getByGroupId(groupId: string): Promise<Homework[]> {
    const q = query(
      collection(db, 'homework'), 
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      dueDate: doc.data().dueDate?.toDate() || new Date()
    })) as Homework[];
  },

  async create(homeworkData: Omit<Homework, 'id' | 'createdAt' | 'submissions'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'homework'), {
      ...homeworkData,
      submissions: [],
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, updates: Partial<Homework>): Promise<void> {
    const docRef = doc(db, 'homework', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'homework', id);
    await deleteDoc(docRef);
  }
};

// Service pour les messages
export const messageService = {
  async getAll(): Promise<Message[]> {
    const querySnapshot = await getDocs(collection(db, 'messages'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Message[];
  },

  async getByGroupId(groupId: string): Promise<Message[]> {
    const q = query(
      collection(db, 'messages'), 
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Message[];
  },

  async create(messageData: Omit<Message, 'id' | 'createdAt' | 'readBy'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'messages'), {
      ...messageData,
      readBy: [],
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async markAsRead(messageId: string, userId: string): Promise<void> {
    const docRef = doc(db, 'messages', messageId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentReadBy = docSnap.data().readBy || [];
      if (!currentReadBy.includes(userId)) {
        await updateDoc(docRef, {
          readBy: [...currentReadBy, userId]
        });
      }
    }
  }
};

// Service pour les annonces
export const announcementService = {
  async getAll(): Promise<Announcement[]> {
    const querySnapshot = await getDocs(collection(db, 'announcements'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Announcement[];
  },

  async getByTeacherId(teacherId: string): Promise<Announcement[]> {
    const q = query(
      collection(db, 'announcements'), 
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Announcement[];
  },

  async getByGroupId(groupId: string): Promise<Announcement[]> {
    const q = query(
      collection(db, 'announcements'), 
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Announcement[];
  },

  async create(announcementData: Omit<Announcement, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'announcements'), {
      ...announcementData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, updates: Partial<Announcement>): Promise<void> {
    const docRef = doc(db, 'announcements', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'announcements', id);
    await deleteDoc(docRef);
  }
};

// Service pour les achats
export const purchaseService = {
  async getAll(): Promise<Purchase[]> {
    const querySnapshot = await getDocs(collection(db, 'purchases'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Purchase[];
  },

  async getByTeacherId(teacherId: string): Promise<Purchase[]> {
    const q = query(
      collection(db, 'purchases'), 
      where('teacherId', '==', teacherId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Purchase[];
  },

  async getByGroupId(groupId: string): Promise<Purchase[]> {
    const q = query(
      collection(db, 'purchases'), 
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Purchase[];
  },

  async create(purchaseData: Omit<Purchase, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'purchases'), {
      ...purchaseData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async markAsPaid(id: string): Promise<void> {
    const docRef = doc(db, 'purchases', id);
    await updateDoc(docRef, {
      status: 'paid',
      paidAt: serverTimestamp()
    });
  }
};

// Service pour les notifications
export const notificationService = {
  async createNotification(notificationData: {
    recipientId: string;
    type: string;
    title: string;
    message: string;
    recipientRole: string;
    relatedId?: string;
    priority?: string;
  }): Promise<string> {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      isRead: false,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getNotifications(userId: string): Promise<any[]> {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
  },

  async getUnreadCount(userId: string): Promise<number> {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('isRead', '==', false)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  },

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      await updateDoc(docRef, {
        isRead: true,
        readAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      return false;
    }
  },

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        where('isRead', '==', false)
      );
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      querySnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          isRead: true,
          readAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      return false;
    }
  },

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'notifications', notificationId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      return false;
    }
  }
};

// Service pour les produits (simulation pour éviter les erreurs)
export const productService = {
  async getProducts(): Promise<any[]> {
    // Simulation de données de produits
    return [
      {
        id: '1',
        name: 'Cordes de violon',
        currentPrice: 25.99,
        stockQuantity: 50,
        minStockLevel: 10,
        categoryId: 'strings',
        isActive: true
      },
      {
        id: '2',
        name: 'Anches de clarinette',
        currentPrice: 15.50,
        stockQuantity: 30,
        minStockLevel: 5,
        categoryId: 'reeds',
        isActive: true
      }
    ];
  },

  async getProductCategories(): Promise<any[]> {
    return [
      { id: 'strings', name: 'Cordes' },
      { id: 'reeds', name: 'Anches' },
      { id: 'accessories', name: 'Accessoires' }
    ];
  },

  async getSales(teacherId?: string): Promise<any[]> {
    return [];
  },

  async recordSale(saleData: any): Promise<boolean> {
    // Simulation d'enregistrement de vente
    console.log('Vente enregistrée:', saleData);
    return true;
  },

  async initializeProducts(): Promise<boolean> {
    // Simulation d'initialisation
    return true;
  }
}; 