#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎵 Création de comptes de démonstration MusiqueConnect\n');

const demoAccounts = [
  {
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@demo.com',
    password: 'Demo2025!',
    role: 'teacher',
    instrument: 'Piano',
    description: 'Professeure de piano avec 10 ans d\'expérience'
  },
  {
    firstName: 'Thomas',
    lastName: 'Martin',
    email: 'thomas.martin@demo.com', 
    password: 'Demo2025!',
    role: 'teacher',
    instrument: 'Guitare',
    description: 'Professeur de guitare spécialisé jazz et blues'
  }
];

console.log('📋 Comptes de démonstration à créer :\n');

demoAccounts.forEach((account, index) => {
  console.log(`${index + 1}. ${account.firstName} ${account.lastName}`);
  console.log(`   📧 Email: ${account.email}`);
  console.log(`   🔑 Mot de passe: ${account.password}`);
  console.log(`   🎵 Instrument: ${account.instrument}`);
  console.log(`   👤 Rôle: ${account.role}`);
  console.log(`   📝 Description: ${account.description}`);
  console.log('');
});

console.log('📝 Instructions de création :\n');

console.log('1. Va sur http://localhost:5184/signup');
console.log('2. Crée chaque compte avec les informations ci-dessus');
console.log('3. Une fois créés, tu pourras te connecter avec :');
console.log('   - Email: marie.dubois@demo.com / Mot de passe: Demo2025!');
console.log('   - Email: thomas.martin@demo.com / Mot de passe: Demo2025!');

console.log('\n🎯 Utilisation des comptes demo :');
console.log('- Test des fonctionnalités de gestion de cours');
console.log('- Test de la création de groupes d\'étudiants');
console.log('- Test de la gestion des devoirs');
console.log('- Test des communications avec les parents');

console.log('\n🔐 Comptes administrateur existants :');
console.log('- Email: info@guillaumehetu.com / Mot de passe: Appmus2025');
console.log('- Email: guillaumehetu1@gmail.com / Mot de passe: Appmus2025');

// Créer un fichier de référence
const demoFile = path.join(__dirname, '../DEMO_ACCOUNTS.md');
const demoContent = `# Comptes de Démonstration MusiqueConnect

## Comptes Enseignants

### 1. Marie Dubois - Piano
- **Email:** marie.dubois@demo.com
- **Mot de passe:** Demo2025!
- **Instrument:** Piano
- **Description:** Professeure de piano avec 10 ans d'expérience

### 2. Thomas Martin - Guitare  
- **Email:** thomas.martin@demo.com
- **Mot de passe:** Demo2025!
- **Instrument:** Guitare
- **Description:** Professeur de guitare spécialisé jazz et blues

## Comptes Administrateur

### Guillaume Hétu
- **Email:** info@guillaumehetu.com
- **Mot de passe:** Appmus2025

### Guillaume Hétu (Alternatif)
- **Email:** guillaumehetu1@gmail.com  
- **Mot de passe:** Appmus2025

## Instructions

1. Aller sur http://localhost:5184/signup
2. Créer les comptes avec les informations ci-dessus
3. Tester les fonctionnalités de l'application
4. Utiliser ces comptes pour les démonstrations

## Fonctionnalités à Tester

- ✅ Authentification email/mot de passe
- 🔄 Création et gestion de groupes d'étudiants
- 🔄 Gestion des devoirs et exercices
- 🔄 Communication avec les parents
- 🔄 Gestion du budget et des achats
- 🔄 Planification des cours
`;

fs.writeFileSync(demoFile, demoContent);
console.log(`\n📄 Fichier de référence créé: DEMO_ACCOUNTS.md`);
console.log('✅ Script terminé !'); 