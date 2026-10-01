import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  ShoppingBag, Boxes, Percent, AlertTriangle, Wallet, DollarSign, Plus, X, ChevronLeft, ChevronRight,
  Factory, Award, PiggyBank, Trash2, Check, ListChecks, Package, Heart, PackageCheck,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, StatCard, Button, Modal, inputStyle } from "../components/ui.jsx";
import { brl, computeProductCost } from "../pricing.js";
import { SERIF } from "../theme.js";
import {
  fetchMaterials, fetchProductsFull, fetchSettings, fetchProductionLogSince, fetchSalesSince, fetchAllSales,
  fetchQuotes, updateDashboardWidgets, produceProduct,
  fetchReminders, addReminder, toggleReminder, deleteReminder,
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
  produtos_em_estoque: statDef("Produtos em estoque", (ctx) => ({ icon: PackageCheck, label: "Produtos em estoque", value: ctx.finishedStockUnits })),
  materiais: statDef("Materiais em estoque", (ctx) => ({ icon: Boxes, label: "Materiais em estoque", value: ctx.materials.length })),
  valor_estoque: statDef("Valor em estoque", (ctx) => ({ icon: DollarSign, label: "Valor em estoque", value: brl(ctx.stockValue) })),
  valor_estoque_produtos: statDef("Valor de produtos em estoque", (ctx) => ({ icon: Package, label: "Valor de produtos em estoque", value: brl(ctx.finishedStockValue) })),
  margem: statDef("Margem média real", (ctx) => ({ icon: Percent, label: "Margem média real", value: `${ctx.avgMargin.toFixed(0)}%`, tone: ctx.theme.good })),
  lucro_mes: statDef("Lucro do mês", (ctx) => ({ icon: Wallet, label: "Lucro do mês", value: brl(ctx.monthlyProfit), tone: ctx.theme.good })),
  alertas: statDef("Alertas de estoque baixo", (ctx) => ({ icon: AlertTriangle, label: "Alertas de estoque baixo", value: ctx.lowStock.length, tone: ctx.lowStock.length ? ctx.theme.danger : ctx.theme.good })),
  produto_top: {
    label: "Produto mais lucrativo do mês", size: "medium",
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
    Widget: ({ ctx }) => (
      <LowStockWidget theme={ctx.theme} lowStock={ctx.lowStock} onShowAll={ctx.onShowAllLowStock} onAddReminder={ctx.onAddReminder} />
    ),
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

const DEFAULT_WIDGETS = ["produtos", "produtos_em_estoque", "valor_estoque_produtos", "lucro_mes", "alertas", "produto_top"];

export default function Dashboard({ theme, ownerId, ownerName, logoUrl, showToast, onQuickNavigate }) {
  const [materials, setMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [productionLog, setProductionLog] = useState([]);
  const [salesThisMonth, setSalesThisMonth] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [allSales, setAllSales] = useState([]);
  const [reminders, setReminders] = useState([]);
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
    const [mats, prods, st, plog, sales, allSls, qs, rems] = await Promise.all([
      fetchMaterials(), fetchProductsFull(), fetchSettings(), fetchProductionLogSince(monthStart),
      fetchSalesSince(monthStart), fetchAllSales(), fetchQuotes(50), fetchReminders(),
    ]);
    setMaterials(mats);
    setProducts(prods);
    setSettings(st);
    setProductionLog(plog);
    setSalesThisMonth(sales);
    setAllSales(allSls);
    setQuotes(qs);
    setReminders(rems);
    // só aplica a ordem de widgets salva na PRIMEIRA carga desta montagem —
    // recarregas depois (ex.: após registrar produção) não devem mexer no
    // layout que a pessoa já está vendo. Precisa ser um `if` simples e não
    // um updater funcional: o updater só roda depois (fase de render), e
    // por essa altura `loadedOnceRef.current` já teria virado `true` de
    // qualquer forma, fazendo essa checagem sempre falhar mesmo na primeira vez.
    if (!loadedOnceRef.current) {
      setWidgetOrder(Array.isArray(st?.dashboard_widgets) ? st.dashboard_widgets : DEFAULT_WIDGETS);
      loadedOnceRef.current = true;
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const reloadReminders = () => fetchReminders().then(setReminders);
  const handleAddReminder = async (text) => {
    const { error } = await addReminder(ownerId, text);
    if (error) { showToast("Erro ao adicionar lembrete.", "err"); return; }
    reloadReminders();
  };
  const handleToggleReminder = async (id, done) => {
    const { error } = await toggleReminder(id, done);
    if (error) { showToast("Erro ao atualizar lembrete.", "err"); return; }
    reloadReminders();
  };
  const handleDeleteReminder = async (id) => {
    const { error } = await deleteReminder(id);
    if (error) { showToast("Erro ao excluir lembrete.", "err"); return; }
    reloadReminders();
  };

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

  const lowStock = useMemo(() => {
    // materiais usados só por produtos sem controle de estoque (fichas antigas,
    // sem estoque real) não devem gerar alerta -- só alerta quem depende deles
    // de verdade, ou quem não está em nenhuma ficha (estoque avulso).
    const usedByControlled = new Set();
    const usedByUncontrolled = new Set();
    products.forEach((p) => {
      (p.bom || []).forEach((b) => {
        (p.has_stock_control === false ? usedByUncontrolled : usedByControlled).add(b.material_id);
      });
    });
    return materials.filter((m) => {
      if (Number(m.stock) > Number(m.min_stock)) return false;
      if (usedByUncontrolled.has(m.id) && !usedByControlled.has(m.id)) return false;
      return true;
    });
  }, [materials, products]);
  const stockValue = useMemo(() => materials.reduce((s, m) => s + m.price * m.stock, 0), [materials]);

  const productCosts = useMemo(
    () => (settings ? products.map((p) => ({ product: p, calc: computeProductCost(p, materials, products, settings) })) : []),
    [products, materials, settings]
  );
  const avgMargin = useMemo(() => {
    if (!productCosts.length) return 0;
    return productCosts.reduce((s, p) => s + p.calc.realMarginPercent, 0) / productCosts.length;
  }, [productCosts]);

  // Lucro do mês agora reflete só o que foi de fato VENDIDO (aba Vendas), não
  // o que foi produzido -- produzir não é lucro até vender de verdade.
  const monthlyProfit = useMemo(() => {
    if (!settings) return 0;
    const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
    return (salesThisMonth || []).reduce((sum, s) => {
      const product = productsById[s.product_id];
      if (!product) return sum;
      const cost = computeProductCost(product, materials, products, settings).subtotal * s.qty;
      return sum + (s.total_price - cost);
    }, 0);
  }, [salesThisMonth, products, materials, settings]);

  const monthlyUnits = useMemo(() => (productionLog || []).reduce((s, l) => s + l.qty, 0), [productionLog]);

  const topProduct = useMemo(() => {
    if (!settings) return null;
    const map = new Map();
    const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
    (salesThisMonth || []).forEach((s) => {
      const product = productsById[s.product_id];
      if (!product) return;
      const cost = computeProductCost(product, materials, products, settings).subtotal * s.qty;
      const cur = map.get(s.product_id) || { name: product.name, image: product.image_urls?.[0] || null, profit: 0 };
      cur.profit += s.total_price - cost;
      map.set(s.product_id, cur);
    });
    const arr = [...map.values()].sort((a, b) => b.profit - a.profit);
    return arr[0] || null;
  }, [salesThisMonth, products, materials, settings]);

  const allTimeProfit = useMemo(() => {
    if (!settings) return 0;
    const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
    return (allSales || []).reduce((sum, s) => {
      const product = productsById[s.product_id];
      if (!product) return sum;
      const cost = computeProductCost(product, materials, products, settings).subtotal * s.qty;
      return sum + (s.total_price - cost);
    }, 0);
  }, [allSales, products, materials, settings]);

  const finishedStockValue = useMemo(() => {
    if (!settings) return 0;
    return products.reduce((sum, p) => {
      const avail = (p.produced_count || 0) - (p.sold_count || 0);
      if (avail <= 0) return sum;
      return sum + avail * computeProductCost(p, materials, products, settings).finalPrice;
    }, 0);
  }, [products, materials, settings]);

  const finishedStockUnits = useMemo(
    () => products.reduce((sum, p) => sum + Math.max((p.produced_count || 0) - (p.sold_count || 0), 0), 0),
    [products]
  );

  const chartData = productCosts.slice(0, 8).map((p) => ({
    name: p.product.name.length > 14 ? p.product.name.slice(0, 13) + "…" : p.product.name,
    Custo: Math.round(p.calc.subtotal * 100) / 100,
    Venda: Math.round(p.calc.finalPrice * 100) / 100,
  }));

  if (loading) return <div style={{ color: theme.textMuted, fontSize: 13.5 }}>Carregando painel…</div>;

  const ctx = {
    theme, materials, products, settings, lowStock, stockValue, finishedStockValue, finishedStockUnits, avgMargin, monthlyProfit, monthlyUnits,
    chartData, ownerName, ownerId, quotes, allTimeProfit, topProduct, showToast, reminders,
    onQuickNavigate, reload: loadAll,
    onShowAllLowStock: () => setShowAllLowStock(true),
    onAddReminder: handleAddReminder, onToggleReminder: handleToggleReminder, onDeleteReminder: handleDeleteReminder,
  };
  const availableToAdd = Object.keys(WIDGET_DEFS).filter((id) => !widgetOrder.includes(id));

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <WelcomeWidget theme={theme} ownerName={ownerName} logoUrl={logoUrl} />
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 32 }}>
        <div style={{ flex: "1 1 360px" }}>
          <CalendarWidget theme={theme} />
        </div>
        <div style={{ flex: "1 1 360px" }}>
          <RemindersWidget
            theme={theme} reminders={reminders} ownerId={ownerId}
            onAdd={handleAddReminder} onToggle={handleToggleReminder} onDelete={handleDeleteReminder}
          />
        </div>
      </div>

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

function WelcomeWidget({ theme, ownerName, logoUrl }) {
  const firstName = (ownerName || "").trim().split(/\s+/)[0];
  const dateStr = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return (
    <Card theme={theme} style={{ padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, overflow: "hidden", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
        {logoUrl ? (
          <img src={logoUrl} alt="" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: `1px solid ${theme.border}`, flexShrink: 0 }} />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: theme.primarySoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Heart size={22} color={theme.primary} />
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: SERIF, fontSize: 23.5, fontWeight: 700, marginBottom: 3 }}>
            {firstName ? `Olá, ${firstName}!` : "Olá!"}
          </div>
          <div style={{ fontSize: 13, color: theme.textMuted, textTransform: "capitalize" }}>{dateStr}</div>
        </div>
      </div>

      <div className="welcome-tagline" style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <svg width="120" height="72" viewBox="0 0 120 72" fill="none" style={{ flexShrink: 0, opacity: 0.7 }}>
          <path d="M4 58C24 18 44 78 64 38C80 6 96 46 116 14" stroke={theme.primarySoft} strokeWidth="10" strokeLinecap="round" />
          <path d="M4 40C24 6 44 60 64 24C80 -4 96 30 116 2" stroke={theme.border} strokeWidth="6" strokeLinecap="round" />
        </svg>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: SERIF, fontSize: 13.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: theme.primary, lineHeight: 1.5 }}>
            Feito com carinho<br />e dedicação
          </div>
          <Heart size={13} color={theme.primary} style={{ marginTop: 4 }} fill={theme.primary} />
        </div>
      </div>
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
    <Card theme={theme} style={{ padding: 18, height: "100%", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button style={navBtn} onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft size={14} /></button>
        <div style={{ fontFamily: SERIF, fontSize: 16.5, fontWeight: 700, textTransform: "capitalize" }}>{monthLabel}</div>
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
      <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Ações rápidas</div>
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
    <Card theme={theme} style={{ padding: 18, flex: "1 1 280px", display: "flex", alignItems: "center", gap: 12, overflow: "hidden" }}>
      {topProduct?.image ? (
        <img src={topProduct.image} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: `1px solid ${theme.border}` }} />
      ) : (
        <div style={{ width: 52, height: 52, borderRadius: 10, background: theme.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Award size={20} color={theme.textMuted} />
        </div>
      )}
      <div style={{ minWidth: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, color: theme.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          <Award size={12} style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, overflow: "hidden", textOverflow: "ellipsis" }}>Mais lucrativo do mês</span>
        </div>
        {topProduct ? (
          <>
            <div style={{ fontFamily: SERIF, fontSize: 16.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{topProduct.name}</div>
            <div style={{ fontSize: 12.5, color: theme.good, fontWeight: 700 }}>{brl(topProduct.profit)} de lucro</div>
          </>
        ) : (
          <div style={{ fontSize: 12.5, color: theme.textMuted }}>Nenhuma venda este mês ainda.</div>
        )}
      </div>
    </Card>
  );
}

function InvestmentWidget({ theme, investment, recovered }) {
  if (!investment) {
    return (
      <Card theme={theme} style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <PiggyBank size={15} color={theme.primary} />
          <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700 }}>Recuperação do investimento</div>
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
        <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700 }}>Recuperação do investimento</div>
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
      <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Meta de produção do mês</div>
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
      <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, marginBottom: 14 }}>
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

function LowStockWidget({ theme, lowStock, onShowAll, onAddReminder }) {
  return (
    <Card theme={theme} style={{ padding: 18, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700 }}>Materiais acabando</div>
        {lowStock.length > LOW_STOCK_PREVIEW && (
          <Button theme={theme} variant="soft" style={{ padding: "5px 10px", fontSize: 11.5 }} onClick={onShowAll}>
            Ver todos ({lowStock.length})
          </Button>
        )}
      </div>
      {lowStock.length === 0 && <div style={{ fontSize: 13, color: theme.textMuted }}>Tudo certo por aqui.</div>}
      {lowStock.slice(0, LOW_STOCK_PREVIEW).map((m) => (
        <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${theme.border}`, fontSize: 13 }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, fontWeight: 600, color: theme.danger, background: `${theme.danger}1A`, borderRadius: 5, padding: "2px 7px" }}>{m.stock} {m.unit}</span>
            {onAddReminder && (
              <button
                onClick={() => onAddReminder(`Comprar ${m.name}`)}
                title="Adicionar como lembrete"
                style={{ width: 20, height: 20, borderRadius: "50%", border: "none", background: theme.surfaceAlt, color: theme.textMuted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
              >
                <Plus size={12} />
              </button>
            )}
          </span>
        </div>
      ))}
    </Card>
  );
}

function RemindersWidget({ theme, reminders, onAdd, onToggle, onDelete }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  };

  return (
    <Card theme={theme} style={{ padding: 18, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexShrink: 0 }}>
        <ListChecks size={15} color={theme.primary} />
        <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700 }}>Lembretes</div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexShrink: 0 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Ex: Comprar fita adesiva…"
          style={{ ...inputStyle(theme), flex: 1, padding: "7px 10px", fontSize: 12.5 }}
        />
        <button onClick={submit} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: theme.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <Plus size={15} />
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {reminders.length === 0 && <div style={{ fontSize: 13, color: theme.textMuted }}>Nenhum lembrete por aqui.</div>}
        {reminders.map((r) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${theme.border}` }}>
            <button
              onClick={() => onToggle(r.id, !r.done)}
              style={{
                width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${r.done ? theme.good : theme.border}`,
                background: r.done ? theme.good : "transparent", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0,
              }}
            >
              {r.done && <Check size={12} />}
            </button>
            <span style={{ flex: 1, fontSize: 13, color: r.done ? theme.textMuted : theme.text, textDecoration: r.done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.text}
            </span>
            <button onClick={() => onDelete(r.id)} style={{ background: "none", border: "none", color: theme.textMuted, cursor: "pointer", display: "flex", flexShrink: 0, padding: 0 }}>
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
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
      <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Últimos orçamentos</div>
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
      <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, marginBottom: 14 }}>Orçamentos vencendo</div>
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
