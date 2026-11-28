-- Categorias de produtos (ex: Acessórios, Bolsas, Carteiras, Organizadores).
-- São por usuário (cada loja tem as suas), diferente das categorias de
-- material, que são por nicho. Servem pra filtrar a lista de produtos e pra
-- separar os produtos no catálogo online.
--
-- Rode isso uma vez no SQL Editor do Supabase (depois do add_public_catalog.sql).

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (owner_id, name)
);
create index if not exists product_categories_owner_idx on public.product_categories(owner_id);

alter table public.product_categories enable row level security;

drop policy if exists "product_categories_owner" on public.product_categories;
create policy "product_categories_owner" on public.product_categories for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

alter table public.products add column if not exists category_id uuid
  references public.product_categories(id) on delete set null;

-- as 4 categorias que a Izabela pediu (dá pra renomear/criar outras em Configurações)
insert into public.product_categories (owner_id, name)
select '62f88a4b-a969-4f1a-8150-bfd21787abee', c
from unnest(array['Acessórios', 'Bolsas', 'Carteiras', 'Organizadores']) as c
where exists (select 1 from public.profiles where id = '62f88a4b-a969-4f1a-8150-bfd21787abee')
on conflict (owner_id, name) do nothing;

-- catálogo público: agora devolve a categoria de cada produto, e ordena por
-- categoria (sem categoria por último) e, dentro dela, do mais novo pro mais antigo
create or replace function public.get_public_catalog(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'store', jsonb_build_object(
      'name', pr.full_name,
      'logo_url', pr.logo_url,
      'whatsapp', s.catalog_whatsapp,
      'theme', n.theme
    ),
    'products', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'color', p.color,
        'main_material', p.main_material,
        'dimensions', p.dimensions,
        'image_urls', p.image_urls,
        'is_kit', p.is_kit,
        'in_stock', p.stock_qty > 0,
        'price', case when p.catalog_show_price then p.catalog_price end,
        'category', c.name
      ) order by c.name nulls last, p.created_at desc, p.name)
      from public.products p
      left join public.product_categories c on c.id = p.category_id
      where p.owner_id = s.owner_id and p.show_in_catalog and p.deleted_at is null
    ), '[]'::jsonb)
  )
  from public.settings s
  join public.profiles pr on pr.id = s.owner_id
  left join public.niches n on n.id = pr.niche_id
  where s.catalog_enabled and lower(s.catalog_slug) = lower(p_slug);
$$;

revoke all on function public.get_public_catalog(text) from public;
grant execute on function public.get_public_catalog(text) to anon, authenticated;
