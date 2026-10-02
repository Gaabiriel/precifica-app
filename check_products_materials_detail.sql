-- Diagnóstico (só leitura): lista produto + material + estoque do material,
-- com a flag has_stock_control de cada produto ao lado -- pra revisar antes
-- de rodar o fix_has_stock_control_by_material.sql de novo.
select
  p.name as produto,
  p.has_stock_control,
  m.name as material,
  m.stock as estoque_material,
  pm.qty as qtd_na_ficha
from public.product_materials pm
join public.products p on p.id = pm.product_id
join public.materials m on m.id = pm.material_id
where p.owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee'
order by p.has_stock_control desc, p.name, m.name;
