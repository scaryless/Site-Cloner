# Site Cloner - TODO

## Fonctionnalités principales

- [x] Interface utilisateur pour saisir l'URL du site à cloner
- [x] Backend API pour récupérer le HTML d'un site distant
- [x] Extraction et téléchargement de toutes les ressources CSS
- [x] Extraction et téléchargement de toutes les ressources JavaScript
- [x] Extraction et téléchargement de toutes les images
- [x] Extraction et téléchargement de toutes les fonts
- [x] Reconstruction de la structure complète du site cloné
- [x] Stockage des sites clonés dans la base de données
- [x] Téléchargement du site cloné en archive ZIP
- [x] Prévisualisation du site cloné
- [x] Gestion de l'historique des clonages par utilisateur
- [x] Création du dépôt GitHub "Site-Cloner"
- [x] Push du code sur GitHub

## Modifications pour développement local

- [x] Désactiver OAuth dans le backend
- [x] Créer un système d'authentification mock
- [x] Modifier le frontend pour utiliser l'auth mock
- [x] Mettre à jour la documentation
- [x] Pousser les modifications sur GitHub

## Remplacement S3 par stockage local

- [x] Créer un module de stockage local
- [x] Modifier le router de clonage pour utiliser le stockage local
- [x] Servir les fichiers statiques via Express
- [x] Mettre à jour la documentation
- [x] Pousser les modifications sur GitHub

## Gestion des cookies pour sites protégés

- [x] Ajouter une table pour stocker les cookies dans la base de données
- [x] Créer l'interface pour saisir/modifier les cookies
- [x] Modifier le backend pour envoyer les cookies avec les requêtes
- [x] Créer un bookmarklet pour extraire automatiquement les cookies du navigateur
- [x] Ajouter une option "Utiliser les cookies" dans le formulaire de clonage
- [x] Documenter l'utilisation des cookies
- [x] Pousser les modifications sur GitHub

## Simplification de la gestion des cookies (capture automatique)

- [x] Créer une table pour stocker les profils de cookies par domaine
- [x] Installer Puppeteer pour contrôler le navigateur
- [x] Créer une API pour ouvrir un navigateur et capturer les cookies
- [x] Créer l'interface pour gérer les profils de cookies (liste visuelle)
- [x] Permettre de sélectionner un profil lors du clonage
- [x] Supprimer l'ancienne interface JSON (bookmarklet)
- [x] Mettre à jour la documentation
- [x] Pousser les modifications sur GitHub

## Amélioration de la capture de cookies

- [x] Détecter automatiquement quand l'utilisateur s'est connecté
- [x] Envoyer une notification de fin de capture
- [x] Fermer automatiquement le navigateur après capture
- [x] Mettre à jour l'interface avec feedback en temps réel
- [ ] Pousser les modifications sur GitHub
