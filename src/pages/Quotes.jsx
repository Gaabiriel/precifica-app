import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, FileDown, FileText, ChevronRight, MessageCircle, Pencil, X } from "lucide-react";
import { Card, Button, Field, inputStyle, iconBtn, Modal, Spinner } from "../components/ui.jsx";
import { brl, computeProductCost } from "../pricing.js";
import { supabase } from "../supabaseClient";
import { useCatalogData, fetchQuotes, productLabel } from "../data.js";
import { computeQuote, fillPlaceholders, downloadQuotePdf } from "../quotePdf.js";

function fmtDate(d) {
  if (!d) return "";
  const date = typeof d === "string" && d.length === 10 ? new Date(`${d}T00:00:00`) : new Date(d);
  return date.toLocaleDateString("pt-BR");
}

// validade sugerida pra orçamento novo (dá pra mudar ou apagar no formulário)
const DEFAULT_VALID_DAYS = 7;
// data local no formato do <input type="date"> (yyyy-mm-dd)
function isoDay(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const todayIso = () => isoDay(new Date());
function addDays(iso, days) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return isoDay(d);
}
const daysBetweenIso = (a, b) => Math.round((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / 86400000);
const defaultValidUntil = () => addDays(todayIso(), DEFAULT_VALID_DAYS);

const fmtPct = (v) => String(Number(v) || 0).replace(".", ",");

function phoneDigits(contact) {
  const digits = (contact || "").replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if (digits.length >= 12) return digits;
  return "";
}

function buildWhatsappMessage(quote) {
  const { client_name, items, valid_until, notes, ownerName } = quote;
  const calc = computeQuote(items, quote.discount_type, quote.discount_value);
  const lines = [];
  lines.push(`Olá${client_name ? `, ${client_name}` : ""}! 👋`);
  lines.push("Segue o orçamento solicitado:");
  lines.push("");
  lines.push("🛍️ *Itens*");
  calc.lines.forEach((l) => lines.push(`• ${l.qty}x ${l.name} — ${brl(l.net)}${l.discount_percent > 0 ? ` (−${fmtPct(l.discount_percent)}%)` : ""}`));
  lines.push("");
  if (calc.saved > 0) {
    lines.push(`Valor dos itens: ${brl(calc.gross)}`);
    lines.push(`Desconto: −${brl(calc.saved)}`);
  }
  lines.push(`💰 *Total: ${brl(calc.total)}*`);
  if (valid_until) lines.push(`📅 Válido até: ${fmtDate(valid_until)}`);
  const filledNotes = fillPlaceholders(notes, { clientName: client_name, total: calc.total }).trim();
  if (filledNotes) { lines.push(""); lines.push(filledNotes); }
  if (items.some((it) => it.image_url)) { lines.push(""); lines.push("📎 Te envio também o PDF com as fotos dos produtos."); }
  lines.push("");
  lines.push("Qualquer dúvida, é só chamar! 😊");
  if (ownerName) lines.push(`— ${ownerName}`);
  return lines.join("\n");
}

function sendWhatsapp(quote) {
  const digits = phoneDigits(quote.client_contact);
  window.open(`https://wa.me/${digits}?text=${encodeURIComponent(buildWhatsappMessage(quote))}`, "_blank");
}

function usePdfDownload(showToast) {
  const [busy, setBusy] = useState(false);
  const download = async (quote) => {
    setBusy(true);
    try { await downloadQuotePdf(quote); }
    catch { showToast("Não deu pra gerar o PDF. Tente de novo.", "err"); }
    finally { setBusy(false); }
  };
  return [busy, download];
}

function QuoteThumb({ theme, url, size = 36 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 7, overflow: "hidden", background: theme.surfaceAlt, border: `1px solid ${theme.border}`, flexShrink: 0 }}>
      {url && <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
    </div>
  );
}

