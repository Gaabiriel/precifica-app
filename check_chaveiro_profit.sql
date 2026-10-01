-- Diagnóstico (só leitura): confere a conta do "Chaveiro" que deu lucro negativo.
select p.name, p.margin_percent, p.sale_price_override, p.labor_minutes
from public.products p
where p.owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee' and p.name = 'CHAVEIRO';

select s.qty, s.total_price, s.sold_at, s.type
from public.sales s
join public.products p on p.id = s.product_id
where p.owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee' and p.name = 'CHAVEIRO'
order by s.sold_at desc;

select labor_cost_per_hour, monthly_fixed_expenses, monthly_capacity_units, maintenance_percent, card_fee_percent, default_margin_percent
from public.settings
where owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee';
