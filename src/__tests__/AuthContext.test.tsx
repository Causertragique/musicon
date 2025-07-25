import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Composant de test pour simuler l'utilisation du contexte
const TestComponent = () => {
  const { login, user, logout } = useAuth();
  return (
    <div>
      <button onClick={() => login('teacher@demo.com', 'demo123')}>Login</button>
      <button onClick={logout}>Logout</button>
      {user && <div data-testid="user">{user.email}</div>}
    </div>
  );
};

describe('AuthContext', () => {
  test('login avec email/mot de passe', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Vérifier que l'utilisateur n'est pas connecté initialement
    expect(screen.queryByTestId('user')).not.toBeInTheDocument();

    // Cliquer sur le bouton de connexion
    fireEvent.click(screen.getByText('Login'));

    // Vérifier que l'utilisateur est connecté
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('teacher@demo.com');
    });
  });

  test('logout fonctionne correctement', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Se connecter d'abord
    fireEvent.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByTestId('user')).toBeInTheDocument();
    });

    // Se déconnecter
    fireEvent.click(screen.getByText('Logout'));

    // Vérifier que l'utilisateur est déconnecté
    expect(screen.queryByTestId('user')).not.toBeInTheDocument();
  });
});
