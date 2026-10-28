import { describe, it, expect } from "vitest";
import { round90, computeProductCost, productionLogValue, monthKey } from "./pricing.js";

// Cenário base, com valores redondos para dar pra conferir na calculadora:
//   mão de obra R$ 30/h · despesas fixas R$ 1.000 ÷ 100 un = R$ 10/un
//   manutenção 10% · margem padrão 100% · taxa de cartão 5% · sem arredondamento
const settings = {
  labor_cost_per_hour: 30,
  monthly_fixed_expenses: 1000,
  monthly_capacity_units: 100,
  maintenance_percent: 10,
  default_margin_percent: 100,
  card_fee_percent: 5,
  round_to_90: false,
};

const materials = [
  { id: "tecido", name: "Tecido", price: 20, waste_percent: 10 },
  { id: "ziper", name: "Zíper", price: 5, waste_percent: 0 },
];

// Bolsa: 2 un de tecido + 1 zíper + 60 min de produção
//   materiais   = 20 × 2 × 1,10 + 5 × 1 = 49,00
//   mão de obra = 60/60 × 30          = 30,00
//   manutenção  = (49 + 30) × 10%     =  7,90
//   rateio      = 1000 / 100          = 10,00
//   subtotal                          = 96,90
//   antes taxas = 96,90 × 2           = 193,80
//   taxa cartão = 193,80 × 5%         =   9,69
//   sugerido                          = 203,49
const bolsa = {
  id: "bolsa",
  name: "Bolsa",
  labor_minutes: 60,
  bom: [
    { material_id: "tecido", qty: 2 },
    { material_id: "ziper", qty: 1 },
  ],
};

const calc = (product, overrides = {}, products = [bolsa]) =>
  computeProductCost(product, materials, products, { ...settings, ...overrides });

describe("round90", () => {
  it.each([
    [12.3, 12.9],
    [12.05, 12.9],
    [12.9, 12.9],
    [12.95, 13.9],
    [203.49, 203.9],
  ])("arredonda %f para o próximo preço terminado em ,90 (%f)", (input, want) => {
    expect(round90(input)).toBe(want);
  });

  it.each([0, -5, NaN, Infinity])("devolve 0 para valor inválido ou não positivo (%f)", (input) => {
    expect(round90(input)).toBe(0);
  });
});

describe("computeProductCost — produto simples", () => {
  it("soma materiais aplicando o % de perda de cada um", () => {
    expect(calc(bolsa).materialsCost).toBeCloseTo(49, 2);
  });

  it("calcula mão de obra pelos minutos de produção", () => {
    expect(calc(bolsa).laborCost).toBeCloseTo(30, 2);
  });

  it("aplica manutenção sobre materiais + mão de obra", () => {
    expect(calc(bolsa).maintenanceCost).toBeCloseTo(7.9, 2);
  });

  it("rateia as despesas fixas pela capacidade mensal", () => {
    expect(calc(bolsa).fixedExpenseShare).toBeCloseTo(10, 2);
  });

  it("chega ao custo total, preço sugerido, lucro e margem real", () => {
    const r = calc(bolsa);
    expect(r.subtotal).toBeCloseTo(96.9, 2);
    expect(r.cardFee).toBeCloseTo(9.69, 2);
    expect(r.suggestedPrice).toBeCloseTo(203.49, 2);
    expect(r.finalPrice).toBeCloseTo(203.49, 2);
    expect(r.profit).toBeCloseTo(106.59, 2);
    expect(r.realMarginPercent).toBeCloseTo(110, 2);
  });

  it("arredonda o preço final para ,90 quando a opção está ligada", () => {
    expect(calc(bolsa, { round_to_90: true }).finalPrice).toBe(203.9);
  });

  it("lê a ficha técnica do formato do Supabase (product_materials)", () => {
    const { bom, ...rest } = bolsa;
    expect(calc({ ...rest, product_materials: bom }).materialsCost).toBeCloseTo(49, 2);
  });

  it("ignora item da ficha cujo material não existe mais, sem quebrar", () => {
    const p = { ...bolsa, bom: [...bolsa.bom, { material_id: "apagado", qty: 3 }] };
    expect(calc(p).materialsCost).toBeCloseTo(49, 2);
  });

  it("não divide por zero quando a capacidade mensal é 0", () => {
    const r = calc(bolsa, { monthly_capacity_units: 0 });
    expect(r.fixedExpenseShare).toBe(0);
    expect(r.subtotal).toBeCloseTo(86.9, 2);
  });
});

