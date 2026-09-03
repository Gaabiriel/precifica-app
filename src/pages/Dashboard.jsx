import React, { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Boxes, Percent, AlertTriangle, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, StatCard, Button, Modal } from "../components/ui.jsx";
import { brl, computeProductCost, productionLogValue } from "../pricing.js";
import { fetchMaterials, fetchProductsFull, fetchSettings, fetchProductionLogSince } from "../data.js";

const LOW_STOCK_PREVIEW = 5;

export default function Dashboard({ theme }) {
  const [materials, setMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [productionLog, setProductionLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllLowStock, setShowAllLowStock] = useState(false);

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
        setLoading(false);
      }
    );
    return () => { cancelled = true; };
  }, []);

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

  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard theme={theme} icon={ShoppingBag} label="Produtos cadastrados" value={products.length} />
        <StatCard theme={theme} icon={Boxes} label="Materiais em estoque" value={materials.length} sub={`Valor em estoque: ${brl(stockValue)}`} />
        <StatCard theme={theme} icon={Percent} label="Margem média real" value={`${avgMargin.toFixed(0)}%`} tone={theme.good} />
        <StatCard theme={theme} icon={Wallet} label="Lucro do mês" value={brl(monthlyProfit)} tone={theme.good} />
        <StatCard theme={theme} icon={AlertTriangle} label="Alertas de estoque baixo" value={lowStock.length} tone={lowStock.length ? theme.danger : theme.good} />
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
