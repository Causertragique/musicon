// Configuration centralisée des logos
export const LOGO_CONFIG = {
  // Logos principaux
  primary: '/logos/brand-primary.png',
  secondary: '/logos/NoTitle.png',
  
  // Logos d'en-tête
  header: '/logos/HeaderLogo.png',
  headerInverted: '/logos/Headerinvlogo.png',
  
  // Logo de page d'accueil
  hero: '/logos/HeroLogo.png',
  
  // Logos SVG
  icon: '/images/primary bleu.svg',
  text: '/images/header.svg',
  black: '/images/Brand-primary-black.svg',
  blue: '/images/bleu logo.svg',
  
  // Icônes musicales
  music: '/icons/music.svg',
  headphones: '/icons/headphones.svg',
  disc: '/icons/disc.svg',
  play: '/icons/play.svg',
  pause: '/icons/pause.svg',
  volume: '/icons/volume.svg',
  
  // Favicon
  favicon: '/favicon.ico'
};

// Tailles prédéfinies
export const LOGO_SIZES = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
  '2xl': 'w-32 h-32'
};

// Variantes de logo disponibles
export const LOGO_VARIANTS = {
  primary: 'Logo principal',
  secondary: 'Logo sans titre',
  header: 'Logo d\'en-tête',
  hero: 'Logo de page d\'accueil',
  icon: 'Icône SVG',
  text: 'Logo texte',
  black: 'Logo noir',
  blue: 'Logo bleu'
} as const;

export type LogoVariant = keyof typeof LOGO_VARIANTS;
export type LogoSize = keyof typeof LOGO_SIZES; 