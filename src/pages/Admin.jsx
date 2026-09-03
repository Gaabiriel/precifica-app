import React, { useEffect, useState } from "react";
import { ShieldCheck, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, Button, Field, inputStyle, iconBtn, Modal, ConfirmModal, ActionsMenu } from "../components/ui.jsx";
import { generateNicheTheme, slugify } from "../theme";
import { supabase } from "../supabaseClient";

const STATUS_LABELS = {
  trialing: "Em teste",
  active: "Ativa",
  past_due: "Pagamento atrasado",
  canceled: "Cancelada",
};
const STATUS_TONES = {
  trialing: (theme) => theme.textMuted,
  active: (theme) => theme.good,
  past_due: (theme) => theme.danger,
  canceled: (theme) => theme.danger,
};

function Chip({ theme, tone, children }) {
  return (
    <span style={{ display: "inline-flex", fontSize: 11, fontWeight: 700, color: tone, background: `${tone}1A`, padding: "3px 9px", borderRadius: 20 }}>
      {children}
    </span>
  );
}

export default function Admin({ theme }) {
  const [profiles, setProfiles] = useState([]);
  const [niches, setNiches] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nicheModal, setNicheModal] = useState(null); // null | {} | niche
  const [nicheDeleteTarget, setNicheDeleteTarget] = useState(null);
  const [nicheError, setNicheError] = useState("");
  const [userModal, setUserModal] = useState(null); // null | profile

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

  const saveNiche = async ({ id, name, primaryColor, accentColor, dark }) => {
    setNicheError("");
    const theme_ = generateNicheTheme(primaryColor, { accentHex: accentColor, dark });
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

      <Card theme={theme} className="admin-users-table-view" style={{ overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "12px 16px", fontWeight: 700, fontSize: 13, borderBottom: `1px solid ${theme.border}` }}>Usuários e assinaturas</div>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 0.8fr 50px", gap: 14, padding: "10px 16px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: theme.textMuted, background: theme.surfaceAlt, borderBottom: `1px solid ${theme.border}` }}>
          <span>Usuário</span><span>Nicho</span><span>Plano</span><span>Status</span><span>Papel</span><span></span>
        </div>
        {profiles.map((p) => {
          const nicheName = niches.find((n) => n.id === p.niche_id)?.name || "—";
          const planName = plans.find((pl) => pl.id === p.plan_id)?.name || "—";
          return (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 0.8fr 50px", gap: 14, padding: "10px 16px", fontSize: 13, alignItems: "center", borderTop: `1px solid ${theme.border}` }}>
              <div>
                <div style={{ fontWeight: 600 }}>{p.full_name || "—"}</div>
                <div style={{ fontSize: 11.5, color: theme.textMuted }}>{p.email}</div>
              </div>
              <span style={{ color: theme.textMuted }}>{nicheName}</span>
              <span style={{ color: theme.textMuted }}>{planName}</span>
              <Chip theme={theme} tone={STATUS_TONES[p.subscription_status]?.(theme) || theme.textMuted}>{STATUS_LABELS[p.subscription_status] || p.subscription_status}</Chip>
              <Chip theme={theme} tone={p.role === "admin" ? theme.primary : theme.textMuted}>{p.role === "admin" ? "Admin" : "Usuário"}</Chip>
              <button onClick={() => setUserModal(p)} style={iconBtn(theme)} title="Editar"><Pencil size={14} /></button>
            </div>
          );
        })}
      </Card>

      <div className="admin-users-card-view" style={{ flexDirection: "column", gap: 10, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>Usuários e assinaturas</div>
        {profiles.map((p) => {
          const nicheName = niches.find((n) => n.id === p.niche_id)?.name || "—";
          const planName = plans.find((pl) => pl.id === p.plan_id)?.name || "—";
          return (
            <Card key={p.id} theme={theme} style={{ padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.full_name || "—"}</div>
                  <div style={{ fontSize: 11.5, color: theme.textMuted }}>{p.email}</div>
                </div>
                <ActionsMenu theme={theme} actions={[{ label: "Editar", icon: Pencil, onClick: () => setUserModal(p) }]} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${theme.border}` }}>
                <Chip theme={theme} tone={STATUS_TONES[p.subscription_status]?.(theme) || theme.textMuted}>{STATUS_LABELS[p.subscription_status] || p.subscription_status}</Chip>
                <Chip theme={theme} tone={p.role === "admin" ? theme.primary : theme.textMuted}>{p.role === "admin" ? "Admin" : "Usuário"}</Chip>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 10, fontSize: 12.5 }}>
                <div><span style={{ color: theme.textMuted }}>Nicho: </span>{nicheName}</div>
                <div><span style={{ color: theme.textMuted }}>Plano: </span>{planName}</div>
              </div>
            </Card>
          );
        })}
      </div>

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
          <div key={n.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 16px", fontSize: 13, borderTop: `1px solid ${theme.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: n.theme?.primary || "#ccc", flexShrink: 0 }} />
              <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.name}</span>
              <span style={{ color: theme.textMuted, fontSize: 11.5, flexShrink: 0 }}>{n.slug}</span>
            </div>
            <div className="desktop-only-actions" style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button onClick={() => { setNicheError(""); setNicheModal(n); }} style={iconBtn(theme)} title="Editar"><Pencil size={14} /></button>
              <button onClick={() => { setNicheError(""); setNicheDeleteTarget(n); }} style={iconBtn(theme)} title="Excluir"><Trash2 size={14} /></button>
            </div>
            <div className="mobile-only-actions">
              <ActionsMenu
                theme={theme}
                actions={[
                  { label: "Editar", icon: Pencil, onClick: () => { setNicheError(""); setNicheModal(n); } },
                  { label: "Excluir", icon: Trash2, danger: true, onClick: () => { setNicheError(""); setNicheDeleteTarget(n); } },
                ]}
              />
            </div>
          </div>
        ))}
        {niches.length === 0 && <div style={{ padding: 24, textAlign: "center", color: theme.textMuted, fontSize: 13 }}>Nenhum nicho cadastrado ainda.</div>}
      </Card>

      {userModal && (
        <UserModal
          theme={theme}
          profile={userModal}
          niches={niches}
          plans={plans}
          onClose={() => setUserModal(null)}
          onSave={(patch) => { updateProfile(userModal.id, patch); setUserModal(null); }}
        />
      )}
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

function UserModal({ theme, profile, niches, plans, onClose, onSave }) {
  const [form, setForm] = useState({
    niche_id: profile.niche_id || "",
    plan_id: profile.plan_id || "",
    subscription_status: profile.subscription_status,
    role: profile.role,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal theme={theme} title={`Editar usuário — ${profile.full_name || profile.email}`} onClose={onClose} width={400}>
      <Field label="Nicho">
        <select style={inputStyle(theme)} value={form.niche_id} onChange={(e) => set("niche_id", e.target.value)}>
          {niches.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
        </select>
      </Field>
      <Field label="Plano">
        <select style={inputStyle(theme)} value={form.plan_id} onChange={(e) => set("plan_id", e.target.value)}>
          {plans.map((pl) => <option key={pl.id} value={pl.id}>{pl.name}</option>)}
        </select>
      </Field>
      <Field label="Status da assinatura">
        <select style={inputStyle(theme)} value={form.subscription_status} onChange={(e) => set("subscription_status", e.target.value)}>
          {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </Field>
      <Field label="Papel">
        <select style={inputStyle(theme)} value={form.role} onChange={(e) => set("role", e.target.value)}>
          <option value="user">Usuário</option>
          <option value="admin">Admin</option>
        </select>
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <Button theme={theme} variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button theme={theme} onClick={() => onSave(form)}>Salvar</Button>
      </div>
    </Modal>
  );
}

function NicheModal({ theme, niche, error, onClose, onSave }) {
  const [name, setName] = useState(niche.name || "");
  const [primaryColor, setPrimaryColor] = useState(niche.theme?.primaryHex || niche.theme?.primary || "#7A5C42");
  const [accentColor, setAccentColor] = useState(niche.theme?.accentHex || niche.theme?.primaryHex || niche.theme?.primary || "#7A5C42");
  const [dark, setDark] = useState(!!niche.theme?.dark);

  return (
    <Modal theme={theme} title={niche.id ? "Editar nicho" : "Novo nicho"} onClose={onClose} width={380}>
      <Field label="Nome do nicho">
        <input style={inputStyle(theme)} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Sapataria & Calçados" />
      </Field>
      <Field label="Cor principal" hint="Usada nos botões, cabeçalhos e no fundo (nichos claros) — o resto da paleta é derivado dela.">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ width: 44, height: 36, padding: 0, border: `1px solid ${theme.border}`, borderRadius: 8, cursor: "pointer" }} />
          <input style={{ ...inputStyle(theme), flex: 1 }} value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
        </div>
      </Field>
      <Field label="Cor de destaque (opcional)" hint="Um segundo tom, usado nos gráficos e detalhes — pra temas de duas cores (ex: rosa + azul).">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ width: 44, height: 36, padding: 0, border: `1px solid ${theme.border}`, borderRadius: 8, cursor: "pointer" }} />
          <input style={{ ...inputStyle(theme), flex: 1 }} value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
        </div>
      </Field>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, margin: "4px 0 14px", cursor: "pointer" }}>
        <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} />
        Modo escuro (fundo escuro, texto claro)
      </label>
      {error && <div style={{ color: theme.danger, fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <Button theme={theme} variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button theme={theme} onClick={() => name.trim() && onSave({ id: niche.id, name, primaryColor, accentColor, dark })}>Salvar</Button>
      </div>
    </Modal>
  );
}
