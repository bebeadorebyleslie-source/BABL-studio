# BABL Studio - Beta Web Deployment (Expo + React Native Web)

Ce document explique la methode la plus simple pour publier une version beta accessible depuis un navigateur mobile (sans Expo Go).

## Objectif

- Publier une URL publique pour les tests utilisateurs smartphone.
- Garder un deploiement facile a mettre a jour apres chaque correctif.
- Assurer un comportement stable et proche de la version mobile actuelle.

## Scripts utiles

- `yarn web` : lance le mode dev web.
- `yarn build:web` : genere le build web de production dans `dist/`.
- `yarn build:web:clear` : build web de production avec cache nettoye.

## Solution recommandee: Vercel

Le projet est prepare pour Vercel avec `vercel.json`.

### 1) Premiere mise en ligne

1. Pousser le repo sur GitHub.
2. Creer un projet Vercel et connecter le repo.
3. Configurer le projet avec ces valeurs:
   - Root Directory: `frontend`
   - Build Command: `yarn build:web`
   - Output Directory: `dist`
   - Install Command: `yarn install --frozen-lockfile`
4. Lancer le deploy.

### 2) Domaine

- Ajouter le domaine de test (ex: `studio.babl.fr`) dans Vercel > Project > Domains.
- Configurer le DNS selon les instructions Vercel.

### 3) Mises a jour

- Chaque push sur la branche deploiement (ex: `main`) declenche un nouveau build automatiquement.
- Pour corriger rapidement en beta: commit -> push -> URL mise a jour.

## Verification pre-beta (checklist)

Avant d'envoyer le lien test, verifier:

1. Chargement mobile iOS/Android via navigateur (Safari/Chrome).
2. Aucune UI de developpement Expo visible.
3. Toutes les fonctions existantes OK (ajout, remplacement, suppression, limites metier).
4. Images et PNG charges correctement.
5. Responsive mobile conforme a la version actuelle.
6. Performances fluides (ouverture panneaux, interactions, scroll).

## Notes techniques

- `app.json` est configure en web output `single` (SPA).
- `vercel.json` force la redirection vers `index.html` pour les routes Expo Router.
- Un cache long est applique sur `assets/*` pour accelerer le chargement en production.

## Commandes locales de verification

Depuis `frontend/`:

```bash
yarn install --frozen-lockfile
yarn build:web
```

Si besoin de purge cache:

```bash
yarn build:web:clear
```

## Cadre beta

Priorites a partir de maintenant:

- stabilite,
- correction de bugs,
- ergonomie,
- optimisation.

Eviter toute nouvelle fonctionnalite non validee pendant la phase de tests utilisateurs.
