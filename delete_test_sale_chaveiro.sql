-- Remove a venda de teste do Chaveiro (1 un, R$9,90, 01/10/2026) e devolve a
-- unidade pro estoque de prontos (sold_count -1).
do $$
declare
  v_owner uuid := '62f88a4b-a969-4f1a-8150-bfd21787abee';
  v_sale record;
begin
  select s.* into v_sale
  from public.sales s
  join public.products p on p.id = s.product_id
  where p.owner_id = v_owner and p.name = 'CHAVEIRO' and s.type = 'venda'
  order by s.sold_at desc
  limit 1;

  if v_sale is null then
    raise notice 'Nenhuma venda de Chaveiro encontrada -- nada a fazer.';
  else
    delete from public.sales where id = v_sale.id;
    update public.products set sold_count = greatest(sold_count - v_sale.qty, 0) where id = v_sale.product_id;
    raise notice 'Venda de % un removida e sold_count ajustado.', v_sale.qty;
  end if;
end $$;
