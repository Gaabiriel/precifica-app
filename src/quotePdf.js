// Orçamento em PDF: o layout é montado em HTML (fora da tela), fotografado com
// html2canvas e fatiado em páginas A4 no jsPDF — assim o PDF sai igual ao
// layout, com as fontes e o visual do ateliê.
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { brl } from "./pricing.js";

/* -------------------- contas -------------------- */

const round2 = (v) => Math.round(v * 100) / 100;

/**
 * Valores do orçamento com os descontos: por item (discount_percent de cada
 * item, sobre o preço dele) e no total (discount_type 'percent' | 'value',
 * aplicado depois dos descontos dos itens).
 */
export function computeQuote(items, discountType = "percent", discountValue = 0) {
  const lines = (items || []).map((it) => {
    const qty = Number(it.qty) || 0;
    const unit = Number(it.unit_price) || 0;
    const pct = Math.min(100, Math.max(0, Number(it.discount_percent) || 0));
    const gross = round2(unit * qty);
    const net = round2(gross * (1 - pct / 100));
    return { ...it, discount_percent: pct, gross, net, unitNet: qty ? net / qty : unit };
  });
  const gross = round2(lines.reduce((s, l) => s + l.gross, 0));
  const itemsNet = round2(lines.reduce((s, l) => s + l.net, 0));
  const value = Math.max(0, Number(discountValue) || 0);
  const totalDiscount = round2(discountType === "value" ? Math.min(value, itemsNet) : itemsNet * Math.min(100, value) / 100);
  const total = round2(itemsNet - totalDiscount);
  return { lines, gross, itemsDiscount: round2(gross - itemsNet), totalDiscount, total, saved: round2(gross - total) };
}

/** Troca [Nome do Cliente], [Total] e [Metade] pelos valores do orçamento. */
export function fillPlaceholders(text, { clientName, total }) {
  return (text || "")
    .replace(/\[nome do cliente\]/gi, clientName || "")
    .replace(/\[(total|valor total|valor)\]/gi, brl(total))
    .replace(/\[metade\]/gi, brl(round2(total / 2)));
}

/* -------------------- nome da peça -------------------- */

const SMALL_WORDS = new Set(["de", "da", "do", "das", "dos", "e", "com", "para", "a", "o", "em"]);

function titleCase(text) {
  const s = text.replace(/\s+/g, " ").trim();
  if (s !== s.toLocaleUpperCase("pt-BR")) return s; // já está escrito do jeito dela
  return s.toLocaleLowerCase("pt-BR").split(" ")
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w) ? w : w.charAt(0).toLocaleUpperCase("pt-BR") + w.slice(1)))
    .join(" ");
}

/** "C 006 - CARTEIRA SHELBY - CINZA" → { code: "C 006", name: "Carteira Shelby", variant: "Cinza" } */
export function splitProductName(label) {
  let rest = (label || "").replace(/\s+/g, " ").trim();
  let code = "";
  const m = rest.match(/^([A-Za-z]{1,4} ?\d{1,4})\s*-\s*(.+)$/);
  if (m) { code = m[1].toUpperCase(); rest = m[2]; }
  const [name, ...variants] = rest.split(/\s+-\s+/);
  return { code, name: titleCase(name || ""), variant: variants.map(titleCase).join(" · ") };
}

/* -------------------- imagens -------------------- */

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("imagem inválida"));
    img.src = src;
  });
}

async function fetchAsImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.statusText);
  const src = URL.createObjectURL(await res.blob());
  try { return await loadImage(src); } finally { URL.revokeObjectURL(src); }
}

const thumbCache = new Map();
/** Foto do produto recortada em quadrado (o html2canvas não entende object-fit). */
function loadThumb(url) {
  if (!thumbCache.has(url)) {
    thumbCache.set(url, fetchAsImage(url).then((img) => {
      const size = 360;
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
      return canvas.toDataURL("image/jpeg", 0.9);
    }).catch(() => { thumbCache.delete(url); return null; }));
  }
  return thumbCache.get(url);
}

