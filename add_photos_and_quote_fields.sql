-- ============================================================================
-- MIGRAÇÃO: fotos de produto (até 5, via Supabase Storage) + validade do orçamento
-- Rode isso uma vez no SQL Editor do seu projeto Supabase.
-- ============================================================================

-- 1) Produtos: coluna com a lista de URLs das fotos (a coluna antiga image_url
--    continua existindo, sem uso, e é migrada para dentro da lista nova).
alter table public.products add column if not exists image_urls text[] not null default '{}'::text[];

update public.products
set image_urls = array[image_url]
where image_url is not null and image_url <> '' and image_urls = '{}'::text[];

-- 2) Orçamentos: data de validade (o campo "notes" já existia e passa a ser
--    usado pela tela de Observações).
alter table public.quotes add column if not exists valid_until date;

-- 3) Bucket de storage para as fotos dos produtos (público para leitura).
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 4) Políticas de acesso: qualquer um lê (bucket público), mas só o dono
--    sobe/edita/apaga dentro da própria pasta (1º segmento do caminho = seu user id).
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "product_images_owner_write" on storage.objects;
create policy "product_images_owner_write" on storage.objects for insert
  with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "product_images_owner_update" on storage.objects;
create policy "product_images_owner_update" on storage.objects for update
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "product_images_owner_delete" on storage.objects;
create policy "product_images_owner_delete" on storage.objects for delete
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);
