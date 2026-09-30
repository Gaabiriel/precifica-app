-- ============================================================================
-- Distingue "venda" de "remoção" (baixa manual de estoque pronto sem venda,
-- ex.: defeito, perda, brinde) dentro da mesma tabela sales -- ambas descontam
-- de sold_count, só muda como aparece no histórico e no que soma como receita.
-- ============================================================================

alter table public.sales add column if not exists type text not null default 'venda';
