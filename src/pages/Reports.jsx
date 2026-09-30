import React, { useEffect, useMemo, useState } from "react";
import { Package, Wallet, Receipt, TrendingUp, PiggyBank } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, StatCard, Row } from "../components/ui.jsx";
import { brl, monthKey, computeProductCost } from "../pricing.js";
import { useCatalogData, fetchSalesSince, fetchAllSales } from "../data.js";

const MONTHS_WINDOW = 6;

function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

export default function Reports({ theme }) {
  const { materials, products, settings, loading: loadingCatalog } = useCatalogData();
  const [sales, setSales] = useState([]);
  const [loadingLog, setLoadingLog] = useState(true);
  const [allSales, setAllSales] = useState([]);
  const [loadingAllTime, setLoadingAllTime] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => monthKey(new Date()));

  useEffect(() => {
    const now = new Date();
    const since = new Date(now.getFullYear(), now.getMonth() - (MONTHS_WINDOW - 1), 1);
    fetchSalesSince(since).then((rows) => {
      setSales(rows);
      setLoadingLog(false);
    });
  }, []);

  useEffect(() => {
    fetchAllSales().then((rows) => {
      setAllSales(rows);
      setLoadingAllTime(false);
    });
  }, []);

  const productsById = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);

  // Lucro/receita contam só o que foi de fato VENDIDO (aba Vendas) -- produzir
  // não é lucro até vender de verdade. Custo usa o cálculo atual do produto
  // (não guardamos um "snapshot" do custo no momento da venda).
  const enriched = useMemo(() => {
    if (!settings) return [];
    return sales.map((s) => {
      const product = productsById[s.product_id];
      const cost = product ? computeProductCost(product, materials, products, settings).subtotal * s.qty : 0;
      return {
        ...s,
        productName: product?.name || "Produto removido",
        month: monthKey(s.sold_at),
        revenue: s.total_price,
        cost,
        profit: s.total_price - cost,
      };
    });
  }, [sales, productsById, materials, products, settings]);

  const allTimeProfit = useMemo(() => {
    if (!settings) return 0;
    return allSales.reduce((sum, s) => {
      const product = productsById[s.product_id];
      if (!product) return sum;
      const cost = computeProductCost(product, materials, products, settings).subtotal * s.qty;
      return sum + (s.total_price - cost);
    }, 0);
  }, [allSales, productsById, materials, products, settings]);

  const monthsSeries = useMemo(() => {
    const now = new Date();
    const keys = [];
    for (let i = MONTHS_WINDOW - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(monthKey(d));
    }
    return keys.map((key) => {
      const rows = enriched.filter((r) => r.month === key);
      return {
        key,
        label: monthLabel(key),
        Lucro: Math.round(rows.reduce((s, r) => s + r.profit, 0) * 100) / 100,
        Receita: Math.round(rows.reduce((s, r) => s + r.revenue, 0) * 100) / 100,
      };
    });
  }, [enriched]);

  const monthOptions = useMemo(() => {
    const keys = new Set(enriched.map((r) => r.month));
    keys.add(selectedMonth);
    return Array.from(keys).sort().reverse();
  }, [enriched, selectedMonth]);

  const monthRows = useMemo(() => enriched.filter((r) => r.month === selectedMonth), [enriched, selectedMonth]);

  const totals = useMemo(() => ({
    units: monthRows.reduce((s, r) => s + r.qty, 0),
    revenue: monthRows.reduce((s, r) => s + r.revenue, 0),
    cost: monthRows.reduce((s, r) => s + r.cost, 0),
    profit: monthRows.reduce((s, r) => s + r.profit, 0),
  }), [monthRows]);

  const topProducts = useMemo(() => {
    const map = new Map();
    monthRows.forEach((r) => {
      const cur = map.get(r.product_id) || { name: r.productName, qty: 0, revenue: 0, profit: 0 };
      cur.qty += r.qty; cur.revenue += r.revenue; cur.profit += r.profit;
      map.set(r.product_id, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.profit - a.profit).slice(0, 8);
  }, [monthRows]);

  if (loadingCatalog || loadingLog || loadingAllTime) return <div style={{ color: theme.textMuted, fontSize: 13.5 }}>Carregando relatórios…</div>;

  const investment = settings?.initial_investment || 0;

  if (sales.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {investment > 0 && <InvestmentCard theme={theme} investment={investment} recovered={allTimeProfit} />}
        <Card theme={theme} style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Nenhuma venda registrada ainda</div>
          <div style={{ fontSize: 13, color: theme.textMuted }}>
            Assim que você registrar uma venda na aba Vendas, os relatórios de lucro e produtos mais vendidos aparecem aqui.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {investment > 0 && <InvestmentCard theme={theme} investment={investment} recovered={allTimeProfit} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 12.5, color: theme.textMuted }}>Mostrando dados de</div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text, fontSize: 13, fontWeight: 600 }}
        >
          {monthOptions.map((k) => <option key={k} value={k}>{monthLabel(k)}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard theme={theme} icon={Package} label="Unidades vendidas" value={totals.units} />
        <StatCard theme={theme} icon={Wallet} label="Receita do mês" value={brl(totals.revenue)} />
        <StatCard theme={theme} icon={Receipt} label="Custo do mês" value={brl(totals.cost)} />
        <StatCard theme={theme} icon={TrendingUp} label="Lucro do mês" value={brl(totals.profit)} tone={theme.good} />
      </div>

      <Card theme={theme} style={{ padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Lucro x Receita — últimos 6 meses</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthsSeries}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: theme.textMuted }} />
            <YAxis tick={{ fontSize: 11, fill: theme.textMuted }} />
            <Tooltip formatter={(v) => brl(v)} contentStyle={{ borderRadius: 8, border: `1px solid ${theme.border}`, fontSize: 12 }} />
            <Bar dataKey="Receita" fill={theme.primarySoft} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Lucro" fill={theme.primary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card theme={theme} style={{ overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", fontSize: 15, fontWeight: 700, borderBottom: `1px solid ${theme.border}` }}>
          Produtos mais lucrativos no mês
        </div>
        {topProducts.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: theme.textMuted, fontSize: 13 }}>Nenhuma venda neste mês.</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 0.8fr 1fr 1fr", padding: "8px 20px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: theme.textMuted, background: theme.surfaceAlt, borderBottom: `1px solid ${theme.border}` }}>
              <span>Produto</span><span>Vendido</span><span>Receita</span><span>Lucro</span>
            </div>
            {topProducts.map((p, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 0.8fr 1fr 1fr", padding: "11px 20px", fontSize: 13.5, alignItems: "center", borderBottom: `1px solid ${theme.border}` }}>
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                <span style={{ color: theme.textMuted }}>{p.qty} un.</span>
                <span>{brl(p.revenue)}</span>
                <span style={{ fontWeight: 700, color: theme.good }}>{brl(p.profit)}</span>
              </div>
            ))}
          </>
        )}
      </Card>
    </div>
  );
}

function InvestmentCard({ theme, investment, recovered }) {
  const pct = investment > 0 ? Math.min((recovered / investment) * 100, 100) : 0;
  const remaining = Math.max(investment - recovered, 0);
  return (
    <Card theme={theme} style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <PiggyBank size={16} color={theme.primary} />
        <div style={{ fontSize: 15, fontWeight: 700 }}>Recuperação do investimento inicial</div>
      </div>
      <div style={{ height: 10, borderRadius: 6, background: theme.surfaceAlt, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: theme.good, transition: "width .3s ease" }} />
      </div>
      <div style={{ maxWidth: 360 }}>
        <Row theme={theme} label="Investido" value={brl(investment)} />
        <Row theme={theme} label="Recuperado até agora" value={`${brl(recovered)} (${pct.toFixed(0)}%)`} tone={theme.good} />
        <Row theme={theme} label="Ainda falta recuperar" value={brl(remaining)} />
      </div>
    </Card>
  );
}
