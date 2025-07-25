import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Group, Homework, Message, Announcement, Assignment, CourseNote, Purchase, StudentDebt } from '../types';
import { 
  userService, 
  groupService, 
  homeworkService, 
  messageService, 
  announcementService, 
  purchaseService 
} from '../services/firebaseService';

interface FirebaseDataContextType {
  // Données
  users: User[];
  groups: Group[];
  homework: Homework[];
  messages: Message[];
  announcements: Announcement[];
  assignments: Assignment[];
  courseNotes: CourseNote[];
  purchases: Purchase[];
  
  // États de chargement
  loading: {
    users: boolean;
    groups: boolean;
    homework: boolean;
    messages: boolean;
    announcements: boolean;
    assignments: boolean;
    courseNotes: boolean;
    purchases: boolean;
  };
  
  // Actions
  addGroup: (group: Omit<Group, 'id' | 'createdAt'>) => Promise<void>;
  updateGroup: (groupId: string, updates: { name: string; description: string }) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  addHomework: (homework: Omit<Homework, 'id' | 'createdAt' | 'submissions'>) => Promise<void>;
  addMessage: (message: Omit<Message, 'id' | 'createdAt' | 'readBy'>) => Promise<void>;
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => Promise<void>;
  markPurchaseAsPaid: (purchaseId: string) => Promise<void>;
  
  // Utilitaires
  getStudentsByGroup: (groupId: string) => User[];
  getActiveGroups: (teacherId: string) => Group[];
  getStudentDebt: (studentId: string) => StudentDebt;
  
  // Rafraîchissement
  refreshData: () => Promise<void>;
}

const FirebaseDataContext = createContext<FirebaseDataContextType | undefined>(undefined);

export function FirebaseDataProvider({ children }: { children: ReactNode }) {
  // États des données
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courseNotes, setCourseNotes] = useState<CourseNote[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  // États de chargement
  const [loading, setLoading] = useState({
    users: false,
    groups: false,
    homework: false,
    messages: false,
    announcements: false,
    assignments: false,
    courseNotes: false,
    purchases: false
  });

  // Charger toutes les données
  const loadAllData = async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      const allUsers = await userService.getAll();
      setUsers(allUsers);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }

    try {
      setLoading(prev => ({ ...prev, groups: true }));
      const allGroups = await groupService.getAll();
      setGroups(allGroups);
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error);
    } finally {
      setLoading(prev => ({ ...prev, groups: false }));
    }

    try {
      setLoading(prev => ({ ...prev, homework: true }));
      const allHomework = await homeworkService.getAll();
      setHomework(allHomework);
    } catch (error) {
      console.error('Erreur lors du chargement des devoirs:', error);
    } finally {
      setLoading(prev => ({ ...prev, homework: false }));
    }

    try {
      setLoading(prev => ({ ...prev, messages: true }));
      const allMessages = await messageService.getAll();
      setMessages(allMessages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }

    try {
      setLoading(prev => ({ ...prev, announcements: true }));
      const allAnnouncements = await announcementService.getAll();
      setAnnouncements(allAnnouncements);
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error);
    } finally {
      setLoading(prev => ({ ...prev, announcements: false }));
    }

    try {
      setLoading(prev => ({ ...prev, purchases: true }));
      const allPurchases = await purchaseService.getAll();
      setPurchases(allPurchases);
    } catch (error) {
      console.error('Erreur lors du chargement des achats:', error);
    } finally {
      setLoading(prev => ({ ...prev, purchases: false }));
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadAllData();
  }, []);

  // Actions
  const addGroup = async (groupData: Omit<Group, 'id' | 'createdAt'>) => {
    try {
      await groupService.create(groupData);
      await loadAllData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la création du groupe:', error);
      throw error;
    }
  };

  const updateGroup = async (groupId: string, updates: { name: string; description: string }) => {
    try {
      await groupService.update(groupId, updates);
      await loadAllData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la mise à jour du groupe:', error);
      throw error;
    }
  };

  const deleteGroup = async (groupId: string) => {
    try {
      await groupService.delete(groupId);
      await loadAllData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la suppression du groupe:', error);
      throw error;
    }
  };

  const addHomework = async (homeworkData: Omit<Homework, 'id' | 'createdAt' | 'submissions'>) => {
    try {
      await homeworkService.create(homeworkData);
      await loadAllData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la création du devoir:', error);
      throw error;
    }
  };

  const addMessage = async (messageData: Omit<Message, 'id' | 'createdAt' | 'readBy'>) => {
    try {
      await messageService.create(messageData);
      await loadAllData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la création du message:', error);
      throw error;
    }
  };

  const addAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'createdAt'>) => {
    try {
      await announcementService.create(announcementData);
      await loadAllData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la création de l\'annonce:', error);
      throw error;
    }
  };

  const addPurchase = async (purchaseData: Omit<Purchase, 'id' | 'createdAt'>) => {
    try {
      await purchaseService.create(purchaseData);
      await loadAllData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la création de l\'achat:', error);
      throw error;
    }
  };

  const markPurchaseAsPaid = async (purchaseId: string) => {
    try {
      await purchaseService.markAsPaid(purchaseId);
      await loadAllData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors du marquage du paiement:', error);
      throw error;
    }
  };

  // Utilitaires
  const getStudentsByGroup = (groupId: string): User[] => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return [];
    return users.filter(user => group.studentIds.includes(user.id));
  };

  const getActiveGroups = (teacherId: string): Group[] => {
    return groups.filter(group => 
      group.teacherId === teacherId && 
      (group.studentIds.length > 0 || group.createdAt > new Date('2024-12-01'))
    );
  };

  const getStudentDebt = (studentId: string): StudentDebt => {
    const studentPurchases = purchases.filter(p => p.studentId === studentId);
    const totalDebt = studentPurchases
      .filter(p => p.status === 'credit')
      .reduce((total, purchase) => total + purchase.amount, 0);

    return {
      studentId,
      totalDebt,
      purchases: studentPurchases
    };
  };

  const refreshData = async () => {
    await loadAllData();
  };

  const value: FirebaseDataContextType = {
    users,
    groups,
    homework,
    messages,
    announcements,
    assignments,
    courseNotes,
    purchases,
    loading,
    addGroup,
    updateGroup,
    deleteGroup,
    addHomework,
    addMessage,
    addAnnouncement,
    addPurchase,
    markPurchaseAsPaid,
    getStudentsByGroup,
    getActiveGroups,
    getStudentDebt,
    refreshData
  };

  return (
    <FirebaseDataContext.Provider value={value}>
      {children}
    </FirebaseDataContext.Provider>
  );
}

export function useFirebaseData() {
  const context = useContext(FirebaseDataContext);
  if (context === undefined) {
    throw new Error('useFirebaseData must be used within a FirebaseDataProvider');
  }
  return context;
} 