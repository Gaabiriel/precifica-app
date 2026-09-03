import React, { useEffect, useState } from "react";
import { Save, Info } from "lucide-react";
import { Card, Button, Field, inputStyle } from "../components/ui.jsx";
import { fetchSettings, saveSettingsRow } from "../data.js";

export default function SettingsPage({ theme, ownerId, showToast }) {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings().then((st) => {
      setSettings(st);
      setForm(st);
      setLoading(false);
    });
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    const { error } = await saveSettingsRow(ownerId, form);
    if (error) { showToast("Erro ao salvar configurações.", "err"); return; }
    setSettings(form);
    showToast("Configurações salvas.");
  };

  if (loading || !form) return <div style={{ color: theme.textMuted, fontSize: 13.5 }}>Carregando configurações…</div>;

  const dirty = JSON.stringify(form) !== JSON.stringify(settings);

  return (
    <div>
      <Card theme={theme} style={{ padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Parâmetros de precificação</div>
        <div style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 20 }}>Esses valores entram automaticamente no cálculo de custo de todos os produtos.</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "4px 20px" }}>
          <Field label="Custo da hora de mão de obra (R$)"><input type="number" style={inputStyle(theme)} value={form.labor_cost_per_hour} onChange={(e) => set("labor_cost_per_hour", parseFloat(e.target.value) || 0)} /></Field>
          <Field label="Manutenção de equipamento (%)" hint="% sobre material + mão de obra"><input type="number" style={inputStyle(theme)} value={form.maintenance_percent} onChange={(e) => set("maintenance_percent", parseFloat(e.target.value) || 0)} /></Field>
          <Field label="Despesas fixas mensais (R$)" hint="Luz, água, internet, aluguel…"><input type="number" style={inputStyle(theme)} value={form.monthly_fixed_expenses} onChange={(e) => set("monthly_fixed_expenses", parseFloat(e.target.value) || 0)} /></Field>
          <Field label="Produção mensal estimada (un.)"><input type="number" style={inputStyle(theme)} value={form.monthly_capacity_units} onChange={(e) => set("monthly_capacity_units", parseFloat(e.target.value) || 1)} /></Field>
          <Field label="Margem de lucro padrão (%)"><input type="number" style={inputStyle(theme)} value={form.default_margin_percent} onChange={(e) => set("default_margin_percent", parseFloat(e.target.value) || 0)} /></Field>
          <Field label="Taxa de cartão/marketplace (%)"><input type="number" style={inputStyle(theme)} value={form.card_fee_percent} onChange={(e) => set("card_fee_percent", parseFloat(e.target.value) || 0)} /></Field>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, margin: "10px 0 4px", cursor: "pointer" }}>
          <input type="checkbox" checked={form.round_to_90} onChange={(e) => set("round_to_90", e.target.checked)} />
          Arredondar preço final para terminar em ",90"
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
          <Button theme={theme} onClick={handleSave} style={{ opacity: dirty ? 1 : 0.5 }}><Save size={14} /> Salvar configurações</Button>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 8, marginTop: 14, padding: 14, background: theme.primarySoft, borderRadius: 12, fontSize: 12.5, color: theme.text }}>
        <Info size={26} style={{ flexShrink: 0, color: theme.primary }} />
        <span>Cada usuário tem sua própria configuração — os parâmetros da sua mãe não afetam os da sua cunhada, mesmo usando o mesmo sistema.</span>
      </div>
    </div>
  );
}
