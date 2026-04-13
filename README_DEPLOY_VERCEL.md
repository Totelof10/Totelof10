# Déploiement du Frontend sur Vercel

Ce guide explique comment déployer le frontend React (Vite) de ce projet sur Vercel, en mode démo (mock API locale).

---

## Prérequis
- Un compte Vercel ([https://vercel.com/](https://vercel.com/))
- Ce dossier (`deploiement/`) contient déjà tout le nécessaire (Vite, mock API, Dockerfile inutile sur Vercel)

---

## Étapes de déploiement

### 1. Préparer le projet
- Vérifiez que le fichier `.env` contient :
  ```env
  VITE_DEMO_MODE=true
  VITE_API_URL=
  ```
- Supprimez ou ignorez le `Dockerfile` (Vercel n'en a pas besoin pour un projet React)

### 2. Pousser le code sur un dépôt Git (GitHub, GitLab, Bitbucket)
- Placez-vous dans le dossier `deploiement/`
- Initialisez un dépôt si besoin :
  ```bash
  git init
  git add .
  git commit -m "Initial commit for Vercel deployment"
  git remote add origin <votre-url-git>
  git push -u origin main
  ```

### 3. Importer le projet sur Vercel
- Connectez-vous à Vercel
- Cliquez sur **"Add New... > Project"**
- Sélectionnez votre dépôt
- Lors de la configuration :
  - **Framework Preset** : choisissez **Vite**
  - **Root Directory** : laissez vide ou mettez `.` si vous êtes dans `deploiement/`
  - **Build Command** : `pnpm run build` (ou `npm run build` si vous n'utilisez pas pnpm)
  - **Output Directory** : `dist`
  - **Environment Variables** : ajoutez `VITE_DEMO_MODE=true` et `VITE_API_URL=`

### 4. Lancer le déploiement
- Cliquez sur **Deploy**
- Attendez la fin du build (quelques secondes)
- Votre application est en ligne !

---

## Points importants
- **Aucune API externe n'est requise** : tout fonctionne en localStorage côté navigateur (mode démo)
- **Pas besoin de backend**
- **Les routes sont gérées côté client** (React Router)
- Pour les redirections SPA, Vercel gère automatiquement, mais vous pouvez ajouter un fichier `_redirects` si besoin

---

## Accès démo
- Identifiants de connexion :
  - **Utilisateur** : `demo`
  - **Mot de passe** : `demo123`

---

## Dépannage
- Si l'app ne se lance pas, vérifiez les variables d'environnement sur Vercel
- Si vous voyez une page blanche, vérifiez que le build s'est bien passé (`dist/` généré)
- Pour toute erreur, consultez les logs de build sur Vercel

---

## Liens utiles
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Vite](https://vitejs.dev/guide/static-deploy.html)
