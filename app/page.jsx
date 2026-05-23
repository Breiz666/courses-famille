"use client";
import { useState } from "react";

const PROFILES = {
  renald: {
    id: "renald", name: "Rénald", emoji: "👨", color: "#00C9A7", regime: "Diabétique type 2",
    menuPrompt: `Tu es nutritionniste expert diabète type 2. Génère un plan de menus pour 7 jours pour UN adulte diabétique type 2. Règles : index glycémique bas (<55), pas de sucres raffinés, pas de pain blanc, pas de riz blanc, riche en fibres et protéines maigres. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans balises markdown : {"jours":[{"jour":"Lundi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Mardi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Mercredi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Jeudi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Vendredi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Samedi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Dimanche","petit_dejeuner":"...","dejeuner":"...","diner":"..."}]}`,
    coursesPrompt: `Tu es nutritionniste expert diabète type 2. Génère une liste de courses hebdomadaire pour UN adulte diabétique type 2. Règles : index glycémique bas, pas de sucres raffinés, riche en fibres, protéines maigres, légumes verts. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans balises markdown : {"liste":[{"produit":"Exemple","quantite":"500g","categorie":"Légumes","magasin":"Lidl","prix":"1.20€"}]}`
  },
  gwenaelle: {
    id: "gwenaelle", name: "Gwénaëlle", emoji: "👩", color: "#FF6B9D", regime: "Hypocalorique",
    menuPrompt: `Tu es nutritionniste expert régimes hypocaloriques. Génère un plan de menus pour 7 jours pour une adulte en régime hypocalorique (max 1400 kcal/jour). Règles : haute satiété, faible densité énergétique, légumes, protéines maigres, peu de graisses saturées. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans balises markdown : {"jours":[{"jour":"Lundi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Mardi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Mercredi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Jeudi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Vendredi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Samedi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Dimanche","petit_dejeuner":"...","dejeuner":"...","diner":"..."}]}`,
    coursesPrompt: `Tu es nutritionniste expert régimes hypocaloriques. Génère une liste de courses hebdomadaire pour une adulte en régime hypocalorique (max 1400 kcal/jour). Règles : haute satiété, faible densité énergétique, beaucoup de légumes, protéines maigres. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans balises markdown : {"liste":[{"produit":"Exemple","quantite":"500g","categorie":"Légumes","magasin":"Lidl","prix":"1.20€"}]}`
  },
  famille: {
    id: "famille", name: "Famille", emoji: "👨‍👩‍👧‍👦", color: "#FFB347", regime: "Enfants ×4",
    menuPrompt: `Tu es nutritionniste spécialisé alimentation enfants. Génère un plan de menus pour 7 jours pour 4 enfants (6-14 ans). Règles : aliments simples (pâtes, riz, jambon, poulet, fromage, yaourts), facile à préparer. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans balises markdown : {"jours":[{"jour":"Lundi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Mardi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Mercredi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Jeudi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Vendredi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Samedi","petit_dejeuner":"...","dejeuner":"...","diner":"..."},{"jour":"Dimanche","petit_dejeuner":"...","dejeuner":"...","diner":"..."}]}`,
    coursesPrompt: `Tu es nutritionniste spécialisé alimentation enfants. Génère une liste de courses hebdomadaire pour 4 enfants (6-14 ans). Aliments simples (pâtes, riz, jambon, poulet, fromage, yaourts, pain de mie), quantités pour 4 enfants sur 1 semaine. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans balises markdown : {"liste":[{"produit":"Exemple","quantite":"1kg","categorie":"Féculents","magasin":"Lidl","prix":"0.99€"}]}`
  }
};

const CAT_COLORS = {
  "Légumes":"#4CAF50","Protéines":"#FF5722","Féculents":"#FF9800",
  "Produits laitiers":"#2196F3","Fruits":"#E91E63","Épicerie":"#9C27B0",
  "Snacks":"#795548","Boissons":"#00BCD4","Boulangerie":"#8BC34A"
};

const REPAS_ICONS = { petit_dejeuner:"☀️", dejeuner:"🌤️", diner:"🌙" };
const REPAS_LABELS = { petit_dejeuner:"Petit-déjeuner", dejeuner:"Déjeuner", diner:"Dîner" };

