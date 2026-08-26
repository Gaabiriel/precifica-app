import React, { useMemo, useState } from "react";
import { Plus, Trash2, FileDown, FileText, ChevronRight } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Card, Button, Field, inputStyle, iconBtn, Row, Modal } from "../components/ui.jsx";
import { brl, computeProductCost } from "../pricing.js";
import { supabase } from "../supabaseClient";

function buildQuotePdf({ client_name, client_contact, created_at, items, total }) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Orçamento", 14, 18);
  doc.setFontSize(10);
  doc.text(`Cliente: ${client_name || "—"}`, 14, 26);
  if (client_contact) doc.text(`Contato: ${client_contact}`, 14, 32);
  doc.text(`Data: ${new Date(created_at || Date.now()).toLocaleDateString("pt-BR")}`, 14, client_contact ? 38 : 32);

  autoTable(doc, {
    startY: client_contact ? 44 : 38,
    head: [["Produto", "Qtd", "Preço unit.", "Subtotal"]],
    body: items.map((it) => [it.name, it.qty, brl(it.unit_price), brl(it.unit_price * it.qty)]),
    foot: [["", "", "Total", brl(total)]],
    theme: "grid",
    headStyles: { fillColor: [122, 92, 66] },
  });

  doc.save(`orcamento-${(client_name || "cliente").replace(/\s+/g, "-").toLowerCase()}.pdf`);
}

export default function Quotes({ theme, products, materials, settings, quotes, onSaved, ownerName }) {
  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [detailQuote, setDetailQuote] = useState(null);

  const productCosts = useMemo(
    () => products.map((p) => ({ product: p, calc: computeProductCost(p, materials, products, settings) })),
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

  const generatePdf = () => {
    buildQuotePdf({
      client_name: clientName,
      client_contact: clientContact,
      created_at: Date.now(),
      items: rows.map((r) => ({ name: r.name, qty: r.qty, unit_price: r.unitPrice })),
      total,
    });
  };

  const saveQuote = async () => {
    if (!clientName.trim() || rows.length === 0) return;
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("quotes").insert({
      owner_id: userData.user.id,
      client_name: clientName,
      client_contact: clientContact,
      items: rows.map((r) => ({ product_id: r.product_id, name: r.name, qty: r.qty, unit_price: r.unitPrice })),
      total,
    });
    setSaving(false);
    setClientName(""); setClientContact(""); setItems([]);
    onSaved();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Card theme={theme} style={{ padding: 20 }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Novo orçamento</div>
        <div style={{ display: "flex", gap: 10, maxWidth: 640 }}>
          <div style={{ flex: 1 }}><Field label="Nome do cliente"><input style={inputStyle(theme)} value={clientName} onChange={(e) => setClientName(e.target.value)} /></Field></div>
          <div style={{ flex: 1 }}><Field label="Contato (opcional)"><input style={inputStyle(theme)} value={clientContact} onChange={(e) => setClientContact(e.target.value)} /></Field></div>
        </div>

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

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <Button theme={theme} variant="soft" onClick={generatePdf} disabled={!rows.length}><FileDown size={14} /> Baixar PDF</Button>
          <Button theme={theme} onClick={saveQuote} disabled={saving || !rows.length}><FileText size={14} /> Salvar orçamento</Button>
        </div>
      </Card>

      <Card theme={theme} style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, borderBottom: `1px solid ${theme.border}` }}>
          Histórico de orçamentos
        </div>
        {quotes.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: theme.textMuted, fontSize: 13 }}>Nenhum orçamento salvo ainda.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 640 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1.2fr 1fr 0.7fr 1fr 60px", padding: "10px 20px", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", color: theme.textMuted, borderBottom: `1px solid ${theme.border}` }}>
                <span>Cliente</span><span>Contato</span><span>Data</span><span>Itens</span><span>Total</span><span></span>
              </div>
              {quotes.map((q) => (
                <div key={q.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1.2fr 1fr 0.7fr 1fr 60px", padding: "12px 20px", fontSize: 13.5, alignItems: "center", borderBottom: `1px solid ${theme.border}` }}>
                  <span style={{ fontWeight: 600 }}>{q.client_name}</span>
                  <span style={{ color: theme.textMuted }}>{q.client_contact || "—"}</span>
                  <span style={{ color: theme.textMuted }}>{new Date(q.created_at).toLocaleDateString("pt-BR")}</span>
                  <span style={{ color: theme.textMuted }}>{(q.items || []).length}</span>
                  <span style={{ fontWeight: 700 }}>{brl(q.total)}</span>
                  <button onClick={() => setDetailQuote(q)} style={iconBtn(theme)} title="Ver detalhes"><ChevronRight size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {detailQuote && <QuoteDetailModal theme={theme} quote={detailQuote} onClose={() => setDetailQuote(null)} />}
    </div>
  );
}

function QuoteDetailModal({ theme, quote, onClose }) {
  const items = quote.items || [];
  return (
    <Modal theme={theme} title={`Orçamento — ${quote.client_name}`} onClose={onClose} width={520}>
      <div style={{ fontSize: 12.5, color: theme.textMuted, marginBottom: 14 }}>
        {new Date(quote.created_at).toLocaleDateString("pt-BR")}
        {quote.client_contact ? ` · ${quote.client_contact}` : ""}
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

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
        <Button theme={theme} variant="ghost" onClick={onClose}>Fechar</Button>
        <Button theme={theme} onClick={() => buildQuotePdf(quote)} disabled={!items.length}><FileDown size={14} /> Baixar PDF</Button>
      </div>
    </Modal>
  );
}
