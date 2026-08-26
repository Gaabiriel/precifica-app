import React, { useMemo, useState } from "react";
import { ShoppingBag, Boxes, Percent, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, StatCard, Button, Modal } from "../components/ui.jsx";
import { brl, computeProductCost } from "../pricing.js";

const LOW_STOCK_PREVIEW = 5;

export default function Dashboard({ theme, materials, products, settings }) {
  const [showAllLowStock, setShowAllLowStock] = useState(false);
  const lowStock = useMemo(() => materials.filter((m) => Number(m.stock) <= Number(m.min_stock)), [materials]);
  const stockValue = useMemo(() => materials.reduce((s, m) => s + m.price * m.stock, 0), [materials]);

  const productCosts = useMemo(
    () => products.map((p) => ({ product: p, calc: computeProductCost(p, materials, products, settings) })),
    [products, materials, settings]
  );
  const avgMargin = useMemo(() => {
    if (!productCosts.length) return 0;
    return productCosts.reduce((s, p) => s + p.calc.realMarginPercent, 0) / productCosts.length;
  }, [productCosts]);

  const chartData = productCosts.slice(0, 8).map((p) => ({
    name: p.product.name.length > 14 ? p.product.name.slice(0, 13) + "…" : p.product.name,
    Custo: Math.round(p.calc.subtotal * 100) / 100,
    Venda: Math.round(p.calc.finalPrice * 100) / 100,
  }));

  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard theme={theme} icon={ShoppingBag} label="Produtos cadastrados" value={products.length} />
        <StatCard theme={theme} icon={Boxes} label="Materiais em estoque" value={materials.length} sub={`Valor em estoque: ${brl(stockValue)}`} />
        <StatCard theme={theme} icon={Percent} label="Margem média real" value={`${avgMargin.toFixed(0)}%`} tone={theme.good} />
        <StatCard theme={theme} icon={AlertTriangle} label="Alertas de estoque baixo" value={lowStock.length} tone={lowStock.length ? theme.danger : theme.good} />
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Card theme={theme} style={{ flex: "2 1 480px", padding: 18 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, marginBottom: 14 }}>
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
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600 }}>Materiais acabando</div>
            {lowStock.length > LOW_STOCK_PREVIEW && (
              <button onClick={() => setShowAllLowStock(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: theme.primary }}>
                Ver todos ({lowStock.length})
              </button>
            )}
          </div>
          {lowStock.length === 0 && <div style={{ fontSize: 13, color: theme.textMuted }}>Tudo certo por aqui.</div>}
          {lowStock.slice(0, LOW_STOCK_PREVIEW).map((m) => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${theme.border}`, fontSize: 13 }}>
              <span>{m.name}</span>
              <span style={{ color: theme.danger, fontWeight: 700 }}>{m.stock} {m.unit}</span>
            </div>
          ))}
        </Card>
      </div>

      {showAllLowStock && (
        <Modal theme={theme} title={`Materiais acabando (${lowStock.length})`} onClose={() => setShowAllLowStock(false)} width={440}>
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {lowStock.map((m) => (
              <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 2px", borderBottom: `1px solid ${theme.border}`, fontSize: 13.5 }}>
                <span>{m.name}</span>
                <span style={{ color: theme.danger, fontWeight: 700 }}>{m.stock} / {m.min_stock} {m.unit}</span>
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
