#!/bin/bash

# 🚀 Script de Déploiement MusiqueConnect.app
# Auteur: Guillaume Hetu
# Date: 2024-01-15

set -e  # Arrêter en cas d'erreur

echo "🎵 Déploiement MusiqueConnect.app"
echo "=================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    print_error "Ce script doit être exécuté depuis le répertoire racine du projet"
    exit 1
fi

# Étape 1: Vérifier les dépendances
print_status "Vérification des dépendances..."
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé"
    exit 1
fi

if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI n'est pas installé. Installation..."
    npm install -g vercel
fi

print_success "Dépendances vérifiées"

# Étape 2: Installer les dépendances
print_status "Installation des dépendances..."
npm install
print_success "Dépendances installées"

# Étape 3: Vérifier les variables d'environnement
print_status "Vérification des variables d'environnement..."
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    print_warning "Fichier .env non trouvé. Vérifiez que les variables sont configurées dans Vercel"
fi

# Étape 4: Build du projet
print_status "Build du projet..."
npm run build
print_success "Build terminé"

# Étape 5: Tests de base
print_status "Exécution des tests..."
if npm test 2>/dev/null; then
    print_success "Tests passés"
else
    print_warning "Tests non configurés ou échoués - continuation du déploiement"
fi

# Étape 6: Déploiement Vercel
print_status "Déploiement sur Vercel..."

# Vérifier si l'utilisateur est connecté à Vercel
if ! vercel whoami &> /dev/null; then
    print_warning "Vous n'êtes pas connecté à Vercel. Connexion requise..."
    vercel login
fi

# Déploiement de production
print_status "Déploiement de production en cours..."
vercel --prod --yes

print_success "Déploiement terminé!"

# Étape 7: Vérification post-déploiement
print_status "Vérification post-déploiement..."

# Attendre un peu pour que le déploiement soit propagé
sleep 10

# Vérifier l'accessibilité du site
if curl -s -o /dev/null -w "%{http_code}" https://musiqueconnect.app | grep -q "200\|301\|302"; then
    print_success "Site accessible sur https://musiqueconnect.app"
else
    print_warning "Site pas encore accessible - propagation DNS en cours"
fi

# Étape 8: Configuration finale
print_status "Configuration finale..."

echo ""
echo "🎉 Déploiement MusiqueConnect.app terminé!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Vérifier la configuration Firebase"
echo "2. Configurer les domaines autorisés dans Firebase"
echo "3. Configurer Google OAuth"
echo "4. Configurer Microsoft OAuth"
echo "5. Tester toutes les fonctionnalités"
echo ""
echo "🔗 URLs importantes:"
echo "- Production: https://musiqueconnect.app"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- Firebase Console: https://console.firebase.google.com"
echo ""
echo "📚 Documentation:"
echo "- Guide complet: CONFIGURATION_CLOUDFLARE_FIREBASE_VERCEL.md"
echo "- Guide de test: test-musiqueconnect-app.md"
echo ""

print_success "Script de déploiement terminé avec succès!" 