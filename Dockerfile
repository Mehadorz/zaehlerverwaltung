
# Base image mit Node.js
FROM node:20-alpine

# Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiere package.json und package-lock.json
COPY package*.json ./

# Installiere Abhängigkeiten
RUN npm install

# Kopiere den restlichen Projektcode
COPY . .

# Baue die Anwendung
RUN npm run build

# Expose port 8080
EXPOSE 8080

# Starte die Anwendung
CMD ["npm", "run", "preview"]
