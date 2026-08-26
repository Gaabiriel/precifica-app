import React from "react";
import { X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";

export function Card({ theme, children, style, ...rest }) {
  return (
    <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 14, ...style }} {...rest}>
      {children}
    </div>
  );
}

export function Button({ theme, variant = "primary", children, style, ...rest }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "9px 14px", borderRadius: 10, fontSize: 13.5, fontWeight: 600,
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
    width: "100%", padding: "9px 11px", borderRadius: 9,
    border: `1px solid ${theme.border}`, fontSize: 13.5,
    background: theme.bg, color: theme.text, outline: "none", boxSizing: "border-box",
  };
}

export function iconBtn(theme) {
  return {
    background: theme.surfaceAlt, border: "none", borderRadius: 7, width: 28, height: 28,
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: theme.text,
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
        style={{ background: theme.surface, borderRadius: 16, width: "100%", maxWidth: width, padding: 22, color: theme.text, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 19, fontWeight: 600 }}>{title}</div>
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
    <Card theme={theme} style={{ padding: 16, flex: "1 1 180px", minWidth: 160 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: theme.textMuted }}>
        <Icon size={16} />
        <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</span>
      </div>
      <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 24, fontWeight: 600, color: tone || theme.text }}>{value}</div>
      {sub && <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}

export function Row({ theme, label, value, bold, tone }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0" }}>
      <span style={{ color: theme.textMuted }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 600, color: tone || theme.text }}>{value}</span>
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
        cursor: "pointer", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3,
        color: active ? theme.text : theme.textMuted, justifyContent: align === "right" ? "flex-end" : "flex-start", width: "100%",
      }}
    >
      {label}
      {active && (sort.dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
    </button>
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
