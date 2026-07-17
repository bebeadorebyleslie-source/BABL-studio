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

### Sprint 3 — Panneau Silicone ronde (LIVRÉ)
- Bottom-sheet slide up depuis le bas (320ms cubic-out) avec backdrop très léger (18% opacity)
- Handle drag visuel en haut du panneau
- Titre "Silicone ronde" + sous-titre dynamique ("Choisissez une couleur" → nom de la couleur sélectionnée)
- Bouton fermer (X) + tap sur backdrop
- **25 perles en éventail radial** disposées en 2 arcs concentriques semi-circulaires :
  - Arc intérieur : 10 perles à R=100px
  - Arc extérieur : 15 perles à R=155px
  - Perles de 30px, espacement ~4-5px sur l'arc
  - Fan center = point virtuel bas (comme une poignée d'éventail)
- **Interaction perle** :
  - Tap → agrandissement spring (scale 1 → 1.18) + halo kaki (bordure animée)
  - Sélection exclusive (une seule perle à la fois)
  - **Aucune perle n'est ajoutée à la composition** (Sprint 3 = validation uniquement)
- **Le Workspace reste toujours visible** en haut (clip, gabarit, perles, boucle)
- Composants : `panels/SiliconeRondePanel.tsx`, `panels/FanBead.tsx` réutilisable
- Palette temporaire : `data/silicone-ronde-colors.ts` (25 couleurs pastel, à remplacer par les vrais PNG)

## Sprints à venir
- Sprint 4 : Interface silicone hexagonale (éventail spécifique)
- Sprint 4 : Interface silicone hexagonale (éventail spécifique)
- Sprint 5 : Interface crochet (éventail plus petit)
- Sprint 6 : Interface formes bois (galerie)
- Sprint 7 : Interface lettres (clavier alphabétique)
- Sprint 8 : Sélection perle existante (menu Remplacer / Supprimer)
- Sprint 9 : Animations
- Sprint 10 : Sauvegarde/favoris
