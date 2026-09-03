import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  LayoutDashboard, Boxes, ShoppingBag, Settings2, Tag,
  ShieldCheck, FileText, LogOut, CheckCircle2, AlertTriangle, Menu, TrendingUp, Layers,
} from "lucide-react";
import { supabase } from "./supabaseClient";
import { FALLBACK_THEME } from "./theme";
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
  const [toast, setToast] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const loadedForUserId = useRef(null);

  const showToast = (msg, kind = "ok") => { setToast({ msg, kind }); setTimeout(() => setToast(null), 2600); };

  // ---- sessão ----
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // ---- carregar só o perfil (dados de cada página são buscados por ela mesma) ----
  // O cliente do Supabase revalida a sessão (e re-emite onAuthStateChange) toda
  // vez que a aba volta a ficar em foco — isso NÃO deve recarregar o perfil nem
  // resetar a tela; só quando o usuário logado realmente muda (login/logout).
  const loadProfile = useCallback(async (userId) => {
    setLoadingProfile(true);
    const { data: prof } = await supabase
      .from("profiles").select("*, niches(*), subscription_plans(*)").eq("id", userId).single();
    setProfile(prof);
    setNiche(prof?.niches || null);
    setLoadingProfile(false);
  }, []);

  useEffect(() => {
    if (!session) {
      loadedForUserId.current = null;
      setProfile(null);
      return;
    }
    if (loadedForUserId.current === session.user.id) return;
    loadedForUserId.current = session.user.id;
    loadProfile(session.user.id);
  }, [session, loadProfile]);

  // ---- favicon do navegador: usa a logo do usuário logado, quando existir ----
  useEffect(() => {
    if (!profile?.logo_url) return;
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = profile.logo_url;
  }, [profile?.logo_url]);

  if (session === undefined) return <FullscreenMsg text="Carregando…" />;
  if (!session) return <Login />;
  if (loadingProfile || !profile) return <FullscreenMsg text="Carregando seus dados…" />;

  const theme = niche?.theme || FALLBACK_THEME;
  const isAdmin = profile.role === "admin";
  const plan = profile.subscription_plans || null;
  const ownerId = session.user.id;
  const nicheId = profile.niche_id;

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
          {profile.logo_url ? (
            <img src={profile.logo_url} alt="" style={{ maxWidth: 160, maxHeight: 44, objectFit: "contain" }} />
          ) : (
            <>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: theme.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Tag size={16} color="#fff" />
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.3px" }}>Precifica</div>
            </>
          )}
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
            <div style={{ fontSize: 10.5, color: theme.textMuted }}>{isAdmin ? "Admin" : (niche?.name || "Sem nicho")}</div>
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
          {tab === "dashboard" && <Dashboard theme={theme} />}
          {tab === "materiais" && <Materials theme={theme} ownerId={ownerId} showToast={showToast} maxMaterials={plan?.max_materials} />}
          {tab === "produtos" && <Products theme={theme} ownerId={ownerId} nicheId={nicheId} showToast={showToast} maxProducts={plan?.max_products} />}
          {tab === "kits" && <Kits theme={theme} ownerId={ownerId} nicheId={nicheId} showToast={showToast} maxProducts={plan?.max_products} />}
          {tab === "orcamentos" && <Quotes theme={theme} showToast={showToast} ownerName={profile.full_name} logoUrl={profile.logo_url} />}
          {tab === "relatorios" && <Reports theme={theme} />}
          {tab === "config" && (
            <SettingsPage
              theme={theme}
              ownerId={ownerId}
              showToast={showToast}
              logoUrl={profile.logo_url}
              onLogoChange={(url) => setProfile((p) => ({ ...p, logo_url: url }))}
            />
          )}
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
