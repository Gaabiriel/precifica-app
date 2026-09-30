-- Diagnóstico (só leitura): confirma se a migração marcou os produtos certos
-- e mostra quem ainda usa os materiais que aparecem no alerta.

-- 1) Quantos produtos ficaram com has_stock_control = false / true
select has_stock_control, count(*) as qtd
from public.products
where owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee'
group by has_stock_control;

-- 2) Pra cada material do alerta, quem usa ele e se esse produto controla estoque
select
  m.name as material,
  m.stock, m.min_stock,
  p.name as produto,
  p.has_stock_control
from public.materials m
join public.product_materials pm on pm.material_id = m.id
join public.products p on p.id = pm.product_id
where m.owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee'
  and m.name in (
    'Alça de mão', 'Alça de mão + orelhinha', 'Alça de mão 2', 'Argola 2 mm',
    'Corvin Dune - 0,8 (Azul Marinho e Grafite)', 'Cursor', 'Etiqueta em Couro / Cetim',
    'Fita de Cetim preta', 'Mosquetão 2mm', 'Napa Branca KL', 'Sacola - (G)',
    'TNT Cinza Chumbo', 'TNT Laranja', 'Ziper Tratorado'
  )
order by m.name, p.name;
