import React, { useMemo, useState } from "react";
import { ShoppingCart, MinusCircle, ArrowUpDown, Eye } from "lucide-react";
import { Card, Button, Field, inputStyle, iconBtn, Modal, Row, Spinner, Carousel, ViewToggle, useViewMode, DataTable, Thumb } from "../components/ui.jsx";
import ProductDetailModal from "../components/ProductDetailModal.jsx";
import { brl, computeProductCost } from "../pricing.js";
import { useCatalogData, registerSale, removeFromStock, productLabel } from "../data.js";

const SORT_OPTIONS = [
  { value: "created_at", label: "Mais recentes" },
  { value: "name", label: "Nome" },
  { value: "avail", label: "Quantidade em estoque" },
  { value: "price", label: "Preço sugerido" },
];

export default function Sales({ theme, ownerId, showToast }) {
  const { materials, products, settings, loading, reload } = useCatalogData();
  const [saleTarget, setSaleTarget] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");
  const [view, setView] = useViewMode("vendas");

  const stock = useMemo(() => {
    if (!settings) return [];
    const needle = q.toLowerCase();
    const dir = sortDir === "asc" ? 1 : -1;
    const value = (r) => {
      if (sortField === "name") return productLabel(r.product);
      if (sortField === "avail") return r.avail;
      if (sortField === "price") return r.calc.finalPrice;
      return new Date(r.product.created_at).getTime();
    };
    return products
      .filter((p) => kind === "all" || (kind === "kit" ? p.is_kit : !p.is_kit))
      .filter((p) => [productLabel(p), p.main_material].some((v) => (v || "").toLowerCase().includes(needle)))
      .map((p) => ({ product: p, calc: computeProductCost(p, materials, products, settings), avail: p.stock_qty || 0 }))
      .filter((r) => r.avail > 0)
      .sort((a, b) => {
        const va = value(a), vb = value(b);
        return (typeof va === "string" ? va.localeCompare(vb) : va - vb) * dir;
      });
  }, [products, materials, settings, q, kind, sortField, sortDir]);

  const handleSale = async (product, qty, totalPrice, notes) => {
    const { error } = await registerSale({ ownerId, product, qty, totalPrice, notes });
    setSaleTarget(null);
    if (error) { showToast(error.message, "err"); return; }
    showToast("Venda registrada.");
    reload();
  };

  const handleRemove = async (product, qty, notes) => {
    const { error } = await removeFromStock({ ownerId, product, qty, notes });
    setRemoveTarget(null);
    if (error) { showToast(error.message, "err"); return; }
    showToast("Removido do estoque.");
    reload();
  };

  if (loading) return <Spinner theme={theme} />;

  const smallBtn = { ...iconBtn(theme), width: 30, height: 30, borderRadius: 7 };
  const removeTitle = "Remover do estoque (sem venda) — defeito, perda, brinde…";

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
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
        <div className="toolbar-field" style={{ display: "flex", gap: 8, maxWidth: 320, flex: "1 1 280px" }}>
          <select value={sortField} onChange={(e) => setSortField(e.target.value)} style={{ ...inputStyle(theme), flex: 1 }}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>Ordenar: {o.label}</option>)}
          </select>
          <button onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))} style={{ ...iconBtn(theme), width: 34, height: 34 }} title={sortDir === "asc" ? "Crescente" : "Decrescente"}>
            <ArrowUpDown size={15} />
          </button>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <ViewToggle theme={theme} value={view} onChange={setView} />
        </div>
      </div>

      <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", opacity: 0.6, margin: "0 0 12px" }}>Estoque pronto para vender</div>
      {stock.length === 0 ? (
        <div style={{ textAlign: "center", padding: 30, color: theme.textMuted, fontSize: 13.5 }}>
          {q || kind !== "all" ? "Nenhum produto em estoque encontrado com esses filtros." : "Nada em estoque pra vender. Informe a quantidade em estoque no cadastro do produto ou kit."}
        </div>
      ) : view === "table" ? (
        <DataTable
          theme={theme}
          rows={stock}
          rowKey={(r) => r.product.id}
          minWidth={680}
          columns={[
            { label: "", width: "44px", render: ({ product }) => <Thumb theme={theme} images={product.image_urls} /> },
            { label: "Produto", width: "2fr", render: ({ product }) => <span style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{productLabel(product)}</span> },
            { label: "Tipo", width: "70px", render: ({ product }) => <span style={{ color: theme.textMuted }}>{product.is_kit ? "Kit" : "Produto"}</span> },
            { label: "Em estoque", width: "90px", align: "right", render: ({ avail }) => <strong style={{ color: theme.good }}>{avail}</strong> },
            { label: "Preço sugerido", width: "120px", align: "right", render: ({ calc }) => brl(calc.finalPrice) },
            {
              label: "Ações", width: "190px", align: "right", render: (r) => (
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => setViewTarget(r.product)} style={smallBtn} title="Ver produto"><Eye size={13} /></button>
                  <Button theme={theme} variant="soft" style={{ height: 30, padding: "0 10px", fontSize: 12.5 }} onClick={() => setSaleTarget(r)}>
                    <ShoppingCart size={12} /> Vender
                  </Button>
                  <button onClick={() => setRemoveTarget(r)} style={smallBtn} title={removeTitle}><MinusCircle size={13} /></button>
                </div>
              ),
            },
          ]}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px,1fr))", gap: 14 }}>
          {stock.map((r) => (
            <Card key={r.product.id} theme={theme} style={{ padding: 10, display: "flex", flexDirection: "column" }}>
              <Carousel theme={theme} images={r.product.image_urls} height={130} />
              <div style={{ padding: "10px 6px 6px", display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>{productLabel(r.product)}</div>
                <Row theme={theme} label="Em estoque" value={`${r.avail} un.`} bold tone={theme.good} />
                <Row theme={theme} label="Preço sugerido" value={brl(r.calc.finalPrice)} />
                <div style={{ display: "flex", gap: 6, marginTop: "auto", paddingTop: 12 }}>
                  <Button theme={theme} variant="soft" style={{ flex: 1, justifyContent: "center", height: 32, fontSize: 12.5 }} onClick={() => setSaleTarget(r)}>
                    <ShoppingCart size={12} /> Vender
                  </Button>
                  <button title="Ver produto" onClick={() => setViewTarget(r.product)} style={iconBtn(theme)}><Eye size={14} /></button>
                  <button title={removeTitle} onClick={() => setRemoveTarget(r)} style={iconBtn(theme)}><MinusCircle size={14} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {saleTarget && <SaleModal theme={theme} target={saleTarget} onClose={() => setSaleTarget(null)} onConfirm={handleSale} />}
      {removeTarget && <RemoveModal theme={theme} target={removeTarget} onClose={() => setRemoveTarget(null)} onConfirm={handleRemove} />}
      {viewTarget && (
        <ProductDetailModal theme={theme} product={viewTarget} materials={materials} products={products} settings={settings} onClose={() => setViewTarget(null)} />
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
