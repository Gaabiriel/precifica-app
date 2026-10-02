import React, { useEffect, useMemo, useState } from "react";
import { ShoppingCart, MinusCircle, Trash2, ImageOff, ArrowUpDown } from "lucide-react";
import { Card, Button, Field, inputStyle, iconBtn, Modal, ConfirmModal, Row, Spinner, Carousel, Lightbox } from "../components/ui.jsx";
import { brl, computeProductCost } from "../pricing.js";
import { useCatalogData, registerSale, removeFromStock, deleteSale, fetchSales, productLabel } from "../data.js";

const SORT_OPTIONS = [
  { value: "created_at", label: "Mais recentes" },
  { value: "name", label: "Nome" },
  { value: "avail", label: "Quantidade em estoque" },
  { value: "price", label: "Preço sugerido" },
];

export default function Sales({ theme, ownerId, showToast }) {
  const { materials, products, settings, loading, reload } = useCatalogData();
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [saleTarget, setSaleTarget] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [historyType, setHistoryType] = useState("all");

  const loadSales = async () => {
    setLoadingSales(true);
    setSales(await fetchSales());
    setLoadingSales(false);
  };
  useEffect(() => { loadSales(); }, []);

  const productsById = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);

  const matches = (p) => {
    const needle = q.toLowerCase();
    return [productLabel(p), p?.main_material].some((v) => (v || "").toLowerCase().includes(needle));
  };

  const stock = useMemo(() => {
    if (!settings) return [];
    const dir = sortDir === "asc" ? 1 : -1;
    const value = (r) => {
      if (sortField === "name") return productLabel(r.product);
      if (sortField === "avail") return r.avail;
      if (sortField === "price") return r.calc.finalPrice;
      return new Date(r.product.created_at).getTime();
    };
    return products
      .filter((p) => kind === "all" || (kind === "kit" ? p.is_kit : !p.is_kit))
      .map((p) => ({ product: p, calc: computeProductCost(p, materials, products, settings), avail: p.stock_qty || 0 }))
      .filter((r) => r.avail > 0 && matches(r.product))
      .sort((a, b) => {
        const va = value(a), vb = value(b);
        return (typeof va === "string" ? va.localeCompare(vb) : va - vb) * dir;
      });
  }, [products, materials, settings, q, kind, sortField, sortDir]);

  const filteredSales = useMemo(
    () => sales.filter((s) => (historyType === "all" || s.type === historyType) && matches(productsById[s.product_id])),
    [sales, productsById, q, historyType]
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
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <input
          className="toolbar-field"
          placeholder="Buscar por produto, cor ou material…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ ...inputStyle(theme), maxWidth: 260 }}
        />
        <select className="toolbar-field" value={kind} onChange={(e) => setKind(e.target.value)} style={{ ...inputStyle(theme), maxWidth: 170 }}>
          <option value="all">Produtos e kits</option>
          <option value="product">Só produtos</option>
          <option value="kit">Só kits</option>
        </select>
        <div className="toolbar-field" style={{ display: "flex", gap: 8, maxWidth: 260 }}>
          <select value={sortField} onChange={(e) => setSortField(e.target.value)} style={{ ...inputStyle(theme), flex: 1 }}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>Ordenar: {o.label}</option>)}
          </select>
          <button onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))} style={{ ...iconBtn(theme), width: 34, height: 34 }} title={sortDir === "asc" ? "Crescente" : "Decrescente"}>
            <ArrowUpDown size={15} />
          </button>
        </div>
      </div>

      <SectionHeader theme={theme}>Estoque pronto para vender</SectionHeader>
      {stock.length === 0 ? (
        <EmptyState theme={theme}>
          {q ? "Nenhum produto pronto encontrado com essa busca." : "Nada em estoque pra vender. Informe a quantidade em estoque no cadastro do produto ou kit."}
        </EmptyState>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px,1fr))", gap: 14 }}>
          {stock.map(({ product, calc, avail }) => (
            <Card key={product.id} theme={theme} style={{ padding: 10, display: "flex", flexDirection: "column" }}>
              <Carousel theme={theme} images={product.image_urls} height={130} />
              <div style={{ padding: "10px 6px 6px", display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>{productLabel(product)}</div>
              <Row theme={theme} label="Em estoque" value={`${avail} un.`} bold tone={theme.good} />
              <Row theme={theme} label="Preço sugerido" value={brl(calc.finalPrice)} />
              <div style={{ display: "flex", gap: 6, marginTop: "auto", paddingTop: 12 }}>
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
              </div>
            </Card>
          ))}
        </div>
      )}

      <div style={{ height: 1, background: theme.border, margin: "28px 0" }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", opacity: 0.6 }}>Histórico</div>
        <select value={historyType} onChange={(e) => setHistoryType(e.target.value)} style={{ ...inputStyle(theme), maxWidth: 190 }}>
          <option value="all">Vendas e remoções</option>
          <option value="venda">Só vendas</option>
          <option value="remocao">Só remoções</option>
        </select>
      </div>
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
                <Thumb theme={theme} images={productsById[s.product_id]?.image_urls} />
                <TypeBadge theme={theme} type={s.type} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {productLabel(productsById[s.product_id]) || "(produto removido)"}
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
          message={`Desfazer ${deleteTarget.type === "remocao" ? "essa remoção" : "essa venda"} de ${deleteTarget.qty}x ${productLabel(productsById[deleteTarget.product_id])}? A unidade volta pro estoque pronto.`}
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

function Thumb({ theme, images }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const list = images || [];
  return (
    <div style={{ width: 40, height: 40, borderRadius: 6, overflow: "hidden", background: theme.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {list[0] ? (
        <img src={list[0]} alt="" onClick={() => { setIdx(0); setOpen(true); }} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in" }} />
      ) : (
        <ImageOff size={16} color={theme.textMuted} />
      )}
      {open && <Lightbox images={list} index={idx} onChangeIndex={setIdx} onClose={() => setOpen(false)} />}
    </div>
  );
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
    <Modal theme={theme} title={`Registrar venda — ${productLabel(product)}`} onClose={onClose} width={380}>
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
    <Modal theme={theme} title={`Remover do estoque — ${productLabel(product)}`} onClose={onClose} width={380}>
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
