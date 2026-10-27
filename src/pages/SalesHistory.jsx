import React, { useEffect, useMemo, useState } from "react";
import { Undo2, Pencil } from "lucide-react";
import { inputStyle, iconBtn, ConfirmModal, Spinner, DataTable, Thumb, Modal, Field, Button } from "../components/ui.jsx";
import { brl } from "../pricing.js";
import { useCatalogData, deleteSale, updateSale, fetchSales, productLabel, SALE_TYPES, saleTypeLabel } from "../data.js";

export default function SalesHistory({ theme, showToast }) {
  const { allProducts, loading, reload } = useCatalogData();
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [undoTarget, setUndoTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");

  const loadSales = async () => {
    setLoadingSales(true);
    setSales(await fetchSales());
    setLoadingSales(false);
  };
  useEffect(() => { loadSales(); }, []);

  const productsById = useMemo(() => Object.fromEntries(allProducts.map((p) => [p.id, p])), [allProducts]);

  const rows = useMemo(() => {
    const needle = q.toLowerCase();
    return sales.filter((s) => {
      if (type !== "all" && s.type !== type) return false;
      const p = productsById[s.product_id];
      return [productLabel(p), p?.main_material, s.notes].some((v) => (v || "").toLowerCase().includes(needle));
    });
  }, [sales, productsById, q, type]);

  const totals = useMemo(() => {
    const vendas = rows.filter((s) => s.type === "venda");
    return { count: vendas.length, units: vendas.reduce((s, r) => s + Number(r.qty), 0), revenue: vendas.reduce((s, r) => s + Number(r.total_price), 0) };
  }, [rows]);

  const handleUndo = async (sale) => {
    const { error } = await deleteSale(sale, productsById[sale.product_id]);
    setUndoTarget(null);
    if (error) { showToast("Erro ao desfazer.", "err"); return; }
    showToast(sale.type === "venda" ? "Venda desfeita." : "Saída desfeita.");
    reload();
    loadSales();
  };

  const handleEdit = async (sale, changes) => {
    const { error } = await updateSale(sale, productsById[sale.product_id], changes);
    if (error) { showToast(error.message || "Erro ao salvar.", "err"); return; }
    setEditTarget(null);
    showToast("Registro atualizado.");
    reload();
    loadSales();
  };

  if (loading || loadingSales) return <Spinner theme={theme} />;

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <input
          className="toolbar-field"
          placeholder="Buscar por produto, cor, material ou observação…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ ...inputStyle(theme), maxWidth: 320 }}
        />
        <select className="toolbar-field" value={type} onChange={(e) => setType(e.target.value)} style={{ ...inputStyle(theme), maxWidth: 200 }}>
          <option value="all">Todos os tipos</option>
          {SALE_TYPES.map((t) => <option key={t.value} value={t.value}>Só {t.label.toLowerCase()}</option>)}
        </select>
      </div>

      {totals.count > 0 && (
        <div style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 10 }}>
          {totals.count} {totals.count === 1 ? "venda" : "vendas"} · {totals.units} un. · <strong style={{ color: theme.text }}>{brl(totals.revenue)}</strong> nos registros listados
        </div>
      )}

      <DataTable
        theme={theme}
        rows={rows}
        rowKey={(s) => s.id}
        minWidth={720}
        empty={q || type !== "all" ? "Nenhum registro encontrado com esses filtros." : "Nenhuma venda ou saída registrada ainda."}
        columns={[
          { label: "", width: "44px", render: (s) => <Thumb theme={theme} images={productsById[s.product_id]?.image_urls} /> },
          { label: "Tipo", width: "110px", render: (s) => <TypeBadge theme={theme} type={s.type} /> },
          {
            label: "Produto", width: "2fr", render: (s) => (
              <span style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {productLabel(productsById[s.product_id]) || "Produto"}
                {(!productsById[s.product_id] || productsById[s.product_id].deleted_at) && (
                  <span style={{ fontWeight: 500, color: theme.textMuted }}> (produto removido)</span>
                )}
              </span>
            ),
          },
          { label: "Data", width: "95px", render: (s) => new Date(s.sold_at).toLocaleDateString("pt-BR") },
          { label: "Qtd", width: "55px", align: "right", render: (s) => `${s.qty}` },
          { label: "Valor", width: "100px", align: "right", render: (s) => <strong>{s.type !== "venda" ? "—" : brl(s.total_price)}</strong> },
          { label: "Observação", width: "1.4fr", render: (s) => <span style={{ color: theme.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.notes || "—"}</span> },
          {
            label: "", width: "72px", align: "right", render: (s) => (
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setEditTarget(s)} style={{ ...iconBtn(theme), width: 30, height: 30 }} title="Editar">
                  <Pencil size={13} />
                </button>
                <button onClick={() => setUndoTarget(s)} style={{ ...iconBtn(theme), width: 30, height: 30 }} title="Desfazer (devolve ao estoque)">
                  <Undo2 size={13} />
                </button>
              </div>
            ),
          },
        ]}
      />

      {editTarget && (
        <EditSaleModal theme={theme} sale={editTarget} product={productsById[editTarget.product_id]}
          onClose={() => setEditTarget(null)} onSave={(changes) => handleEdit(editTarget, changes)} />
      )}
      {undoTarget && (
        <ConfirmModal
          theme={theme}
          title="Desfazer registro"
          confirmLabel="Desfazer"
          message={`Desfazer ${undoTarget.type === "venda" ? "essa venda" : `essa saída (${saleTypeLabel(undoTarget.type).toLowerCase()})`} de ${undoTarget.qty}x ${productLabel(productsById[undoTarget.product_id])}? A quantidade volta pro estoque.`}
          onCancel={() => setUndoTarget(null)}
          onConfirm={() => handleUndo(undoTarget)}
        />
      )}
    </div>
  );
}

