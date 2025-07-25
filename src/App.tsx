import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import TeacherDashboard from './components/TeacherDashboard';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import MusiqueConnectHome from './components/MusiqueConnectHome';
import PricingPage from '../stripe/PricingPage';
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import GoogleCallback from './components/GoogleCallback';
import GoogleAuthCallback from './components/GoogleAuthCallback';

// Import des composants pour les pages individuelles
import GroupManager from './components/GroupManager';
import HomeworkManager from './components/HomeworkManager';
import ChatCenter from './components/ChatCenter';
import AnnouncementManager from './components/AnnouncementManager';
import TeacherProfile from './components/TeacherProfile';
import StudentManager from './components/StudentManager';
import AssignmentManager from './components/AssignmentManager';
import CourseNotesManager from './components/CourseNotesManager';
import BudgetDashboard from './components/BudgetDashboard';
import SalesManager from './components/SalesManager';
import IA from './components/IA';
import IAToolsManager from './components/IAToolsManager';
import AdminDashboard from './components/AdminDashboard';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  
  console.log('🔍 === PRIVATE ROUTE ===');
  console.log('👤 Utilisateur:', user);
  console.log('📍 Location:', location.pathname);
  
  if (!user) {
    console.log('❌ Pas d\'utilisateur, redirection vers /login');
    // Si pas connecté, redirige vers /login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  console.log('✅ Utilisateur connecté, affichage du contenu');
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  console.log('🔍 === APP ROUTES ===');
  console.log('👤 Utilisateur:', user);
  console.log('📍 Location actuelle:', location.pathname);

  return (
    <Routes>
      <Route path="/" element={
        (() => {
          if (user) {
            console.log('🔄 Redirection de / vers /dashboard car utilisateur connecté');
            return <Navigate to="/dashboard" replace />;
          } else {
            console.log('🏠 Affichage de la page d\'accueil car pas d\'utilisateur');
            return <MusiqueConnectHome />;
          }
        })()
      } />
      <Route path="/login" element={
        (() => {
          if (user) {
            console.log('🔄 Redirection de /login vers /dashboard car utilisateur connecté');
            return <Navigate to="/dashboard" replace />;
          } else {
            console.log('🔐 Affichage de la page de connexion');
            return <LoginPage />;
          }
        })()
      } />
      <Route path="/signup" element={
        (() => {
          if (user) {
            console.log('🔄 Redirection de /signup vers /dashboard car utilisateur connecté');
            return <Navigate to="/dashboard" replace />;
          } else {
            console.log('📝 Affichage de la page d\'inscription');
            return <SignupPage />;
          }
        })()
      } />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
      
      {/* Routes protégées pour l'application */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          {user?.role === 'admin' ? <AdminDashboard /> : <TeacherDashboard />}
        </PrivateRoute>
      } />
      <Route path="/groupes" element={
        <PrivateRoute>
          <TeacherDashboard activeTab="groups" />
        </PrivateRoute>
      } />
      <Route path="/devoirs" element={
        <PrivateRoute>
          <TeacherDashboard activeTab="homework" />
        </PrivateRoute>
      } />
      <Route path="/messages" element={
        <PrivateRoute>
          <TeacherDashboard activeTab="messages" />
        </PrivateRoute>
      } />
      <Route path="/annonces" element={
        <PrivateRoute>
          <TeacherDashboard activeTab="announcements" />
        </PrivateRoute>
      } />
      <Route path="/etudiants" element={
        <PrivateRoute>
          <TeacherDashboard activeTab="students" />
        </PrivateRoute>
      } />
      <Route path="/devoirs-assignes" element={
        <PrivateRoute>
          <TeacherDashboard activeTab="assignments" />
        </PrivateRoute>
      } />
      <Route path="/notes-de-cours" element={
        <PrivateRoute>
          <TeacherDashboard activeTab="notes" />
        </PrivateRoute>
      } />
      <Route path="/budget" element={
        <PrivateRoute>
          <TeacherDashboard activeTab="budget" />
        </PrivateRoute>
      } />
      <Route path="/ventes" element={
        <PrivateRoute>
          <TeacherDashboard activeTab="sales" />
        </PrivateRoute>
      } />
      <Route path="/ia" element={
        <PrivateRoute>
          <TeacherDashboard activeTab="ia" />
        </PrivateRoute>
      } />
      <Route path="/outils-ia" element={
        <PrivateRoute>
          <TeacherDashboard activeTab="tools" />
        </PrivateRoute>
      } />
      <Route path="/profil" element={
        <PrivateRoute>
          <TeacherDashboard activeTab="profile" />
        </PrivateRoute>
      } />
      <Route path="/gamification" element={
        <PrivateRoute>
          <TeacherDashboard activeTab="gamification" />
        </PrivateRoute>
      } />
      <Route path="/budget-dashboard" element={<BudgetDashboard />} />
      
      {/* Redirection catch-all vers la landing */}
      <Route path="*" element={
        (() => {
          console.log('🔄 Route non trouvée, redirection vers /');
          return <Navigate to="/" replace />;
        })()
      } />
    </Routes>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;