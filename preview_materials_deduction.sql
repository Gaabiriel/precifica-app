-- PASSO 1 (só leitura): mostra o que o desconto de materiais vai fazer.
-- Considera produtos ativos com estoque > 0 que ainda não descontaram
-- (materials_deducted = false) e que NÃO vieram do antigo "Produzir"
-- (produced_count = 0, esses já descontaram na época). Materiais antigos ficam de fora.

-- 1a) produtos que entram no desconto
select p.name, p.color, p.stock_qty
from public.products p
where p.owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee'
  and p.deleted_at is null and not p.materials_deducted
  and p.stock_qty > 0 and coalesce(p.produced_count, 0) = 0
order by p.name;

-- 1b) quanto sai de cada material e quanto fica
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
)
select m.name, m.unit, m.stock as estoque_atual, round(u.qty, 3) as vai_sair, round(m.stock - u.qty, 3) as fica
from usage u join public.materials m on m.id = u.material_id
order by (m.stock - u.qty), m.name;
