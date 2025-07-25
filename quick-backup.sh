#!/bin/bash

# Script de sauvegarde rapide MusiqueConnect
# Pour les sauvegardes quotidiennes

PROJECT_DIR="/Users/guillaumehetu/Downloads/project"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="MusiqueConnect_quick_${DATE}"

# Sauvegarde locale uniquement (rapide)
LOCAL_BACKUP_DIR="$HOME/Backups/MusiqueConnect"

echo "⚡ Sauvegarde rapide MusiqueConnect..."
echo "📅 Date: $(date)"

# Créer le répertoire de sauvegarde
mkdir -p "$LOCAL_BACKUP_DIR"

# Sauvegarde rapide
if [ -d "$PROJECT_DIR" ]; then
    echo "📁 Sauvegarde vers: $LOCAL_BACKUP_DIR/$BACKUP_NAME"
    cp -r "$PROJECT_DIR" "$LOCAL_BACKUP_DIR/$BACKUP_NAME"
    if [ $? -eq 0 ]; then
        echo "✅ Sauvegarde rapide réussie!"
        echo "📊 Taille: $(du -sh "$LOCAL_BACKUP_DIR/$BACKUP_NAME" | cut -f1)"
    else
        echo "❌ Erreur lors de la sauvegarde"
    fi
else
    echo "❌ Répertoire projet non trouvé: $PROJECT_DIR"
fi

echo "🎉 Sauvegarde rapide terminée!" 