/** Linhas de valor (peças, descontos, total) — usadas no formulário e no detalhe. */
function QuoteSummary({ theme, calc, discountType, discountValue }) {
  const line = { display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "4px 0", color: theme.textMuted };
  const neg = { ...line, color: "#A8693F", fontWeight: 700 };
  return (
    <div>
      {calc.saved > 0 && <div style={line}><span>Valor dos itens</span><span>{brl(calc.gross)}</span></div>}
      {calc.itemsDiscount > 0 && <div style={neg}><span>Desconto nos itens</span><span>− {brl(calc.itemsDiscount)}</span></div>}
      {calc.totalDiscount > 0 && (
        <div style={neg}><span>Desconto no total{discountType === "percent" ? ` (${fmtPct(discountValue)}%)` : ""}</span><span>− {brl(calc.totalDiscount)}</span></div>
      )}
      <div style={{ ...line, borderTop: calc.saved > 0 ? `1px solid ${theme.border}` : "none", marginTop: calc.saved > 0 ? 6 : 0, paddingTop: calc.saved > 0 ? 10 : 4, color: theme.text, fontSize: 15, fontWeight: 800 }}>
        <span>Total do orçamento</span><span style={{ color: theme.primary }}>{brl(calc.total)}</span>
      </div>
    </div>
  );
}

