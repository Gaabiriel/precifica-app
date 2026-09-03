-- ============================================================================
-- FIX: faltava política de RLS para INSERT em material_price_history.
--
-- A tabela só tinha política de SELECT ("price_history_owner"). O trigger
-- que grava o histórico de preço toda vez que um material é criado/editado
-- roda como o próprio usuário (não é security definer), então o INSERT
-- dele era bloqueado pelo RLS — o que fazia "Novo material" falhar com
-- "new row violates row-level security policy for table
-- material_price_history".
--
-- Rode isso uma vez no SQL Editor do Supabase.
-- ============================================================================

create policy "price_history_insert" on public.material_price_history for insert
  with check (exists(select 1 from public.materials m where m.id = material_id and m.owner_id = auth.uid()));
