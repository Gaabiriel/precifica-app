import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, ArrowUpDown, Upload, X, Lock } from "lucide-react";
import { Card, Button, Field, inputStyle, iconBtn, Modal, ConfirmModal, Carousel, Row, Pagination } from "../components/ui.jsx";
import { brl, computeProductCost } from "../pricing.js";
import { supabase } from "../supabaseClient";

const MAX_IMAGES = 5;
const GRID_MIN_CARD = 270;
const GRID_GAP = 16;
const ROWS_PER_PAGE = 3;
const SORT_OPTIONS = [
  { value: "name", label: "Nome" },
  { value: "subtotal", label: "Custo" },
  { value: "finalPrice", label: "Preço de venda" },
  { value: "realMarginPercent", label: "Margem real" },
];

export default function Kits({ theme, products, materials, settings, onSave, onDelete, maxProducts }) {
  const kits = useMemo(() => products.filter((p) => p.is_kit), [products]);

  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showLimitInfo, setShowLimitInfo] = useState(false);
  const atLimit = maxProducts != null && products.length >= maxProducts;
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

  const kitCosts = useMemo(
    () => kits.map((p) => ({ product: p, calc: computeProductCost(p, materials, products, settings) })),
    [kits, materials, products, settings]
  );

  const filteredSorted = useMemo(() => {
    let list = kitCosts.filter(({ product }) => product.name.toLowerCase().includes(q.toLowerCase()));
    const dir = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      const va = sortField === "name" ? a.product.name : a.calc[sortField];
      const vb = sortField === "name" ? b.product.name : b.calc[sortField];
      if (typeof va === "string") return va.localeCompare(vb) * dir;
      return ((va || 0) - (vb || 0)) * dir;
    });
    return list;
  }, [kitCosts, q, sortField, sortDir]);

  useEffect(() => { setPage(1); }, [q, sortField, sortDir, PAGE_SIZE]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filteredSorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <div style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 16, lineHeight: 1.5, maxWidth: 640 }}>
        Um kit reúne produtos que você já cadastrou (ex.: "Kit Viagem" = Necessaire + Bolsa de Praia).
        O preço soma o custo desses produtos — não o preço de venda deles — pra não cobrar margem duas vezes.
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: 1 }}>
          <input className="toolbar-field" placeholder="Buscar kit…" value={q} onChange={(e) => setQ(e.target.value)} style={{ ...inputStyle(theme), maxWidth: 220 }} />
          <div className="toolbar-field" style={{ display: "flex", gap: 8, maxWidth: 204 }}>
            <select value={sortField} onChange={(e) => setSortField(e.target.value)} style={{ ...inputStyle(theme), flex: 1 }}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>Ordenar: {o.label}</option>)}
            </select>
            <button onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))} style={{ ...iconBtn(theme), width: 34, height: 34 }} title={sortDir === "asc" ? "Crescente" : "Decrescente"}>
              <ArrowUpDown size={15} />
            </button>
          </div>
        </div>
        <Button className="products-new-btn" theme={theme} onClick={() => (atLimit ? setShowLimitInfo(true) : setModal({}))}>
          {atLimit ? <Lock size={14} /> : <Plus size={15} />} Novo kit
        </Button>
      </div>

      {filteredSorted.length > 0 && (
        <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 10 }}>
          Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredSorted.length)} de {filteredSorted.length} kits
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
              <div style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 10 }}>
                {(product.kitItems || []).length} {(product.kitItems || []).length === 1 ? "produto" : "produtos"} no kit
              </div>
              <Row theme={theme} label="Custo total" value={brl(calc.subtotal)} />
              <Row theme={theme} label="Preço de venda" value={brl(calc.finalPrice)} bold />
              <Row theme={theme} label="Lucro / margem real" value={`${brl(calc.profit)} · ${calc.realMarginPercent.toFixed(0)}%`} tone={theme.good} />
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "auto", paddingTop: 12 }}>
                <Button theme={theme} variant="ghost" style={{ flex: 1, justifyContent: "center", height: 34 }} onClick={() => setModal(product)}>
                  <Pencil size={13} /> Editar
                </Button>
                <button onClick={() => setDeleteTarget(product)} style={iconBtn(theme)}><Trash2 size={14} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {kits.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: theme.textMuted, fontSize: 13.5 }}>
          Nenhum kit ainda. Clique em "Novo kit" pra combinar produtos que você já cadastrou.
        </div>
      )}
      {kits.length > 0 && filteredSorted.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: theme.textMuted, fontSize: 13.5 }}>
          Nenhum kit encontrado com essa busca.
        </div>
      )}

      <Pagination theme={theme} page={currentPage} totalPages={totalPages} onChange={setPage} />

      {modal && (
        <KitModal theme={theme} kit={modal} materials={materials} products={products} settings={settings}
          onClose={() => setModal(null)} onSave={(k) => { onSave(k); setModal(null); }} />
      )}
      {deleteTarget && (
        <ConfirmModal
          theme={theme}
          message={`Tem certeza que quer excluir o kit "${deleteTarget.name}"? Essa ação não pode ser desfeita.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { onDelete(deleteTarget.id); setDeleteTarget(null); }}
        />
      )}
      {showLimitInfo && (
        <Modal theme={theme} title="Limite do plano atingido" onClose={() => setShowLimitInfo(false)} width={380}>
          <div style={{ fontSize: 13.5, color: theme.textMuted, lineHeight: 1.6, marginBottom: 18 }}>
            Seu plano atual permite até <strong style={{ color: theme.text }}>{maxProducts}</strong> produtos cadastrados (produtos e kits juntos).
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

function KitModal({ theme, kit, materials, products, settings, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "", image_urls: [], labor_minutes: 0, is_kit: true,
    bom: [], kitItems: [], margin_percent: settings.default_margin_percent, sale_price_override: null,
    ...kit,
    is_kit: true,
  });
  const [uploading, setUploading] = useState(false);
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

  const otherProducts = products.filter((p) => p.id !== kit.id && !p.is_kit);
  const addKitLine = () => otherProducts.length && set("kitItems", [...(form.kitItems || []), { item_product_id: otherProducts[0].id, qty: 1 }]);
  const updateKitLine = (idx, patch) => set("kitItems", form.kitItems.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  const removeKitLine = (idx) => set("kitItems", form.kitItems.filter((_, i) => i !== idx));

  const addBomLine = () => materials.length && set("bom", [...(form.bom || []), { material_id: materials[0].id, qty: 1 }]);
  const updateBomLine = (idx, patch) => set("bom", form.bom.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  const removeBomLine = (idx) => set("bom", form.bom.filter((_, i) => i !== idx));

  return (
    <Modal theme={theme} title={kit.id ? "Editar kit" : "Novo kit"} onClose={onClose} width={640}>
      <Field label="Nome do kit">
        <input style={inputStyle(theme)} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Kit Viagem" />
      </Field>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 5, opacity: 0.75 }}>
          Fotos do kit ({(form.image_urls || []).length}/{MAX_IMAGES})
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
      </div>

      <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", opacity: 0.6, margin: "0 0 8px" }}>Produtos que compõem o kit</div>
      {otherProducts.length === 0 && (
        <div style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 10 }}>
          Você ainda não tem produtos simples cadastrados. Cadastre-os na aba Produtos primeiro.
        </div>
      )}
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

      <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", opacity: 0.6, margin: "0 0 8px" }}>Materiais extras do kit (opcional)</div>
      <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 10 }}>Ex.: embalagem específica do kit, laço, cartão — algo que não faz parte de nenhum produto individual.</div>
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
      <Button theme={theme} variant="ghost" onClick={addBomLine} style={{ marginBottom: 16 }}><Plus size={13} /> Adicionar material extra</Button>

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
        <Row theme={theme} label="Custo dos produtos + materiais extras" value={brl(calc.materialsCost)} />
        <Row theme={theme} label="Rateio de despesas fixas" value={brl(calc.fixedExpenseShare)} />
        <div style={{ borderTop: `1px solid ${theme.border}`, margin: "6px 0" }} />
        <Row theme={theme} label="Custo total" value={brl(calc.subtotal)} bold />
        <Row theme={theme} label="Preço sugerido" value={brl(calc.finalPrice)} bold tone={theme.primary} />
        <Row theme={theme} label="Lucro líquido estimado" value={`${brl(calc.profit)} (${calc.realMarginPercent.toFixed(0)}%)`} tone={theme.good} />
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
        <Button theme={theme} variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button theme={theme} onClick={() => form.name.trim() && onSave(form)}>Salvar kit</Button>
      </div>
    </Modal>
  );
}
