// Camada de dados — busca e mutações do Supabase, usadas pelas páginas.
// Cada página busca só o que precisa, quando é aberta (nada é pré-carregado
// globalmente no login).
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import { computeProductCost } from "./pricing.js";

/* -------------------- BUSCAS -------------------- */

/** Produtos não excluídos. */
export function activeProducts(products) {
  return products.filter((p) => !p.deleted_at);
}

export async function fetchMaterials() {
  const { data } = await supabase.from("materials").select("*").order("name");
  return data || [];
}

/**
 * Traz TODOS os produtos, inclusive os excluídos (`deleted_at` preenchido) —
 * eles continuam no banco pra que vendas antigas ainda achem o produto
 * (histórico e lucro). Use `activeProducts()` pra listar só os que valem.
 */
export async function fetchProductsFull() {
  const [{ data: prods }, { data: pMats }, { data: kitItems }] = await Promise.all([
    supabase.from("products").select("*").order("name"),
    supabase.from("product_materials").select("*"),
    supabase.from("product_kit_items").select("*"),
  ]);
  return (prods || []).map((p) => ({
    ...p,
    bom: (pMats || []).filter((b) => b.product_id === p.id).map((b) => ({ material_id: b.material_id, qty: b.qty })),
    kitItems: (kitItems || []).filter((k) => k.kit_product_id === p.id).map((k) => ({ item_product_id: k.item_product_id, qty: k.qty })),
  }));
}

export async function fetchSettings() {
  const { data } = await supabase.from("settings").select("*").single();
  return data || null;
}

export async function fetchCategories() {
  const { data } = await supabase.from("categories").select("*").order("name");
  return data || [];
}

export async function fetchQuotes(limit = 10) {
  const { data } = await supabase.from("quotes").select("*").order("created_at", { ascending: false }).limit(limit);
  return data || [];
}

export async function fetchSales(limit = 2000) {
  const { data } = await supabase.from("sales").select("*").order("sold_at", { ascending: false }).limit(limit);
  return data || [];
}

/** Todas as vendas já registradas (sem filtro de data) — usado pra calcular o lucro acumulado e acompanhar quanto do investimento inicial já voltou. */
export async function fetchAllSales() {
  const { data } = await supabase.from("sales").select("*").eq("type", "venda");
  return data || [];
}


/** Saídas sem venda (presente, brinde, divulgação, perda) desde a data — só informativo, não entra no lucro. */
export async function fetchStockExitsSince(sinceDate) {
  const { data } = await supabase
    .from("sales")
    .select("*")
    .neq("type", "venda")
    .gte("sold_at", sinceDate.toISOString());
  return data || [];
}

export async function fetchSalesSince(sinceDate) {
  const { data } = await supabase
    .from("sales")
    .select("*")
    .eq("type", "venda")
    .gte("sold_at", sinceDate.toISOString())
    .order("sold_at", { ascending: false });
  return data || [];
}

/**
 * Hook compartilhado por páginas que precisam de materiais + produtos + configurações.
 * `loading` só é true na primeira busca (mostra o esqueleto da página inteira);
 * chamadas de `reload()` depois disso (após salvar/excluir) marcam `refreshing`,
 * pra a página mostrar só um spinner discreto em vez de recarregar tudo.
 */
