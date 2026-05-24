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
      web_search: !!opts.webSearch
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

// Build a Drive search URL for a given store + product
const driveURL = (magasin, produit) => {
  const q = encodeURIComponent(produit || "");
  const m = (magasin || "").toLowerCase();
  if (m.includes("lidl")) return `https://www.lidl.fr/q/query/${q}`;
  if (m.includes("leclerc")) return `https://www.leclercdrive.fr/recherche-globale?q=${q}`;
  if (m.includes("super u") || m === "u" || m.includes("coursesu")) return `https://www.coursesu.com/rechercher?q=${q}`;
  return `https://www.google.com/search?q=${q}+${encodeURIComponent(magasin || "")}`;
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
  }, [screen]);

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

    setMenus(cachedMenus);
    setCourses(cachedCourses);
    setMenusGeneratedAt(menusGen);
    setCoursesGeneratedAt(coursesGen);

    if (!cachedMenus) genMenus(p);
    if (!cachedCourses) genCourses(p);
  };

  const genMenus = async (p) => {
    setLoadingMenus(true);
    setErrorMenus(null);
    try {
      let data;
      if (p.id === "complete") {
        const results = await Promise.all(
          ALL_PROFILES_ARR.map(prof =>
            callClaude(prof.menuPrompt)
              .then(d => ({ profile: { id: prof.id, name: prof.name, emoji: prof.emoji, color: prof.color }, jours: d.jours || [] }))
              .catch(() => ({ profile: { id: prof.id, name: prof.name, emoji: prof.emoji, color: prof.color }, jours: [] }))
          )
        );
        if (results.every(r => r.jours.length === 0)) throw new Error("empty");
        data = results;
      } else {
        const d = await callClaude(p.menuPrompt);
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
    return (
      <div
        key={item._idx}
        onClick={()=>toggleItem(item._idx)}
        style={{
          display:"flex", alignItems:"center", gap:12, padding:"14px 16px", marginBottom:8,
          background: checked ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.04)",
          border:`1px solid ${checked ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.07)"}`,
          borderRadius:12, cursor:"pointer",
          opacity: checked ? 0.45 : 1,
          textDecoration: checked ? "line-through" : "none",
          transition:"opacity 0.2s, background 0.2s"
        }}
      >
        <div style={{
          width:22, height:22, borderRadius:"50%", flexShrink:0,
          border:`2px solid ${checked ? accent : "#444"}`,
          background: checked ? accent : "transparent",
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"#000", fontSize:13, fontWeight:"bold",
          transition:"background 0.15s, border-color 0.15s"
        }}>
          {checked ? "✓" : ""}
        </div>
        <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0, background:CAT_COLORS[item.categorie]||"#888" }} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:"bold", fontSize:14, display:"flex", alignItems:"center", gap:6 }}>
            <span>{item.produit}</span>
            {item.manual && <span style={{ fontSize:9, color:"#888", background:"rgba(255,255,255,0.08)", padding:"1px 6px", borderRadius:8, fontWeight:"normal" }}>ajouté</span>}
          </div>
          <div style={{ fontSize:11, color:"#666", marginTop:2 }}>
            {item.quantite} · {item.categorie}
            {pours.map((p, i) => (
              <span key={i} style={{ color: p.color || "#888", marginLeft:6 }}>· 👤 {p.name}</span>
            ))}
          </div>
        </div>
        <div style={{ textAlign:"right", flexShrink:0, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
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
            <div style={{ fontSize:48, marginBottom:8 }}>🛒</div>
            <h1 style={{ fontSize:26, fontWeight:"bold", margin:0, background:"linear-gradient(90deg,#3B82F6,#A855F7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Courses Familiales
            </h1>
            <p style={{ color:"#888", fontSize:13, marginTop:6 }}>Menus · Régimes · Prix optimisés</p>
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
              <button onClick={shareList} title="Partager la liste" style={headerBtn(profile.color)}>📤</button>
              <button onClick={()=>{ genMenus(profile); genCourses(profile); }} title="Regénérer" style={headerBtn(profile.color)}>🔄</button>
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
                        <div style={{ padding:"10px 16px", background:prof.color+"18", fontWeight:"bold", color:prof.color, fontSize:14 }}>{jour.jour}</div>
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
                  <div style={{ padding:"10px 16px", background:profile.color+"18", fontWeight:"bold", color:profile.color, fontSize:14 }}>{jour.jour}</div>
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
                    <button onClick={refreshPrices} disabled={loadingPrices}
                      style={{ background:profile.color+"22", color:profile.color, border:`1px solid ${profile.color}44`, borderRadius:20, padding:"5px 12px", fontSize:12, cursor:loadingPrices?"wait":"pointer", opacity:loadingPrices?0.6:1, whiteSpace:"nowrap" }}>
                      {loadingPrices ? "⏳ Recherche..." : "🔍 Prix réels"}
                    </button>
                  </div>
                  {loadingPrices && (
                    <div style={{ padding:"10px 14px", marginBottom:12, background:profile.color+"15", border:`1px solid ${profile.color}33`, borderRadius:10, fontSize:12, color:"#ccc" }}>
                      🔍 Recherche des prix actuels sur le web... (1-2 min, prix mis à jour à la fin)
                    </div>
                  )}
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
                      <span style={{ fontSize:11, color:"#888", marginRight:4 }}>🛍️ Tout livrer chez :</span>
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
                  <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:10 }}>
                    {cats.map(c=><button key={c} onClick={()=>setFilterCat(c)} style={pill(filterCat===c,"#fff")}>{c}</button>)}
                  </div>

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

                  <button onClick={saveAsTemplate}
                    style={{ width:"100%", marginTop:10, padding:"10px", background:"transparent", border:`1px solid ${profile.color}33`, borderRadius:10, color:"#888", fontSize:12, cursor:"pointer" }}>
                    💾 Sauvegarder cette liste comme modèle
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
