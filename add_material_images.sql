-- ============================================================================
-- MIGRAÇÃO: fotos de material (até 5, via Supabase Storage — mesmo bucket
-- "product-images" já criado na migração anterior).
-- Rode isso uma vez no SQL Editor do seu projeto Supabase.
-- ============================================================================

alter table public.materials add column if not exists image_urls text[] not null default '{}'::text[];

update public.materials
set image_urls = array[image_url]
where image_url is not null and image_url <> '' and image_urls = '{}'::text[];
