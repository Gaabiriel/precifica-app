import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ImageOff, MoreVertical, LayoutGrid, List, Eye, Pencil, Copy, Trash2 } from "lucide-react";
import { brl } from "../pricing.js";

export function Spinner({ theme, size = 15, style }) {
  return (
    <span
      className="app-spinner"
      style={{ width: size, height: size, color: theme?.textMuted || "#999", ...style }}
    />
  );
}

export function Card({ theme, children, style, ...rest }) {
  return (
    <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 8, boxShadow: "0 1px 2px rgba(16,24,40,0.04)", ...style }} {...rest}>
      {children}
    </div>
  );
}

export function Button({ theme, variant = "primary", children, style, ...rest }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "9px 14px", borderRadius: 8, fontSize: 13.5, fontWeight: 700,
    cursor: "pointer", border: "1px solid transparent", transition: "opacity .15s",
  };
  const variants = {
    primary: { background: theme.primary, color: "#fff" },
    ghost: { background: "transparent", color: theme.text, border: `1px solid ${theme.border}` },
    danger: { background: "transparent", color: theme.danger, border: `1px solid ${theme.border}` },
    soft: { background: theme.primarySoft, color: theme.primary },
  };
  return (
    <button
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.8)}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 5, opacity: 0.75 }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 11, opacity: 0.55, marginTop: 3 }}>{hint}</div>}
    </label>
  );
}

export function inputStyle(theme) {
  return {
    width: "100%", padding: "9px 11px", borderRadius: 8,
    border: `1px solid ${theme.border}`, fontSize: 13.5,
    background: theme.bg, color: theme.text, outline: "none", boxSizing: "border-box",
  };
}

export function iconBtn(theme) {
  return {
    background: theme.surfaceAlt, border: "none", borderRadius: 8, width: 34, height: 34,
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: theme.text,
    flexShrink: 0,
  };
}

export function Modal({ theme, title, onClose, children, width = 480 }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(20,18,15,0.45)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5vh 16px", zIndex: 50, overflowY: "auto" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: theme.surface, borderRadius: 12, width: "100%", maxWidth: width, padding: 22, color: theme.text, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 17, fontWeight: 800 }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.5 }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function StatCard({ theme, icon: Icon, label, value, sub, tone }) {
  return (
    <Card theme={theme} style={{ padding: "22px 20px", flex: "1 1 200px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, color: theme.textMuted }}>
        <Icon size={15} />
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</span>
      </div>
      <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: 30, fontWeight: 800, letterSpacing: "-0.5px", color: tone || theme.text }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: theme.textMuted, marginTop: 5 }}>{sub}</div>}
    </Card>
  );
}

export function Row({ theme, label, value, bold, tone, hint }) {
  return (
    <div style={{ padding: "3px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <span style={{ color: theme.textMuted }}>{label}</span>
        <span style={{ fontWeight: bold ? 700 : 600, color: tone || theme.text }}>{value}</span>
      </div>
      {hint && <div style={{ fontSize: 10.5, color: theme.textMuted, opacity: 0.75, marginTop: 1, lineHeight: 1.3 }}>{hint}</div>}
    </div>
  );
}

/** Campo numérico pequeno, usado dentro das linhas do resumo de custos. Vazio = null (usa o padrão). */
function InlineNumber({ theme, value, onChange, placeholder, prefix, suffix, step = "0.01" }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, color: theme.textMuted }}>
      {prefix}
      <input
        type="number" step={step} min={0} placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
        style={{
          width: 68, height: 26, padding: "0 6px", borderRadius: 6, fontSize: 12.5, textAlign: "right",
          border: `1px solid ${value != null ? theme.primary : theme.border}`, background: theme.surface, color: theme.text,
        }}
      />
      {suffix}
    </span>
  );
}

