import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  ShoppingBag, Boxes, Percent, AlertTriangle, Wallet, DollarSign, Plus, X, ChevronLeft, ChevronRight,
  Factory, Award, PiggyBank,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, StatCard, Button, Modal, inputStyle } from "../components/ui.jsx";
import { brl, computeProductCost, productionLogValue } from "../pricing.js";
import {
  fetchMaterials, fetchProductsFull, fetchSettings, fetchProductionLogSince,
  fetchQuotes, fetchAllTimeProfit, updateDashboardWidgets, produceProduct,
} from "../data.js";

const LOW_STOCK_PREVIEW = 5;

const SIZE_STYLE = {
  small: { flex: "1 1 200px", minWidth: 200 },
  medium: { flex: "1 1 320px", minWidth: 280 },
  large: { flex: "2 1 480px", minWidth: 360 },
  list: { flex: "1 1 260px", minWidth: 260 },
  wide: { flex: "1 1 100%" },
};

function statDef(label, build) {
  return { label, size: "small", Widget: ({ ctx }) => <StatCard theme={ctx.theme} {...build(ctx)} /> };
}

const WIDGET_DEFS = {
  welcome: {
    label: "Mensagem de boas-vindas", size: "wide",
    Widget: ({ ctx }) => <WelcomeWidget theme={ctx.theme} ownerName={ctx.ownerName} />,
  },
  calendar: {
    label: "Calendário", size: "medium",
    Widget: ({ ctx }) => <CalendarWidget theme={ctx.theme} />,
  },
  acoes_rapidas: {
    label: "Ações rápidas", size: "wide",
    Widget: ({ ctx }) => (
      <QuickActionsWidget
        theme={ctx.theme} products={ctx.products} materials={ctx.materials} settings={ctx.settings}
        ownerId={ctx.ownerId} onNavigate={ctx.onQuickNavigate} onProduced={ctx.reload} showToast={ctx.showToast}
      />
    ),
  },
  produtos: statDef("Produtos cadastrados", (ctx) => ({ icon: ShoppingBag, label: "Produtos cadastrados", value: ctx.products.length })),
  materiais: statDef("Materiais em estoque", (ctx) => ({ icon: Boxes, label: "Materiais em estoque", value: ctx.materials.length })),
  valor_estoque: statDef("Valor em estoque", (ctx) => ({ icon: DollarSign, label: "Valor em estoque", value: brl(ctx.stockValue) })),
  margem: statDef("Margem média real", (ctx) => ({ icon: Percent, label: "Margem média real", value: `${ctx.avgMargin.toFixed(0)}%`, tone: ctx.theme.good })),
  lucro_mes: statDef("Lucro do mês", (ctx) => ({ icon: Wallet, label: "Lucro do mês", value: brl(ctx.monthlyProfit), tone: ctx.theme.good })),
  alertas: statDef("Alertas de estoque baixo", (ctx) => ({ icon: AlertTriangle, label: "Alertas de estoque baixo", value: ctx.lowStock.length, tone: ctx.lowStock.length ? ctx.theme.danger : ctx.theme.good })),
  produto_top: {
    label: "Produto mais lucrativo do mês", size: "small",
    Widget: ({ ctx }) => <TopProductWidget theme={ctx.theme} topProduct={ctx.topProduct} />,
  },
  investimento: {
    label: "Recuperação do investimento", size: "medium",
    Widget: ({ ctx }) => <InvestmentWidget theme={ctx.theme} investment={ctx.settings?.initial_investment || 0} recovered={ctx.allTimeProfit} />,
  },
  meta_producao: {
    label: "Meta de produção do mês", size: "medium",
    Widget: ({ ctx }) => <ProductionGoalWidget theme={ctx.theme} produced={ctx.monthlyUnits} capacity={ctx.settings?.monthly_capacity_units || 0} />,
  },
  grafico_custo_venda: {
    label: "Gráfico: Custo × Preço de venda", size: "large",
    Widget: ({ ctx }) => <ChartWidget theme={ctx.theme} chartData={ctx.chartData} />,
  },
  materiais_acabando: {
    label: "Lista: Materiais acabando", size: "list",
    Widget: ({ ctx }) => <LowStockWidget theme={ctx.theme} lowStock={ctx.lowStock} onShowAll={ctx.onShowAllLowStock} />,
  },
  ultimos_orcamentos: {
    label: "Últimos orçamentos", size: "list",
    Widget: ({ ctx }) => <LatestQuotesWidget theme={ctx.theme} quotes={ctx.quotes} onNavigate={ctx.onQuickNavigate} />,
  },
  orcamentos_vencendo: {
    label: "Orçamentos vencendo", size: "list",
    Widget: ({ ctx }) => <UpcomingQuotesWidget theme={ctx.theme} quotes={ctx.quotes} onNavigate={ctx.onQuickNavigate} />,
  },
};

