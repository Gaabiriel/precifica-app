-- ============================================================================
-- Cadastra as categorias sugeridas pro nicho "Papelaria Artesanal
-- Personalizada". Categorias são por nicho, então isso já fica disponível
-- pra qualquer conta desse nicho (não precisa esperar a Izabela criar login).
--
-- Precisa rodar categories_by_niche.sql ANTES deste (ele cria a tabela).
-- Rode isso uma vez no SQL Editor do Supabase.
-- ============================================================================

do $$
declare
  v_niche uuid;
begin
  select id into v_niche from public.niches where slug = 'papelaria-artesanal-personalizada';

  if v_niche is null then
    raise exception 'Nicho "papelaria-artesanal-personalizada" não encontrado — confira o slug em Admin > Nichos.';
  end if;

  insert into public.categories (niche_id, name) values
    (v_niche, 'Papel e Cartolina'),
    (v_niche, 'Papel Especial'),
    (v_niche, 'Adesivo e Vinil'),
    (v_niche, 'Fitas e Cordões'),
    (v_niche, 'Aviamentos'),
    (v_niche, 'Colas e Fixadores'),
    (v_niche, 'Embelezamentos'),
    (v_niche, 'Carimbos e Tintas'),
    (v_niche, 'MDF e Acrílico'),
    (v_niche, 'Embalagem')
  on conflict (niche_id, name) do nothing;
end $$;
