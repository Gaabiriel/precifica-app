import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Factory, ArrowUpDown, Upload, X, Lock, Eye, Ruler } from "lucide-react";
import { Card, Button, Field, inputStyle, iconBtn, Modal, ConfirmModal, Carousel, Row, Pagination, Spinner, MaterialDetailModal } from "../components/ui.jsx";
import { brl, computeProductCost } from "../pricing.js";
import { supabase } from "../supabaseClient";
import { useCatalogData, saveProduct, deleteProduct, produceProduct } from "../data.js";

const MAX_IMAGES = 5;
const GRID_MIN_CARD = 270;
const GRID_GAP = 16;
const ROWS_PER_PAGE = 3;
const SORT_OPTIONS = [
  { value: "name", label: "Nome" },
  { value: "subtotal", label: "Custo" },
  { value: "finalPrice", label: "Preço de venda" },
  { value: "realMarginPercent", label: "Margem real" },
  { value: "produced_count", label: "Produzidos" },
];

export default function Products({ theme, ownerId, nicheId, showToast, maxProducts, autoOpenNew, onConsumeAutoOpen }) {
  const { materials, products, settings, loading, refreshing, reload } = useCatalogData();
  const [modal, setModal] = useState(null);
  const [produceModal, setProduceModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showLimitInfo, setShowLimitInfo] = useState(false);

  useEffect(() => {
    if (autoOpenNew) { setModal({}); onConsumeAutoOpen?.(); }
  }, [autoOpenNew]);
  const atLimit = maxProducts != null && products.length >= maxProducts;
  const simpleProducts = useMemo(() => products.filter((p) => !p.is_kit), [products]);
  const [q, setQ] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [columns, setColumns] = useState(4);
  const gridRef = useRef(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const compute = () => {
      const width = el.offsetWidth;
      const cols = Math.max(1, Math.floor((width + GRID_GAP) / (GRID_MIN_CARD + GRID_GAP)));
      setColumns(cols);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const PAGE_SIZE = columns * ROWS_PER_PAGE;

  const handleSave = async (p) => {
    const { error } = await saveProduct(ownerId, nicheId, p);
    if (error) { showToast("Erro ao salvar produto.", "err"); return; }
    showToast("Produto salvo.");
    setModal(null);
    reload();
  };
  const handleDelete = async (id) => {
    const { error } = await deleteProduct(id);
    setDeleteTarget(null);
    if (error) {
      showToast(error.code === "23503" ? "Este produto é usado em um kit. Remova-o do kit antes." : "Erro ao excluir.", "err");
      return;
    }
    showToast("Produto removido.");
    reload();
  };
  const handleProduce = async (product, qty) => {
    const { error } = await produceProduct({ ownerId, product, qty, materials, products, settings });
    setProduceModal(null);
    if (error) { showToast(error.message, "err"); return; }
    showToast(`Produção registrada: ${qty}x ${product.name}.`);
    reload();
  };

  const productCosts = useMemo(
    () => (settings ? simpleProducts.map((p) => ({ product: p, calc: computeProductCost(p, materials, products, settings) })) : []),
    [simpleProducts, materials, products, settings]
  );

  const filteredSorted = useMemo(() => {
    let list = productCosts.filter(({ product }) => product.name.toLowerCase().includes(q.toLowerCase()));
    const dir = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      const va = sortField === "name" ? a.product.name : sortField === "produced_count" ? (a.product.produced_count || 0) : a.calc[sortField];
      const vb = sortField === "name" ? b.product.name : sortField === "produced_count" ? (b.product.produced_count || 0) : b.calc[sortField];
      if (typeof va === "string") return va.localeCompare(vb) * dir;
      return ((va || 0) - (vb || 0)) * dir;
    });
    return list;
  }, [productCosts, q, sortField, sortDir]);

  useEffect(() => { setPage(1); }, [q, sortField, sortDir, PAGE_SIZE]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filteredSorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) return <div style={{ color: theme.textMuted, fontSize: 13.5 }}>Carregando produtos…</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: 1 }}>
          <input className="toolbar-field" placeholder="Buscar produto…" value={q} onChange={(e) => setQ(e.target.value)} style={{ ...inputStyle(theme), maxWidth: 220 }} />
          <div className="toolbar-field" style={{ display: "flex", gap: 8, maxWidth: 204 }}>
            <select value={sortField} onChange={(e) => setSortField(e.target.value)} style={{ ...inputStyle(theme), flex: 1 }}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>Ordenar: {o.label}</option>)}
            </select>
            <button onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))} style={{ ...iconBtn(theme), width: 34, height: 34 }} title={sortDir === "asc" ? "Crescente" : "Decrescente"}>
              <ArrowUpDown size={15} />
            </button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {refreshing && <Spinner theme={theme} />}
          <Button className="products-new-btn" theme={theme} onClick={() => (atLimit ? setShowLimitInfo(true) : setModal({}))}>
            {atLimit ? <Lock size={14} /> : <Plus size={15} />} Novo produto
          </Button>
        </div>
      </div>

      {filteredSorted.length > 0 && (
        <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 10 }}>
          Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredSorted.length)} de {filteredSorted.length} produtos
        </div>
      )}

      <div ref={gridRef} style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${GRID_MIN_CARD}px,1fr))`, gap: GRID_GAP }}>
        {paged.map(({ product, calc }) => (
          <Card key={product.id} theme={theme} style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ padding: 10, flexShrink: 0 }}>
              <Carousel theme={theme} images={product.image_urls} height={140} />
            </div>
            <div style={{ padding: "4px 14px 14px", display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>{product.name}</div>
              <div style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 10 }}>Produzido: {product.produced_count || 0} un.</div>
              {product.dimensions && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: theme.textMuted, marginBottom: 10, marginTop: -6 }}>
                  <Ruler size={12} /> {product.dimensions}
                </div>
              )}
              <Row theme={theme} label="Custo total" value={brl(calc.subtotal)} />
              <Row theme={theme} label="Preço de venda" value={brl(calc.finalPrice)} bold />
              <Row theme={theme} label="Lucro / margem real" value={`${brl(calc.profit)} · ${calc.realMarginPercent.toFixed(0)}%`} tone={theme.good} />
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "auto", paddingTop: 12 }}>
                <Button theme={theme} variant="soft" style={{ flex: 1, justifyContent: "center", height: 34 }} onClick={() => setProduceModal(product)}>
                  <Factory size={13} /> Produzir
                </Button>
                <button onClick={() => setModal(product)} style={iconBtn(theme)}><Pencil size={14} /></button>
                <button onClick={() => setDeleteTarget(product)} style={iconBtn(theme)}><Trash2 size={14} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {simpleProducts.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: theme.textMuted, fontSize: 13.5 }}>
          Nenhum produto ainda. Clique em "Novo produto" e monte a ficha técnica.
        </div>
      )}
      {simpleProducts.length > 0 && filteredSorted.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: theme.textMuted, fontSize: 13.5 }}>
          Nenhum produto encontrado com esses filtros.
        </div>
      )}

      <Pagination theme={theme} page={currentPage} totalPages={totalPages} onChange={setPage} />

      {modal && (
        <ProductModal theme={theme} product={modal} materials={materials} products={products} settings={settings}
          onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {produceModal && (
        <ProduceModal theme={theme} product={produceModal} onClose={() => setProduceModal(null)}
          onConfirm={handleProduce} />
      )}
      {deleteTarget && (
        <ConfirmModal
          theme={theme}
          message={`Tem certeza que quer excluir "${deleteTarget.name}"? Essa ação não pode ser desfeita.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget.id)}
        />
      )}
      {showLimitInfo && (
        <Modal theme={theme} title="Limite do plano atingido" onClose={() => setShowLimitInfo(false)} width={380}>
          <div style={{ fontSize: 13.5, color: theme.textMuted, lineHeight: 1.6, marginBottom: 18 }}>
            Seu plano atual permite até <strong style={{ color: theme.text }}>{maxProducts}</strong> produtos cadastrados.
            Para cadastrar mais, é preciso migrar para um plano com limite maior.
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button theme={theme} onClick={() => setShowLimitInfo(false)}>Entendi</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ProductModal({ theme, product, materials, products, settings, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "", image_urls: [], labor_minutes: 30, notes: "", dimensions: "", is_kit: false,
    bom: [], kitItems: [], margin_percent: settings.default_margin_percent, sale_price_override: null,
    ...product,
    is_kit: false,
  });
  const [uploading, setUploading] = useState(false);
  const [detailMaterial, setDetailMaterial] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const calc = useMemo(() => computeProductCost(form, materials, products, settings), [form, materials, products, settings]);

  const uploadImages = async (fileList) => {
    const files = Array.from(fileList || []).slice(0, MAX_IMAGES - (form.image_urls || []).length);
    if (!files.length) return;
    setUploading(true);
    const { data: userData } = await supabase.auth.getUser();
    const uploaded = [];
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `${userData.user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
    }
    set("image_urls", [...(form.image_urls || []), ...uploaded]);
    setUploading(false);
  };
  const removeImage = (idx) => set("image_urls", (form.image_urls || []).filter((_, i) => i !== idx));

  const addBomLine = () => materials.length && set("bom", [...(form.bom || []), { material_id: materials[0].id, qty: 1 }]);
  const updateBomLine = (idx, patch) => set("bom", form.bom.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  const removeBomLine = (idx) => set("bom", form.bom.filter((_, i) => i !== idx));

  return (
    <Modal theme={theme} title={product.id ? "Editar produto" : "Novo produto"} onClose={onClose} width={640}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: "2 1 200px" }}>
          <Field label="Nome do produto">
            <input style={inputStyle(theme)} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <Field label="Tempo de produção (min)">
            <input type="number" style={inputStyle(theme)} value={form.labor_minutes} onChange={(e) => set("labor_minutes", parseFloat(e.target.value) || 0)} />
          </Field>
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <Field label="Dimensões (opcional)" hint="Ex: 30x20x10 cm">
            <input style={inputStyle(theme)} value={form.dimensions || ""} onChange={(e) => set("dimensions", e.target.value)} />
          </Field>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 5, opacity: 0.75 }}>
          Fotos do produto ({(form.image_urls || []).length}/{MAX_IMAGES})
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(form.image_urls || []).map((url, idx) => (
            <div key={idx} style={{ position: "relative", width: 64, height: 64, borderRadius: 8, overflow: "hidden", border: `1px solid ${theme.border}` }}>
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <button onClick={() => removeImage(idx)} style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
                <X size={11} />
              </button>
            </div>
          ))}
          {(form.image_urls || []).length < MAX_IMAGES && (
            <label style={{ width: 64, height: 64, borderRadius: 8, border: `1.5px dashed ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: theme.textMuted, flexShrink: 0 }}>
              {uploading ? <span style={{ fontSize: 10 }}>...</span> : <Upload size={17} />}
              <input type="file" accept="image/*" multiple disabled={uploading} onChange={(e) => uploadImages(e.target.files)} style={{ display: "none" }} />
            </label>
          )}
        </div>
        <div style={{ fontSize: 11, opacity: 0.55, marginTop: 3 }}>A primeira foto aparece como capa na listagem.</div>
      </div>

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
            <button onClick={() => mat && setDetailMaterial(mat)} disabled={!mat} style={iconBtn(theme)} title="Ver detalhes do material"><Eye size={13} /></button>
            <button onClick={() => removeBomLine(idx)} style={iconBtn(theme)}><Trash2 size={13} /></button>
          </div>
        );
      })}
      <Button theme={theme} variant="ghost" onClick={addBomLine} style={{ marginBottom: 16 }}><Plus size={13} /> Adicionar material</Button>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 160px" }}>
          <Field label="Margem (%)" hint={`Padrão: ${settings.default_margin_percent}%`}>
            <input type="number" style={inputStyle(theme)} value={form.margin_percent ?? ""} onChange={(e) => set("margin_percent", e.target.value === "" ? null : parseFloat(e.target.value))} />
          </Field>
        </div>
        <div style={{ flex: "1 1 160px" }}>
          <Field label="Preço de venda manual (opcional)">
            <input type="number" step="0.01" style={inputStyle(theme)} value={form.sale_price_override ?? ""} onChange={(e) => set("sale_price_override", e.target.value === "" ? null : parseFloat(e.target.value))} />
          </Field>
        </div>
      </div>

      <Card theme={theme} style={{ padding: 14, background: theme.surfaceAlt, border: "none", marginTop: 4 }}>
        <Row theme={theme} label="Custo de materiais / componentes" value={brl(calc.materialsCost)}
          hint="Soma de cada material da ficha técnica: preço × quantidade usada, já com a % de perda de cada material." />
        <Row theme={theme} label="Mão de obra" value={brl(calc.laborCost)}
          hint="Tempo de produção (min) ÷ 60 × custo da hora de mão de obra (Configurações)." />
        <Row theme={theme} label="Manutenção de equipamento" value={brl(calc.maintenanceCost)}
          hint="% de manutenção (Configurações) sobre (materiais + mão de obra) — cobre desgaste, energia, insumos difíceis de detalhar item a item." />
        <Row theme={theme} label="Rateio de despesas fixas" value={brl(calc.fixedExpenseShare)}
          hint="Despesas fixas mensais ÷ produção mensal estimada (Configurações) — a fatia desse produto nas contas fixas do mês." />
        <div style={{ borderTop: `1px solid ${theme.border}`, margin: "6px 0" }} />
        <Row theme={theme} label="Custo total" value={brl(calc.subtotal)} bold
          hint="Materiais + mão de obra + manutenção + rateio de despesas fixas." />
        <Row theme={theme} label="Preço sugerido" value={brl(calc.finalPrice)} bold tone={theme.primary}
          hint="Custo total + margem (%) + taxa de cartão, arredondado pra terminar em ',90' se a opção estiver ligada em Configurações." />
        <Row theme={theme} label="Lucro líquido estimado" value={`${brl(calc.profit)} (${calc.realMarginPercent.toFixed(0)}%)`} tone={theme.good}
          hint="Preço final − custo total. O % pode ficar acima da margem configurada por causa da taxa de cartão e do arredondamento." />
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
        <Button theme={theme} variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button theme={theme} onClick={() => form.name.trim() && onSave(form)}>Salvar produto</Button>
      </div>

      {detailMaterial && <MaterialDetailModal theme={theme} material={detailMaterial} onClose={() => setDetailMaterial(null)} />}
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
