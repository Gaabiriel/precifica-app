import React, { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Factory, ImageOff, ArrowUpDown } from "lucide-react";
import { Card, Button, Field, inputStyle, iconBtn, Modal, Row, Pagination } from "../components/ui.jsx";
import { brl, computeProductCost } from "../pricing.js";

const PAGE_SIZE = 9;
const SORT_OPTIONS = [
  { value: "name", label: "Nome" },
  { value: "subtotal", label: "Custo" },
  { value: "finalPrice", label: "Preço de venda" },
  { value: "realMarginPercent", label: "Margem real" },
  { value: "produced_count", label: "Produzidos" },
];

export default function Products({ theme, products, materials, settings, onSave, onDelete, onProduce }) {
  const [modal, setModal] = useState(null);
  const [produceModal, setProduceModal] = useState(null);
  const [q, setQ] = useState("");
  const [kindFilter, setKindFilter] = useState(""); // "" | "kit" | "simples"
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const productCosts = useMemo(
    () => products.map((p) => ({ product: p, calc: computeProductCost(p, materials, products, settings) })),
    [products, materials, settings]
  );

  const filteredSorted = useMemo(() => {
    let list = productCosts.filter(({ product }) => product.name.toLowerCase().includes(q.toLowerCase()));
    if (kindFilter === "kit") list = list.filter(({ product }) => product.is_kit);
    if (kindFilter === "simples") list = list.filter(({ product }) => !product.is_kit);
    const dir = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      const va = sortField === "name" ? a.product.name : sortField === "produced_count" ? (a.product.produced_count || 0) : a.calc[sortField];
      const vb = sortField === "name" ? b.product.name : sortField === "produced_count" ? (b.product.produced_count || 0) : b.calc[sortField];
      if (typeof va === "string") return va.localeCompare(vb) * dir;
      return ((va || 0) - (vb || 0)) * dir;
    });
    return list;
  }, [productCosts, q, kindFilter, sortField, sortDir]);

  useEffect(() => { setPage(1); }, [q, kindFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filteredSorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: 1 }}>
          <input placeholder="Buscar produto…" value={q} onChange={(e) => setQ(e.target.value)} style={{ ...inputStyle(theme), maxWidth: 220 }} />
          <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value)} style={{ ...inputStyle(theme), maxWidth: 160 }}>
            <option value="">Todos os tipos</option>
            <option value="simples">Somente produtos</option>
            <option value="kit">Somente kits</option>
          </select>
          <select value={sortField} onChange={(e) => setSortField(e.target.value)} style={{ ...inputStyle(theme), maxWidth: 170 }}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>Ordenar: {o.label}</option>)}
          </select>
          <button onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))} style={{ ...iconBtn(theme), width: 34, height: 34 }} title={sortDir === "asc" ? "Crescente" : "Decrescente"}>
            <ArrowUpDown size={15} />
          </button>
        </div>
        <Button theme={theme} onClick={() => setModal({})}><Plus size={15} /> Novo produto</Button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px,1fr))", gap: 16 }}>
        {paged.map(({ product, calc }) => (
          <Card key={product.id} theme={theme} style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ height: 130, background: theme.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", color: theme.textMuted, backgroundImage: product.image_url ? `url(${product.image_url})` : "none", backgroundSize: "cover", backgroundPosition: "center" }}>
              {!product.image_url && <ImageOff size={26} />}
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 15.5 }}>{product.name}</div>
                {product.is_kit && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: theme.primarySoft, color: theme.primary, padding: "2px 7px", borderRadius: 20 }}>KIT</span>
                )}
              </div>
              <div style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 10 }}>Produzido: {product.produced_count || 0} un.</div>
              <Row theme={theme} label="Custo total" value={brl(calc.subtotal)} />
              <Row theme={theme} label="Preço de venda" value={brl(calc.finalPrice)} bold />
              <Row theme={theme} label="Lucro / margem real" value={`${brl(calc.profit)} · ${calc.realMarginPercent.toFixed(0)}%`} tone={theme.good} />
              <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                {!product.is_kit && (
                  <Button theme={theme} variant="soft" style={{ flex: 1, justifyContent: "center" }} onClick={() => setProduceModal(product)}>
                    <Factory size={13} /> Produzir
                  </Button>
                )}
                <button onClick={() => setModal(product)} style={iconBtn(theme)}><Pencil size={14} /></button>
                <button onClick={() => onDelete(product.id)} style={iconBtn(theme)}><Trash2 size={14} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {products.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: theme.textMuted, fontSize: 13.5 }}>
          Nenhum produto ainda. Clique em "Novo produto" e monte a ficha técnica.
        </div>
      )}
      {products.length > 0 && filteredSorted.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: theme.textMuted, fontSize: 13.5 }}>
          Nenhum produto encontrado com esses filtros.
        </div>
      )}

      <Pagination theme={theme} page={currentPage} totalPages={totalPages} onChange={setPage} />

      {modal && (
        <ProductModal theme={theme} product={modal} materials={materials} products={products} settings={settings}
          onClose={() => setModal(null)} onSave={(p) => { onSave(p); setModal(null); }} />
      )}
      {produceModal && (
        <ProduceModal theme={theme} product={produceModal} onClose={() => setProduceModal(null)}
          onConfirm={(p, qty) => { onProduce(p, qty); setProduceModal(null); }} />
      )}
    </div>
  );
}

