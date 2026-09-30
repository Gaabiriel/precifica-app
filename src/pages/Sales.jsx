import React, { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Card, Button, Field, inputStyle, iconBtn, Modal, ConfirmModal, Row, Spinner } from "../components/ui.jsx";
import { brl, computeProductCost } from "../pricing.js";
import { useCatalogData, registerSale, deleteSale, fetchSales } from "../data.js";

export default function Sales({ theme, ownerId, showToast }) {
  const { materials, products, settings, loading, reload } = useCatalogData();
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [saleTarget, setSaleTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [q, setQ] = useState("");

  const loadSales = async () => {
    setLoadingSales(true);
    setSales(await fetchSales());
    setLoadingSales(false);
  };
  useEffect(() => { loadSales(); }, []);

  const productsById = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);

  const readyToSell = useMemo(() => {
    if (!settings) return [];
    return products
      .filter((p) => !p.is_kit)
      .map((p) => ({ product: p, calc: computeProductCost(p, materials, products, settings), avail: (p.produced_count || 0) - (p.sold_count || 0) }))
      .filter((r) => r.avail > 0 && r.product.name.toLowerCase().includes(q.toLowerCase()));
  }, [products, materials, settings, q]);

  const handleSale = async (product, qty, totalPrice, notes) => {
    const { error } = await registerSale({ ownerId, product, qty, totalPrice, notes });
    setSaleTarget(null);
    if (error) { showToast(error.message, "err"); return; }
    showToast("Venda registrada.");
    reload();
    loadSales();
  };

  const handleDeleteSale = async (sale) => {
    const { error } = await deleteSale(sale, productsById[sale.product_id]);
    setDeleteTarget(null);
    if (error) { showToast("Erro ao excluir.", "err"); return; }
    showToast("Venda removida.");
    reload();
    loadSales();
  };

  if (loading) return <Spinner theme={theme} />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>Vendas</div>
          <div style={{ fontSize: 12.5, color: theme.textMuted }}>O que já foi produzido e ainda não vendido, e o histórico do que já saiu.</div>
        </div>
        <input placeholder="Buscar produto..." value={q} onChange={(e) => setQ(e.target.value)} style={{ ...inputStyle(theme), width: 220 }} />
      </div>

      <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", opacity: 0.6, margin: "0 0 10px" }}>Prontos para vender</div>
      {readyToSell.length === 0 && (
        <div style={{ textAlign: "center", padding: 30, color: theme.textMuted, fontSize: 13.5, marginBottom: 20 }}>
          Nada pronto pra vender ainda. Produza algum produto na aba Produtos primeiro.
        </div>
      )}
      {readyToSell.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 14, marginBottom: 30 }}>
          {readyToSell.map(({ product, calc, avail }) => (
            <Card key={product.id} theme={theme}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>{product.name}</div>
              <Row theme={theme} label="Prontos, não vendidos" value={`${avail} un.`} bold />
              <Row theme={theme} label="Preço de venda sugerido" value={brl(calc.finalPrice)} />
              <Button theme={theme} variant="soft" style={{ width: "100%", justifyContent: "center", marginTop: 10, height: 34 }} onClick={() => setSaleTarget({ product, calc, avail })}>
                <ShoppingCart size={13} /> Registrar venda
              </Button>
            </Card>
          ))}
        </div>
      )}

      <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", opacity: 0.6, margin: "0 0 10px" }}>Histórico de vendas</div>
      {loadingSales ? (
        <Spinner theme={theme} />
      ) : sales.length === 0 ? (
        <div style={{ textAlign: "center", padding: 30, color: theme.textMuted, fontSize: 13.5 }}>Nenhuma venda registrada ainda.</div>
      ) : (
        <Card theme={theme} style={{ padding: 0, overflow: "hidden" }}>
          {sales.map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: `1px solid ${theme.border}` }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{productsById[s.product_id]?.name || "(produto removido)"}</div>
                <div style={{ fontSize: 11.5, color: theme.textMuted }}>{new Date(s.sold_at).toLocaleDateString("pt-BR")} · {s.qty} un.{s.notes ? ` · ${s.notes}` : ""}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontWeight: 700 }}>{brl(s.total_price)}</div>
                <button onClick={() => setDeleteTarget(s)} style={iconBtn(theme)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {saleTarget && <SaleModal theme={theme} target={saleTarget} onClose={() => setSaleTarget(null)} onConfirm={handleSale} />}
      {deleteTarget && (
        <ConfirmModal
          theme={theme}
          message={`Remover essa venda de ${deleteTarget.qty}x ${productsById[deleteTarget.product_id]?.name || ""}? O produto volta pra lista de "prontos para vender".`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDeleteSale(deleteTarget)}
        />
      )}
    </div>
  );
}

function SaleModal({ theme, target, onClose, onConfirm }) {
  const { product, calc, avail } = target;
  const [qty, setQty] = useState(1);
  const [totalPrice, setTotalPrice] = useState(Math.round(calc.finalPrice * 100) / 100);
  const [notes, setNotes] = useState("");

  const setQtyClamped = (v) => {
    const n = Math.min(avail, Math.max(1, v || 1));
    setQty(n);
    setTotalPrice(Math.round(calc.finalPrice * n * 100) / 100);
  };

  return (
    <Modal theme={theme} title={`Registrar venda — ${product.name}`} onClose={onClose} width={380}>
      <Field label={`Quantidade (${avail} disponível)`}>
        <input type="number" min={1} max={avail} style={inputStyle(theme)} value={qty} onChange={(e) => setQtyClamped(parseInt(e.target.value))} />
      </Field>
      <Field label="Valor total cobrado" hint="Já vem sugerido pelo preço de venda calculado — edite se deu desconto ou negociou diferente">
        <input type="number" step="0.01" style={inputStyle(theme)} value={totalPrice} onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)} />
      </Field>
      <Field label="Observação (opcional)">
        <input style={inputStyle(theme)} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
        <Button theme={theme} variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button theme={theme} onClick={() => onConfirm(product, qty, totalPrice, notes)}><ShoppingCart size={14} /> Confirmar venda</Button>
      </div>
    </Modal>
  );
}