const DEFAULT_WIDGETS = ["welcome", "calendar", "produtos", "materiais", "margem", "lucro_mes", "alertas", "grafico_custo_venda", "materiais_acabando"];

export default function Dashboard({ theme, ownerId, ownerName, showToast, onQuickNavigate }) {
  const [materials, setMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [productionLog, setProductionLog] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [allTimeProfit, setAllTimeProfit] = useState(0);
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

  const loadedOnceRef = useRef(false);
  const loadAll = useCallback(async () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [mats, prods, st, plog, qs, allProfit] = await Promise.all([
      fetchMaterials(), fetchProductsFull(), fetchSettings(), fetchProductionLogSince(monthStart),
      fetchQuotes(50), fetchAllTimeProfit(),
    ]);
    setMaterials(mats);
    setProducts(prods);
    setSettings(st);
    setProductionLog(plog);
    setQuotes(qs);
    setAllTimeProfit(allProfit);
    setWidgetOrder((prev) => (loadedOnceRef.current ? prev : (Array.isArray(st?.dashboard_widgets) ? st.dashboard_widgets : DEFAULT_WIDGETS)));
    loadedOnceRef.current = true;
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

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

  const monthlyUnits = useMemo(() => (productionLog || []).reduce((s, l) => s + l.qty, 0), [productionLog]);

  const topProduct = useMemo(() => {
    if (!settings) return null;
    const map = new Map();
    const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
    (productionLog || []).forEach((log) => {
      const product = productsById[log.product_id];
      if (!product) return;
      const { profit } = productionLogValue(log, product, materials, products, settings);
      const cur = map.get(log.product_id) || { name: product.name, profit: 0 };
      cur.profit += profit * log.qty;
      map.set(log.product_id, cur);
    });
    const arr = [...map.values()].sort((a, b) => b.profit - a.profit);
    return arr[0] || null;
  }, [productionLog, products, materials, settings]);

  const chartData = productCosts.slice(0, 8).map((p) => ({
    name: p.product.name.length > 14 ? p.product.name.slice(0, 13) + "…" : p.product.name,
    Custo: Math.round(p.calc.subtotal * 100) / 100,
    Venda: Math.round(p.calc.finalPrice * 100) / 100,
  }));

  if (loading) return <div style={{ color: theme.textMuted, fontSize: 13.5 }}>Carregando painel…</div>;

  const ctx = {
    theme, materials, products, settings, lowStock, stockValue, avgMargin, monthlyProfit, monthlyUnits,
    chartData, ownerName, ownerId, quotes, allTimeProfit, topProduct, showToast,
    onQuickNavigate, reload: loadAll,
    onShowAllLowStock: () => setShowAllLowStock(true),
  };
  const availableToAdd = Object.keys(WIDGET_DEFS).filter((id) => !widgetOrder.includes(id));

  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        {widgetOrder.map((id) => {
          const def = WIDGET_DEFS[id];
          if (!def) return null;
          const WidgetComp = def.Widget;
          return (
            <div
              key={id}
              draggable
              onDragStart={() => setDragId(id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(id)}
              onDragEnd={() => setDragId(null)}
              style={{ position: "relative", cursor: "grab", opacity: dragId === id ? 0.4 : 1, ...SIZE_STYLE[def.size] }}
              title="Arraste para reordenar"
            >
              <button
                onClick={(e) => { e.stopPropagation(); removeWidget(id); }}
                title="Remover card"
                style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: "50%", border: "none", background: theme.surfaceAlt, color: theme.textMuted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2 }}
              >
                <X size={12} />
              </button>
              <WidgetComp ctx={ctx} />
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
              <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 6, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", minWidth: 230, maxHeight: 320, overflowY: "auto", zIndex: 10 }}>
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

function WelcomeWidget({ theme, ownerName }) {
  const firstName = (ownerName || "").trim().split(/\s+/)[0];
  const dateStr = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return (
    <Card theme={theme} style={{ padding: "22px 24px" }}>
      <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 4 }}>
        {firstName ? `Olá, ${firstName}!` : "Olá!"}
      </div>
      <div style={{ fontSize: 13, color: theme.textMuted, textTransform: "capitalize" }}>{dateStr}</div>
    </Card>
  );
}

function CalendarWidget({ theme }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const today = new Date();
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = cursor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const navBtn = { width: 24, height: 24, borderRadius: 6, border: "none", background: theme.surfaceAlt, color: theme.text, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };

  return (
    <Card theme={theme} style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button style={navBtn} onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft size={14} /></button>
        <div style={{ fontSize: 13.5, fontWeight: 700, textTransform: "capitalize" }}>{monthLabel}</div>
        <button style={navBtn} onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight size={14} /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, fontSize: 10.5, color: theme.textMuted, textAlign: "center", marginBottom: 4 }}>
        {weekDays.map((w, i) => <div key={i}>{w}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {cells.map((d, i) => (
          <div
            key={i}
            style={{
              height: 26, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, fontSize: 12,
              background: d && isToday(d) ? theme.primary : "transparent",
              color: d && isToday(d) ? "#fff" : theme.text,
              fontWeight: d && isToday(d) ? 700 : 500,
            }}
          >
            {d || ""}
          </div>
        ))}
      </div>
    </Card>
  );
}

function QuickActionsWidget({ theme, products, materials, settings, ownerId, onNavigate, onProduced, showToast }) {
  const simpleProducts = useMemo(() => products.filter((p) => !p.is_kit), [products]);
  const [produceProductId, setProduceProductId] = useState("");
  const [produceQty, setProduceQty] = useState(1);
  const [producing, setProducing] = useState(false);
  const selectedId = produceProductId || simpleProducts[0]?.id || "";

  const handleProduce = async () => {
    const product = simpleProducts.find((p) => p.id === selectedId);
    if (!product) return;
    setProducing(true);
    const { error } = await produceProduct({ ownerId, product, qty: produceQty, materials, products, settings });
    setProducing(false);
    if (error) { showToast(error.message, "err"); return; }
    showToast(`Produção registrada: ${produceQty}x ${product.name}.`);
    setProduceQty(1);
    onProduced();
  };

  return (
    <Card theme={theme} style={{ padding: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Ações rápidas</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <Button theme={theme} variant="soft" onClick={() => onNavigate("materiais", true)}><Plus size={13} /> Novo material</Button>
        <Button theme={theme} variant="soft" onClick={() => onNavigate("produtos", true)}><Plus size={13} /> Novo produto</Button>
        <Button theme={theme} variant="soft" onClick={() => onNavigate("orcamentos", false)}><Plus size={13} /> Novo orçamento</Button>
      </div>
      <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, opacity: 0.6, marginBottom: 8 }}>Registrar produção</div>
        {simpleProducts.length === 0 ? (
          <div style={{ fontSize: 12.5, color: theme.textMuted }}>Cadastre um produto primeiro.</div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <select value={selectedId} onChange={(e) => setProduceProductId(e.target.value)} style={{ ...inputStyle(theme), flex: "1 1 180px" }}>
              {simpleProducts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" min={1} value={produceQty} onChange={(e) => setProduceQty(parseInt(e.target.value) || 1)} style={{ ...inputStyle(theme), width: 70 }} />
            <Button theme={theme} onClick={handleProduce} disabled={producing}><Factory size={13} /> Produzir</Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function TopProductWidget({ theme, topProduct }) {
  return (
    <Card theme={theme} style={{ padding: "22px 20px", flex: "1 1 200px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, color: theme.textMuted }}>
        <Award size={15} />
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>Mais lucrativo do mês</span>
      </div>
      {topProduct ? (
        <>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{topProduct.name}</div>
          <div style={{ fontSize: 13, color: theme.good, fontWeight: 700 }}>{brl(topProduct.profit)} de lucro</div>
        </>
      ) : (
        <div style={{ fontSize: 13, color: theme.textMuted }}>Nenhuma produção este mês ainda.</div>
      )}
    </Card>
  );
}

function InvestmentWidget({ theme, investment, recovered }) {
  if (!investment) {
    return (
      <Card theme={theme} style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <PiggyBank size={15} color={theme.primary} />
          <div style={{ fontSize: 14, fontWeight: 700 }}>Recuperação do investimento</div>
        </div>
        <div style={{ fontSize: 12.5, color: theme.textMuted }}>Configure o "Investimento inicial" em Configurações pra acompanhar aqui.</div>
      </Card>
    );
  }
  const pct = Math.min((recovered / investment) * 100, 100);
  return (
    <Card theme={theme} style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <PiggyBank size={15} color={theme.primary} />
        <div style={{ fontSize: 14, fontWeight: 700 }}>Recuperação do investimento</div>
      </div>
      <div style={{ height: 8, borderRadius: 5, background: theme.surfaceAlt, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: theme.good }} />
      </div>
      <div style={{ fontSize: 12.5, color: theme.textMuted }}>{brl(recovered)} de {brl(investment)} ({pct.toFixed(0)}%)</div>
    </Card>
  );
}

function ProductionGoalWidget({ theme, produced, capacity }) {
  const pct = capacity > 0 ? Math.min((produced / capacity) * 100, 100) : 0;
  return (
    <Card theme={theme} style={{ padding: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Meta de produção do mês</div>
      <div style={{ height: 8, borderRadius: 5, background: theme.surfaceAlt, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: theme.primary }} />
      </div>
      <div style={{ fontSize: 12.5, color: theme.textMuted }}>{produced} de {capacity} un. ({pct.toFixed(0)}%)</div>
    </Card>
  );
}

function ChartWidget({ theme, chartData }) {
  return (
    <Card theme={theme} style={{ padding: 18, height: "100%" }}>
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
  );
}

function LowStockWidget({ theme, lowStock, onShowAll }) {
  return (
    <Card theme={theme} style={{ padding: 18, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Materiais acabando</div>
        {lowStock.length > LOW_STOCK_PREVIEW && (
          <Button theme={theme} variant="soft" style={{ padding: "5px 10px", fontSize: 11.5 }} onClick={onShowAll}>
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
  );
}

function fmtDate(d) {
  if (!d) return "";
  const date = typeof d === "string" && d.length === 10 ? new Date(`${d}T00:00:00`) : new Date(d);
  return date.toLocaleDateString("pt-BR");
}

function LatestQuotesWidget({ theme, quotes, onNavigate }) {
  const latest = quotes.slice(0, 5);
  return (
    <Card theme={theme} style={{ padding: 18, height: "100%" }}>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Últimos orçamentos</div>
      {latest.length === 0 && <div style={{ fontSize: 13, color: theme.textMuted }}>Nenhum orçamento salvo ainda.</div>}
      {latest.map((q) => (
        <button
          key={q.id}
          onClick={() => onNavigate("orcamentos", false)}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: "8px 0", borderBottom: `1px solid ${theme.border}`, fontSize: 13, color: theme.text }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: 8 }}>{q.client_name}</span>
          <span style={{ fontWeight: 700, flexShrink: 0 }}>{brl(q.total)}</span>
        </button>
      ))}
    </Card>
  );
}

function UpcomingQuotesWidget({ theme, quotes, onNavigate }) {
  const upcoming = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const in7 = new Date(today); in7.setDate(in7.getDate() + 7);
    return quotes
      .filter((q) => q.valid_until)
      .map((q) => ({ ...q, validDate: new Date(`${q.valid_until}T00:00:00`) }))
      .filter((q) => q.validDate >= today && q.validDate <= in7)
      .sort((a, b) => a.validDate - b.validDate);
  }, [quotes]);

  return (
    <Card theme={theme} style={{ padding: 18, height: "100%" }}>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Orçamentos vencendo</div>
      {upcoming.length === 0 && <div style={{ fontSize: 13, color: theme.textMuted }}>Nenhum orçamento vencendo nos próximos 7 dias.</div>}
      {upcoming.map((q) => (
        <button
          key={q.id}
          onClick={() => onNavigate("orcamentos", false)}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: "8px 0", borderBottom: `1px solid ${theme.border}`, fontSize: 13, color: theme.text }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: 8 }}>{q.client_name}</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, fontWeight: 600, color: theme.danger, background: `${theme.danger}1A`, borderRadius: 5, padding: "2px 7px", flexShrink: 0 }}>{fmtDate(q.valid_until)}</span>
        </button>
      ))}
    </Card>
  );
}
