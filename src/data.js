// Camada de dados — busca e mutações do Supabase, usadas pelas páginas.
// Cada página busca só o que precisa, quando é aberta (nada é pré-carregado
// globalmente no login).
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabaseClient";

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

export async function fetchSales(limit = 200) {
  const { data } = await supabase.from("sales").select("*").order("sold_at", { ascending: false }).limit(limit);
  return data || [];
}

/** Todas as vendas já registradas (sem filtro de data) — usado pra calcular o lucro acumulado e acompanhar quanto do investimento inicial já voltou. */
export async function fetchAllSales() {
  const { data } = await supabase.from("sales").select("*").eq("type", "venda");
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

/** "Nome - Cor" quando o produto tem cor (variações duplicadas têm o mesmo nome). */
export function productLabel(product) {
  if (!product) return "";
  return product.color ? `${product.name.trim()} - ${product.color}` : product.name;
}

/** Produto com pelo menos um material antigo (sem estoque real) na ficha técnica não tem como ter o estoque controlado de verdade. */
export function usesOldMaterial(product, materials) {
  return (product.bom || []).some((b) => materials.find((m) => m.id === b.material_id)?.is_old_material);
}

async function registerStockExit({ ownerId, product, qty, totalPrice, notes, type }) {
  const available = product.stock_qty || 0;
  if (qty > available) return { error: { message: `Só tem ${available} unidade(s) em estoque.` } };

  const { error } = await supabase.from("sales").insert({ owner_id: ownerId, product_id: product.id, qty, total_price: totalPrice, type, notes: notes || null });
  if (error) return { error };
  await supabase.from("products").update({ stock_qty: available - qty, sold_count: (product.sold_count || 0) + qty }).eq("id", product.id);
  return { error: null };
}

export async function registerSale({ ownerId, product, qty, totalPrice, notes }) {
  return registerStockExit({ ownerId, product, qty, totalPrice, notes, type: "venda" });
}

export async function removeFromStock({ ownerId, product, qty, notes }) {
  return registerStockExit({ ownerId, product, qty, totalPrice: 0, notes, type: "remocao" });
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
