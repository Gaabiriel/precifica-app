-- Exclusão lógica de produtos: em vez de apagar a linha, o app preenche
-- deleted_at. O produto some das listagens, mas as vendas já registradas
-- continuam apontando pra ele (histórico e lucro não se perdem).
alter table public.products add column if not exists deleted_at timestamptz;
