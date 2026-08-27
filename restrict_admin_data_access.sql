-- ============================================================================
-- MIGRAÇÃO: isola os dados de negócio por usuário, mesmo para admin.
--
-- Hoje as políticas de acesso (RLS) permitiam "owner_id = auth.uid() OR
-- is_admin()" nas tabelas de negócio (materiais, produtos, kits, produção,
-- orçamentos, configurações). Isso significa que, sendo admin, você vê e
-- pode editar/excluir os dados de TODOS os usuários misturados nas telas
-- normais do app (Materiais, Produtos, Kits, Orçamentos), sem distinção de
-- dono. Isso é perigoso a partir do momento que existir mais de um usuário
-- real usando o sistema.
--
-- Depois dessa migração, cada usuário (inclusive admin) só vê e mexe nos
-- PRÓPRIOS dados de negócio. O painel Admin continua funcionando igual —
-- ele gerencia perfis/planos/nichos (tabelas separadas, que continuam com
-- acesso total pra admin), nunca mexeu em materiais/produtos de terceiros.
--
-- Rode isso uma vez no SQL Editor do seu projeto Supabase.
-- ============================================================================

drop policy if exists "settings_owner" on public.settings;
create policy "settings_owner" on public.settings for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "materials_owner" on public.materials;
create policy "materials_owner" on public.materials for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "price_history_owner" on public.material_price_history;
create policy "price_history_owner" on public.material_price_history for select
  using (exists(select 1 from public.materials m where m.id = material_id and m.owner_id = auth.uid()));

drop policy if exists "products_owner" on public.products;
create policy "products_owner" on public.products for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "product_materials_owner" on public.product_materials;
create policy "product_materials_owner" on public.product_materials for all
  using (exists(select 1 from public.products p where p.id = product_id and p.owner_id = auth.uid()))
  with check (exists(select 1 from public.products p where p.id = product_id and p.owner_id = auth.uid()));

drop policy if exists "kit_items_owner" on public.product_kit_items;
create policy "kit_items_owner" on public.product_kit_items for all
  using (exists(select 1 from public.products p where p.id = kit_product_id and p.owner_id = auth.uid()))
  with check (exists(select 1 from public.products p where p.id = kit_product_id and p.owner_id = auth.uid()));

drop policy if exists "production_owner" on public.production_log;
create policy "production_owner" on public.production_log for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "quotes_owner" on public.quotes;
create policy "quotes_owner" on public.quotes for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Não mexe em: niches, subscription_plans, profiles — essas continuam com
-- acesso total pra admin de propósito (é o que faz o painel Admin funcionar).
