-- ==========================================================
-- SEED: dados migrados da planilha CUSTOS_BOLSAS.xlsx
-- Nicho: Ateliê de Bolsas & Acessórios
-- >>> Troque OWNER_UUID pelo id do usuário (profiles.id) <<<
-- ==========================================================

do $$
declare
  v_owner uuid := 'OWNER_UUID'; -- <<< SUBSTITUA AQUI
  v_niche uuid := '8544e5b9-2437-5a34-b6bc-928796b4de6c';
begin

-- Materiais
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('365f68ab-ddf2-5ccc-8dc6-ec4ac97f24fb', v_owner, 'TNT Cinza Chumbo', 'Tecido/Sintético', 'cm2', 3.38, 0, 0, 5, '55x1,40') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('00b3c920-4d9e-500c-88bb-611e9c9b048a', v_owner, 'Fita de Cetim preta', 'Embalagem', 'un', 1.0, 0, 0, 5, '1m') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', v_owner, 'Cartão', 'Embalagem', 'un', 17.0, 0, 0, 5, '1 folha') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('8f498d78-e67b-5155-a13a-4f36e1d615b2', v_owner, 'TNT Laranja', 'Tecido/Sintético', 'cm2', 1.59, 0, 0, 5, '55x1,40') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('172a5e63-95cb-5e4b-acf4-4dbdb511d796', v_owner, 'Corvin Dune - 0,8 (Azul Marinho e Grafite)', 'Tecido/Sintético', 'cm2', 36.52, 0, 0, 5, '30 X 40') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('3cf0e822-7276-5f8d-b463-af9c8c6e3950', v_owner, 'Napa Branca KL', 'Tecido/Sintético', 'cm2', 10.0, 0, 0, 5, '30 x 40') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('89ab8b0f-99d1-5948-9f70-742f3099fae8', v_owner, 'Alça de mão + orelhinha', 'Alças', 'un', 3.0, 0, 0, 5, '32.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('d9c707c9-8e99-5313-a064-1fe88c28b94d', v_owner, 'Ziper Tratorado', 'Aviamento/Metal', 'un', 1.32, 0, 0, 5, '33.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('b44d0218-98e9-5d68-ae3e-d4c39b470704', v_owner, 'Cursor', 'Aviamento/Metal', 'un', 0.6, 0, 0, 5, '1.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('79890425-cd87-5d7b-b692-3557a471b511', v_owner, 'Viés', 'Aviamento/Metal', 'un', 0.55, 0, 0, 5, '100.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('7b89ee33-3a3b-597d-991d-e7633202ee13', v_owner, 'Etiqueta em Couro / Cetim', 'Aviamento/Metal', 'un', 0.45, 0, 0, 5, '1.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('1c303618-c9b0-53b1-88fd-6bb510668021', v_owner, 'Embalagem', 'Embalagem', 'un', 4.38, 0, 0, 5, '1.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('ba956d65-bb77-5971-a5a3-35f703fa40cb', v_owner, 'Nylon Cinza', 'Tecido/Sintético', 'cm2', 20.0, 0, 0, 5, '75 x 23') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('24257dc1-7af4-5657-928b-acaf0b347408', v_owner, 'Mosquetão 2mm', 'Aviamento/Metal', 'un', 0.8, 0, 0, 5, '1.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('45b96d48-6a47-53e7-b573-ec8e342fbb83', v_owner, 'Argola 2 mm', 'Aviamento/Metal', 'un', 0.28, 0, 0, 5, '1.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('4f5ed963-c6ea-5482-96a3-f434147a9afb', v_owner, 'Corvin Dune - 0,8', 'Tecido/Sintético', 'cm2', 30.25, 0, 0, 5, '54 x 36') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('890fd180-b2b1-5086-8f78-aec99c548ff8', v_owner, 'Nylon Resinado vermelho', 'Tecido/Sintético', 'cm2', 9.99, 0, 0, 5, '54 x 36') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('fe7caa14-c91c-5912-a2d7-7b12782df549', v_owner, 'Alça Corvin dune + Orelhinha', 'Alças', 'cm2', 30.25, 0, 0, 5, '0,50 x 12') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('c613ae6e-42bc-5d5b-aa3c-ba112dcf43e1', v_owner, 'Meia Argola ouro velho', 'Aviamento/Metal', 'un', 0.95, 0, 0, 5, 'unidade') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('a3fcfc81-9d9d-5f91-bf18-10a2d1b3eb97', v_owner, 'Mosquetão ouro velho', 'Aviamento/Metal', 'un', 3.48, 0, 0, 5, '2.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('afa4b616-3936-522c-80c8-3d953910f07d', v_owner, 'Regulador', 'Aviamento/Metal', 'un', 1.28, 0, 0, 5, '1.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('a2ce32e1-8b2d-5641-890e-80f6370dc5fd', v_owner, 'Etiqueta Metal com garra', 'Aviamento/Metal', 'un', 3.99, 0, 0, 5, '1.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('236f3598-a287-581d-8344-227983736ab9', v_owner, 'Alça chique Telha', 'Alças', 'cm', 3.0, 0, 0, 5, '1,20 cm') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('d1e1392b-33ec-53f8-82a5-b830587f651a', v_owner, 'Ziper', 'Aviamento/Metal', 'un', 0.6, 0, 0, 5, '0.4') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('82587b5c-c397-5909-a63f-7d0ac5e1a112', v_owner, 'Embalagem Grande', 'Embalagem', 'un', 4.38, 0, 0, 5, '1.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('4f926673-6d3f-5ad3-9294-e7007bfd1cf0', v_owner, 'Cristal Colors Preto 0,40', 'Tecido/Sintético', 'cm2', 26.31, 0, 0, 5, '28 X 20') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('6bb6725c-db1e-52d4-9963-014a57867d15', v_owner, 'Corvim 1.0 Casco Preto', 'Tecido/Sintético', 'cm2', 39.35, 0, 0, 5, '05 X 10') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('cf764f74-3f01-5461-aa36-437802a03ccc', v_owner, 'Vivo', 'Aviamento/Metal', 'un', 0.8, 0, 0, 5, '160.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('bb2fdf52-df7d-54b6-b8c0-54ab0a591c9d', v_owner, 'Alça Chique 30mm', 'Alças', 'un', 2.96, 0, 0, 5, '20.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('fbdb7708-c326-5366-bad9-8a755464856e', v_owner, 'Ziper Metro', 'Aviamento/Metal', 'un', 0.6, 0, 0, 5, '') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('08cf88d7-c48f-58e0-8e24-793aebb96869', v_owner, 'Alça Chique - 30mm', 'Alças', 'un', 2.96, 0, 0, 5, '0.32') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('507c6829-7cca-5eb5-ae08-3053b7eaf6a9', v_owner, 'Corvim 1.2 - Jacaré Preto', 'Tecido/Sintético', 'un', 55.0, 0, 0, 5, '50.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('df79269a-5884-5664-bd10-34a90a085de9', v_owner, 'Forro', 'Tecido/Sintético', 'un', 12.9, 0, 0, 5, '30.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('f5b98143-7bcb-5d09-81ae-255c92342a08', v_owner, 'Corvim Uruguai Diamente Preto Acoplado', 'Tecido/Sintético', 'un', 75.9, 0, 0, 5, '30.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('b9709e8f-dd68-5fdb-b010-12236f4c3344', v_owner, 'Embalagem (Fita, cartão, sacola)', 'Embalagem', 'un', 4.38, 0, 0, 5, '1.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('ea448fd6-826c-5e3e-8622-4780bad90060', v_owner, 'Nylon Verde', 'Tecido/Sintético', 'cm2', 21.62, 0, 0, 5, '22 x 28,5') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('656b87c3-ee67-5006-8c53-a5a434967ae4', v_owner, 'Plastico Cristal Fosco  -  30', 'Tecido/Sintético', 'cm2', 34.01, 0, 0, 5, '22 x 18,50') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('c3ba47e4-cabb-59c2-8f50-f489f0ca3df5', v_owner, 'Nylon Amarelo', 'Tecido/Sintético', 'cm2', 21.62, 0, 0, 5, '17 X 46') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('4bf4a131-eba6-5dd2-aba6-ba3bd474d9a3', v_owner, 'Alça - Cadarço', 'Alças', 'un', 0.5, 0, 0, 5, '1.43') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('f906d228-40c9-5017-9b20-38c7605ff665', v_owner, 'Corvin Dune Azul Marinho', 'Tecido/Sintético', 'cm2', 30.25, 0, 0, 5, '75 x 30') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('d028a453-6e78-5e37-a090-6eb753459aed', v_owner, 'Plastico Cristal 30', 'Tecido/Sintético', 'cm2', 26.31, 0, 0, 5, '50 x 20') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('9c2ad052-ad5c-5cfb-9b09-cb2eeaca2525', v_owner, 'Estruturador TNT 150', 'Tecido/Sintético', 'cm2', 14.9, 0, 0, 5, '42 X 26') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('f322c6c9-88a4-53b2-8272-04fd0caa5363', v_owner, 'Ziper Destacável', 'Aviamento/Metal', 'un', 0.9, 0, 0, 5, '1.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('68ab81fd-6931-5683-8b36-be602ac6c928', v_owner, 'Botão Imã  ouro velho', 'Aviamento/Metal', 'un', 1.29, 0, 0, 5, '1.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('e64ec6b0-8fd8-5048-b561-c122fe9e4eec', v_owner, 'Fita de cetim', 'Embalagem', 'un', 5.0, 0, 0, 5, '1.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('28273e70-7f7c-5ff4-b4ae-6a1030cf4e40', v_owner, 'Alça Chique (Orelhinha + faixa)', 'Alças', 'cm', 3.0, 0, 0, 5, '52 cm') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('7490d899-2f5c-507c-b1a7-433f10ca7a44', v_owner, 'Regulador Ouro Velho', 'Aviamento/Metal', 'un', 1.0, 0, 0, 5, '1.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('a7892a11-6345-5f2b-b149-f32f63894e57', v_owner, 'Retalho Jeans + Brim', 'Tecido/Sintético', 'cm2', 30.25, 0, 0, 5, '38 x 60') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('65fca728-e515-5958-8e5e-581591619218', v_owner, 'Meia Argola', 'Aviamento/Metal', 'un', 0.65, 0, 0, 5, 'unidade') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('d00fd3c3-d9a8-5ca5-afb2-667660634022', v_owner, 'Corvin Maui xadrez bege', 'Tecido/Sintético', 'cm2', 39.9, 0, 0, 5, '40 x 45') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('687f6bc1-0aaf-5cc3-be44-745b7011323f', v_owner, 'Embalagem Pequena', 'Embalagem', 'un', 1.59, 0, 0, 5, '1.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('3522dcae-7622-5a91-b816-4f6cd74d373b', v_owner, 'Alça Chique', 'Alças', 'cm', 3.0, 0, 0, 5, '30 CM') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('427a9f61-0b99-52bd-b46f-b4c73e3b164c', v_owner, 'Plástico Cristal Preto', 'Tecido/Sintético', 'cm2', 26.31, 0, 0, 5, '62 x 42') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('ace52fb8-5613-57ae-903a-f28595e6d013', v_owner, 'Elastico', 'Aviamento/Metal', 'cm', 31.97, 0, 0, 5, '160 cm') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('2a934cfa-81f0-557c-8a92-aa8f0cb6086b', v_owner, 'Alça + Orelhinha', 'Alças', 'cm', 31.97, 0, 0, 5, '160 cm') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('9bcc3bf4-1870-5c40-9da3-6dbb1929e229', v_owner, 'Botão imantado magnetico', 'Aviamento/Metal', 'cm', 1.5, 0, 0, 5, '100 cm') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('4454b4af-1c60-57f7-8f2f-867706422a40', v_owner, 'Mosquetão 2 cm', 'Aviamento/Metal', 'un', 2.99, 0, 0, 5, '1.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('0c5870d0-70ad-54af-9fbd-8062d305eb33', v_owner, 'Corrente', 'Aviamento/Metal', 'un', 15.0, 0, 0, 5, '1.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('79be39af-0718-5e06-8404-cf92bfbe176b', v_owner, 'Nylon Resinado preto', 'Tecido/Sintético', 'cm2', 19.71, 0, 0, 5, '62 x 42') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('79ccbe85-f9ff-50bc-9ebf-af721945ff08', v_owner, 'Alçca Preta', 'Tecido/Sintético', 'un', 3.5, 0, 0, 5, '100.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('bcc524a2-b626-543d-ad25-89522be4631b', v_owner, 'Lona Encerada Mostarda', 'Tecido/Sintético', 'cm2', 19.71, 0, 0, 5, '62 x 42') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('7a6c67ac-09cd-5b00-ac6a-e09a3981496e', v_owner, 'Nylon Poliester Preto', 'Tecido/Sintético', 'cm2', 31.97, 0, 0, 5, '19 X 67') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('9b61954f-097d-5f93-ac3f-e5699f982226', v_owner, 'Nylon Resinado Cinza', 'Tecido/Sintético', 'cm2', 9.99, 0, 0, 5, '50 x 40') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('8ebe9df2-9ce8-564f-92aa-a17fde2f572e', v_owner, 'Corvin 1.0 casco preto (1.40 x 40)', 'Tecido/Sintético', 'cm2', 39.35, 0, 0, 5, '19 X 67') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('d5f72451-7aeb-54c1-9ae0-abefb2fd2be8', v_owner, 'Nylon 70 emborrachado preto (1.50 x 100)', 'Tecido/Sintético', 'cm2', 19.7, 0, 0, 5, '50 x 40') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('4c89b466-6170-55d5-b2c8-fd77778439de', v_owner, 'Plástico Cristal', 'Tecido/Sintético', 'cm2', 24.5, 0, 0, 5, '29x50') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('cd85545e-c71e-57fc-b7a3-6fdc3c590002', v_owner, 'Tricoline', 'Tecido/Sintético', 'cm2', 23.95, 0, 0, 5, '29x18') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('2c5bf20d-e1ea-53f6-9b4e-375a35c54943', v_owner, 'Bagum', 'Tecido/Sintético', 'cm2', 19.98, 0, 0, 5, '29x18') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('bc77b016-2f63-5971-9466-364abf8c2b27', v_owner, 'Arte', 'Tecido/Sintético', 'un', 1.78, 0, 0, 5, '1.0') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('857a4605-2b00-5fef-b474-ab85bb14ed9c', v_owner, 'Sintético', 'Tecido/Sintético', 'cm2', 23.3, 0, 0, 5, '36x46') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('8f9ddee8-0a85-54e2-b3aa-8fc394aad0e3', v_owner, 'Alça', 'Alças', 'cm', 2.88, 0, 0, 5, '100 cm') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('6d0adbef-67cd-5ba4-9220-da46ac0a1f6d', v_owner, 'Alça para orelhinha', 'Alças', 'cm', 2.88, 0, 0, 5, '100 cm') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('e8a3d259-a34b-58ad-ae25-8859ed361eed', v_owner, 'Alça de mão 2', 'Alças', 'cm', 4.99, 0, 0, 5, '100 cm') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('955fdc02-611d-51d6-864e-20c85704b399', v_owner, 'Alça de Ombro 2', 'Alças', 'cm', 4.99, 0, 0, 5, '100 cm') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('af19bb4f-ce0c-58db-8c43-a8e8f0c18f03', v_owner, 'Sacola  - (G)', 'Embalagem', 'cm2', 3.38, 0, 0, 5, '55x1,40') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('f806545b-98d0-5891-af44-3a96f99efaa8', v_owner, 'Tela Trançada', 'Tecido/Sintético', 'cm2', 19.95, 0, 0, 5, '50 x 77 cm') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('6e3c18ad-36f3-5c9d-81b4-accf50a0f7eb', v_owner, 'Poliester (Nylon 600)', 'Tecido/Sintético', 'cm2', 10.68, 0, 0, 5, '50 x 77 cm') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('476d96e4-1b79-58d0-9e4a-42ce875d2a9a', v_owner, 'Alça de mão', 'Alças', 'cm', 3.39, 0, 0, 5, '100 cm') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('b83a43f8-68b2-5f57-b7c5-4c1654d29004', v_owner, 'Alça para orelinha', 'Alças', 'cm', 2.88, 0, 0, 5, '100 cm') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('562841db-d963-5981-99df-ddc3dee5083b', v_owner, 'Alça Acabamento', 'Alças', 'cm', 2.88, 0, 0, 5, '100 cm') on conflict (id) do nothing;
insert into public.materials (id, owner_id, name, category, unit, price, stock, min_stock, waste_percent, reference_measure) values ('584e082f-dd0a-5485-9021-be9c6bca0d62', v_owner, 'Nylon preto', 'Tecido/Sintético', 'cm2', 31.97, 0, 0, 5, '29X44') on conflict (id) do nothing;

-- Produtos + ficha técnica (BOM)
insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('1e90d2f9-0f9e-51a9-89e3-241b9de5b318', v_owner, v_niche, 'SACOLA PARA A EMBALAGEM  GRANDE - TNT CINZA CHUMBO', 30, NULL, NULL, 'Migrado da planilha · aba: Embalagem') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('1e90d2f9-0f9e-51a9-89e3-241b9de5b318', '365f68ab-ddf2-5ccc-8dc6-ec4ac97f24fb', 0.77, '77');
insert into public.product_materials (product_id, material_id, qty, note) values ('1e90d2f9-0f9e-51a9-89e3-241b9de5b318', '00b3c920-4d9e-500c-88bb-611e9c9b048a', 1.2, '120');
insert into public.product_materials (product_id, material_id, qty, note) values ('1e90d2f9-0f9e-51a9-89e3-241b9de5b318', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0556, NULL);

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('1efb6f97-70fa-5843-ba6d-a19ab05c3be4', v_owner, v_niche, 'SACOLA PARA A EMBALAGEM  GRANDE  -  TNT LARANJA', 30, NULL, NULL, 'Migrado da planilha · aba: Embalagem') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('1efb6f97-70fa-5843-ba6d-a19ab05c3be4', '8f498d78-e67b-5155-a13a-4f36e1d615b2', 0.77, '77');
insert into public.product_materials (product_id, material_id, qty, note) values ('1efb6f97-70fa-5843-ba6d-a19ab05c3be4', '00b3c920-4d9e-500c-88bb-611e9c9b048a', 1.2, '120');
insert into public.product_materials (product_id, material_id, qty, note) values ('1efb6f97-70fa-5843-ba6d-a19ab05c3be4', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0556, NULL);

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('0e36213d-c2fe-5639-9072-a03d53b0dc38', v_owner, v_niche, 'SACOLA PARA A EMBALAGEM  PEQUENA  -  TNT LARANJA', 30, NULL, NULL, 'Migrado da planilha · aba: Embalagem') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('0e36213d-c2fe-5639-9072-a03d53b0dc38', '8f498d78-e67b-5155-a13a-4f36e1d615b2', 0.406, '40.6');
insert into public.product_materials (product_id, material_id, qty, note) values ('0e36213d-c2fe-5639-9072-a03d53b0dc38', '00b3c920-4d9e-500c-88bb-611e9c9b048a', 1.2, '120');
insert into public.product_materials (product_id, material_id, qty, note) values ('0e36213d-c2fe-5639-9072-a03d53b0dc38', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0556, NULL);

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('1f279fe7-1d72-5cfe-9c20-e32594670b96', v_owner, v_niche, 'NECESSARIE DUO MÉDIA', 30, 100.0, 37.0, 'Migrado da planilha · aba: Kit do Papai') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('1f279fe7-1d72-5cfe-9c20-e32594670b96', '172a5e63-95cb-5e4b-acf4-4dbdb511d796', 0.0857, '12');
insert into public.product_materials (product_id, material_id, qty, note) values ('1f279fe7-1d72-5cfe-9c20-e32594670b96', '3cf0e822-7276-5f8d-b463-af9c8c6e3950', 0.0571, '8');
insert into public.product_materials (product_id, material_id, qty, note) values ('1f279fe7-1d72-5cfe-9c20-e32594670b96', '89ab8b0f-99d1-5948-9f70-742f3099fae8', 0.32, '0.32');
insert into public.product_materials (product_id, material_id, qty, note) values ('1f279fe7-1d72-5cfe-9c20-e32594670b96', 'd9c707c9-8e99-5313-a064-1fe88c28b94d', 0.33, '0.33');
insert into public.product_materials (product_id, material_id, qty, note) values ('1f279fe7-1d72-5cfe-9c20-e32594670b96', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('1f279fe7-1d72-5cfe-9c20-e32594670b96', '79890425-cd87-5d7b-b692-3557a471b511', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('1f279fe7-1d72-5cfe-9c20-e32594670b96', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('1f279fe7-1d72-5cfe-9c20-e32594670b96', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0559, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('1f279fe7-1d72-5cfe-9c20-e32594670b96', '1c303618-c9b0-53b1-88fd-6bb510668021', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('69a0c325-c1cd-54ff-b209-e719c4240fca', v_owner, v_niche, 'CARTEIRA SLIM', 30, 100.0, 24.9, 'Migrado da planilha · aba: Kit do Papai') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('69a0c325-c1cd-54ff-b209-e719c4240fca', '172a5e63-95cb-5e4b-acf4-4dbdb511d796', 0.0448, '4.485');
insert into public.product_materials (product_id, material_id, qty, note) values ('69a0c325-c1cd-54ff-b209-e719c4240fca', 'ba956d65-bb77-5971-a5a3-35f703fa40cb', 0.0667, '6.67');
insert into public.product_materials (product_id, material_id, qty, note) values ('69a0c325-c1cd-54ff-b209-e719c4240fca', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('db351847-ad31-5b20-98aa-7e7e95a00e5b', v_owner, v_niche, 'CHAVEIRO', 30, 100.0, 9.9, 'Migrado da planilha · aba: Kit do Papai') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('db351847-ad31-5b20-98aa-7e7e95a00e5b', '172a5e63-95cb-5e4b-acf4-4dbdb511d796', 0.005, '0.5');
insert into public.product_materials (product_id, material_id, qty, note) values ('db351847-ad31-5b20-98aa-7e7e95a00e5b', '172a5e63-95cb-5e4b-acf4-4dbdb511d796', 0.001, '0.105');
insert into public.product_materials (product_id, material_id, qty, note) values ('db351847-ad31-5b20-98aa-7e7e95a00e5b', '24257dc1-7af4-5657-928b-acaf0b347408', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('db351847-ad31-5b20-98aa-7e7e95a00e5b', '45b96d48-6a47-53e7-b573-ec8e342fbb83', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('db351847-ad31-5b20-98aa-7e7e95a00e5b', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('f6351d9f-7451-5e7f-bfa7-8fc23cd3ee00', v_owner, v_niche, 'BOLSA MALA', 30, 100.0, 144.9, 'Migrado da planilha · aba: Bolsa Mala') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('f6351d9f-7451-5e7f-bfa7-8fc23cd3ee00', '4f5ed963-c6ea-5482-96a3-f434147a9afb', 0.1389, '19.44');
insert into public.product_materials (product_id, material_id, qty, note) values ('f6351d9f-7451-5e7f-bfa7-8fc23cd3ee00', '890fd180-b2b1-5086-8f78-aec99c548ff8', 0.1296, '19.44');
insert into public.product_materials (product_id, material_id, qty, note) values ('f6351d9f-7451-5e7f-bfa7-8fc23cd3ee00', 'fe7caa14-c91c-5912-a2d7-7b12782df549', 0.0071, '0.5');
insert into public.product_materials (product_id, material_id, qty, note) values ('f6351d9f-7451-5e7f-bfa7-8fc23cd3ee00', 'c613ae6e-42bc-5d5b-aa3c-ba112dcf43e1', 2.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('f6351d9f-7451-5e7f-bfa7-8fc23cd3ee00', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 2.6667, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('f6351d9f-7451-5e7f-bfa7-8fc23cd3ee00', 'a3fcfc81-9d9d-5f91-bf18-10a2d1b3eb97', 2.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('f6351d9f-7451-5e7f-bfa7-8fc23cd3ee00', 'afa4b616-3936-522c-80c8-3d953910f07d', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('f6351d9f-7451-5e7f-bfa7-8fc23cd3ee00', 'a2ce32e1-8b2d-5641-890e-80f6370dc5fd', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('f6351d9f-7451-5e7f-bfa7-8fc23cd3ee00', '236f3598-a287-581d-8344-227983736ab9', 1.2, '1.2');
insert into public.product_materials (product_id, material_id, qty, note) values ('f6351d9f-7451-5e7f-bfa7-8fc23cd3ee00', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.4, '0.4');
insert into public.product_materials (product_id, material_id, qty, note) values ('f6351d9f-7451-5e7f-bfa7-8fc23cd3ee00', '82587b5c-c397-5909-a63f-7d0ac5e1a112', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('34894f7f-07ca-549a-bd32-e2d545ede32d', v_owner, v_niche, 'BOX CRISTAL - G', 30, 100.0, 44.0, 'Migrado da planilha · aba: Organizador Box Cristal') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('34894f7f-07ca-549a-bd32-e2d545ede32d', '4f926673-6d3f-5ad3-9294-e7007bfd1cf0', 0.04, '5.6');
insert into public.product_materials (product_id, material_id, qty, note) values ('34894f7f-07ca-549a-bd32-e2d545ede32d', '6bb6725c-db1e-52d4-9963-014a57867d15', 0.0036, '0.5');
insert into public.product_materials (product_id, material_id, qty, note) values ('34894f7f-07ca-549a-bd32-e2d545ede32d', 'cf764f74-3f01-5461-aa36-437802a03ccc', 1.6, '1.6');
insert into public.product_materials (product_id, material_id, qty, note) values ('34894f7f-07ca-549a-bd32-e2d545ede32d', 'bb2fdf52-df7d-54b6-b8c0-54ab0a591c9d', 0.2, '0.2');
insert into public.product_materials (product_id, material_id, qty, note) values ('34894f7f-07ca-549a-bd32-e2d545ede32d', 'fbdb7708-c326-5366-bad9-8a755464856e', 0.35, '0.35');
insert into public.product_materials (product_id, material_id, qty, note) values ('34894f7f-07ca-549a-bd32-e2d545ede32d', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 2.6667, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('34894f7f-07ca-549a-bd32-e2d545ede32d', '79890425-cd87-5d7b-b692-3557a471b511', 1.5949, '1.595');
insert into public.product_materials (product_id, material_id, qty, note) values ('34894f7f-07ca-549a-bd32-e2d545ede32d', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('34894f7f-07ca-549a-bd32-e2d545ede32d', '1c303618-c9b0-53b1-88fd-6bb510668021', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('561f9423-e25b-541c-a5ca-35ce1c6dcde3', v_owner, v_niche, 'BOX CRISTAL NECESSAIRE  -  P', 30, 100.0, 24.0, 'Migrado da planilha · aba: Organizador Box Cristal') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('561f9423-e25b-541c-a5ca-35ce1c6dcde3', '4f926673-6d3f-5ad3-9294-e7007bfd1cf0', 0.0736, '7.36');
insert into public.product_materials (product_id, material_id, qty, note) values ('561f9423-e25b-541c-a5ca-35ce1c6dcde3', 'fbdb7708-c326-5366-bad9-8a755464856e', 0.35, '0.35');
insert into public.product_materials (product_id, material_id, qty, note) values ('561f9423-e25b-541c-a5ca-35ce1c6dcde3', '08cf88d7-c48f-58e0-8e24-793aebb96869', 0.32, '0.32');
insert into public.product_materials (product_id, material_id, qty, note) values ('561f9423-e25b-541c-a5ca-35ce1c6dcde3', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 0.3333, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('561f9423-e25b-541c-a5ca-35ce1c6dcde3', '79890425-cd87-5d7b-b692-3557a471b511', 0.0, NULL);
insert into public.product_materials (product_id, material_id, qty, note) values ('561f9423-e25b-541c-a5ca-35ce1c6dcde3', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('68cc1347-2591-5727-97e5-d206512ec37e', v_owner, v_niche, 'BOX CRISTAL - BOLSINHA - P', 30, 100.0, 19.0, 'Migrado da planilha · aba: Organizador Box Cristal') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('68cc1347-2591-5727-97e5-d206512ec37e', '4f926673-6d3f-5ad3-9294-e7007bfd1cf0', 0.016, '1.6');
insert into public.product_materials (product_id, material_id, qty, note) values ('68cc1347-2591-5727-97e5-d206512ec37e', 'fbdb7708-c326-5366-bad9-8a755464856e', 0.35, '0.35');
insert into public.product_materials (product_id, material_id, qty, note) values ('68cc1347-2591-5727-97e5-d206512ec37e', '08cf88d7-c48f-58e0-8e24-793aebb96869', 0.32, '0.32');
insert into public.product_materials (product_id, material_id, qty, note) values ('68cc1347-2591-5727-97e5-d206512ec37e', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 0.3333, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('68cc1347-2591-5727-97e5-d206512ec37e', '79890425-cd87-5d7b-b692-3557a471b511', 0.0, NULL);
insert into public.product_materials (product_id, material_id, qty, note) values ('68cc1347-2591-5727-97e5-d206512ec37e', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('f69ae34d-2a02-5cf8-ba13-372421dea252', v_owner, v_niche, 'BAGUETE CANOA  -  MÉDIA  -  PRETO E CARAMELO', 30, 100.0, 137.9, 'Migrado da planilha · aba: Bolsa Canoa Croco') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('f69ae34d-2a02-5cf8-ba13-372421dea252', '507c6829-7cca-5eb5-ae08-3053b7eaf6a9', 0.5, '70');
insert into public.product_materials (product_id, material_id, qty, note) values ('f69ae34d-2a02-5cf8-ba13-372421dea252', 'df79269a-5884-5664-bd10-34a90a085de9', 0.3, '42');
insert into public.product_materials (product_id, material_id, qty, note) values ('f69ae34d-2a02-5cf8-ba13-372421dea252', 'cf764f74-3f01-5461-aa36-437802a03ccc', 1.6, '1.6');
insert into public.product_materials (product_id, material_id, qty, note) values ('f69ae34d-2a02-5cf8-ba13-372421dea252', 'bb2fdf52-df7d-54b6-b8c0-54ab0a591c9d', 0.6, '0.6');
insert into public.product_materials (product_id, material_id, qty, note) values ('f69ae34d-2a02-5cf8-ba13-372421dea252', 'fbdb7708-c326-5366-bad9-8a755464856e', 0.35, '0.35');
insert into public.product_materials (product_id, material_id, qty, note) values ('f69ae34d-2a02-5cf8-ba13-372421dea252', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 2.6667, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('f69ae34d-2a02-5cf8-ba13-372421dea252', '79890425-cd87-5d7b-b692-3557a471b511', 1.5949, '1.595');
insert into public.product_materials (product_id, material_id, qty, note) values ('f69ae34d-2a02-5cf8-ba13-372421dea252', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('f69ae34d-2a02-5cf8-ba13-372421dea252', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0559, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('f69ae34d-2a02-5cf8-ba13-372421dea252', '1c303618-c9b0-53b1-88fd-6bb510668021', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('eddbd683-3554-5228-80ea-ced0ed7d7bb1', v_owner, v_niche, 'BAGUETE CANOA  -  PEQUENA  -  CORVIM', 30, 100.0, 97.0, 'Migrado da planilha · aba: Bolsa Canoa Croco') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('eddbd683-3554-5228-80ea-ced0ed7d7bb1', 'f5b98143-7bcb-5d09-81ae-255c92342a08', 0.3, '42');
insert into public.product_materials (product_id, material_id, qty, note) values ('eddbd683-3554-5228-80ea-ced0ed7d7bb1', 'df79269a-5884-5664-bd10-34a90a085de9', 0.3, '42');
insert into public.product_materials (product_id, material_id, qty, note) values ('eddbd683-3554-5228-80ea-ced0ed7d7bb1', 'cf764f74-3f01-5461-aa36-437802a03ccc', 1.2, '1.2');
insert into public.product_materials (product_id, material_id, qty, note) values ('eddbd683-3554-5228-80ea-ced0ed7d7bb1', 'bb2fdf52-df7d-54b6-b8c0-54ab0a591c9d', 0.45, '0.45');
insert into public.product_materials (product_id, material_id, qty, note) values ('eddbd683-3554-5228-80ea-ced0ed7d7bb1', 'fbdb7708-c326-5366-bad9-8a755464856e', 0.26, '0.26');
insert into public.product_materials (product_id, material_id, qty, note) values ('eddbd683-3554-5228-80ea-ced0ed7d7bb1', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 2.6667, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('eddbd683-3554-5228-80ea-ced0ed7d7bb1', '79890425-cd87-5d7b-b692-3557a471b511', 1.5949, '1.595');
insert into public.product_materials (product_id, material_id, qty, note) values ('eddbd683-3554-5228-80ea-ced0ed7d7bb1', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('eddbd683-3554-5228-80ea-ced0ed7d7bb1', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0559, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('eddbd683-3554-5228-80ea-ced0ed7d7bb1', 'b9709e8f-dd68-5fdb-b010-12236f4c3344', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('1c2ab23b-a215-5794-a6ba-0d616eca2902', v_owner, v_niche, 'KIT COPA   -   NECESSARIE', 30, 100.0, 43.0, 'Migrado da planilha · aba: Kit Copa') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('1c2ab23b-a215-5794-a6ba-0d616eca2902', 'ea448fd6-826c-5e3e-8622-4780bad90060', 0.0448, '6.27');
insert into public.product_materials (product_id, material_id, qty, note) values ('1c2ab23b-a215-5794-a6ba-0d616eca2902', 'ea448fd6-826c-5e3e-8622-4780bad90060', 0.0069, '0.9666666667');
insert into public.product_materials (product_id, material_id, qty, note) values ('1c2ab23b-a215-5794-a6ba-0d616eca2902', '656b87c3-ee67-5006-8c53-a5a434967ae4', 0.0534, '7.4822');
insert into public.product_materials (product_id, material_id, qty, note) values ('1c2ab23b-a215-5794-a6ba-0d616eca2902', 'fbdb7708-c326-5366-bad9-8a755464856e', 0.21, '0.21');
insert into public.product_materials (product_id, material_id, qty, note) values ('1c2ab23b-a215-5794-a6ba-0d616eca2902', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('1c2ab23b-a215-5794-a6ba-0d616eca2902', '79890425-cd87-5d7b-b692-3557a471b511', 1.5949, '1.595');
insert into public.product_materials (product_id, material_id, qty, note) values ('1c2ab23b-a215-5794-a6ba-0d616eca2902', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('1c2ab23b-a215-5794-a6ba-0d616eca2902', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0559, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('1c2ab23b-a215-5794-a6ba-0d616eca2902', '1c303618-c9b0-53b1-88fd-6bb510668021', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('9ad909ca-d146-5150-89bc-083d6d99fbad', v_owner, v_niche, 'KIT COPA   -   BOLSINHA', 30, 100.0, 29.9, 'Migrado da planilha · aba: Kit Copa') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('9ad909ca-d146-5150-89bc-083d6d99fbad', 'ea448fd6-826c-5e3e-8622-4780bad90060', 0.0736, '7.36');
insert into public.product_materials (product_id, material_id, qty, note) values ('9ad909ca-d146-5150-89bc-083d6d99fbad', 'c3ba47e4-cabb-59c2-8f50-f489f0ca3df5', 0.0736, '7.36');
insert into public.product_materials (product_id, material_id, qty, note) values ('9ad909ca-d146-5150-89bc-083d6d99fbad', '4bf4a131-eba6-5dd2-aba6-ba3bd474d9a3', 1.43, '1.43');
insert into public.product_materials (product_id, material_id, qty, note) values ('9ad909ca-d146-5150-89bc-083d6d99fbad', '656b87c3-ee67-5006-8c53-a5a434967ae4', 0.0389, '5.4416');
insert into public.product_materials (product_id, material_id, qty, note) values ('9ad909ca-d146-5150-89bc-083d6d99fbad', 'fbdb7708-c326-5366-bad9-8a755464856e', 0.32, '0.32');
insert into public.product_materials (product_id, material_id, qty, note) values ('9ad909ca-d146-5150-89bc-083d6d99fbad', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 0.6667, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('9ad909ca-d146-5150-89bc-083d6d99fbad', '79890425-cd87-5d7b-b692-3557a471b511', 0.5, '0.5');
insert into public.product_materials (product_id, material_id, qty, note) values ('9ad909ca-d146-5150-89bc-083d6d99fbad', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('1aa4b81a-ee2d-5b21-a5b5-cd451e0b4f24', v_owner, v_niche, 'KIT COPA   -   CARTEIRA', 30, 100.0, 27.0, 'Migrado da planilha · aba: Kit Copa') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('1aa4b81a-ee2d-5b21-a5b5-cd451e0b4f24', 'ea448fd6-826c-5e3e-8622-4780bad90060', 0.0643, '9');
insert into public.product_materials (product_id, material_id, qty, note) values ('1aa4b81a-ee2d-5b21-a5b5-cd451e0b4f24', 'c3ba47e4-cabb-59c2-8f50-f489f0ca3df5', 0.0643, '9');
insert into public.product_materials (product_id, material_id, qty, note) values ('1aa4b81a-ee2d-5b21-a5b5-cd451e0b4f24', '656b87c3-ee67-5006-8c53-a5a434967ae4', 0.0607, '8.5025');
insert into public.product_materials (product_id, material_id, qty, note) values ('1aa4b81a-ee2d-5b21-a5b5-cd451e0b4f24', 'fbdb7708-c326-5366-bad9-8a755464856e', 0.26, '0.26');
insert into public.product_materials (product_id, material_id, qty, note) values ('1aa4b81a-ee2d-5b21-a5b5-cd451e0b4f24', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('1aa4b81a-ee2d-5b21-a5b5-cd451e0b4f24', '79890425-cd87-5d7b-b692-3557a471b511', 1.5949, '1.595');
insert into public.product_materials (product_id, material_id, qty, note) values ('1aa4b81a-ee2d-5b21-a5b5-cd451e0b4f24', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('6319df33-59f9-5a4d-b41c-bcd4d55f9b17', v_owner, v_niche, 'DUO CASE NECESSARIE  -  SINTÉTICO', 30, 70.0, 67.0, 'Migrado da planilha · aba: Duo Case') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('6319df33-59f9-5a4d-b41c-bcd4d55f9b17', 'f906d228-40c9-5017-9b20-38c7605ff665', 0.1607, '22.5');
insert into public.product_materials (product_id, material_id, qty, note) values ('6319df33-59f9-5a4d-b41c-bcd4d55f9b17', 'ba956d65-bb77-5971-a5a3-35f703fa40cb', 0.05, '15');
insert into public.product_materials (product_id, material_id, qty, note) values ('6319df33-59f9-5a4d-b41c-bcd4d55f9b17', 'd028a453-6e78-5e37-a090-6eb753459aed', 0.094, '13.155');
insert into public.product_materials (product_id, material_id, qty, note) values ('6319df33-59f9-5a4d-b41c-bcd4d55f9b17', '9c2ad052-ad5c-5cfb-9b09-cb2eeaca2525', 0.0447, '6.258');
insert into public.product_materials (product_id, material_id, qty, note) values ('6319df33-59f9-5a4d-b41c-bcd4d55f9b17', 'fbdb7708-c326-5366-bad9-8a755464856e', 0.42, '0.42');
insert into public.product_materials (product_id, material_id, qty, note) values ('6319df33-59f9-5a4d-b41c-bcd4d55f9b17', 'f322c6c9-88a4-53b2-8272-04fd0caa5363', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('6319df33-59f9-5a4d-b41c-bcd4d55f9b17', '68ab81fd-6931-5683-8b36-be602ac6c928', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('6319df33-59f9-5a4d-b41c-bcd4d55f9b17', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 10.4333, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('6319df33-59f9-5a4d-b41c-bcd4d55f9b17', 'cf764f74-3f01-5461-aa36-437802a03ccc', 1.16, '1.16');
insert into public.product_materials (product_id, material_id, qty, note) values ('6319df33-59f9-5a4d-b41c-bcd4d55f9b17', '79890425-cd87-5d7b-b692-3557a471b511', 1.5949, '1.595');
insert into public.product_materials (product_id, material_id, qty, note) values ('6319df33-59f9-5a4d-b41c-bcd4d55f9b17', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('6319df33-59f9-5a4d-b41c-bcd4d55f9b17', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0559, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('6319df33-59f9-5a4d-b41c-bcd4d55f9b17', '1c303618-c9b0-53b1-88fd-6bb510668021', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('6319df33-59f9-5a4d-b41c-bcd4d55f9b17', 'e64ec6b0-8fd8-5048-b561-c122fe9e4eec', 0.1, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('db9e8a23-ee8b-550a-ae39-375e7ff49db4', v_owner, v_niche, 'CLUTCH ROYALE PEQUENA', 30, 100.0, 120.0, 'Migrado da planilha · aba: Clutch Royale') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('db9e8a23-ee8b-550a-ae39-375e7ff49db4', 'f906d228-40c9-5017-9b20-38c7605ff665', 0.6036, '70');
insert into public.product_materials (product_id, material_id, qty, note) values ('db9e8a23-ee8b-550a-ae39-375e7ff49db4', '890fd180-b2b1-5086-8f78-aec99c548ff8', 0.1889, '28.33333333');
insert into public.product_materials (product_id, material_id, qty, note) values ('db9e8a23-ee8b-550a-ae39-375e7ff49db4', '28273e70-7f7c-5ff4-b4ae-6a1030cf4e40', 0.52, '52.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('db9e8a23-ee8b-550a-ae39-375e7ff49db4', 'c613ae6e-42bc-5d5b-aa3c-ba112dcf43e1', 1.3684, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('db9e8a23-ee8b-550a-ae39-375e7ff49db4', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.42, '42.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('db9e8a23-ee8b-550a-ae39-375e7ff49db4', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 1.6667, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('db9e8a23-ee8b-550a-ae39-375e7ff49db4', '68ab81fd-6931-5683-8b36-be602ac6c928', 2.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('db9e8a23-ee8b-550a-ae39-375e7ff49db4', 'a3fcfc81-9d9d-5f91-bf18-10a2d1b3eb97', 1.7989, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('db9e8a23-ee8b-550a-ae39-375e7ff49db4', '7490d899-2f5c-507c-b1a7-433f10ca7a44', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('db9e8a23-ee8b-550a-ae39-375e7ff49db4', '7b89ee33-3a3b-597d-991d-e7633202ee13', 2.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('db9e8a23-ee8b-550a-ae39-375e7ff49db4', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0559, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('db9e8a23-ee8b-550a-ae39-375e7ff49db4', '1c303618-c9b0-53b1-88fd-6bb510668021', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('556a2cc5-6ba7-53a0-90b1-a33a9f4b92ae', v_owner, v_niche, 'CROSSBODY BAG JEANS', 30, 100.0, 67.0, 'Migrado da planilha · aba: Crossbody Bag Jeans') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('556a2cc5-6ba7-53a0-90b1-a33a9f4b92ae', 'a7892a11-6345-5f2b-b149-f32f63894e57', 0.1629, '22.8');
insert into public.product_materials (product_id, material_id, qty, note) values ('556a2cc5-6ba7-53a0-90b1-a33a9f4b92ae', '65fca728-e515-5958-8e5e-581591619218', 2.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('556a2cc5-6ba7-53a0-90b1-a33a9f4b92ae', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.42, '42.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('556a2cc5-6ba7-53a0-90b1-a33a9f4b92ae', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 1.6667, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('556a2cc5-6ba7-53a0-90b1-a33a9f4b92ae', 'afa4b616-3936-522c-80c8-3d953910f07d', 0.7812, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('556a2cc5-6ba7-53a0-90b1-a33a9f4b92ae', '7b89ee33-3a3b-597d-991d-e7633202ee13', 2.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('556a2cc5-6ba7-53a0-90b1-a33a9f4b92ae', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0559, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('556a2cc5-6ba7-53a0-90b1-a33a9f4b92ae', '1c303618-c9b0-53b1-88fd-6bb510668021', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('60858831-bae6-5a69-add8-63cdef24fc8c', v_owner, v_niche, 'NECESSAIRE BOX  GG      -     FLOR DE MÃE', 30, 100.0, 45.9, 'Migrado da planilha · aba: Flor de Mãe') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('60858831-bae6-5a69-add8-63cdef24fc8c', 'd00fd3c3-d9a8-5ca5-afb2-667660634022', 0.0918, '12.85714286');
insert into public.product_materials (product_id, material_id, qty, note) values ('60858831-bae6-5a69-add8-63cdef24fc8c', '890fd180-b2b1-5086-8f78-aec99c548ff8', 0.08, '12');
insert into public.product_materials (product_id, material_id, qty, note) values ('60858831-bae6-5a69-add8-63cdef24fc8c', '28273e70-7f7c-5ff4-b4ae-6a1030cf4e40', 0.52, '52.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('60858831-bae6-5a69-add8-63cdef24fc8c', '65fca728-e515-5958-8e5e-581591619218', 1.5385, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('60858831-bae6-5a69-add8-63cdef24fc8c', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.42, '42.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('60858831-bae6-5a69-add8-63cdef24fc8c', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 3.3333, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('60858831-bae6-5a69-add8-63cdef24fc8c', '7b89ee33-3a3b-597d-991d-e7633202ee13', 2.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('60858831-bae6-5a69-add8-63cdef24fc8c', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0559, NULL);
insert into public.product_materials (product_id, material_id, qty, note) values ('60858831-bae6-5a69-add8-63cdef24fc8c', '687f6bc1-0aaf-5cc3-be44-745b7011323f', 2.7547, '40.6');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('f55a582b-3993-56d8-98ee-fad03c9f909b', v_owner, v_niche, 'NECESSAIRE BOX   M      -     FLOR DE MÃE', 30, 100.0, 39.9, 'Migrado da planilha · aba: Flor de Mãe') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('f55a582b-3993-56d8-98ee-fad03c9f909b', 'd00fd3c3-d9a8-5ca5-afb2-667660634022', 0.0612, '8.571428571');
insert into public.product_materials (product_id, material_id, qty, note) values ('f55a582b-3993-56d8-98ee-fad03c9f909b', '890fd180-b2b1-5086-8f78-aec99c548ff8', 0.0533, '8');
insert into public.product_materials (product_id, material_id, qty, note) values ('f55a582b-3993-56d8-98ee-fad03c9f909b', '28273e70-7f7c-5ff4-b4ae-6a1030cf4e40', 0.52, '52.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('f55a582b-3993-56d8-98ee-fad03c9f909b', '65fca728-e515-5958-8e5e-581591619218', 1.5385, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('f55a582b-3993-56d8-98ee-fad03c9f909b', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.32, '32.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('f55a582b-3993-56d8-98ee-fad03c9f909b', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 1.6667, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('f55a582b-3993-56d8-98ee-fad03c9f909b', '7b89ee33-3a3b-597d-991d-e7633202ee13', 2.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('f55a582b-3993-56d8-98ee-fad03c9f909b', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0559, NULL);

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('4d0a7081-6b5a-5c01-9634-df494a159486', v_owner, v_niche, 'CARTEIRA     -     FLOR DE MÃE', 30, 100.0, 39.9, 'Migrado da planilha · aba: Flor de Mãe') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('4d0a7081-6b5a-5c01-9634-df494a159486', 'd00fd3c3-d9a8-5ca5-afb2-667660634022', 0.0395, '5.535714286');
insert into public.product_materials (product_id, material_id, qty, note) values ('4d0a7081-6b5a-5c01-9634-df494a159486', '890fd180-b2b1-5086-8f78-aec99c548ff8', 0.0344, '5.166666667');
insert into public.product_materials (product_id, material_id, qty, note) values ('4d0a7081-6b5a-5c01-9634-df494a159486', '3522dcae-7622-5a91-b816-4f6cd74d373b', 0.3, '30.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('4d0a7081-6b5a-5c01-9634-df494a159486', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.32, '32.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('4d0a7081-6b5a-5c01-9634-df494a159486', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 1.6667, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('4d0a7081-6b5a-5c01-9634-df494a159486', '7b89ee33-3a3b-597d-991d-e7633202ee13', 2.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('4d0a7081-6b5a-5c01-9634-df494a159486', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0559, NULL);

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('4f36e949-8cfc-50b1-a69c-fd0283baaa57', v_owner, v_niche, 'PORTA MAQUIAGEM CRISTAL PRETO', 30, 100.0, 44.9, 'Migrado da planilha · aba: Porta Maquiagem') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('4f36e949-8cfc-50b1-a69c-fd0283baaa57', '427a9f61-0b99-52bd-b46f-b4c73e3b164c', 0.186, '26.04');
insert into public.product_materials (product_id, material_id, qty, note) values ('4f36e949-8cfc-50b1-a69c-fd0283baaa57', '79890425-cd87-5d7b-b692-3557a471b511', 3.1533, '26.04');
insert into public.product_materials (product_id, material_id, qty, note) values ('4f36e949-8cfc-50b1-a69c-fd0283baaa57', 'ace52fb8-5613-57ae-903a-f28595e6d013', 0.0, '0');
insert into public.product_materials (product_id, material_id, qty, note) values ('4f36e949-8cfc-50b1-a69c-fd0283baaa57', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.0, NULL);
insert into public.product_materials (product_id, material_id, qty, note) values ('4f36e949-8cfc-50b1-a69c-fd0283baaa57', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 0.75, '3.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('4f36e949-8cfc-50b1-a69c-fd0283baaa57', '7b89ee33-3a3b-597d-991d-e7633202ee13', 0.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('4f36e949-8cfc-50b1-a69c-fd0283baaa57', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0559, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('4f36e949-8cfc-50b1-a69c-fd0283baaa57', '687f6bc1-0aaf-5cc3-be44-745b7011323f', 2.7547, '40.6');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('490e24f6-75a5-5a34-a50b-f92dace62a3e', v_owner, v_niche, 'HOBO SHOULDER BAG', 30, 100.0, 99.9, 'Migrado da planilha · aba: Hobo Shoulder Bag') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('490e24f6-75a5-5a34-a50b-f92dace62a3e', '4f5ed963-c6ea-5482-96a3-f434147a9afb', 0.186, '26.04');
insert into public.product_materials (product_id, material_id, qty, note) values ('490e24f6-75a5-5a34-a50b-f92dace62a3e', '890fd180-b2b1-5086-8f78-aec99c548ff8', 0.1736, '26.04');
insert into public.product_materials (product_id, material_id, qty, note) values ('490e24f6-75a5-5a34-a50b-f92dace62a3e', '2a934cfa-81f0-557c-8a92-aa8f0cb6086b', 0.0, '0');
insert into public.product_materials (product_id, material_id, qty, note) values ('490e24f6-75a5-5a34-a50b-f92dace62a3e', '65fca728-e515-5958-8e5e-581591619218', 0.0, '3.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('490e24f6-75a5-5a34-a50b-f92dace62a3e', '9bcc3bf4-1870-5c40-9da3-6dbb1929e229', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('490e24f6-75a5-5a34-a50b-f92dace62a3e', '4454b4af-1c60-57f7-8f2f-867706422a40', 0.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('490e24f6-75a5-5a34-a50b-f92dace62a3e', 'afa4b616-3936-522c-80c8-3d953910f07d', 0.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('490e24f6-75a5-5a34-a50b-f92dace62a3e', '7b89ee33-3a3b-597d-991d-e7633202ee13', 2.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('490e24f6-75a5-5a34-a50b-f92dace62a3e', '0c5870d0-70ad-54af-9fbd-8062d305eb33', 0.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('490e24f6-75a5-5a34-a50b-f92dace62a3e', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0559, NULL);
insert into public.product_materials (product_id, material_id, qty, note) values ('490e24f6-75a5-5a34-a50b-f92dace62a3e', '82587b5c-c397-5909-a63f-7d0ac5e1a112', 1.0, '77');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('5fafa504-4d3f-5641-be7b-62a046a09a0f', v_owner, v_niche, 'HOBO SHOULDER BAG JEANS', 30, 100.0, 69.9, 'Migrado da planilha · aba: Hobo Shoulder Bag') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('5fafa504-4d3f-5641-be7b-62a046a09a0f', '79be39af-0718-5e06-8404-cf92bfbe176b', 0.186, '26.04');
insert into public.product_materials (product_id, material_id, qty, note) values ('5fafa504-4d3f-5641-be7b-62a046a09a0f', '890fd180-b2b1-5086-8f78-aec99c548ff8', 0.1736, '26.04');
insert into public.product_materials (product_id, material_id, qty, note) values ('5fafa504-4d3f-5641-be7b-62a046a09a0f', '79ccbe85-f9ff-50bc-9ebf-af721945ff08', 1.2, '120');
insert into public.product_materials (product_id, material_id, qty, note) values ('5fafa504-4d3f-5641-be7b-62a046a09a0f', '65fca728-e515-5958-8e5e-581591619218', 0.0, '3.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('5fafa504-4d3f-5641-be7b-62a046a09a0f', '9bcc3bf4-1870-5c40-9da3-6dbb1929e229', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('5fafa504-4d3f-5641-be7b-62a046a09a0f', '4454b4af-1c60-57f7-8f2f-867706422a40', 0.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('5fafa504-4d3f-5641-be7b-62a046a09a0f', 'afa4b616-3936-522c-80c8-3d953910f07d', 0.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('5fafa504-4d3f-5641-be7b-62a046a09a0f', '7b89ee33-3a3b-597d-991d-e7633202ee13', 2.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('5fafa504-4d3f-5641-be7b-62a046a09a0f', '0c5870d0-70ad-54af-9fbd-8062d305eb33', 0.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('5fafa504-4d3f-5641-be7b-62a046a09a0f', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0559, NULL);
insert into public.product_materials (product_id, material_id, qty, note) values ('5fafa504-4d3f-5641-be7b-62a046a09a0f', '687f6bc1-0aaf-5cc3-be44-745b7011323f', 0.29, '40.6');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('bce1a5da-3aae-5a5c-b7b5-b411774df40d', v_owner, v_niche, 'SHOLDER BAG LONA MOSTARDA', 30, 100.0, 69.9, 'Migrado da planilha · aba: Hobo Shoulder Bag') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('bce1a5da-3aae-5a5c-b7b5-b411774df40d', 'bcc524a2-b626-543d-ad25-89522be4631b', 0.186, '26.04');
insert into public.product_materials (product_id, material_id, qty, note) values ('bce1a5da-3aae-5a5c-b7b5-b411774df40d', '890fd180-b2b1-5086-8f78-aec99c548ff8', 0.1736, '26.04');
insert into public.product_materials (product_id, material_id, qty, note) values ('bce1a5da-3aae-5a5c-b7b5-b411774df40d', '79ccbe85-f9ff-50bc-9ebf-af721945ff08', 1.2, '120');
insert into public.product_materials (product_id, material_id, qty, note) values ('bce1a5da-3aae-5a5c-b7b5-b411774df40d', '65fca728-e515-5958-8e5e-581591619218', 0.0, '3.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('bce1a5da-3aae-5a5c-b7b5-b411774df40d', '9bcc3bf4-1870-5c40-9da3-6dbb1929e229', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('bce1a5da-3aae-5a5c-b7b5-b411774df40d', '4454b4af-1c60-57f7-8f2f-867706422a40', 0.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('bce1a5da-3aae-5a5c-b7b5-b411774df40d', 'afa4b616-3936-522c-80c8-3d953910f07d', 0.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('bce1a5da-3aae-5a5c-b7b5-b411774df40d', '7b89ee33-3a3b-597d-991d-e7633202ee13', 2.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('bce1a5da-3aae-5a5c-b7b5-b411774df40d', '0c5870d0-70ad-54af-9fbd-8062d305eb33', 0.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('bce1a5da-3aae-5a5c-b7b5-b411774df40d', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0559, NULL);
insert into public.product_materials (product_id, material_id, qty, note) values ('bce1a5da-3aae-5a5c-b7b5-b411774df40d', '687f6bc1-0aaf-5cc3-be44-745b7011323f', 0.29, '40.6');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('3918ad94-32c7-5f25-be43-00be4b263b50', v_owner, v_niche, 'POLCHETE ANGEL', 30, 65.0, 59.9, 'Migrado da planilha · aba: Polchete ') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('3918ad94-32c7-5f25-be43-00be4b263b50', '7a6c67ac-09cd-5b00-ac6a-e09a3981496e', 0.0909, '12.73');
insert into public.product_materials (product_id, material_id, qty, note) values ('3918ad94-32c7-5f25-be43-00be4b263b50', '9b61954f-097d-5f93-ac3f-e5699f982226', 0.1333, '20');
insert into public.product_materials (product_id, material_id, qty, note) values ('3918ad94-32c7-5f25-be43-00be4b263b50', '2a934cfa-81f0-557c-8a92-aa8f0cb6086b', 0.0686, '9.6');
insert into public.product_materials (product_id, material_id, qty, note) values ('3918ad94-32c7-5f25-be43-00be4b263b50', '65fca728-e515-5958-8e5e-581591619218', 2.3077, '3.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('3918ad94-32c7-5f25-be43-00be4b263b50', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 5.6667, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('3918ad94-32c7-5f25-be43-00be4b263b50', '4454b4af-1c60-57f7-8f2f-867706422a40', 0.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('3918ad94-32c7-5f25-be43-00be4b263b50', 'afa4b616-3936-522c-80c8-3d953910f07d', 0.3906, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('3918ad94-32c7-5f25-be43-00be4b263b50', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('3918ad94-32c7-5f25-be43-00be4b263b50', '0c5870d0-70ad-54af-9fbd-8062d305eb33', 0.0, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('3918ad94-32c7-5f25-be43-00be4b263b50', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0559, NULL);
insert into public.product_materials (product_id, material_id, qty, note) values ('3918ad94-32c7-5f25-be43-00be4b263b50', '687f6bc1-0aaf-5cc3-be44-745b7011323f', 2.7547, '40.6');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('282bccd4-6623-53ae-9f17-eed77faff865', v_owner, v_niche, 'POLCHETE JU - COM CORRENTE', 30, 100.0, 69.9, 'Migrado da planilha · aba: Polchete ') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('282bccd4-6623-53ae-9f17-eed77faff865', '8ebe9df2-9ce8-564f-92aa-a17fde2f572e', 0.0909, '12.73');
insert into public.product_materials (product_id, material_id, qty, note) values ('282bccd4-6623-53ae-9f17-eed77faff865', 'd5f72451-7aeb-54c1-9ae0-abefb2fd2be8', 0.1333, '20');
insert into public.product_materials (product_id, material_id, qty, note) values ('282bccd4-6623-53ae-9f17-eed77faff865', '2a934cfa-81f0-557c-8a92-aa8f0cb6086b', 0.1, '11.2');
insert into public.product_materials (product_id, material_id, qty, note) values ('282bccd4-6623-53ae-9f17-eed77faff865', 'd9c707c9-8e99-5313-a064-1fe88c28b94d', 0.35, '35');
insert into public.product_materials (product_id, material_id, qty, note) values ('282bccd4-6623-53ae-9f17-eed77faff865', '65fca728-e515-5958-8e5e-581591619218', 2.4615, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('282bccd4-6623-53ae-9f17-eed77faff865', '4454b4af-1c60-57f7-8f2f-867706422a40', 0.0, '0.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('282bccd4-6623-53ae-9f17-eed77faff865', 'afa4b616-3936-522c-80c8-3d953910f07d', 1.3672, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('282bccd4-6623-53ae-9f17-eed77faff865', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('282bccd4-6623-53ae-9f17-eed77faff865', '0c5870d0-70ad-54af-9fbd-8062d305eb33', 0.1667, '2.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('282bccd4-6623-53ae-9f17-eed77faff865', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0559, NULL);
insert into public.product_materials (product_id, material_id, qty, note) values ('282bccd4-6623-53ae-9f17-eed77faff865', '687f6bc1-0aaf-5cc3-be44-745b7011323f', 2.7547, '40.6');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('14178096-bb07-5929-8822-6cfb4de10edf', v_owner, v_niche, 'SAQUINHO  -  SUJINHO / LIMPINHO', 30, 67.0, 59.9, 'Migrado da planilha · aba: Sujinho Limpinho') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('14178096-bb07-5929-8822-6cfb4de10edf', '4c89b466-6170-55d5-b2c8-fd77778439de', 0.1036, '14.5');
insert into public.product_materials (product_id, material_id, qty, note) values ('14178096-bb07-5929-8822-6cfb4de10edf', 'cd85545e-c71e-57fc-b7a3-6fdc3c590002', 0.0348, '5.22');
insert into public.product_materials (product_id, material_id, qty, note) values ('14178096-bb07-5929-8822-6cfb4de10edf', '2c5bf20d-e1ea-53f6-9b4e-375a35c54943', 0.0373, '5.22');
insert into public.product_materials (product_id, material_id, qty, note) values ('14178096-bb07-5929-8822-6cfb4de10edf', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 0.0, '1 peça');
insert into public.product_materials (product_id, material_id, qty, note) values ('14178096-bb07-5929-8822-6cfb4de10edf', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 2.5833, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('14178096-bb07-5929-8822-6cfb4de10edf', '79890425-cd87-5d7b-b692-3557a471b511', 1.0, '110cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('14178096-bb07-5929-8822-6cfb4de10edf', 'bc77b016-2f63-5971-9466-364abf8c2b27', 1.0, NULL);
insert into public.product_materials (product_id, material_id, qty, note) values ('14178096-bb07-5929-8822-6cfb4de10edf', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('14178096-bb07-5929-8822-6cfb4de10edf', 'e64ec6b0-8fd8-5048-b561-c122fe9e4eec', 0.1, NULL);
insert into public.product_materials (product_id, material_id, qty, note) values ('14178096-bb07-5929-8822-6cfb4de10edf', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0559, NULL);
insert into public.product_materials (product_id, material_id, qty, note) values ('14178096-bb07-5929-8822-6cfb4de10edf', '687f6bc1-0aaf-5cc3-be44-745b7011323f', 2.7547, '40.6');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('3cd4d198-b385-5fde-bff3-c240d80a83dd', v_owner, v_niche, 'NECESSAIRE BOX - SINTÉTICO', 30, 100.0, 29.9, 'Migrado da planilha · aba: Kit Sintético') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('3cd4d198-b385-5fde-bff3-c240d80a83dd', '857a4605-2b00-5fef-b474-ab85bb14ed9c', 0.338, '23.65714286');
insert into public.product_materials (product_id, material_id, qty, note) values ('3cd4d198-b385-5fde-bff3-c240d80a83dd', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.36, '36 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('3cd4d198-b385-5fde-bff3-c240d80a83dd', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 3.3333, '1 peça');
insert into public.product_materials (product_id, material_id, qty, note) values ('3cd4d198-b385-5fde-bff3-c240d80a83dd', '8f9ddee8-0a85-54e2-b3aa-8fc394aad0e3', 0.24, '24 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('3cd4d198-b385-5fde-bff3-c240d80a83dd', '6d0adbef-67cd-5ba4-9220-da46ac0a1f6d', 0.12, '12 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('3cd4d198-b385-5fde-bff3-c240d80a83dd', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('e3984446-25e4-5ee9-9cae-aa7931a9c4cb', v_owner, v_niche, 'NECESSAIRE CARTEIRA - SINTÉTICO', 30, 100.0, 24.9, 'Migrado da planilha · aba: Kit Sintético') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('e3984446-25e4-5ee9-9cae-aa7931a9c4cb', '857a4605-2b00-5fef-b474-ab85bb14ed9c', 0.2653, '18.57142857');
insert into public.product_materials (product_id, material_id, qty, note) values ('e3984446-25e4-5ee9-9cae-aa7931a9c4cb', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.26, '26 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('e3984446-25e4-5ee9-9cae-aa7931a9c4cb', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 3.3333, '1 peça');
insert into public.product_materials (product_id, material_id, qty, note) values ('e3984446-25e4-5ee9-9cae-aa7931a9c4cb', '8f9ddee8-0a85-54e2-b3aa-8fc394aad0e3', 0.3, '30 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('e3984446-25e4-5ee9-9cae-aa7931a9c4cb', '6d0adbef-67cd-5ba4-9220-da46ac0a1f6d', 0.12, '12 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('e3984446-25e4-5ee9-9cae-aa7931a9c4cb', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('b96ec4d1-818d-5fea-9e4e-476115b396a2', v_owner, v_niche, 'BOLSA DE PRAIA - SINTÉTICO', 30, 75.0, 69.9, 'Migrado da planilha · aba: Kit Sintético') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('b96ec4d1-818d-5fea-9e4e-476115b396a2', '857a4605-2b00-5fef-b474-ab85bb14ed9c', 0.7857, '55');
insert into public.product_materials (product_id, material_id, qty, note) values ('b96ec4d1-818d-5fea-9e4e-476115b396a2', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.5, '50 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('b96ec4d1-818d-5fea-9e4e-476115b396a2', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 2.9167, '1 peça');
insert into public.product_materials (product_id, material_id, qty, note) values ('b96ec4d1-818d-5fea-9e4e-476115b396a2', 'e8a3d259-a34b-58ad-ae25-8859ed361eed', 0.3, '48 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('b96ec4d1-818d-5fea-9e4e-476115b396a2', '955fdc02-611d-51d6-864e-20c85704b399', 1.4, '140 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('b96ec4d1-818d-5fea-9e4e-476115b396a2', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('5983b929-9d92-5567-a8d8-9311aa8e7af4', v_owner, v_niche, 'SACOLA PARA A EMBALAGEM', 30, NULL, NULL, 'Migrado da planilha · aba: Kit Sintético') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('5983b929-9d92-5567-a8d8-9311aa8e7af4', 'af19bb4f-ce0c-58db-8c43-a8e8f0c18f03', 0.77, '77');
insert into public.product_materials (product_id, material_id, qty, note) values ('5983b929-9d92-5567-a8d8-9311aa8e7af4', '00b3c920-4d9e-500c-88bb-611e9c9b048a', 1.2, '120');
insert into public.product_materials (product_id, material_id, qty, note) values ('5983b929-9d92-5567-a8d8-9311aa8e7af4', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0556, NULL);

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('a0bd2991-3bd5-55f2-828c-4ad7dad3dcd7', v_owner, v_niche, 'NECESSAIRE BOX - SINTÉTICO', 30, 70.0, 30.0, 'Migrado da planilha · aba: Kit Carteira e necessarie Sinté') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('a0bd2991-3bd5-55f2-828c-4ad7dad3dcd7', '857a4605-2b00-5fef-b474-ab85bb14ed9c', 0.338, '23.65714286');
insert into public.product_materials (product_id, material_id, qty, note) values ('a0bd2991-3bd5-55f2-828c-4ad7dad3dcd7', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.36, '36 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('a0bd2991-3bd5-55f2-828c-4ad7dad3dcd7', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 3.3333, '1 peça');
insert into public.product_materials (product_id, material_id, qty, note) values ('a0bd2991-3bd5-55f2-828c-4ad7dad3dcd7', '8f9ddee8-0a85-54e2-b3aa-8fc394aad0e3', 0.24, '24 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('a0bd2991-3bd5-55f2-828c-4ad7dad3dcd7', '6d0adbef-67cd-5ba4-9220-da46ac0a1f6d', 0.12, '12 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('a0bd2991-3bd5-55f2-828c-4ad7dad3dcd7', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');
insert into public.product_materials (product_id, material_id, qty, note) values ('a0bd2991-3bd5-55f2-828c-4ad7dad3dcd7', '1c303618-c9b0-53b1-88fd-6bb510668021', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('c606f8ea-d813-5485-a3d4-f7234677437d', v_owner, v_niche, 'NECESSAIRE CARTEIRA - SINTÉTICO', 30, 70.0, 24.9, 'Migrado da planilha · aba: Kit Carteira e necessarie Sinté') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('c606f8ea-d813-5485-a3d4-f7234677437d', '857a4605-2b00-5fef-b474-ab85bb14ed9c', 0.2653, '18.57142857');
insert into public.product_materials (product_id, material_id, qty, note) values ('c606f8ea-d813-5485-a3d4-f7234677437d', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.26, '26 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('c606f8ea-d813-5485-a3d4-f7234677437d', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 3.3333, '1 peça');
insert into public.product_materials (product_id, material_id, qty, note) values ('c606f8ea-d813-5485-a3d4-f7234677437d', '8f9ddee8-0a85-54e2-b3aa-8fc394aad0e3', 0.3, '30 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('c606f8ea-d813-5485-a3d4-f7234677437d', '6d0adbef-67cd-5ba4-9220-da46ac0a1f6d', 0.12, '12 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('c606f8ea-d813-5485-a3d4-f7234677437d', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('adf39389-4d8f-5b4e-8c8b-dd82a6981278', v_owner, v_niche, 'BOLSA DE PRAIA - TELA TRANÇADA', 30, 75.0, 69.9, 'Migrado da planilha · aba: Kit Tela Trançada') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('adf39389-4d8f-5b4e-8c8b-dd82a6981278', 'f806545b-98d0-5891-af44-3a96f99efaa8', 0.7857, '55');
insert into public.product_materials (product_id, material_id, qty, note) values ('adf39389-4d8f-5b4e-8c8b-dd82a6981278', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.5, '50 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('adf39389-4d8f-5b4e-8c8b-dd82a6981278', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 2.9167, '1 peça');
insert into public.product_materials (product_id, material_id, qty, note) values ('adf39389-4d8f-5b4e-8c8b-dd82a6981278', 'e8a3d259-a34b-58ad-ae25-8859ed361eed', 0.48, '48 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('adf39389-4d8f-5b4e-8c8b-dd82a6981278', '955fdc02-611d-51d6-864e-20c85704b399', 1.4, '140 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('adf39389-4d8f-5b4e-8c8b-dd82a6981278', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('adc96426-2c24-5ebd-8d7e-bedb73c4cc20', v_owner, v_niche, 'NECESSAIRE CARTEIRA - TELA TRANÇADA', 30, 100.0, 24.9, 'Migrado da planilha · aba: Kit Tela Trançada') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('adc96426-2c24-5ebd-8d7e-bedb73c4cc20', '857a4605-2b00-5fef-b474-ab85bb14ed9c', 0.2272, '18.57142857');
insert into public.product_materials (product_id, material_id, qty, note) values ('adc96426-2c24-5ebd-8d7e-bedb73c4cc20', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.26, '26 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('adc96426-2c24-5ebd-8d7e-bedb73c4cc20', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 3.3333, '1 peça');
insert into public.product_materials (product_id, material_id, qty, note) values ('adc96426-2c24-5ebd-8d7e-bedb73c4cc20', '8f9ddee8-0a85-54e2-b3aa-8fc394aad0e3', 0.5198, '30 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('adc96426-2c24-5ebd-8d7e-bedb73c4cc20', '6d0adbef-67cd-5ba4-9220-da46ac0a1f6d', 0.2079, '12 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('adc96426-2c24-5ebd-8d7e-bedb73c4cc20', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('8f34888d-7096-5295-bc40-618e7dca9bad', v_owner, v_niche, 'NECESSAIRE BOX  - G  - TELA TRANÇADA', 30, 100.0, 29.9, 'Migrado da planilha · aba: Kit Tela Trançada') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('8f34888d-7096-5295-bc40-618e7dca9bad', '857a4605-2b00-5fef-b474-ab85bb14ed9c', 0.2894, '23.65714286');
insert into public.product_materials (product_id, material_id, qty, note) values ('8f34888d-7096-5295-bc40-618e7dca9bad', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.36, '36 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('8f34888d-7096-5295-bc40-618e7dca9bad', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 3.3333, '1 peça');
insert into public.product_materials (product_id, material_id, qty, note) values ('8f34888d-7096-5295-bc40-618e7dca9bad', '8f9ddee8-0a85-54e2-b3aa-8fc394aad0e3', 0.4158, '24 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('8f34888d-7096-5295-bc40-618e7dca9bad', '6d0adbef-67cd-5ba4-9220-da46ac0a1f6d', 0.2079, '12 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('8f34888d-7096-5295-bc40-618e7dca9bad', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('d41e36af-9df0-5e46-9f13-60ffd6397da4', v_owner, v_niche, 'SACOLA PARA A EMBALAGEM', 30, NULL, NULL, 'Migrado da planilha · aba: Kit Tela Trançada') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('d41e36af-9df0-5e46-9f13-60ffd6397da4', 'af19bb4f-ce0c-58db-8c43-a8e8f0c18f03', 0.77, '77');
insert into public.product_materials (product_id, material_id, qty, note) values ('d41e36af-9df0-5e46-9f13-60ffd6397da4', '00b3c920-4d9e-500c-88bb-611e9c9b048a', 1.2, '120');
insert into public.product_materials (product_id, material_id, qty, note) values ('d41e36af-9df0-5e46-9f13-60ffd6397da4', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0556, NULL);

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('a127abc4-0ed5-5520-9245-54e3a78dcca3', v_owner, v_niche, 'BOLSA DE PRAIA - POLIESTER VERDE MUSGO E LARANJA', 30, 75.0, 69.9, 'Migrado da planilha · aba: Kit Verde Musgo e Laranja') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('a127abc4-0ed5-5520-9245-54e3a78dcca3', '6e3c18ad-36f3-5c9d-81b4-accf50a0f7eb', 0.7857, '55');
insert into public.product_materials (product_id, material_id, qty, note) values ('a127abc4-0ed5-5520-9245-54e3a78dcca3', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.5, '50 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('a127abc4-0ed5-5520-9245-54e3a78dcca3', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 2.9167, '1 peça');
insert into public.product_materials (product_id, material_id, qty, note) values ('a127abc4-0ed5-5520-9245-54e3a78dcca3', '955fdc02-611d-51d6-864e-20c85704b399', 0.8832, '130 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('a127abc4-0ed5-5520-9245-54e3a78dcca3', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('b1fade7b-0134-55f3-a3f2-1fdc3691c6e5', v_owner, v_niche, 'NECESSAIRE CARTEIRA - POLIESTER VERDE MUSGO E LARANJA', 30, 100.0, 24.9, 'Migrado da planilha · aba: Kit Verde Musgo e Laranja') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('b1fade7b-0134-55f3-a3f2-1fdc3691c6e5', '6e3c18ad-36f3-5c9d-81b4-accf50a0f7eb', 0.2653, '18.57142857');
insert into public.product_materials (product_id, material_id, qty, note) values ('b1fade7b-0134-55f3-a3f2-1fdc3691c6e5', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.26, '26 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('b1fade7b-0134-55f3-a3f2-1fdc3691c6e5', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 3.3333, '1 peça');
insert into public.product_materials (product_id, material_id, qty, note) values ('b1fade7b-0134-55f3-a3f2-1fdc3691c6e5', '476d96e4-1b79-58d0-9e4a-42ce875d2a9a', 0.3, '30 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('b1fade7b-0134-55f3-a3f2-1fdc3691c6e5', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('74b7f0f7-3dba-5eac-be80-4bd30cfebe56', v_owner, v_niche, 'NECESSAIRE BOX  - G  - POLIESTER VERDE MUSGO E LARANJA', 30, 100.0, 29.9, 'Migrado da planilha · aba: Kit Verde Musgo e Laranja') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('74b7f0f7-3dba-5eac-be80-4bd30cfebe56', '6e3c18ad-36f3-5c9d-81b4-accf50a0f7eb', 0.338, '23.65714286');
insert into public.product_materials (product_id, material_id, qty, note) values ('74b7f0f7-3dba-5eac-be80-4bd30cfebe56', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.36, '36 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('74b7f0f7-3dba-5eac-be80-4bd30cfebe56', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 3.3333, '1 peça');
insert into public.product_materials (product_id, material_id, qty, note) values ('74b7f0f7-3dba-5eac-be80-4bd30cfebe56', '476d96e4-1b79-58d0-9e4a-42ce875d2a9a', 0.24, '24 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('74b7f0f7-3dba-5eac-be80-4bd30cfebe56', '6d0adbef-67cd-5ba4-9220-da46ac0a1f6d', 0.1413, '12 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('74b7f0f7-3dba-5eac-be80-4bd30cfebe56', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('9dd62844-c1b5-5029-b950-2d61aae5e0af', v_owner, v_niche, 'SACOLA PARA A EMBALAGEM', 30, NULL, NULL, 'Migrado da planilha · aba: Kit Verde Musgo e Laranja') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('9dd62844-c1b5-5029-b950-2d61aae5e0af', 'af19bb4f-ce0c-58db-8c43-a8e8f0c18f03', 0.77, '77');
insert into public.product_materials (product_id, material_id, qty, note) values ('9dd62844-c1b5-5029-b950-2d61aae5e0af', '00b3c920-4d9e-500c-88bb-611e9c9b048a', 1.2, '120');
insert into public.product_materials (product_id, material_id, qty, note) values ('9dd62844-c1b5-5029-b950-2d61aae5e0af', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0556, NULL);

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('84cb1b47-74da-57f2-abeb-b10cec6e846e', v_owner, v_niche, 'Necessaire Box Gabi - P', 30, 70.0, 19.9, 'Migrado da planilha · aba: Necessaire Box Gabi') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('84cb1b47-74da-57f2-abeb-b10cec6e846e', 'f806545b-98d0-5891-af44-3a96f99efaa8', 0.1786, '12.5');
insert into public.product_materials (product_id, material_id, qty, note) values ('84cb1b47-74da-57f2-abeb-b10cec6e846e', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.28, '28 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('84cb1b47-74da-57f2-abeb-b10cec6e846e', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 3.3333, '1 peça');
insert into public.product_materials (product_id, material_id, qty, note) values ('84cb1b47-74da-57f2-abeb-b10cec6e846e', '476d96e4-1b79-58d0-9e4a-42ce875d2a9a', 0.1699, '20 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('84cb1b47-74da-57f2-abeb-b10cec6e846e', 'b83a43f8-68b2-5f57-b7c5-4c1654d29004', 0.12, '12 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('84cb1b47-74da-57f2-abeb-b10cec6e846e', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('42c593b6-c4c4-5715-8889-b3bf207870d9', v_owner, v_niche, 'Necessaire Box Carioquinha - P', 30, 100.0, 19.9, 'Migrado da planilha · aba: Kit Carioquinha') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('42c593b6-c4c4-5715-8889-b3bf207870d9', 'f806545b-98d0-5891-af44-3a96f99efaa8', 0.1786, '12.5');
insert into public.product_materials (product_id, material_id, qty, note) values ('42c593b6-c4c4-5715-8889-b3bf207870d9', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.28, '28 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('42c593b6-c4c4-5715-8889-b3bf207870d9', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 1.1667, '1 peça');
insert into public.product_materials (product_id, material_id, qty, note) values ('42c593b6-c4c4-5715-8889-b3bf207870d9', '476d96e4-1b79-58d0-9e4a-42ce875d2a9a', 0.1699, '20 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('42c593b6-c4c4-5715-8889-b3bf207870d9', 'b83a43f8-68b2-5f57-b7c5-4c1654d29004', 0.12, '12 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('42c593b6-c4c4-5715-8889-b3bf207870d9', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('1adeb8c5-7342-5cb7-bbfc-779f9a793401', v_owner, v_niche, 'Necessaire Carioquinha - 33x50', 30, 100.0, 29.9, 'Migrado da planilha · aba: Kit Carioquinha') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('1adeb8c5-7342-5cb7-bbfc-779f9a793401', 'f806545b-98d0-5891-af44-3a96f99efaa8', 0.3367, '23.57142857');
insert into public.product_materials (product_id, material_id, qty, note) values ('1adeb8c5-7342-5cb7-bbfc-779f9a793401', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.34, '34 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('1adeb8c5-7342-5cb7-bbfc-779f9a793401', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 0.0, '1 peça');
insert into public.product_materials (product_id, material_id, qty, note) values ('1adeb8c5-7342-5cb7-bbfc-779f9a793401', '476d96e4-1b79-58d0-9e4a-42ce875d2a9a', 0.2549, '30 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('1adeb8c5-7342-5cb7-bbfc-779f9a793401', '562841db-d963-5981-99df-ddc3dee5083b', 0.32, '32 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('1adeb8c5-7342-5cb7-bbfc-779f9a793401', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('9682aef2-e8c6-50d1-a17e-f73de2cdec1c', v_owner, v_niche, 'BOLSA TIRACOLO DE NYLON COM CORRENTE', 30, 100.0, 69.9, 'Migrado da planilha · aba: Bolsa e Carteira Preta Nylon') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('9682aef2-e8c6-50d1-a17e-f73de2cdec1c', '584e082f-dd0a-5485-9021-be9c6bca0d62', 0.2604, '18.22857143');
insert into public.product_materials (product_id, material_id, qty, note) values ('9682aef2-e8c6-50d1-a17e-f73de2cdec1c', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.24, '24 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('9682aef2-e8c6-50d1-a17e-f73de2cdec1c', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 1.1667, '1 peça');
insert into public.product_materials (product_id, material_id, qty, note) values ('9682aef2-e8c6-50d1-a17e-f73de2cdec1c', '0c5870d0-70ad-54af-9fbd-8062d305eb33', 0.4, '1,20 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('9682aef2-e8c6-50d1-a17e-f73de2cdec1c', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.0, '1.0');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('f577f9ca-1022-58cc-8338-48bd11c1ec38', v_owner, v_niche, 'CARTEIRA DE NYLON COM 3 DIVISÓRIAS', 30, 100.0, 44.9, 'Migrado da planilha · aba: Bolsa e Carteira Preta Nylon') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('f577f9ca-1022-58cc-8338-48bd11c1ec38', '584e082f-dd0a-5485-9021-be9c6bca0d62', 0.2653, '18.57142857');
insert into public.product_materials (product_id, material_id, qty, note) values ('f577f9ca-1022-58cc-8338-48bd11c1ec38', 'd1e1392b-33ec-53f8-82a5-b830587f651a', 0.26, '26 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('f577f9ca-1022-58cc-8338-48bd11c1ec38', 'b44d0218-98e9-5d68-ae3e-d4c39b470704', 3.3333, '1 peça');
insert into public.product_materials (product_id, material_id, qty, note) values ('f577f9ca-1022-58cc-8338-48bd11c1ec38', '8f9ddee8-0a85-54e2-b3aa-8fc394aad0e3', 0.5198, '30 cm');
insert into public.product_materials (product_id, material_id, qty, note) values ('f577f9ca-1022-58cc-8338-48bd11c1ec38', '7b89ee33-3a3b-597d-991d-e7633202ee13', 1.3307, '12 cm');

insert into public.products (id, owner_id, niche_id, name, labor_minutes, margin_percent, sale_price_override, notes) values ('1c85c4ab-4a34-5952-a8de-482494f1b5ba', v_owner, v_niche, 'SACOLA PARA A EMBALAGEM', 30, NULL, NULL, 'Migrado da planilha · aba: Bolsa e Carteira Preta Nylon') on conflict (id) do nothing;
insert into public.product_materials (product_id, material_id, qty, note) values ('1c85c4ab-4a34-5952-a8de-482494f1b5ba', 'af19bb4f-ce0c-58db-8c43-a8e8f0c18f03', 0.77, '77');
insert into public.product_materials (product_id, material_id, qty, note) values ('1c85c4ab-4a34-5952-a8de-482494f1b5ba', '00b3c920-4d9e-500c-88bb-611e9c9b048a', 1.2, '120');
insert into public.product_materials (product_id, material_id, qty, note) values ('1c85c4ab-4a34-5952-a8de-482494f1b5ba', 'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98', 0.0556, NULL);

end $$;