/**
 * Logo sem o fundo: a cor do fundo é a mediana das bordas, e cada pixel fica
 * mais transparente quanto mais perto dessa cor. Logo que já tem fundo
 * transparente passa direto.
 */
async function loadLogo(url) {
  try {
    const img = await fetchAsImage(url);
    const maxW = 900;
    const scale = Math.min(1, maxW / img.naturalWidth);
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h);
    const px = data.data;

    const edge = [];
    const band = Math.max(2, Math.round(Math.min(w, h) * 0.02));
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (x >= band && x < w - band && y >= band && y < h - band) continue;
        const i = (y * w + x) * 4;
        edge.push([px[i], px[i + 1], px[i + 2], px[i + 3]]);
      }
    }
    const transparentEdges = edge.filter((p) => p[3] < 20).length > edge.length / 2;
    if (transparentEdges) return { src: canvas.toDataURL("image/png"), ratio: h / w };

    const median = (k) => edge.map((p) => p[k]).sort((a, b) => a - b)[Math.floor(edge.length / 2)];
    const bg = [median(0), median(1), median(2)];
    for (let i = 0; i < px.length; i += 4) {
      const dist = Math.hypot(px[i] - bg[0], px[i + 1] - bg[1], px[i + 2] - bg[2]);
      const a = Math.min(1, Math.max(0, (dist - 18) / 70));
      if (a <= 0) { px[i + 3] = 0; continue; }
      // tira a "mistura" com o fundo pra borda não ficar com halo bege
      for (let c = 0; c < 3; c++) px[i + c] = Math.min(255, Math.max(0, (px[i + c] - bg[c] * (1 - a)) / a));
      px[i + 3] = Math.round(a * px[i + 3]);
    }
    ctx.putImageData(data, 0, 0);
    return { src: canvas.toDataURL("image/png"), ratio: h / w };
  } catch {
    return null;
  }
}

/* -------------------- textos (observações / condições) -------------------- */

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** "Pix à vista: R$ 10" → rótulo em destaque antes dos dois-pontos. */
function emphasize(line) {
  const m = line.match(/^([^:]{2,45}):\s*(.+)$/);
  return m ? `<b>${esc(m[1])}:</b> ${esc(m[2])}` : esc(line);
}

/** Texto livre → html: linhas com •/●/- viram lista, "Título:" sozinho vira subtítulo. */
function textToHtml(text) {
  const out = [];
  let list = [];
  const flush = () => { if (list.length) { out.push(`<ul>${list.join("")}</ul>`); list = []; } };
  (text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean).forEach((line) => {
    const bullet = line.match(/^[•●▪◦*\-–]\s*(.+)$/);
    if (bullet) { list.push(`<li>${emphasize(bullet[1])}</li>`); return; }
    flush();
    if (line.endsWith(":") && line.length < 60) out.push(`<h4>${esc(line.slice(0, -1))}</h4>`);
    else out.push(`<p>${emphasize(line)}</p>`);
  });
  flush();
  return out.join("");
}

