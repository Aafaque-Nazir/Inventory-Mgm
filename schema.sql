-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text check (role in ('STOREKEEPER', 'MANAGER', 'ADMIN')),
  created_at timestamp with time zone default now()
);

-- 2. Items Table
create table items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  sku text unique not null,
  category text,
  unit text not null,
  min_stock numeric default 0,
  max_stock numeric,
  current_stock numeric default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. Suppliers Table
create table suppliers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  created_at timestamp with time zone default now()
);

-- 4. Purchase Orders Table
create table purchase_orders (
  id uuid default uuid_generate_v4() primary key,
  supplier_id uuid references suppliers(id) on delete set null,
  status text check (status in ('DRAFT', 'APPROVED', 'RECEIVED', 'CANCELLED')) default 'DRAFT',
  total_amount numeric default 0,
  created_by uuid references profiles(id),
  approved_by uuid references profiles(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 5. Purchase Order Items Table
create table purchase_order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references purchase_orders(id) on delete cascade,
  item_id uuid references items(id) on delete restrict,
  quantity numeric not null,
  price numeric not null,
  line_total numeric not null
);

-- 6. Stock Movements Table
create table stock_movements (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references items(id) on delete restrict,
  quantity numeric not null,
  type text check (type in ('IN', 'OUT')) not null,
  reason text,
  reference_id uuid,
  created_by uuid references profiles(id),
  created_at timestamp with time zone default now()
);

-- RLS Policies (Basic)
alter table profiles enable row level security;
alter table items enable row level security;
alter table suppliers enable row level security;
alter table purchase_orders enable row level security;
alter table purchase_order_items enable row level security;
alter table stock_movements enable row level security;

-- Allow read access to authenticated users for all tables
create policy "Allow read access for authenticated users" on profiles for select using (auth.role() = 'authenticated');
create policy "Allow read access for authenticated users" on items for select using (auth.role() = 'authenticated');
create policy "Allow read access for authenticated users" on suppliers for select using (auth.role() = 'authenticated');
create policy "Allow read access for authenticated users" on purchase_orders for select using (auth.role() = 'authenticated');
create policy "Allow read access for authenticated users" on purchase_order_items for select using (auth.role() = 'authenticated');
create policy "Allow read access for authenticated users" on stock_movements for select using (auth.role() = 'authenticated');

-- Allow insert/update for authenticated users (Refine this later based on roles if needed)
create policy "Allow insert/update for authenticated users" on profiles for insert with check (auth.uid() = id);
create policy "Allow update for authenticated users" on profiles for update using (auth.uid() = id);

create policy "Allow all for authenticated users" on items for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated users" on suppliers for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated users" on purchase_orders for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated users" on purchase_order_items for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated users" on stock_movements for all using (auth.role() = 'authenticated');

-- Trigger to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'STOREKEEPER'); -- Default role
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
