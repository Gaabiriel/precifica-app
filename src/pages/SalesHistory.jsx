import React, { useEffect, useMemo, useState } from "react";
import { Undo2, Pencil } from "lucide-react";
import { inputStyle, iconBtn, ConfirmModal, Spinner, DataTable, Thumb, Modal, Field, Button } from "../components/ui.jsx";
import { brl, computeProductCost, monthKey } from "../pricing.js";
import { useCatalogData, deleteSale, updateSale, fetchSales, productLabel, SALE_TYPES, saleTypeLabel } from "../data.js";

export default function SalesHistory({ theme, showToast }) {
  const { allProducts, materials, settings, loading, reload } = useCatalogData();
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [undoTarget, setUndoTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [month, setMonth] = useState("all");

  const loadSales = async () => {
    setLoadingSales(true);
    setSales(await fetchSales());
    setLoadingSales(false);
  };
  useEffect(() => { loadSales(); }, []);

  const productsById = useMemo(() => Object.fromEntries(allProducts.map((p) => [p.id, p])), [allProducts]);

  // custo unitário atual de cada produto (mesmo cálculo da tela de produtos) —
  // usado pra mostrar quanto custou cada saída, inclusive presentes/brindes.
  const unitCostById = useMemo(() => {
    if (!settings) return {};
    return Object.fromEntries(allProducts.map((p) => [p.id, computeProductCost(p, materials, allProducts, settings).subtotal]));
  }, [allProducts, materials, settings]);
  const costOf = (s) => (unitCostById[s.product_id] || 0) * Number(s.qty);

  const monthOptions = useMemo(() => [...new Set(sales.map((s) => monthKey(s.sold_at)))].sort().reverse(), [sales]);

  const rows = useMemo(() => {
    const needle = q.toLowerCase();
    return sales.filter((s) => {
      if (type !== "all" && s.type !== type) return false;
      if (month !== "all" && monthKey(s.sold_at) !== month) return false;
      const p = productsById[s.product_id];
      return [productLabel(p), p?.main_material, s.notes].some((v) => (v || "").toLowerCase().includes(needle));
    });
  }, [sales, productsById, q, type, month]);

  // resumo dos registros filtrados, um bloco por tipo: venda mostra faturamento,
  // custo e lucro; os demais (presente, brinde…) mostram o custo das peças.
  const summary = useMemo(() => {
    const byType = new Map();
    rows.forEach((s) => {
      const cur = byType.get(s.type) || { type: s.type, count: 0, units: 0, revenue: 0, cost: 0 };
      cur.count += 1;
      cur.units += Number(s.qty);
      cur.revenue += s.type === "venda" ? Number(s.total_price) : 0;
      cur.cost += costOf(s);
      byType.set(s.type, cur);
    });
    return SALE_TYPES.map((t) => byType.get(t.value)).filter(Boolean);
  }, [rows, unitCostById]);
  const nonSaleCost = summary.filter((g) => g.type !== "venda").reduce((s, g) => s + g.cost, 0);

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
        <select className="toolbar-field" value={month} onChange={(e) => setMonth(e.target.value)} style={{ ...inputStyle(theme), maxWidth: 200 }}>
          <option value="all">Todos os meses</option>
          {monthOptions.map((m) => <option key={m} value={m}>{monthName(m)}</option>)}
        </select>
      </div>

      {summary.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 10, marginBottom: 14 }}>
          {summary.map((g) => <SummaryBox key={g.type} theme={theme} group={g} />)}
          {summary.filter((g) => g.type !== "venda").length > 1 && (
            <SummaryBox theme={theme} group={{ type: "_total", units: summary.filter((g) => g.type !== "venda").reduce((s, g) => s + g.units, 0), cost: nonSaleCost }} />
          )}
        </div>
      )}

      <DataTable
        theme={theme}
        rows={rows}
        rowKey={(s) => s.id}
        minWidth={820}
        empty={q || type !== "all" || month !== "all" ? "Nenhum registro encontrado com esses filtros." : "Nenhuma venda ou saída registrada ainda."}
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
          {
            label: "Valor", width: "100px", align: "right", render: (s) => s.type === "venda"
              ? <strong>{brl(s.total_price)}</strong>
              : <span style={{ color: theme.textMuted, fontStyle: "italic" }} title="Sem venda: mostra o custo das peças">{brl(costOf(s))}</span>,
          },
          { label: "Custo", width: "100px", align: "right", render: (s) => <span style={{ color: theme.textMuted }}>{brl(costOf(s))}</span> },
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

function monthName(key) {
  const [y, m] = key.split("-").map(Number);
  const label = new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Bloco do resumo: venda → faturamento/custo/lucro; outros tipos → custo das peças. */
function SummaryBox({ theme, group }) {
  const isSale = group.type === "venda";
  const title = group.type === "_total" ? "Total sem venda" : saleTypeLabel(group.type);
  const line = (label, value, tone, bold) => (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "2px 0" }}>
      <span style={{ color: theme.textMuted }}>{label}</span>
      <span style={{ fontWeight: bold ? 800 : 600, color: tone || theme.text }}>{value}</span>
    </div>
  );
  return (
    <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", color: isSale ? theme.good : theme.textMuted, marginBottom: 6 }}>
        {title} · {group.units} un.
      </div>
      {isSale ? (
        <>
          {line("Faturamento", brl(group.revenue))}
          {line("Custo", brl(group.cost))}
          {line("Lucro", brl(group.revenue - group.cost), group.revenue - group.cost < 0 ? theme.danger : theme.good, true)}
        </>
      ) : (
        line("Custo das peças", brl(group.cost), theme.text, true)
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
