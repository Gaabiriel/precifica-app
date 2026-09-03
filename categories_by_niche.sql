-- ============================================================================
-- Muda categorias de "por usuário" para "por nicho": todo mundo que usa o
-- mesmo tipo de negócio (ex: todas as papelarias) compartilha a mesma lista
-- de categorias, em vez de cada conta ter a sua própria do zero.
--
-- A tabela categories está vazia até agora (ninguém conseguiu salvar uma
-- categoria de verdade ainda), então é seguro recriar do zero.
--
-- Rode isso uma vez no SQL Editor do Supabase (substitui a migração
-- add_categories.sql anterior).
-- ============================================================================

drop policy if exists "categories_owner" on public.categories;
drop table if exists public.categories cascade;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  niche_id uuid not null references public.niches(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (niche_id, name)
);
create index categories_niche_idx on public.categories(niche_id);

alter table public.categories enable row level security;

create policy "categories_same_niche" on public.categories for all
  using (niche_id = (select p.niche_id from public.profiles p where p.id = auth.uid()))
  with check (niche_id = (select p.niche_id from public.profiles p where p.id = auth.uid()));

-- o "drop table ... cascade" acima também derrubou o vínculo de
-- materials.category_id com a tabela antiga; recria a referência
alter table public.materials add column if not exists category_id uuid;
alter table public.materials add constraint materials_category_id_fkey
  foreign key (category_id) references public.categories(id) on delete set null;
