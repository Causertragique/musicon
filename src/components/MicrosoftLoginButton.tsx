import React from 'react';

interface MicrosoftLoginButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function MicrosoftLoginButton({ onClick, disabled }: MicrosoftLoginButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2 px-3 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path fill="#f25022" d="M1 1h10v10H1z"/>
        <path fill="#00a4ef" d="M13 1h10v10H13z"/>
        <path fill="#7fba00" d="M1 13h10v10H1z"/>
        <path fill="#ffb900" d="M13 13h10v10H13z"/>
      </svg>
      <span className="text-xs font-medium">
        {disabled ? 'Connexion...' : 'Microsoft'}
      </span>
    </button>
  );
}