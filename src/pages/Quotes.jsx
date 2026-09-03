import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, FileDown, FileText, ChevronRight, MessageCircle } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, Button, Field, inputStyle, iconBtn, Row, Modal, Spinner } from "../components/ui.jsx";
import { brl, computeProductCost } from "../pricing.js";
import { supabase } from "../supabaseClient";
import { useCatalogData, fetchQuotes } from "../data.js";

function fmtDate(d) {
  if (!d) return "";
  const date = typeof d === "string" && d.length === 10 ? new Date(`${d}T00:00:00`) : new Date(d);
  return date.toLocaleDateString("pt-BR");
}

/** Baixa a logo e devolve como data URL (jsPDF precisa dos bytes, não só da URL), já com as dimensões naturais pra não distorcer ao desenhar. */
function loadLogoAsset(url) {
  return fetch(url)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result;
            const img = new Image();
            img.onload = () => resolve({ dataUrl, format: blob.type.includes("png") ? "PNG" : "JPEG", width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = reject;
            img.src = dataUrl;
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );
}

function buildQuotePdf({ client_name, client_contact, created_at, valid_until, notes, items, total, logo }) {
  const doc = new jsPDF();
  let y = 18;
  if (logo) {
    const width = 32;
    const height = (logo.height / logo.width) * width;
    doc.addImage(logo.dataUrl, logo.format, 14, 10, width, height);
    y = 10 + height + 10;
  }
  doc.setFontSize(16);
  doc.text("Orçamento", 14, y);
  doc.setFontSize(10);
  y += 8;
  doc.text(`Cliente: ${client_name || "—"}`, 14, y);
  if (client_contact) { y += 6; doc.text(`Contato: ${client_contact}`, 14, y); }
  y += 6;
  doc.text(`Data: ${fmtDate(created_at || Date.now())}`, 14, y);
  if (valid_until) { y += 6; doc.text(`Válido até: ${fmtDate(valid_until)}`, 14, y); }

  autoTable(doc, {
    startY: y + 6,
    head: [["Produto", "Qtd", "Preço unit.", "Subtotal"]],
    body: items.map((it) => [it.name, it.qty, brl(it.unit_price), brl(it.unit_price * it.qty)]),
    foot: [["", "", "Total", brl(total)]],
    theme: "grid",
    headStyles: { fillColor: [122, 92, 66] },
  });

  if (notes) {
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text("Observações:", 14, finalY);
    doc.setFontSize(9.5);
    doc.text(doc.splitTextToSize(notes, 180), 14, finalY + 6);
  }

  doc.save(`orcamento-${(client_name || "cliente").replace(/\s+/g, "-").toLowerCase()}.pdf`);
}

function phoneDigits(contact) {
  const digits = (contact || "").replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if (digits.length >= 12) return digits;
  return "";
}

function buildWhatsappMessage({ client_name, items, total, valid_until, notes, ownerName }) {
  const lines = [];
  lines.push(`Olá${client_name ? `, ${client_name}` : ""}! 👋`);
  lines.push("Segue o orçamento solicitado:");
  lines.push("");
  lines.push("🛍️ *Itens*");
  items.forEach((it) => lines.push(`• ${it.qty}x ${it.name} — ${brl(it.unit_price * it.qty)}`));
  lines.push("");
  lines.push(`💰 *Total: ${brl(total)}*`);
  if (valid_until) lines.push(`📅 Válido até: ${fmtDate(valid_until)}`);
  if (notes) lines.push(`📝 ${notes}`);
  lines.push("");
  lines.push("Qualquer dúvida, é só chamar! 😊");
  if (ownerName) lines.push(`— ${ownerName}`);
  return lines.join("\n");
}

function sendWhatsapp(quoteLike) {
  const digits = phoneDigits(quoteLike.client_contact);
  const text = buildWhatsappMessage(quoteLike);
  window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, "_blank");
}

