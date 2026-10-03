import React, { useEffect, useMemo, useState } from "react";
import { Undo2 } from "lucide-react";
import { inputStyle, iconBtn, ConfirmModal, Spinner, DataTable, Thumb } from "../components/ui.jsx";
import { brl } from "../pricing.js";
import { useCatalogData, deleteSale, fetchSales, productLabel } from "../data.js";

export default function SalesHistory({ theme, showToast }) {
  const { allProducts, loading, reload } = useCatalogData();
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [undoTarget, setUndoTarget] = useState(null);
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
    showToast(sale.type === "remocao" ? "Remoção desfeita." : "Venda desfeita.");
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
          <option value="all">Vendas e remoções</option>
          <option value="venda">Só vendas</option>
          <option value="remocao">Só remoções</option>
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
        empty={q || type !== "all" ? "Nenhum registro encontrado com esses filtros." : "Nenhuma venda ou remoção registrada ainda."}
        columns={[
          { label: "", width: "44px", render: (s) => <Thumb theme={theme} images={productsById[s.product_id]?.image_urls} /> },
          { label: "Tipo", width: "90px", render: (s) => <TypeBadge theme={theme} type={s.type} /> },
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
          { label: "Valor", width: "100px", align: "right", render: (s) => <strong>{s.type === "remocao" ? "—" : brl(s.total_price)}</strong> },
          { label: "Observação", width: "1.4fr", render: (s) => <span style={{ color: theme.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.notes || "—"}</span> },
          {
            label: "", width: "40px", align: "right", render: (s) => (
              <button onClick={() => setUndoTarget(s)} style={{ ...iconBtn(theme), width: 30, height: 30 }} title="Desfazer (devolve ao estoque)">
                <Undo2 size={13} />
              </button>
            ),
          },
        ]}
      />

      {undoTarget && (
        <ConfirmModal
          theme={theme}
          title="Desfazer registro"
          confirmLabel="Desfazer"
          message={`Desfazer ${undoTarget.type === "remocao" ? "essa remoção" : "essa venda"} de ${undoTarget.qty}x ${productLabel(productsById[undoTarget.product_id])}? A quantidade volta pro estoque.`}
          onCancel={() => setUndoTarget(null)}
          onConfirm={() => handleUndo(undoTarget)}
        />
      )}
    </div>
  );
}

function TypeBadge({ theme, type }) {
  const isRemoval = type === "remocao";
  return (
    <span
      style={{
        fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 5,
        background: isRemoval ? theme.surfaceAlt : `${theme.good}1A`,
        color: isRemoval ? theme.textMuted : theme.good,
      }}
    >
      {isRemoval ? "REMOVIDO" : "VENDA"}
    </span>
  );
}
