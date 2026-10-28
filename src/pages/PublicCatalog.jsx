// Catálogo público do vendedor (abre sem login, em /?catalogo=<endereço>).
// O cliente vê os produtos liberados, monta uma lista e pede orçamento pelo
// WhatsApp do vendedor — nada é gravado no banco.
import React, { useEffect, useMemo, useState } from "react";
import { Search, ShoppingBag, Plus, Minus, X, MessageCircle, Ruler, Layers } from "lucide-react";
import { Carousel, Modal, Button, inputStyle } from "../components/ui.jsx";
import { FALLBACK_THEME, SERIF } from "../theme";
import { brl } from "../pricing.js";
import { fetchPublicCatalog, productLabel } from "../data.js";

function loadCart(slug) {
  try { return JSON.parse(localStorage.getItem(`catalogo-carrinho:${slug}`)) || {}; } catch { return {}; }
}
function saveCart(slug, cart) {
  try { localStorage.setItem(`catalogo-carrinho:${slug}`, JSON.stringify(cart)); } catch { /* sem armazenamento: o carrinho só vale nesta visita */ }
}

export default function PublicCatalog({ slug }) {
  const [catalog, setCatalog] = useState(undefined); // undefined = carregando, null = não encontrado
  const [q, setQ] = useState("");
  const [cart, setCart] = useState(() => loadCart(slug)); // { productId: qty }
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetchPublicCatalog(slug).then(({ data }) => setCatalog(data || null));
  }, [slug]);

  useEffect(() => { saveCart(slug, cart); }, [slug, cart]);

  const store = catalog?.store;
  const theme = store?.theme && store.theme.primary ? store.theme : FALLBACK_THEME;

  useEffect(() => {
    if (!store) return;
    document.title = store.name ? `${store.name} — Catálogo` : "Catálogo";
    if (store.logo_url) {
      let link = document.querySelector('link[rel="icon"]');
      if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
      link.href = store.logo_url;
    }
  }, [store]);

  const products = catalog?.products || [];
  const byId = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((p) => [p.name, p.color, p.main_material].some((v) => (v || "").toLowerCase().includes(needle)));
  }, [products, q]);

  // ignora itens do carrinho que saíram do catálogo
  const cartItems = Object.entries(cart).filter(([id, qty]) => byId[id] && qty > 0).map(([id, qty]) => ({ product: byId[id], qty }));
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const setQty = (id, qty) => setCart((c) => {
    const next = { ...c };
    if (qty > 0) next[id] = qty; else delete next[id];
    return next;
  });

  const page = { minHeight: "100vh", background: theme.bg, color: theme.text, fontFamily: "'Manrope', sans-serif" };

  if (catalog === undefined) {
    return <div style={{ ...page, display: "flex", alignItems: "center", justifyContent: "center", color: theme.textMuted, fontSize: 14 }}>Carregando catálogo…</div>;
  }
  if (catalog === null) {
    return (
      <div style={{ ...page, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div>
          <div style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Catálogo não encontrado</div>
          <div style={{ fontSize: 14, color: theme.textMuted }}>Confira o link com quem te enviou.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...page, paddingBottom: cartCount ? 96 : 32 }}>
      <header style={{ background: theme.surface, borderBottom: `1px solid ${theme.border}`, padding: "10px 16px" }}>
        <div style={{ maxWidth: 1068, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          {store.logo_url && (
            <img src={store.logo_url} alt="" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: `1px solid ${theme.border}`, flexShrink: 0 }} />
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, lineHeight: 1.2 }}>{store.name || "Catálogo"}</div>
            <div style={{ fontSize: 12, color: theme.textMuted }}>Escolha os produtos e peça seu orçamento pelo WhatsApp</div>
          </div>
          <button type="button" onClick={() => setShowCart(true)} aria-label="Ver carrinho" title="Ver carrinho"
            style={{ position: "relative", width: 42, height: 42, borderRadius: "50%", border: `1px solid ${theme.border}`, background: theme.surface, color: theme.primary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0 }}>
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <span style={{ position: "absolute", top: -4, right: -4, minWidth: 19, height: 19, padding: "0 5px", borderRadius: 10, background: theme.primary, color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 16px" }}>
        {products.length > 0 && (
          <div style={{ position: "relative", maxWidth: 360, marginBottom: 14 }}>
            <Search size={15} color={theme.textMuted} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar produto…" style={{ ...inputStyle(theme), paddingLeft: 34 }} />
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 230px), 1fr))", gap: 16 }}>
          {filtered.map((p) => (
            <ProductCard key={p.id} theme={theme} product={p} qty={cart[p.id] || 0} onQty={(n) => setQty(p.id, n)} />
          ))}
        </div>

        {products.length === 0 && (
          <div style={{ textAlign: "center", padding: 48, color: theme.textMuted, fontSize: 14 }}>Nenhum produto no catálogo ainda.</div>
        )}
        {products.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 48, color: theme.textMuted, fontSize: 14 }}>Nenhum produto encontrado.</div>
        )}
      </main>

      {cartCount > 0 && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, padding: "12px 16px", background: theme.surface, borderTop: `1px solid ${theme.border}`, boxShadow: "0 -4px 16px rgba(0,0,0,0.06)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <button type="button" onClick={() => setShowCart(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, border: "none", background: "transparent", color: theme.text, cursor: "pointer", padding: "6px 0", fontFamily: "inherit" }}>
              <ShoppingBag size={18} color={theme.primary} /> {cartCount} {cartCount === 1 ? "item" : "itens"}
              <span style={{ fontSize: 12.5, fontWeight: 600, color: theme.primary, textDecoration: "underline" }}>ver</span>
            </button>
            <Button theme={theme} onClick={() => setShowCart(true)}><MessageCircle size={15} /> Pedir orçamento</Button>
          </div>
        </div>
      )}

      {showCart && (
        <CartModal theme={theme} store={store} items={cartItems} onQty={setQty} onClose={() => setShowCart(false)} />
      )}
    </div>
  );
}

