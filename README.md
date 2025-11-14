# Site Cloner Pro

Une application web complète permettant de cloner n'importe quel site web en téléchargeant le HTML, CSS, JavaScript et toutes les ressources associées.

## 🚀 Fonctionnalités

- **Clonage complet** : Téléchargement du HTML, CSS, JavaScript, images et fonts
- **Extraction intelligente** : Analyse automatique de toutes les ressources du site
- **Archive ZIP** : Génération d'une archive complète prête à l'emploi
- **Historique** : Gestion de tous vos sites clonés avec statut en temps réel
- **Interface moderne** : Interface utilisateur intuitive et responsive
- **Authentification** : Système d'authentification sécurisé avec OAuth
- **Stockage cloud** : Sauvegarde automatique sur S3

## 🛠️ Technologies utilisées

### Frontend
- React 19
- TypeScript
- Tailwind CSS 4
- tRPC pour l'API type-safe
- Wouter pour le routing
- Shadcn/ui pour les composants

### Backend
- Node.js avec Express
- tRPC Server
- Drizzle ORM
- MySQL
- Cheerio pour le parsing HTML
- Axios pour les requêtes HTTP
- Archiver pour la génération de ZIP
- AWS S3 pour le stockage

## 📦 Installation

```bash
# Cloner le dépôt
git clone https://github.com/scaryless/Site-Cloner.git
cd Site-Cloner

# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
# Créer un fichier .env avec les variables nécessaires

# Pousser le schéma de base de données
pnpm db:push

# Lancer le serveur de développement
pnpm dev
```

## 🔧 Configuration

Les variables d'environnement suivantes sont nécessaires :

- `DATABASE_URL` : URL de connexion à la base de données MySQL
- `JWT_SECRET` : Secret pour la génération des tokens JWT
- `OAUTH_SERVER_URL` : URL du serveur OAuth
- Variables S3 pour le stockage des fichiers

## 📖 Utilisation

1. **Se connecter** : Authentifiez-vous via OAuth
2. **Entrer l'URL** : Saisissez l'URL du site à cloner
3. **Cloner** : Cliquez sur "Cloner le site" et attendez la fin du processus
4. **Télécharger** : Téléchargez l'archive ZIP contenant le site complet
5. **Gérer** : Consultez l'historique et supprimez les sites si nécessaire

## 🏗️ Architecture

```
site-cloner/
├── client/           # Application React frontend
│   ├── src/
│   │   ├── pages/    # Pages de l'application
│   │   ├── components/ # Composants réutilisables
│   │   └── lib/      # Utilitaires et configuration
├── server/           # Backend Node.js
│   ├── _core/        # Configuration serveur
│   ├── cloner.router.ts # Routes API de clonage
│   └── routers.ts    # Routes principales
├── drizzle/          # Schéma de base de données
└── shared/           # Code partagé frontend/backend
```

## 🔐 Sécurité

- Authentification OAuth sécurisée
- Validation des URLs
- Protection contre les injections
- Gestion des erreurs robuste
- Timeout sur les requêtes HTTP

## 📝 Licence

MIT

## 👨‍💻 Auteur

Développé avec ❤️ par Samuel Carielus
