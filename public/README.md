# Dossier Public - Logos et Assets

Ce dossier contient tous les fichiers statiques de l'application, y compris les logos personnels.

## 📁 Structure recommandée

```
public/
├── favicon.ico              # Icône de l'onglet du navigateur
├── logo.svg                 # Logo principal (SVG)
├── logo.png                 # Logo principal (PNG)
├── logo-white.png           # Logo version blanche
├── logo-dark.png            # Logo version sombre
├── images/                  # Images générales
│   ├── hero-bg.jpg         # Image de fond de la page d'accueil
│   └── placeholder.jpg     # Image par défaut
├── icons/                   # Icônes spécifiques
│   ├── music-note.svg      # Icône de note de musique
│   └── instrument.svg      # Icône d'instrument
└── logos/                   # Logos de marques
    ├── brand-primary.svg   # Logo principal de la marque
    └── brand-secondary.svg # Logo secondaire
```

## 🎨 Formats supportés

- **SVG** : Recommandé pour les logos (vectoriel, redimensionnable)
- **PNG** : Pour les logos avec transparence
- **JPG/JPEG** : Pour les images photos
- **ICO** : Pour les favicons

## 🔧 Comment utiliser vos logos

1. **Placez vos fichiers** dans le dossier approprié
2. **Mettez à jour les références** dans le code :

```jsx
// Dans vos composants React
<img src="/logo.svg" alt="Logo" />
<img src="/images/hero-bg.jpg" alt="Image de fond" />
```

3. **Pour les icônes** :
```jsx
<img src="/icons/music-note.svg" alt="Note de musique" />
```

## 📝 Notes importantes

- Tous les fichiers dans `public/` sont accessibles directement via l'URL racine
- Les chemins commencent par `/` (pas par `./`)
- Vite sert automatiquement ces fichiers
- Les fichiers sont copiés tels quels dans le build de production 