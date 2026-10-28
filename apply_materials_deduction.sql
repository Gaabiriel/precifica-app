-- PASSO 2: desconta de verdade (rode o preview_materials_deduction.sql antes).
-- Um único comando: tira os materiais do estoque e marca os produtos como
-- descontados (materials_deducted = true), pra não descontar de novo.
with pending as (
  select p.id, p.stock_qty
  from public.products p
  where p.owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee'
    and p.deleted_at is null and not p.materials_deducted
    and p.stock_qty > 0 and coalesce(p.produced_count, 0) = 0
),
usage as (
  select pm.material_id, sum(pm.qty * pe.stock_qty) as qty
  from pending pe
  join public.product_materials pm on pm.product_id = pe.id
  join public.materials m on m.id = pm.material_id
  where not m.is_old_material
  group by pm.material_id
),
upd_materials as (
  update public.materials m
  set stock = round(m.stock - u.qty, 3)
  from usage u
  where m.id = u.material_id
  returning m.id
)
update public.products p
set materials_deducted = true
from pending pe
where p.id = pe.id;
