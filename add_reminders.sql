-- ============================================================================
-- Lembretes livres do usuário (ex: "comprar fita adesiva", "ligar pro
-- fornecedor"), mostrados como widget no painel.
--
-- Rode isso uma vez no SQL Editor do Supabase.
-- ============================================================================

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists reminders_owner_idx on public.reminders(owner_id);

alter table public.reminders enable row level security;

create policy "reminders_owner" on public.reminders for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
