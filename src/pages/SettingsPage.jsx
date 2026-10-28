import React, { useCallback, useEffect, useRef, useState } from "react";
import { Save, Upload, X, Plus, Pencil, Trash2, Tag, Store, Copy, ExternalLink } from "lucide-react";
import { Card, Button, Field, inputStyle, iconBtn, Modal, ConfirmModal, ActionsMenu, Spinner } from "../components/ui.jsx";
import {
  fetchSettings, saveSettingsRow, updateProfileLogo, fetchCategories, saveCategory, deleteCategory,
  syncCatalogPrices, catalogUrl, slugify, normalizeWhatsapp,
} from "../data.js";
import { supabase } from "../supabaseClient";

export default function SettingsPage({ theme, ownerId, nicheId, showToast, logoUrl, onLogoChange, storeName }) {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    fetchSettings().then((st) => {
      setSettings(st);
      setForm(st);
      setLoading(false);
    });
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (form.catalog_enabled && (!form.catalog_slug || !form.catalog_whatsapp)) {
      showToast("Pra ligar o catálogo, preencha o endereço e o WhatsApp.", "err");
      return;
    }
    const { error } = await saveSettingsRow(ownerId, form);
    if (error) {
      showToast(error.code === "23505" ? "Esse endereço de catálogo já está em uso. Escolha outro." : "Erro ao salvar configurações.", "err");
      return;
    }
    setSettings(form);
    showToast("Configurações salvas.");
    syncCatalogPrices();
  };

  const uploadLogo = async (fileList) => {
    const file = fileList?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const ext = file.name.split(".").pop();
    const path = `${ownerId}/logo-${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
    if (uploadError) { showToast("Erro ao enviar a logo.", "err"); setUploadingLogo(false); return; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    const { error } = await updateProfileLogo(ownerId, data.publicUrl);
    setUploadingLogo(false);
    if (error) { showToast("Erro ao salvar a logo.", "err"); return; }
    onLogoChange(data.publicUrl);
    showToast("Logo atualizada.");
  };

  const removeLogo = async () => {
    const { error } = await updateProfileLogo(ownerId, null);
    if (error) { showToast("Erro ao remover a logo.", "err"); return; }
    onLogoChange(null);
    showToast("Logo removida.");
  };

  if (loading || !form) return <div style={{ color: theme.textMuted, fontSize: 13.5 }}>Carregando configurações…</div>;

  const dirty = JSON.stringify(form) !== JSON.stringify(settings);

  return (
    <div>
      <Card theme={theme} style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Logo do negócio</div>
        <div style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 16 }}>Aparece na barra lateral e como ícone da aba do navegador, só pra sua conta.</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 96, height: 96, borderRadius: 10, border: `1px solid ${theme.border}`, background: theme.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
            {logoUrl ? <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ fontSize: 11, color: theme.textMuted }}>Sem logo</span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 8, fontSize: 13.5, fontWeight: 700, cursor: "pointer", border: `1px solid ${theme.border}`, color: theme.text }}>
              {uploadingLogo ? <Spinner theme={theme} /> : <Upload size={14} />} {logoUrl ? "Trocar logo" : "Enviar logo"}
              <input type="file" accept="image/*" disabled={uploadingLogo} onChange={(e) => uploadLogo(e.target.files)} style={{ display: "none" }} />
            </label>
            {logoUrl && (
              <Button theme={theme} variant="ghost" onClick={removeLogo}><X size={14} /> Remover</Button>
            )}
          </div>
        </div>
      </Card>

      <Card theme={theme} style={{ padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Parâmetros de precificação</div>
        <div style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 20 }}>Esses valores entram automaticamente no cálculo de custo de todos os produtos.</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "4px 20px" }}>
          <Field label="Custo da hora de mão de obra (R$)"><input type="number" style={inputStyle(theme)} value={form.labor_cost_per_hour} onChange={(e) => set("labor_cost_per_hour", parseFloat(e.target.value) || 0)} /></Field>
          <Field label="Manutenção de equipamento (%)" hint="% sobre material + mão de obra"><input type="number" style={inputStyle(theme)} value={form.maintenance_percent} onChange={(e) => set("maintenance_percent", parseFloat(e.target.value) || 0)} /></Field>
          <Field label="Despesas fixas mensais (R$)" hint="Luz, água, internet, aluguel…"><input type="number" style={inputStyle(theme)} value={form.monthly_fixed_expenses} onChange={(e) => set("monthly_fixed_expenses", parseFloat(e.target.value) || 0)} /></Field>
          <Field label="Produção mensal estimada (un.)"><input type="number" style={inputStyle(theme)} value={form.monthly_capacity_units} onChange={(e) => set("monthly_capacity_units", parseFloat(e.target.value) || 1)} /></Field>
          <Field label="Margem de lucro padrão (%)"><input type="number" style={inputStyle(theme)} value={form.default_margin_percent} onChange={(e) => set("default_margin_percent", parseFloat(e.target.value) || 0)} /></Field>
          <Field label="Taxa de cartão/marketplace (%)"><input type="number" style={inputStyle(theme)} value={form.card_fee_percent} onChange={(e) => set("card_fee_percent", parseFloat(e.target.value) || 0)} /></Field>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, margin: "10px 0 4px", cursor: "pointer" }}>
          <input type="checkbox" checked={form.round_to_90} onChange={(e) => set("round_to_90", e.target.checked)} />
          Arredondar preço final para terminar em ",90"
        </label>
      </Card>

      <Card theme={theme} style={{ padding: 24, marginTop: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Investimento inicial</div>
        <div style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 16 }}>
          Quanto você já gastou pra estruturar o negócio — equipamentos, licenças de software, estoque de partida etc. Usado em Relatórios pra acompanhar quanto disso já voltou em forma de lucro das vendas.
        </div>
        <div style={{ maxWidth: 260 }}>
          <Field label="Valor investido (R$)">
            <input type="number" style={inputStyle(theme)} value={form.initial_investment} onChange={(e) => set("initial_investment", parseFloat(e.target.value) || 0)} />
          </Field>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
          <Button theme={theme} onClick={handleSave} style={{ opacity: dirty ? 1 : 0.5 }}><Save size={14} /> Salvar configurações</Button>
        </div>
      </Card>

      <CatalogCard theme={theme} form={form} set={set} dirty={dirty} onSave={handleSave} storeName={storeName} showToast={showToast} />

      <div style={{ marginTop: 20 }}>
        <CategoriesCard theme={theme} nicheId={nicheId} showToast={showToast} />
      </div>
    </div>
  );
}

function CategoriesCard({ theme, nicheId, showToast }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const loadedOnce = useRef(false);
  const [modal, setModal] = useState(null); // null | {} | category
  const [deleteTarget, setDeleteTarget] = useState(null);

  const reload = useCallback(async () => {
    if (loadedOnce.current) setRefreshing(true);
    const cats = await fetchCategories();
    setCategories(cats);
    loadedOnce.current = true;
    setLoading(false);
    setRefreshing(false);
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const handleSave = async (c) => {
    const { error } = await saveCategory(nicheId, c);
    if (error) {
      showToast(error.code === "23505" ? "Já existe uma categoria com esse nome." : "Erro ao salvar categoria.", "err");
      return;
    }
    showToast("Categoria salva.");
    setModal(null);
    reload();
  };

  const handleDelete = async (id) => {
    const { error } = await deleteCategory(id);
    setDeleteTarget(null);
    if (error) { showToast("Erro ao excluir categoria.", "err"); return; }
    showToast("Categoria removida.");
    reload();
  };

  return (
    <Card theme={theme} style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${theme.border}` }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Categorias de materiais</div>
          <div style={{ fontSize: 12.5, color: theme.textMuted, marginTop: 2 }}>Aparecem como opções ao cadastrar um material. Compartilhadas entre todos os negócios do mesmo nicho.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {refreshing && <Spinner theme={theme} />}
          <Button theme={theme} variant="soft" style={{ padding: "7px 12px", fontSize: 12.5 }} onClick={() => setModal({})}>
            <Plus size={13} /> Nova categoria
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 20, fontSize: 13, color: theme.textMuted }}>Carregando categorias…</div>
      ) : categories.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", color: theme.textMuted, fontSize: 13 }}>Nenhuma categoria cadastrada ainda.</div>
      ) : (
        categories.map((c) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 20px", fontSize: 13.5, borderTop: `1px solid ${theme.border}` }}>
            <span style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 600 }}>
              <Tag size={14} color={theme.textMuted} /> {c.name}
            </span>
            <div className="desktop-only-actions" style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setModal(c)} style={iconBtn(theme)}><Pencil size={14} /></button>
              <button onClick={() => setDeleteTarget(c)} style={iconBtn(theme)}><Trash2 size={14} /></button>
            </div>
            <div className="mobile-only-actions">
              <ActionsMenu
                theme={theme}
                actions={[
                  { label: "Editar", icon: Pencil, onClick: () => setModal(c) },
                  { label: "Excluir", icon: Trash2, danger: true, onClick: () => setDeleteTarget(c) },
                ]}
              />
            </div>
          </div>
        ))
      )}

      {modal && <CategoryModal theme={theme} category={modal} onClose={() => setModal(null)} onSave={handleSave} />}
      {deleteTarget && (
        <ConfirmModal
          theme={theme}
          message={`Tem certeza que quer excluir a categoria "${deleteTarget.name}"? Materiais que usam essa categoria ficam sem categoria.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget.id)}
        />
      )}
    </Card>
  );
}

function CategoryModal({ theme, category, onClose, onSave }) {
  const [name, setName] = useState(category.name || "");
  return (
    <Modal theme={theme} title={category.id ? "Editar categoria" : "Nova categoria"} onClose={onClose} width={360}>
      <Field label="Nome da categoria">
        <input style={inputStyle(theme)} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Tecido, Aviamento, Embalagem…" autoFocus />
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
        <Button theme={theme} variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button theme={theme} onClick={() => name.trim() && onSave({ id: category.id, name: name.trim() })}>Salvar</Button>
      </div>
    </Modal>
  );
}

function CatalogCard({ theme, form, set, dirty, onSave, storeName, showToast }) {
  const savedSlug = form.catalog_slug;
  const url = savedSlug ? catalogUrl(savedSlug) : "";
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); showToast("Link copiado."); }
    catch { showToast("Não deu pra copiar — selecione o link e copie.", "err"); }
  };
  const label = { display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer" };

  return (
    <Card theme={theme} style={{ padding: 24, marginTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Store size={16} color={theme.primary} />
        <div style={{ fontSize: 16, fontWeight: 800 }}>Catálogo online</div>
      </div>
      <div style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 16, lineHeight: 1.5 }}>
        Um link pra mandar pros clientes com os produtos que você escolher (em cada produto: "Mostrar no catálogo online").
        O cliente monta a lista e pede orçamento direto no seu WhatsApp. Custos e margens nunca aparecem.
      </div>

      <label style={{ ...label, marginBottom: 14, fontWeight: 600 }}>
        <input type="checkbox" checked={!!form.catalog_enabled} onChange={(e) => {
          set("catalog_enabled", e.target.checked);
          if (e.target.checked && !form.catalog_slug) set("catalog_slug", slugify(storeName));
        }} />
        Catálogo ligado
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "4px 20px" }}>
        <Field label="Endereço do catálogo" hint="Só letras, números e hífen. Ex: atelie-maria">
          <input style={inputStyle(theme)} value={form.catalog_slug || ""} onChange={(e) => set("catalog_slug", slugify(e.target.value) || null)} placeholder="atelie-maria" />
        </Field>
        <Field label="WhatsApp que recebe os pedidos" hint="Com DDD. Ex: (11) 98765-4321">
          <input style={inputStyle(theme)} inputMode="tel" value={form.catalog_whatsapp || ""} onChange={(e) => set("catalog_whatsapp", normalizeWhatsapp(e.target.value) || null)} placeholder="11987654321" />
        </Field>
      </div>

      {form.catalog_enabled && url && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "10px 12px", borderRadius: 10, background: theme.surfaceAlt, margin: "6px 0 4px" }}>
          <span style={{ fontSize: 13, fontWeight: 600, flex: "1 1 220px", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</span>
          {dirty ? (
            <span style={{ fontSize: 12, color: theme.textMuted }}>Salve pra o link funcionar.</span>
          ) : (
            <>
              <Button theme={theme} variant="ghost" onClick={copy}><Copy size={14} /> Copiar</Button>
              <a href={url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <Button theme={theme} variant="soft"><ExternalLink size={14} /> Abrir</Button>
              </a>
            </>
          )}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
        <Button theme={theme} onClick={onSave} style={{ opacity: dirty ? 1 : 0.5 }}><Save size={14} /> Salvar configurações</Button>
      </div>
    </Card>
  );
}