/* -------------------- layout -------------------- */

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
function longDate(d) {
  if (!d) return "";
  const date = typeof d === "string" && d.length === 10 ? new Date(`${d}T00:00:00`) : new Date(d);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
function daysBetween(from, to) {
  const a = new Date(from); a.setHours(0, 0, 0, 0);
  const b = new Date(`${String(to).slice(0, 10)}T00:00:00`);
  return Math.round((b - a) / 86400000);
}
function formatPhone(contact) {
  const digits = (contact || "").replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return contact || "";
}

const PX_PER_MM = 96 / 25.4;
const PAGE_MARGIN_MM = 14; // espaço em cima e embaixo de cada página (a moldura fica a 7 mm)
const PAPER = [244, 239, 232];
const FRAME = [217, 187, 163];

const CSS = `
.qdoc { width: 794px; padding: 0 72px; background: #F4EFE8; color: #4E2433; font-family: "Jost", "Helvetica Neue", Arial, sans-serif; box-sizing: border-box; }
.qdoc * { box-sizing: border-box; margin: 0; padding: 0; }
.qdoc .head { text-align: center; padding-top: 4px; }
.qdoc .head img { width: 128px; display: block; margin: 0 auto; }
.qdoc .store { font-family: "Cormorant Garamond", Georgia, serif; font-size: 30px; font-weight: 600; }
.qdoc .orn { display: flex; align-items: center; justify-content: center; margin: 6px auto 0; width: 264px; }
.qdoc .orn span { flex: 1; height: 1px; background: #CFA88A; }
.qdoc .orn i { width: 6px; height: 6px; background: #B07A55; transform: rotate(45deg); margin: 0 10px; }
.qdoc .title { text-align: center; margin: 10px 0 14px; }
.qdoc .title h1 { font-family: "Cormorant Garamond", Georgia, serif; font-style: italic; font-weight: 400; font-size: 38px; line-height: 1.1; }
.qdoc .title p { font-size: 9.5px; letter-spacing: 3.5px; text-transform: uppercase; color: #B07A55; margin-top: 6px; }
.qdoc .meta { display: flex; border-top: 1px solid #D9BBA3; border-bottom: 1px solid #D9BBA3; padding: 11px 0; margin-bottom: 12px; }
.qdoc .meta > div { flex: 1; }
.qdoc .meta > div:first-child { flex: 1.4; }
.qdoc .meta > div + div { border-left: 1px solid #D9BBA3; padding-left: 22px; }
.qdoc .lbl { display: block; font-size: 8px; letter-spacing: 2.6px; text-transform: uppercase; color: #B07A55; margin-bottom: 5px; font-weight: 500; }
.qdoc .meta strong { font-family: "Cormorant Garamond", Georgia, serif; font-size: 19px; font-weight: 600; display: block; line-height: 1.2; }
.qdoc .meta small { font-size: 11px; color: #8A7A74; }
.qdoc .ihead { display: flex; justify-content: space-between; padding: 0 4px 2px; }
.qdoc .item { display: flex; align-items: center; padding: 7px 4px; border-bottom: 1px solid #E6DCD0; }
.qdoc .item.last { border-bottom: none; }
.qdoc .photo { width: 82px; height: 82px; border-radius: 3px; flex-shrink: 0; box-shadow: 0 6px 16px rgba(78,36,51,.18); }
.qdoc .nophoto { width: 82px; height: 82px; border-radius: 3px; flex-shrink: 0; background: #E6DCD0; display: flex; align-items: center; justify-content: center; }
.qdoc .nophoto i { width: 8px; height: 8px; background: #CFA88A; transform: rotate(45deg); }
.qdoc .info { flex: 1; padding: 0 22px 0 26px; min-width: 0; }
.qdoc .code { font-size: 8.5px; letter-spacing: 2.4px; color: #B07A55; font-weight: 500; }
.qdoc .item h3 { font-family: "Cormorant Garamond", Georgia, serif; font-weight: 500; font-size: 23px; line-height: 1.15; margin: 2px 0 1px; }
.qdoc .variant { font-family: "Cormorant Garamond", Georgia, serif; font-style: italic; font-size: 15px; color: #7A5560; }
.qdoc .qty { display: block; font-size: 10.5px; color: #8A7A74; margin-top: 5px; }
.qdoc .price { text-align: right; white-space: nowrap; }
.qdoc .price .now { font-family: "Cormorant Garamond", Georgia, serif; font-size: 21px; font-weight: 500; display: block; }
.qdoc .price .was { font-size: 10.5px; color: #8A7A74; text-decoration: line-through; display: block; }
.qdoc .price .badge { display: inline-block; font-size: 8px; letter-spacing: 1.6px; font-weight: 500; color: #F4EFE8; background: #B07A55; padding: 3px 6px 2px; border-radius: 2px; margin-top: 3px; }
.qdoc .totals { width: 295px; margin: 6px 0 0 auto; }
.qdoc .sumrow { display: flex; justify-content: space-between; align-items: baseline; padding: 3px 4px; font-size: 11px; color: #7A5560; }
.qdoc .sumrow span:last-child { font-family: "Cormorant Garamond", Georgia, serif; font-size: 16px; color: #4E2433; }
.qdoc .sumrow.disc span:last-child { color: #B07A55; }
.qdoc .total { background: #4E2433; color: #F4EFE8; padding: 11px 24px; display: flex; align-items: center; justify-content: space-between; border-radius: 2px; margin-top: 6px; }
.qdoc .total .lbl { color: #D9BBA3; margin: 0; }
.qdoc .total strong { font-family: "Cormorant Garamond", Georgia, serif; font-size: 30px; font-weight: 500; }
.qdoc .note { text-align: right; font-size: 10px; color: #8A7A74; margin-top: 8px; }
.qdoc .saving { text-align: right; font-family: "Cormorant Garamond", Georgia, serif; font-style: italic; font-size: 15px; color: #B07A55; margin-top: 8px; }
.qdoc .texts { display: flex; margin-top: 12px; padding-top: 12px; border-top: 1px solid #D9BBA3; align-items: flex-start; }
.qdoc .texts > div { flex: 1; min-width: 0; }
.qdoc .texts > div + div { margin-left: 26px; }
.qdoc .box { background: #E9DFD3; padding: 13px 17px 7px; border-radius: 2px; }
.qdoc .texts h4 { font-size: 8px; letter-spacing: 2.4px; text-transform: uppercase; color: #B07A55; font-weight: 500; margin: 8px 0 5px; }
.qdoc .texts .lbl + h4, .qdoc .texts h4:first-child { margin-top: 0; }
.qdoc .texts ul { list-style: none; margin-bottom: 4px; }
.qdoc .texts li { position: relative; padding-left: 12px; font-size: 9.6px; line-height: 1.45; color: #7A5560; margin-bottom: 4px; }
.qdoc .texts li::before { content: ""; position: absolute; left: 0; top: 5px; width: 4px; height: 4px; background: #B07A55; transform: rotate(45deg); }
.qdoc .texts p { font-size: 9.8px; line-height: 1.5; color: #7A5560; margin-bottom: 5px; }
.qdoc .texts b { color: #4E2433; font-weight: 500; }
.qdoc .box li, .qdoc .box p { font-size: 9.3px; }
.qdoc .thanks { text-align: center; font-family: "Cormorant Garamond", Georgia, serif; font-style: italic; font-size: 20px; padding: 16px 0 4px; }
`;

function buildHtml(quote, calc, assets) {
  const hasItemDiscount = calc.lines.some((l) => l.discount_percent > 0);
  const hasDiscount = calc.saved > 0;
  const pieces = calc.lines.reduce((s, l) => s + (Number(l.qty) || 0), 0);
  const validDays = quote.valid_until ? daysBetween(quote.created_at || Date.now(), quote.valid_until) : null;

  const items = calc.lines.map((l, i) => {
    const { code, name, variant } = splitProductName(l.name);
    const thumb = assets.thumbs[i];
    return `
      <div class="item${i === calc.lines.length - 1 ? " last" : ""}" data-break>
        ${thumb ? `<img class="photo" src="${thumb}">` : `<div class="nophoto"><i></i></div>`}
        <div class="info">
          ${code ? `<span class="code">${esc(code)}</span>` : ""}
          <h3>${esc(name)}</h3>
          ${variant ? `<span class="variant">${esc(variant)}</span>` : ""}
          <span class="qty">${l.qty} un. &times; ${brl(l.unitNet)}</span>
        </div>
        <div class="price">
          ${l.discount_percent > 0 ? `<span class="was">${brl(l.gross)}</span>` : ""}
          <span class="now">${brl(l.net)}</span>
          ${l.discount_percent > 0 ? `<span class="badge">&minus;${String(l.discount_percent).replace(".", ",")}%</span>` : ""}
        </div>
      </div>`;
  }).join("");

  const totalPct = quote.discount_type === "percent" && Number(quote.discount_value) > 0 ? ` (${String(Number(quote.discount_value)).replace(".", ",")}%)` : "";
  const totals = `
    <div class="totals" data-break>
      ${hasDiscount ? `
        <div class="sumrow"><span>Valor das peças</span><span>${brl(calc.gross)}</span></div>
        ${calc.itemsDiscount > 0 ? `<div class="sumrow disc"><span>${calc.totalDiscount > 0 ? "Desconto nas peças" : "Desconto"}</span><span>&minus; ${brl(calc.itemsDiscount)}</span></div>` : ""}
        ${calc.totalDiscount > 0 ? `<div class="sumrow disc"><span>Desconto especial${totalPct}</span><span>&minus; ${brl(calc.totalDiscount)}</span></div>` : ""}` : ""}
      <div class="total"><span class="lbl">Total</span><strong>${brl(calc.total)}</strong></div>
      ${hasDiscount
        ? `<p class="saving">Você economiza ${brl(calc.saved)} neste orçamento</p>`
        : `<p class="note">${pieces} ${pieces === 1 ? "peça" : "peças"}</p>`}
    </div>`;

  const notes = fillPlaceholders(quote.notes, { clientName: quote.client_name, total: calc.total });
  const conditions = (quote.general_conditions || "").trim();
  const notesHtml = notes.trim()
    ? `<div>${/^[^\n]{1,58}:\s*\n/.test(notes.trim()) ? "" : `<span class="lbl">Pagamento e observações</span>`}${textToHtml(notes)}</div>` : "";
  const condHtml = conditions ? `<div class="box"><span class="lbl">Condições gerais</span>${textToHtml(conditions)}</div>` : "";
  const texts = notesHtml || condHtml ? `<div class="texts" data-break>${notesHtml}${condHtml}</div>` : "";

  return `
    <div class="qdoc">
      <div class="head">
        ${assets.logo ? `<img src="${assets.logo.src}">` : `<div class="store">${esc(quote.ownerName || "")}</div>`}
        <div class="orn"><span></span><i></i><span></span></div>
      </div>
      <div class="title"><h1>Orçamento</h1><p>Peças feitas à mão, com carinho</p></div>
      <div class="meta">
        <div><span class="lbl">Preparado para</span><strong>${esc(quote.client_name || "—")}</strong>${quote.client_contact ? `<small>${esc(formatPhone(quote.client_contact))}</small>` : ""}</div>
        <div><span class="lbl">Emitido em</span><strong>${longDate(quote.created_at || Date.now())}</strong></div>
        ${quote.valid_until ? `<div><span class="lbl">Válido até</span><strong>${longDate(quote.valid_until)}</strong>${validDays > 0 ? `<small>${validDays} ${validDays === 1 ? "dia" : "dias"}</small>` : ""}</div>` : ""}
      </div>
      <div class="ihead" data-break><span class="lbl">Peças</span><span class="lbl">Valor${hasItemDiscount ? "" : ""}</span></div>
      ${items}
      ${totals}
      ${texts}
      <p class="thanks" data-break data-thanks>Obrigada pela confiança</p>
    </div>`;
}

/* -------------------- PDF -------------------- */

let fontsReady = null;
function ensureFonts() {
  if (!fontsReady) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@400;500&display=swap";
    document.head.appendChild(link);
    fontsReady = new Promise((resolve) => { link.onload = resolve; link.onerror = resolve; })
      .then(() => Promise.all([
        '400 20px "Cormorant Garamond"', 'italic 400 20px "Cormorant Garamond"', '500 20px "Cormorant Garamond"',
        '600 20px "Cormorant Garamond"', 'italic 500 20px "Cormorant Garamond"', '400 12px "Jost"', '500 12px "Jost"',
      ].map((f) => document.fonts.load(f).catch(() => null))))
      .catch(() => null);
  }
  // internet lenta não pode travar o PDF: depois de 6 s segue com as fontes que tiver
  return Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 6000))]);
}

