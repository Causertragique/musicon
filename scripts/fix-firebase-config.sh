#!/bin/bash

# 🔧 Script de Diagnostic et Correction Firebase - MusiqueConnect
# Ce script diagnostique et corrige les problèmes de configuration Firebase

echo "🔧 Diagnostic de la Configuration Firebase"
echo "=========================================="

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le répertoire racine du projet."
    exit 1
fi

echo "✅ Répertoire racine détecté"

# Vérifier la structure du projet
echo ""
echo "📁 Structure du projet:"
echo "- package.json: $(test -f package.json && echo "✅ Présent" || echo "❌ Manquant")"
echo "- firebase.json: $(test -f firebase.json && echo "✅ Présent" || echo "❌ Manquant")"
echo "- dist/: $(test -d dist && echo "✅ Présent" || echo "❌ Manquant")"
echo "- dist/index.html: $(test -f dist/index.html && echo "✅ Présent" || echo "❌ Manquant")"

# Vérifier le contenu de firebase.json
echo ""
echo "📋 Configuration firebase.json:"
if [ -f "firebase.json" ]; then
    echo "✅ firebase.json trouvé"
    echo "📄 Contenu de la section hosting:"
    cat firebase.json | grep -A 10 '"hosting"'
else
    echo "❌ firebase.json manquant"
fi

# Vérifier le build
echo ""
echo "🔨 Vérification du build:"
if [ ! -d "dist" ]; then
    echo "⚠️  Dossier dist manquant. Lancement du build..."
    npm run build
    if [ $? -eq 0 ]; then
        echo "✅ Build réussi"
    else
        echo "❌ Erreur lors du build"
        exit 1
    fi
else
    echo "✅ Dossier dist présent"
fi

# Vérifier les fichiers essentiels dans dist
echo ""
echo "📄 Fichiers dans dist/:"
ls -la dist/ | head -10

# Configuration recommandée
echo ""
echo "🎯 Configuration Recommandée:"
echo "============================="
echo ""
echo "1. Dans Firebase Console:"
echo "   - Allez dans Project Settings > General"
echo "   - Vérifiez que le Project ID est correct"
echo ""
echo "2. Dans Firebase Console > Hosting:"
echo "   - Répertoire racine: . (point) ou laissez vide"
echo "   - Dossier public: dist"
echo "   - Fichier d'index: index.html"
echo ""
echo "3. Vérifiez que firebase.json contient:"
echo '   "hosting": {'
echo '     "public": "dist",'
echo '     "ignore": [...],'
echo '     "rewrites": [...]'
echo '   }'

# Test de déploiement local
echo ""
echo "🧪 Test de déploiement local:"
echo "firebase serve --only hosting"
echo ""
echo "Pour déployer en production:"
echo "firebase deploy --only hosting"

echo ""
echo "✅ Diagnostic terminé" 