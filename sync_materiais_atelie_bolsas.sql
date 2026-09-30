-- ============================================================================
-- Sincroniza a lista de materiais do Ateliê de Bolsas & Acessórios com a
-- contagem de estoque (MATERIAIS (1).xlsx): atualiza os 186 que já existem
-- (casando por nome exato) e cria os que ainda não foram cadastrados. Não
-- duplica e não depende de já ter rodado o seed_materiais_atelie_bolsas.sql
-- antes -- funciona em qualquer um dos dois estados.
--
-- ATENÇÃO sobre estoque: isso GRAVA o total da planilha por cima do que
-- estiver no banco (assume que a planilha é a contagem física mais recente).
-- Só rode assim enquanto ela ainda não usa o botão "Produzir" pra dar baixa
-- de verdade -- depois que começar a produzir, um reenvio da planilha não
-- deve mais sobrescrever o estoque, e sim somar as compras novas (isso pede
-- um script diferente, me avisa quando chegar nessa fase).
--
-- NÃO mexe em produtos/fichas técnicas. Rode uma vez no SQL Editor do Supabase.
-- ============================================================================

do $$
declare
  v_owner uuid := '62f88a4b-a969-4f1a-8150-bfd21787abee';
  v_niche uuid;
  v_id uuid;
  v_cat0 uuid;
  v_cat1 uuid;
  v_cat2 uuid;
  v_cat3 uuid;
  v_cat4 uuid;