export default function Quotes({ theme, showToast, ownerName, logoUrl }) {
  const { materials, products, allProducts, settings, loading: loadingCatalog } = useCatalogData();
  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [refreshingQuotes, setRefreshingQuotes] = useState(false);
  const loadedQuotesOnce = useRef(false);
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [validUntil, setValidUntil] = useState(defaultValidUntil);
  const [issuedOn, setIssuedOn] = useState(todayIso);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState(0);
  const [saving, setSaving] = useState(false);
  const [detailQuote, setDetailQuote] = useState(null);
  // orçamento salvo sendo editado (null = criando um novo)
  const [editingQuote, setEditingQuote] = useState(null);
  const formRef = useRef(null);

  const reloadQuotes = useCallback(async () => {
    if (loadedQuotesOnce.current) setRefreshingQuotes(true);
    const qs = await fetchQuotes(10);
    setQuotes(qs);
    loadedQuotesOnce.current = true;
    setLoadingQuotes(false);
    setRefreshingQuotes(false);
  }, []);
  useEffect(() => { reloadQuotes(); }, [reloadQuotes]);

  // allProducts: um orçamento antigo pode ter item de produto que já foi excluído.
  const productCosts = useMemo(
    () => (settings ? allProducts.map((p) => ({ product: p, calc: computeProductCost(p, materials, allProducts, settings) })) : []),
    [allProducts, materials, settings]
  );
  const imageOf = (productId) => {
    const p = allProducts.find((x) => x.id === productId);
    return p?.image_urls?.[0] || p?.image_url || null;
  };
  // dados completos pra gerar PDF/WhatsApp (fotos, logo e textos das Configurações)
  const forDocument = (q) => ({
    ...q,
    items: (q.items || []).map((it) => ({ ...it, image_url: imageOf(it.product_id) })),
    general_conditions: settings?.quote_general_conditions || "",
    subtitle: settings?.quote_subtitle || "",
    thanks: settings?.quote_thanks ?? undefined,
    themeColors: { primary: theme.primary, accent: theme.accent },
    ownerName,
    logoUrl,
  });
  const [pdfBusy, downloadPdf] = usePdfDownload(showToast);
  const priceOf = (productId) => productCosts.find((p) => p.product.id === productId)?.calc.finalPrice || 0;

  // cada item guarda o próprio unit_price: vem do preço do produto, mas pode ser
  // ajustado (negociação) e, num orçamento salvo, mantém o valor combinado.
  const addItem = () => products.length && setItems([...items, { product_id: products[0].id, qty: 1, unit_price: priceOf(products[0].id), discount_percent: 0 }]);
  const updateItem = (idx, patch) => setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const changeItemProduct = (idx, productId) => updateItem(idx, { product_id: productId, unit_price: priceOf(productId), name: undefined });
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const rows = items.map((it) => {
    const found = productCosts.find((p) => p.product.id === it.product_id);
    const unitPrice = it.unit_price ?? (found ? found.calc.finalPrice : 0);
    return { ...it, name: found ? productLabel(found.product) : it.name || "(produto removido)", unitPrice };
  });
  const quoteItems = rows.map((r) => ({ product_id: r.product_id, name: r.name, qty: r.qty, unit_price: r.unitPrice, discount_percent: Number(r.discount_percent) || 0 }));
  const calc = computeQuote(quoteItems, discountType, discountValue);

  const resetForm = () => {
    setClientName(""); setClientContact(""); setValidUntil(defaultValidUntil()); setIssuedOn(todayIso()); setNotes(""); setItems([]);
    setDiscountType("percent"); setDiscountValue(0);
    setEditingQuote(null);
  };

  const startEdit = (q) => {
    setClientName(q.client_name || "");
    setClientContact(q.client_contact || "");
    setValidUntil(q.valid_until ? String(q.valid_until).slice(0, 10) : "");
    setIssuedOn(q.created_at ? isoDay(new Date(q.created_at)) : todayIso());
    setNotes(q.notes || "");
    setItems((q.items || []).map((it) => ({ product_id: it.product_id, qty: it.qty, unit_price: it.unit_price, name: it.name, discount_percent: it.discount_percent || 0 })));
    setDiscountType(q.discount_type || "percent");
    setDiscountValue(Number(q.discount_value) || 0);
    setEditingQuote(q);
    setDetailQuote(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const applyTemplate = (text) => {
    if (notes.trim() && notes.trim() !== text.trim() && !window.confirm("Trocar o texto que já está nas observações pelo modelo?")) return;
    setNotes(text);
  };

  // muda a data de emissão mantendo o mesmo prazo de validade (ex.: 7 dias)
  const changeIssuedOn = (next) => {
    if (!next) return;
    if (validUntil && issuedOn) setValidUntil(addDays(next, daysBetweenIso(issuedOn, validUntil)));
    setIssuedOn(next);
  };

  const currentQuoteData = () => ({
    client_name: clientName,
    client_contact: clientContact,
    created_at: new Date(`${issuedOn || todayIso()}T12:00:00`).toISOString(),
    valid_until: validUntil || null,
    notes,
    items: quoteItems,
    discount_type: discountType,
    discount_value: Number(discountValue) || 0,
    total: calc.total,
  });

  const generatePdf = () => downloadPdf(forDocument(currentQuoteData()));
  const shareWhatsapp = () => sendWhatsapp(forDocument(currentQuoteData()));

  const saveQuote = async () => {
    if (!clientName.trim() || rows.length === 0) return;
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const { created_at, ...rest } = currentQuoteData();
    // só grava a data de emissão quando ela foi mudada no formulário
    const originalDay = editingQuote?.created_at ? isoDay(new Date(editingQuote.created_at)) : todayIso();
    const payload = issuedOn && issuedOn !== originalDay ? { ...rest, created_at } : rest;
    const { error } = editingQuote
      ? await supabase.from("quotes").update(payload).eq("id", editingQuote.id)
      : await supabase.from("quotes").insert({ ...payload, owner_id: userData.user.id });
    setSaving(false);
    if (error) { showToast("Erro ao salvar orçamento.", "err"); return; }
    showToast(editingQuote ? "Orçamento atualizado." : "Orçamento salvo.");
    resetForm();
    reloadQuotes();
  };

  if (loadingCatalog || loadingQuotes) return <div style={{ color: theme.textMuted, fontSize: 13.5 }}>Carregando orçamentos…</div>;

  const templates = [
    { label: "Sob encomenda", text: settings?.quote_template_custom },
    { label: "Pronta entrega", text: settings?.quote_template_ready },
  ].filter((t) => t.text?.trim());
  const colHead = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: theme.textMuted };
  const segBtn = (active) => ({
    padding: "0 12px", height: 34, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
    background: active ? theme.primary : theme.surface, color: active ? "#fff" : theme.textMuted,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div ref={formRef} />
      <Card theme={theme} style={{ padding: 20, ...(editingQuote ? { border: `1.5px solid ${theme.primary}` } : {}) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          {logoUrl && <img src={logoUrl} alt="" style={{ height: 28, maxWidth: 90, objectFit: "contain" }} />}
          <div style={{ fontSize: 16, fontWeight: 800 }}>{editingQuote ? `Editando orçamento — ${editingQuote.client_name}` : "Novo orçamento"}</div>
          {editingQuote && (
            <Button theme={theme} variant="ghost" onClick={resetForm} style={{ marginLeft: "auto", height: 30, fontSize: 12.5 }}><X size={13} /> Cancelar edição</Button>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, maxWidth: 780, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 220px" }}><Field label="Nome do cliente"><input style={inputStyle(theme)} value={clientName} onChange={(e) => setClientName(e.target.value)} /></Field></div>
          <div style={{ flex: "1 1 220px" }}><Field label="Contato (telefone/WhatsApp)" hint="Usado pra montar o link de envio"><input style={inputStyle(theme)} value={clientContact} onChange={(e) => setClientContact(e.target.value)} placeholder="(11) 91234-5678" /></Field></div>
          <div style={{ flex: "1 1 150px" }}>
            <Field label="Emitido em">
              <input type="date" style={inputStyle(theme)} value={issuedOn} onChange={(e) => changeIssuedOn(e.target.value)} />
            </Field>
            {issuedOn !== todayIso() && (
              <button type="button" onClick={() => changeIssuedOn(todayIso())} style={{ marginTop: 4, background: "none", border: "none", padding: 0, color: theme.primary, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Usar a data de hoje</button>
            )}
          </div>
          <div style={{ flex: "1 1 150px" }}><Field label="Válido até (opcional)"><input type="date" style={inputStyle(theme)} value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /></Field></div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, flexWrap: "wrap", maxWidth: 780, marginBottom: 5 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.75 }}>Formas de pagamento e observações (opcional)</div>
          {templates.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {templates.map((t) => (
                <Button key={t.label} theme={theme} variant="soft" style={{ height: 28, padding: "0 10px", fontSize: 12 }} onClick={() => applyTemplate(t.text)}>
                  <FileText size={12} /> Modelo: {t.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        <textarea rows={notes ? 7 : 2} style={{ ...inputStyle(theme), resize: "vertical", maxWidth: 780, fontFamily: "inherit", lineHeight: 1.5 }} value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Condições de pagamento, prazo de entrega etc." />
        <div style={{ fontSize: 11.5, color: theme.textMuted, margin: "4px 0 14px", maxWidth: 780, lineHeight: 1.45 }}>
          [Total], [Metade] e [Nome do Cliente] são trocados sozinhos pelos valores do orçamento. As condições gerais (Configurações) saem em todo PDF.
        </div>

        {rows.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 4, ...colHead }}>
            <span style={{ width: 36 }} />
            <span style={{ flex: 3 }}>Produto</span>
            <span style={{ flex: 0.8 }}>Qtd</span>
            <span style={{ flex: 1.2 }}>Preço unit.</span>
            <span style={{ flex: 1 }}>Desc. %</span>
            <span style={{ width: 92, textAlign: "right" }}>Subtotal</span>
            <span style={{ width: 34 }} />
          </div>
        )}
        {rows.map((r, idx) => {
          const line = calc.lines[idx];
          const discounted = line.discount_percent > 0;
          return (
            <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
              <QuoteThumb theme={theme} url={imageOf(r.product_id)} />
              <select style={{ ...inputStyle(theme), flex: 3, minWidth: 0 }} value={r.product_id} onChange={(e) => changeItemProduct(idx, e.target.value)}>
                {!products.some((p) => p.id === r.product_id) && <option value={r.product_id}>{r.name}</option>}
                {products.map((p) => <option key={p.id} value={p.id}>{productLabel(p)}</option>)}
              </select>
              <input type="number" min={1} style={{ ...inputStyle(theme), flex: 0.8, minWidth: 0 }} value={r.qty} onChange={(e) => updateItem(idx, { qty: parseInt(e.target.value) || 1 })} />
              <input type="number" step="0.01" min={0} style={{ ...inputStyle(theme), flex: 1.2, minWidth: 0 }} value={Math.round(r.unitPrice * 100) / 100}
                onChange={(e) => updateItem(idx, { unit_price: parseFloat(e.target.value) || 0 })} title="Preço unitário" />
              <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                <input type="number" min={0} max={100} step="0.5" value={r.discount_percent || ""} placeholder="0"
                  onChange={(e) => updateItem(idx, { discount_percent: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) })}
                  style={{ ...inputStyle(theme), paddingRight: 24, ...(discounted ? { borderColor: "#C99B78", background: "#FBF4EE", color: "#8A5A38", fontWeight: 700 } : {}) }}
                  title="Desconto nesse item, em %" />
                <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: theme.textMuted, pointerEvents: "none" }}>%</span>
              </div>
              <span style={{ width: 92, textAlign: "right", display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
                {discounted && <s style={{ fontSize: 11.5, color: theme.textMuted }}>{brl(line.gross)}</s>}
                <span style={{ fontSize: 12.5, fontWeight: discounted ? 800 : 400 }}>{brl(line.net)}</span>
              </span>
              <button onClick={() => removeItem(idx)} style={iconBtn(theme)} title="Remover item"><Trash2 size={13} /></button>
            </div>
          );
        })}
        <Button theme={theme} variant="ghost" onClick={addItem} style={{ margin: "6px 0 16px" }}><Plus size={13} /> Adicionar produto</Button>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start", borderTop: `1px solid ${theme.border}`, paddingTop: 14 }}>
          <div style={{ flex: "1 1 260px" }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.75, marginBottom: 5 }}>Desconto no orçamento todo (opcional)</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "inline-flex", border: `1px solid ${theme.border}`, borderRadius: 8, overflow: "hidden" }}>
                <button type="button" style={segBtn(discountType === "percent")} onClick={() => setDiscountType("percent")}>%</button>
                <button type="button" style={segBtn(discountType === "value")} onClick={() => setDiscountType("value")}>R$</button>
              </div>
              <input type="number" min={0} step={discountType === "percent" ? "0.5" : "0.01"} value={discountValue || ""} placeholder="0"
                onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))} style={{ ...inputStyle(theme), maxWidth: 120 }} />
            </div>
            <div style={{ fontSize: 11.5, color: theme.textMuted, marginTop: 6, lineHeight: 1.45 }}>
              Pra desconto só em alguns itens, use a coluna "Desc. %". Dá pra usar os dois juntos.
            </div>
          </div>
          <div style={{ flex: "0 1 320px", minWidth: 240 }}>
            <QuoteSummary theme={theme} calc={calc} discountType={discountType} discountValue={discountValue} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          <Button theme={theme} variant="soft" onClick={generatePdf} disabled={!rows.length || pdfBusy}>{pdfBusy ? <Spinner theme={theme} /> : <FileDown size={14} />} {pdfBusy ? "Gerando PDF…" : "Baixar PDF"}</Button>
          <Button theme={theme} variant="soft" style={{ background: "#E7F7EE", color: "#1D8A4C" }} onClick={shareWhatsapp} disabled={!rows.length}><MessageCircle size={14} /> Enviar por WhatsApp</Button>
          <Button theme={theme} onClick={saveQuote} disabled={saving || !rows.length}><FileText size={14} /> {editingQuote ? "Salvar alterações" : "Salvar orçamento"}</Button>
        </div>
      </Card>

      <Card theme={theme} style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", fontSize: 15, fontWeight: 800, borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          Histórico de orçamentos
          {refreshingQuotes && <Spinner theme={theme} />}
        </div>
        {quotes.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: theme.textMuted, fontSize: 13 }}>Nenhum orçamento salvo ainda.</div>
        ) : (
          <>
            <div className="quotes-table-view" style={{ overflowX: "auto" }}>
              <div style={{ minWidth: 640 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1.2fr 1fr 0.7fr 1fr 80px", padding: "10px 20px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: theme.textMuted, background: theme.surfaceAlt, borderBottom: `1px solid ${theme.border}` }}>
                  <span>Cliente</span><span>Contato</span><span>Data</span><span>Itens</span><span>Total</span><span></span>
                </div>
                {quotes.map((q) => (
                  <div key={q.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1.2fr 1fr 0.7fr 1fr 80px", padding: "12px 20px", fontSize: 13.5, alignItems: "center", borderBottom: `1px solid ${theme.border}` }}>
                    <span style={{ fontWeight: 600 }}>{q.client_name}</span>
                    <span style={{ color: theme.textMuted }}>{q.client_contact || "—"}</span>
                    <span style={{ color: theme.textMuted }}>{fmtDate(q.created_at)}</span>
                    <span style={{ color: theme.textMuted }}>{(q.items || []).length}</span>
                    <span style={{ fontWeight: 700 }}>{brl(q.total)}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => startEdit(q)} style={iconBtn(theme)} title="Editar"><Pencil size={13} /></button>
                      <button onClick={() => setDetailQuote(q)} style={iconBtn(theme)} title="Ver detalhes"><ChevronRight size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="quotes-card-view" style={{ flexDirection: "column" }}>
              {quotes.map((q) => (
                <button key={q.id} onClick={() => setDetailQuote(q)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, width: "100%", padding: "12px 16px", background: "none", border: "none", borderBottom: `1px solid ${theme.border}`, textAlign: "left", cursor: "pointer", color: theme.text }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.client_name}</div>
                    <div style={{ fontSize: 11.5, color: theme.textMuted, marginTop: 2 }}>
                      {fmtDate(q.created_at)} · {(q.items || []).length} {(q.items || []).length === 1 ? "item" : "itens"}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>{brl(q.total)}</span>
                    <ChevronRight size={15} color={theme.textMuted} />
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </Card>

      {detailQuote && (
        <QuoteDetailModal theme={theme} quote={forDocument(detailQuote)} logoUrl={logoUrl} pdfBusy={pdfBusy}
          onPdf={downloadPdf} onClose={() => setDetailQuote(null)} onEdit={() => startEdit(detailQuote)} />
      )}
    </div>
  );
}

function QuoteDetailModal({ theme, quote, logoUrl, pdfBusy, onPdf, onClose, onEdit }) {
  const items = quote.items || [];
  const calc = computeQuote(items, quote.discount_type, quote.discount_value);
  const notes = fillPlaceholders(quote.notes, { clientName: quote.client_name, total: calc.total }).trim();
  return (
    <Modal theme={theme} title={`Orçamento — ${quote.client_name}`} onClose={onClose} width={560}>
      {logoUrl && <img src={logoUrl} alt="" style={{ height: 32, maxWidth: 120, objectFit: "contain", marginBottom: 10 }} />}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", fontSize: 12.5, color: theme.textMuted, marginBottom: 14 }}>
        <span>Emitido em {fmtDate(quote.created_at)}</span>
        {quote.client_contact && <span>· {quote.client_contact}</span>}
        {quote.valid_until && <span>· Válido até {fmtDate(quote.valid_until)}</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 0.5fr 1fr 1fr", padding: "0 0 8px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: theme.textMuted, borderBottom: `1px solid ${theme.border}` }}>
        <span>Produto</span><span>Qtd</span><span>Preço unit.</span><span style={{ textAlign: "right" }}>Subtotal</span>
      </div>
      {calc.lines.map((l, idx) => (
        <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 0.5fr 1fr 1fr", alignItems: "center", padding: "9px 0", fontSize: 13, borderBottom: `1px solid ${theme.border}` }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <QuoteThumb theme={theme} url={l.image_url} size={30} /> {l.name}
          </span>
          <span>{l.qty}</span>
          <span>
            {brl(l.unit_price)}
            {l.discount_percent > 0 && <span style={{ marginLeft: 5, fontSize: 11, fontWeight: 700, color: "#A8693F" }}>−{fmtPct(l.discount_percent)}%</span>}
          </span>
          <span style={{ textAlign: "right", display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
            {l.discount_percent > 0 && <s style={{ fontSize: 11.5, color: theme.textMuted }}>{brl(l.gross)}</s>}
            {brl(l.net)}
          </span>
        </div>
      ))}
      {items.length === 0 && <div style={{ padding: "14px 0", color: theme.textMuted, fontSize: 13 }}>Este orçamento não tem itens registrados.</div>}

      <div style={{ marginTop: 10 }}>
        <QuoteSummary theme={theme} calc={calc} discountType={quote.discount_type} discountValue={quote.discount_value} />
      </div>

      {notes && (
        <div style={{ marginTop: 12, fontSize: 12.5, color: theme.textMuted, whiteSpace: "pre-line", lineHeight: 1.5 }}>
          <strong style={{ color: theme.text }}>Pagamento e observações:</strong>{"\n"}{notes}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
        <Button theme={theme} variant="ghost" onClick={onClose}>Fechar</Button>
        <Button theme={theme} variant="soft" onClick={onEdit}><Pencil size={14} /> Editar</Button>
        <Button theme={theme} variant="soft" style={{ background: "#E7F7EE", color: "#1D8A4C" }} onClick={() => sendWhatsapp(quote)} disabled={!items.length}><MessageCircle size={14} /> WhatsApp</Button>
        <Button theme={theme} onClick={() => onPdf(quote)} disabled={!items.length || pdfBusy}>{pdfBusy ? <Spinner theme={theme} /> : <FileDown size={14} />} {pdfBusy ? "Gerando PDF…" : "Baixar PDF"}</Button>
      </div>
    </Modal>
  );
}
