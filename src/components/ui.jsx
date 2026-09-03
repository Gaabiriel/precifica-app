import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ImageOff, MoreVertical } from "lucide-react";
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
  return (
    <Modal theme={theme} title={material.name} onClose={onClose} width={420}>
      {material.image_urls?.[0] ? (
        <img src={material.image_urls[0]} alt="" style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8, marginBottom: 14 }} />
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
    </Modal>
  );
}

export function Carousel({ theme, images, height = 200 }) {
  const [idx, setIdx] = React.useState(0);
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
      <img src={list[current]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
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
