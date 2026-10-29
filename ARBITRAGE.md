# Arbitrage : site classique ou site moderne

Le temps de choisir, le site existe en deux versions qui partagent **le même contenu** :

| | Classique | Moderne |
|---|---|---|
| Adresse | `/` | `/moderne` (non indexée) |
| Page en base | la page d'accueil (`isHome`) | la page `accueil-moderne` |
| Sections | les blocs classiques | les blocs `theme: 'moderne'` (`src/blocks/moderne/blocs.tsx`) |
| Éditeur | `/admin/accueil` | `/admin/accueil?theme=moderne` (bascule dans la barre de l'éditeur) |

**Partagé entre les deux** : réglages (nom, coordonnées, horaires, logo), accompagnements, questions, médias.
Les **textes** des blocs modernes suivent ceux du site classique (« Qui je suis » → « Rencontre », « Ma méthode » → « Le chemin »…) tant que leurs champs restent vides.

Les visiteurs passent de l'un à l'autre par la bascule « Classique | Moderne » dans la navigation (`BasculeVersion`).

---

## On garde le CLASSIQUE — supprimer le moderne

1. Fichiers à supprimer :
   - `src/blocks/moderne/`
   - `src/components/anasawi/`
   - `src/app/moderne/`
   - `src/server/moderne.ts`
   - `src/components/site/BasculeVersion.tsx`
   - (démonstration) `src/app/qeeps/`, `src/components/qeeps/`
2. Retirer les branchements :
   - `src/blocks/registry.ts` : les imports `./moderne/blocs`, les 10 entrées `m…` du registre et de `CATEGORY_OF`.
   - `src/blocks/types.ts` : `partage` (BlockContext) et l'import de `Contenu` (le champ `theme` peut rester).
   - `src/components/site/SectionsViewCore.tsx` : `partage` (SectionsViewData, buildBlockContext) et la branche `block.theme === 'moderne'`.
   - `src/server/queries/index.ts` : le bloc « Version moderne » (`SLUG_MODERNE`, `getModernPageForAdmin`, `getPublishedModern`).
   - `src/app/(admin)/admin/accueil/page.tsx` : le paramètre `theme`, `assurerPageModerne`, `chargerContenu`.
   - `src/components/admin/editor/EditorTopBar.tsx` : la bascule « Classique | Moderne » (remettre le titre de la page).
   - `src/components/site/Header.tsx` : les deux `BasculeVersion`.
   - `src/styles/globals.css` : le bloc `/nouvelle-da — LES COMPOSANTS PROPRES…` et les `@keyframes ad-*`, `q-*` ; les blocs `.qeeps-da`.
   - `next.config.ts` : les redirections `/nouvelle-da`.
3. En base : supprimer la page `accueil-moderne` (ses sections partent avec elle, clé étrangère en cascade).

## On garde le MODERNE — en faire le site

1. En base : passer la page `accueil-moderne` en page d'accueil (`isHome = true`) et l'ancienne à `false` (ou la supprimer).
2. Servir `/` avec le rendu de `src/app/moderne/page.tsx` (barre `Fil`, sections, pied `Horizon`) et un layout `.ad` ; retirer le chrome classique de `src/app/(site)/layout.tsx` (en-tête, pied, rideau, grain).
3. Retirer les blocs classiques du registre (ou les garder cachés de l'éditeur), `BasculeVersion`, la bascule de l'éditeur, le paramètre `theme`.
4. Remplacer, dans `src/blocks/moderne/contenu.ts`, la lecture des textes « classiques » par les champs des blocs modernes (ils deviennent la seule source).
5. Auto-héberger Plus Jakarta Sans (`next/font/local`) à la place de `PoliceModerne` (Google Fonts).
6. Indexer la page (retirer `robots: noindex` de `src/app/moderne/layout.tsx`) et rebrancher le JSON-LD de `src/app/(site)/page.tsx`.

Dans les deux cas : `npm run typecheck`, `npm run lint`, `npm test`.
