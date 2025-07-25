#!/bin/bash

# 🚀 Script de Déploiement Firebase - MusiqueConnect
# Ce script automatise le build et le déploiement Firebase

echo "🚀 Déploiement Firebase - MusiqueConnect"
echo "========================================"

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le répertoire racine du projet."
    exit 1
fi

# Étape 1: Build de l'application
echo ""
echo "🔨 Étape 1: Build de l'application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors du build. Arrêt du déploiement."
    exit 1
fi

echo "✅ Build réussi"

# Étape 2: Vérifier que dist/ existe
if [ ! -d "dist" ]; then
    echo "❌ Erreur: Dossier dist/ manquant après le build."
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo "❌ Erreur: dist/index.html manquant après le build."
    exit 1
fi

echo "✅ Fichiers de build vérifiés"

# Étape 3: Déploiement Firebase
echo ""
echo "🚀 Étape 2: Déploiement Firebase..."

# Option: déploiement complet ou hosting seulement
if [ "$1" = "--hosting-only" ]; then
    echo "📦 Déploiement hosting seulement..."
    firebase deploy --only hosting
else
    echo "📦 Déploiement complet..."
    firebase deploy
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Déploiement réussi !"
    echo "🌐 Votre application est maintenant en ligne"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "1. Testez l'application sur l'URL Firebase"
    echo "2. Configurez votre domaine personnalisé si nécessaire"
    echo "3. Vérifiez que toutes les fonctionnalités marchent"
else
    echo ""
    echo "❌ Erreur lors du déploiement"
    echo "🔧 Vérifiez:"
    echo "   - Votre connexion Firebase CLI"
    echo "   - Les permissions sur le projet"
    echo "   - La configuration firebase.json"
    echo ""
    echo "📖 Consultez: docs/guides/CORRECTION_FIREBASE_REPERTOIRE_RACINE.md"
    exit 1
fi 