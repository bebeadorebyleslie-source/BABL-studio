# BABL Studio — PRD

## Vision
BABL Studio est un configurateur premium mobile permettant aux parents de créer eux-mêmes une attache-tétine personnalisée. L'expérience doit reproduire la sensation de composer une attache-tétine dans un atelier — jamais celle de remplir un formulaire.

## Stack
- **Frontend** : Expo (React Native) + expo-router
- **Backend** : Aucun (frontend-only pour l'instant)
- **Storage** : Aucun (sauvegarde future)

## Univers visuel
- Palette : beige (#ece5d8), blanc, kaki clair (#d4a574), bois naturel
- Style : minimaliste, premium, coins très arrondis, ombres très douces
- Inspiration : Apple, Canva, Notion

## Architecture actuelle
```
/app/frontend/
├── app/
│   ├── _layout.tsx        # Layout Stack (headerless)
│   └── index.tsx          # Écran principal (Sprint 1)
├── src/
│   ├── components/
│   │   ├── Header.tsx     # Header premium
│   │   └── Workspace.tsx  # Cœur de l'app (attache-tétine)
│   ├── data/
│   │   ├── composition.js # Liste des perles actuellement placées
│   │   └── catalog.js     # (à venir) Catalogue de perles disponibles
│   └── constants/
│       └── sizes.js       # MM=4, dimensions clip/template/max
└── assets/images/
    ├── clip.png           # Clip en bois
    ├── loop.png           # Boucle
    └── logo.png           # Logo BABL Studio
```

## Règles absolues
1. **Ne jamais casser** une fonctionnalité validée
2. **Ne jamais modifier** les proportions (clip, gabarit, perles) sans validation
3. **Modifications atomiques** — un sprint = une fonctionnalité
4. **Toujours compilable** entre chaque sprint

## Sprints livrés
### Sprint 1 — Habillage (LIVRÉ)
- Fond beige
- Grande carte blanche avec coins arrondis et ombre douce
- Header premium (hamburger + logo + favoris)
- Workspace préservé à l'identique

### Sprint 2 — Sidebar (LIVRÉ)
- Sidebar overlay avec animation slide fluide (280ms, cubic easing)
- Backdrop flouté (expo-blur, intensity 18) — Workspace toujours visible
- Largeur 62% de l'écran (max 320px) — plus discrète pour laisser voir l'attache
- 7 familles présentées en cartes premium (icône + titre + sous-titre)
- État "sélectionné" avec bordure kaki + fond crème (aucune navigation encore)
- Composants indépendants : `Sidebar.tsx`, `CategoryCard.tsx`, données `families.ts`
- Zéro impact sur le Workspace / composition / proportions

### Sprint 2.1 — Ergonomie (LIVRÉ)
- **Workspace auto-scale** : mise à l'échelle automatique via `transform: scale` calculé à partir de `onLayout` de la carte (`availableWidth` / `availableHeight`). L'attache-tétine complète est toujours visible, sans scroll, quelle que soit la longueur de la composition future.
- **Dimensions naturelles exportées** depuis `Workspace.tsx` (NATURAL_HEIGHT = 914px, NATURAL_WIDTH = 180px)
- **Sidebar plus discrète** : largeur passée de 80% à 62% (max 320px) — usage de `useWindowDimensions` pour réactivité

### Sprint 3 — Panneau Silicone ronde (LIVRÉ + vraies images)
- Bottom-sheet slide up depuis le bas (320ms cubic-out) avec backdrop très léger
- Handle drag visuel en haut du panneau
- Titre "Silicone ronde" + sous-titre dynamique (nom de la couleur sélectionnée)
- Bouton fermer (X) + tap sur backdrop
- **Sélecteur de taille 12 mm / 15 mm** en pastille segmentée (composant `SizeToggle` réutilisable)
- **25 perles réelles en PNG** disposées en 2 arcs concentriques :
  - Arc intérieur : 10 perles à R=100px
  - Arc extérieur : 15 perles à R=155px
  - Perles de 34px, hit area 46px
- **PNG individuels** extraits depuis le visuel produit → `/app/frontend/assets/images/silicone-ronde/sr-01.png` à `sr-25.png` (fond transparent conservé)
- **Interaction perle** : tap → spring scale (1 → 1.2) + halo kaki animé + nom affiché
- Sélection exclusive, **aucune perle n'est encore ajoutée à la composition**
- Composants : `panels/SiliconeRondePanel.tsx`, `panels/FanBead.tsx`, `SizeToggle.tsx`
- Données : `data/silicone-ronde-colors.ts` (nom + require d'image), `SILICONE_RONDE_SIZES = [12, 15]`

### Sprint 4 — Ajout à la composition (LIVRÉ)
- **Composition vide au démarrage** : `data/composition.js` exporte `[]` (gabarit prêt à accueillir les perles une à une)
- **Workspace passe désormais `composition` en prop** (au lieu d'import statique) → l'attache se met à jour en temps réel
- Workspace accepte perles avec `image` (PNG) ou `color` (rétrocompatible)
- **Bouton "Ajouter à mon attache"** en bas du panneau Silicone ronde :
  - Désactivé (fond crème, icône grise) tant qu'aucune couleur n'est sélectionnée
  - Activé (fond kaki foncé #5a4b3c, texte blanc, ombre) dès qu'une couleur est choisie
  - Clic → ajoute la perle à la composition avec la taille (12 ou 15 mm) et l'image PNG, puis désélectionne pour la perle suivante
- État de la composition géré dans `index.tsx` (`useState<CompositionBead[]>`)
- **20 noms de couleurs mis à jour** : Blanc, Poussière d'étoile, Marbre, Givre, Gris clair, Gris foncé, Argan, Bronze, Vert d'eau, Menthe, Vert tropicale, Kaki, Kaki clair, Jaune pâle, Moutarde, Ocre, Chocolat, Brume bleu, Saphir, Glycine, Orchidée, Rose quartz, Pêche, Terracotta, Rouge sombre

## Sprints à venir
- Sprint 5 : Sélection d'une perle dans la composition (tap → menu Remplacer / Supprimer)
- Sprint 4 : Interface silicone hexagonale (éventail spécifique)
- Sprint 5 : Interface crochet (éventail plus petit)
- Sprint 6 : Interface formes bois (galerie)
- Sprint 7 : Interface lettres (clavier alphabétique)
- Sprint 8 : Sélection perle existante (menu Remplacer / Supprimer)
- Sprint 9 : Animations
- Sprint 10 : Sauvegarde/favoris
