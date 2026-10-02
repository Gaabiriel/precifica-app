import React from "react";
import { Pencil } from "lucide-react";
import { Modal, Carousel, Row, Button } from "./ui.jsx";
import { brl, computeProductCost } from "../pricing.js";
import { productLabel } from "../data.js";

export default function ProductDetailModal({ theme, product, materials, products, settings, onClose, onEdit }) {
  const calc = computeProductCost(product, materials, products, settings);
  const materialsById = Object.fromEntries(materials.map((m) => [m.id, m]));
  const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
  const sectionTitle = { fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, opacity: 0.6, margin: "16px 0 6px" };

  return (
    <Modal theme={theme} title={productLabel(product)} onClose={onClose} width={520}>
      <div style={{ marginBottom: 14 }}>
        <Carousel theme={theme} images={product.image_urls} height={240} />
      </div>

      {product.main_material && <Row theme={theme} label="Material principal" value={product.main_material} />}
      {product.color && <Row theme={theme} label="Cor" value={product.color} />}
      <Row theme={theme} label="Em estoque" value={`${product.stock_qty || 0} un.`} bold />
      {product.dimensions && <Row theme={theme} label="Dimensões" value={product.dimensions} />}
      {!product.is_kit && <Row theme={theme} label="Tempo de produção" value={`${product.labor_minutes || 0} min`} />}

      <div style={sectionTitle}>Valores</div>
      <Row theme={theme} label="Custo total" value={brl(calc.subtotal)} />
      <Row theme={theme} label="Preço de venda" value={brl(calc.finalPrice)} bold />
      <Row theme={theme} label="Lucro / margem real" value={`${brl(calc.profit)} · ${calc.realMarginPercent.toFixed(0)}%`} tone={theme.good} />

      {product.is_kit && (product.kitItems || []).length > 0 && (
        <>
          <div style={sectionTitle}>Produtos do kit</div>
          {product.kitItems.map((it, i) => (
            <Row key={i} theme={theme} label={productLabel(productsById[it.item_product_id]) || "(produto removido)"} value={`${it.qty}x`} />
          ))}
        </>
      )}

      {(product.bom || []).length > 0 && (
        <>
          <div style={sectionTitle}>{product.is_kit ? "Materiais extras do kit" : "Ficha técnica"}</div>
          {product.bom.map((b, i) => {
            const m = materialsById[b.material_id];
            return <Row key={i} theme={theme} label={m?.name || "(material removido)"} value={`${b.qty} ${m?.unit || ""}`} />;
          })}
        </>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
        <Button theme={theme} variant="ghost" onClick={onClose}>Fechar</Button>
        {onEdit && <Button theme={theme} onClick={onEdit}><Pencil size={13} /> Editar</Button>}
      </div>
    </Modal>
  );
}
