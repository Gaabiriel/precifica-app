import React, { useEffect, useMemo, useState } from "react";
import { ShoppingCart, MinusCircle, Trash2 } from "lucide-react";
import { Card, Button, Field, inputStyle, iconBtn, Modal, ConfirmModal, Row, Spinner } from "../components/ui.jsx";
import { brl, computeProductCost } from "../pricing.js";
import { useCatalogData, registerSale, removeFromStock, deleteSale, fetchSales } from "../data.js";

export default function Sales({ theme, ownerId, showToast }) {
  const { materials, products, settings, loading, reload } = useCatalogData();
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [saleTarget, setSaleTarget] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [q, setQ] = useState("");

  const loadSales = async () => {
    setLoadingSales(true);
    setSales(await fetchSales());
    setLoadingSales(false);
  };
  useEffect(() => { loadSales(); }, []);

  const productsById = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);

  const stock = useMemo(() => {
    if (!settings) return [];
    return products
      .map((p) => ({ product: p, calc: computeProductCost(p, materials, products, settings), avail: (p.produced_count || 0) - (p.sold_count || 0) }))
      .filter((r) => r.avail > 0 && r.product.name.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.product.name.localeCompare(b.product.name));
  }, [products, materials, settings, q]);

  const filteredSales = useMemo(
    () => sales.filter((s) => (productsById[s.product_id]?.name || "").toLowerCase().includes(q.toLowerCase())),
    [sales, productsById, q]
  );

  const handleSale = async (product, qty, totalPrice, notes) => {
    const { error } = await registerSale({ ownerId, product, qty, totalPrice, notes });
    setSaleTarget(null);
    if (error) { showToast(error.message, "err"); return; }
    showToast("Venda registrada.");
    reload();
    loadSales();
  };

  const handleRemove = async (product, qty, notes) => {
    const { error } = await removeFromStock({ ownerId, product, qty, notes });
    setRemoveTarget(null);
    if (error) { showToast(error.message, "err"); return; }
    showToast("Removido do estoque.");
    reload();
    loadSales();
  };

  const handleDeleteSale = async (sale) => {
    const { error } = await deleteSale(sale, productsById[sale.product_id]);
    setDeleteTarget(null);
    if (error) { showToast("Erro ao excluir.", "err"); return; }
    showToast(sale.type === "remocao" ? "Remoção desfeita." : "Venda removida.");
    reload();
    loadSales();
  };

  if (loading) return <Spinner theme={theme} />;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Buscar por produto…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ ...inputStyle(theme), maxWidth: 260 }}
        />
      </div>

      <SectionHeader theme={theme}>Estoque pronto para vender</SectionHeader>
      {stock.length === 0 ? (
        <EmptyState theme={theme}>
          {q ? "Nenhum produto pronto encontrado com essa busca." : "Nada pronto pra vender ainda. Produza um produto ou kit primeiro."}
        </EmptyState>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px,1fr))", gap: 14 }}>
          {stock.map(({ product, calc, avail }) => (
            <Card key={product.id} theme={theme} style={{ padding: 16, display: "flex", flexDirection: "column" }}>
              <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>{product.name}</div>
              <Row theme={theme} label="Em estoque" value={`${avail} un.`} bold tone={theme.good} />
              <Row theme={theme} label="Preço sugerido" value={brl(calc.finalPrice)} />
              <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                <Button theme={theme} variant="soft" style={{ flex: 1, justifyContent: "center", height: 32, fontSize: 12.5 }} onClick={() => setSaleTarget({ product, calc, avail })}>
                  <ShoppingCart size={12} /> Vender
                </Button>
                <button
                  title="Remover do estoque (sem venda) — defeito, perda, brinde…"
                  onClick={() => setRemoveTarget({ product, avail })}
                  style={iconBtn(theme)}
                >
                  <MinusCircle size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div style={{ height: 1, background: theme.border, margin: "28px 0" }} />

      <SectionHeader theme={theme}>Histórico</SectionHeader>
      {loadingSales ? (
        <Spinner theme={theme} />
      ) : filteredSales.length === 0 ? (
        <EmptyState theme={theme}>{q ? "Nenhum registro encontrado com essa busca." : "Nenhuma venda ou remoção registrada ainda."}</EmptyState>
      ) : (
        <Card theme={theme} style={{ padding: 0, overflow: "hidden" }}>
          {filteredSales.map((s, idx) => (
            <div
              key={s.id}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", gap: 10,
                borderBottom: idx < filteredSales.length - 1 ? `1px solid ${theme.border}` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <TypeBadge theme={theme} type={s.type} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {productsById[s.product_id]?.name || "(produto removido)"}
                  </div>
                  <div style={{ fontSize: 11.5, color: theme.textMuted }}>
                    {new Date(s.sold_at).toLocaleDateString("pt-BR")} · {s.qty} un.{s.notes ? ` · ${s.notes}` : ""}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{ fontWeight: 700 }}>{s.type === "remocao" ? "—" : brl(s.total_price)}</div>
                <button onClick={() => setDeleteTarget(s)} style={iconBtn(theme)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {saleTarget && <SaleModal theme={theme} target={saleTarget} onClose={() => setSaleTarget(null)} onConfirm={handleSale} />}
      {removeTarget && <RemoveModal theme={theme} target={removeTarget} onClose={() => setRemoveTarget(null)} onConfirm={handleRemove} />}
      {deleteTarget && (
        <ConfirmModal
          theme={theme}
          message={`Desfazer ${deleteTarget.type === "remocao" ? "essa remoção" : "essa venda"} de ${deleteTarget.qty}x ${productsById[deleteTarget.product_id]?.name || ""}? A unidade volta pro estoque pronto.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDeleteSale(deleteTarget)}
        />
      )}
    </div>
  );
}

function SectionHeader({ theme, children }) {
  return <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", opacity: 0.6, margin: "0 0 12px" }}>{children}</div>;
}

function EmptyState({ theme, children }) {
  return <div style={{ textAlign: "center", padding: 30, color: theme.textMuted, fontSize: 13.5, marginBottom: 10 }}>{children}</div>;
}

function TypeBadge({ theme, type }) {
  const isRemoval = type === "remocao";
  return (
    <span
      style={{
        fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 5, flexShrink: 0,
        background: isRemoval ? theme.surfaceAlt : `${theme.good}1A`,
        color: isRemoval ? theme.textMuted : theme.good,
      }}
    >
      {isRemoval ? "REMOVIDO" : "VENDA"}
    </span>
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

function RemoveModal({ theme, target, onClose, onConfirm }) {
  const { product, avail } = target;
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");

  return (
    <Modal theme={theme} title={`Remover do estoque — ${product.name}`} onClose={onClose} width={380}>
      <div style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 14, lineHeight: 1.5 }}>
        Use isso pra tirar unidades do estoque de prontos sem registrar uma venda — ex.: peça com defeito, perdida, ou dada de brinde.
      </div>
      <Field label={`Quantidade (${avail} disponível)`}>
        <input type="number" min={1} max={avail} style={inputStyle(theme)} value={qty} onChange={(e) => setQty(Math.min(avail, Math.max(1, parseInt(e.target.value) || 1)))} />
      </Field>
      <Field label="Motivo (opcional)">
        <input style={inputStyle(theme)} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: defeito de costura" />
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
        <Button theme={theme} variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button theme={theme} onClick={() => onConfirm(product, qty, notes)}><MinusCircle size={14} /> Confirmar remoção</Button>
      </div>
    </Modal>
  );
}
