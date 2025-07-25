# 🎨 Guide de Configuration des Logos Personnels

## 📁 Structure créée

Votre dossier `public/` est maintenant organisé comme suit :

```
public/
├── favicon.ico              # Icône de l'onglet (à remplacer)
├── logo.svg                 # Logo principal temporaire
├── README.md                # Documentation du dossier
├── images/                  # Images générales
├── icons/                   # Icônes spécifiques
│   ├── music-note.svg      # Icône de note de musique
│   └── instrument.svg      # Icône d'instrument
└── logos/                   # Logos de marques
    ├── brand-primary.svg   # Logo principal
    └── brand-secondary.svg # Logo secondaire
```

## 🔄 Comment remplacer par vos logos

### 1. **Favicon (icône de l'onglet)**
```bash
# Remplacez le fichier
cp votre-favicon.ico public/favicon.ico
```

### 2. **Logo principal**
```bash
# Remplacez le logo principal
cp votre-logo.svg public/logo.svg
cp votre-logo.png public/logo.png
```

### 3. **Logos de marque**
```bash
# Remplacez les logos de marque
cp votre-logo-principal.svg public/logos/brand-primary.svg
cp votre-logo-secondaire.svg public/logos/brand-secondary.svg
```

### 4. **Images personnalisées**
```bash
# Ajoutez vos images
cp votre-image-fond.jpg public/images/hero-bg.jpg
cp votre-placeholder.jpg public/images/placeholder.jpg
```

## 🎯 Utilisation dans le code

### Composant Logo
```jsx
import { Logo, HeaderLogo, HeroLogo } from './components/Logo';

// Logo simple
<Logo variant="primary" size="lg" />

// Logo d'en-tête
<HeaderLogo />

// Logo de page d'accueil
<HeroLogo />
```

### Images directes
```jsx
// Dans vos composants
<img src="/logo.svg" alt="Logo" />
<img src="/images/hero-bg.jpg" alt="Image de fond" />
<img src="/icons/music-note.svg" alt="Note de musique" />
```

## 📋 Checklist pour vos logos

- [ ] **Favicon** : `public/favicon.ico` (16x16, 32x32, 48x48)
- [ ] **Logo principal** : `public/logo.svg` (format SVG recommandé)
- [ ] **Logo PNG** : `public/logo.png` (pour compatibilité)
- [ ] **Logo blanc** : `public/logo-white.png` (pour fonds sombres)
- [ ] **Logo sombre** : `public/logo-dark.png` (pour fonds clairs)
- [ ] **Logo marque** : `public/logos/brand-primary.svg`
- [ ] **Logo secondaire** : `public/logos/brand-secondary.svg`

## 🎨 Formats recommandés

### SVG (recommandé)
- **Avantages** : Vectoriel, redimensionnable, petit fichier
- **Utilisation** : Logos, icônes, illustrations
- **Taille** : 24x24 à 200x200px

### PNG
- **Avantages** : Transparence, qualité
- **Utilisation** : Logos avec transparence, captures d'écran
- **Taille** : 2x la taille d'affichage pour les écrans haute résolution

### ICO
- **Avantages** : Format standard pour favicons
- **Utilisation** : Icône de l'onglet uniquement
- **Tailles** : 16x16, 32x32, 48x48px

## 🔧 Personnalisation avancée

### Modifier les couleurs des logos SVG
```svg
<!-- Dans vos fichiers SVG -->
<svg>
  <rect fill="#VOTRE_COULEUR_PRIMAIRE" />
  <path fill="#VOTRE_COULEUR_SECONDAIRE" />
</svg>
```

### Ajouter des variantes de logo
```jsx
// Dans src/components/Logo.tsx
const logoPaths = {
  primary: '/logos/brand-primary.svg',
  secondary: '/logos/brand-secondary.svg',
  icon: '/logo.svg',
  text: '/logos/brand-primary.svg',
  white: '/logo-white.png',    // Ajoutez vos variantes
  dark: '/logo-dark.png'
};
```

## 🚀 Déploiement

Vos logos seront automatiquement inclus dans le build de production :

```bash
npm run build
```

Les fichiers du dossier `public/` sont copiés tels quels dans le dossier `dist/`.

## 📞 Support

Si vous avez besoin d'aide pour :
- Convertir vos logos en SVG
- Optimiser vos images
- Intégrer vos logos dans l'interface

N'hésitez pas à demander ! 