begin
  select id into v_niche from public.niches where slug = 'bolsas';
  if v_niche is null then raise exception 'Nicho "bolsas" não encontrado.'; end if;

  -- categorias (garante que existem; nome já é a identidade, não precisa update)
  insert into public.categories (niche_id, name) values (v_niche, 'Aviamentos') on conflict (niche_id, name) do nothing;
  select id into v_cat0 from public.categories where niche_id = v_niche and name = 'Aviamentos';
  insert into public.categories (niche_id, name) values (v_niche, 'Estruturadores') on conflict (niche_id, name) do nothing;
  select id into v_cat1 from public.categories where niche_id = v_niche and name = 'Estruturadores';
  insert into public.categories (niche_id, name) values (v_niche, 'Ferragens e Acessórios') on conflict (niche_id, name) do nothing;
  select id into v_cat2 from public.categories where niche_id = v_niche and name = 'Ferragens e Acessórios';
  insert into public.categories (niche_id, name) values (v_niche, 'Tecido Externo') on conflict (niche_id, name) do nothing;
  select id into v_cat3 from public.categories where niche_id = v_niche and name = 'Tecido Externo';
  insert into public.categories (niche_id, name) values (v_niche, 'Tecido Interno') on conflict (niche_id, name) do nothing;
  select id into v_cat4 from public.categories where niche_id = v_niche and name = 'Tecido Interno';

  -- materiais: atualiza por nome se já existir, senão cria (186 itens, R$ 3949.63)

  select id into v_id from public.materials where owner_id = v_owner and name = 'ALÇA CHIQUE TELHA (3 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 3.0, stock = 20.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ALÇA CHIQUE TELHA (3 CM)', 'm', 3.0, 20.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ALÇA CHIQUE AZUL MARINHO (3 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 3.0, stock = 4.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ALÇA CHIQUE AZUL MARINHO (3 CM)', 'm', 3.0, 4.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ALÇA CHIQUE ROXO (3 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 3.0, stock = 2.24, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ALÇA CHIQUE ROXO (3 CM)', 'm', 3.0, 2.24, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ALÇA CHIQUE LARANJA (3 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 3.0, stock = 1.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ALÇA CHIQUE LARANJA (3 CM)', 'm', 3.0, 1.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ALÇA CHIQUE LISTRAS VERDE/VERMELHO (4 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 3.29, stock = 6.4, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ALÇA CHIQUE LISTRAS VERDE/VERMELHO (4 CM)', 'm', 3.29, 6.4, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ALÇA CHIQUE PINK FLUOR (3 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 3.0, stock = 1.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ALÇA CHIQUE PINK FLUOR (3 CM)', 'm', 3.0, 1.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ALÇA ESTAMPADA FOLHAGEM COLORS (3 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 3.4, stock = 20.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ALÇA ESTAMPADA FOLHAGEM COLORS (3 CM)', 'm', 3.4, 20.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'COURVIN DUNAS MOSTARDA 0,9 (1,40)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 38.61, stock = 0.75, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'COURVIN DUNAS MOSTARDA 0,9 (1,40)', 'm', 38.61, 0.75, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 06 NÍQUEL SIMPLES' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.15, stock = 23.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 06 NÍQUEL SIMPLES', 'un', 0.15, 23.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 06 OURO VELHO SIMPLES' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.18, stock = 6.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 06 OURO VELHO SIMPLES', 'un', 0.18, 6.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ZIPER 06 AZUL BIC' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.6, stock = 9.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ZIPER 06 AZUL BIC', 'm', 0.6, 9.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ZIPER 06 AZUL MARINHO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.6, stock = 2.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ZIPER 06 AZUL MARINHO', 'm', 0.6, 2.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ZIPER 06 LARANJA' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.6, stock = 2.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ZIPER 06 LARANJA', 'm', 0.6, 2.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ZIPER 06 ROXO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.6, stock = 3.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ZIPER 06 ROXO', 'm', 0.6, 3.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ZIPER 06 AZUL TIFANY' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.6, stock = 1.8, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ZIPER 06 AZUL TIFANY', 'm', 0.6, 1.8, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ETIQUETA DE CETIM PERSONALIZADA' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 0.29, stock = 167.0, supplier = 'LABEL PRINT PERSONALIZADOS', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ETIQUETA DE CETIM PERSONALIZADA', 'un', 0.29, 167.0, 0, 5, 'LABEL PRINT PERSONALIZADOS', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'FITA DUPLA FACE 8MM' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 5.55, stock = 3.0, supplier = 'BNVT VARIEDADES  -  SHOPEE', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'FITA DUPLA FACE 8MM', 'un', 5.55, 3.0, 0, 5, 'BNVT VARIEDADES  -  SHOPEE', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'FITA DUPLA FACE 4MM' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 3.54, stock = 4.0, supplier = 'BNVT VARIEDADES  -  SHOPEE', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'FITA DUPLA FACE 4MM', 'un', 3.54, 4.0, 0, 5, 'BNVT VARIEDADES  -  SHOPEE', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CORDÃO AZUL ROYAL' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.1, stock = 20.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'CORDÃO AZUL ROYAL', 'm', 0.1, 20.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'COURVIN 1.0 MAUI XADREZ BEGE (140X25)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 39.9, stock = 2.52, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = '140X25' where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'COURVIN 1.0 MAUI XADREZ BEGE (140X25)', 'm', 39.9, 2.52, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', '140X25');
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'POLIESTER PVC 600 LARANJA (150X50)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 10.68, stock = 2.25, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = '150X50' where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'POLIESTER PVC 600 LARANJA (150X50)', 'm', 10.68, 2.25, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', '150X50');
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'POLIESTER PVC 600 VERDE MUSGO (150X50)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 10.68, stock = 2.4, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = '150X50' where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'POLIESTER PVC 600 VERDE MUSGO (150X50)', 'm', 10.68, 2.4, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', '150X50');
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'TNT CINZA CHUMBO 80 (140X25)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat1, unit = 'm', price = 3.37, stock = 17.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = '140X25' where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat1, 'TNT CINZA CHUMBO 80 (140X25)', 'm', 3.37, 17.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', '140X25');
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'TNT BRANCO 80 (140X25)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat1, unit = 'm', price = 3.37, stock = 2.1, supplier = null, reference_measure = '140X25' where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat1, 'TNT BRANCO 80 (140X25)', 'm', 3.37, 2.1, 0, 5, null, '140X25');
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CARTÃO DE AGRADECIMENTO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 0.95, stock = 12.0, supplier = 'PRINT IT SERVIÇOS DE IMPRESSÃO', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'CARTÃO DE AGRADECIMENTO', 'un', 0.95, 12.0, 0, 5, 'PRINT IT SERVIÇOS DE IMPRESSÃO', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CARTÃO ETIQUETA SUJINHO LIMPINHO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 0.95, stock = 14.0, supplier = null, reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'CARTÃO ETIQUETA SUJINHO LIMPINHO', 'un', 0.95, 14.0, 0, 5, null, null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'NYLON RESINADO VERMELHO 150' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat4, unit = 'm', price = 10.0, stock = 1.3, supplier = 'TECIDOS IMPERIAL', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat4, 'NYLON RESINADO VERMELHO 150', 'm', 10.0, 1.3, 0, 5, 'TECIDOS IMPERIAL', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'TNT LARANJA (1.40)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat1, unit = 'm', price = 1.6, stock = 11.2, supplier = 'CRM TEXTIL LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat1, 'TNT LARANJA (1.40)', 'm', 1.6, 11.2, 0, 5, 'CRM TEXTIL LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'FITA DE CETIM AMARELO GEMA 10 METROS (2 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 5.0, stock = 2.0, supplier = 'OCEANA SÃO PAULO', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'FITA DE CETIM AMARELO GEMA 10 METROS (2 CM)', 'un', 5.0, 2.0, 0, 5, 'OCEANA SÃO PAULO', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'FITA DE CETIM BORDO - 10M - (2 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 5.0, stock = 2.0, supplier = 'OCEANA SÃO PAULO', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'FITA DE CETIM BORDO - 10M - (2 CM)', 'un', 5.0, 2.0, 0, 5, 'OCEANA SÃO PAULO', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'FITA DE CETIM CINZA - 10M - (2 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 5.0, stock = 3.0, supplier = 'OCEANA SÃO PAULO', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'FITA DE CETIM CINZA - 10M - (2 CM)', 'un', 5.0, 3.0, 0, 5, 'OCEANA SÃO PAULO', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'FITA DE CETIM AZUL PROFUNDO - 10 M - (2 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 5.0, stock = 3.0, supplier = 'OCEANA SÃO PAULO', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'FITA DE CETIM AZUL PROFUNDO - 10 M - (2 CM)', 'un', 5.0, 3.0, 0, 5, 'OCEANA SÃO PAULO', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'FITA DE CETIM CINZA - 10M (2 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 5.0, stock = 3.0, supplier = 'OCEANA SÃO PAULO', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'FITA DE CETIM CINZA - 10M (2 CM)', 'un', 5.0, 3.0, 0, 5, 'OCEANA SÃO PAULO', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ALÇA CADARÇO PRETO (1,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.5, stock = 45.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ALÇA CADARÇO PRETO (1,5 CM)', 'm', 0.5, 45.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ALÇA CADARÇO LARANJA (1,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.5, stock = 25.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ALÇA CADARÇO LARANJA (1,5 CM)', 'm', 0.5, 25.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ALÇA CADARÇO VERDE MUSGO (1,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.5, stock = 20.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ALÇA CADARÇO VERDE MUSGO (1,5 CM)', 'm', 0.5, 20.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ESPAGUETE (3 MM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.45, stock = 7.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ESPAGUETE (3 MM)', 'm', 0.45, 7.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ZIPER 06 BEGE KAKI' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.6, stock = 11.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ZIPER 06 BEGE KAKI', 'm', 0.6, 11.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ZIPER 06 AZUL ROYAL' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.6, stock = 2.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ZIPER 06 AZUL ROYAL', 'm', 0.6, 2.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ZIPER 06 PINK' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.6, stock = 10.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ZIPER 06 PINK', 'm', 0.6, 10.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ZIPER 06 PRETO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.6, stock = 7.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ZIPER 06 PRETO', 'm', 0.6, 7.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ALÇA CHIQUE LISTRAS BEGE/PRETO/AREIA (3 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 3.0, stock = 11.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ALÇA CHIQUE LISTRAS BEGE/PRETO/AREIA (3 CM)', 'm', 3.0, 11.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'NYLON POLIESTER ULY PRETO (1680)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 31.97, stock = 2.25, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'NYLON POLIESTER ULY PRETO (1680)', 'm', 31.97, 2.25, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'REGULADOR NÍQUEL (3 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 1.0, stock = 8.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'REGULADOR NÍQUEL (3 CM)', 'un', 1.0, 8.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'VIVO BRILHO ROSA PINK (4/11)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.8, stock = 2.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'VIVO BRILHO ROSA PINK (4/11)', 'm', 0.8, 2.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'TRICOLINE 100% ALGODÃO COLORIDO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 23.95, stock = 1.5, supplier = 'LUANA ARMARINHOS', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'TRICOLINE 100% ALGODÃO COLORIDO', 'm', 23.95, 1.5, 0, 5, 'LUANA ARMARINHOS', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'TNT BRANCO (150GR)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat1, unit = 'm', price = 14.9, stock = 1.65, supplier = 'LUANA ARMARINHOS', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat1, 'TNT BRANCO (150GR)', 'm', 14.9, 1.65, 0, 5, 'LUANA ARMARINHOS', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'VIÉS DESTAQUE ROSA PINK (35MM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.55, stock = 20.0, supplier = 'LUANA ARMARINHOS', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'VIÉS DESTAQUE ROSA PINK (35MM)', 'm', 0.55, 20.0, 0, 5, 'LUANA ARMARINHOS', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'VIÉS DESTAQUE AZUL ROYAL (35MM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.55, stock = 20.0, supplier = 'LUANA ARMARINHOS', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'VIÉS DESTAQUE AZUL ROYAL (35MM)', 'm', 0.55, 20.0, 0, 5, 'LUANA ARMARINHOS', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'PLÁSTICO CRISTAL (30 G) (1.40)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 24.5, stock = 1.61, supplier = 'LUANA ARMARINHOS', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'PLÁSTICO CRISTAL (30 G) (1.40)', 'm', 24.5, 1.61, 0, 5, 'LUANA ARMARINHOS', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'COURVIN DUNE 0,8 - AZUL MARINHO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 30.25, stock = 1.8, supplier = 'SÃO JORGE SINTÉTICO E AVIAMENTOS', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'COURVIN DUNE 0,8 - AZUL MARINHO', 'm', 30.25, 1.8, 0, 5, 'SÃO JORGE SINTÉTICO E AVIAMENTOS', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'COURVIN DUNE 0,8 - CAFÉ' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 30.25, stock = 0.42, supplier = 'SÃO JORGE SINTÉTICO E AVIAMENTOS', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'COURVIN DUNE 0,8 - CAFÉ', 'm', 30.25, 0.42, 0, 5, 'SÃO JORGE SINTÉTICO E AVIAMENTOS', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'COURVIN DUNE 0,8 - GRAFITE (140)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 36.52, stock = 0.84, supplier = 'SÃO JORGE SINTÉTICO E AVIAMENTOS', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'COURVIN DUNE 0,8 - GRAFITE (140)', 'm', 36.52, 0.84, 0, 5, 'SÃO JORGE SINTÉTICO E AVIAMENTOS', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CRISTAL FOSCO ALKLEAR TRANSPARENTE (0,40) (1,40)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 34.01, stock = 1.36, supplier = 'SÃO JORGE SINTÉTICO E AVIAMENTOS', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'CRISTAL FOSCO ALKLEAR TRANSPARENTE (0,40) (1,40)', 'm', 34.01, 1.36, 0, 5, 'SÃO JORGE SINTÉTICO E AVIAMENTOS', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CRISTAL COLOR LARANJA (0,40)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 23.92, stock = 1.0, supplier = 'SÃO JORGE SINTÉTICO E AVIAMENTOS', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'CRISTAL COLOR LARANJA (0,40)', 'm', 23.92, 1.0, 0, 5, 'SÃO JORGE SINTÉTICO E AVIAMENTOS', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CRISTAL COLOR PINK (0,40)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 23.92, stock = 1.0, supplier = 'SÃO JORGE SINTÉTICO E AVIAMENTOS', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'CRISTAL COLOR PINK (0,40)', 'm', 23.92, 1.0, 0, 5, 'SÃO JORGE SINTÉTICO E AVIAMENTOS', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CRISTAL COLOR PRETO (0,40)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 23.92, stock = 0.9, supplier = 'SÃO JORGE SINTÉTICO E AVIAMENTOS', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'CRISTAL COLOR PRETO (0,40)', 'm', 23.92, 0.9, 0, 5, 'SÃO JORGE SINTÉTICO E AVIAMENTOS', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ETIQUETA COURO SINTÉTICO GRAVADA E CORTADA' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 0.45, stock = 65.0, supplier = 'SÃO JORGE SINTÉTICO E AVIAMENTOS', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ETIQUETA COURO SINTÉTICO GRAVADA E CORTADA', 'un', 0.45, 65.0, 0, 5, 'SÃO JORGE SINTÉTICO E AVIAMENTOS', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'NAPA BRANCA KL (2800)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat4, unit = 'm', price = 9.79, stock = 2.5, supplier = 'SÃO JORGE SINTÉTICO E AVIAMENTOS', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat4, 'NAPA BRANCA KL (2800)', 'm', 9.79, 2.5, 0, 5, 'SÃO JORGE SINTÉTICO E AVIAMENTOS', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ZIPER 5 MARFIM' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.6, stock = 3.4, supplier = 'SÃO JORGE SINTÉTICO E AVIAMENTOS', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ZIPER 5 MARFIM', 'm', 0.6, 3.4, 0, 5, 'SÃO JORGE SINTÉTICO E AVIAMENTOS', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ZIPER 5 BRANCO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.6, stock = 7.4, supplier = 'SÃO JORGE SINTÉTICO E AVIAMENTOS', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ZIPER 5 BRANCO', 'm', 0.6, 7.4, 0, 5, 'SÃO JORGE SINTÉTICO E AVIAMENTOS', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ZIPER 5 CINZA CHUMBO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.6, stock = 19.1, supplier = 'SÃO JORGE SINTÉTICO E AVIAMENTOS', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ZIPER 5 CINZA CHUMBO', 'm', 0.6, 19.1, 0, 5, 'SÃO JORGE SINTÉTICO E AVIAMENTOS', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'TESOURA DE PRECISÃO CABO SOFT 6,5 POLEGADAS 17 CM' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 18.9, stock = 1.0, supplier = 'BNVT VARIEDADES  -  SHOPEE', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'TESOURA DE PRECISÃO CABO SOFT 6,5 POLEGADAS 17 CM', 'un', 18.9, 1.0, 0, 5, 'BNVT VARIEDADES  -  SHOPEE', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'REGUA DE AÇO INOX 100 CM' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 15.5, stock = 1.0, supplier = 'BNVT VARIEDADES  -  SHOPEE', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'REGUA DE AÇO INOX 100 CM', 'un', 15.5, 1.0, 0, 5, 'BNVT VARIEDADES  -  SHOPEE', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MEIA ARGOLA NIQUEL (1,5CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.65, stock = 16.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MEIA ARGOLA NIQUEL (1,5CM)', 'un', 0.65, 16.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MEIA ARGOLA NIQUEL (2 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.8, stock = 21.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MEIA ARGOLA NIQUEL (2 CM)', 'un', 0.8, 21.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MEIA ARGOLA NIQUEL (2,5CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.85, stock = 8.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MEIA ARGOLA NIQUEL (2,5CM)', 'un', 0.85, 8.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MEIA ARGOLA NIQUEL (3 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.9, stock = 25.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MEIA ARGOLA NIQUEL (3 CM)', 'un', 0.9, 25.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MEIA ARGOLA OURO CATAFORÉTICO (2 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 1.21, stock = 11.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MEIA ARGOLA OURO CATAFORÉTICO (2 CM)', 'un', 1.21, 11.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MOSQUETÃO NIQUEL ALTERO (2,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 4.5, stock = 2.0, supplier = 'ALTERO', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MOSQUETÃO NIQUEL ALTERO (2,5 CM)', 'un', 4.5, 2.0, 0, 5, 'ALTERO', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MOSQUETÃO NIQUEL (2 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.9, stock = 6.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MOSQUETÃO NIQUEL (2 CM)', 'un', 0.9, 6.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MOSQUETÃO OURO (2 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 3.48, stock = 5.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MOSQUETÃO OURO (2 CM)', 'un', 3.48, 5.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'REGULADOR OURO CATAFORETICO (3 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 1.28, stock = 0.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'REGULADOR OURO CATAFORETICO (3 CM)', 'un', 1.28, 0.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'REGULADOR OURO VELHO (3 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 1.08, stock = 8.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'REGULADOR OURO VELHO (3 CM)', 'un', 1.08, 8.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'REGULADOR NIQUEL (2,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 1.0, stock = 2.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'REGULADOR NIQUEL (2,5 CM)', 'un', 1.0, 2.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'REGULADOR NIQUEL (2 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.18, stock = 20.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'REGULADOR NIQUEL (2 CM)', 'un', 0.18, 20.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 06 PINGENTE LAÇO OURO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.84, stock = 10.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 06 PINGENTE LAÇO OURO', 'un', 0.84, 10.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 06 PINGENTE LAÇO NÍQUEL' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.79, stock = 10.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 06 PINGENTE LAÇO NÍQUEL', 'un', 0.79, 10.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 06 OURO CATAFORETICO SIMPLES' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 1.05, stock = 10.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 06 OURO CATAFORETICO SIMPLES', 'un', 1.05, 10.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 06 PRETO SIMPLES' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.15, stock = 20.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 06 PRETO SIMPLES', 'un', 0.15, 20.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CORRENTE DOURADO (1,8 MM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'm', price = 5.0, stock = 2.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CORRENTE DOURADO (1,8 MM)', 'm', 5.0, 2.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CORRENTE GRAFITE (1,8 MM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'm', price = 5.0, stock = 2.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CORRENTE GRAFITE (1,8 MM)', 'm', 5.0, 2.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CORRENTE PRATA (1,8 MM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'm', price = 5.0, stock = 2.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CORRENTE PRATA (1,8 MM)', 'm', 5.0, 2.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 05 VISLON JACARE CINZA (TRATORADO)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.37, stock = 11.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 05 VISLON JACARE CINZA (TRATORADO)', 'un', 0.37, 11.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 05 VISLON JACARE PRETO (TRATORADO)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.37, stock = 9.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 05 VISLON JACARE PRETO (TRATORADO)', 'un', 0.37, 9.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ZIPER 05 VISLON JACARE PRETO/CINZA (TRATORADO)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 1.32, stock = 4.8, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ZIPER 05 VISLON JACARE PRETO/CINZA (TRATORADO)', 'm', 1.32, 4.8, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ZIPER 05 VISLON JACARE PRETO/PRETO (TRATORADO)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 1.32, stock = 4.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ZIPER 05 VISLON JACARE PRETO/PRETO (TRATORADO)', 'm', 1.32, 4.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'LONA DE ALGODAO ENCERADA MOSTARDA (1,50X50)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 54.36, stock = 1.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = '1,50X50' where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'LONA DE ALGODAO ENCERADA MOSTARDA (1,50X50)', 'm', 54.36, 1.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', '1,50X50');
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ZIPER 06 AMARELO OURO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.6, stock = 5.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ZIPER 06 AMARELO OURO', 'm', 0.6, 5.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ZIPER 06 TELHA' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.6, stock = 10.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ZIPER 06 TELHA', 'm', 0.6, 10.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'POLIESTER 300/300 VERDE MILITAR' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat4, unit = 'm', price = 18.9, stock = 1.16, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat4, 'POLIESTER 300/300 VERDE MILITAR', 'm', 18.9, 1.16, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'POLIESTER 300/300 PRETO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat4, unit = 'm', price = 18.9, stock = 1.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat4, 'POLIESTER 300/300 PRETO', 'm', 18.9, 1.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'COURVIN 1.0 CASCO PRETO (1.40 X 40)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 39.35, stock = 0.95, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = '1.40 X 40' where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'COURVIN 1.0 CASCO PRETO (1.40 X 40)', 'm', 39.35, 0.95, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', '1.40 X 40');
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'NYLON 70 EMBORRACHADO CINZA CHUMBO (1,50X100)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat4, unit = 'm', price = 21.63, stock = 1.15, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = '1,50X100' where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat4, 'NYLON 70 EMBORRACHADO CINZA CHUMBO (1,50X100)', 'm', 21.63, 1.15, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', '1,50X100');
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MEIA ARGOLA OURO VELHO (2,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.8, stock = 20.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MEIA ARGOLA OURO VELHO (2,5 CM)', 'un', 0.8, 20.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MEIA ARGOLA OURO VELHO (2 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.65, stock = 18.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MEIA ARGOLA OURO VELHO (2 CM)', 'un', 0.65, 18.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MEIA ARGOLA ONIX (2,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.8, stock = 8.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MEIA ARGOLA ONIX (2,5 CM)', 'un', 0.8, 8.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MEIA ARGOLA ONIX (2 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.65, stock = 9.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MEIA ARGOLA ONIX (2 CM)', 'un', 0.65, 9.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MEIA ARGOLA OURO VELHO (3 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.95, stock = 14.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MEIA ARGOLA OURO VELHO (3 CM)', 'un', 0.95, 14.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'REGULADOR OURO (2 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 1.5, stock = 12.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'REGULADOR OURO (2 CM)', 'un', 1.5, 12.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'REGULADOR OURO VELHO (2,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 1.0, stock = 9.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'REGULADOR OURO VELHO (2,5 CM)', 'un', 1.0, 9.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'REGULADOR OURO VELHO (2 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 1.08, stock = 13.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'REGULADOR OURO VELHO (2 CM)', 'un', 1.08, 13.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'BOTÃO IMÃ OURO VELHO (1,8 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 1.29, stock = 8.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'BOTÃO IMÃ OURO VELHO (1,8 CM)', 'un', 1.29, 8.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'BOTÃO IMÃ PRATA (1,8 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 1.29, stock = 10.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'BOTÃO IMÃ PRATA (1,8 CM)', 'un', 1.29, 10.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'QUADRO ÔNIX (1,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.9, stock = 17.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'QUADRO ÔNIX (1,5 CM)', 'un', 0.9, 17.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'REGULADOR MINE NIQUEL (1,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.8, stock = 10.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'REGULADOR MINE NIQUEL (1,5 CM)', 'un', 0.8, 10.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'REGULADOR NIQUEL (1,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.9, stock = 5.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'REGULADOR NIQUEL (1,5 CM)', 'un', 0.9, 5.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'REGULADOR ÔNIX (1,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.9, stock = 6.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'REGULADOR ÔNIX (1,5 CM)', 'un', 0.9, 6.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MEIA ARGOLA OURO VELHO (1,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.59, stock = 6.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MEIA ARGOLA OURO VELHO (1,5 CM)', 'un', 0.59, 6.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'REGULADOR OURO VELHO (1,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.9, stock = 5.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'REGULADOR OURO VELHO (1,5 CM)', 'un', 0.9, 5.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CORRENTE ALUMINIO OURO (10.8MMX15.2MM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'm', price = 23.9, stock = 1.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CORRENTE ALUMINIO OURO (10.8MMX15.2MM)', 'm', 23.9, 1.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CORRENTE ALUMINIO NIQUEL (10.8MMX15.2MM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'm', price = 23.9, stock = 1.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CORRENTE ALUMINIO NIQUEL (10.8MMX15.2MM)', 'm', 23.9, 1.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MOSQUETAO OURO VELHO (2,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 2.13, stock = 4.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MOSQUETAO OURO VELHO (2,5 CM)', 'un', 2.13, 4.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'REGULADOR ÔNIX (2,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 1.0, stock = 3.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'REGULADOR ÔNIX (2,5 CM)', 'un', 1.0, 3.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'REGULADOR ÔNIX (2 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.95, stock = 4.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'REGULADOR ÔNIX (2 CM)', 'un', 0.95, 4.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 06 CORAÇÃO AMOR OURO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.9, stock = 3.0, supplier = 'DANIELA DELINSKI', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 06 CORAÇÃO AMOR OURO', 'un', 0.9, 3.0, 0, 5, 'DANIELA DELINSKI', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 06 CORAÇÃO AMOR NIQUEL' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.9, stock = 3.0, supplier = 'DANIELA DELINSKI', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 06 CORAÇÃO AMOR NIQUEL', 'un', 0.9, 3.0, 0, 5, 'DANIELA DELINSKI', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 06 PLASTIC PRETO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 1.15, stock = 3.0, supplier = 'DANIELA DELINSKI', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 06 PLASTIC PRETO', 'un', 1.15, 3.0, 0, 5, 'DANIELA DELINSKI', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 06 VAZADO NIGUEL' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.8, stock = 3.0, supplier = 'DANIELA DELINSKI', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 06 VAZADO NIGUEL', 'un', 0.8, 3.0, 0, 5, 'DANIELA DELINSKI', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 06 VAZADO PRETO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.8, stock = 1.0, supplier = 'DANIELA DELINSKI', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 06 VAZADO PRETO', 'un', 0.8, 1.0, 0, 5, 'DANIELA DELINSKI', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 06 PINGO VAZADO OURO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 2.4, stock = 2.0, supplier = 'DANIELA DELINSKI', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 06 PINGO VAZADO OURO', 'un', 2.4, 2.0, 0, 5, 'DANIELA DELINSKI', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 06 PALITO NIQUELADO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.59, stock = 3.0, supplier = 'DANIELA DELINSKI', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 06 PALITO NIQUELADO', 'un', 0.59, 3.0, 0, 5, 'DANIELA DELINSKI', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'VIES DESTAQUE 35X20' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 9.7, stock = 1.0, supplier = 'ARMARINHOS NODARI', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'VIES DESTAQUE 35X20', 'un', 9.7, 1.0, 0, 5, 'ARMARINHOS NODARI', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ZIPER 06 PUXADOR GRANDE CAFÉ (60CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 3.2, stock = 5.0, supplier = 'CASA DE COUROS SÃO SEBASTIÃO', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ZIPER 06 PUXADOR GRANDE CAFÉ (60CM)', 'm', 3.2, 5.0, 0, 5, 'CASA DE COUROS SÃO SEBASTIÃO', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 06 NIQUELADO, BRONZE, DOURADO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 1.2, stock = 18.0, supplier = 'CASA DE COUROS SÃO SEBASTIÃO', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 06 NIQUELADO, BRONZE, DOURADO', 'un', 1.2, 18.0, 0, 5, 'CASA DE COUROS SÃO SEBASTIÃO', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ALÇA PRETA PRONTA EM SINTÉTICO (2,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 3.5, stock = 10.0, supplier = 'CASA DE COUROS SÃO SEBASTIÃO', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ALÇA PRETA PRONTA EM SINTÉTICO (2,5 CM)', 'm', 3.5, 10.0, 0, 5, 'CASA DE COUROS SÃO SEBASTIÃO', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ZIPER 06 PUXADOR GRANDE VERDE MUSGO (60CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 3.2, stock = 3.0, supplier = 'CASA DE COUROS SÃO SEBASTIÃO', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ZIPER 06 PUXADOR GRANDE VERDE MUSGO (60CM)', 'm', 3.2, 3.0, 0, 5, 'CASA DE COUROS SÃO SEBASTIÃO', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'NYLON PVC 70 - (VERDE / AMARELO / VERMELHO / CINZA, PRETO)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat4, unit = 'm', price = 20.0, stock = 2.6, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat4, 'NYLON PVC 70 - (VERDE / AMARELO / VERMELHO / CINZA, PRETO)', 'm', 20.0, 2.6, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'COURVIN 1.2 JACARÉ MARRON (140X25)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 55.0, stock = 1.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = '140X25' where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'COURVIN 1.2 JACARÉ MARRON (140X25)', 'm', 55.0, 1.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', '140X25');
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'COURVIN 1.2 JACARÉ PRETO (1,40 X 25)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 55.0, stock = 1.2, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = '1,40 X 25' where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'COURVIN 1.2 JACARÉ PRETO (1,40 X 25)', 'm', 55.0, 1.2, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', '1,40 X 25');
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'COURVIN 1.8 SOFT COLOR PRETO / VERMELHO (1.40 X 25)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 69.9, stock = 1.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = '1.40 X 25' where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'COURVIN 1.8 SOFT COLOR PRETO / VERMELHO (1.40 X 25)', 'm', 69.9, 1.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', '1.40 X 25');
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'COURVIN URUGUAI DIAMANTE PRETO ACOPLADO (5MM - D26) (1.50)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 75.9, stock = 1.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'COURVIN URUGUAI DIAMANTE PRETO ACOPLADO (5MM - D26) (1.50)', 'm', 75.9, 1.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ALÇA CHIQUE PRETO (3 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 3.0, stock = 10.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ALÇA CHIQUE PRETO (3 CM)', 'm', 3.0, 10.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'KIT COMPLETO COM SUPORTE PARA CELULAR' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 60.43, stock = 1.0, supplier = 'BNVT VARIEDADES  -  SHOPEE', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'KIT COMPLETO COM SUPORTE PARA CELULAR', 'un', 60.43, 1.0, 0, 5, 'BNVT VARIEDADES  -  SHOPEE', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ETIQUETA METAL ONIX' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 4.27, stock = 15.0, supplier = 'PERSONALIZE ON LINE', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ETIQUETA METAL ONIX', 'un', 4.27, 15.0, 0, 5, 'PERSONALIZE ON LINE', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ETIQUETA METAL DOURADO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 4.27, stock = 14.0, supplier = 'PERSONALIZE ON LINE', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ETIQUETA METAL DOURADO', 'un', 4.27, 14.0, 0, 5, 'PERSONALIZE ON LINE', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ETIQUETA METAL PRATA' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 4.27, stock = 15.0, supplier = 'PERSONALIZE ON LINE', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ETIQUETA METAL PRATA', 'un', 4.27, 15.0, 0, 5, 'PERSONALIZE ON LINE', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ETIQUETA METAL OURO VELHO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 4.27, stock = 13.0, supplier = 'PERSONALIZE ON LINE', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ETIQUETA METAL OURO VELHO', 'un', 4.27, 13.0, 0, 5, 'PERSONALIZE ON LINE', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'VIVO BRILHO MARRON (4/11)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.8, stock = 9.2, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'VIVO BRILHO MARRON (4/11)', 'm', 0.8, 9.2, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'LINHA CIFA 60 PRETO 80G' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 17.9, stock = 1.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'LINHA CIFA 60 PRETO 80G', 'un', 17.9, 1.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'VIVO BRILHO VERDE MUSGO (4/11)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.72, stock = 5.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'VIVO BRILHO VERDE MUSGO (4/11)', 'm', 0.72, 5.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'VIVO BRILHO PRETO (4/11)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.63, stock = 9.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'VIVO BRILHO PRETO (4/11)', 'm', 0.63, 9.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'COURVIN 0.8 LBR CAFÉ (1.40 X 40)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 32.25, stock = 0.4, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = '1.40 X 40' where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'COURVIN 0.8 LBR CAFÉ (1.40 X 40)', 'm', 32.25, 0.4, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', '1.40 X 40');
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'EVA PRETO (2CM 1,40X50)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat1, unit = 'm', price = 15.6, stock = 1.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat1, 'EVA PRETO (2CM 1,40X50)', 'm', 15.6, 1.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'EVA BRANCO (2 CM 1,40X50)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat1, unit = 'm', price = 15.6, stock = 1.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat1, 'EVA BRANCO (2 CM 1,40X50)', 'm', 15.6, 1.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ARGOLA PRATA CHAVEIRO (2,4 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.3, stock = 50.0, supplier = 'BNVT VARIEDADES  -  SHOPEE', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'ARGOLA PRATA CHAVEIRO (2,4 CM)', 'un', 0.3, 50.0, 0, 5, 'BNVT VARIEDADES  -  SHOPEE', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'PAPELÃO COURO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat1, unit = 'un', price = 8.96, stock = 2.0, supplier = 'CASA DO SAPATEIRO', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat1, 'PAPELÃO COURO', 'un', 8.96, 2.0, 0, 5, 'CASA DO SAPATEIRO', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'TELA PARA MOCHILA PRETO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat4, unit = 'm', price = 8.2, stock = 1.2, supplier = null, reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat4, 'TELA PARA MOCHILA PRETO', 'm', 8.2, 1.2, 0, 5, null, null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'TELA PARA MOCHILA CARAMELO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat4, unit = 'm', price = 8.2, stock = 1.4, supplier = 'CASA DO SAPATEIRO', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat4, 'TELA PARA MOCHILA CARAMELO', 'm', 8.2, 1.4, 0, 5, 'CASA DO SAPATEIRO', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'NAPA BAGUM PRETO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat4, unit = 'm', price = 13.5, stock = 1.4, supplier = 'CASA DO SAPATEIRO', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat4, 'NAPA BAGUM PRETO', 'm', 13.5, 1.4, 0, 5, 'CASA DO SAPATEIRO', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'NYLON 70 EMBORRACHADO PRETO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 25.0, stock = 2.7, supplier = 'CASA DO SAPATEIRO', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'NYLON 70 EMBORRACHADO PRETO', 'm', 25.0, 2.7, 0, 5, 'CASA DO SAPATEIRO', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'NAPA COURVIN PRETO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat4, unit = 'm', price = 37.0, stock = 0.8, supplier = 'CASA DO SAPATEIRO', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat4, 'NAPA COURVIN PRETO', 'm', 37.0, 0.8, 0, 5, 'CASA DO SAPATEIRO', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ESPUMA 10MM' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat1, unit = 'm', price = 20.9, stock = 0.5, supplier = 'CASA DO SAPATEIRO', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat1, 'ESPUMA 10MM', 'm', 20.9, 0.5, 0, 5, 'CASA DO SAPATEIRO', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'PORTA BOBINA CIRCULAR DE SILICONE' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 15.19, stock = 1.0, supplier = 'BNVT VARIEDADES  -  SHOPEE', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'PORTA BOBINA CIRCULAR DE SILICONE', 'un', 15.19, 1.0, 0, 5, 'BNVT VARIEDADES  -  SHOPEE', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'VIÉS DESTAQUE COR 33 CAQUI/BEGE ESCURO (2,3 CM 20 METROS)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.49, stock = 20.0, supplier = 'ARMARINHOS NODARI', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'VIÉS DESTAQUE COR 33 CAQUI/BEGE ESCURO (2,3 CM 20 METROS)', 'm', 0.49, 20.0, 0, 5, 'ARMARINHOS NODARI', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'VIÉS DESTAQUE COR 21 - VERMELHO (23 MM 20 METROS)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 0.49, stock = 20.0, supplier = 'ARMARINHOS NODARI', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'VIÉS DESTAQUE COR 21 - VERMELHO (23 MM 20 METROS)', 'm', 0.49, 20.0, 0, 5, 'ARMARINHOS NODARI', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 06 OURO PINGENTE ONDULADO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.95, stock = 3.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 06 OURO PINGENTE ONDULADO', 'un', 0.95, 3.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 06 NIQUEL PINGENTE ONDULADO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.95, stock = 9.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 06 NIQUEL PINGENTE ONDULADO', 'un', 0.95, 9.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 06 OURO VELHO PINGENTE ONDULADO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.95, stock = 27.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 06 OURO VELHO PINGENTE ONDULADO', 'un', 0.95, 27.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CURSOR 08 OURO VELHO SIMPLES' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.39, stock = 10.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'CURSOR 08 OURO VELHO SIMPLES', 'un', 0.39, 10.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ZIPER 08 VINHO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 1.42, stock = 5.34, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ZIPER 08 VINHO', 'm', 1.42, 5.34, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'COURVIN 1.0 PRADA VINHO (140X25)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 44.55, stock = 0.7, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = '140X25' where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'COURVIN 1.0 PRADA VINHO (140X25)', 'm', 44.55, 0.7, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', '140X25');
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'VELKRO PRETO (2,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 1.2, stock = 25.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'VELKRO PRETO (2,5 CM)', 'm', 1.2, 25.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'ALÇA CHIQUE PRETO (2 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 2.5, stock = 25.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'ALÇA CHIQUE PRETO (2 CM)', 'm', 2.5, 25.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'LINHA CIFA 40 BRANCO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 18.5, stock = 1.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'LINHA CIFA 40 BRANCO', 'un', 18.5, 1.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MOSQUETAO OURO VELHO (3 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 3.45, stock = 4.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MOSQUETAO OURO VELHO (3 CM)', 'un', 3.45, 4.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MOSQUETÃO OURO VELHO (1,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 2.95, stock = 8.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MOSQUETÃO OURO VELHO (1,5 CM)', 'un', 2.95, 8.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'QUADRO NÍQUEL (1,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.7, stock = 4.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'QUADRO NÍQUEL (1,5 CM)', 'un', 0.7, 4.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MOSQUETÃO OURO VELHO (2 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 3.13, stock = 6.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MOSQUETÃO OURO VELHO (2 CM)', 'un', 3.13, 6.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'QUADRO OURO VELHO (1,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 0.85, stock = 6.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'QUADRO OURO VELHO (1,5 CM)', 'un', 0.85, 6.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MOSQUETÃO OURO CATAFORÉTICO (1,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 3.95, stock = 4.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MOSQUETÃO OURO CATAFORÉTICO (1,5 CM)', 'un', 3.95, 4.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MOSQUETÃO ONIX (2 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 3.13, stock = 4.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MOSQUETÃO ONIX (2 CM)', 'un', 3.13, 4.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MOSQUETÃO ONIX (1,5 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 2.95, stock = 4.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MOSQUETÃO ONIX (1,5 CM)', 'un', 2.95, 4.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'MOSQUETAO ONIX (3 CM)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat2, unit = 'un', price = 3.2, stock = 5.0, supplier = 'JACQUELINE SOIER ARTESANATOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat2, 'MOSQUETAO ONIX (3 CM)', 'un', 3.2, 5.0, 0, 5, 'JACQUELINE SOIER ARTESANATOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'TIRA DE COURO SINTÉTICO CAFE' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 3.9, stock = 8.7, supplier = 'ESTRELAS DA ARTE', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'TIRA DE COURO SINTÉTICO CAFE', 'm', 3.9, 8.7, 0, 5, 'ESTRELAS DA ARTE', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'TIRA DE COURO SINTÉTICO PRETO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 3.9, stock = 8.0, supplier = 'ESTRELAS DA ARTE', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'TIRA DE COURO SINTÉTICO PRETO', 'm', 3.9, 8.0, 0, 5, 'ESTRELAS DA ARTE', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'TIRA DE COURO SINTÉTICO CARAMELO' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'm', price = 3.9, stock = 7.85, supplier = 'ESTRELAS DA ARTE', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'TIRA DE COURO SINTÉTICO CARAMELO', 'm', 3.9, 7.85, 0, 5, 'ESTRELAS DA ARTE', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'SINTÉTICO TAG ARM CAFÉ GT' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 56.5, stock = 2.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'SINTÉTICO TAG ARM CAFÉ GT', 'm', 56.5, 2.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'TELA RENDA EMBORRACHADA AMARELO CANÁRIO (140)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 45.0, stock = 1.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'TELA RENDA EMBORRACHADA AMARELO CANÁRIO (140)', 'm', 45.0, 1.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'TELA RENDA EMBORRACHADA AZUL MARINHO (140)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 45.0, stock = 1.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'TELA RENDA EMBORRACHADA AZUL MARINHO (140)', 'm', 45.0, 1.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'TELA RENDA EMBORRACHADA BEGE ESCURO (140)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 45.0, stock = 1.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'TELA RENDA EMBORRACHADA BEGE ESCURO (140)', 'm', 45.0, 1.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'TELA RENDA EMBORRACHADA LARANJA (140)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 45.0, stock = 1.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'TELA RENDA EMBORRACHADA LARANJA (140)', 'm', 45.0, 1.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'COURVIN 1.8 SOFT COLOR PRETO/PRETO (140)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 69.9, stock = 1.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'COURVIN 1.8 SOFT COLOR PRETO/PRETO (140)', 'm', 69.9, 1.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'COURVIN 1.8 SOFT COLOR MARROM/BEGE (140)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 69.9, stock = 1.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'COURVIN 1.8 SOFT COLOR MARROM/BEGE (140)', 'm', 69.9, 1.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'CORINO PALHA MARROM MATELASSE (140)' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat3, unit = 'm', price = 39.9, stock = 5.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat3, 'CORINO PALHA MARROM MATELASSE (140)', 'm', 39.9, 5.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  select id into v_id from public.materials where owner_id = v_owner and name = 'TEKBOND ADESIVO INSTANTANEO 793 20GR' limit 1;
  if v_id is not null then
    update public.materials set category_id = v_cat0, unit = 'un', price = 13.9, stock = 1.0, supplier = 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', reference_measure = null where id = v_id;
  else
    insert into public.materials (owner_id, category_id, name, unit, price, stock, min_stock, waste_percent, supplier, reference_measure) values (v_owner, v_cat0, 'TEKBOND ADESIVO INSTANTANEO 793 20GR', 'un', 13.9, 1.0, 0, 5, 'ROMA PLÁSTICOS SINTETICFOS E AVIAMENTOS LTDA', null);
  end if;

  -- investimento inicial (ferramentas/equipamentos, 10 itens = R$ 4197.15)
  update public.settings set initial_investment = 4197.15 where owner_id = v_owner;
end $$;
