-- Catálogo público: produtos mais novos aparecem primeiro (dentro de cada
-- categoria; as categorias continuam em ordem alfabética, sem categoria por último).
-- Rode uma vez no SQL Editor do Supabase. Pode rodar de novo sem problema.

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
