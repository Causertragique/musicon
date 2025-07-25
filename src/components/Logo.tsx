import React from 'react';

interface LogoProps {
  variant?: 'primary' | 'secondary' | 'header' | 'hero' | 'icon' | 'text' | 'black' | 'blue';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

export default function Logo({ 
  variant = 'primary', 
  size = 'md', 
  className = '',
  alt = 'MusiqueConnect Logo'
}: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const logoPaths = {
    primary: '/logos/brand-primary.png',
    secondary: '/logos/NoTitle.png',
    header: '/logos/HeaderLogo.png',
    hero: '/logos/HeroLogo.png',
    icon: '/images/primary bleu.svg',
    text: '/images/header.svg',
    black: '/images/Brand-primary-black.svg',
    blue: '/images/bleu logo.svg'
  };

  return (
    <img
      src={logoPaths[variant]}
      alt={alt}
      className={`${sizeClasses[size]} ${className}`}
    />
  );
}

// Composant spécialisé pour l'en-tête
export function HeaderLogo() {
  return (
    <div className="flex items-center gap-3">
      <img src="/logos/HeaderLogo.png" alt="Header Logo" className="w-8 h-8" />
      <span className="text-xl font-bold text-gray-900 hidden sm:block">
        MusiqueConnect
      </span>
    </div>
  );
}

// Composant spécialisé pour la page d'accueil
export function HeroLogo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <img src="/logos/HeroLogo.png" alt="Hero Logo" className="w-24 h-24" />
      <h1 className="text-3xl font-bold text-gray-900 text-center">
        MusiqueConnect
      </h1>
      <p className="text-lg text-gray-600 text-center">
        Plateforme Enseignant-Élève de Musique
      </p>
    </div>
  );
}

// Composant pour le logo sans titre
export function NoTitleLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <img
      src="/logos/NoTitle.png"
      alt="Logo sans titre"
      className={sizeClasses[size]}
    />
  );
} 