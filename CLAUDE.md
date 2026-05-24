# courses-famille — notes pour les sessions Claude

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
- LocalStorage pour persistence : préfixe `courses-app-v1-{profileId}-{menus|courses|menus-generated|courses-generated}`

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
