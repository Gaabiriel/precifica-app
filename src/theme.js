export const FALLBACK_THEME = {
  bg: "#F4F5F5", surface: "#FFFFFF", surfaceAlt: "#E7EBEA", border: "#DCE1DF",
  primary: "#3F5E58", primarySoft: "#DCE6E2", accent: "#5B7F76",
  text: "#242927", textMuted: "#75837F", danger: "#B0524A", good: "#3F5E58",
};

/* -------------------------------------------------------------------------
 * Gerador de paleta por nicho: o admin escolhe só a cor principal, e o
 * resto da paleta é derivado dela — mantém o padrão "sóbrio, sem cores
 * fortes" do projeto sem depender de a pessoa acertar 10 cores na mão.
 * ---------------------------------------------------------------------- */

function hexToHsl(hex) {
  const m = hex.replace("#", "");
  const r = parseInt(m.substring(0, 2), 16) / 255;
  const g = parseInt(m.substring(2, 4), 16) / 255;
  const b = parseInt(m.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) { h = 0; s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.min(100, Math.max(0, s)) / 100;
  l = Math.min(100, Math.max(0, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Gera a paleta completa de um nicho a partir de uma cor principal (e,
 * opcionalmente, uma segunda cor de destaque com um matiz diferente — pra
 * temas "duotone" tipo rosa + azul — e um modo escuro).
 */
export function generateNicheTheme(primaryHex, opts = {}) {
  const dark = !!opts.dark;
  const accentHex = opts.accentHex || primaryHex;

  const primaryHsl = hexToHsl(primaryHex);
  const accentHsl = hexToHsl(accentHex);
  const h = primaryHsl.h;
  const ah = accentHsl.h;
  const primaryS = Math.min(primaryHsl.s, 55);
  const accentS = Math.min(accentHsl.s, 55);

  const palette = dark
    ? {
        bg: hslToHex(h, 26, 10),
        surface: hslToHex(h, 22, 14),
        surfaceAlt: hslToHex(h, 20, 19),
        border: hslToHex(h, 16, 27),
        primary: hslToHex(h, Math.min(primaryS + 10, 62), Math.min(Math.max(primaryHsl.l, 55), 68)),
        primarySoft: hslToHex(h, 28, 22),
        accent: hslToHex(ah, Math.min(accentS + 15, 65), Math.min(Math.max(accentHsl.l, 55), 70)),
        text: hslToHex(h, 10, 95),
        textMuted: hslToHex(h, 8, 68),
        danger: hslToHex(6, 65, 62),
        good: hslToHex(140, 40, 56),
      }
    : {
        bg: hslToHex(h, 16, 96.5),
        surface: "#FFFFFF",
        surfaceAlt: hslToHex(h, 22, 90.5),
        border: hslToHex(h, 24, 85),
        primary: hslToHex(h, primaryS, Math.min(Math.max(primaryHsl.l, 28), 42)),
        primarySoft: hslToHex(h, 38, 88),
        accent: hslToHex(ah, Math.min(accentS + 12, 60), Math.min(Math.max(accentHsl.l, 28), 42) + 10),
        text: hslToHex(h, 16, 16),
        textMuted: hslToHex(h, 12, 47),
        danger: hslToHex(6, 45, 50),
        good: hslToHex(120, 22, 40),
      };

  // guarda as cores de entrada no próprio objeto pra reabrir o editor depois
  // sem perder o que a pessoa escolheu (os campos acima são o que a UI usa).
  return { ...palette, dark, primaryHex, accentHex };
}

export function slugify(name) {
  return name
    .normalize("NFD").replace(new RegExp("[̀-ͯ]", "g"), "")
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
