import React, { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard, Boxes, ShoppingBag, Settings2, Tag,
  ShieldCheck, FileText, LogOut, CheckCircle2, AlertTriangle, Menu, TrendingUp, Layers,
} from "lucide-react";
import { supabase } from "./supabaseClient";
import { FALLBACK_THEME } from "./theme";
import { computeProductCost } from "./pricing.js";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Materials from "./pages/Materials.jsx";
import Products from "./pages/Products.jsx";
import Kits from "./pages/Kits.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import Admin from "./pages/Admin.jsx";
import Quotes from "./pages/Quotes.jsx";
import Reports from "./pages/Reports.jsx";

function initials(name) {
  return (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";
}

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = carregando
  const [profile, setProfile] = useState(null);
  const [niche, setNiche] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [materials, setMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [productionLog, setProductionLog] = useState([]);
  const [toast, setToast] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const showToast = (msg, kind = "ok") => { setToast({ msg, kind }); setTimeout(() => setToast(null), 2600); };

  // ---- sessão ----
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // ---- carregar perfil + dados do usuário ----
  const loadAll = useCallback(async () => {
    if (!session) return;
    setLoadingData(true);
    const { data: prof } = await supabase
      .from("profiles").select("*, niches(*), subscription_plans(*)").eq("id", session.user.id).single();
    setProfile(prof);
    setNiche(prof?.niches || null);

    const [{ data: mats }, { data: prods }, { data: pMats }, { data: kitItems }, { data: st }, { data: qs }, { data: plog }] = await Promise.all([
      supabase.from("materials").select("*").order("name"),
      supabase.from("products").select("*").order("name"),
      supabase.from("product_materials").select("*"),
      supabase.from("product_kit_items").select("*"),
      supabase.from("settings").select("*").eq("owner_id", session.user.id).single(),
      supabase.from("quotes").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("production_log").select("*").order("produced_at", { ascending: false }).limit(5000),
    ]);

    const productsWithBom = (prods || []).map((p) => ({
      ...p,
      bom: (pMats || []).filter((b) => b.product_id === p.id).map((b) => ({ material_id: b.material_id, qty: b.qty })),
      kitItems: (kitItems || []).filter((k) => k.kit_product_id === p.id).map((k) => ({ item_product_id: k.item_product_id, qty: k.qty })),
    }));

    setMaterials(mats || []);
    setProducts(productsWithBom);
    setSettings(st || null);
    setQuotes(qs || []);
    setProductionLog(plog || []);
    setLoadingData(false);
  }, [session]);

  useEffect(() => { if (session) loadAll(); }, [session, loadAll]);

  if (session === undefined) return <FullscreenMsg text="Carregando…" />;
  if (!session) return <Login />;
  if (loadingData || !profile || !settings) return <FullscreenMsg text="Carregando seus dados…" />;

  const theme = niche?.theme || FALLBACK_THEME;
  const isAdmin = profile.role === "admin";
  const plan = profile.subscription_plans || null;

  /* -------------------- MATERIAIS -------------------- */
  const saveMaterial = async (m) => {
    const payload = { ...m, owner_id: session.user.id };
    if (m.id) {
      const { id, ...rest } = payload;
      await supabase.from("materials").update(rest).eq("id", id);
    } else {
      await supabase.from("materials").insert(payload);
    }
    showToast("Material salvo.");
    loadAll();
  };
  const deleteMaterial = async (id) => {
    if (products.some((p) => (p.bom || []).some((b) => b.material_id === id))) {
      showToast("Este material é usado em um produto. Remova-o do produto antes.", "err");
      return;
    }
    await supabase.from("materials").delete().eq("id", id);
    showToast("Material removido.");
    loadAll();
  };

  /* -------------------- PRODUTOS -------------------- */
  const saveProduct = async (p) => {
    const { bom, kitItems, niches: _n, ...rest } = p;
    const payload = { ...rest, owner_id: session.user.id, niche_id: profile.niche_id };
    let productId = p.id;
    if (productId) {
      const { id, ...upd } = payload;
      await supabase.from("products").update(upd).eq("id", id);
      await supabase.from("product_materials").delete().eq("product_id", id);
      await supabase.from("product_kit_items").delete().eq("kit_product_id", id);
    } else {
      const { data } = await supabase.from("products").insert(payload).select().single();
      productId = data.id;
    }
    if ((bom || []).length) {
      await supabase.from("product_materials").insert(bom.map((b) => ({ product_id: productId, material_id: b.material_id, qty: b.qty })));
    }
    if ((kitItems || []).length) {
      await supabase.from("product_kit_items").insert(kitItems.map((k) => ({ kit_product_id: productId, item_product_id: k.item_product_id, qty: k.qty })));
    }
    showToast("Produto salvo.");
    loadAll();
  };
  const deleteProduct = async (id) => {
    await supabase.from("products").delete().eq("id", id);
    showToast("Produto removido.");
    loadAll();
  };

  /* -------------------- PRODUÇÃO (baixa de estoque) -------------------- */
  const produce = async (product, qty) => {
    const missing = [];
    (product.bom || []).forEach((b) => {
      const mat = materials.find((m) => m.id === b.material_id);
      if (mat && mat.stock < b.qty * qty) missing.push(mat.name);
    });
    if (missing.length) {
      showToast(`Estoque insuficiente: ${missing.join(", ")}`, "err");
      return;
    }
    for (const b of product.bom || []) {
      const mat = materials.find((m) => m.id === b.material_id);
      if (!mat) continue;
      await supabase.from("materials").update({ stock: Math.round((mat.stock - b.qty * qty) * 1000) / 1000 }).eq("id", mat.id);
    }
    await supabase.from("products").update({ produced_count: (product.produced_count || 0) + qty }).eq("id", product.id);
    const calc = computeProductCost(product, materials, products, settings);
    await supabase.from("production_log").insert({
      owner_id: session.user.id,
      product_id: product.id,
      qty,
      cost_snapshot: { subtotal: calc.subtotal, finalPrice: calc.finalPrice, profit: calc.profit },
    });
    showToast(`Produção registrada: ${qty}x ${product.name}.`);
    loadAll();
  };

  /* -------------------- CONFIGURAÇÕES -------------------- */
  const saveSettings = async (s) => {
    await supabase.from("settings").update(s).eq("owner_id", session.user.id);
    showToast("Configurações salvas.");
    loadAll();
  };

  const logout = async () => { await supabase.auth.signOut(); };

  const TABS = [
    { id: "dashboard", label: "Visão geral", icon: LayoutDashboard },
    { id: "materiais", label: "Materiais & Estoque", icon: Boxes },
    { id: "produtos", label: "Produtos", icon: ShoppingBag },
    { id: "kits", label: "Kits", icon: Layers },
    { id: "orcamentos", label: "Orçamentos", icon: FileText },
    { id: "relatorios", label: "Relatórios", icon: TrendingUp },
    { id: "config", label: "Configurações", icon: Settings2 },
    ...(isAdmin ? [{ id: "admin", label: "Admin", icon: ShieldCheck }] : []),
  ];
  const activeTab = TABS.find((t) => t.id === tab);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme.bg, fontFamily: "'Manrope', sans-serif", color: theme.text }}>

      {/* sidebar */}
      <div className={`app-sidebar${mobileNavOpen ? " open" : ""}`} style={{ width: 236, flexShrink: 0, background: theme.surface, borderRight: `1px solid ${theme.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "22px 20px 20px" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: theme.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Tag size={16} color="#fff" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.3px" }}>Precifica</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "8px 12px" }}>
          {TABS.map((t) => {
            const Icon = t.icon; const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setMobileNavOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 8,
                  fontSize: 13, fontWeight: active ? 700 : 600, border: "none", cursor: "pointer", textAlign: "left",
                  background: active ? theme.primary : "transparent", color: active ? "#fff" : theme.textMuted,
                }}
              >
                <Icon size={16} /> {t.label}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ margin: 12, padding: 12, background: theme.bg, borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: theme.primarySoft, color: theme.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            {initials(profile.full_name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.full_name}</div>
            <div style={{ fontSize: 10.5, color: theme.textMuted }}>{niche?.name || "Sem nicho"}</div>
          </div>
          <button onClick={logout} style={{ background: "none", border: "none", cursor: "pointer", color: theme.textMuted, display: "flex", padding: 0 }} title="Sair">
            <LogOut size={15} />
          </button>
        </div>
      </div>

      <div className={`app-backdrop${mobileNavOpen ? " open" : ""}`} onClick={() => setMobileNavOpen(false)} />

      {/* main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="app-topbar" style={{ display: "flex", alignItems: "center", gap: 14, padding: "22px 44px", background: theme.surface, borderBottom: `1px solid ${theme.border}` }}>
          <button className="app-menu-btn" onClick={() => setMobileNavOpen(true)} style={{ background: "none", border: `1px solid ${theme.border}`, borderRadius: 8, width: 36, height: 36, alignItems: "center", justifyContent: "center", cursor: "pointer", color: theme.text, flexShrink: 0 }}>
            <Menu size={17} />
          </button>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: theme.textMuted, marginBottom: 6 }}>
              {niche?.name || "Sem nicho"}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.4px" }}>{activeTab?.label}</div>
          </div>
        </div>

        <div className="app-content" style={{ padding: "32px 44px 60px", display: "flex", flexDirection: "column", gap: 22 }}>
          {tab === "dashboard" && <Dashboard theme={theme} materials={materials} products={products} settings={settings} productionLog={productionLog} />}
          {tab === "materiais" && <Materials theme={theme} materials={materials} onSave={saveMaterial} onDelete={deleteMaterial} maxMaterials={plan?.max_materials} />}
          {tab === "produtos" && <Products theme={theme} products={products} materials={materials} settings={settings} onSave={saveProduct} onDelete={deleteProduct} onProduce={produce} maxProducts={plan?.max_products} />}
          {tab === "kits" && <Kits theme={theme} products={products} materials={materials} settings={settings} onSave={saveProduct} onDelete={deleteProduct} maxProducts={plan?.max_products} />}
          {tab === "orcamentos" && <Quotes theme={theme} products={products} materials={materials} settings={settings} quotes={quotes} onSaved={loadAll} ownerName={profile.full_name} />}
          {tab === "relatorios" && <Reports theme={theme} products={products} materials={materials} settings={settings} productionLog={productionLog} />}
          {tab === "config" && <SettingsPage theme={theme} settings={settings} onSave={saveSettings} />}
          {tab === "admin" && isAdmin && <Admin theme={theme} />}
        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: toast.kind === "err" ? theme.danger : theme.primary, color: "#fff", padding: "10px 18px", borderRadius: 8, fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,.2)", zIndex: 60 }}>
          {toast.kind === "err" ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function FullscreenMsg({ text }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontFamily: "sans-serif" }}>
      {text}
    </div>
  );
}
