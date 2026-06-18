# courses-famille — notes pour les sessions Claude

> App rebrandée **"Le Frigo"** (titre home + nom PWA + icône). Le repo/projet Vercel reste "courses-famille".

## État actuel (maj 2026-05-25)

### Features livrées
- **Cases à cocher** + persistence localStorage par profil ; items cochés glissent en bas de section
- **Liste complète** : fusion des 3 listes par magasin, dédup des doublons (1 ligne/produit, badges multi-profil, prix sommé)
- **Date de génération** affichée (menus + courses), refresh auto chaque minute
- **Ajout/suppression manuelle** d'articles (items `manual:true` survivent au Regénérer)
- **Partage** 📤 (navigator.share + fallback presse-papier)
- **PWA installable** (manifest + meta Apple + icône)
- **Onglets Menus/Courses** activés aussi sur Liste complète (menus des 3 profils en parallèle)
- **Liens Drive** : badge magasin → Google site search (`site:lidl.fr produit`). Les 3 sites bloquent les bots, donc pas d'URL Drive directe fiable
- **Mode "1 seul magasin"** 🛍️ ("Tout livrer chez X" → réaffecte + refetch prix)
- **Templates** récurrents (💾 sauvegarder / 📋 Mes modèles sur l'accueil)
- **Total dynamique** selon filtre magasin/catégorie sélectionné
- **Option E (Lidl)** : badge Lidl orange ⚠️ → modale (Lidl ne livre pas l'alimentaire en FR) → bascule Leclerc/Super U **+ Option F** "📍 Trouver le Lidl le plus proche" (Google Maps)
- **🎯 Optimiser** : web search comparatif prix sur les **3 magasins** (Lidl inclus), réaffecte au moins cher, champ `prixAlternatives` → **comparatif stratégies** (tout Lidl / tout Leclerc / tout Super U / optimisé)
- **Indicateurs de coût API** estimés sous chaque action (Prix réels ≈$0.30, Optimiser ≈$0.80…)
- **Mode confort canapé** 🛋️ (gros boutons, filtres catégorie masqués, préf sauvée)
- **Menus favoris** ⭐ : étoile sur la **journée** ET sur **chaque repas** (clés LS `-favorites` et `-fav-meals`) → enrichissent le prompt de génération
- **Historique des paniers** 📊 ("✅ Valider ces courses" archive ; vue accueil avec total 30j + recréation)
- **Fiche recette** 📖 au clic sur un repas (génère ingrédients + étapes + astuces adaptés au régime, cache LS `-recipes`)

### En attente / prochaines étapes
1. **Diagnostic point-par-point du batch 2** (confort 🛋️ / favoris ⭐ / historique 📊) — jamais fait par l'utilisateur
2. **Suivi dépense/apport calorique** — CADRÉ, pas commencé. 3 questions ouvertes :
   - quels profils ont le suivi (Rénald+Gwénaëlle seuls, ou les 3 ?)
   - découpage validé : **Phase A** (calories sur repas + bouton "j'ai mangé" + dépense manuelle + dashboard) puis **Phase B** (pont app Santé via Raccourci iOS — HealthKit inaccessible aux PWA, seul un Shortcut `?kcal=` peut faire le pont, et seulement pour le porteur de l'iPhone)
   - objectifs caloriques par profil (proposés : Gwén 1400 / Rénald 2000 / Famille ~1800, éditables ?)
3. **Batch 3** : créneaux de livraison (memo manuel) + photo du frigo → liste auto (API vision)

### Notes techniques importantes
- **Coûts API** : l'app tape l'API Anthropic via clé Vercel = **facturé sur le compte API, PAS sur le plan Max**. Web search = `web_search_20250305`, `max_web_searches` configurable (cap 80) dans `route.js`
- **Auth GitHub** : remote propre (sans token dans l'URL), credential helper `osxkeychain`. Token fine-grained `planning-courses-push` (couvre courses-famille + planning-famille), **expire le 14 sept. 2026** → renouveler avant
- **Icône** : `public/icon.svg` (source) → frigo doré épuré, halo radial `diffuse` + couronne `ring`, fond `#130b06`. Régénérer les PNG via les commandes ci-dessous
- **Projet jumeau** : "planning-famille" (autre session/repo) — même utilisateur, même halo d'icône

## Déploiement
- **URL production** : https://courses-famille.vercel.app
- **Plateforme** : Vercel (compte de l'utilisateur, projet "courses-famille")
- **Auto-deploy** : chaque push sur `main` déclenche un build Vercel (~1-2 min)
- **Repo GitHub** : https://github.com/Breiz666/courses-famille

## Workflow utilisateur
- L'utilisateur consulte/teste l'app depuis son iPhone via Safari sur l'URL Vercel ci-dessus
- Il peut aussi installer l'app en PWA (Safari → Partager → "Sur l'écran d'accueil")
- Workflow de modif : édit local Mac → commit + push → Vercel rebuild → reload iPhone

## Variables d'environnement
- `ANTHROPIC_API_KEY` est configurée côté Vercel (utilisée par `/app/api/claude/route.js`)
- Pas besoin de `.env.local` pour le dev local sauf si on veut tester l'API en local

## Stack
- Next.js 14.2.3 (App Router)
- React 18
- Pas de Tailwind, pas de framework UI : styles inline
- Tout est dans `app/page.jsx` (composant unique "use client")
- API proxy minimal vers Anthropic dans `app/api/claude/route.js`
- LocalStorage : préfixe `courses-app-v1-`. Clés par profil : `{profileId}-{menus|courses|menus-generated|courses-generated|favorites|fav-meals}`. Clés globales : `templates`, `history`, `recipes`, `comfort`

## Profils
- `renald` (bleu #3B82F6, diabète T2)
- `gwenaelle` (violet #A855F7, hypocalorique)
- `famille` (orange #FFB347, enfants ×4)
- `complete` (vert #22C55E, "Liste complète" — fusionne les 3 listes par magasin avec dédup des doublons)

## Magasins ciblés
Lidl, Leclerc, Super U (utilisés dans tous les `coursesPrompt`)

## Commandes utiles
- `npm run dev` — dev server local (port 3000)
- `npm run build` — build de prod (à lancer avant push pour vérifier qu'il compile)
- `qlmanage -t -s 512 -o public public/icon.svg` puis `mv public/icon.svg.png public/icon.png` — régénérer l'icône PWA depuis le SVG source
