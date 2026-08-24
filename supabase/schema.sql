-- =====================================================================
-- Setup Inventory — schema da sincronizacao na nuvem
-- Cole este arquivo inteiro no SQL Editor do Supabase e clique em "Run".
-- Pode ser executado mais de uma vez sem quebrar nada.
-- =====================================================================

create table if not exists public.setup_items (
  id              uuid primary key,
  user_id         uuid not null references auth.users (id) on delete cascade,
  name            text not null,
  platform        text not null,
  category        text not null,
  status          text not null check (status in ('owned', 'wishlist')),
  price_paid      numeric(12, 2),
  purchase_date   date,
  estimated_price numeric(12, 2),
  priority        text check (priority in ('alta', 'media', 'baixa')),
  product_url     text,
  image_url       text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Acelera a listagem do inventario de cada usuario.
create index if not exists setup_items_user_id_idx
  on public.setup_items (user_id);

-- =====================================================================
-- Row Level Security: cada pessoa enxerga e altera SOMENTE os proprios itens.
-- Sem estas politicas, a chave anon poderia ler os dados de outras contas.
-- =====================================================================

alter table public.setup_items enable row level security;

drop policy if exists "Usuarios leem os proprios itens"      on public.setup_items;
drop policy if exists "Usuarios inserem os proprios itens"   on public.setup_items;
drop policy if exists "Usuarios atualizam os proprios itens" on public.setup_items;
drop policy if exists "Usuarios excluem os proprios itens"   on public.setup_items;

create policy "Usuarios leem os proprios itens"
  on public.setup_items for select
  using (auth.uid() = user_id);

create policy "Usuarios inserem os proprios itens"
  on public.setup_items for insert
  with check (auth.uid() = user_id);

create policy "Usuarios atualizam os proprios itens"
  on public.setup_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuarios excluem os proprios itens"
  on public.setup_items for delete
  using (auth.uid() = user_id);
