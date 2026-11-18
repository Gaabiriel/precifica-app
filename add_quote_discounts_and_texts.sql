-- Orçamento novo: desconto no total, condições gerais fixas e modelos de
-- formas de pagamento (sob encomenda / pronta entrega).
-- O desconto por item fica dentro de quotes.items (campo discount_percent de cada item).
--
-- Rode isso uma vez no SQL Editor do Supabase.

-- desconto no orçamento todo
alter table public.quotes add column if not exists discount_type text not null default 'percent';  -- 'percent' | 'value'
alter table public.quotes add column if not exists discount_value numeric not null default 0;

-- textos do orçamento (por vendedor). Nos modelos, [Nome do Cliente], [Total]
-- e [Metade] são trocados pelos valores do orçamento na hora de gerar.
alter table public.settings add column if not exists quote_general_conditions text;
alter table public.settings add column if not exists quote_template_custom text;   -- sob encomenda
alter table public.settings add column if not exists quote_template_ready text;    -- pronta entrega

-- textos iniciais (só preenche onde ainda está vazio)
update public.settings set quote_general_conditions =
'• Pronta entrega: pagamento integral (Pix à vista ou Pix no Crédito). Envio em até 2 dias úteis após a confirmação.
• Sob encomenda: 50% de sinal no pedido + 50% na entrega (Pix), ou integral no Pix no Crédito. Não há devolução do sinal em caso de desistência após a compra dos materiais ou início da produção.
• Frete: por conta do cliente (consulte opções de envio ou retirada).
• Orçamento válido por 7 dias.'
where quote_general_conditions is null;

update public.settings set quote_template_custom =
'Formas de pagamento:
• Sinal + entrega (Pix): 50% ([Metade]) no fechamento do pedido, pra reservar sua vaga e os materiais, e 50% ([Metade] + frete, se houver) quando a peça estiver pronta, antes do envio/retirada.
• À vista no Pix: [Total].
• Cartão de crédito: em até 12x pelo aplicativo do seu banco, na opção "Pix no Crédito" (juros da sua operadora).
Prazo de confecção: [X] dias úteis após a confirmação do sinal.
Informações importantes:
• Por se tratar de um produto artesanal feito sob medida/encomenda, não realizamos trocas ou cancelamentos após o início da produção.'
where quote_template_custom is null;

update public.settings set quote_template_ready =
'Formas de pagamento:
• À vista no Pix: [Total].
• Cartão de crédito: em até 12x pelo aplicativo do seu banco, na opção "Pix no Crédito" (juros da sua operadora).
Envio/retirada: em até 2 dias úteis após a confirmação do pagamento.
Informações importantes:
• Para compras online (com envio), trocas ou devoluções podem ser solicitadas em até 7 dias corridos após o recebimento, desde que a peça esteja sem uso e na embalagem original.
• Consigo reservar a peça por até 24h.'
where quote_template_ready is null;