async function callClaude(prompt) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: prompt }] })
  });
  const data = await res.json();
  const text = data.content?.map(b => b.text || "").join("") || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

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

  const openProfile = (p) => {
    setProfile(p); setScreen("detail"); setTab("menus");
    setMenus(null); setCourses(null); setErrorMenus(null); setErrorCourses(null);
    setFilterCat("Toutes"); setFilterMag("Tous");
    genMenus(p); genCourses(p);
  };

  const genMenus = async (p) => {
    setLoadingMenus(true); setErrorMenus(null);
    try { const d = await callClaude(p.menuPrompt); setMenus(d.jours || []); }
    catch { setErrorMenus("Erreur menus. Réessaie."); }
    finally { setLoadingMenus(false); }
  };

  const genCourses = async (p) => {
    setLoadingCourses(true); setErrorCourses(null);
    try { const d = await callClaude(p.coursesPrompt); setCourses(d.liste || []); }
    catch { setErrorCourses("Erreur courses. Réessaie."); }
    finally { setLoadingCourses(false); }
  };

  const cats = courses ? ["Toutes", ...new Set(courses.map(i => i.categorie))] : [];
  const mags = courses ? ["Tous", ...new Set(courses.map(i => i.magasin))] : [];
  const filteredCourses = (courses||[]).filter(i =>
    (filterCat==="Toutes"||i.categorie===filterCat) && (filterMag==="Tous"||i.magasin===filterMag)
  );
  const byMag = (courses||[]).reduce((a,i)=>{ a[i.magasin]=(a[i.magasin]||0)+1; return a; },{});

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

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0f0f1a 0%,#1a1a2e 50%,#0f0f1a 100%)", fontFamily:"Georgia,serif", color:"#f0f0f0" }}>

      {screen==="home" && (
        <div style={{ padding:"40px 20px", maxWidth:480, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:40 }}>
            <div style={{ fontSize:48, marginBottom:8 }}>🛒</div>
            <h1 style={{ fontSize:26, fontWeight:"bold", margin:0, background:"linear-gradient(90deg,#00C9A7,#FF6B9D)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Courses Familiales
            </h1>
            <p style={{ color:"#888", fontSize:13, marginTop:6 }}>Menus · Régimes · Prix optimisés</p>
          </div>
          <p style={{ textAlign:"center", color:"#aaa", fontSize:14, marginBottom:24 }}>Choisis ton profil</p>
          {Object.values(PROFILES).map(p => (
            <button key={p.id} onClick={()=>openProfile(p)}
              style={{ width:"100%", marginBottom:16, padding:"20px 24px", background:"rgba(255,255,255,0.04)", border:`1px solid ${p.color}44`, borderLeft:`4px solid ${p.color}`, borderRadius:16, cursor:"pointer", textAlign:"left", color:"#f0f0f0", display:"flex", alignItems:"center", gap:16 }}>
              <span style={{ fontSize:32 }}>{p.emoji}</span>
              <div>
                <div style={{ fontWeight:"bold", fontSize:16, color:p.color }}>{p.name}</div>
                <div style={{ fontSize:12, color:"#888", marginTop:3 }}>{p.regime}</div>
              </div>
              <span style={{ marginLeft:"auto", color:p.color, fontSize:20 }}>→</span>
            </button>
          ))}
        </div>
      )}

      {screen==="detail" && profile && (
        <div style={{ maxWidth:500, margin:"0 auto", paddingBottom:40 }}>
          <div style={{ padding:"20px 20px 0", position:"sticky", top:0, background:"linear-gradient(135deg,#0f0f1a,#1a1a2e)", zIndex:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
              <button onClick={()=>setScreen("home")} style={{ background:"none", border:"none", color:"#888", cursor:"pointer", fontSize:22, padding:0 }}>←</button>
              <span style={{ fontSize:26 }}>{profile.emoji}</span>
              <div>
                <div style={{ fontWeight:"bold", color:profile.color, fontSize:18 }}>{profile.name}</div>
                <div style={{ fontSize:11, color:"#666" }}>{profile.regime}</div>
              </div>
              <button onClick={()=>{genMenus(profile);genCourses(profile);}}
                style={{ marginLeft:"auto", background:profile.color+"22", color:profile.color, border:`1px solid ${profile.color}44`, borderRadius:20, padding:"5px 12px", fontSize:12, cursor:"pointer" }}>
                🔄 Regénérer
              </button>
            </div>
            <div style={{ display:"flex", borderBottom:"1px solid #222" }}>
              <button style={tabSt(tab==="menus",profile.color)} onClick={()=>setTab("menus")}>📅 Menus 7 jours</button>
              <button style={tabSt(tab==="courses",profile.color)} onClick={()=>setTab("courses")}>🛒 Liste de courses</button>
            </div>
          </div>

          {tab==="menus" && (
            <div style={{ padding:"16px 20px" }}>
              {loadingMenus && <div style={{ textAlign:"center", padding:"50px 0", color:"#888" }}>⏳ Génération des menus...</div>}
              {errorMenus && <div style={{ padding:16, background:"#FF5722", borderRadius:12, textAlign:"center", marginBottom:16 }}>{errorMenus}</div>}
              {!loadingMenus && menus && menus.map((jour,i) => (
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
              {loadingCourses && <div style={{ textAlign:"center", padding:"50px 0", color:"#888" }}>⏳ Génération de la liste...</div>}
              {errorCourses && <div style={{ padding:16, background:"#FF5722", borderRadius:12, textAlign:"center" }}>{errorCourses}</div>}
              {!loadingCourses && courses && courses.length>0 && (
                <>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
                    {Object.entries(byMag).map(([m,c])=>(
                      <div key={m} style={{ background:"rgba(255,255,255,0.06)", borderRadius:20, padding:"5px 12px", fontSize:12, display:"flex", gap:6, alignItems:"center" }}>
                        <span style={{ color:"#fff", fontWeight:"bold" }}>{m}</span>
                        <span style={{ background:profile.color, color:"#000", borderRadius:10, padding:"1px 7px", fontSize:11, fontWeight:"bold" }}>{c}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4, marginBottom:4 }}>
                    {mags.map(m=><button key={m} onClick={()=>setFilterMag(m)} style={pill(filterMag===m,profile.color)}>{m}</button>)}
                  </div>
                  <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:10 }}>
                    {cats.map(c=><button key={c} onClick={()=>setFilterCat(c)} style={pill(filterCat===c,"#fff")}>{c}</button>)}
                  </div>
                  {filteredCourses.map((item,i)=>(
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", marginBottom:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12 }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", flexShrink:0, background:CAT_COLORS[item.categorie]||"#888" }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:"bold", fontSize:14 }}>{item.produit}</div>
                        <div style={{ fontSize:11, color:"#666", marginTop:2 }}>{item.quantite} · {item.categorie}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:11, fontWeight:"bold", background:"rgba(255,255,255,0.1)", borderRadius:8, padding:"3px 8px", marginBottom:3 }}>{item.magasin}</div>
                        {item.prix && <div style={{ fontSize:11, color:profile.color }}>~{item.prix}</div>}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
