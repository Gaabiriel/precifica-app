import React, { useEffect, useMemo, useRef, useState } from "react";
import { ShoppingBag, Boxes, Percent, AlertTriangle, Wallet, DollarSign, Plus, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, StatCard, Button, Modal } from "../components/ui.jsx";
import { brl, computeProductCost, productionLogValue } from "../pricing.js";
import { fetchMaterials, fetchProductsFull, fetchSettings, fetchProductionLogSince, updateDashboardWidgets } from "../data.js";

const LOW_STOCK_PREVIEW = 5;

const WIDGET_DEFS = {
  produtos: { label: "Produtos cadastrados", build: (ctx) => ({ icon: ShoppingBag, label: "Produtos cadastrados", value: ctx.products.length }) },
  materiais: { label: "Materiais em estoque", build: (ctx) => ({ icon: Boxes, label: "Materiais em estoque", value: ctx.materials.length }) },
  valor_estoque: { label: "Valor em estoque", build: (ctx) => ({ icon: DollarSign, label: "Valor em estoque", value: brl(ctx.stockValue) }) },
  margem: { label: "Margem média real", build: (ctx) => ({ icon: Percent, label: "Margem média real", value: `${ctx.avgMargin.toFixed(0)}%`, tone: ctx.theme.good }) },
  lucro_mes: { label: "Lucro do mês", build: (ctx) => ({ icon: Wallet, label: "Lucro do mês", value: brl(ctx.monthlyProfit), tone: ctx.theme.good }) },
  alertas: { label: "Alertas de estoque baixo", build: (ctx) => ({ icon: AlertTriangle, label: "Alertas de estoque baixo", value: ctx.lowStock.length, tone: ctx.lowStock.length ? ctx.theme.danger : ctx.theme.good }) },
};
const DEFAULT_WIDGETS = ["produtos", "materiais", "margem", "lucro_mes", "alertas"];

