// Camada de dados — busca e mutações do Supabase, usadas pelas páginas.
// Cada página busca só o que precisa, quando é aberta (nada é pré-carregado
// globalmente no login).
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import { computeProductCost } from "./pricing.js";

/* -------------------- BUSCAS -------------------- */

export async function fetchMaterials() {
  const { data } = await supabase.from("materials").select("*").order("name");
  return data || [];
}

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

/** Soma o lucro de toda a produção já registrada (sem filtro de data) — usado pra acompanhar quanto do investimento inicial já voltou em vendas. */
export async function fetchAllTimeProfit() {
  const { data } = await supabase.from("production_log").select("qty, cost_snapshot");
  return (data || []).reduce((sum, log) => {
    const profit = log.cost_snapshot?.profit;
    return sum + (typeof profit === "number" ? profit * log.qty : 0);
  }, 0);
}

export async function fetchProductionLogSince(sinceDate) {
  const { data } = await supabase
    .from("production_log")
    .select("*")
    .gte("produced_at", sinceDate.toISOString())
    .order("produced_at", { ascending: false });
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
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const loadedOnce = useRef(false);

  const reload = useCallback(async () => {
    if (loadedOnce.current) setRefreshing(true);
    const [mats, prods, st] = await Promise.all([fetchMaterials(), fetchProductsFull(), fetchSettings()]);
    setMaterials(mats);
    setProducts(prods);
    setSettings(st);
    loadedOnce.current = true;
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { materials, products, settings, loading, refreshing, reload };
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

export async function deleteProduct(id) {
  return supabase.from("products").delete().eq("id", id);
}

export async function produceProduct({ ownerId, product, qty, materials, products, settings }) {
  const missing = [];
  (product.bom || []).forEach((b) => {
    const mat = materials.find((m) => m.id === b.material_id);
    if (mat && mat.stock < b.qty * qty) missing.push(mat.name);
  });
  if (missing.length) return { error: { message: `Estoque insuficiente: ${missing.join(", ")}` } };

  for (const b of product.bom || []) {
    const mat = materials.find((m) => m.id === b.material_id);
    if (!mat) continue;
    await supabase.from("materials").update({ stock: Math.round((mat.stock - b.qty * qty) * 1000) / 1000 }).eq("id", mat.id);
  }
  await supabase.from("products").update({ produced_count: (product.produced_count || 0) + qty }).eq("id", product.id);
  const calc = computeProductCost(product, materials, products, settings);
  await supabase.from("production_log").insert({
    owner_id: ownerId,
    product_id: product.id,
    qty,
    cost_snapshot: { subtotal: calc.subtotal, finalPrice: calc.finalPrice, profit: calc.profit },
  });
  return { error: null };
}

export async function saveSettingsRow(ownerId, s) {
  return supabase.from("settings").update(s).eq("owner_id", ownerId);
}

export async function updateProfileLogo(ownerId, logoUrl) {
  return supabase.from("profiles").update({ logo_url: logoUrl }).eq("id", ownerId);
}

export async function updateDashboardWidgets(ownerId, widgetIds) {
  return supabase.from("settings").update({ dashboard_widgets: widgetIds }).eq("owner_id", ownerId);
}
