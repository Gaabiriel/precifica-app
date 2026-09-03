-- ============================================================================
-- Adiciona logo por usuário (cada conta pode ter a logo do próprio negócio,
-- em vez de todo mundo usar a marca genérica do Precifica na sidebar).
--
-- Rode isso uma vez no SQL Editor do Supabase.
-- ============================================================================

alter table public.profiles add column if not exists logo_url text;
