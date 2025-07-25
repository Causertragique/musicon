# 📦 Guide de Sauvegarde MusiqueConnect

## 🎯 Objectif
Sauvegarder le projet MusiqueConnect sur trois supports :
- 💻 **Ordinateur local** (sauvegarde quotidienne)
- ☁️ **Cloud** (Google Drive, sauvegarde hebdomadaire)
- 💾 **Disque dur externe** (sauvegarde complète)

## 🚀 Scripts Disponibles

### 1. Sauvegarde Complète (`backup-script.sh`)
```bash
./backup-script.sh
```
**Fonctionnalités :**
- ✅ Sauvegarde sur les 3 supports
- 🧹 Nettoyage automatique (garde les 5 plus récentes)
- 📊 Rapport détaillé
- ⏰ Horodatage automatique

### 2. Sauvegarde Rapide (`quick-backup.sh`)
```bash
./quick-backup.sh
```
**Fonctionnalités :**
- ⚡ Sauvegarde locale uniquement
- 🚀 Exécution rapide
- 📊 Affichage de la taille

## 📁 Structure des Sauvegardes

```
~/Backups/MusiqueConnect/
├── MusiqueConnect_backup_20241201_143022/
├── MusiqueConnect_backup_20241201_150045/
├── MusiqueConnect_quick_20241201_160030/
└── ...

~/Google Drive/Backups/MusiqueConnect/
├── MusiqueConnect_backup_20241201_143022/
└── ...

/Volumes/EXTERNAL_DRIVE/Backups/MusiqueConnect/
├── MusiqueConnect_backup_20241201_143022/
└── ...
```

## 🔧 Configuration

### Chemins de Sauvegarde
- **Local** : `~/Backups/MusiqueConnect/`
- **Cloud** : `~/Google Drive/Backups/MusiqueConnect/`
- **Externe** : `/Volumes/EXTERNAL_DRIVE/Backups/MusiqueConnect/`

### Personnalisation
Modifiez les chemins dans `backup-script.sh` selon votre configuration :

```bash
# Pour iCloud Drive
CLOUD_BACKUP_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Backups/MusiqueConnect"

# Pour Dropbox
CLOUD_BACKUP_DIR="$HOME/Dropbox/Backups/MusiqueConnect"

# Pour un disque externe spécifique
EXTERNAL_BACKUP_DIR="/Volumes/MON_DISQUE/Backups/MusiqueConnect"
```

## 📅 Planification des Sauvegardes

### Automatisation avec crontab
```bash
# Éditer le crontab
crontab -e

# Ajouter ces lignes :
# Sauvegarde rapide quotidienne à 18h
0 18 * * * /Users/guillaumehetu/Downloads/project/quick-backup.sh

# Sauvegarde complète hebdomadaire le dimanche à 20h
0 20 * * 0 /Users/guillaumehetu/Downloads/project/backup-script.sh
```

### Sauvegarde Manuelle
```bash
# Sauvegarde rapide
./quick-backup.sh

# Sauvegarde complète
./backup-script.sh
```

## 🔍 Vérification des Sauvegardes

### Lister les sauvegardes
```bash
# Sauvegardes locales
ls -la ~/Backups/MusiqueConnect/

# Sauvegardes cloud
ls -la ~/Google\ Drive/Backups/MusiqueConnect/

# Sauvegardes externes
ls -la /Volumes/EXTERNAL_DRIVE/Backups/MusiqueConnect/
```

### Vérifier l'intégrité
```bash
# Comparer les tailles
du -sh ~/Backups/MusiqueConnect/*
du -sh ~/Google\ Drive/Backups/MusiqueConnect/*
du -sh /Volumes/EXTERNAL_DRIVE/Backups/MusiqueConnect/*
```

## 🚨 Récupération

### Restaurer une sauvegarde
```bash
# 1. Arrêter le serveur de développement
pkill -f "vite"

# 2. Sauvegarder l'état actuel
./quick-backup.sh

# 3. Restaurer la sauvegarde souhaitée
cp -r ~/Backups/MusiqueConnect/MusiqueConnect_backup_YYYYMMDD_HHMMSS/ /Users/guillaumehetu/Downloads/project_restored/

# 4. Vérifier la restauration
cd /Users/guillaumehetu/Downloads/project_restored/
npm install
npm run dev
```

## 📋 Checklist de Sauvegarde

### Avant une Sauvegarde
- [ ] Tous les fichiers sont sauvegardés
- [ ] Le serveur de développement est arrêté
- [ ] Les modifications importantes sont commitées
- [ ] Le disque externe est connecté (si sauvegarde complète)

### Après une Sauvegarde
- [ ] Vérifier que les 3 sauvegardes sont créées
- [ ] Contrôler les tailles des sauvegardes
- [ ] Tester la restauration sur un répertoire temporaire
- [ ] Noter la date de la prochaine sauvegarde

## 🛠️ Dépannage

### Problèmes Courants

**❌ Google Drive non trouvé**
```bash
# Vérifier le chemin
ls -la ~/Google\ Drive/
# Si différent, modifier le script
```

**❌ Disque externe non trouvé**
```bash
# Vérifier le nom du volume
ls /Volumes/
# Modifier EXTERNAL_BACKUP_DIR dans le script
```

**❌ Permissions insuffisantes**
```bash
# Rendre le script exécutable
chmod +x backup-script.sh
chmod +x quick-backup.sh
```

## 📞 Support

En cas de problème :
1. Vérifiez les chemins dans les scripts
2. Contrôlez les permissions
3. Testez manuellement chaque étape
4. Consultez les logs d'erreur

---
**Dernière mise à jour :** $(date)
**Version :** 1.0 