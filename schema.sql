-- ============================================================================
-- PRECIFICA — schema completo (Supabase / Postgres)
-- Rode isso no SQL Editor do seu projeto Supabase (free tier), na ordem.
-- ============================================================================
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. NICHOS  (define tema visual + rótulos; usuário recebe 1 nicho no cadastro)
-- ----------------------------------------------------------------------------
create table public.niches (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  theme jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. PLANOS DE ASSINATURA (o admin gerencia; free tier já incluso)
-- ----------------------------------------------------------------------------
create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  price_cents integer not null default 0,
  max_products integer,           -- null = ilimitado
  max_materials integer,          -- null = ilimitado
  features jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. PERFIS (1 por usuário do Supabase Auth; guarda nicho, papel e assinatura)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  niche_id uuid references public.niches(id),
  logo_url text,
  role text not null default 'user' check (role in ('admin','user')),
  plan_id uuid references public.subscription_plans(id),
  subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing','active','past_due','canceled')),
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. CONFIGURAÇÕES DE PRECIFICAÇÃO (parametrização por usuário)
-- ----------------------------------------------------------------------------
create table public.settings (
  owner_id uuid primary key references public.profiles(id) on delete cascade,
  labor_cost_per_hour numeric not null default 15,
  monthly_fixed_expenses numeric not null default 450,
  monthly_capacity_units numeric not null default 60,
  maintenance_percent numeric not null default 8,
  card_fee_percent numeric not null default 4.99,
  default_margin_percent numeric not null default 100,
  round_to_90 boolean not null default true,
  initial_investment numeric not null default 0,  -- equipamentos, softwares, estoque inicial etc.; usado no acompanhamento de retorno em Relatórios
  dashboard_widgets jsonb,  -- array de ids de widget, na ordem escolhida pelo usuário; null = padrão
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. MATERIAIS (estoque)
-- ----------------------------------------------------------------------------

-- categorias de material — por nicho (não por usuário): todo mundo que usa o
-- mesmo tipo de negócio compartilha a mesma lista de categorias (crud em
-- Configurações). Diferente de materiais/settings, que são por usuário.
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  niche_id uuid not null references public.niches(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (niche_id, name)
);
create index categories_niche_idx on public.categories(niche_id);

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text,                     -- legado; ver category_id abaixo
  category_id uuid references public.categories(id) on delete set null,
  unit text not null default 'un',   -- m, cm, m2, cm2, kg, g, l, ml, un
  price numeric not null default 0,  -- preço por unidade de medida
  stock numeric not null default 0,
  min_stock numeric not null default 0,
  waste_percent numeric not null default 0,   -- % de perda (sobra de corte etc.)
  supplier text,
  image_url text,                    -- legado; ver image_urls abaixo
  image_urls text[] not null default '{}'::text[],  -- até 5 fotos (Supabase Storage)
  reference_measure text,            -- texto livre vindo da planilha original
  technical_description text,        -- ficha técnica: composição, cuidados, especificações etc.
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index materials_owner_idx on public.materials(owner_id);

-- histórico de preço (alimentado automaticamente por trigger)
create table public.material_price_history (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials(id) on delete cascade,
  price numeric not null,
  changed_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 6. PRODUTOS (ficha técnica / BOM)
-- ----------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  niche_id uuid references public.niches(id),
  name text not null,
  image_url text,                    -- legado; ver image_urls abaixo
  image_urls text[] not null default '{}'::text[],  -- até 5 fotos (Supabase Storage)
  labor_minutes numeric not null default 0,
  notes text,
  dimensions text,
  margin_percent numeric,            -- se null, usa settings.default_margin_percent
  sale_price_override numeric,
  is_kit boolean not null default false,
  produced_count numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_owner_idx on public.products(owner_id);

-- materiais usados em cada produto
create table public.product_materials (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete restrict,
  qty numeric not null default 0,
  note text
);
create index product_materials_product_idx on public.product_materials(product_id);

-- produtos que compõem um kit (produto com is_kit = true)
create table public.product_kit_items (
  id uuid primary key default gen_random_uuid(),
  kit_product_id uuid not null references public.products(id) on delete cascade,
  item_product_id uuid not null references public.products(id) on delete restrict,
  qty numeric not null default 1
);

-- ----------------------------------------------------------------------------
-- 7. PRODUÇÃO (baixa de estoque) e ORÇAMENTOS (proposta pro cliente)
-- ----------------------------------------------------------------------------
create table public.production_log (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  qty numeric not null,
  cost_snapshot jsonb,
  produced_at timestamptz not null default now()
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  client_name text not null,
  client_contact text,
  items jsonb not null default '[]'::jsonb,   -- [{product_id, name, qty, unit_price}]
  total numeric not null default 0,
  notes text,
  valid_until date,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- FUNÇÕES / TRIGGERS
-- ============================================================================

-- helper: usuário logado é admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- cria o profile automaticamente quando alguém se cadastra
-- (o front manda niche_slug e full_name em raw_user_meta_data no signUp)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_niche_id uuid;
  v_free_plan uuid;
begin
  select id into v_niche_id from public.niches
    where slug = coalesce(new.raw_user_meta_data->>'niche_slug', 'generico') limit 1;
  select id into v_free_plan from public.subscription_plans where slug = 'free' limit 1;

  insert into public.profiles (id, email, full_name, niche_id, plan_id)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', v_niche_id, v_free_plan);

  insert into public.settings (owner_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- grava histórico sempre que o preço de um material muda
-- (AFTER, não BEFORE: a linha em materials já precisa existir de verdade
-- antes de gravar a referência em material_price_history, senão a FK falha)
create or replace function public.log_material_price_change()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') or (new.price is distinct from old.price) then
    insert into public.material_price_history (material_id, price) values (new.id, new.price);
  end if;
  return new;
end;
$$;

create trigger materials_price_history
  after insert or update on public.materials
  for each row execute function public.log_material_price_change();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger materials_touch
  before update on public.materials
  for each row execute function public.touch_updated_at();

create trigger products_touch
  before update on public.products
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.niches enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.categories enable row level security;
alter table public.materials enable row level security;
alter table public.material_price_history enable row level security;
alter table public.products enable row level security;
alter table public.product_materials enable row level security;
alter table public.product_kit_items enable row level security;
alter table public.production_log enable row level security;
alter table public.quotes enable row level security;

-- niches: leitura pública (a tela de cadastro, antes do login, precisa listar
-- os nichos disponíveis); plans: só autenticado lê. Escrita só admin em ambas.
create policy "niches_select" on public.niches for select using (true);
create policy "niches_admin_write" on public.niches for all using (public.is_admin()) with check (public.is_admin());

create policy "plans_select" on public.subscription_plans for select using (auth.role() = 'authenticated');
create policy "plans_admin_write" on public.subscription_plans for all using (public.is_admin()) with check (public.is_admin());

-- profiles: usuário vê/edita o próprio; admin vê/edita todos
create policy "profiles_self_select" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_self_update" on public.profiles for update using (id = auth.uid() or public.is_admin());
create policy "profiles_admin_insert" on public.profiles for insert with check (public.is_admin() or id = auth.uid());

-- settings: cada usuário só vê/edita o próprio, inclusive admin — o painel
-- Admin gerencia perfis/planos/nichos, não os dados de negócio de outros.
create policy "settings_owner" on public.settings for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- materials
create policy "categories_same_niche" on public.categories for all
  using (niche_id = (select p.niche_id from public.profiles p where p.id = auth.uid()))
  with check (niche_id = (select p.niche_id from public.profiles p where p.id = auth.uid()));

create policy "materials_owner" on public.materials for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "price_history_owner" on public.material_price_history for select
  using (exists(select 1 from public.materials m where m.id = material_id and m.owner_id = auth.uid()));

create policy "price_history_insert" on public.material_price_history for insert
  with check (exists(select 1 from public.materials m where m.id = material_id and m.owner_id = auth.uid()));

-- products
create policy "products_owner" on public.products for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "product_materials_owner" on public.product_materials for all
  using (exists(select 1 from public.products p where p.id = product_id and p.owner_id = auth.uid()))
  with check (exists(select 1 from public.products p where p.id = product_id and p.owner_id = auth.uid()));

create policy "kit_items_owner" on public.product_kit_items for all
  using (exists(select 1 from public.products p where p.id = kit_product_id and p.owner_id = auth.uid()))
  with check (exists(select 1 from public.products p where p.id = kit_product_id and p.owner_id = auth.uid()));

-- production log / quotes
create policy "production_owner" on public.production_log for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "quotes_owner" on public.quotes for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- ============================================================================
-- STORAGE — bucket para fotos de produto (até 5 por produto)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_owner_write" on storage.objects for insert
  with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "product_images_owner_update" on storage.objects for update
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "product_images_owner_delete" on storage.objects for delete
  using (bucket_id = 'product-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================================
-- SEED — nichos e planos padrão
-- ============================================================================
insert into public.niches (id, slug, name, theme) values
  ('8544e5b9-2437-5a34-b6bc-928796b4de6c', 'bolsas', 'Ateliê de Bolsas & Acessórios',
   '{"bg":"#F7F4EF","surface":"#FFFFFF","surfaceAlt":"#EFE9DF","border":"#E2D9C8","primary":"#7A5C42","primarySoft":"#EADFCB","accent":"#9C6B4F","text":"#2E2A24","textMuted":"#7A7266","danger":"#B5544A","good":"#5E7A5C"}'::jsonb),
  (gen_random_uuid(), 'doces', 'Confeitaria & Doces Finos',
   '{"bg":"#FBF3EF","surface":"#FFFFFF","surfaceAlt":"#F3DFD8","border":"#EBD2C8","primary":"#A3564A","primarySoft":"#F1D9D1","accent":"#C97B5E","text":"#332420","textMuted":"#8A6E64","danger":"#A83A3A","good":"#6E7F4F"}'::jsonb),
  (gen_random_uuid(), 'generico', 'Outro nicho (genérico)',
   '{"bg":"#F4F5F5","surface":"#FFFFFF","surfaceAlt":"#E7EBEA","border":"#DCE1DF","primary":"#3F5E58","primarySoft":"#DCE6E2","accent":"#5B7F76","text":"#242927","textMuted":"#75837F","danger":"#B0524A","good":"#3F5E58"}'::jsonb)
on conflict (slug) do nothing;

insert into public.subscription_plans (slug, name, price_cents, max_products, max_materials, features) values
  ('free', 'Grátis', 0, 15, 30, '["1 nicho","Precificação completa","Controle de estoque"]'::jsonb),
  ('pro', 'Pro', 2990, null, null, '["Produtos ilimitados","Kits","Orçamento em PDF","Histórico de preço"]'::jsonb)
on conflict (slug) do nothing;

-- ============================================================================
-- COMO CRIAR O PRIMEIRO ADMIN (rode depois que você já tiver feito signup):
-- update public.profiles set role = 'admin' where email = 'seu-email@exemplo.com';
-- ============================================================================
