# Utiliser Node.js 18 comme image de base
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Installer Express pour le serveur de production
RUN npm install express

# Exposer le port 8080
EXPOSE 8080

# Démarrer le serveur
CMD ["node", "server.js"] 