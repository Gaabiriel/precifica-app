import React, { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard, Boxes, ShoppingBag, Settings2, ChevronDown, Factory,
  ShieldCheck, FileText, LogOut, CheckCircle2, AlertTriangle,
} from "lucide-react";
import { supabase } from "./supabaseClient";
import { FALLBACK_THEME } from "./theme";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Materials from "./pages/Materials.jsx";
import Products from "./pages/Products.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import Admin from "./pages/Admin.jsx";
import Quotes from "./pages/Quotes.jsx";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = carregando
  const [profile, setProfile] = useState(null);
  const [niche, setNiche] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [materials, setMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [toast, setToast] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

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
      .from("profiles").select("*, niches(*)").eq("id", session.user.id).single();
    setProfile(prof);
    setNiche(prof?.niches || null);

    const [{ data: mats }, { data: prods }, { data: pMats }, { data: kitItems }, { data: st }, { data: qs }] = await Promise.all([
      supabase.from("materials").select("*").order("name"),
      supabase.from("products").select("*").order("name"),
      supabase.from("product_materials").select("*"),
      supabase.from("product_kit_items").select("*"),
      supabase.from("settings").select("*").eq("owner_id", session.user.id).single(),
      supabase.from("quotes").select("*").order("created_at", { ascending: false }).limit(10),
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
    setLoadingData(false);
  }, [session]);

  useEffect(() => { if (session) loadAll(); }, [session, loadAll]);

  if (session === undefined) return <FullscreenMsg text="Carregando…" />;
  if (!session) return <Login />;
  if (loadingData || !profile || !settings) return <FullscreenMsg text="Carregando seus dados…" />;

  const theme = niche?.theme || FALLBACK_THEME;
  const isAdmin = profile.role === "admin";

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
    await supabase.from("production_log").insert({ owner_id: session.user.id, product_id: product.id, qty });
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
    { id: "orcamentos", label: "Orçamentos", icon: FileText },
    { id: "config", label: "Configurações", icon: Settings2 },
    ...(isAdmin ? [{ id: "admin", label: "Admin", icon: ShieldCheck }] : []),
  ];

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: theme.text }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: `1px solid ${theme.border}`, background: theme.surface, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: theme.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <Factory size={18} />
          </div>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, lineHeight: 1.1 }}>Precifica</div>
            <div style={{ fontSize: 11, color: theme.textMuted }}>{niche?.name || "Sem nicho"} · {profile.full_name}</div>
          </div>
        </div>
        <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${theme.border}`, borderRadius: 9, padding: "8px 12px", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: theme.text }}>
          <LogOut size={14} /> Sair
        </button>
      </div>

      <div style={{ display: "flex", gap: 4, padding: "14px 24px 0", borderBottom: `1px solid ${theme.border}`, background: theme.surface, flexWrap: "wrap" }}>
        {TABS.map((t) => {
          const Icon = t.icon; const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: active ? theme.primary : theme.textMuted, borderBottom: active ? `2px solid ${theme.primary}` : "2px solid transparent", marginBottom: -1 }}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "26px 24px 40px" }}>
        <div style={{
          maxWidth: 1180, margin: "0 auto", background: theme.surfaceAlt,
          border: `1px solid ${theme.border}`, borderRadius: 20, padding: "26px 28px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}>
          {tab === "dashboard" && <Dashboard theme={theme} materials={materials} products={products} settings={settings} />}
          {tab === "materiais" && <Materials theme={theme} materials={materials} onSave={saveMaterial} onDelete={deleteMaterial} />}
          {tab === "produtos" && <Products theme={theme} products={products} materials={materials} settings={settings} onSave={saveProduct} onDelete={deleteProduct} onProduce={produce} />}
          {tab === "orcamentos" && <Quotes theme={theme} products={products} materials={materials} settings={settings} quotes={quotes} onSaved={loadAll} ownerName={profile.full_name} />}
          {tab === "config" && <SettingsPage theme={theme} settings={settings} onSave={saveSettings} />}
          {tab === "admin" && isAdmin && <Admin theme={theme} />}
        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: toast.kind === "err" ? theme.danger : theme.primary, color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,.2)", zIndex: 60 }}>
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
