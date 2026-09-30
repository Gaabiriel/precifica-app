-- ============================================================================
-- Apaga materiais órfãos: sobras da carga de demonstração original que não
-- estão em nenhuma ficha técnica hoje (nem de produto antigo, nem novo).
-- Seguro -- só apaga se NADA referenciar o material (checagem NOT EXISTS),
-- então mesmo que algum nome bata por engano com algo em uso, nada quebra.
-- ============================================================================

delete from public.materials m
where m.owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee'
  and (
    m.name in (
      'Alça de mão + orelhinha', 'Alça de mão 2', 'Argola 2 mm', 'Fita de Cetim preta',
      'Mosquetão 2mm', 'TNT Cinza Chumbo', 'TNT Laranja'
    )
    -- "Sacola - (G)" pegou por padrão em vez de nome exato: o hífen/espaçamento
    -- no banco deve ser um pouco diferente do que aparece na tela.
    or m.name ilike '%sacola%(g)%'
  )
  and not exists (select 1 from public.product_materials pm where pm.material_id = m.id);