export default function Dashboard({ theme, ownerId, showToast }) {
  const [materials, setMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [productionLog, setProductionLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllLowStock, setShowAllLowStock] = useState(false);
  const [widgetOrder, setWidgetOrder] = useState(DEFAULT_WIDGETS);
  const [dragId, setDragId] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    if (!pickerOpen) return;
    const onDocClick = (e) => { if (!pickerRef.current?.contains(e.target)) setPickerOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [pickerOpen]);

  useEffect(() => {
    let cancelled = false;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    Promise.all([fetchMaterials(), fetchProductsFull(), fetchSettings(), fetchProductionLogSince(monthStart)]).then(
      ([mats, prods, st, plog]) => {
        if (cancelled) return;
        setMaterials(mats);
        setProducts(prods);
        setSettings(st);
        setProductionLog(plog);
        setWidgetOrder(Array.isArray(st?.dashboard_widgets) ? st.dashboard_widgets : DEFAULT_WIDGETS);
        setLoading(false);
      }
    );
    return () => { cancelled = true; };
  }, []);

  const persistWidgets = (next) => {
    setWidgetOrder(next);
    updateDashboardWidgets(ownerId, next).then(({ error }) => {
      if (error) showToast("Erro ao salvar personalização do painel.", "err");
    });
  };
  const removeWidget = (id) => persistWidgets(widgetOrder.filter((w) => w !== id));
  const addWidget = (id) => { persistWidgets([...widgetOrder, id]); setPickerOpen(false); };
  const handleDrop = (targetId) => {
    if (!dragId || dragId === targetId) { setDragId(null); return; }
    const next = [...widgetOrder];
    const from = next.indexOf(dragId);
    const to = next.indexOf(targetId);
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    persistWidgets(next);
    setDragId(null);
  };

  const lowStock = useMemo(() => materials.filter((m) => Number(m.stock) <= Number(m.min_stock)), [materials]);
  const stockValue = useMemo(() => materials.reduce((s, m) => s + m.price * m.stock, 0), [materials]);

  const productCosts = useMemo(
    () => (settings ? products.map((p) => ({ product: p, calc: computeProductCost(p, materials, products, settings) })) : []),
    [products, materials, settings]
  );
  const avgMargin = useMemo(() => {
    if (!productCosts.length) return 0;
    return productCosts.reduce((s, p) => s + p.calc.realMarginPercent, 0) / productCosts.length;
  }, [productCosts]);

  const monthlyProfit = useMemo(() => {
    if (!settings) return 0;
    const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
    return (productionLog || []).reduce(
      (sum, log) => sum + productionLogValue(log, productsById[log.product_id], materials, products, settings).profit * log.qty,
      0
    );
  }, [productionLog, products, materials, settings]);

  const chartData = productCosts.slice(0, 8).map((p) => ({
    name: p.product.name.length > 14 ? p.product.name.slice(0, 13) + "…" : p.product.name,
    Custo: Math.round(p.calc.subtotal * 100) / 100,
    Venda: Math.round(p.calc.finalPrice * 100) / 100,
  }));

  if (loading) return <div style={{ color: theme.textMuted, fontSize: 13.5 }}>Carregando painel…</div>;

  const ctx = { materials, products, lowStock, stockValue, avgMargin, monthlyProfit, theme };
  const availableToAdd = Object.keys(WIDGET_DEFS).filter((id) => !widgetOrder.includes(id));

  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        {widgetOrder.map((id) => {
          const def = WIDGET_DEFS[id];
          if (!def) return null;
          return (
            <div
              key={id}
              draggable
              onDragStart={() => setDragId(id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(id)}
              onDragEnd={() => setDragId(null)}
              style={{ position: "relative", flex: "1 1 200px", minWidth: 200, cursor: "grab", opacity: dragId === id ? 0.4 : 1 }}
              title="Arraste para reordenar"
            >
              <button
                onClick={(e) => { e.stopPropagation(); removeWidget(id); }}
                title="Remover card"
                style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: "50%", border: "none", background: theme.surfaceAlt, color: theme.textMuted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2 }}
              >
                <X size={12} />
              </button>
              <StatCard theme={theme} {...def.build(ctx)} />
            </div>
          );
        })}

        {availableToAdd.length > 0 && (
          <div ref={pickerRef} style={{ position: "relative", flex: "1 1 200px", minWidth: 200 }}>
            <button
              onClick={() => setPickerOpen((o) => !o)}
              style={{ width: "100%", height: "100%", minHeight: 96, border: `1.5px dashed ${theme.border}`, borderRadius: 8, background: "transparent", color: theme.textMuted, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12.5, fontWeight: 600 }}
            >
              <Plus size={18} /> Adicionar card
            </button>
            {pickerOpen && (
              <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 6, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", minWidth: 210, zIndex: 10, overflow: "hidden" }}>
                {availableToAdd.map((id) => (
                  <button
                    key={id}
                    onClick={() => addWidget(id)}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: theme.text }}
                  >
                    {WIDGET_DEFS[id].label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Card theme={theme} style={{ flex: "2 1 480px", padding: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
            Custo × Preço de venda por produto
          </div>
          {chartData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: theme.textMuted }} />
                <YAxis tick={{ fontSize: 11, fill: theme.textMuted }} />
                <Tooltip formatter={(v) => brl(v)} contentStyle={{ borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 12 }} />
                <Bar dataKey="Custo" fill={theme.accent} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Venda" fill={theme.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: theme.textMuted, fontSize: 13 }}>Cadastre produtos para ver o gráfico.</div>
          )}
        </Card>

        <Card theme={theme} style={{ flex: "1 1 260px", padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Materiais acabando</div>
            {lowStock.length > LOW_STOCK_PREVIEW && (
              <Button theme={theme} variant="soft" style={{ padding: "5px 10px", fontSize: 11.5 }} onClick={() => setShowAllLowStock(true)}>
                Ver todos ({lowStock.length})
              </Button>
            )}
          </div>
          {lowStock.length === 0 && <div style={{ fontSize: 13, color: theme.textMuted }}>Tudo certo por aqui.</div>}
          {lowStock.slice(0, LOW_STOCK_PREVIEW).map((m) => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${theme.border}`, fontSize: 13 }}>
              <span>{m.name}</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, fontWeight: 600, color: theme.danger, background: `${theme.danger}1A`, borderRadius: 5, padding: "2px 7px" }}>{m.stock} {m.unit}</span>
            </div>
          ))}
        </Card>
      </div>

      {showAllLowStock && (
        <Modal theme={theme} title={`Materiais acabando (${lowStock.length})`} onClose={() => setShowAllLowStock(false)} width={440}>
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {lowStock.map((m) => (
              <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 2px", borderBottom: `1px solid ${theme.border}`, fontSize: 13.5 }}>
                <span>{m.name}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, fontWeight: 600, color: theme.danger, background: `${theme.danger}1A`, borderRadius: 5, padding: "2px 7px" }}>{m.stock} / {m.min_stock} {m.unit}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Button theme={theme} variant="ghost" onClick={() => setShowAllLowStock(false)}>Fechar</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
