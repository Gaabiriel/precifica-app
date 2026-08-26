// Motor de precificação — parametrizado, usado em todo o app.
// Recebe um produto (com bom / kitItems), a lista de materiais, a lista de
// produtos (para resolver kits) e as configurações do usuário.

export function round90(n) {
  if (!isFinite(n) || n <= 0) return 0;
  let base = Math.floor(n) + 0.9;
  if (base < n) base += 1;
  return Math.round(base * 100) / 100;
}

export const brl = (n) =>
  (isFinite(n) ? n : 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Custo de matéria-prima de um produto simples (não-kit), já considerando
 * o percentual de perda/desperdício configurado em cada material.
 */
function materialsCostOf(product, materials) {
  const lines = (product.bom || product.product_materials || []).map((b) => {
    const mat = materials.find((m) => m.id === (b.material_id || b.materialId));
    const waste = mat ? 1 + (mat.waste_percent || 0) / 100 : 1;
    const unitCost = mat ? mat.price * b.qty * waste : 0;
    return { ...b, material: mat, unitCost };
  });
  const materialsCost = lines.reduce((s, l) => s + l.unitCost, 0);
  return { lines, materialsCost };
}

/**
 * Calcula o custo/preço completo de um produto.
 * Para kits (is_kit = true), soma o custo de matéria-prima dos produtos
 * componentes (product_kit_items) em vez de usar o preço de venda deles,
 * evitando cobrar margem em cascata.
 */
export function computeProductCost(product, materials, products, settings) {
  let materialsCost = 0;
  let lines = [];

  if (product.is_kit) {
    const items = product.kitItems || product.product_kit_items || [];
    items.forEach((it) => {
      const child = products.find((p) => p.id === (it.item_product_id || it.itemProductId));
      if (!child) return;
      const childCalc = computeProductCost(child, materials, products, settings);
      materialsCost += childCalc.subtotal * it.qty;
      lines.push({ isChildProduct: true, name: child.name, qty: it.qty, unitCost: childCalc.subtotal * it.qty });
    });
    // materiais extras do próprio kit (ex: embalagem do kit)
    const own = materialsCostOf(product, materials);
    materialsCost += own.materialsCost;
    lines = lines.concat(own.lines);
  } else {
    const own = materialsCostOf(product, materials);
    materialsCost = own.materialsCost;
    lines = own.lines;
  }

  const laborCost = ((product.labor_minutes || 0) / 60) * settings.labor_cost_per_hour;
  const fixedExpenseShare =
    settings.monthly_capacity_units > 0
      ? settings.monthly_fixed_expenses / settings.monthly_capacity_units
      : 0;
  const maintenanceCost = (materialsCost + laborCost) * (settings.maintenance_percent / 100);
  const subtotal = materialsCost + laborCost + fixedExpenseShare + maintenanceCost;

  const margin = product.margin_percent ?? settings.default_margin_percent;
  const priceBeforeFees = subtotal * (1 + margin / 100);
  const cardFee = priceBeforeFees * (settings.card_fee_percent / 100);
  const suggestedPrice = priceBeforeFees + cardFee;
  const roundedPrice = settings.round_to_90 ? round90(suggestedPrice) : suggestedPrice;
  const finalPrice = product.sale_price_override ?? roundedPrice;
  const profit = finalPrice - subtotal;
  const realMarginPercent = subtotal > 0 ? (profit / subtotal) * 100 : 0;

  return {
    lines, materialsCost, laborCost, fixedExpenseShare, maintenanceCost,
    subtotal, margin, cardFee, suggestedPrice, roundedPrice, finalPrice,
    profit, realMarginPercent,
  };
}
