-- ============================================================================
-- Categorias de material como tabela própria, em vez de texto livre.
-- Cria a tabela "categories" (com CRUD em Configurações) e adiciona
-- "category_id" em materials. O campo antigo "category" (texto) fica
-- no banco sem uso, só por segurança — nada é apagado.
--
-- Rode isso uma vez no SQL Editor do Supabase.
-- ============================================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (owner_id, name)
);
create index if not exists categories_owner_idx on public.categories(owner_id);

alter table public.categories enable row level security;

create policy "categories_owner" on public.categories for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

alter table public.materials add column if not exists category_id uuid references public.categories(id) on delete set null;
