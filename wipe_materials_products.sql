-- ============================================================================
-- ATENÇÃO — AÇÃO IRREVERSÍVEL
--
-- Isso apaga TODOS os materiais e produtos (e tudo que depende deles: ficha
-- técnica, kits, histórico de preço de material, produção registrada) de
-- TODOS os usuários — não é filtrado por owner_id.
--
-- NÃO apaga: usuários, planos, nichos, configurações de precificação nem
-- orçamentos salvos (quotes) — esses continuam intactos.
--
-- Só rode isso se você realmente quer começar materiais e produtos do zero.
-- Não tem como desfazer depois.
-- ============================================================================

delete from public.product_kit_items;
delete from public.product_materials;
delete from public.production_log;
delete from public.products;
delete from public.material_price_history;
delete from public.materials;
