import React, { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, History } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, Button, Field, inputStyle, iconBtn, Modal, UNIT_OPTIONS, Pagination, SortHeader } from "../components/ui.jsx";
import { brl } from "../pricing.js";
import { supabase } from "../supabaseClient";

const PAGE_SIZE = 10;

export default function Materials({ theme, materials, onSave, onDelete }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [sort, setSort] = useState({ field: "name", dir: "asc" });
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | {} | material
  const [historyOf, setHistoryOf] = useState(null);

  const categories = useMemo(
    () => Array.from(new Set(materials.map((m) => m.category).filter(Boolean))).sort(),
    [materials]
  );

  const filtered = useMemo(() => {
    let list = materials.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()));
    if (category) list = list.filter((m) => m.category === category);
    if (onlyLowStock) list = list.filter((m) => Number(m.stock) <= Number(m.min_stock));
    const dir = sort.dir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      const va = a[sort.field], vb = b[sort.field];
      if (typeof va === "string") return va.localeCompare(vb) * dir;
      return ((va || 0) - (vb || 0)) * dir;
    });
    return list;
  }, [materials, q, category, onlyLowStock, sort]);

  useEffect(() => { setPage(1); }, [q, category, onlyLowStock, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleSort = (field) => setSort((s) => (s.field === field ? { field, dir: s.dir === "asc" ? "desc" : "asc" } : { field, dir: "asc" }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: 1 }}>
          <input placeholder="Buscar material…" value={q} onChange={(e) => setQ(e.target.value)} style={{ ...inputStyle(theme), maxWidth: 220 }} />
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...inputStyle(theme), maxWidth: 190 }}>
            <option value="">Todas as categorias</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: theme.textMuted, cursor: "pointer" }}>
            <input type="checkbox" checked={onlyLowStock} onChange={(e) => setOnlyLowStock(e.target.checked)} />
            Só estoque baixo
          </label>
        </div>
        <Button theme={theme} onClick={() => setModal({})}><Plus size={15} /> Novo material</Button>
      </div>

      <Card theme={theme} style={{ overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 110px", padding: "10px 16px", borderBottom: `1px solid ${theme.border}` }}>
          <SortHeader theme={theme} label="Material" field="name" sort={sort} onSort={toggleSort} />
          <SortHeader theme={theme} label="Categoria" field="category" sort={sort} onSort={toggleSort} />
          <SortHeader theme={theme} label="Preço/un." field="price" sort={sort} onSort={toggleSort} />
          <SortHeader theme={theme} label="Estoque" field="stock" sort={sort} onSort={toggleSort} />
          <SortHeader theme={theme} label="Perda %" field="waste_percent" sort={sort} onSort={toggleSort} />
          <span></span>
        </div>
        {paged.map((m) => {
          const low = m.stock <= m.min_stock;
          return (
            <div key={m.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 110px", padding: "12px 16px", fontSize: 13.5, alignItems: "center", borderBottom: `1px solid ${theme.border}` }}>
              <span style={{ fontWeight: 600 }}>{m.name}</span>
              <span style={{ color: theme.textMuted }}>{m.category || "—"}</span>
              <span>{brl(m.price)} / {m.unit}</span>
              <span style={{ color: low ? theme.danger : theme.text, fontWeight: low ? 700 : 400 }}>{m.stock} {m.unit}</span>
              <span style={{ color: theme.textMuted }}>{m.waste_percent || 0}%</span>
              <span style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setHistoryOf(m)} style={iconBtn(theme)} title="Histórico de preço"><History size={14} /></button>
                <button onClick={() => setModal(m)} style={iconBtn(theme)}><Pencil size={14} /></button>
                <button onClick={() => onDelete(m.id)} style={iconBtn(theme)}><Trash2 size={14} /></button>
              </span>
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ padding: 24, textAlign: "center", color: theme.textMuted, fontSize: 13 }}>Nenhum material encontrado.</div>}
      </Card>

      <Pagination theme={theme} page={currentPage} totalPages={totalPages} onChange={setPage} />

      {modal && <MaterialModal theme={theme} material={modal} onClose={() => setModal(null)} onSave={(m) => { onSave(m); setModal(null); }} />}
      {historyOf && <PriceHistoryModal theme={theme} material={historyOf} onClose={() => setHistoryOf(null)} />}
    </div>
  );
}

function MaterialModal({ theme, material, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "", category: "", unit: "un", price: 0, stock: 0, min_stock: 0,
    waste_percent: 0, supplier: "", image_url: "", reference_measure: "",
    ...material,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <Modal theme={theme} title={material.id ? "Editar material" : "Novo material"} onClose={onClose}>
      <Field label="Nome do material">
        <input style={inputStyle(theme)} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Corvin Dune, Chocolate Belga…" />
      </Field>
      <Field label="Categoria">
        <input style={inputStyle(theme)} value={form.category} onChange={(e) => set("category", e.target.value)} />
      </Field>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Field label="Unidade de medida">
            <select style={inputStyle(theme)} value={form.unit} onChange={(e) => set("unit", e.target.value)}>
              {UNIT_OPTIONS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Preço por unidade (R$)">
            <input type="number" step="0.01" style={inputStyle(theme)} value={form.price} onChange={(e) => set("price", parseFloat(e.target.value) || 0)} />
          </Field>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Field label="Estoque atual"><input type="number" step="0.01" style={inputStyle(theme)} value={form.stock} onChange={(e) => set("stock", parseFloat(e.target.value) || 0)} /></Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Estoque mínimo"><input type="number" step="0.01" style={inputStyle(theme)} value={form.min_stock} onChange={(e) => set("min_stock", parseFloat(e.target.value) || 0)} /></Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="% de perda" hint="Sobra de corte, quebra…"><input type="number" step="0.1" style={inputStyle(theme)} value={form.waste_percent} onChange={(e) => set("waste_percent", parseFloat(e.target.value) || 0)} /></Field>
        </div>
      </div>
      <Field label="Fornecedor (opcional)"><input style={inputStyle(theme)} value={form.supplier || ""} onChange={(e) => set("supplier", e.target.value)} /></Field>
      <Field label="URL da imagem (opcional)"><input style={inputStyle(theme)} value={form.image_url || ""} onChange={(e) => set("image_url", e.target.value)} placeholder="https://…" /></Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <Button theme={theme} variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button theme={theme} onClick={() => form.name.trim() && onSave(form)}>Salvar</Button>
      </div>
    </Modal>
  );
}

function PriceHistoryModal({ theme, material, onClose }) {
  const [rows, setRows] = useState(null);
  React.useEffect(() => {
    supabase
      .from("material_price_history")
      .select("price, changed_at")
      .eq("material_id", material.id)
      .order("changed_at", { ascending: true })
      .then(({ data }) => setRows(data || []));
  }, [material.id]);

  const chartData = (rows || []).map((r) => ({
    date: new Date(r.changed_at).toLocaleDateString("pt-BR"),
    Preço: r.price,
  }));

  return (
    <Modal theme={theme} title={`Histórico de preço — ${material.name}`} onClose={onClose} width={520}>
      {rows === null && <div style={{ fontSize: 13, color: theme.textMuted }}>Carregando…</div>}
      {rows && rows.length === 0 && <div style={{ fontSize: 13, color: theme.textMuted }}>Ainda não há histórico registrado.</div>}
      {rows && rows.length > 0 && (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: theme.textMuted }} />
            <YAxis tick={{ fontSize: 11, fill: theme.textMuted }} />
            <Tooltip formatter={(v) => brl(v)} />
            <Line type="monotone" dataKey="Preço" stroke={theme.primary} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Modal>
  );
}