export function useCatalogData() {
  const [materials, setMaterials] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const loadedOnce = useRef(false);

  const reload = useCallback(async () => {
    if (loadedOnce.current) setRefreshing(true);
    const [mats, prods, st] = await Promise.all([fetchMaterials(), fetchProductsFull(), fetchSettings()]);
    setMaterials(mats);
    setAllProducts(prods);
    setSettings(st);
    loadedOnce.current = true;
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // `products` = só os ativos (listagens); `allProducts` inclui os excluídos (vendas antigas).
  const products = useMemo(() => activeProducts(allProducts), [allProducts]);
  return { materials, products, allProducts, settings, loading, refreshing, reload };
}

/* -------------------- MUTAÇÕES -------------------- */

export async function saveMaterial(ownerId, m) {
  const payload = { ...m, owner_id: ownerId };
  if (m.id) {
    const { id, ...rest } = payload;
    return supabase.from("materials").update(rest).eq("id", id);
  }
  return supabase.from("materials").insert(payload);
}

export async function deleteMaterial(id) {
  return supabase.from("materials").delete().eq("id", id);
}

export async function saveCategory(nicheId, c) {
  const payload = { name: c.name, niche_id: nicheId };
  if (c.id) return supabase.from("categories").update(payload).eq("id", c.id);
  return supabase.from("categories").insert(payload);
}

export async function deleteCategory(id) {
  return supabase.from("categories").delete().eq("id", id);
}

export async function saveProduct(ownerId, nicheId, p) {
  const { bom, kitItems, niches: _n, ...rest } = p;
  const payload = { ...rest, owner_id: ownerId, niche_id: nicheId };
  let productId = p.id;
  if (productId) {
    const { id, ...upd } = payload;
    const { error } = await supabase.from("products").update(upd).eq("id", id);
    if (error) return { error };
    await supabase.from("product_materials").delete().eq("product_id", id);
    await supabase.from("product_kit_items").delete().eq("kit_product_id", id);
  } else {
    const { data, error } = await supabase.from("products").insert(payload).select().single();
    if (error) return { error };
    productId = data.id;
  }
  if ((bom || []).length) {
    await supabase.from("product_materials").insert(bom.map((b) => ({ product_id: productId, material_id: b.material_id, qty: b.qty })));
  }
  if ((kitItems || []).length) {
    await supabase.from("product_kit_items").insert(kitItems.map((k) => ({ kit_product_id: productId, item_product_id: k.item_product_id, qty: k.qty })));
  }
  return { error: null };
}

/**
 * Exclusão "lógica": marca `deleted_at` em vez de apagar a linha, pra que as
 * vendas já registradas do produto continuem no histórico. Bloqueia se o
 * produto ainda faz parte de algum kit ativo.
 */
export async function deleteProduct(id) {
  const { data: usages, error: usageError } = await supabase.from("product_kit_items").select("kit_product_id").eq("item_product_id", id);
  if (usageError) return { error: usageError };
  const kitIds = [...new Set((usages || []).map((u) => u.kit_product_id))];
  if (kitIds.length) {
    const { data: kits, error: kitsError } = await supabase.from("products").select("name").in("id", kitIds).is("deleted_at", null);
    if (kitsError) return { error: kitsError };
    if ((kits || []).length) {
      return { error: { message: `Este produto faz parte do kit "${kits[0].name}". Remova-o do kit antes de excluir.` } };
    }
  }
  return supabase.from("products").update({ deleted_at: new Date().toISOString() }).eq("id", id);
}

/**
 * Materiais que saem do estoque ao colocar `units` peças prontas no estoque:
 * quantidade da ficha técnica × unidades (sem a % de perda, que é só
 * estimativa de custo). Materiais antigos ficam de fora.
 */
export function materialUsage(product, units, materials) {
  if (!(units > 0)) return [];
  const byId = Object.fromEntries(materials.map((m) => [m.id, m]));
  const totals = new Map();
  (product.bom || []).forEach((b) => {
    const m = byId[b.material_id];
    if (!m || m.is_old_material) return;
    totals.set(m.id, (totals.get(m.id) || 0) + Number(b.qty) * units);
  });
  return [...totals].map(([id, qty]) => ({ material: byId[id], qty }));
}

/** Soma o uso de materiais de várias listas de `materialUsage`. */
export function mergeUsage(lists) {
  const totals = new Map();
  lists.flat().forEach((u) => {
    const cur = totals.get(u.material.id);
    totals.set(u.material.id, { material: u.material, qty: (cur?.qty || 0) + u.qty });
  });
  return [...totals.values()];
}

/**
 * Quantas unidades do produto ainda não tiveram os materiais descontados ao
 * salvar com `newStock`. Produto novo: todo o estoque. Produto que já
 * descontou (`materials_deducted`, ou que veio do antigo "Produzir"): só o
 * que aumentou. Produto antigo que nunca descontou: o estoque inteiro.
 */
export function unitsToDeduct(original, newStock) {
  const stock = Number(newStock) || 0;
  if (!original?.id) return stock;
  if (original.materials_deducted || Number(original.produced_count) > 0) {
    return Math.max(0, stock - (Number(original.stock_qty) || 0));
  }
  return stock;
}

/** Tira do estoque de materiais o uso calculado (lê o estoque atual do banco antes). */
export async function deductMaterials(usage) {
  if (!usage.length) return { error: null };
  const { data, error } = await supabase.from("materials").select("id, stock").in("id", usage.map((u) => u.material.id));
  if (error) return { error };
  for (const u of usage) {
    const cur = (data || []).find((d) => d.id === u.material.id);
    if (!cur) continue;
    const stock = Math.round((Number(cur.stock) - u.qty) * 1000) / 1000;
    const { error: updError } = await supabase.from("materials").update({ stock }).eq("id", cur.id);
    if (updError) return { error: updError };
  }
  return { error: null };
}

/** Marca produtos como já tendo os materiais do estoque atual descontados. */
export async function markMaterialsDeducted(productIds) {
  if (!productIds.length) return { error: null };
  return supabase.from("products").update({ materials_deducted: true }).in("id", productIds);
}

/** "Nome - Cor" quando o produto tem cor (variações duplicadas têm o mesmo nome). */
export function productLabel(product) {
  if (!product) return "";
  return product.color ? `${product.name.trim()} - ${product.color}` : product.name;
}

/** Produto com pelo menos um material antigo (sem estoque real) na ficha técnica não tem como ter o estoque controlado de verdade. */
export function usesOldMaterial(product, materials) {
  return (product.bom || []).some((b) => materials.find((m) => m.id === b.material_id)?.is_old_material);
}

/**
 * Tipos de saída do estoque. Só "venda" tem valor cobrado e entra em
 * faturamento/lucro; os demais só tiram a peça do estoque.
 * "remocao" é o nome antigo no banco pra perda/defeito.
 */
export const SALE_TYPES = [
  { value: "venda", label: "Venda" },
  { value: "presente", label: "Presente" },
  { value: "brinde", label: "Brinde" },
  { value: "divulgacao", label: "Divulgação" },
  { value: "remocao", label: "Perda/defeito" },
];

export function saleTypeLabel(type) {
  return SALE_TYPES.find((t) => t.value === type)?.label || type;
}

/** Registra uma saída de estoque (venda, presente, brinde, divulgação ou perda) na data informada. */
export async function registerStockExit({ ownerId, product, qty, totalPrice, notes, type, soldAt }) {
  const available = product.stock_qty || 0;
  if (qty > available) return { error: { message: `Só tem ${available} unidade(s) em estoque.` } };

  const { error } = await supabase.from("sales").insert({
    owner_id: ownerId, product_id: product.id, qty, type, notes: notes || null,
    total_price: type === "venda" ? totalPrice : 0,
    ...(soldAt ? { sold_at: soldAt } : {}),
  });
  if (error) return { error };
  await supabase.from("products").update({ stock_qty: available - qty, sold_count: (product.sold_count || 0) + qty }).eq("id", product.id);
  return { error: null };
}

/**
 * Edita um registro do histórico (tipo, quantidade, valor, data, observação).
 * Se a quantidade mudar, a diferença sai (ou volta) do estoque do produto.
 */
export async function updateSale(sale, product, changes) {
  const delta = Number(changes.qty) - Number(sale.qty);
  if (product && delta > 0 && delta > (product.stock_qty || 0)) {
    return { error: { message: `Só tem ${product.stock_qty || 0} unidade(s) a mais em estoque.` } };
  }
  const { error } = await supabase.from("sales").update({
    type: changes.type,
    qty: changes.qty,
    total_price: changes.type === "venda" ? changes.totalPrice : 0,
    sold_at: changes.soldAt,
    notes: changes.notes || null,
  }).eq("id", sale.id);
  if (error) return { error };
  if (product && delta !== 0) {
    await supabase.from("products").update({
      stock_qty: (product.stock_qty || 0) - delta,
      sold_count: Math.max(0, (product.sold_count || 0) + delta),
    }).eq("id", product.id);
  }
  return { error: null };
}

export async function deleteSale(sale, product) {
  const { error } = await supabase.from("sales").delete().eq("id", sale.id);
  if (error) return { error };
  if (product) {
    await supabase.from("products").update({
      stock_qty: (product.stock_qty || 0) + sale.qty,
      sold_count: Math.max(0, (product.sold_count || 0) - sale.qty),
    }).eq("id", product.id);
  }
  return { error: null };
}

export async function saveSettingsRow(ownerId, s) {
  return supabase.from("settings").update(s).eq("owner_id", ownerId);
}

export async function updateProfileLogo(ownerId, logoUrl) {
  return supabase.from("profiles").update({ logo_url: logoUrl }).eq("id", ownerId);
}

/* -------------------- CATÁLOGO PÚBLICO -------------------- */

/** Link público do catálogo do vendedor. */
export function catalogUrl(slug) {
  return `${window.location.origin}/?catalogo=${encodeURIComponent(slug)}`;
}

/** Endereço do catálogo: minúsculas, sem acento, só letras/números/hífen. */
export function slugify(text) {
  return (text || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

/** WhatsApp só com dígitos; número brasileiro sem DDI ganha o 55. */
export function normalizeWhatsapp(text) {
  const digits = (text || "").replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
}

/** Catálogo público (sem login) — só os campos liberados pela função do banco. */
export async function fetchPublicCatalog(slug) {
  const { data, error } = await supabase.rpc("get_public_catalog", { p_slug: slug });
  return { data, error };
}

/**
 * O preço de venda é calculado no navegador (materiais + mão de obra +
 * margem…), mas o catálogo público só lê o banco — então grava o preço atual
 * em `catalog_price` dos produtos do catálogo. Chamado depois de salvar
 * produto, kit, material ou configurações (qualquer coisa que mude preço).
 */
export async function syncCatalogPrices() {
  const [materials, products, settings] = await Promise.all([fetchMaterials(), fetchProductsFull(), fetchSettings()]);
  if (!settings) return;
  const changed = activeProducts(products)
    .filter((p) => p.show_in_catalog)
    .map((p) => ({ id: p.id, old: p.catalog_price, price: Math.round(computeProductCost(p, materials, products, settings).finalPrice * 100) / 100 }))
    .filter((r) => r.old == null || Number(r.old) !== r.price);
  await Promise.all(changed.map((r) => supabase.from("products").update({ catalog_price: r.price }).eq("id", r.id)));
}

export async function fetchReminders() {
  const { data } = await supabase.from("reminders").select("*").order("done", { ascending: true }).order("created_at", { ascending: false });
  return data || [];
}

export async function addReminder(ownerId, text) {
  return supabase.from("reminders").insert({ owner_id: ownerId, text });
}

export async function toggleReminder(id, done) {
  return supabase.from("reminders").update({ done }).eq("id", id);
}

export async function deleteReminder(id) {
  return supabase.from("reminders").delete().eq("id", id);
}

export async function updateDashboardWidgets(ownerId, widgetIds) {
  return supabase.from("settings").update({ dashboard_widgets: widgetIds }).eq("owner_id", ownerId);
}
