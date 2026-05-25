"use client";
import { useState, useEffect } from "react";

const PROFILES = {
  renald: {
    id: "renald", name: "Rénald", emoji: "👨", color: "#3B82F6", regime: "Diabétique type 2",
    menuPrompt: `Tu es nutritionniste expert diabète type 2. Génère un plan de menus pour 7 jours pour UN adulte diabétique type 2. Règles : index glycémique bas (<55), pas de sucres raffinés, pas de pain blanc, pas de riz blanc, riche en fibres et protéines maigres. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans balises markdown : {"jours":[{"jour":"Lundi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Mardi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Mercredi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Jeudi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Vendredi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Samedi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Dimanche","petit_dejeuner":"...","dejeuner":"...","diner":"..."}]}`,
    coursesPrompt: `Liste de courses 1 semaine, 1 adulte diabétique type 2 (IG bas, fibres, protéines maigres, légumes verts). Maximum 20 produits. JSON UNIQUEMENT, sans markdown : {"liste":[{"produit":"...","quantite":"...","categorie":"...","magasin":"...","prix":"...€"}]}. Catégories: Légumes, Protéines, Féculents, Produits laitiers, Fruits, Épicerie. Magasins: Lidl, Leclerc, Super U.`
  },
  gwenaelle: {
    id: "gwenaelle", name: "Gwénaëlle", emoji: "👩", color: "#A855F7", regime: "Hypocalorique",
    menuPrompt: `Tu es nutritionniste expert régimes hypocaloriques. Génère un plan de menus pour 7 jours pour une adulte en régime hypocalorique (max 1400 kcal/jour). Règles : haute satiété, faible densité énergétique, légumes, protéines maigres, peu de graisses saturées. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans balises markdown : {"jours":[{"jour":"Lundi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Mardi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Mercredi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Jeudi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Vendredi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Samedi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Dimanche","petit_dejeuner":"...","dejeuner":"...","diner":"..."}]}`,
    coursesPrompt: `Liste de courses 1 semaine, 1 adulte régime hypocalorique 1400 kcal/jour (satiété, légumes, protéines maigres). Maximum 20 produits. JSON UNIQUEMENT, sans markdown : {"liste":[{"produit":"...","quantite":"...","categorie":"...","magasin":"...","prix":"...€"}]}. Catégories: Légumes, Protéines, Féculents, Produits laitiers, Fruits, Épicerie. Magasins: Lidl, Leclerc, Super U.`
  },
  famille: {
    id: "famille", name: "Famille", emoji: "👨‍👩‍👧‍👦", color: "#FFB347", regime: "Enfants ×4",
    menuPrompt: `Tu es nutritionniste spécialisé alimentation enfants. Génère un plan de menus pour 7 jours pour 4 enfants (6-14 ans). Règles : aliments simples (pâtes, riz, jambon, poulet, fromage, yaourts), facile à préparer. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans balises markdown : {"jours":[{"jour":"Lundi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Mardi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Mercredi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Jeudi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Vendredi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Samedi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Dimanche","petit_dejeuner":"...","dejeuner":"...","diner":"..."}]}`,
    coursesPrompt: `Liste de courses 1 semaine, 4 enfants 6-14 ans (pâtes, riz, jambon, poulet, fromage, yaourts, pain de mie). Maximum 20 produits. JSON UNIQUEMENT, sans markdown : {"liste":[{"produit":"...","quantite":"...","categorie":"...","magasin":"...","prix":"...€"}]}. Catégories: Légumes, Protéines, Féculents, Produits laitiers, Fruits, Épicerie, Boulangerie. Magasins: Lidl, Leclerc, Super U.`
  }
};

const COMPLETE_PROFILE = {
  id: "complete",
  name: "Liste complète",
  emoji: "🛒",
  color: "#22C55E",
  regime: "Rénald + Gwénaëlle + Enfants — fusionnée par magasin"
};

const ALL_PROFILES_ARR = [PROFILES.renald, PROFILES.gwenaelle, PROFILES.famille];

const CAT_COLORS = {
  "Légumes":"#4CAF50","Protéines":"#FF5722","Féculents":"#FF9800",
  "Produits laitiers":"#2196F3","Fruits":"#E91E63","Épicerie":"#9C27B0",
  "Snacks":"#795548","Boissons":"#00BCD4","Boulangerie":"#8BC34A","Autre":"#888"
};

const REPAS_ICONS = { petit_dejeuner:"☀️", dejeuner:"🌤️", diner:"🌙" };
const REPAS_LABELS = { petit_dejeuner:"Petit-déjeuner", dejeuner:"Déjeuner", diner:"Dîner" };

const MAGASINS_DEFAULT = ["Lidl", "Leclerc", "Super U"];
const CATEGORIES_DEFAULT = ["Légumes", "Protéines", "Féculents", "Produits laitiers", "Fruits", "Épicerie", "Boulangerie", "Snacks", "Boissons", "Autre"];

const LS_PREFIX = "courses-app-v1";
const loadLS = (key) => {
  if (typeof window === "undefined") return null;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
};
const saveLS = (key, val) => {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

async function callClaude(prompt, opts = {}) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      web_search: !!opts.webSearch,
      max_web_searches: opts.maxWebSearches
    })
  });
  const data = await res.json();
  const text = (data.content || [])
    .filter(b => b.type === "text")
    .map(b => b.text || "")
    .join("");
  const clean = text.replace(/```json|```/g, "").trim();
  const first = clean.indexOf("{");
  const last = clean.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("No JSON in response");
  return JSON.parse(clean.substring(first, last + 1));
}

const parsePrice = (s) => {
  if (!s) return 0;
  const m = String(s).match(/(\d+[.,]?\d*)/);
  if (!m) return 0;
  return parseFloat(m[0].replace(",", ".")) || 0;
};

const computeTotal = (items) => (items || []).reduce((a, i) => a + parsePrice(i.prix), 0);

const formatRelative = (ts) => {
  if (!ts) return null;
  const diff = Date.now() - ts;
  if (diff < 0) return "à l'instant";
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `il y a ${d}j`;
};

const sortByChecked = (arr) => [...arr].sort((a, b) => (a.checked ? 1 : 0) - (b.checked ? 1 : 0));

// Cost estimates per action (Anthropic API : tokens + web searches)
const COSTS = {
  generate: "≈ $0.05",        // genCourses / genMenus pour 1 profil
  generateAll: "≈ $0.15",     // genCourses / genMenus pour profil "complete" (×3)
  refresh: "≈ $0.30",         // refreshPrices (~25 web searches)
  optimize: "≈ $0.80",        // optimizePrices (~60-75 web searches sur 3 magasins)
  concentrate: "≈ $0.30"      // concentrateMagasin (déclenche refreshPrices)
};

// Build a Google site-search URL for a given store + product
// Note: tested Lidl/Leclerc/Coursesu direct search URLs all failed or were
// unverifiable (403 bot blocking). Google site search is the only reliable
// option that always works — costs 1 extra click but lands on the right product.
const driveURL = (magasin, produit) => {
  const m = (magasin || "").toLowerCase();
  let site = "";
  if (m.includes("lidl")) site = "lidl.fr";
  else if (m.includes("leclerc")) site = "leclercdrive.fr";
  else if (m.includes("super u") || m === "u" || m.includes("coursesu")) site = "coursesu.com";
  const query = site ? `site:${site} ${produit || ""}` : `${produit || ""} ${magasin || ""}`;
  return `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`;
};

// Merge duplicate products across the 3 profiles' lists into single rows
const mergeDuplicates = (items) => {
  const norm = s => (s || "").trim().toLowerCase();
  const map = new Map();
  items.forEach(item => {
    const key = norm(item.produit);
    if (!map.has(key)) {
      const { pour, pourColor, ...rest } = item;
      map.set(key, {
        ...rest,
        pours: pour ? [{ name: pour, color: pourColor }] : [],
        _quantites: [item.quantite].filter(Boolean),
        _prixTotal: parsePrice(item.prix)
      });
    } else {
      const ex = map.get(key);
      if (item.pour) ex.pours.push({ name: item.pour, color: item.pourColor });
      if (item.quantite) ex._quantites.push(item.quantite);
      ex._prixTotal += parsePrice(item.prix);
    }
  });
  return Array.from(map.values()).map(it => ({
    ...it,
    quantite: it._quantites.join(" + "),
    prix: it._prixTotal > 0 ? `${it._prixTotal.toFixed(2)}€` : it.prix
  }));
};

