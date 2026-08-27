-- ============================================================================
-- MIGRAÇÃO: permite leitura pública da lista de nichos (nome + cores).
--
-- A tela de cadastro (antes do login) precisa listar os nichos disponíveis
-- pra pessoa escolher o dela. Hoje a política só libera leitura pra quem já
-- está autenticado, então a lista de nichos na tela de cadastro não pode vir
-- do banco (por isso hoje ela é fixa no código). Isso libera a leitura pra
-- qualquer um — não tem nada sensível na tabela (só nome, slug e cores).
-- ============================================================================

drop policy if exists "niches_select" on public.niches;
create policy "niches_select" on public.niches for select using (true);
