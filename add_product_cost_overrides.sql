-- Personalização de custos por produto: rateio de despesas fixas (R$) e
-- % de manutenção. null = usa o valor geral das Configurações.
alter table public.products add column if not exists fixed_expense_share_override numeric;
alter table public.products add column if not exists maintenance_percent_override numeric;
