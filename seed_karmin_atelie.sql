-- ============================================================================
-- Popula a conta da Karmin Ateliê com os dados reais do documento de
-- controle: os 6 materiais usados na primeira produção, o produto "Agenda
-- A5 Personalizada" com a ficha técnica já montada, e as configurações
-- (investimento inicial + mão de obra zerada nesta fase inicial).
--
-- Os preços por unidade foram conferidos batendo com o subtotal que o
-- próprio documento calculou (R$ 32,58) — todos fecham certinho.
--
-- PRÉ-REQUISITOS (rode nessa ordem, antes deste):
--   1. categories_by_niche.sql
--   2. seed_categorias_papelaria.sql
--   3. a Izabela precisa ter feito login pelo menos uma vez (cria a linha
--      em "settings" automaticamente) — sem isso o UPDATE no final não faz nada
--
-- >>> Troque OWNER_UUID pelo id dela em auth.users / profiles <<<
-- Rode só uma vez — materiais não têm trava de duplicidade, então rodar de
-- novo cria tudo em dobro.
-- ============================================================================

do $$
declare
  v_owner uuid := 'OWNER_UUID'; -- <<< SUBSTITUA AQUI
  v_niche uuid;
  v_cat_papel_especial uuid;
  v_cat_adesivo uuid;
  v_cat_papel uuid;
  v_cat_aviamentos uuid;
  v_mat_holler uuid;
  v_mat_foto_adesivo uuid;
  v_mat_bopp uuid;
  v_mat_sulfite uuid;
  v_mat_polen uuid;
  v_mat_wireo uuid;
  v_product uuid;
begin
  select id into v_niche from public.niches where slug = 'papelaria-artesanal-personalizada';
  if v_niche is null then
    raise exception 'Nicho "papelaria-artesanal-personalizada" não encontrado — confira em Admin > Nichos.';
  end if;

  select id into v_cat_papel_especial from public.categories where niche_id = v_niche and name = 'Papel Especial';
  select id into v_cat_adesivo from public.categories where niche_id = v_niche and name = 'Adesivo e Vinil';
  select id into v_cat_papel from public.categories where niche_id = v_niche and name = 'Papel e Cartolina';
  select id into v_cat_aviamentos from public.categories where niche_id = v_niche and name = 'Aviamentos';

  -- ---- materiais ----
  -- estoque = 0 propositalmente (placeholder) — atualize com a contagem real.
  insert into public.materials (owner_id, name, category_id, unit, price, stock, min_stock, waste_percent, reference_measure)
  values (v_owner, 'Papel Holler 1,9mm', v_cat_papel_especial, 'un', 0.76, 0, 0, 0, 'folha A5 (lote de 50 folhas = R$38)')
  returning id into v_mat_holler;

  insert into public.materials (owner_id, name, category_id, unit, price, stock, min_stock, waste_percent, reference_measure)
  values (v_owner, 'Papel Fotográfico Adesivo', v_cat_adesivo, 'un', 0.33, 0, 0, 0, 'folha A4 (lote de 100 folhas = R$33)')
  returning id into v_mat_foto_adesivo;

  insert into public.materials (owner_id, name, category_id, unit, price, stock, min_stock, waste_percent, reference_measure)
  values (v_owner, 'BOPP Fosco 27 micras', v_cat_papel_especial, 'un', 0.26, 0, 0, 0, 'folha A4 (comprado em rolo de 50m = R$43 — preço aqui já convertido pra folha, do próprio cálculo da Karmin)')
  returning id into v_mat_bopp;

  insert into public.materials (owner_id, name, category_id, unit, price, stock, min_stock, waste_percent, reference_measure)
  values (v_owner, 'Sulfite 75g', v_cat_papel, 'un', 0.12, 0, 0, 0, 'folha A4 (lote de 100 folhas = R$12)')
  returning id into v_mat_sulfite;

  insert into public.materials (owner_id, name, category_id, unit, price, stock, min_stock, waste_percent, reference_measure)
  values (v_owner, 'Papel Pólen 90g', v_cat_papel, 'un', 0.30, 0, 0, 0, 'folha A5 (lote de 100 folhas = R$30)')
  returning id into v_mat_polen;

  insert into public.materials (owner_id, name, category_id, unit, price, stock, min_stock, waste_percent, reference_measure)
  values (v_owner, 'Wire-o Preto', v_cat_aviamentos, 'un', 2.24, 0, 0, 0, 'unidade, dá pra ~120 folhas (lote de 25 un = R$56)')
  returning id into v_mat_wireo;

  -- ---- produto: Agenda A5 Personalizada ----
  -- sale_price_override fixado em R$57,90 (meio do range R$55-60 sugerido
  -- no documento) — ajuste quando decidir o valor definitivo.
  insert into public.products (owner_id, niche_id, name, labor_minutes, dimensions, sale_price_override, notes)
  values (
    v_owner, v_niche, 'Agenda A5 Personalizada', 240, 'A5 (14,8 x 21 cm)', 57.90,
    'Migrado do documento de controle da Karmin Ateliê. Capa personalizada em Papel Holler laminada com BOPP fosco, miolo com 75 folhas brancas + 75 folhas Pólen creme, impressão frente e verso, wire-o preto. Preço de lançamento do documento: R$55 a R$60 — revisar depois de calcular tinta/energia (entram em "Manutenção de equipamento" nas Configurações).'
  )
  returning id into v_product;

  insert into public.product_materials (product_id, material_id, qty) values
    (v_product, v_mat_holler, 2),
    (v_product, v_mat_foto_adesivo, 3),
    (v_product, v_mat_bopp, 3),
    (v_product, v_mat_sulfite, 38),
    (v_product, v_mat_polen, 75),
    (v_product, v_mat_wireo, 1);

  -- ---- configurações ----
  -- investimento inicial = total do documento (equipamentos + materiais + software).
  -- mão de obra = 0 nesta fase, conforme a estratégia descrita no documento
  -- (as 4h continuam registradas no produto, só não entram no preço ainda).
  update public.settings
    set initial_investment = 2832.00,
        labor_cost_per_hour = 0
  where owner_id = v_owner;

end $$;