function TypeBadge({ theme, type }) {
  const isRemoval = type !== "venda";
  return (
    <span
      style={{
        fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 5,
        background: isRemoval ? theme.surfaceAlt : `${theme.good}1A`,
        color: isRemoval ? theme.textMuted : theme.good,
      }}
    >
      {saleTypeLabel(type).toUpperCase()}
    </span>
  );
}

function toDateInput(d) {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function EditSaleModal({ theme, sale, product, onClose, onSave }) {
  const [type, setType] = useState(sale.type);
  const [qty, setQty] = useState(Number(sale.qty));
  const [totalPrice, setTotalPrice] = useState(Number(sale.total_price) || 0);
  const [date, setDate] = useState(toDateInput(sale.sold_at));
  const [notes, setNotes] = useState(sale.notes || "");
  const [saving, setSaving] = useState(false);
  const isSale = type === "venda";
  const maxQty = Number(sale.qty) + (product?.stock_qty || 0);

  const save = async () => {
    setSaving(true);
    // data igual à original mantém o horário gravado; data nova vai pro meio-dia local (evita cair no dia vizinho por fuso)
    const soldAt = date === toDateInput(sale.sold_at) ? sale.sold_at : new Date(`${date}T12:00:00`).toISOString();
    await onSave({ type, qty, totalPrice, notes, soldAt });
    setSaving(false);
  };

  const typeBtn = (active) => ({
    padding: "7px 12px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
    border: `1px solid ${active ? theme.primary : theme.border}`,
    background: active ? theme.primarySoft : theme.surface,
    color: active ? theme.primary : theme.text,
  });

  return (
    <Modal theme={theme} title={`Editar registro — ${productLabel(product) || "Produto removido"}`} onClose={onClose} width={420}>
      <Field label="Tipo">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SALE_TYPES.map((t) => (
            <button key={t.value} type="button" onClick={() => setType(t.value)} style={typeBtn(type === t.value)}>{t.label}</button>
          ))}
        </div>
      </Field>
      {!isSale && (
        <div style={{ fontSize: 12, color: theme.textMuted, margin: "-4px 0 12px", lineHeight: 1.5 }}>
          Não entra no faturamento nem no lucro.
        </div>
      )}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 140px" }}>
          <Field label={product ? `Quantidade (até ${maxQty})` : "Quantidade"} hint="Mudar a quantidade ajusta o estoque do produto.">
            <input type="number" min={1} max={product ? maxQty : undefined} style={inputStyle(theme)} value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(product ? maxQty : Infinity, parseInt(e.target.value) || 1)))} />
          </Field>
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <Field label="Data">
            <input type="date" style={inputStyle(theme)} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
          </Field>
        </div>
      </div>
      {isSale && (
        <Field label="Valor total cobrado">
          <input type="number" step="0.01" min={0} style={inputStyle(theme)} value={totalPrice} onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)} />
        </Field>
      )}
      <Field label="Observação (opcional)">
        <input style={inputStyle(theme)} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
        <Button theme={theme} variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button theme={theme} onClick={save} disabled={saving}>Salvar alterações</Button>
      </div>
    </Modal>
  );
}
