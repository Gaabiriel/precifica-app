-- Quais materiais mais pesam no "Valor em estoque (materiais)" do painel.
-- valor = preço por unidade × estoque. Materiais antigos já não entram na conta.
select
  name,
  unit,
  price,
  stock,
  round(price * stock, 2) as valor_em_estoque,
  is_old_material
from public.materials
where owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee'
order by is_old_material, price * stock desc
limit 30;

-- Totais: com e sem os materiais antigos.
select
  round(sum(price * greatest(stock, 0)) filter (where not is_old_material), 2) as total_sem_antigos,
  round(sum(price * greatest(stock, 0)) filter (where is_old_material), 2)     as total_antigos,
  round(sum(price * greatest(stock, 0)), 2)                                    as total_geral
from public.materials
where owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee';
