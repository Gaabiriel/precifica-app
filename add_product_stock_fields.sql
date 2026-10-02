-- ============================================================================
-- Produtos passam a ter estoque direto no cadastro (sem mais "Produzir"):
--   - main_material: material principal (texto livre)
--   - color:         cor (texto livre)
--   - stock_qty:     quantidade pronta em estoque -- vender desconta daqui
--
-- O estoque inicial de cada produto/kit vem do que já estava pronto e não
-- vendido (produced_count - sold_count), pra ninguém perder o saldo atual.
-- ============================================================================

alter table public.products add column if not exists main_material text;
alter table public.products add column if not exists color text;
alter table public.products add column if not exists stock_qty numeric not null default 0;

update public.products
set stock_qty = greatest(coalesce(produced_count, 0) - coalesce(sold_count, 0), 0)
where stock_qty = 0;
