-- Diagnóstico (só leitura): ficha técnica atual do Chaveiro, material a material.
select
  m.name as material,
  m.unit,
  m.price,
  pm.qty,
  m.waste_percent,
  round((m.price * pm.qty * (1 + m.waste_percent / 100.0))::numeric, 4) as custo_da_linha
from public.product_materials pm
join public.materials m on m.id = pm.material_id
join public.products p on p.id = pm.product_id
where p.owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee' and p.name = 'CHAVEIRO';
