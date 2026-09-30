-- ============================================================================
-- Registro de vendas. "produced_count - sold_count" (ambos em products) dá o
-- que já foi produzido e ainda não vendido -- registrar uma venda soma em
-- sold_count e grava o histórico na tabela sales.
-- ============================================================================

alter table public.products add column if not exists sold_count numeric not null default 0;

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  qty numeric not null,
  total_price numeric not null default 0,
  notes text,
  sold_at timestamptz not null default now()
);
create index if not exists sales_owner_idx on public.sales(owner_id);
create index if not exists sales_product_idx on public.sales(product_id);

alter table public.sales enable row level security;

drop policy if exists "sales_owner" on public.sales;
create policy "sales_owner" on public.sales for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