/**
 * Gera e baixa o PDF. `quote`: { client_name, client_contact, created_at,
 * valid_until, notes, items: [{ name, qty, unit_price, discount_percent, image_url }],
 * discount_type, discount_value, general_conditions, ownerName, logoUrl }.
 */
export async function downloadQuotePdf(quote) {
  const calc = computeQuote(quote.items, quote.discount_type, quote.discount_value);
  const [logo, thumbs] = await Promise.all([
    quote.logoUrl ? loadLogo(quote.logoUrl) : null,
    Promise.all(calc.lines.map((l) => (l.image_url ? loadThumb(l.image_url) : null))),
    ensureFonts(),
  ]);

  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-10000px;top:0;z-index:-1;";
  host.innerHTML = `<style>${CSS}</style>${buildHtml(quote, calc, { logo, thumbs })}`;
  document.body.appendChild(host);
  try {
    const doc = host.querySelector(".qdoc");
    await Promise.all([...doc.querySelectorAll("img")].map((img) => (img.complete ? null : new Promise((r) => { img.onload = r; img.onerror = r; }))));

    // pontos onde dá pra quebrar a página sem cortar uma peça no meio
    const top = doc.getBoundingClientRect().top;
    const breaks = [...doc.querySelectorAll("[data-break]")].map((el) => el.getBoundingClientRect().top - top);
    const totalH = doc.offsetHeight;
    const pageH = (297 - 2 * PAGE_MARGIN_MM) * PX_PER_MM;
    const slices = [];
    for (let start = 0; start < totalH - 1;) {
      let end = Math.min(start + pageH, totalH);
      if (end < totalH) {
        const fits = breaks.filter((b) => b > start + 40 && b <= end);
        if (fits.length) end = Math.max(...fits);
      }
      slices.push([start, end]);
      start = end;
    }
    // o "Obrigada" sozinho numa página nova não vale uma folha a mais
    const thanksTop = doc.querySelector("[data-thanks]").getBoundingClientRect().top - top;
    if (slices.length > 1 && slices[slices.length - 1][0] >= thanksTop - 1) slices.pop();

    const scale = 2;
    const canvas = await html2canvas(doc, { scale, backgroundColor: "#F4EFE8", useCORS: true, logging: false });
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    slices.forEach(([start, end], i) => {
      if (i > 0) pdf.addPage();
      pdf.setFillColor(...PAPER);
      pdf.rect(0, 0, 210, 297, "F");
      const piece = document.createElement("canvas");
      piece.width = canvas.width;
      piece.height = Math.round((end - start) * scale);
      piece.getContext("2d").drawImage(canvas, 0, Math.round(start * scale), canvas.width, piece.height, 0, 0, canvas.width, piece.height);
      pdf.addImage(piece.toDataURL("image/jpeg", 0.92), "JPEG", 0, PAGE_MARGIN_MM, 210, (end - start) / PX_PER_MM);
      pdf.setDrawColor(...FRAME);
      pdf.setLineWidth(0.25);
      pdf.rect(7, 7, 196, 283);
      if (slices.length > 1) {
        pdf.setFontSize(7.5);
        pdf.setTextColor(176, 122, 85);
        pdf.text(`${i + 1} / ${slices.length}`, 105, 293.5, { align: "center" });
      }
    });
    pdf.save(`orcamento-${(quote.client_name || "cliente").trim().replace(/\s+/g, "-").toLowerCase()}.pdf`);
  } finally {
    host.remove();
  }
}
