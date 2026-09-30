-- ============================================================================
-- Flag "controla estoque" por produto. Produtos antigos (ficha técnica com
-- materiais genéricos, sem estoque real) ficam com has_stock_control = false:
-- o botão "Produzir" não verifica nem desconta estoque para eles. Produtos
-- novos, a partir de agora, controlam estoque normalmente (default true).
--
-- Só desativa os 48 produtos da carga de demonstração original (IDs fixos,
-- definidos no seed_bolsas.sql) -- qualquer produto criado depois disso
-- (inclusive os que ela já cadastrou com os materiais novos) fica de fora e
-- mantém o controle de estoque ligado.
-- ============================================================================

alter table public.products add column if not exists has_stock_control boolean not null default true;

update public.products set has_stock_control = false where id in (
  '1e90d2f9-0f9e-51a9-89e3-241b9de5b318', '1efb6f97-70fa-5843-ba6d-a19ab05c3be4', '0e36213d-c2fe-5639-9072-a03d53b0dc38',
  '1f279fe7-1d72-5cfe-9c20-e32594670b96', '69a0c325-c1cd-54ff-b209-e719c4240fca', 'db351847-ad31-5b20-98aa-7e7e95a00e5b',
  'f6351d9f-7451-5e7f-bfa7-8fc23cd3ee00', '34894f7f-07ca-549a-bd32-e2d545ede32d', '561f9423-e25b-541c-a5ca-35ce1c6dcde3',
  '68cc1347-2591-5727-97e5-d206512ec37e', 'f69ae34d-2a02-5cf8-ba13-372421dea252', 'eddbd683-3554-5228-80ea-ced0ed7d7bb1',
  '1c2ab23b-a215-5794-a6ba-0d616eca2902', '9ad909ca-d146-5150-89bc-083d6d99fbad', '1aa4b81a-ee2d-5b21-a5b5-cd451e0b4f24',
  '6319df33-59f9-5a4d-b41c-bcd4d55f9b17', 'db9e8a23-ee8b-550a-ae39-375e7ff49db4', '556a2cc5-6ba7-53a0-90b1-a33a9f4b92ae',
  '60858831-bae6-5a69-add8-63cdef24fc8c', 'f55a582b-3993-56d8-98ee-fad03c9f909b', '4d0a7081-6b5a-5c01-9634-df494a159486',
  '4f36e949-8cfc-50b1-a69c-fd0283baaa57', '490e24f6-75a5-5a34-a50b-f92dace62a3e', '5fafa504-4d3f-5641-be7b-62a046a09a0f',
  'bce1a5da-3aae-5a5c-b7b5-b411774df40d', '3918ad94-32c7-5f25-be43-00be4b263b50', '282bccd4-6623-53ae-9f17-eed77faff865',
  '14178096-bb07-5929-8822-6cfb4de10edf', '3cd4d198-b385-5fde-bff3-c240d80a83dd', 'e3984446-25e4-5ee9-9cae-aa7931a9c4cb',
  'b96ec4d1-818d-5fea-9e4e-476115b396a2', '5983b929-9d92-5567-a8d8-9311aa8e7af4', 'a0bd2991-3bd5-55f2-828c-4ad7dad3dcd7',
  'c606f8ea-d813-5485-a3d4-f7234677437d', 'adf39389-4d8f-5b4e-8c8b-dd82a6981278', 'adc96426-2c24-5ebd-8d7e-bedb73c4cc20',
  '8f34888d-7096-5295-bc40-618e7dca9bad', 'd41e36af-9df0-5e46-9f13-60ffd6397da4', 'a127abc4-0ed5-5520-9245-54e3a78dcca3',
  'b1fade7b-0134-55f3-a3f2-1fdc3691c6e5', '74b7f0f7-3dba-5eac-be80-4bd30cfebe56', '9dd62844-c1b5-5029-b950-2d61aae5e0af',
  '84cb1b47-74da-57f2-abeb-b10cec6e846e', '42c593b6-c4c4-5715-8889-b3bf207870d9', '1adeb8c5-7342-5cb7-bbfc-779f9a793401',
  '9682aef2-e8c6-50d1-a17e-f73de2cdec1c', 'f577f9ca-1022-58cc-8338-48bd11c1ec38', '1c85c4ab-4a34-5952-a8de-482494f1b5ba'
);
