-- Desconto automático de materiais: marca os produtos cujo estoque atual já
-- teve os materiais descontados. Produtos existentes começam como false e
-- aparecem em Materiais > "Revisar e descontar".
alter table public.products add column if not exists materials_deducted boolean not null default false;