function PriceTag({ theme, product, size = 17 }) {
  return product.price != null
    ? <span style={{ fontSize: size, fontWeight: 800, color: theme.primary }}>{brl(product.price)}</span>
    : <span style={{ fontSize: 13, fontWeight: 600, color: theme.textMuted }}>Preço sob consulta</span>;
}

function QtyStepper({ theme, qty, onQty }) {
  const btn = { width: 32, height: 32, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button type="button" onClick={() => onQty(qty - 1)} style={btn} aria-label="Diminuir"><Minus size={14} /></button>
      <span style={{ minWidth: 20, textAlign: "center", fontWeight: 700, fontSize: 14 }}>{qty}</span>
      <button type="button" onClick={() => onQty(qty + 1)} style={btn} aria-label="Aumentar"><Plus size={14} /></button>
    </div>
  );
}

function ProductCard({ theme, product, qty, onQty }) {
  return (
    <div style={{ background: theme.surface, border: `1px solid ${qty ? theme.primary : theme.border}`, borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 8 }}>
        <Carousel theme={theme} images={product.image_urls} height={210} />
      </div>
      <div style={{ padding: "4px 14px 14px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.3 }}>{productLabel(product)}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 12.5, color: theme.textMuted }}>
          {product.main_material && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Layers size={12} /> {product.main_material}</span>}
          {product.dimensions && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Ruler size={12} /> {product.dimensions}</span>}
        </div>
        {product.in_stock && (
          <span style={{ alignSelf: "flex-start", fontSize: 10.5, fontWeight: 800, letterSpacing: 0.4, padding: "3px 7px", borderRadius: 5, background: theme.primarySoft, color: theme.primary }}>PRONTA ENTREGA</span>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: "auto", paddingTop: 8 }}>
          <PriceTag theme={theme} product={product} />
          {qty > 0
            ? <QtyStepper theme={theme} qty={qty} onQty={onQty} />
            : <Button theme={theme} variant="soft" onClick={() => onQty(1)} style={{ height: 34 }}><Plus size={14} /> Quero</Button>}
        </div>
      </div>
    </div>
  );
}

function CartModal({ theme, store, items, onQty, onClose }) {
  const [name, setName] = useState("");
  const allPriced = items.every((i) => i.product.price != null);
  const total = items.reduce((s, i) => s + (i.product.price || 0) * i.qty, 0);

  const send = () => {
    const lines = items.map(({ product, qty }) =>
      `• ${qty}x ${productLabel(product)}${product.price != null ? ` (${brl(product.price)} cada)` : ""}`);
    const msg = [
      "Olá! Vi o catálogo e gostaria de um orçamento:",
      "",
      ...lines,
      ...(allPriced ? ["", `Total: ${brl(total)}`] : []),
      ...(name.trim() ? ["", `Meu nome: ${name.trim()}`] : []),
    ].join("\n");
    window.open(`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  };

  return (
    <Modal theme={theme} title="Seu carrinho" onClose={onClose} width={460}>
      {items.length === 0 && <div style={{ fontSize: 13.5, color: theme.textMuted, marginBottom: 12 }}>Seu carrinho está vazio. Toque em "Quero" nos produtos pra adicionar.</div>}
      {items.map(({ product, qty }) => (
        <div key={product.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", background: theme.surfaceAlt, flexShrink: 0 }}>
            {product.image_urls?.[0] && <img src={product.image_urls[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.3 }}>{productLabel(product)}</div>
            <PriceTag theme={theme} product={product} size={13} />
          </div>
          <QtyStepper theme={theme} qty={qty} onQty={(n) => onQty(product.id, n)} />
          <button type="button" onClick={() => onQty(product.id, 0)} style={{ border: "none", background: "transparent", color: theme.textMuted, cursor: "pointer", padding: 4 }} aria-label="Remover"><X size={15} /></button>
        </div>
      ))}
      {items.length > 0 && allPriced && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, padding: "12px 0 4px" }}>
          <span>Total</span><span style={{ color: theme.primary }}>{brl(total)}</span>
        </div>
      )}
      {items.length > 0 && !allPriced && (
        <div style={{ fontSize: 12.5, color: theme.textMuted, padding: "10px 0 0" }}>Alguns itens têm preço sob consulta — o valor vem na resposta.</div>
      )}
      {items.length > 0 && (
        <>
          <div style={{ margin: "14px 0 6px", fontSize: 12.5, fontWeight: 600, opacity: 0.75 }}>Seu nome (opcional)</div>
          <input style={inputStyle(theme)} value={name} onChange={(e) => setName(e.target.value)} placeholder="Como podemos te chamar?" />
        </>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <Button theme={theme} variant="ghost" onClick={onClose}>Continuar escolhendo</Button>
        {items.length > 0 && (
          <Button theme={theme} onClick={send} disabled={!store.whatsapp}><MessageCircle size={15} /> Enviar pelo WhatsApp</Button>
        )}
      </div>
    </Modal>
  );
}
