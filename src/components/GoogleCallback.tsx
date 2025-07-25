import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthService } from '../services/googleAuth';

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      GoogleAuthService.getInstance()
        .exchangeCodeForToken(code)
        .then(() => {
          // Token stocké, on peut rediriger vers le dashboard
          navigate('/', { replace: true });
        })
        .catch((err) => {
          alert('Erreur lors de la connexion Google : ' + err.message);
          navigate('/', { replace: true });
        });
    } else {
      alert('Code Google OAuth manquant.');
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return (
    <div>
      <h2>Connexion Google en cours...</h2>
    </div>
  );
};

export default GoogleCallback; 