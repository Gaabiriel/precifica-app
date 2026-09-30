-- ============================================================================
-- Atualiza as fichas técnicas (product_materials) dos produtos antigos,
-- trocando o material genérico (da carga de demonstração original) pelo item
-- real de estoque já sincronizado (sync_materiais_atelie_bolsas.sql), usando
-- o mapeamento aprovado em MAPEAMENTO_MATERIAIS.xlsx.
--
-- Cobre só os materiais genéricos que já têm ITEM DE ESTOQUE preenchido na
-- aba MAPEAMENTO (10 de 74 nomes genéricos distintos usados nas fichas).
-- O restante (64) precisa ser preenchido na planilha antes -- rode este
-- script de novo depois, ele é seguro de repetir (só troca o material_id,
-- não mexe em quantidade nem duplica).
--
-- NÃO mexe em estoque. Rode uma vez no SQL Editor do Supabase.
-- ============================================================================

do $$
declare
  v_owner uuid := '62f88a4b-a969-4f1a-8150-bfd21787abee';
begin

  -- 'Nylon Resinado vermelho' -> 'NYLON RESINADO VERMELHO 150'
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'NYLON RESINADO VERMELHO 150' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'BOLSA CARTEIRO' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Nylon Resinado vermelho' limit 1);
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'NYLON RESINADO VERMELHO 150' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'BOLSA HOBO ' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Nylon Resinado vermelho' limit 1);
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'NYLON RESINADO VERMELHO 150' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'BOLSA MALA' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Nylon Resinado vermelho' limit 1);
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'NYLON RESINADO VERMELHO 150' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'CARTEIRA FLOR DE MÃE' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Nylon Resinado vermelho' limit 1);
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'NYLON RESINADO VERMELHO 150' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'CLUTCH ROYALE ' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Nylon Resinado vermelho' limit 1);
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'NYLON RESINADO VERMELHO 150' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'HOBO SHOULDER BAG' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Nylon Resinado vermelho' limit 1);
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'NYLON RESINADO VERMELHO 150' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'NECESSAIRE BOX FLOR DE MÃE (GG)  ' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Nylon Resinado vermelho' limit 1);
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'NYLON RESINADO VERMELHO 150' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'NECESSAIRE BOX FLOR DE MÃE - M' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Nylon Resinado vermelho' limit 1);

  -- 'Alça chique Telha' -> 'ALÇA CHIQUE TELHA (3 CM)'
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'ALÇA CHIQUE TELHA (3 CM)' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'BOLSA MALA' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Alça chique Telha' limit 1);

  -- 'Meia Argola ouro velho' -> 'MEIA ARGOLA OURO VELHO (2 CM)'
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'MEIA ARGOLA OURO VELHO (2 CM)' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'BOLSA MALA' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Meia Argola ouro velho' limit 1);
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'MEIA ARGOLA OURO VELHO (2 CM)' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'CLUTCH ROYALE ' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Meia Argola ouro velho' limit 1);

  -- 'Mosquetão ouro velho' -> 'MOSQUETAO OURO VELHO (3 CM)'
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'MOSQUETAO OURO VELHO (3 CM)' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'BOLSA MALA' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Mosquetão ouro velho' limit 1);
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'MOSQUETAO OURO VELHO (3 CM)' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'CLUTCH ROYALE ' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Mosquetão ouro velho' limit 1);

  -- 'Cristal Colors Preto 0,40' -> 'CRISTAL COLOR PRETO (0,40)'
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'CRISTAL COLOR PRETO (0,40)' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'BOLSINHA CRISTAL' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Cristal Colors Preto 0,40' limit 1);
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'CRISTAL COLOR PRETO (0,40)' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'BOX CRISTAL ' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Cristal Colors Preto 0,40' limit 1);
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'CRISTAL COLOR PRETO (0,40)' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'NECESSAIRE CRISTAL ' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Cristal Colors Preto 0,40' limit 1);

  -- 'Corvim 1.0 Casco Preto' -> 'COURVIN 1.0 CASCO PRETO (1.40 X 40)'
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'COURVIN 1.0 CASCO PRETO (1.40 X 40)' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'BOX CRISTAL ' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Corvim 1.0 Casco Preto' limit 1);

  -- 'Corvin Dune - 0,8 (Azul Marinho e Grafite)' -> 'COURVIN DUNE 0,8 - AZUL MARINHO'
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'COURVIN DUNE 0,8 - AZUL MARINHO' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'CARTEIRA  SHELBY' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Corvin Dune - 0,8 (Azul Marinho e Grafite)' limit 1);
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'COURVIN DUNE 0,8 - AZUL MARINHO' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'CHAVEIRO' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Corvin Dune - 0,8 (Azul Marinho e Grafite)' limit 1);
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'COURVIN DUNE 0,8 - AZUL MARINHO' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'NECESSAIRE SHELBY' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Corvin Dune - 0,8 (Azul Marinho e Grafite)' limit 1);

  -- 'Regulador Ouro Velho' -> 'REGULADOR OURO VELHO (3 CM)'
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'REGULADOR OURO VELHO (3 CM)' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'CLUTCH ROYALE ' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Regulador Ouro Velho' limit 1);

  -- 'Napa Branca KL' -> 'NAPA BRANCA KL (2800)'
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'NAPA BRANCA KL (2800)' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'NECESSAIRE SHELBY' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Napa Branca KL' limit 1);

  -- 'Corvin 1.0 casco preto (1.40 x 40)' -> 'COURVIN 1.0 CASCO PRETO (1.40 X 40)'
  update public.product_materials set material_id = (select id from public.materials where owner_id = v_owner and name = 'COURVIN 1.0 CASCO PRETO (1.40 X 40)' limit 1) where product_id = (select id from public.products where owner_id = v_owner and name = 'POCHETE JULIANA ' limit 1) and material_id = (select id from public.materials where owner_id = v_owner and name = 'Corvin 1.0 casco preto (1.40 x 40)' limit 1);
end $$;