/** Linha do resumo com um campo editável à esquerda do valor. */
function EditableRow({ theme, label, hint, input, value }) {
  return (
    <div style={{ padding: "3px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 13 }}>
        <span style={{ color: theme.textMuted }}>{label}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {input}
          <span style={{ fontWeight: 600, color: theme.text, minWidth: 74, textAlign: "right" }}>{value}</span>
        </span>
      </div>
      {hint && <div style={{ fontSize: 10.5, color: theme.textMuted, opacity: 0.75, marginTop: 1, lineHeight: 1.3 }}>{hint}</div>}
    </div>
  );
}

/**
 * Resumo de custos/preço do cadastro de produto ou kit. Margem, manutenção e
 * rateio são editáveis direto aqui (vazio = padrão das Configurações); o
 * preço sugerido e o preço manual ficam destacados no fim.
 */
export function CostSummaryCard({ theme, calc, form, set, settings, isKit }) {
  const who = isKit ? "neste kit" : "neste produto";
  const marginAmount = calc.subtotal * (calc.margin / 100);
  const hasManual = calc.hasOverride;
  const priceRow = (label, value, active, hint) => (
    <div style={{ padding: "4px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 13.5, fontWeight: active ? 700 : 500, color: active ? theme.text : theme.textMuted }}>{label}</span>
        <span style={{ fontSize: active ? 19 : 15, fontWeight: 800, color: active ? theme.primary : theme.textMuted }}>{value}</span>
      </div>
      {hint && <div style={{ fontSize: 10.5, color: theme.textMuted, marginTop: 1, lineHeight: 1.3 }}>{hint}</div>}
    </div>
  );

  return (
    <div style={{ background: theme.surfaceAlt, borderRadius: 12, padding: 14, marginTop: 4 }}>
      {isKit ? (
        <Row theme={theme} label="Custo dos produtos + materiais extras" value={brl(calc.materialsCost)}
          hint="Soma do custo (não o preço de venda) de cada produto do kit, mais os materiais extras adicionados aqui — evita cobrar margem duas vezes." />
      ) : (
        <>
          <Row theme={theme} label="Custo de materiais / componentes" value={brl(calc.materialsCost)}
            hint="Soma de cada material da ficha técnica: preço × quantidade usada, já com a % de perda de cada material." />
          <Row theme={theme} label="Mão de obra" value={brl(calc.laborCost)}
            hint="Tempo de produção (min) ÷ 60 × custo da hora de mão de obra (Configurações)." />
        </>
      )}
      <EditableRow theme={theme} label="Manutenção de equipamento" value={brl(calc.maintenanceCost)}
        input={<InlineNumber theme={theme} step="0.1" suffix="%" placeholder={String(settings.maintenance_percent)}
          value={form.maintenance_percent_override} onChange={(v) => set("maintenance_percent_override", v)} />}
        hint={calc.customMaintenance
          ? `Personalizado ${who} (padrão: ${settings.maintenance_percent}%). Apague o campo pra voltar ao padrão.`
          : `% sobre ${isKit ? "o custo dos produtos/materiais" : "(materiais + mão de obra)"}. Vazio = padrão das Configurações.`} />
      <EditableRow theme={theme} label="Rateio de despesas fixas" value={brl(calc.fixedExpenseShare)}
        input={<InlineNumber theme={theme} prefix="R$" placeholder={calc.defaultFixedExpenseShare.toFixed(2)}
          value={form.fixed_expense_share_override} onChange={(v) => set("fixed_expense_share_override", v)} />}
        hint={calc.customFixedExpense
          ? `Personalizado ${who} (padrão: ${brl(calc.defaultFixedExpenseShare)}). Apague o campo pra voltar ao padrão.`
          : "Fatia das contas fixas do mês. Vazio = padrão das Configurações; pode diminuir ou zerar."} />

      <div style={{ borderTop: `1px solid ${theme.border}`, margin: "6px 0" }} />
      <Row theme={theme} label="Custo total" value={brl(calc.subtotal)} bold
        hint={isKit ? "Custo dos produtos/materiais + manutenção + rateio de despesas fixas." : "Materiais + mão de obra + manutenção + rateio de despesas fixas."} />
      <EditableRow theme={theme} label="Margem" value={`+ ${brl(marginAmount)}`}
        input={<InlineNumber theme={theme} step="1" suffix="%" placeholder={String(settings.default_margin_percent)}
          value={form.margin_percent} onChange={(v) => set("margin_percent", v)} />}
        hint={`Margem sobre o custo total, usada no preço sugerido. Vazio = padrão (${settings.default_margin_percent}%).`} />
      <Row theme={theme} label="Lucro líquido estimado" value={`${brl(calc.profit)} (${calc.realMarginPercent.toFixed(0)}%)`} tone={calc.belowCost ? theme.danger : theme.good}
        hint="Preço de venda − custo total." />

      <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: theme.primarySoft, border: `1.5px solid ${theme.primary}` }}>
        {priceRow("Preço sugerido", brl(calc.roundedPrice), !hasManual,
          "Custo total + margem + taxa de cartão, arredondado pra terminar em ',90' se a opção estiver ligada em Configurações.")}
        <div style={{ borderTop: `1px dashed ${theme.primary}55`, margin: "4px 0" }} />
        {priceRow("Preço de venda (manual)", hasManual ? brl(calc.finalPrice) : "—", hasManual,
          !hasManual
            ? "Não definido — vale o preço sugerido."
            : calc.belowCost
              ? "Atenção: abaixo do custo total — cada venda dá prejuízo."
              : "É esse o preço usado no lucro, no estoque e nas vendas.")}
      </div>
    </div>
  );
}

export function Pagination({ theme, page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const navBtn = (disabled) => ({
    width: 30, height: 30, borderRadius: 8, border: `1px solid ${theme.border}`,
    background: theme.surface, display: "flex", alignItems: "center", justifyContent: "center",
    cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.4 : 1, color: theme.text,
  });
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 0 4px" }}>
      <button style={navBtn(page <= 1)} disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={15} /></button>
      <span style={{ fontSize: 12.5, color: theme.textMuted, minWidth: 92, textAlign: "center" }}>Página {page} de {totalPages}</span>
      <button style={navBtn(page >= totalPages)} disabled={page >= totalPages} onClick={() => onChange(page + 1)}><ChevronRight size={15} /></button>
    </div>
  );
}

export function SortHeader({ theme, label, field, sort, onSort, align }) {
  const active = sort.field === field;
  return (
    <button
      onClick={() => onSort(field)}
      style={{
        display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", padding: 0,
        cursor: "pointer", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4,
        color: theme.textMuted, justifyContent: align === "right" ? "flex-end" : "flex-start", width: "100%",
      }}
    >
      {label}
      {active && (sort.dir === "asc" ? <ChevronUp size={12} color={theme.primary} /> : <ChevronDown size={12} color={theme.primary} />)}
    </button>
  );
}

export function ActionsMenu({ theme, actions }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const openMenu = () => {
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onDismiss = () => setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("scroll", onDismiss, true);
    window.addEventListener("resize", onDismiss);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("scroll", onDismiss, true);
      window.removeEventListener("resize", onDismiss);
    };
  }, [open]);

  return (
    <>
      <button ref={btnRef} onClick={() => (open ? setOpen(false) : openMenu())} style={iconBtn(theme)}>
        <MoreVertical size={16} />
      </button>
      {open && pos && createPortal(
        <div ref={menuRef} style={{ position: "fixed", top: pos.top, right: pos.right, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.18)", minWidth: 170, zIndex: 1000, overflow: "hidden" }}>
          {actions.map((a, i) => {
            const Icon = a.icon;
            return (
              <button
                key={i}
                onClick={() => { setOpen(false); a.onClick(); }}
                style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "11px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: a.danger ? theme.danger : theme.text, textAlign: "left" }}
              >
                {Icon && <Icon size={14} />}
                {a.label}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}

export function ConfirmModal({ theme, title = "Confirmar exclusão", message, confirmLabel = "Excluir", onConfirm, onCancel }) {
  return (
    <Modal theme={theme} title={title} onClose={onCancel} width={380}>
      <div style={{ fontSize: 13.5, color: theme.textMuted, marginBottom: 20, lineHeight: 1.5 }}>{message}</div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button theme={theme} variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button theme={theme} onClick={onConfirm} style={{ background: theme.danger }}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

export function MaterialDetailModal({ theme, material, onClose }) {
  const low = Number(material.stock) <= Number(material.min_stock);
  const [lightbox, setLightbox] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const images = material.image_urls || [];
  return (
    <Modal theme={theme} title={material.name} onClose={onClose} width={420}>
      {images[0] ? (
        <img src={images[0]} alt="" onClick={() => setLightbox(true)} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8, marginBottom: 14, cursor: "zoom-in" }} />
      ) : (
        <div style={{ height: 160, borderRadius: 8, background: theme.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <ImageOff size={26} color={theme.textMuted} />
        </div>
      )}
      <Row theme={theme} label="Categoria" value={material.category || "—"} />
      <Row theme={theme} label="Preço" value={`${brl(material.price)} / ${material.unit}`} />
      <Row theme={theme} label="Estoque" value={`${material.stock} ${material.unit}`} tone={low ? theme.danger : undefined} />
      <Row theme={theme} label="Estoque mínimo" value={`${material.min_stock} ${material.unit}`} />
      <Row theme={theme} label="% de perda" value={`${material.waste_percent || 0}%`} />
      {material.reference_measure && <Row theme={theme} label="Medida de referência" value={material.reference_measure} />}
      {material.supplier && <Row theme={theme} label="Fornecedor" value={material.supplier} />}
      {material.technical_description && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, opacity: 0.6, marginBottom: 6 }}>Descrição técnica</div>
          <div style={{ fontSize: 13, color: theme.text, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{material.technical_description}</div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <Button theme={theme} variant="ghost" onClick={onClose}>Fechar</Button>
      </div>
      {lightbox && <Lightbox images={images} index={lightboxIdx} onChangeIndex={setLightboxIdx} onClose={() => setLightbox(false)} />}
    </Modal>
  );
}

export function Lightbox({ images, index = 0, onChangeIndex, onClose }) {
  const list = images && images.length ? images : [];
  const current = Math.min(index, Math.max(list.length - 1, 0));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (list.length > 1 && e.key === "ArrowLeft") onChangeIndex((current - 1 + list.length) % list.length);
      if (list.length > 1 && e.key === "ArrowRight") onChangeIndex((current + 1) % list.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, list.length, onChangeIndex, onClose]);

  if (list.length === 0) return null;
  const navBtn = { position: "absolute", top: "50%", transform: "translateY(-50%)", width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.14)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.92)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ position: "absolute", top: 18, right: 18, width: 38, height: 38, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.14)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
        <X size={18} />
      </button>
      <img src={list[current]} alt="" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "88vh", objectFit: "contain", borderRadius: 6 }} />
      {list.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onChangeIndex((current - 1 + list.length) % list.length); }} style={{ ...navBtn, left: 18 }}>
            <ChevronLeft size={22} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onChangeIndex((current + 1) % list.length); }} style={{ ...navBtn, right: 18 }}>
            <ChevronRight size={22} />
          </button>
          <div style={{ position: "absolute", bottom: 22, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
            {list.map((_, i) => (
              <span
                key={i}
                onClick={(e) => { e.stopPropagation(); onChangeIndex(i); }}
                style={{ width: 7, height: 7, borderRadius: "50%", background: i === current ? "#fff" : "rgba(255,255,255,0.4)", cursor: "pointer" }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function Carousel({ theme, images, height = 200 }) {
  const [idx, setIdx] = React.useState(0);
  const [lightbox, setLightbox] = React.useState(false);
  const list = images && images.length ? images : [];
  const current = Math.min(idx, Math.max(list.length - 1, 0));
  if (list.length === 0) {
    return (
      <div style={{ height, background: theme.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", color: theme.textMuted, borderRadius: 8 }}>
        <ImageOff size={26} />
      </div>
    );
  }
  return (
    <div style={{ position: "relative", height, borderRadius: 8, overflow: "hidden", background: theme.surfaceAlt }}>
      <img src={list[current]} alt="" onClick={() => setLightbox(true)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", cursor: "zoom-in" }} />
      {list.length > 1 && (
        <>
          <button onClick={() => setIdx((current - 1 + list.length) % list.length)} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.45)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronLeft size={15} />
          </button>
          <button onClick={() => setIdx((current + 1) % list.length)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.45)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronRight size={15} />
          </button>
          <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 5 }}>
            {list.map((_, i) => (
              <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i === current ? "#fff" : "rgba(255,255,255,0.5)" }} />
            ))}
          </div>
        </>
      )}
      {lightbox && <Lightbox images={list} index={current} onChangeIndex={setIdx} onClose={() => setLightbox(false)} />}
    </div>
  );
}

export const UNIT_OPTIONS = [
  { value: "m", label: "metro (m)" },
  { value: "cm", label: "centímetro (cm)" },
  { value: "m2", label: "metro² (m²)" },
  { value: "cm2", label: "centímetro² (cm²)" },
  { value: "kg", label: "quilo (kg)" },
  { value: "g", label: "grama (g)" },
  { value: "l", label: "litro (L)" },
  { value: "ml", label: "mililitro (ml)" },
  { value: "un", label: "unidade" },
];

/** Modo de exibição ("cards" | "table") lembrado por página no navegador. */
export function useViewMode(key, fallback = "cards") {
  const storageKey = `precifica.view.${key}`;
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem(storageKey) || fallback; } catch { return fallback; }
  });
  const change = (next) => {
    setMode(next);
    try { localStorage.setItem(storageKey, next); } catch { /* sem storage, só não lembra */ }
  };
  return [mode, change];
}

export function ViewToggle({ theme, value, onChange }) {
  const btn = (mode, Icon, title) => (
    <button
      onClick={() => onChange(mode)}
      title={title}
      style={{
        width: 34, height: 34, border: "none", borderRadius: 7, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: value === mode ? theme.surface : "transparent",
        color: value === mode ? theme.text : theme.textMuted,
        boxShadow: value === mode ? "0 1px 2px rgba(16,24,40,0.08)" : "none",
      }}
    >
      <Icon size={15} />
    </button>
  );
  return (
    <div style={{ display: "flex", gap: 2, padding: 2, borderRadius: 9, background: theme.surfaceAlt, flexShrink: 0 }}>
      {btn("cards", LayoutGrid, "Ver em cards (com fotos)")}
      {btn("table", List, "Ver em lista (tabela)")}
    </div>
  );
}

/** Miniatura clicável (abre a foto grande). */
export function Thumb({ theme, images, size = 38 }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const list = images || [];
  return (
    <div style={{ width: size, height: size, borderRadius: 6, overflow: "hidden", background: theme.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {list[0] ? (
        <img src={list[0]} alt="" onClick={() => { setIdx(0); setOpen(true); }} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in" }} />
      ) : (
        <ImageOff size={Math.round(size * 0.42)} color={theme.textMuted} />
      )}
      {open && <Lightbox images={list} index={idx} onChangeIndex={setIdx} onClose={() => setOpen(false)} />}
    </div>
  );
}

/**
 * Tabela simples em grid. columns: [{ label, width, align, render(row) }].
 * Rola na horizontal em tela pequena em vez de espremer as colunas.
 */
export function DataTable({ theme, columns, rows, rowKey, minWidth = 760, empty }) {
  const template = columns.map((c) => c.width || "1fr").join(" ");
  const cell = (c) => ({ display: "flex", alignItems: "center", justifyContent: c.align === "right" ? "flex-end" : c.align === "center" ? "center" : "flex-start", minWidth: 0, gap: 6 });
  return (
    <Card theme={theme} style={{ overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth }}>
          <div style={{ display: "grid", gridTemplateColumns: template, gap: 12, padding: "10px 16px", background: theme.surfaceAlt, borderBottom: `1px solid ${theme.border}`, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: theme.textMuted }}>
            {columns.map((c, i) => <div key={i} style={cell(c)}>{c.label}</div>)}
          </div>
          {rows.length === 0 && empty && <div style={{ padding: 24, textAlign: "center", color: theme.textMuted, fontSize: 13 }}>{empty}</div>}
          {rows.map((row, ri) => (
            <div key={rowKey(row)} style={{ display: "grid", gridTemplateColumns: template, gap: 12, padding: "9px 16px", alignItems: "center", fontSize: 13.5, borderBottom: ri < rows.length - 1 ? `1px solid ${theme.border}` : "none" }}>
              {columns.map((c, i) => <div key={i} style={cell(c)}>{c.render(row)}</div>)}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/** Ações de linha das tabelas de produtos/kits. Só mostra o que for passado. */
export function RowActions({ theme, onView, onEdit, onDuplicate, onDelete }) {
  const btn = { ...iconBtn(theme), width: 30, height: 30, borderRadius: 7 };
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {onView && <button onClick={onView} style={btn} title="Ver produto"><Eye size={13} /></button>}
      {onEdit && <button onClick={onEdit} style={btn} title="Editar"><Pencil size={13} /></button>}
      {onDuplicate && <button onClick={onDuplicate} style={btn} title="Duplicar"><Copy size={13} /></button>}
      {onDelete && <button onClick={onDelete} style={btn} title="Apagar"><Trash2 size={13} /></button>}
    </div>
  );
}