describe("computeProductCost — personalizações por produto", () => {
  it("usa a margem do produto no lugar da padrão", () => {
    // 96,90 × 1,5 = 145,35 → + 5% = 152,6175
    expect(calc({ ...bolsa, margin_percent: 50 }).suggestedPrice).toBeCloseTo(152.6175, 4);
  });

  it("respeita margem 0% no produto (não cai na padrão)", () => {
    // 96,90 × 1,05 = 101,745
    expect(calc({ ...bolsa, margin_percent: 0 }).suggestedPrice).toBeCloseTo(101.745, 4);
  });

  it("usa rateio personalizado, inclusive zero", () => {
    expect(calc({ ...bolsa, fixed_expense_share_override: 2 }).subtotal).toBeCloseTo(88.9, 2);
    expect(calc({ ...bolsa, fixed_expense_share_override: 0 }).subtotal).toBeCloseTo(86.9, 2);
  });

  it("usa manutenção personalizada, inclusive zero", () => {
    expect(calc({ ...bolsa, maintenance_percent_override: 0 }).subtotal).toBeCloseTo(89, 2);
  });

  it("preço manual vale como preço final e avisa que está abaixo do sugerido", () => {
    const r = calc({ ...bolsa, sale_price_override: 150 });
    expect(r.finalPrice).toBe(150);
    expect(r.profit).toBeCloseTo(53.1, 2);
    expect(r.belowSuggested).toBe(true);
    expect(r.belowCost).toBe(false);
  });

  it("preço manual abaixo do custo gera prejuízo e aviso", () => {
    const r = calc({ ...bolsa, sale_price_override: 90 });
    expect(r.profit).toBeCloseTo(-6.9, 2);
    expect(r.belowCost).toBe(true);
  });

  it("sem preço manual, não há avisos", () => {
    const r = calc(bolsa);
    expect(r.hasOverride).toBe(false);
    expect(r.belowSuggested).toBe(false);
    expect(r.belowCost).toBe(false);
  });
});

describe("computeProductCost — kits", () => {
  // Necessaire: 2 zíperes, sem mão de obra
  //   materiais 10 · manutenção 1 · rateio 10 → subtotal 21,00
  const necessaire = { id: "necessaire", name: "Necessaire", labor_minutes: 0, bom: [{ material_id: "ziper", qty: 2 }] };
  const products = [bolsa, necessaire];

  it("soma o CUSTO dos componentes (não o preço de venda) + embalagem própria", () => {
    // 1 bolsa (96,90) + 2 necessaires (2 × 21) + 1 zíper de embalagem (5) = 143,90
    // Se usasse o preço de venda da bolsa (203,49) daria margem em cascata.
    const kit = {
      id: "kit",
      is_kit: true,
      kitItems: [
        { item_product_id: "bolsa", qty: 1 },
        { item_product_id: "necessaire", qty: 2 },
      ],
      bom: [{ material_id: "ziper", qty: 1 }],
    };
    expect(calc(kit, {}, products).materialsCost).toBeCloseTo(143.9, 2);
  });

  it("lê os itens do formato do Supabase (product_kit_items) e ignora componente apagado", () => {
    const kit = {
      id: "kit",
      is_kit: true,
      product_kit_items: [
        { item_product_id: "necessaire", qty: 1 },
        { item_product_id: "apagado", qty: 5 },
      ],
    };
    expect(calc(kit, {}, products).materialsCost).toBeCloseTo(21, 2);
  });
});

describe("productionLogValue", () => {
  it("usa o snapshot gravado na produção, mesmo que o preço atual seja outro", () => {
    const log = { cost_snapshot: { subtotal: 50, finalPrice: 80, profit: 30 } };
    expect(productionLogValue(log, bolsa, materials, [bolsa], settings)).toEqual({
      subtotal: 50,
      finalPrice: 80,
      profit: 30,
    });
  });

  it("sem snapshot válido, recalcula com os preços atuais", () => {
    const r = productionLogValue({ cost_snapshot: {} }, bolsa, materials, [bolsa], settings);
    expect(r.subtotal).toBeCloseTo(96.9, 2);
    expect(r.finalPrice).toBeCloseTo(203.49, 2);
    expect(r.profit).toBeCloseTo(106.59, 2);
  });

  it("sem snapshot e sem produto, devolve zeros", () => {
    expect(productionLogValue({}, undefined, materials, [], settings)).toEqual({
      subtotal: 0,
      finalPrice: 0,
      profit: 0,
    });
  });
});

describe("monthKey", () => {
  it("formata ano-mês com dois dígitos", () => {
    expect(monthKey(new Date(2026, 0, 5))).toBe("2026-01");
    expect(monthKey(new Date(2026, 11, 31, 23, 59))).toBe("2026-12");
  });
});
