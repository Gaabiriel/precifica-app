-- Catálogo público: o vendedor escolhe quais produtos aparecem num link
-- público (sem login) e se o preço de cada um aparece ou fica "sob consulta".
-- O cliente monta a lista e pede orçamento pelo WhatsApp.

-- configuração do catálogo (por vendedor)
alter table public.settings add column if not exists catalog_enabled boolean not null default false;
alter table public.settings add column if not exists catalog_slug text;       -- endereço: ?catalogo=<slug>
alter table public.settings add column if not exists catalog_whatsapp text;   -- só dígitos, com DDI (55...)
create unique index if not exists settings_catalog_slug_idx on public.settings (lower(catalog_slug)) where catalog_slug is not null;

-- por produto
alter table public.products add column if not exists show_in_catalog boolean not null default false;
alter table public.products add column if not exists catalog_show_price boolean not null default true;
alter table public.products add column if not exists catalog_price numeric;   -- preço de venda gravado pelo app (o cálculo é feito no navegador)

-- leitura pública: devolve SÓ os campos do catálogo (nada de custo, margem,
-- estoque exato etc.). As tabelas continuam fechadas pelo RLS; quem não está
-- logado só consegue chegar nos dados por esta função.
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
        'price', case when p.catalog_show_price then p.catalog_price end
      ) order by p.name, p.color)
      from public.products p
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
