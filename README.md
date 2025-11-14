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

## ⚠️ **Configuration**

Les variables d'environnement suivantes sont nécessaires :

- `DATABASE_URL` : URL de connexion à la base de données MySQL
- `JWT_SECRET` : Secret pour la génération des tokens JWT (optionnel en mode développement)
- `OAUTH_SERVER_URL` : URL du serveur OAuth (optionnel, OAuth désactivé par défaut)

**Stockage des fichiers** : Les archives ZIP sont stockées localement dans le dossier `storage/` (pas besoin de configurer S3)

### Variables d'environnement optionnelles

Créez un fichier `.env` à la racine si vous souhaitez personnaliser :

```env
# URL de base pour accéder aux fichiers (par défaut http://localhost:3000)
BASE_URL=http://localhost:3000

# Port du serveur (par défaut 3000)
PORT=3000
```

## 📖 Utilisation

### Mode développement local (par défaut)

1. **Lancer l'app** : Vous êtes automatiquement connecté avec un utilisateur de test
2. **Entrer l'URL** : Saisissez l'URL du site à cloner (ex: https://example.com)
3. **Ajouter des cookies (optionnel)** : Pour les sites protégés par authentification, cliquez sur "Ajouter des cookies"
4. **Cloner** : Cliquez sur "Cloner le site" et attendez la fin du processus
5. **Télécharger** : Téléchargez l'archive ZIP contenant le site complet
6. **Gérer** : Consultez l'historique et supprimez les sites si nécessaire

### Cloner des sites protégés par authentification

Pour cloner des sites nécessitant une connexion, utilisez le système de **profils de cookies** :

1. **Créer un profil de cookies** :
   - Cliquez sur "Gérer les profils de cookies" dans l'interface
   - Entrez l'URL du site (ex: https://facebook.com)
   - Cliquez sur "Ouvrir le navigateur et capturer les cookies"
   - Un navigateur s'ouvrira automatiquement : **connectez-vous normalement au site**
   - Attendez 30 secondes : les cookies seront capturés automatiquement
   - Le profil apparaîtra dans votre liste avec le nom et logo du site

2. **Utiliser un profil pour cloner** :
   - Cliquez sur "Gérer les profils de cookies"
   - Sélectionnez le profil correspondant au site à cloner
   - Entrez l'URL du site et cliquez sur "Cloner le site"
   - Les cookies seront automatiquement utilisés pour accéder au contenu protégé

**Avantages** :
- ✅ Aucune manipulation technique
- ✅ Interface 100% visuelle
- ✅ Réutilisable pour plusieurs clonages
- ✅ Gestion facile de plusieurs comptes/sites

### Pour réactiver OAuth en production

1. Dans `server/_core/context.ts` : Décommentez le code OAuth et supprimez l'utilisateur mock
2. Dans `client/src/_core/hooks/useAuth.ts` : Décommentez le useEffect de redirection
3. Configurez les variables d'environnement OAuth

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

- **Mode développement** : Authentification mock (utilisateur de test)
- **Mode production** : Authentification OAuth sécurisée (désactivée par défaut)
- Validation des URLs
- Protection contre les injections
- Gestion des erreurs robuste
- Timeout sur les requêtes HTTP

## 📝 Licence

MIT

## 👨‍💻 Auteur

Développé avec ❤️ par Samuel Carielus
