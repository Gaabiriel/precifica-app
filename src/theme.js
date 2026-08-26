export const FALLBACK_THEME = {
  bg: "#F4F5F5", surface: "#FFFFFF", surfaceAlt: "#E7EBEA", border: "#DCE1DF",
  primary: "#3F5E58", primarySoft: "#DCE6E2", accent: "#5B7F76",
  text: "#242927", textMuted: "#75837F", danger: "#B0524A", good: "#3F5E58",
};

// Usado somente na tela de cadastro, antes de o usuário ter perfil —
// espelha o campo `theme` (jsonb) de cada linha da tabela `niches`.
export const SIGNUP_NICHES = [
  { slug: "bolsas", name: "Ateliê de Bolsas & Acessórios" },
  { slug: "doces", name: "Confeitaria & Doces Finos" },
  { slug: "generico", name: "Outro nicho" },
];
