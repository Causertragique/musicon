#!/bin/bash

# Script de déploiement manuel MusiqueConnect
# Utilise le token Firebase qui fonctionne

echo "🚀 Déploiement MusiqueConnect - Manuel"
echo "======================================"

# Token Firebase (utilise la variable d'environnement)
FIREBASE_TOKEN="${FIREBASE_TOKEN}"

if [ -z "$FIREBASE_TOKEN" ]; then
    echo "❌ Erreur : Variable d'environnement FIREBASE_TOKEN non définie"
    exit 1
fi

echo "📦 Build de l'application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi"
    
    echo "🚀 Déploiement sur Firebase..."
    firebase deploy --only hosting --token "$FIREBASE_TOKEN"
    
    if [ $? -eq 0 ]; then
        echo "🎉 Déploiement réussi !"
        echo "🌐 URL : https://musiqueconnect-ac841.web.app"
    else
        echo "❌ Erreur de déploiement"
        exit 1
    fi
else
    echo "❌ Erreur de build"
    exit 1
fi 