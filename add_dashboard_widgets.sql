-- ============================================================================
-- Adiciona personalização dos cards da tela inicial (Visão geral): o
-- usuário pode reordenar, remover e adicionar de volta os widgets. A ordem
-- e quais estão visíveis ficam salvos aqui; null = usa o padrão do sistema.
--
-- Rode isso uma vez no SQL Editor do Supabase.
-- ============================================================================

alter table public.settings add column if not exists dashboard_widgets jsonb;
