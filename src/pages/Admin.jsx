import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Card, inputStyle } from "../components/ui.jsx";
import { supabase } from "../supabaseClient";

export default function Admin({ theme }) {
  const [profiles, setProfiles] = useState([]);
  const [niches, setNiches] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: p }, { data: n }, { data: pl }] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, role, subscription_status, niche_id, plan_id, created_at").order("created_at", { ascending: false }),
      supabase.from("niches").select("id, name"),
      supabase.from("subscription_plans").select("id, name, slug, price_cents, max_products, max_materials"),
    ]);
    setProfiles(p || []); setNiches(n || []); setPlans(pl || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateProfile = async (id, patch) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    await supabase.from("profiles").update(patch).eq("id", id);
  };

  if (loading) return <div style={{ color: theme.textMuted, fontSize: 13.5 }}>Carregando painel administrativo…</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <ShieldCheck size={18} color={theme.primary} />
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700 }}>Administração</div>
      </div>

      <Card theme={theme} style={{ overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "12px 16px", fontWeight: 700, fontSize: 13, borderBottom: `1px solid ${theme.border}` }}>Usuários e assinaturas</div>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr", padding: "8px 16px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: theme.textMuted }}>
          <span>Usuário</span><span>Nicho</span><span>Plano</span><span>Status</span><span>Papel</span>
        </div>
        {profiles.map((p) => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr", padding: "10px 16px", fontSize: 13, alignItems: "center", borderTop: `1px solid ${theme.border}` }}>
            <div>
              <div style={{ fontWeight: 600 }}>{p.full_name || "—"}</div>
              <div style={{ fontSize: 11.5, color: theme.textMuted }}>{p.email}</div>
            </div>
            <select style={{ ...inputStyle(theme), fontSize: 12 }} value={p.niche_id || ""} onChange={(e) => updateProfile(p.id, { niche_id: e.target.value })}>
              {niches.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
            <select style={{ ...inputStyle(theme), fontSize: 12 }} value={p.plan_id || ""} onChange={(e) => updateProfile(p.id, { plan_id: e.target.value })}>
              {plans.map((pl) => <option key={pl.id} value={pl.id}>{pl.name}</option>)}
            </select>
            <select style={{ ...inputStyle(theme), fontSize: 12 }} value={p.subscription_status} onChange={(e) => updateProfile(p.id, { subscription_status: e.target.value })}>
              {["trialing", "active", "past_due", "canceled"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select style={{ ...inputStyle(theme), fontSize: 12 }} value={p.role} onChange={(e) => updateProfile(p.id, { role: e.target.value })}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
        ))}
      </Card>

      <Card theme={theme} style={{ overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", fontWeight: 700, fontSize: 13, borderBottom: `1px solid ${theme.border}` }}>Planos disponíveis</div>
        {plans.map((pl) => (
          <div key={pl.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", fontSize: 13, borderTop: `1px solid ${theme.border}` }}>
            <span style={{ fontWeight: 600 }}>{pl.name}</span>
            <span style={{ color: theme.textMuted }}>
              {(pl.price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/mês ·
              {" "}{pl.max_products ?? "∞"} produtos · {pl.max_materials ?? "∞"} materiais
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
