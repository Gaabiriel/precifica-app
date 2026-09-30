-- ============================================================================
-- Diagnóstico (só leitura, não altera nada): lista os materiais do Ateliê de
-- Bolsas & Acessórios com estoque zerado (ou nulo) e mostra em quais produtos
-- (fichas técnicas) cada um é usado, se houver.
-- Rode no SQL Editor do Supabase e me mande o resultado.
-- ============================================================================

-- 1) Materiais sem estoque
select
  m.name        as material,
  m.unit        as unidade,
  m.price       as preco,
  m.stock       as estoque,
  c.name        as categoria,
  m.supplier    as fornecedor
from public.materials m
left join public.categories c on c.id = m.category_id
where m.owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee'
  and (m.stock is null or m.stock = 0)
order by c.name, m.name;

-- 2) Produtos que usam algum material sem estoque (ficha técnica travada)
select
  p.name          as produto,
  m.name          as material_sem_estoque,
  pm.qty          as qtd_usada_na_ficha
from public.product_materials pm
join public.products p  on p.id = pm.product_id
join public.materials m on m.id = pm.material_id
where m.owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee'
  and (m.stock is null or m.stock = 0)
order by p.name, m.name;
