-- ============================================================================
-- LIMPEZA: remove os 81 materiais e 48 produtos do seed_bolsas.sql que foram
-- inseridos com o owner_id ERRADO, pra você poder rodar o seed de novo com o
-- id certo (o seed usa "on conflict (id) do nothing", então enquanto essas
-- linhas existirem presas no usuário errado, rodar de novo não faz nada).
--
-- Troque OWNER_UUID_ERRADO pelo id que foi usado por engano, e rode isso
-- uma vez no SQL Editor do Supabase ANTES de rodar o seed_bolsas.sql de novo.
-- ============================================================================

do $$
declare
  v_owner uuid := 'OWNER_UUID_ERRADO'; -- <<< SUBSTITUA AQUI pelo id errado usado
begin

  -- Produtos (isso já apaga em cascata a ficha técnica / product_materials
  -- e qualquer produção registrada nesses produtos)
  delete from public.products
  where owner_id = v_owner
    and id in (
    '1e90d2f9-0f9e-51a9-89e3-241b9de5b318',
    '1efb6f97-70fa-5843-ba6d-a19ab05c3be4',
    '0e36213d-c2fe-5639-9072-a03d53b0dc38',
    '1f279fe7-1d72-5cfe-9c20-e32594670b96',
    '69a0c325-c1cd-54ff-b209-e719c4240fca',
    'db351847-ad31-5b20-98aa-7e7e95a00e5b',
    'f6351d9f-7451-5e7f-bfa7-8fc23cd3ee00',
    '34894f7f-07ca-549a-bd32-e2d545ede32d',
    '561f9423-e25b-541c-a5ca-35ce1c6dcde3',
    '68cc1347-2591-5727-97e5-d206512ec37e',
    'f69ae34d-2a02-5cf8-ba13-372421dea252',
    'eddbd683-3554-5228-80ea-ced0ed7d7bb1',
    '1c2ab23b-a215-5794-a6ba-0d616eca2902',
    '9ad909ca-d146-5150-89bc-083d6d99fbad',
    '1aa4b81a-ee2d-5b21-a5b5-cd451e0b4f24',
    '6319df33-59f9-5a4d-b41c-bcd4d55f9b17',
    'db9e8a23-ee8b-550a-ae39-375e7ff49db4',
    '556a2cc5-6ba7-53a0-90b1-a33a9f4b92ae',
    '60858831-bae6-5a69-add8-63cdef24fc8c',
    'f55a582b-3993-56d8-98ee-fad03c9f909b',
    '4d0a7081-6b5a-5c01-9634-df494a159486',
    '4f36e949-8cfc-50b1-a69c-fd0283baaa57',
    '490e24f6-75a5-5a34-a50b-f92dace62a3e',
    '5fafa504-4d3f-5641-be7b-62a046a09a0f',
    'bce1a5da-3aae-5a5c-b7b5-b411774df40d',
    '3918ad94-32c7-5f25-be43-00be4b263b50',
    '282bccd4-6623-53ae-9f17-eed77faff865',
    '14178096-bb07-5929-8822-6cfb4de10edf',
    '3cd4d198-b385-5fde-bff3-c240d80a83dd',
    'e3984446-25e4-5ee9-9cae-aa7931a9c4cb',
    'b96ec4d1-818d-5fea-9e4e-476115b396a2',
    '5983b929-9d92-5567-a8d8-9311aa8e7af4',
    'a0bd2991-3bd5-55f2-828c-4ad7dad3dcd7',
    'c606f8ea-d813-5485-a3d4-f7234677437d',
    'adf39389-4d8f-5b4e-8c8b-dd82a6981278',
    'adc96426-2c24-5ebd-8d7e-bedb73c4cc20',
    '8f34888d-7096-5295-bc40-618e7dca9bad',
    'd41e36af-9df0-5e46-9f13-60ffd6397da4',
    'a127abc4-0ed5-5520-9245-54e3a78dcca3',
    'b1fade7b-0134-55f3-a3f2-1fdc3691c6e5',
    '74b7f0f7-3dba-5eac-be80-4bd30cfebe56',
    '9dd62844-c1b5-5029-b950-2d61aae5e0af',
    '84cb1b47-74da-57f2-abeb-b10cec6e846e',
    '42c593b6-c4c4-5715-8889-b3bf207870d9',
    '1adeb8c5-7342-5cb7-bbfc-779f9a793401',
    '9682aef2-e8c6-50d1-a17e-f73de2cdec1c',
    'f577f9ca-1022-58cc-8338-48bd11c1ec38',
    '1c85c4ab-4a34-5952-a8de-482494f1b5ba'
    );

  -- Materiais (isso já apaga em cascata o histórico de preço deles)
  delete from public.materials
  where owner_id = v_owner
    and id in (
    '365f68ab-ddf2-5ccc-8dc6-ec4ac97f24fb',
    '00b3c920-4d9e-500c-88bb-611e9c9b048a',
    'a74e19a6-6379-5a5a-8ee6-9a6cb7288c98',
    '8f498d78-e67b-5155-a13a-4f36e1d615b2',
    '172a5e63-95cb-5e4b-acf4-4dbdb511d796',
    '3cf0e822-7276-5f8d-b463-af9c8c6e3950',
    '89ab8b0f-99d1-5948-9f70-742f3099fae8',
    'd9c707c9-8e99-5313-a064-1fe88c28b94d',
    'b44d0218-98e9-5d68-ae3e-d4c39b470704',
    '79890425-cd87-5d7b-b692-3557a471b511',
    '7b89ee33-3a3b-597d-991d-e7633202ee13',
    '1c303618-c9b0-53b1-88fd-6bb510668021',
    'ba956d65-bb77-5971-a5a3-35f703fa40cb',
    '24257dc1-7af4-5657-928b-acaf0b347408',
    '45b96d48-6a47-53e7-b573-ec8e342fbb83',
    '4f5ed963-c6ea-5482-96a3-f434147a9afb',
    '890fd180-b2b1-5086-8f78-aec99c548ff8',
    'fe7caa14-c91c-5912-a2d7-7b12782df549',
    'c613ae6e-42bc-5d5b-aa3c-ba112dcf43e1',
    'a3fcfc81-9d9d-5f91-bf18-10a2d1b3eb97',
    'afa4b616-3936-522c-80c8-3d953910f07d',
    'a2ce32e1-8b2d-5641-890e-80f6370dc5fd',
    '236f3598-a287-581d-8344-227983736ab9',
    'd1e1392b-33ec-53f8-82a5-b830587f651a',
    '82587b5c-c397-5909-a63f-7d0ac5e1a112',
    '4f926673-6d3f-5ad3-9294-e7007bfd1cf0',
    '6bb6725c-db1e-52d4-9963-014a57867d15',
    'cf764f74-3f01-5461-aa36-437802a03ccc',
    'bb2fdf52-df7d-54b6-b8c0-54ab0a591c9d',
    'fbdb7708-c326-5366-bad9-8a755464856e',
    '08cf88d7-c48f-58e0-8e24-793aebb96869',
    '507c6829-7cca-5eb5-ae08-3053b7eaf6a9',
    'df79269a-5884-5664-bd10-34a90a085de9',
    'f5b98143-7bcb-5d09-81ae-255c92342a08',
    'b9709e8f-dd68-5fdb-b010-12236f4c3344',
    'ea448fd6-826c-5e3e-8622-4780bad90060',
    '656b87c3-ee67-5006-8c53-a5a434967ae4',
    'c3ba47e4-cabb-59c2-8f50-f489f0ca3df5',
    '4bf4a131-eba6-5dd2-aba6-ba3bd474d9a3',
    'f906d228-40c9-5017-9b20-38c7605ff665',
    'd028a453-6e78-5e37-a090-6eb753459aed',
    '9c2ad052-ad5c-5cfb-9b09-cb2eeaca2525',
    'f322c6c9-88a4-53b2-8272-04fd0caa5363',
    '68ab81fd-6931-5683-8b36-be602ac6c928',
    'e64ec6b0-8fd8-5048-b561-c122fe9e4eec',
    '28273e70-7f7c-5ff4-b4ae-6a1030cf4e40',
    '7490d899-2f5c-507c-b1a7-433f10ca7a44',
    'a7892a11-6345-5f2b-b149-f32f63894e57',
    '65fca728-e515-5958-8e5e-581591619218',
    'd00fd3c3-d9a8-5ca5-afb2-667660634022',
    '687f6bc1-0aaf-5cc3-be44-745b7011323f',
    '3522dcae-7622-5a91-b816-4f6cd74d373b',
    '427a9f61-0b99-52bd-b46f-b4c73e3b164c',
    'ace52fb8-5613-57ae-903a-f28595e6d013',
    '2a934cfa-81f0-557c-8a92-aa8f0cb6086b',
    '9bcc3bf4-1870-5c40-9da3-6dbb1929e229',
    '4454b4af-1c60-57f7-8f2f-867706422a40',
    '0c5870d0-70ad-54af-9fbd-8062d305eb33',
    '79be39af-0718-5e06-8404-cf92bfbe176b',
    '79ccbe85-f9ff-50bc-9ebf-af721945ff08',
    'bcc524a2-b626-543d-ad25-89522be4631b',
    '7a6c67ac-09cd-5b00-ac6a-e09a3981496e',
    '9b61954f-097d-5f93-ac3f-e5699f982226',
    '8ebe9df2-9ce8-564f-92aa-a17fde2f572e',
    'd5f72451-7aeb-54c1-9ae0-abefb2fd2be8',
    '4c89b466-6170-55d5-b2c8-fd77778439de',
    'cd85545e-c71e-57fc-b7a3-6fdc3c590002',
    '2c5bf20d-e1ea-53f6-9b4e-375a35c54943',
    'bc77b016-2f63-5971-9466-364abf8c2b27',
    '857a4605-2b00-5fef-b474-ab85bb14ed9c',
    '8f9ddee8-0a85-54e2-b3aa-8fc394aad0e3',
    '6d0adbef-67cd-5ba4-9220-da46ac0a1f6d',
    'e8a3d259-a34b-58ad-ae25-8859ed361eed',
    '955fdc02-611d-51d6-864e-20c85704b399',
    'af19bb4f-ce0c-58db-8c43-a8e8f0c18f03',
    'f806545b-98d0-5891-af44-3a96f99efaa8',
    '6e3c18ad-36f3-5c9d-81b4-accf50a0f7eb',
    '476d96e4-1b79-58d0-9e4a-42ce875d2a9a',
    'b83a43f8-68b2-5f57-b7c5-4c1654d29004',
    '562841db-d963-5981-99df-ddc3dee5083b',
    '584e082f-dd0a-5485-9021-be9c6bca0d62'
    );

end $$;
