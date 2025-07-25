import React, { useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';

interface StripeCheckoutProps {
  priceId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripeCheckout({ priceId, onCancel }: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const stripe = useStripe();
  const functions = getFunctions();

  const handleCheckout = async () => {
    setIsLoading(true);

    if (!user || !stripe) {
      console.error("Utilisateur non connecté ou Stripe non initialisé.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Appeler la Firebase Function pour créer une session avec URLs de retour
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const response = await createCheckoutSession({ 
        priceId, 
        userId: user.id,
        successUrl: `${window.location.origin}/teacher?success=true`,
        cancelUrl: `${window.location.origin}/teacher?canceled=true`
      });
      
      const sessionId = (response.data as { id: string }).id;

      // 2. Rediriger vers la page de paiement Stripe
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error("Erreur lors de la redirection vers Stripe:", error);
        onCancel();
      }
      
    } catch (error) {
      console.error("Erreur lors de la création de la session de paiement:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading || !stripe}
      className="btn-primary w-full"
    >
      {isLoading ? 'Chargement...' : 'Choisir ce plan'}
    </button>
  );
} 