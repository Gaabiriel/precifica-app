-- Corrige o add_is_old_material.sql: materiais do seed original que sua mãe
-- já renomeou pra MAIÚSCULAS (ex.: "Embalagem" -> "EMBALAGEM") viraram
-- materiais reais em uso -- não são mais "antigos".
update public.materials
set is_old_material = false
where owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee'
  and is_old_material = true
  and name = upper(name);

-- Confere: o que continua marcado como antigo e quantos produtos usam cada um.
select m.name, m.stock, count(pm.id) as produtos_que_usam
from public.materials m
left join public.product_materials pm on pm.material_id = m.id
where m.owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee'
  and m.is_old_material = true
group by m.id, m.name, m.stock
order by produtos_que_usam desc, m.name;