export default function App() {
  const [screen, setScreen] = useState("home");
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("menus");
  const [menus, setMenus] = useState(null);
  const [courses, setCourses] = useState(null);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [errorMenus, setErrorMenus] = useState(null);
  const [errorCourses, setErrorCourses] = useState(null);
  const [filterCat, setFilterCat] = useState("Toutes");
  const [filterMag, setFilterMag] = useState("Tous");
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [totals, setTotals] = useState({ renald: 0, gwenaelle: 0, famille: 0, complete: 0 });
  const [coursesGeneratedAt, setCoursesGeneratedAt] = useState(null);
  const [menusGeneratedAt, setMenusGeneratedAt] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ produit: "", quantite: "", magasin: "Lidl", categorie: "Épicerie" });
  const [shareNotice, setShareNotice] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [showConcentrateMenu, setShowConcentrateMenu] = useState(false);
  const [switchLidlIdx, setSwitchLidlIdx] = useState(null);
  const [loadingOptimize, setLoadingOptimize] = useState(false);
  const [comfortMode, setComfortMode] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  // tick for relative time refresh
  const [, setTick] = useState(0);

  const isComplete = profile?.id === "complete";

  useEffect(() => {
    if (screen !== "home") return;
    const ids = ["renald", "gwenaelle", "famille", "complete"];
    const t = {};
    ids.forEach(id => {
      const items = loadLS(`${LS_PREFIX}-${id}-courses`);
      t[id] = computeTotal(items);
    });
    setTotals(t);
    setTemplates(loadLS(`${LS_PREFIX}-templates`) || []);
    setHistory(loadLS(`${LS_PREFIX}-history`) || []);
  }, [screen]);

  // Load comfort mode preference on mount
  useEffect(() => {
    const saved = loadLS(`${LS_PREFIX}-comfort`);
    if (saved !== null) setComfortMode(!!saved);
  }, []);

  // refresh relative dates every minute
  useEffect(() => {
    if (screen !== "detail") return;
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, [screen]);

  const openProfile = (p) => {
    setProfile(p);
    setScreen("detail");
    setTab("menus");
    setErrorMenus(null);
    setErrorCourses(null);
    setFilterCat("Toutes");
    setFilterMag("Tous");
    setShowAddForm(false);

    const cachedMenus = loadLS(`${LS_PREFIX}-${p.id}-menus`);
    const cachedCourses = loadLS(`${LS_PREFIX}-${p.id}-courses`);
    const menusGen = loadLS(`${LS_PREFIX}-${p.id}-menus-generated`);
    const coursesGen = loadLS(`${LS_PREFIX}-${p.id}-courses-generated`);
    const cachedFavs = loadLS(`${LS_PREFIX}-${p.id}-favorites`) || [];

    setMenus(cachedMenus);
    setCourses(cachedCourses);
    setMenusGeneratedAt(menusGen);
    setCoursesGeneratedAt(coursesGen);
    setFavorites(cachedFavs);

    if (!cachedMenus) genMenus(p);
    if (!cachedCourses) genCourses(p);
  };

  const buildMenuPromptWithFavs = (prof) => {
    const favs = loadLS(`${LS_PREFIX}-${prof.id}-favorites`) || [];
    if (favs.length === 0) return prof.menuPrompt;
    const favSample = favs.slice(0, 4).map(f => ({ petit_dejeuner: f.petit_dejeuner, dejeuner: f.dejeuner, diner: f.diner }));
    return `${prof.menuPrompt}\n\nIMPORTANT — Préférences de l'utilisateur : il a apprécié ces ${favSample.length} journées de menus précédemment. Inspire-toi pour proposer des choses dans le même style (mêmes types d'aliments, mêmes ingrédients ou variations proches), tout en restant varié : ${JSON.stringify(favSample)}`;
  };

  const genMenus = async (p) => {
    setLoadingMenus(true);
    setErrorMenus(null);
    try {
      let data;
      if (p.id === "complete") {
        const results = await Promise.all(
          ALL_PROFILES_ARR.map(prof =>
            callClaude(buildMenuPromptWithFavs(prof))
              .then(d => ({ profile: { id: prof.id, name: prof.name, emoji: prof.emoji, color: prof.color }, jours: d.jours || [] }))
              .catch(() => ({ profile: { id: prof.id, name: prof.name, emoji: prof.emoji, color: prof.color }, jours: [] }))
          )
        );
        if (results.every(r => r.jours.length === 0)) throw new Error("empty");
        data = results;
      } else {
        const d = await callClaude(buildMenuPromptWithFavs(p));
        data = d.jours || [];
      }
      const now = Date.now();
      setMenus(data);
      setMenusGeneratedAt(now);
      saveLS(`${LS_PREFIX}-${p.id}-menus`, data);
      saveLS(`${LS_PREFIX}-${p.id}-menus-generated`, now);
    } catch {
      setErrorMenus("Erreur menus. Réessaie.");
    } finally {
      setLoadingMenus(false);
    }
  };

  const genCourses = async (p) => {
    setLoadingCourses(true);
    setErrorCourses(null);
    try {
      // Preserve manual items across regeneration
      const existingManual = (courses || []).filter(it => it.manual);
      let items;
      if (p.id === "complete") {
        const results = await Promise.all(
          ALL_PROFILES_ARR.map(prof =>
            callClaude(prof.coursesPrompt)
              .then(d => (d.liste || []).map(item => ({ ...item, pour: prof.name, pourColor: prof.color })))
              .catch(() => [])
          )
        );
        const allItems = results.flat();
        if (allItems.length === 0) throw new Error("empty");
        items = mergeDuplicates(allItems);
      } else {
        const d = await callClaude(p.coursesPrompt);
        items = d.liste || [];
      }
      const itemsWithCheck = items.map(i => ({ ...i, checked: false }));
      const final = [...itemsWithCheck, ...existingManual];
      const now = Date.now();
      setCourses(final);
      setCoursesGeneratedAt(now);
      saveLS(`${LS_PREFIX}-${p.id}-courses`, final);
      saveLS(`${LS_PREFIX}-${p.id}-courses-generated`, now);
    } catch {
      setErrorCourses("Erreur courses. Réessaie.");
    } finally {
      setLoadingCourses(false);
    }
  };

  const refreshPrices = async () => {
    if (!courses || courses.length === 0 || !profile) return;
    setLoadingPrices(true);
    setErrorCourses(null);
    try {
      const itemsForPrompt = courses.map(it => ({
        produit: it.produit,
        quantite: it.quantite,
        magasin: it.magasin
      }));
      const prompt = `Pour chaque produit ci-dessous, utilise le web search pour trouver le prix actuel réel en France chez le magasin indiqué (privilégie les sites Drive officiels : leclercdrive.fr, drive.coursesu.com, lidl.fr). Renvoie UNIQUEMENT un JSON valide sans markdown, format exact : {"liste":[{"produit":"nom exact","prix":"X.XX€"}]}. Garde le même nom de produit pour chaque entrée. Si tu ne trouves pas un prix précis, donne ta meilleure estimation basée sur le marché français. Produits à rechercher : ${JSON.stringify(itemsForPrompt)}`;
      const d = await callClaude(prompt, { webSearch: true });
      const newPrices = d.liste || [];
      const updated = courses.map(it => {
        const np = newPrices.find(p => p.produit === it.produit);
        return np && np.prix ? { ...it, prix: np.prix } : it;
      });
      setCourses(updated);
      saveLS(`${LS_PREFIX}-${profile.id}-courses`, updated);
    } catch {
      setErrorCourses("Erreur recherche prix. Réessaie.");
    } finally {
      setLoadingPrices(false);
    }
  };

  const toggleItem = (idx) => {
    if (!courses || !profile) return;
    const updated = courses.map((item, i) => i === idx ? { ...item, checked: !item.checked } : item);
    setCourses(updated);
    saveLS(`${LS_PREFIX}-${profile.id}-courses`, updated);
  };

  const deleteItem = (idx) => {
    if (!courses || !profile) return;
    const updated = courses.filter((_, i) => i !== idx);
    setCourses(updated);
    saveLS(`${LS_PREFIX}-${profile.id}-courses`, updated);
  };

  const switchItemMagasin = (idx, magasin) => {
    if (!courses || !profile) return;
    const updated = courses.map((it, i) => i === idx ? { ...it, magasin, prix: "" } : it);
    setCourses(updated);
    saveLS(`${LS_PREFIX}-${profile.id}-courses`, updated);
    setSwitchLidlIdx(null);
    setShareNotice(`✓ Article basculé chez ${magasin}. Clique "🔍 Prix réels" pour mettre à jour le prix.`);
    setTimeout(() => setShareNotice(null), 4000);
  };

  const optimizePrices = async () => {
    if (!courses || courses.length === 0 || !profile) return;
    if (!confirm("🎯 Optimiser les prix en comparant Lidl, Leclerc Drive et Super U pour chaque produit ?\n\nDurée : 3-5 min. Chaque produit sera réassigné au magasin le moins cher des 3.\n\nRappel : Lidl ne livre pas l'alimentaire (mais peut être moins cher en magasin).")) return;
    setLoadingOptimize(true);
    setErrorCourses(null);
    try {
      const items = courses.map(it => ({ produit: it.produit, quantite: it.quantite }));
      const prompt = `Pour chaque produit ci-dessous, utilise web_search pour comparer les prix actuels entre les 3 magasins français suivants : Lidl (lidl.fr ou catalogues hebdo Lidl), Leclerc Drive (leclercdrive.fr), Super U / Courses U (coursesu.com). Fais au moins UNE recherche par magasin et par produit. Pour CHAQUE produit, retourne :
- "magasin" : le magasin parmi les 3 avec le prix le plus bas
- "prix" : le prix le plus bas (chez le magasin choisi)
- "prix_alternatives" : un objet contenant les 3 prix sous la forme {"Lidl":"X.XX€","Leclerc":"X.XX€","Super U":"X.XX€"}
Renvoie UNIQUEMENT un JSON valide sans markdown, format exact : {"liste":[{"produit":"nom exact","magasin":"Lidl|Leclerc|Super U","prix":"X.XX€","prix_alternatives":{"Lidl":"X.XX€","Leclerc":"X.XX€","Super U":"X.XX€"}}]}. Garde le même nom de produit pour chaque entrée. Si tu ne trouves pas un prix précis pour un magasin, donne ta meilleure estimation basée sur le marché français mais essaie d'abord vraiment de chercher. Produits à optimiser : ${JSON.stringify(items)}`;
      const d = await callClaude(prompt, { webSearch: true, maxWebSearches: 75 });
      const optimized = d.liste || [];
      const updated = courses.map(it => {
        const op = optimized.find(o => o.produit === it.produit);
        if (op && op.magasin && op.prix) {
          return {
            ...it,
            magasin: op.magasin,
            prix: op.prix,
            prixAlternatives: op.prix_alternatives || null
          };
        }
        return it;
      });
      setCourses(updated);
      saveLS(`${LS_PREFIX}-${profile.id}-courses`, updated);
      const updatedCount = updated.filter(it => {
        const orig = courses.find(c => c.produit === it.produit);
        return orig && (orig.magasin !== it.magasin || orig.prix !== it.prix);
      }).length;
      setShareNotice(`✓ Optimisation terminée. ${updatedCount} articles mis à jour.`);
      setTimeout(() => setShareNotice(null), 4000);
    } catch {
      setErrorCourses("Erreur optimisation prix. Réessaie.");
    } finally {
      setLoadingOptimize(false);
    }
  };

  const concentrateMagasin = async (magasin) => {
    if (!courses || !profile) return;
    if (!confirm(`Concentrer toutes les courses chez ${magasin} ? Les prix seront actualisés via recherche web.`)) return;
    const updated = courses.map(it => ({ ...it, magasin }));
    setCourses(updated);
    saveLS(`${LS_PREFIX}-${profile.id}-courses`, updated);
    setShowConcentrateMenu(false);
    setFilterMag("Tous");
    // Auto-trigger price refresh against the new store
    await refreshPrices();
  };

  const saveAsTemplate = () => {
    if (!courses || courses.length === 0 || !profile) return;
    const name = prompt("Nom du modèle :", `${profile.name} - ${new Date().toLocaleDateString("fr-FR")}`);
    if (!name || !name.trim()) return;
    const existing = loadLS(`${LS_PREFIX}-templates`) || [];
    const newTpl = {
      id: `tpl-${Date.now()}`,
      name: name.trim(),
      profileId: profile.id,
      profileName: profile.name,
      profileColor: profile.color,
      profileEmoji: profile.emoji,
      items: courses.map(it => ({ ...it, checked: false })), // reset checks for templates
      savedAt: Date.now()
    };
    const updated = [...existing, newTpl];
    saveLS(`${LS_PREFIX}-templates`, updated);
    setTemplates(updated);
    setShareNotice(`✓ Modèle "${name}" sauvegardé`);
    setTimeout(() => setShareNotice(null), 2500);
  };

  const loadTemplate = (tpl) => {
    const targetProfile = tpl.profileId === "complete" ? COMPLETE_PROFILE : PROFILES[tpl.profileId];
    if (!targetProfile) return;
    if (!confirm(`Charger le modèle "${tpl.name}" pour ${tpl.profileName} ? La liste actuelle sera remplacée.`)) return;
    setProfile(targetProfile);
    setScreen("detail");
    setTab("courses");
    setMenus(loadLS(`${LS_PREFIX}-${targetProfile.id}-menus`));
    setMenusGeneratedAt(loadLS(`${LS_PREFIX}-${targetProfile.id}-menus-generated`));
    setCourses(tpl.items);
    setCoursesGeneratedAt(tpl.savedAt);
    saveLS(`${LS_PREFIX}-${targetProfile.id}-courses`, tpl.items);
    saveLS(`${LS_PREFIX}-${targetProfile.id}-courses-generated`, tpl.savedAt);
    setFilterCat("Toutes");
    setFilterMag("Tous");
  };

  const deleteTemplate = (id, e) => {
    if (e) e.stopPropagation();
    if (!confirm("Supprimer ce modèle ?")) return;
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    saveLS(`${LS_PREFIX}-templates`, updated);
  };

  // ====== Mode Confort Canapé ======
  const toggleComfortMode = () => {
    const next = !comfortMode;
    setComfortMode(next);
    saveLS(`${LS_PREFIX}-comfort`, next);
  };

  // ====== Menus favoris ======
  const favKey = (jour) => `${jour.jour}|${(jour.petit_dejeuner || "").slice(0,30)}|${(jour.dejeuner || "").slice(0,30)}`;

  const isFavoriteJour = (jour) => {
    return favorites.some(f => favKey(f) === favKey(jour));
  };

  const toggleFavoriteJour = (jour, profileForFav) => {
    if (!profile) return;
    const targetProfileId = profileForFav?.id || profile.id;
    const current = loadLS(`${LS_PREFIX}-${targetProfileId}-favorites`) || [];
    const exists = current.some(f => favKey(f) === favKey(jour));
    let updated;
    if (exists) {
      updated = current.filter(f => favKey(f) !== favKey(jour));
    } else {
      updated = [...current, { ...jour, savedAt: Date.now() }].slice(-12); // cap à 12
    }
    saveLS(`${LS_PREFIX}-${targetProfileId}-favorites`, updated);
    if (targetProfileId === profile.id) setFavorites(updated);
  };

  // ====== Historique des paniers ======
  const validateAndArchive = () => {
    if (!courses || courses.length === 0 || !profile) return;
    if (!confirm("Valider ces courses ? La liste sera archivée dans l'historique avec sa date et son total.")) return;
    const entry = {
      id: `hist-${Date.now()}`,
      archivedAt: Date.now(),
      profileId: profile.id,
      profileName: profile.name,
      profileColor: profile.color,
      profileEmoji: profile.emoji,
      items: courses,
      total: computeTotal(courses),
      itemsCount: courses.length
    };
    const current = loadLS(`${LS_PREFIX}-history`) || [];
    const updated = [entry, ...current].slice(0, 100); // cap à 100 entrées
    saveLS(`${LS_PREFIX}-history`, updated);
    setHistory(updated);
    setShareNotice(`✓ Courses validées et archivées (${entry.itemsCount} articles, ${entry.total.toFixed(2)}€)`);
    setTimeout(() => setShareNotice(null), 3500);
  };

  const deleteHistoryEntry = (id, e) => {
    if (e) e.stopPropagation();
    if (!confirm("Supprimer cette entrée d'historique ?")) return;
    const updated = history.filter(h => h.id !== id);
    saveLS(`${LS_PREFIX}-history`, updated);
    setHistory(updated);
  };

  const recreateFromHistory = (entry) => {
    const targetProfile = entry.profileId === "complete" ? COMPLETE_PROFILE : PROFILES[entry.profileId];
    if (!targetProfile) return;
    if (!confirm(`Recharger cette liste de ${entry.profileName} comme nouvelle liste de courses ?`)) return;
    setProfile(targetProfile);
    setScreen("detail");
    setTab("courses");
    setShowHistory(false);
    setMenus(loadLS(`${LS_PREFIX}-${targetProfile.id}-menus`));
    setMenusGeneratedAt(loadLS(`${LS_PREFIX}-${targetProfile.id}-menus-generated`));
    const resetItems = entry.items.map(it => ({ ...it, checked: false }));
    setCourses(resetItems);
    setCoursesGeneratedAt(Date.now());
    saveLS(`${LS_PREFIX}-${targetProfile.id}-courses`, resetItems);
    saveLS(`${LS_PREFIX}-${targetProfile.id}-courses-generated`, Date.now());
    setFilterCat("Toutes");
    setFilterMag("Tous");
  };

  // Stats historique : moyennes 30j et 90j
  const monthlyAverage = () => {
    if (history.length === 0) return 0;
    const cutoff = Date.now() - 30 * 86400 * 1000;
    const last30 = history.filter(h => h.archivedAt >= cutoff);
    return last30.reduce((s, h) => s + h.total, 0);
  };

  const addItem = () => {
    if (!profile || !newItem.produit.trim()) return;
    const item = {
      produit: newItem.produit.trim(),
      quantite: newItem.quantite.trim() || "1",
      magasin: newItem.magasin,
      categorie: newItem.categorie,
      prix: "",
      checked: false,
      manual: true
    };
    const updated = [...(courses || []), item];
    setCourses(updated);
    saveLS(`${LS_PREFIX}-${profile.id}-courses`, updated);
    setNewItem({ produit: "", quantite: "", magasin: newItem.magasin, categorie: newItem.categorie });
    setShowAddForm(false);
  };

  const shareList = async () => {
    if (!courses || courses.length === 0 || !profile) return;
    const lines = [`🛒 ${profile.name} — Liste de courses`, ""];
    const byM = courses.reduce((acc, it) => {
      const m = it.magasin || "Autre";
      if (!acc[m]) acc[m] = [];
      acc[m].push(it);
      return acc;
    }, {});
    Object.entries(byM).forEach(([m, items]) => {
      lines.push(`🏪 ${m}`);
      sortByChecked(items).forEach(it => {
        const check = it.checked ? "☑" : "☐";
        const prix = it.prix ? ` (${it.prix})` : "";
        const q = it.quantite ? ` — ${it.quantite}` : "";
        lines.push(`${check} ${it.produit}${q}${prix}`);
      });
      lines.push("");
    });
    lines.push(`💰 Total estimé : ~${computeTotal(courses).toFixed(2)}€`);
    if (coursesGeneratedAt) lines.push(`📅 Générée ${formatRelative(coursesGeneratedAt)}`);
    const text = lines.join("\n");

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: `Courses — ${profile.name}`, text });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setShareNotice("✓ Liste copiée dans le presse-papier");
        setTimeout(() => setShareNotice(null), 2500);
        return;
      }
      setShareNotice("Partage indisponible sur cet appareil");
      setTimeout(() => setShareNotice(null), 2500);
    } catch {
      // user cancelled share, no-op
    }
  };

  const cats = courses ? ["Toutes", ...new Set(courses.map(i => i.categorie))] : [];
  const mags = courses ? ["Tous", ...new Set(courses.map(i => i.magasin))] : [];
  const filteredCourses = sortByChecked(
    (courses||[]).map((it, idx)=>({ ...it, _idx: idx })).filter(i =>
      (filterCat==="Toutes"||i.categorie===filterCat) && (filterMag==="Tous"||i.magasin===filterMag)
    )
  );
  const byMag = (courses||[]).reduce((a,i)=>{ a[i.magasin]=(a[i.magasin]||0)+1; return a; },{});

  const groupedByMag = isComplete && filteredCourses.length
    ? filteredCourses.reduce((acc, item) => {
        const m = item.magasin || "Autre";
        if (!acc[m]) acc[m] = [];
        acc[m].push(item);
        return acc;
      }, {})
    : null;

  const pill = (active, color) => ({
    flexShrink:0, padding:"5px 12px", borderRadius:20, fontSize:12,
    border:`1px solid ${active?color:"#333"}`, background:active?color+"33":"transparent",
    color:active?color:"#888", cursor:"pointer"
  });
  const tabSt = (active, color) => ({
    flex:1, padding:"10px 0", border:"none",
    borderBottom:active?`2px solid ${color}`:"2px solid transparent",
    background:"transparent", color:active?color:"#666",
    fontWeight:active?"bold":"normal", cursor:"pointer", fontSize:13
  });
  const headerBtn = (color) => ({
    background:color+"22", color:color, border:`1px solid ${color}44`,
    borderRadius:20, padding:"5px 10px", fontSize:13, cursor:"pointer",
    lineHeight:1
  });

  const renderItem = (item) => {
    const checked = !!item.checked;
    const accent = profile?.color || "#888";
    const pours = item.pours && item.pours.length ? item.pours : (item.pour ? [{ name: item.pour, color: item.pourColor }] : []);
    // Comfort mode adjusts sizes for one-handed couch use
    const itemPad = comfortMode ? "18px 16px" : "14px 16px";
    const itemMargin = comfortMode ? 12 : 8;
    const cbSize = comfortMode ? 28 : 22;
    const prodFont = comfortMode ? 16 : 14;
    const metaFont = comfortMode ? 13 : 11;
    return (
      <div
        key={item._idx}
        onClick={()=>toggleItem(item._idx)}
        style={{
          display:"flex", alignItems:"center", gap:12, padding:itemPad, marginBottom:itemMargin,
          background: checked ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.04)",
          border:`1px solid ${checked ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.07)"}`,
          borderRadius:12, cursor:"pointer",
          opacity: checked ? 0.45 : 1,
          textDecoration: checked ? "line-through" : "none",
          transition:"opacity 0.2s, background 0.2s"
        }}
      >
        <div style={{
          width:cbSize, height:cbSize, borderRadius:"50%", flexShrink:0,
          border:`2px solid ${checked ? accent : "#444"}`,
          background: checked ? accent : "transparent",
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"#000", fontSize:comfortMode?16:13, fontWeight:"bold",
          transition:"background 0.15s, border-color 0.15s"
        }}>
          {checked ? "✓" : ""}
        </div>
        <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0, background:CAT_COLORS[item.categorie]||"#888" }} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:"bold", fontSize:prodFont, display:"flex", alignItems:"center", gap:6 }}>
            <span>{item.produit}</span>
            {item.manual && <span style={{ fontSize:9, color:"#888", background:"rgba(255,255,255,0.08)", padding:"1px 6px", borderRadius:8, fontWeight:"normal" }}>ajouté</span>}
          </div>
          <div style={{ fontSize:metaFont, color:"#666", marginTop:2 }}>
            {item.quantite} · {item.categorie}
            {pours.map((p, i) => (
              <span key={i} style={{ color: p.color || "#888", marginLeft:6 }}>· 👤 {p.name}</span>
            ))}
          </div>
        </div>
        <div style={{ textAlign:"right", flexShrink:0, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
          {(item.magasin || "").toLowerCase().includes("lidl") ? (
            <button
              onClick={(e) => { e.stopPropagation(); setSwitchLidlIdx(item._idx); }}
              title="Lidl ne livre pas en France — clique pour basculer"
              style={{ fontSize:11, fontWeight:"bold", background:"rgba(255,180,0,0.15)", border:"1px solid rgba(255,180,0,0.4)", borderRadius:8, padding:"3px 8px", color:"#FFB347", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:4, lineHeight:1 }}
            >
              {item.magasin}<span style={{ fontSize:9 }}>⚠️</span>
            </button>
          ) : (
            <a
              href={driveURL(item.magasin, item.produit)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title={`Ouvrir "${item.produit}" sur ${item.magasin}`}
              style={{ fontSize:11, fontWeight:"bold", background:"rgba(255,255,255,0.1)", borderRadius:8, padding:"3px 8px", color:"#fff", textDecoration:"none", display:"inline-flex", alignItems:"center", gap:4 }}
            >
              {item.magasin}<span style={{ fontSize:9, opacity:0.7 }}>↗</span>
            </a>
          )}
          {item.prix && <div style={{ fontSize:11, color:accent }}>~{item.prix}</div>}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); deleteItem(item._idx); }}
          aria-label="Supprimer"
          style={{
            background:"transparent", border:"none", color:"#555", cursor:"pointer",
            fontSize:16, padding:"4px 6px", flexShrink:0, lineHeight:1
          }}
        >
          ✕
        </button>
      </div>
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0f0f1a 0%,#1a1a2e 50%,#0f0f1a 100%)", fontFamily:"Georgia,serif", color:"#f0f0f0" }}>

      {screen==="home" && (
        <div style={{ padding:"calc(env(safe-area-inset-top, 0px) + 30px) 20px calc(env(safe-area-inset-bottom, 0px) + 20px)", maxWidth:480, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:40 }}>
            <div style={{ fontSize:48, marginBottom:8 }}>🍽️</div>
            <h1 style={{ fontSize:32, fontWeight:"bold", margin:0, background:"linear-gradient(90deg,#FFCD68,#FF9800)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Le Frigo
            </h1>
            <p style={{ color:"#888", fontSize:13, marginTop:6 }}>Ce qu'il faut · Pour qui · Où l'acheter</p>
          </div>
          <p style={{ textAlign:"center", color:"#aaa", fontSize:14, marginBottom:24 }}>Choisis ton profil</p>
          {Object.values(PROFILES).map(p => (
            <button key={p.id} onClick={()=>openProfile(p)}
              style={{ width:"100%", marginBottom:16, padding:"20px 24px", background:"rgba(255,255,255,0.04)", border:`1px solid ${p.color}44`, borderLeft:`4px solid ${p.color}`, borderRadius:16, cursor:"pointer", textAlign:"left", color:"#f0f0f0", display:"flex", alignItems:"center", gap:16 }}>
              <span style={{ fontSize:32 }}>{p.emoji}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:"bold", fontSize:16, color:p.color }}>{p.name}</div>
                <div style={{ fontSize:12, color:"#888", marginTop:3 }}>{p.regime}</div>
                {totals[p.id] > 0 && (
                  <div style={{ fontSize:12, color:p.color, marginTop:4, fontWeight:"bold" }}>~{totals[p.id].toFixed(2)}€</div>
                )}
              </div>
              <span style={{ color:p.color, fontSize:20 }}>→</span>
            </button>
          ))}

          <div style={{ borderTop:"1px solid #222", margin:"24px 0 16px", textAlign:"center", position:"relative" }}>
            <span style={{ position:"absolute", top:-9, left:"50%", transform:"translateX(-50%)", background:"#0f0f1a", padding:"0 10px", fontSize:11, color:"#555", letterSpacing:1, textTransform:"uppercase" }}>ou</span>
          </div>

          <button key={COMPLETE_PROFILE.id} onClick={()=>openProfile(COMPLETE_PROFILE)}
            style={{ width:"100%", padding:"20px 24px", background:`linear-gradient(135deg, ${COMPLETE_PROFILE.color}22 0%, rgba(255,255,255,0.04) 100%)`, border:`1px solid ${COMPLETE_PROFILE.color}66`, borderLeft:`4px solid ${COMPLETE_PROFILE.color}`, borderRadius:16, cursor:"pointer", textAlign:"left", color:"#f0f0f0", display:"flex", alignItems:"center", gap:16 }}>
            <span style={{ fontSize:32 }}>{COMPLETE_PROFILE.emoji}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:"bold", fontSize:16, color:COMPLETE_PROFILE.color }}>{COMPLETE_PROFILE.name}</div>
              <div style={{ fontSize:12, color:"#888", marginTop:3 }}>{COMPLETE_PROFILE.regime}</div>
              {totals.complete > 0 && (
                <div style={{ fontSize:13, color:COMPLETE_PROFILE.color, marginTop:4, fontWeight:"bold" }}>💰 Total : ~{totals.complete.toFixed(2)}€</div>
              )}
            </div>
            <span style={{ color:COMPLETE_PROFILE.color, fontSize:20 }}>→</span>
          </button>

          {templates.length > 0 && (
            <div style={{ marginTop:32 }}>
              <div style={{ fontSize:12, color:"#666", letterSpacing:1, textTransform:"uppercase", marginBottom:12, paddingLeft:4 }}>
                📋 Mes modèles
              </div>
              {templates.map(tpl => (
                <button key={tpl.id} onClick={() => loadTemplate(tpl)}
                  style={{ width:"100%", marginBottom:10, padding:"14px 16px", background:"rgba(255,255,255,0.03)", border:`1px solid ${tpl.profileColor}33`, borderLeft:`3px solid ${tpl.profileColor}`, borderRadius:12, cursor:"pointer", textAlign:"left", color:"#f0f0f0", display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:22, flexShrink:0 }}>{tpl.profileEmoji}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:"bold", color:tpl.profileColor, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{tpl.name}</div>
                    <div style={{ fontSize:11, color:"#666" }}>
                      {tpl.items.length} articles · ~{computeTotal(tpl.items).toFixed(2)}€ · {formatRelative(tpl.savedAt)}
                    </div>
                  </div>
                  <button onClick={(e) => deleteTemplate(tpl.id, e)} aria-label="Supprimer le modèle"
                    style={{ background:"transparent", border:"none", color:"#555", fontSize:14, cursor:"pointer", padding:"4px 6px", flexShrink:0 }}>
                    ✕
                  </button>
                </button>
              ))}
            </div>
          )}

          {history.length > 0 && (
            <button onClick={() => setShowHistory(true)}
              style={{ width:"100%", marginTop:24, padding:"16px 20px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, cursor:"pointer", textAlign:"left", color:"#f0f0f0", display:"flex", alignItems:"center", gap:14 }}>
              <span style={{ fontSize:28, flexShrink:0 }}>📊</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:"bold", color:"#ddd", marginBottom:2 }}>Mon historique</div>
                <div style={{ fontSize:11, color:"#666" }}>
                  {history.length} panier{history.length > 1 ? "s" : ""} archivé{history.length > 1 ? "s" : ""} · Total 30j : ~{monthlyAverage().toFixed(2)}€
                </div>
              </div>
              <span style={{ color:"#888", fontSize:18 }}>→</span>
            </button>
          )}
        </div>
      )}

      {screen==="detail" && profile && (
        <div style={{ maxWidth:500, margin:"0 auto", paddingBottom:"calc(env(safe-area-inset-bottom, 0px) + 40px)" }}>
          <div style={{ padding:"calc(env(safe-area-inset-top, 0px) + 16px) 20px 0", position:"sticky", top:0, background:"linear-gradient(135deg,#0f0f1a,#1a1a2e)", zIndex:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <button onClick={()=>setScreen("home")} style={{ background:"none", border:"none", color:"#888", cursor:"pointer", fontSize:22, padding:0 }}>←</button>
              <span style={{ fontSize:26 }}>{profile.emoji}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:"bold", color:profile.color, fontSize:18 }}>{profile.name}</div>
                <div style={{ fontSize:11, color:"#666" }}>{profile.regime}</div>
              </div>
              <button onClick={toggleComfortMode} title={comfortMode ? "Mode standard" : "Mode confort canapé (gros boutons, moins de filtres)"}
                style={{ ...headerBtn(profile.color), background: comfortMode ? profile.color+"44" : profile.color+"22" }}>
                {comfortMode ? "🛋️" : "🪑"}
              </button>
              <button onClick={shareList} title="Partager la liste" style={headerBtn(profile.color)}>📤</button>
              <button onClick={()=>{ genMenus(profile); genCourses(profile); }} title={`Regénérer menus + courses (${isComplete ? COSTS.generateAll : COSTS.generate})`} style={headerBtn(profile.color)}>🔄</button>
            </div>
            <div style={{ display:"flex", borderBottom:"1px solid #222" }}>
              <button style={tabSt(tab==="menus",profile.color)} onClick={()=>setTab("menus")}>📅 Menus 7 jours</button>
              <button style={tabSt(tab==="courses",profile.color)} onClick={()=>setTab("courses")}>🛒 Liste de courses</button>
            </div>
          </div>

          {shareNotice && (
            <div style={{ margin:"12px 20px 0", padding:"8px 14px", background:profile.color+"22", border:`1px solid ${profile.color}55`, borderRadius:10, fontSize:13, color:profile.color, textAlign:"center" }}>
              {shareNotice}
            </div>
          )}

          {tab==="menus" && (
            <div style={{ padding:"16px 20px" }}>
              {loadingMenus && <div style={{ textAlign:"center", padding:"50px 0", color:"#888" }}>⏳ Génération des menus...</div>}
              {errorMenus && <div style={{ padding:16, background:"#FF5722", borderRadius:12, textAlign:"center", marginBottom:16 }}>{errorMenus}</div>}
              {!loadingMenus && menus && menusGeneratedAt && (
                <div style={{ fontSize:11, color:"#666", marginBottom:12, textAlign:"right" }}>📅 Générés {formatRelative(menusGeneratedAt)}</div>
              )}
              {!loadingMenus && menus && isComplete && Array.isArray(menus) && menus[0]?.profile && (
                menus.map(({ profile: prof, jours }) => (
                  <div key={prof.id} style={{ marginBottom:24 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 4px 12px", borderBottom:`1px solid ${prof.color}55`, marginBottom:12 }}>
                      <span style={{ fontSize:20 }}>{prof.emoji}</span>
                      <span style={{ fontWeight:"bold", color:prof.color, fontSize:15 }}>{prof.name}</span>
                    </div>
                    {jours.length === 0 ? (
                      <div style={{ fontSize:12, color:"#666", padding:"10px 0", fontStyle:"italic" }}>Menus indisponibles pour ce profil.</div>
                    ) : jours.map((jour, i) => (
                      <div key={i} style={{ marginBottom:14, background:"rgba(255,255,255,0.04)", border:`1px solid ${prof.color}22`, borderRadius:14, overflow:"hidden" }}>
                        <div style={{ padding:"10px 16px", background:prof.color+"18", fontWeight:"bold", color:prof.color, fontSize:14, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                          <span>{jour.jour}</span>
                          <button onClick={() => toggleFavoriteJour(jour, prof)} title={(loadLS(`${LS_PREFIX}-${prof.id}-favorites`) || []).some(f => favKey(f) === favKey(jour)) ? "Retirer des favoris" : "Marquer comme favori"}
                            style={{ background:"transparent", border:"none", cursor:"pointer", fontSize:18, padding:"0 4px", color: (loadLS(`${LS_PREFIX}-${prof.id}-favorites`) || []).some(f => favKey(f) === favKey(jour)) ? "#FFD700" : "#444", lineHeight:1 }}>
                            ★
                          </button>
                        </div>
                        {["petit_dejeuner","dejeuner","diner"].map(r => (
                          <div key={r} style={{ padding:"10px 16px", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", gap:10 }}>
                            <span style={{ fontSize:16, flexShrink:0 }}>{REPAS_ICONS[r]}</span>
                            <div>
                              <div style={{ fontSize:10, color:"#666", textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>{REPAS_LABELS[r]}</div>
                              <div style={{ fontSize:13, color:"#ddd" }}>{jour[r]}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))
              )}
              {!loadingMenus && menus && !isComplete && Array.isArray(menus) && menus.map((jour,i) => (
                <div key={i} style={{ marginBottom:14, background:"rgba(255,255,255,0.04)", border:`1px solid ${profile.color}22`, borderRadius:14, overflow:"hidden" }}>
                  <div style={{ padding:"10px 16px", background:profile.color+"18", fontWeight:"bold", color:profile.color, fontSize:14, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                    <span>{jour.jour}</span>
                    <button onClick={() => toggleFavoriteJour(jour)} title={isFavoriteJour(jour) ? "Retirer des favoris" : "Marquer comme favori (influence les prochaines générations)"}
                      style={{ background:"transparent", border:"none", cursor:"pointer", fontSize:18, padding:"0 4px", color:isFavoriteJour(jour) ? "#FFD700" : "#444", lineHeight:1 }}>
                      ★
                    </button>
                  </div>
                  {["petit_dejeuner","dejeuner","diner"].map(r => (
                    <div key={r} style={{ padding:"10px 16px", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", gap:10 }}>
                      <span style={{ fontSize:16, flexShrink:0 }}>{REPAS_ICONS[r]}</span>
                      <div>
                        <div style={{ fontSize:10, color:"#666", textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>{REPAS_LABELS[r]}</div>
                        <div style={{ fontSize:13, color:"#ddd" }}>{jour[r]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {tab==="courses" && (
            <div style={{ padding:"16px 20px" }}>
              {loadingCourses && <div style={{ textAlign:"center", padding:"50px 0", color:"#888" }}>⏳ {isComplete ? "Fusion des 3 listes..." : "Génération de la liste..."}</div>}
              {errorCourses && <div style={{ padding:16, background:"#FF5722", borderRadius:12, textAlign:"center" }}>{errorCourses}</div>}
              {!loadingCourses && courses && courses.length>0 && (
                <>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12, gap:10 }}>
                    <div>
                      {(() => {
                        const noFilter = filterMag === "Tous" && filterCat === "Toutes";
                        const filterParts = [];
                        if (filterMag !== "Tous") filterParts.push(filterMag);
                        if (filterCat !== "Toutes") filterParts.push(filterCat);
                        const filteredTotal = computeTotal(filteredCourses);
                        const grandTotal = computeTotal(courses);
                        return (
                          <div style={{ fontSize:13, color:"#aaa" }}>
                            💰 Total {noFilter ? "estimé" : filterParts.join(" · ")} : <span style={{ color:profile.color, fontWeight:"bold" }}>~{filteredTotal.toFixed(2)}€</span>
                            {!noFilter && (
                              <span style={{ color:"#666", fontSize:11, marginLeft:6 }}>/ {grandTotal.toFixed(2)}€ total</span>
                            )}
                          </div>
                        );
                      })()}
                      {coursesGeneratedAt && (
                        <div style={{ fontSize:11, color:"#666", marginTop:3 }}>📅 Générée {formatRelative(coursesGeneratedAt)}</div>
                      )}
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:10, alignItems:"flex-end" }}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2 }}>
                        <button onClick={refreshPrices} disabled={loadingPrices || loadingOptimize}
                          style={{ background:profile.color+"22", color:profile.color, border:`1px solid ${profile.color}44`, borderRadius:20, padding:"5px 12px", fontSize:12, cursor:(loadingPrices||loadingOptimize)?"wait":"pointer", opacity:(loadingPrices||loadingOptimize)?0.6:1, whiteSpace:"nowrap" }}>
                          {loadingPrices ? "⏳ Recherche..." : "🔍 Prix réels"}
                        </button>
                        <span style={{ fontSize:9, color:"#555", letterSpacing:0.3 }}>{COSTS.refresh}</span>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2 }}>
                        <button onClick={optimizePrices} disabled={loadingPrices || loadingOptimize}
                          style={{ background:"transparent", color:profile.color, border:`1px dashed ${profile.color}66`, borderRadius:20, padding:"5px 12px", fontSize:12, cursor:(loadingPrices||loadingOptimize)?"wait":"pointer", opacity:(loadingPrices||loadingOptimize)?0.6:1, whiteSpace:"nowrap" }}>
                          {loadingOptimize ? "⏳ Optim..." : "🎯 Optimiser"}
                        </button>
                        <span style={{ fontSize:9, color:"#555", letterSpacing:0.3 }}>{COSTS.optimize}</span>
                      </div>
                    </div>
                  </div>
                  {loadingPrices && (
                    <div style={{ padding:"10px 14px", marginBottom:12, background:profile.color+"15", border:`1px solid ${profile.color}33`, borderRadius:10, fontSize:12, color:"#ccc" }}>
                      🔍 Recherche des prix actuels sur le web... (1-2 min, prix mis à jour à la fin)
                    </div>
                  )}
                  {loadingOptimize && (
                    <div style={{ padding:"10px 14px", marginBottom:12, background:profile.color+"15", border:`1px solid ${profile.color}33`, borderRadius:10, fontSize:12, color:"#ccc" }}>
                      🎯 Comparaison Lidl / Leclerc / Super U pour chaque produit... (3-5 min)
                    </div>
                  )}
                  {(() => {
                    const withAlts = courses.filter(it => it.prixAlternatives);
                    if (withAlts.length === 0) return null;
                    const totalAt = (mag) => courses.reduce((sum, it) => {
                      const p = it.prixAlternatives && it.prixAlternatives[mag];
                      return sum + parsePrice(p || it.prix);
                    }, 0);
                    const tLidl = totalAt("Lidl");
                    const tLeclerc = totalAt("Leclerc");
                    const tSuperU = totalAt("Super U");
                    const tOpti = computeTotal(courses);
                    const cheapestSingle = Math.min(tLeclerc, tSuperU);
                    const savings = cheapestSingle - tOpti;
                    return (
                      <div style={{ marginBottom:14, padding:"12px 14px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12 }}>
                        <div style={{ fontSize:11, color:"#888", textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>💡 Comparaison stratégies</div>
                        <div style={{ display:"flex", flexDirection:"column", gap:7, fontSize:13 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <span style={{ color:"#FFB347" }}>Tout chez Lidl <span style={{ fontSize:10, color:"#888" }}>⚠️ magasin</span></span>
                            <span style={{ fontWeight:"bold" }}>~{tLidl.toFixed(2)}€</span>
                          </div>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <span style={{ color:"#ddd" }}>Tout chez Leclerc <span style={{ fontSize:10, color:"#888" }}>📦 livraison</span></span>
                            <span style={{ fontWeight:"bold" }}>~{tLeclerc.toFixed(2)}€</span>
                          </div>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <span style={{ color:"#ddd" }}>Tout chez Super U <span style={{ fontSize:10, color:"#888" }}>📦 livraison</span></span>
                            <span style={{ fontWeight:"bold" }}>~{tSuperU.toFixed(2)}€</span>
                          </div>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:7, marginTop:2 }}>
                            <span style={{ color:profile.color, fontWeight:"bold" }}>🎯 Optimisé 3 mag.</span>
                            <span style={{ color:profile.color, fontWeight:"bold" }}>~{tOpti.toFixed(2)}€ <span style={{ fontSize:10, fontWeight:"normal", color:"#888" }}>(2 livraisons)</span></span>
                          </div>
                        </div>
                        {savings > 0 && (
                          <div style={{ marginTop:10, padding:"6px 10px", background:profile.color+"15", borderRadius:8, fontSize:11, color:"#bbb" }}>
                            💰 Gain optimisation : <strong style={{ color:profile.color }}>~{savings.toFixed(2)}€</strong> vs meilleur single-magasin. Rentable si &gt; frais 2e livraison (~5-10€).
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
                    {Object.entries(byMag).map(([m,c])=>(
                      <div key={m} style={{ background:"rgba(255,255,255,0.06)", borderRadius:20, padding:"5px 12px", fontSize:12, display:"flex", gap:6, alignItems:"center" }}>
                        <span style={{ color:"#fff", fontWeight:"bold" }}>{m}</span>
                        <span style={{ background:profile.color, color:"#000", borderRadius:10, padding:"1px 7px", fontSize:11, fontWeight:"bold" }}>{c}</span>
                      </div>
                    ))}
                  </div>
                  {Object.keys(byMag).length > 1 && (
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center", marginBottom:14, padding:"8px 10px", background:"rgba(255,255,255,0.03)", border:"1px dashed rgba(255,255,255,0.1)", borderRadius:10 }}>
                      <span style={{ fontSize:11, color:"#888", marginRight:4 }}>🛍️ Tout livrer chez : <span style={{ color:"#555" }}>({COSTS.concentrate})</span></span>
                      {[...new Set([...Object.keys(byMag), ...MAGASINS_DEFAULT])].map(m => (
                        <button key={m} onClick={() => concentrateMagasin(m)} disabled={loadingPrices}
                          style={{ padding:"4px 10px", background:profile.color+"22", border:`1px solid ${profile.color}55`, borderRadius:14, fontSize:11, color:profile.color, cursor:loadingPrices?"wait":"pointer", whiteSpace:"nowrap", opacity:loadingPrices?0.5:1 }}>
                          ⇄ {m}
                        </button>
                      ))}
                    </div>
                  )}
                  <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4, marginBottom:4 }}>
                    {mags.map(m=><button key={m} onClick={()=>setFilterMag(m)} style={pill(filterMag===m,profile.color)}>{m}</button>)}
                  </div>
                  {!comfortMode && (
                    <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:10 }}>
                      {cats.map(c=><button key={c} onClick={()=>setFilterCat(c)} style={pill(filterCat===c,"#fff")}>{c}</button>)}
                    </div>
                  )}

                  {isComplete && groupedByMag ? (
                    Object.entries(groupedByMag).map(([mag, items]) => {
                      const sorted = sortByChecked(items);
                      const checkedCount = items.filter(it => it.checked).length;
                      return (
                        <div key={mag} style={{ marginBottom:18 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 4px 10px", borderBottom:`1px solid ${profile.color}33`, marginBottom:10 }}>
                            <span style={{ fontSize:16 }}>🏪</span>
                            <span style={{ fontWeight:"bold", color:profile.color, fontSize:14 }}>{mag}</span>
                            <span style={{ fontSize:11, color:"#666", marginLeft:"auto" }}>{checkedCount}/{items.length}</span>
                          </div>
                          {sorted.map(item => renderItem(item))}
                        </div>
                      );
                    })
                  ) : (
                    filteredCourses.map(item => renderItem(item))
                  )}

                  {/* Add manual item */}
                  {!showAddForm ? (
                    <button onClick={()=>setShowAddForm(true)}
                      style={{ width:"100%", marginTop:8, padding:"12px", background:"transparent", border:`1px dashed ${profile.color}55`, borderRadius:12, color:profile.color, fontSize:13, cursor:"pointer" }}>
                      + Ajouter un article
                    </button>
                  ) : (
                    <div style={{ marginTop:12, padding:14, background:"rgba(255,255,255,0.04)", border:`1px solid ${profile.color}44`, borderRadius:12 }}>
                      <input type="text" placeholder="Produit (ex: Pommes)" value={newItem.produit}
                        onChange={e=>setNewItem({...newItem, produit:e.target.value})}
                        style={{ width:"100%", padding:"10px 12px", background:"rgba(0,0,0,0.3)", border:"1px solid #333", borderRadius:8, color:"#f0f0f0", fontSize:14, marginBottom:8, boxSizing:"border-box" }}
                      />
                      <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                        <input type="text" placeholder="Quantité (1kg)" value={newItem.quantite}
                          onChange={e=>setNewItem({...newItem, quantite:e.target.value})}
                          style={{ flex:1, padding:"10px 12px", background:"rgba(0,0,0,0.3)", border:"1px solid #333", borderRadius:8, color:"#f0f0f0", fontSize:14, minWidth:0, boxSizing:"border-box" }}
                        />
                        <select value={newItem.magasin}
                          onChange={e=>setNewItem({...newItem, magasin:e.target.value})}
                          style={{ flex:1, padding:"10px 12px", background:"rgba(0,0,0,0.3)", border:"1px solid #333", borderRadius:8, color:"#f0f0f0", fontSize:14, minWidth:0 }}>
                          {[...new Set([...MAGASINS_DEFAULT, ...(mags.filter(m=>m!=="Tous"))])].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <select value={newItem.categorie}
                        onChange={e=>setNewItem({...newItem, categorie:e.target.value})}
                        style={{ width:"100%", padding:"10px 12px", background:"rgba(0,0,0,0.3)", border:"1px solid #333", borderRadius:8, color:"#f0f0f0", fontSize:14, marginBottom:10, boxSizing:"border-box" }}>
                        {[...new Set([...CATEGORIES_DEFAULT, ...(cats.filter(c=>c!=="Toutes"))])].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={()=>{ setShowAddForm(false); setNewItem({ produit:"", quantite:"", magasin:newItem.magasin, categorie:newItem.categorie }); }}
                          style={{ flex:1, padding:"10px", background:"transparent", border:"1px solid #444", borderRadius:8, color:"#888", fontSize:13, cursor:"pointer" }}>
                          Annuler
                        </button>
                        <button onClick={addItem} disabled={!newItem.produit.trim()}
                          style={{ flex:1, padding:"10px", background:profile.color, border:"none", borderRadius:8, color:"#000", fontSize:13, fontWeight:"bold", cursor: newItem.produit.trim() ? "pointer" : "not-allowed", opacity: newItem.produit.trim() ? 1 : 0.5 }}>
                          Ajouter
                        </button>
                      </div>
                    </div>
                  )}

                  <button onClick={validateAndArchive}
                    style={{ width:"100%", marginTop:12, padding:"14px", background:profile.color, border:"none", borderRadius:12, color:"#000", fontSize:14, fontWeight:"bold", cursor:"pointer" }}>
                    ✅ Valider ces courses (archiver)
                  </button>
                  <button onClick={saveAsTemplate}
                    style={{ width:"100%", marginTop:8, padding:"10px", background:"transparent", border:`1px solid ${profile.color}33`, borderRadius:10, color:"#888", fontSize:12, cursor:"pointer" }}>
                    💾 Sauvegarder cette liste comme modèle
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {switchLidlIdx !== null && courses && courses[switchLidlIdx] && (
        <div onClick={() => setSwitchLidlIdx(null)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:20 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background:"#1a1a2e", borderRadius:18, padding:24, maxWidth:380, width:"100%", border:"1px solid rgba(255,180,0,0.4)", boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ fontSize:24, marginBottom:10 }}>⚠️</div>
            <div style={{ fontSize:16, fontWeight:"bold", marginBottom:10, color:"#FFB347" }}>Lidl ne livre pas en France</div>
            <div style={{ fontSize:13, color:"#ccc", marginBottom:18, lineHeight:1.5 }}>
              <strong>{courses[switchLidlIdx].produit}</strong> est assigné à Lidl, mais Lidl ne propose pas de livraison alimentaire à domicile en France (uniquement non-alimentaire).<br/><br/>
              Bascule cet article vers un magasin qui livre :
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ fontSize:10, color:"#666", textTransform:"uppercase", letterSpacing:1, marginBottom:2, paddingLeft:2 }}>Livraison à domicile</div>
              <button onClick={() => switchItemMagasin(switchLidlIdx, "Leclerc")}
                style={{ padding:"12px", background:"#22C55E22", border:"1px solid #22C55E55", borderRadius:10, color:"#22C55E", fontSize:14, fontWeight:"bold", cursor:"pointer" }}>
                🛒 Basculer vers Leclerc
              </button>
              <button onClick={() => switchItemMagasin(switchLidlIdx, "Super U")}
                style={{ padding:"12px", background:"#22C55E22", border:"1px solid #22C55E55", borderRadius:10, color:"#22C55E", fontSize:14, fontWeight:"bold", cursor:"pointer" }}>
                🛒 Basculer vers Super U
              </button>
              <div style={{ fontSize:10, color:"#666", textTransform:"uppercase", letterSpacing:1, marginTop:10, marginBottom:2, paddingLeft:2 }}>Aller en magasin</div>
              <a href="https://www.google.com/maps/search/Lidl"
                target="_blank" rel="noopener noreferrer"
                style={{ padding:"12px", background:"rgba(255,180,0,0.15)", border:"1px solid rgba(255,180,0,0.4)", borderRadius:10, color:"#FFB347", fontSize:14, fontWeight:"bold", cursor:"pointer", textDecoration:"none", textAlign:"center", display:"block" }}>
                📍 Trouver le Lidl le plus proche
              </a>
              <button onClick={() => setSwitchLidlIdx(null)}
                style={{ padding:"10px", marginTop:8, background:"transparent", border:"1px solid #444", borderRadius:10, color:"#888", fontSize:13, cursor:"pointer" }}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div onClick={() => setShowHistory(false)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:100, overflowY:"auto", padding:"calc(env(safe-area-inset-top, 0px) + 20px) 16px calc(env(safe-area-inset-bottom, 0px) + 20px)" }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ maxWidth:500, margin:"0 auto", background:"#1a1a2e", borderRadius:18, padding:20, border:"1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ display:"flex", alignItems:"center", marginBottom:18, gap:10 }}>
              <span style={{ fontSize:24 }}>📊</span>
              <h2 style={{ margin:0, fontSize:18, color:"#ddd", flex:1 }}>Mon historique</h2>
              <button onClick={() => setShowHistory(false)} aria-label="Fermer"
                style={{ background:"transparent", border:"1px solid #333", borderRadius:20, color:"#888", fontSize:16, cursor:"pointer", padding:"4px 12px" }}>
                ✕
              </button>
            </div>

            {history.length > 0 && (
              <div style={{ marginBottom:18, padding:"12px 14px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12 }}>
                <div style={{ fontSize:11, color:"#888", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>📈 Stats</div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                  <span style={{ color:"#aaa" }}>Total 30 derniers jours</span>
                  <span style={{ color:"#22C55E", fontWeight:"bold" }}>~{monthlyAverage().toFixed(2)}€</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
                  <span style={{ color:"#aaa" }}>Paniers archivés</span>
                  <span style={{ color:"#ddd", fontWeight:"bold" }}>{history.length}</span>
                </div>
              </div>
            )}

            {history.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 0", color:"#666", fontSize:13 }}>
                Aucun panier archivé pour l'instant.<br/>
                Utilise le bouton "✅ Valider ces courses" sur une liste pour l'archiver ici.
              </div>
            ) : (
              history.map(entry => (
                <button key={entry.id} onClick={() => recreateFromHistory(entry)}
                  style={{ width:"100%", marginBottom:10, padding:"14px 16px", background:"rgba(255,255,255,0.03)", border:`1px solid ${entry.profileColor}33`, borderLeft:`3px solid ${entry.profileColor}`, borderRadius:12, cursor:"pointer", textAlign:"left", color:"#f0f0f0", display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:22, flexShrink:0 }}>{entry.profileEmoji}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:"bold", color:entry.profileColor, marginBottom:2 }}>
                      {entry.profileName} · {new Date(entry.archivedAt).toLocaleDateString("fr-FR", { day:"2-digit", month:"short" })}
                    </div>
                    <div style={{ fontSize:11, color:"#666" }}>
                      {entry.itemsCount} articles · ~{entry.total.toFixed(2)}€ · {formatRelative(entry.archivedAt)}
                    </div>
                  </div>
                  <button onClick={(e) => deleteHistoryEntry(entry.id, e)} aria-label="Supprimer"
                    style={{ background:"transparent", border:"none", color:"#555", fontSize:14, cursor:"pointer", padding:"4px 6px", flexShrink:0 }}>
                    ✕
                  </button>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
