-- ============================================================================
-- Troca o controle de estoque "por produto" (has_stock_control) por uma flag
-- "por material" (is_old_material):
--   - is_old_material = true  -> material antigo/genérico, sem estoque real.
--     Fica escondido da lista de materiais por padrão e não gera alerta de
--     estoque baixo.
--   - Qualquer produto com PELO MENOS UM material antigo na ficha pula a
--     verificação/desconto de estoque ao Produzir (a regra é calculada no app,
--     não precisa de coluna no produto).
--
-- Marca como antigo só os 81 materiais da carga de demonstração original
-- (IDs fixos do seed_bolsas.sql) -- materiais novos que ela cadastrou depois
-- não são tocados. Qualquer outro dá pra marcar/desmarcar pelo checkbox
-- "Material antigo" no formulário do material.
-- ============================================================================

alter table public.materials add column if not exists is_old_material boolean not null default false;

update public.materials
set is_old_material = true
where owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee'
  and name <> upper(name)  -- renomeado pra MAIÚSCULAS = virou material real em uso
  and id in (
    
'00b3c920-4d9e-500c-88bb-611e9c9b048a', '08cf88d7-c48f-58e0-8e24-793aebb96869', '0c5870d0-70ad-54af-9fbd-8062d305eb33', '172a5e63-95cb-5e4b-acf4-4dbdb511d796',
    '1c303618-c9b0-53b1-88fd-6bb510668021', '236f3598-a287-581d-8344-227983736ab9', '24257dc1-7af4-5657-928b-acaf0b347408', '28273e70-7f7c-5ff4-b4ae-6a1030cf4e40',
    '2a934cfa-81f0-557c-8a92-aa8f0cb6086b', '2c5bf20d-e1ea-53f6-9b4e-375a35c54943', '3522dcae-7622-5a91-b816-4f6cd74d373b', '365f68ab-ddf2-5ccc-8dc6-ec4ac97f24fb',
    '3cf0e822-7276-5f8d-b463-af9c8c6e3950', '427a9f61-0b99-52bd-b46f-b4c73e3b164c', '4454b4af-1c60-57f7-8f2f-867706422a40', '45b96d48-6a47-53e7-b573-ec8e342fbb83',
    '476d96e4-1b79-58d0-9e4a-42ce875d2a9a', '4bf4a131-eba6-5dd2-aba6-ba3bd474d9a3', '4c89b466-6170-55d5-b2c8-fd77778439de', '4f5ed963-c6ea-5482-96a3-f434147a9afb',
    '4f926673-6d3f-5ad3-9294-e7007bfd1cf0', '507c6829-7cca-5eb5-ae08-3053b7eaf6a9', '562841db-d963-5981-99df-ddc3dee5083b', '584e082f-dd0a-5485-9021-be9c6bca0d62',
    '656b87c3-ee67-5006-8c53-a5a434967ae4', '65fca728-e515-5958-8e5e-581591619218', '687f6bc1-0aaf-5cc3-be44-745b7011323f', '68ab81fd-6931-5683-8b36-be602ac6c928',
    '6bb6725c-db1e-52d4-9963-014a57867d15', '6d0adbef-67cd-5ba4-9220-da46ac0a1f6d', '6e3c18ad-36f3-5c9d-81b4-accf50a0f7eb', '7490d899-2f5c-507c-b1a7-433f10ca7a44',
    '79890425-cd87-5d7b-b692-3557a471b511', '79be39af-0718-5e06-8404-cf92bfbe176b', '79ccbe85-f9ff-50bc-9ebf-af721945ff08', '7a6c67ac-09cd-5b00-ac6a-e09a3981496e',
    '7b89ee33-3a3b-597d-991d-e7633202ee13', '82587b5c-c397-5909-a63f-7d0ac5e1a112', '857a4605-2b00-5fef-b474-ab85bb14ed9c', '890fd180-b2b1-5086-8f78-aec99c548ff8',
    '89ab8b0f-99d1-5948-9f70-742f3099fae8', '8ebe9df2-9ce8-564f-92aa-a17fde2f572e', '8f498d78-e67b-5155-a13a-4f36e1d615b2', '8f9ddee8-0a85-54e2-b3aa-8fc394aad0e3',
    '955fdc02-611d-51d6-864e-20c85704b399', '9b61954f-097d-5f93-ac3f-e5699f982226', '9bcc3bf4-1870-5c40-9da3-6dbb1929e229', '9c2ad052-ad5c-5cfb-9b09-cb2eeaca2525',
    'a2ce32e1-8b2d-5641-890e-80f6370dc5fd', 'a3fcfc81-9d9d-5f91-bf18-10a2d1b3eb97', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 'a7892a11-6345-5f2b-b149-f32f63894e57',
    'ace52fb8-5613-57ae-903a-f28595e6d013', 'af19bb4f-ce0c-58db-8c43-a8e8f0c18f03', 'afa4b616-3936-522c-80c8-3d953910f07d', 'b44d0218-98e9-5d68-ae3e-d4c39b470704',
    'b83a43f8-68b2-5f57-b7c5-4c1654d29004', 'b9709e8f-dd68-5fdb-b010-12236f4c3344', 'ba956d65-bb77-5971-a5a3-35f703fa40cb', 'bb2fdf52-df7d-54b6-b8c0-54ab0a591c9d',
    'bc77b016-2f63-5971-9466-364abf8c2b27', 'bcc524a2-b626-543d-ad25-89522be4631b', 'c3ba47e4-cabb-59c2-8f50-f489f0ca3df5', 'c613ae6e-42bc-5d5b-aa3c-ba112dcf43e1',
    'cd85545e-c71e-57fc-b7a3-6fdc3c590002', 'cf764f74-3f01-5461-aa36-437802a03ccc', 'd00fd3c3-d9a8-5ca5-afb2-667660634022', 'd028a453-6e78-5e37-a090-6eb753459aed',
    'd1e1392b-33ec-53f8-82a5-b830587f651a', 'd5f72451-7aeb-54c1-9ae0-abefb2fd2be8', 'd9c707c9-8e99-5313-a064-1fe88c28b94d', 'df79269a-5884-5664-bd10-34a90a085de9',
    'e64ec6b0-8fd8-5048-b561-c122fe9e4eec', 'e8a3d259-a34b-58ad-ae25-8859ed361eed', 'ea448fd6-826c-5e3e-8622-4780bad90060', 'f322c6c9-88a4-53b2-8272-04fd0caa5363',
    'f5b98143-7bcb-5d09-81ae-255c92342a08', 'f806545b-98d0-5891-af44-3a96f99efaa8', 'f906d228-40c9-5017-9b20-38c7605ff665', 'fbdb7708-c326-5366-bad9-8a755464856e',
    'fe7caa14-c91c-5912-a2d7-7b12782df549'
  );

alter table public.products drop column if exists has_stock_control;