function ProductModal({ theme, product, materials, products, settings, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "", image_url: "", labor_minutes: 30, notes: "", is_kit: false,
    bom: [], kitItems: [], margin_percent: settings.default_margin_percent, sale_price_override: null,
    ...product,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const calc = useMemo(() => computeProductCost(form, materials, products, settings), [form, materials, products, settings]);

  const addBomLine = () => materials.length && set("bom", [...(form.bom || []), { material_id: materials[0].id, qty: 1 }]);
  const updateBomLine = (idx, patch) => set("bom", form.bom.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  const removeBomLine = (idx) => set("bom", form.bom.filter((_, i) => i !== idx));

  const otherProducts = products.filter((p) => p.id !== product.id && !p.is_kit);
  const addKitLine = () => otherProducts.length && set("kitItems", [...(form.kitItems || []), { item_product_id: otherProducts[0].id, qty: 1 }]);
  const updateKitLine = (idx, patch) => set("kitItems", form.kitItems.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  const removeKitLine = (idx) => set("kitItems", form.kitItems.filter((_, i) => i !== idx));

  return (
    <Modal theme={theme} title={product.id ? "Editar produto" : "Novo produto"} onClose={onClose} width={640}>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 2 }}>
          <Field label="Nome do produto">
            <input style={inputStyle(theme)} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Tempo de produção (min)">
            <input type="number" style={inputStyle(theme)} value={form.labor_minutes} onChange={(e) => set("labor_minutes", parseFloat(e.target.value) || 0)} />
          </Field>
        </div>
      </div>
      <Field label="URL da imagem (opcional)">
        <input style={inputStyle(theme)} value={form.image_url || ""} onChange={(e) => set("image_url", e.target.value)} placeholder="https://…" />
      </Field>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, marginBottom: 14, cursor: "pointer" }}>
        <input type="checkbox" checked={!!form.is_kit} onChange={(e) => set("is_kit", e.target.checked)} />
        Este produto é um kit (composto por outros produtos)
      </label>

      {!form.is_kit ? (
        <>
          <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", opacity: 0.6, margin: "0 0 8px" }}>Ficha técnica (materiais usados)</div>
          {(form.bom || []).map((line, idx) => {
            const mat = materials.find((m) => m.id === line.material_id);
            return (
              <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
                <select style={{ ...inputStyle(theme), flex: 2 }} value={line.material_id} onChange={(e) => updateBomLine(idx, { material_id: e.target.value })}>
                  {materials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <input type="number" step="0.01" style={{ ...inputStyle(theme), flex: 1 }} value={line.qty} onChange={(e) => updateBomLine(idx, { qty: parseFloat(e.target.value) || 0 })} />
                <span style={{ fontSize: 12, color: theme.textMuted, width: 30 }}>{mat?.unit}</span>
                <span style={{ fontSize: 12.5, width: 66, textAlign: "right" }}>{brl((mat?.price || 0) * line.qty * (1 + (mat?.waste_percent || 0) / 100))}</span>
                <button onClick={() => removeBomLine(idx)} style={iconBtn(theme)}><Trash2 size={13} /></button>
              </div>
            );
          })}
          <Button theme={theme} variant="ghost" onClick={addBomLine} style={{ marginBottom: 16 }}><Plus size={13} /> Adicionar material</Button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", opacity: 0.6, margin: "0 0 8px" }}>Produtos que compõem o kit</div>
          {(form.kitItems || []).map((line, idx) => (
            <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
              <select style={{ ...inputStyle(theme), flex: 2 }} value={line.item_product_id} onChange={(e) => updateKitLine(idx, { item_product_id: e.target.value })}>
                {otherProducts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="number" style={{ ...inputStyle(theme), flex: 1 }} value={line.qty} onChange={(e) => updateKitLine(idx, { qty: parseFloat(e.target.value) || 0 })} />
              <button onClick={() => removeKitLine(idx)} style={iconBtn(theme)}><Trash2 size={13} /></button>
            </div>
          ))}
          <Button theme={theme} variant="ghost" onClick={addKitLine} style={{ marginBottom: 16 }}><Plus size={13} /> Adicionar produto ao kit</Button>
        </>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Field label="Margem (%)" hint={`Padrão: ${settings.default_margin_percent}%`}>
            <input type="number" style={inputStyle(theme)} value={form.margin_percent ?? ""} onChange={(e) => set("margin_percent", e.target.value === "" ? null : parseFloat(e.target.value))} />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Preço de venda manual (opcional)">
            <input type="number" step="0.01" style={inputStyle(theme)} value={form.sale_price_override ?? ""} onChange={(e) => set("sale_price_override", e.target.value === "" ? null : parseFloat(e.target.value))} />
          </Field>
        </div>
      </div>

      <Card theme={theme} style={{ padding: 14, background: theme.surfaceAlt, border: "none", marginTop: 4 }}>
        <Row theme={theme} label="Custo de materiais / componentes" value={brl(calc.materialsCost)} />
        <Row theme={theme} label="Mão de obra" value={brl(calc.laborCost)} />
        <Row theme={theme} label="Manutenção de equipamento" value={brl(calc.maintenanceCost)} />
        <Row theme={theme} label="Rateio de despesas fixas" value={brl(calc.fixedExpenseShare)} />
        <div style={{ borderTop: `1px solid ${theme.border}`, margin: "6px 0" }} />
        <Row theme={theme} label="Custo total" value={brl(calc.subtotal)} bold />
        <Row theme={theme} label="Preço sugerido" value={brl(calc.finalPrice)} bold tone={theme.primary} />
        <Row theme={theme} label="Lucro líquido estimado" value={`${brl(calc.profit)} (${calc.realMarginPercent.toFixed(0)}%)`} tone={theme.good} />
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
        <Button theme={theme} variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button theme={theme} onClick={() => form.name.trim() && onSave(form)}>Salvar produto</Button>
      </div>
    </Modal>
  );
}

function ProduceModal({ theme, product, onClose, onConfirm }) {
  const [qty, setQty] = useState(1);
  return (
    <Modal theme={theme} title={`Registrar produção — ${product.name}`} onClose={onClose} width={360}>
      <Field label="Quantidade produzida" hint="O estoque de materiais será descontado automaticamente">
        <input type="number" min={1} style={inputStyle(theme)} value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 1)} />
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
        <Button theme={theme} variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button theme={theme} onClick={() => onConfirm(product, qty)}><Factory size={14} /> Confirmar</Button>
      </div>
    </Modal>
  );
}
