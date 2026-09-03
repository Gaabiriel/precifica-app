-- ============================================================================
-- Adiciona "investimento inicial" às configurações (equipamentos, softwares,
-- estoque de partida etc.) — usado em Relatórios pra acompanhar quanto do
-- investimento já voltou em forma de lucro das vendas.
--
-- Rode isso uma vez no SQL Editor do Supabase.
-- ============================================================================

alter table public.settings add column if not exists initial_investment numeric not null default 0;
