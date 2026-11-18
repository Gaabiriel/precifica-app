-- Orçamento novo: desconto no total, condições gerais fixas, modelos de
-- formas de pagamento (sob encomenda / pronta entrega), frase do título e
-- agradecimento do PDF.
-- O desconto por item fica dentro de quotes.items (campo discount_percent de cada item).
--
-- Rode isso uma vez no SQL Editor do Supabase. Pode rodar de novo sem problema
-- (inclusive se já rodou a versão anterior deste arquivo).

-- desconto no orçamento todo
alter table public.quotes add column if not exists discount_type text not null default 'percent';  -- 'percent' | 'value'
alter table public.quotes add column if not exists discount_value numeric not null default 0;

-- textos do orçamento (por vendedor). Nos modelos, [Nome do Cliente], [Total]
-- e [Metade] são trocados pelos valores do orçamento na hora de gerar.
-- Vazios = cada vendedor preenche em Configurações (lá tem "Usar texto sugerido").
alter table public.settings add column if not exists quote_general_conditions text;
alter table public.settings add column if not exists quote_template_custom text;   -- sob encomenda
alter table public.settings add column if not exists quote_template_ready text;    -- pronta entrega
alter table public.settings add column if not exists quote_subtitle text;          -- frase abaixo do título
alter table public.settings add column if not exists quote_thanks text;            -- null = padrão do app; '' = sem agradecimento

-- textos do ateliê da Izabela (só a conta dela; só onde ainda está vazio)
update public.settings set
  quote_subtitle = coalesce(quote_subtitle, 'Peças feitas à mão, com carinho'),
  quote_thanks = coalesce(quote_thanks, 'Obrigada pela confiança'),
  quote_general_conditions = coalesce(quote_general_conditions,
'• Pronta entrega: pagamento integral (Pix à vista ou Pix no Crédito). Envio em até 2 dias úteis após a confirmação.
• Sob encomenda: 50% de sinal no pedido + 50% na entrega (Pix), ou integral no Pix no Crédito. Não há devolução do sinal em caso de desistência após a compra dos materiais ou início da produção.
• Frete: por conta do cliente (consulte opções de envio ou retirada).'),
  quote_template_custom = coalesce(quote_template_custom,
'Formas de pagamento:
• Sinal + entrega (Pix): 50% ([Metade]) no fechamento do pedido, pra reservar sua vaga e os materiais, e 50% ([Metade] + frete, se houver) quando a peça estiver pronta, antes do envio/retirada.
• À vista no Pix: [Total].
• Cartão de crédito: em até 12x pelo aplicativo do seu banco, na opção "Pix no Crédito" (juros da sua operadora).
Prazo de confecção: [X] dias úteis após a confirmação do sinal.
Informações importantes:
• Por se tratar de um produto artesanal feito sob medida/encomenda, não realizamos trocas ou cancelamentos após o início da produção.'),
  quote_template_ready = coalesce(quote_template_ready,
'Formas de pagamento:
• À vista no Pix: [Total].
• Cartão de crédito: em até 12x pelo aplicativo do seu banco, na opção "Pix no Crédito" (juros da sua operadora).
Envio/retirada: em até 2 dias úteis após a confirmação do pagamento.
Informações importantes:
• Para compras online (com envio), trocas ou devoluções podem ser solicitadas em até 7 dias corridos após o recebimento, desde que a peça esteja sem uso e na embalagem original.
• Consigo reservar a peça por até 24h.')
where owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee';

-- a versão anterior deste arquivo preencheu esses textos (de ateliê) pra todo
-- mundo: limpa nos outros vendedores onde ainda está igual ao da Izabela
with izabela as (
  select quote_general_conditions, quote_template_custom, quote_template_ready
  from public.settings where owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee'
)
update public.settings s set
  quote_general_conditions = case when s.quote_general_conditions = i.quote_general_conditions then null else s.quote_general_conditions end,
  quote_template_custom = case when s.quote_template_custom = i.quote_template_custom then null else s.quote_template_custom end,
  quote_template_ready = case when s.quote_template_ready = i.quote_template_ready then null else s.quote_template_ready end
from izabela i
where s.owner_id <> '62f88a4b-a969-4f1a-8150-bfd21787abee';

-- a validade agora vem só do campo "Válido até" do orçamento (já vem preenchido
-- com 7 dias): tira a linha fixa de validade das condições gerais pra não
-- aparecer duas vezes no PDF
update public.settings set
  quote_general_conditions = regexp_replace(quote_general_conditions, '\n?[^\n]*Orçamento válido por[^\n]*', '', 'g')
where quote_general_conditions ~ 'Orçamento válido por';
