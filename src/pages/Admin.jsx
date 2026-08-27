import React, { useEffect, useState } from "react";
import { ShieldCheck, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, Button, Field, inputStyle, iconBtn, Modal, ConfirmModal } from "../components/ui.jsx";
import { generateNicheTheme, slugify } from "../theme";
import { supabase } from "../supabaseClient";

export default function Admin({ theme }) {
  const [profiles, setProfiles] = useState([]);
  const [niches, setNiches] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nicheModal, setNicheModal] = useState(null); // null | {} | niche
  const [nicheDeleteTarget, setNicheDeleteTarget] = useState(null);
  const [nicheError, setNicheError] = useState("");

  const load = async () => {
    setLoading(true);
    const [{ data: p }, { data: n }, { data: pl }] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, role, subscription_status, niche_id, plan_id, created_at").order("created_at", { ascending: false }),
      supabase.from("niches").select("id, name, slug, theme").order("name"),
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

  const saveNiche = async ({ id, name, primaryColor }) => {
    setNicheError("");
    const theme_ = generateNicheTheme(primaryColor);
    if (id) {
      const { error } = await supabase.from("niches").update({ name, theme: theme_ }).eq("id", id);
      if (error) { setNicheError("Não foi possível salvar. Tente outro nome."); return; }
    } else {
      const { error } = await supabase.from("niches").insert({ name, slug: slugify(name), theme: theme_ });
      if (error) { setNicheError("Já existe um nicho com esse nome."); return; }
    }
    setNicheModal(null);
    load();
  };

  const deleteNiche = async (id) => {
    const { error } = await supabase.from("niches").delete().eq("id", id);
    setNicheDeleteTarget(null);
    if (error) {
      setNicheError("Esse nicho está em uso por algum usuário — troque o nicho dele antes de excluir.");
      return;
    }
    load();
  };

  if (loading) return <div style={{ color: theme.textMuted, fontSize: 13.5 }}>Carregando painel administrativo…</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <ShieldCheck size={18} color={theme.primary} />
        <div style={{ fontSize: 17, fontWeight: 800 }}>Administração</div>
      </div>

      <Card theme={theme} style={{ overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "12px 16px", fontWeight: 700, fontSize: 13, borderBottom: `1px solid ${theme.border}` }}>Usuários e assinaturas</div>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr", gap: 14, padding: "10px 16px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: theme.textMuted, background: theme.surfaceAlt, borderBottom: `1px solid ${theme.border}` }}>
          <span>Usuário</span><span>Nicho</span><span>Plano</span><span>Status</span><span>Papel</span>
        </div>
        {profiles.map((p) => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr", gap: 14, padding: "10px 16px", fontSize: 13, alignItems: "center", borderTop: `1px solid ${theme.border}` }}>
            <div>
              <div style={{ fontWeight: 600 }}>{p.full_name || "—"}</div>
              <div style={{ fontSize: 11.5, color: theme.textMuted }}>{p.email}</div>
            </div>
            <select style={{ ...inputStyle(theme), width: "auto", maxWidth: 200, fontSize: 12 }} value={p.niche_id || ""} onChange={(e) => updateProfile(p.id, { niche_id: e.target.value })}>
              {niches.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
            <select style={{ ...inputStyle(theme), width: "auto", maxWidth: 160, fontSize: 12 }} value={p.plan_id || ""} onChange={(e) => updateProfile(p.id, { plan_id: e.target.value })}>
              {plans.map((pl) => <option key={pl.id} value={pl.id}>{pl.name}</option>)}
            </select>
            <select style={{ ...inputStyle(theme), width: "auto", maxWidth: 140, fontSize: 12 }} value={p.subscription_status} onChange={(e) => updateProfile(p.id, { subscription_status: e.target.value })}>
              {["trialing", "active", "past_due", "canceled"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select style={{ ...inputStyle(theme), width: "auto", maxWidth: 120, fontSize: 12 }} value={p.role} onChange={(e) => updateProfile(p.id, { role: e.target.value })}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
        ))}
      </Card>

      <Card theme={theme} style={{ overflow: "hidden", marginBottom: 24 }}>
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

      <Card theme={theme} style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Nichos disponíveis</div>
          <Button theme={theme} variant="soft" style={{ padding: "5px 10px", fontSize: 11.5 }} onClick={() => { setNicheError(""); setNicheModal({}); }}>
            <Plus size={13} /> Novo nicho
          </Button>
        </div>
        {nicheError && (
          <div style={{ padding: "10px 16px", fontSize: 12.5, color: theme.danger, borderBottom: `1px solid ${theme.border}` }}>{nicheError}</div>
        )}
        {niches.map((n) => (
          <div key={n.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", fontSize: 13, borderTop: `1px solid ${theme.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: n.theme?.primary || "#ccc", flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>{n.name}</span>
              <span style={{ color: theme.textMuted, fontSize: 11.5 }}>{n.slug}</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => { setNicheError(""); setNicheModal(n); }} style={iconBtn(theme)}><Pencil size={14} /></button>
              <button onClick={() => { setNicheError(""); setNicheDeleteTarget(n); }} style={iconBtn(theme)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {niches.length === 0 && <div style={{ padding: 24, textAlign: "center", color: theme.textMuted, fontSize: 13 }}>Nenhum nicho cadastrado ainda.</div>}
      </Card>

      {nicheModal && (
        <NicheModal theme={theme} niche={nicheModal} error={nicheError} onClose={() => setNicheModal(null)} onSave={saveNiche} />
      )}
      {nicheDeleteTarget && (
        <ConfirmModal
          theme={theme}
          message={`Tem certeza que quer excluir o nicho "${nicheDeleteTarget.name}"? Se algum usuário estiver usando esse nicho, a exclusão vai falhar.`}
          onCancel={() => setNicheDeleteTarget(null)}
          onConfirm={() => deleteNiche(nicheDeleteTarget.id)}
        />
      )}
    </div>
  );
}

function NicheModal({ theme, niche, error, onClose, onSave }) {
  const [name, setName] = useState(niche.name || "");
  const [primaryColor, setPrimaryColor] = useState(niche.theme?.primary || "#7A5C42");

  return (
    <Modal theme={theme} title={niche.id ? "Editar nicho" : "Novo nicho"} onClose={onClose} width={380}>
      <Field label="Nome do nicho">
        <input style={inputStyle(theme)} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Sapataria & Calçados" />
      </Field>
      <Field label="Cor principal" hint="O resto da paleta (fundo, textos, bordas etc.) é gerado automaticamente a partir dessa cor.">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ width: 44, height: 36, padding: 0, border: `1px solid ${theme.border}`, borderRadius: 8, cursor: "pointer" }} />
          <input style={{ ...inputStyle(theme), flex: 1 }} value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
        </div>
      </Field>
      {error && <div style={{ color: theme.danger, fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <Button theme={theme} variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button theme={theme} onClick={() => name.trim() && onSave({ id: niche.id, name, primaryColor })}>Salvar</Button>
      </div>
    </Modal>
  );
}
