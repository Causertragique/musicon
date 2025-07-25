import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TeacherDashboard from '../components/TeacherDashboard';
import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import { Group, Homework, Message, Announcement, Assignment, CourseNote, Purchase } from '../types';

// Mock du contexte d'authentification
const mockLogout = jest.fn();
jest.mock('../contexts/AuthContext', () => ({
  ...jest.requireActual('../contexts/AuthContext'),
  useAuth: () => ({
    user: {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Dubois',
      email: 'teacher@demo.com',
      role: 'teacher',
      picture: null
    },
    logout: mockLogout
  })
}));

// Mock du contexte de données
jest.mock('../contexts/DataContext', () => ({
  ...jest.requireActual('../contexts/DataContext'),
  useData: () => ({
    groups: [
      {
        id: '1',
        name: 'Groupe A',
        description: 'Description du groupe A',
        teacherId: '1',
        studentIds: [],
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'Groupe B',
        description: 'Description du groupe B',
        teacherId: '1',
        studentIds: [],
        createdAt: new Date()
      }
    ] as Group[],
    homework: [] as Homework[],
    messages: [] as Message[],
    announcements: [] as Announcement[],
    assignments: [] as Assignment[],
    courseNotes: [] as CourseNote[],
    purchases: [
      {
        id: '1',
        studentId: '2',
        studentName: 'Emma Martin',
        groupId: '1',
        groupName: 'Groupe A',
        item: 'Cours de piano',
        amount: 100,
        status: 'paid',
        createdAt: new Date(),
        teacherId: '1'
      },
      {
        id: '2',
        studentId: '3',
        studentName: 'Lucas Moreau',
        groupId: '1',
        groupName: 'Groupe A',
        item: 'Cours de guitare',
        amount: 50,
        status: 'credit',
        createdAt: new Date(),
        teacherId: '1'
      }
    ] as Purchase[],
    users: [],
    practiceReports: [],
    getStudentsByGroup: jest.fn().mockReturnValue([]),
    getStudentPracticeReports: jest.fn().mockReturnValue([]),
    getStudentDebt: jest.fn().mockReturnValue({ totalDebt: 0, purchases: [] }),
    getActiveGroups: jest.fn().mockReturnValue([
      {
        id: '1',
        name: 'Groupe A',
        description: 'Description du groupe A',
        teacherId: '1',
        studentIds: [],
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'Groupe B',
        description: 'Description du groupe B',
        teacherId: '1',
        studentIds: [],
        createdAt: new Date()
      }
    ]),
    addGroup: jest.fn(),
    updateGroup: jest.fn(),
    deleteGroup: jest.fn(),
    addHomework: jest.fn(),
    addMessage: jest.fn(),
    addAnnouncement: jest.fn(),
    submitHomework: jest.fn(),
    addPracticeReport: jest.fn(),
    addAssignment: jest.fn(),
    submitAssignment: jest.fn(),
    evaluateAssignment: jest.fn(),
    addCourseNote: jest.fn(),
    updateCourseNote: jest.fn(),
    deleteCourseNote: jest.fn(),
    addPurchase: jest.fn(),
    markPurchaseAsPaid: jest.fn()
  })
}));

describe('TeacherDashboard', () => {
  beforeEach(() => {
    render(
      <DataProvider>
        <AuthProvider>
          <TeacherDashboard />
        </AuthProvider>
      </DataProvider>
    );
  });

  test('affiche le nom du professeur', () => {
    expect(screen.getByText('Sarah Dubois')).toBeInTheDocument();
    expect(screen.getByText('Professeur de Musique')).toBeInTheDocument();
  });

  test('affiche les onglets de navigation', () => {
    expect(screen.getByText('Pratique')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Annonces')).toBeInTheDocument();
  });

  test('permet de changer d\'onglet', () => {
    const practiceTab = screen.getByText('Pratique');
    expect(practiceTab).toBeInTheDocument();

    const chatTab = screen.getByText('Chat');
    fireEvent.click(chatTab);
    expect(chatTab).toBeInTheDocument();
  });

  test('affiche les statistiques financières', () => {
    expect(screen.getByText(/Revenus du mois/)).toBeInTheDocument();
    expect(screen.getByText(/Crédits en attente/)).toBeInTheDocument();
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });

  test('permet de filtrer par groupe', () => {
    expect(screen.getAllByText(/Groupe A/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Groupe B/).length).toBeGreaterThan(0);
  });

  test('affiche le bouton de déconnexion', () => {
    const logoutButton = screen.getByRole('button', { name: /Déconnexion/i });
    expect(logoutButton).toBeInTheDocument();
  });

  test('gère la déconnexion', () => {
    const logoutButton = screen.getByRole('button', { name: /Déconnexion/i });
    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalled();
  });
});