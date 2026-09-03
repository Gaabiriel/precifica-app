-- ============================================================================
-- Adiciona "descrição técnica" aos materiais (composição, cuidados,
-- especificações etc.). O campo "dimensões" dos produtos já existe no
-- schema desde o início — só faltava aparecer na interface.
--
-- Rode isso uma vez no SQL Editor do Supabase.
-- ============================================================================

alter table public.materials add column if not exists technical_description text;