export default function Quotes({ theme, showToast, ownerName, logoUrl }) {
  const { materials, products, settings, loading: loadingCatalog } = useCatalogData();
  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [refreshingQuotes, setRefreshingQuotes] = useState(false);
  const loadedQuotesOnce = useRef(false);
  const [logoAsset, setLogoAsset] = useState(null);
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [detailQuote, setDetailQuote] = useState(null);

  const reloadQuotes = useCallback(async () => {
    if (loadedQuotesOnce.current) setRefreshingQuotes(true);
    const qs = await fetchQuotes(10);
    setQuotes(qs);
    loadedQuotesOnce.current = true;
    setLoadingQuotes(false);
    setRefreshingQuotes(false);
  }, []);
  useEffect(() => { reloadQuotes(); }, [reloadQuotes]);

  useEffect(() => {
    if (!logoUrl) { setLogoAsset(null); return; }
    let cancelled = false;
    loadLogoAsset(logoUrl).then((asset) => { if (!cancelled) setLogoAsset(asset); }).catch(() => {});
    return () => { cancelled = true; };
  }, [logoUrl]);

  const productCosts = useMemo(
    () => (settings ? products.map((p) => ({ product: p, calc: computeProductCost(p, materials, products, settings) })) : []),
    [products, materials, settings]
  );

  const addItem = () => products.length && setItems([...items, { product_id: products[0].id, qty: 1 }]);
  const updateItem = (idx, patch) => setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const rows = items.map((it) => {
    const found = productCosts.find((p) => p.product.id === it.product_id);
    const unitPrice = found ? found.calc.finalPrice : 0;
    return { ...it, name: found?.product.name || "", unitPrice, total: unitPrice * it.qty };
  });
  const total = rows.reduce((s, r) => s + r.total, 0);

  const currentQuoteData = () => ({
    client_name: clientName,
    client_contact: clientContact,
    created_at: Date.now(),
    valid_until: validUntil || null,
    notes,
    items: rows.map((r) => ({ product_id: r.product_id, name: r.name, qty: r.qty, unit_price: r.unitPrice })),
    total,
    ownerName,
    logo: logoAsset,
  });

  const generatePdf = () => buildQuotePdf(currentQuoteData());
  const shareWhatsapp = () => sendWhatsapp(currentQuoteData());

  const saveQuote = async () => {
    if (!clientName.trim() || rows.length === 0) return;
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("quotes").insert({
      owner_id: userData.user.id,
      client_name: clientName,
      client_contact: clientContact,
      valid_until: validUntil || null,
      notes,
      items: rows.map((r) => ({ product_id: r.product_id, name: r.name, qty: r.qty, unit_price: r.unitPrice })),
      total,
    });
    setSaving(false);
    if (error) { showToast("Erro ao salvar orçamento.", "err"); return; }
    setClientName(""); setClientContact(""); setValidUntil(""); setNotes(""); setItems([]);
    showToast("Orçamento salvo.");
    reloadQuotes();
  };

  if (loadingCatalog || loadingQuotes) return <div style={{ color: theme.textMuted, fontSize: 13.5 }}>Carregando orçamentos…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card theme={theme} style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          {logoUrl && <img src={logoUrl} alt="" style={{ height: 28, maxWidth: 90, objectFit: "contain" }} />}
          <div style={{ fontSize: 16, fontWeight: 800 }}>Novo orçamento</div>
        </div>
        <div style={{ display: "flex", gap: 10, maxWidth: 780, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 220px" }}><Field label="Nome do cliente"><input style={inputStyle(theme)} value={clientName} onChange={(e) => setClientName(e.target.value)} /></Field></div>
          <div style={{ flex: "1 1 220px" }}><Field label="Contato (telefone/WhatsApp)" hint="Usado pra montar o link de envio"><input style={inputStyle(theme)} value={clientContact} onChange={(e) => setClientContact(e.target.value)} placeholder="(11) 91234-5678" /></Field></div>
          <div style={{ flex: "1 1 150px" }}><Field label="Válido até (opcional)"><input type="date" style={inputStyle(theme)} value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /></Field></div>
        </div>
        <Field label="Observações (opcional)" hint="Condições de pagamento, prazo de entrega, etc.">
          <textarea rows={2} style={{ ...inputStyle(theme), resize: "vertical", maxWidth: 780, fontFamily: "inherit" }} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        {rows.map((r, idx) => (
          <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
            <select style={{ ...inputStyle(theme), flex: 2 }} value={r.product_id} onChange={(e) => updateItem(idx, { product_id: e.target.value })}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" min={1} style={{ ...inputStyle(theme), flex: 1 }} value={r.qty} onChange={(e) => updateItem(idx, { qty: parseInt(e.target.value) || 1 })} />
            <span style={{ fontSize: 12.5, width: 80, textAlign: "right" }}>{brl(r.total)}</span>
            <button onClick={() => removeItem(idx)} style={iconBtn(theme)}><Trash2 size={13} /></button>
          </div>
        ))}
        <Button theme={theme} variant="ghost" onClick={addItem} style={{ margin: "6px 0 16px" }}><Plus size={13} /> Adicionar produto</Button>

        <Row theme={theme} label="Total do orçamento" value={brl(total)} bold tone={theme.primary} />

        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          <Button theme={theme} variant="soft" onClick={generatePdf} disabled={!rows.length}><FileDown size={14} /> Baixar PDF</Button>
          <Button theme={theme} variant="soft" style={{ background: "#E7F7EE", color: "#1D8A4C" }} onClick={shareWhatsapp} disabled={!rows.length}><MessageCircle size={14} /> Enviar por WhatsApp</Button>
          <Button theme={theme} onClick={saveQuote} disabled={saving || !rows.length}><FileText size={14} /> Salvar orçamento</Button>
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
                <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1.2fr 1fr 0.7fr 1fr 60px", padding: "10px 20px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: theme.textMuted, background: theme.surfaceAlt, borderBottom: `1px solid ${theme.border}` }}>
                  <span>Cliente</span><span>Contato</span><span>Data</span><span>Itens</span><span>Total</span><span></span>
                </div>
                {quotes.map((q) => (
                  <div key={q.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1.2fr 1fr 0.7fr 1fr 60px", padding: "12px 20px", fontSize: 13.5, alignItems: "center", borderBottom: `1px solid ${theme.border}` }}>
                    <span style={{ fontWeight: 600 }}>{q.client_name}</span>
                    <span style={{ color: theme.textMuted }}>{q.client_contact || "—"}</span>
                    <span style={{ color: theme.textMuted }}>{fmtDate(q.created_at)}</span>
                    <span style={{ color: theme.textMuted }}>{(q.items || []).length}</span>
                    <span style={{ fontWeight: 700 }}>{brl(q.total)}</span>
                    <button onClick={() => setDetailQuote(q)} style={iconBtn(theme)} title="Ver detalhes"><ChevronRight size={14} /></button>
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
        <QuoteDetailModal theme={theme} quote={{ ...detailQuote, ownerName, logo: logoAsset }} logoUrl={logoUrl} onClose={() => setDetailQuote(null)} />
      )}
    </div>
  );
}

function QuoteDetailModal({ theme, quote, logoUrl, onClose }) {
  const items = quote.items || [];
  return (
    <Modal theme={theme} title={`Orçamento — ${quote.client_name}`} onClose={onClose} width={520}>
      {logoUrl && <img src={logoUrl} alt="" style={{ height: 32, maxWidth: 120, objectFit: "contain", marginBottom: 10 }} />}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", fontSize: 12.5, color: theme.textMuted, marginBottom: 14 }}>
        <span>Emitido em {fmtDate(quote.created_at)}</span>
        {quote.client_contact && <span>· {quote.client_contact}</span>}
        {quote.valid_until && <span>· Válido até {fmtDate(quote.valid_until)}</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 0.6fr 1fr 1fr", padding: "0 0 8px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: theme.textMuted, borderBottom: `1px solid ${theme.border}` }}>
        <span>Produto</span><span>Qtd</span><span>Preço unit.</span><span style={{ textAlign: "right" }}>Subtotal</span>
      </div>
      {items.map((it, idx) => (
        <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 0.6fr 1fr 1fr", padding: "9px 0", fontSize: 13, borderBottom: `1px solid ${theme.border}` }}>
          <span>{it.name}</span>
          <span>{it.qty}</span>
          <span>{brl(it.unit_price)}</span>
          <span style={{ textAlign: "right" }}>{brl(it.unit_price * it.qty)}</span>
        </div>
      ))}
      {items.length === 0 && <div style={{ padding: "14px 0", color: theme.textMuted, fontSize: 13 }}>Este orçamento não tem itens registrados.</div>}

      <div style={{ marginTop: 10 }}>
        <Row theme={theme} label="Total do orçamento" value={brl(quote.total)} bold tone={theme.primary} />
      </div>

      {quote.notes && (
        <div style={{ marginTop: 12, fontSize: 12.5, color: theme.textMuted }}>
          <strong style={{ color: theme.text }}>Observações:</strong> {quote.notes}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
        <Button theme={theme} variant="ghost" onClick={onClose}>Fechar</Button>
        <Button theme={theme} variant="soft" style={{ background: "#E7F7EE", color: "#1D8A4C" }} onClick={() => sendWhatsapp(quote)} disabled={!items.length}><MessageCircle size={14} /> WhatsApp</Button>
        <Button theme={theme} onClick={() => buildQuotePdf(quote)} disabled={!items.length}><FileDown size={14} /> Baixar PDF</Button>
      </div>
    </Modal>
  );
}
