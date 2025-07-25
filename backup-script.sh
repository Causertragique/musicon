#!/bin/bash

# Script de sauvegarde MusiqueConnect
# Sauvegarde sur Cloud, Ordinateur local et Disque dur externe

# Configuration
PROJECT_NAME="MusiqueConnect"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="${PROJECT_NAME}_backup_${DATE}"

# Chemins de sauvegarde adaptés à votre système
LOCAL_BACKUP_DIR="$HOME/Backups/MusiqueConnect"
CLOUD_BACKUP_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Backups/MusiqueConnect"
EXTERNAL_BACKUP_DIR="/Volumes/Guillaume 2/Backups/MusiqueConnect"

# Répertoire du projet
PROJECT_DIR="/Users/guillaumehetu/Downloads/project"

# Créer les répertoires de sauvegarde s'ils n'existent pas
mkdir -p "$LOCAL_BACKUP_DIR"
mkdir -p "$CLOUD_BACKUP_DIR"
mkdir -p "$EXTERNAL_BACKUP_DIR"

echo "🔄 Début de la sauvegarde MusiqueConnect..."
echo "📅 Date: $(date)"
echo "📦 Nom du backup: $BACKUP_NAME"

# Fonction pour créer une sauvegarde
create_backup() {
    local source_dir="$1"
    local backup_path="$2"
    
    if [ -d "$source_dir" ]; then
        echo "📁 Sauvegarde vers: $backup_path"
        cp -r "$source_dir" "$backup_path"
        if [ $? -eq 0 ]; then
            echo "✅ Sauvegarde réussie: $backup_path"
        else
            echo "❌ Erreur lors de la sauvegarde: $backup_path"
        fi
    else
        echo "⚠️  Répertoire source non trouvé: $source_dir"
    fi
}

# 1. Sauvegarde locale (Ordinateur)
echo ""
echo "💻 === SAUVEGARDE LOCALE ==="
create_backup "$PROJECT_DIR" "$LOCAL_BACKUP_DIR/$BACKUP_NAME"

# 2. Sauvegarde Cloud (iCloud Drive)
echo ""
echo "☁️  === SAUVEGARDE CLOUD (iCloud) ==="
if [ -d "$HOME/Library/Mobile Documents/com~apple~CloudDocs" ]; then
    create_backup "$PROJECT_DIR" "$CLOUD_BACKUP_DIR/$BACKUP_NAME"
else
    echo "⚠️  iCloud Drive non trouvé. Vérifiez le chemin: $HOME/Library/Mobile Documents/com~apple~CloudDocs"
fi

# 3. Sauvegarde Disque dur externe (Guillaume 2)
echo ""
echo "💾 === SAUVEGARDE DISQUE EXTERNE (Guillaume 2) ==="
if [ -d "/Volumes/Guillaume 2" ]; then
    create_backup "$PROJECT_DIR" "$EXTERNAL_BACKUP_DIR/$BACKUP_NAME"
else
    echo "⚠️  Disque dur 'Guillaume 2' non trouvé. Vérifiez le chemin: /Volumes/Guillaume 2"
    echo "💡 Connectez votre disque dur 'Guillaume 2' et relancez le script"
fi

# Nettoyage des anciennes sauvegardes (garder les 5 plus récentes)
echo ""
echo "🧹 === NETTOYAGE DES ANCIENNES SAUVEGARDES ==="

cleanup_old_backups() {
    local backup_dir="$1"
    local max_backups=5
    
    if [ -d "$backup_dir" ]; then
        echo "Nettoyage de: $backup_dir"
        cd "$backup_dir"
        ls -t | tail -n +$((max_backups + 1)) | xargs -r rm -rf
        echo "✅ Nettoyage terminé pour: $backup_dir"
    fi
}

cleanup_old_backups "$LOCAL_BACKUP_DIR"
cleanup_old_backups "$CLOUD_BACKUP_DIR"
cleanup_old_backups "$EXTERNAL_BACKUP_DIR"

# Résumé final
echo ""
echo "🎉 === SAUVEGARDE TERMINÉE ==="
echo "📊 Résumé des sauvegardes:"
echo "   💻 Local: $LOCAL_BACKUP_DIR/$BACKUP_NAME"
echo "   ☁️  iCloud: $CLOUD_BACKUP_DIR/$BACKUP_NAME"
echo "   💾 Guillaume 2: $EXTERNAL_BACKUP_DIR/$BACKUP_NAME"
echo ""
echo "📅 Prochaine sauvegarde recommandée: $(date -v+7d '+%Y-%m-%d')"
echo "✅ Sauvegarde complète terminée avec succès!" 