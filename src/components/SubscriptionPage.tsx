import StripeCheckout from './StripeCheckout';

const ACTIVE_PLAN = {
  name: 'Abonnement MusiqueConnect',
  description: 'Un abonnement flexible qui s\'adapte à votre nombre d\'élèves.',
  priceId: 'price_1Rc82fRwaLI3uLNHzOLEgu0X', // Votre ID de prix
  features: [
    'Gestion complète des élèves et des groupes',
    'Suivi des devoirs et des pratiques',
    'Communication intégrée',
    'Facturation automatique basée sur le nombre d\'élèves',
    'Support par email',
  ],
};

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-center mb-2">{ACTIVE_PLAN.name}</h2>
          <p className="text-gray-600 text-center mb-6">{ACTIVE_PLAN.description}</p>
          
          <div className="text-center mb-8">
            <span className="text-4xl font-extrabold">Tarification Flexible</span>
            <p className="text-gray-500">Payez uniquement pour ce que vous utilisez.</p>
          </div>

          <ul className="space-y-3 mb-8">
            {ACTIVE_PLAN.features.map((feature) => (
              <li key={feature} className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <StripeCheckout
            priceId={ACTIVE_PLAN.priceId}
            onSuccess={() => console.log('Paiement réussi')}
            onCancel={() => console.log('Paiement annulé')}
          />
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            La facturation est ajustée automatiquement à la fin de chaque mois en fonction du nombre maximum d'élèves actifs.
          </p>
        </div>
      </div>
    </div>
  );
}
