-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 0. Organizations Table (The Tenant)
create table organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null, -- For URL or internal reference e.g., 'dominos'
  subscription_status text check (subscription_status in ('ACTIVE', 'INACTIVE', 'SUSPENDED')) default 'ACTIVE',
  valid_until timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- 1. Profiles Table (Enhanced for Multi-Tenant)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text check (role in ('STOREKEEPER', 'MANAGER', 'ADMIN')),
  organization_id uuid references organizations(id),
  is_super_admin boolean default false,
  created_at timestamp with time zone default now()
);

-- 2. Items Table
create table items (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations(id) not null,
  name text not null,
  sku text not null,
  category text,
  unit text not null,
  min_stock numeric default 0,
  max_stock numeric,
  current_stock numeric default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(organization_id, sku) -- SKU must be unique per organization, not globally
);

-- 3. Suppliers Table
create table suppliers (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations(id) not null,
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
  organization_id uuid references organizations(id) not null,
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
  organization_id uuid references organizations(id) not null,
  order_id uuid references purchase_orders(id) on delete cascade,
  item_id uuid references items(id) on delete restrict,
  quantity numeric not null,
  price numeric not null,
  line_total numeric not null
);

-- 6. Stock Movements Table
create table stock_movements (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations(id) not null,
  item_id uuid references items(id) on delete restrict,
  quantity numeric not null,
  type text check (type in ('IN', 'OUT')) not null,
  reason text,
  reference_id uuid,
  created_by uuid references profiles(id),
  created_at timestamp with time zone default now()
);

-- Security & RLS Policies

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table items enable row level security;
alter table suppliers enable row level security;
alter table purchase_orders enable row level security;
alter table purchase_order_items enable row level security;
alter table stock_movements enable row level security;

-- Helper function to get current user's organization_id
create or replace function get_my_org_id()
returns uuid as $$
  select organization_id from profiles where id = auth.uid();
$$ language sql stable;

-- Helper function to check if user is super admin
create or replace function is_super_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and is_super_admin = true
  );
$$ language sql stable;

-- ORGANIZATION Policies
create policy "Super Admins can do everything on organizations"
  on organizations for all
  using (is_super_admin());

create policy "Users can view their own organization"
  on organizations for select
  using (id = get_my_org_id());

-- PROFILES Policies
create policy "Super Admins can do everything on profiles"
  on profiles for all
  using (is_super_admin());

create policy "Users can view profiles in their own org"
  on profiles for select
  using (organization_id = get_my_org_id());

create policy "Org Admins can update profiles in their own org"
  on profiles for update
  using (
    organization_id = get_my_org_id() 
    and exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
  );

-- DATA TABLES Policies (Items, Suppliers, etc.)
-- Standard Rule: View/Edit if record.organization_id matches user.organization_id
-- OR if user is Super Admin

-- Items
create policy "Tenant Isolation for Items"
  on items for all
  using (organization_id = get_my_org_id() or is_super_admin());

-- Suppliers
create policy "Tenant Isolation for Suppliers"
  on suppliers for all
  using (organization_id = get_my_org_id() or is_super_admin());

-- Purchase Orders
create policy "Tenant Isolation for POs"
  on purchase_orders for all
  using (organization_id = get_my_org_id() or is_super_admin());

-- Purchase Order Items
create policy "Tenant Isolation for PO Items"
  on purchase_order_items for all
  using (organization_id = get_my_org_id() or is_super_admin());

-- Stock Movements
create policy "Tenant Isolation for Stock"
  on stock_movements for all
  using (organization_id = get_my_org_id() or is_super_admin());


-- TRIGGER for New Users
-- This handles linking auth.users to public.profiles.
-- It attempts to grab 'organization_id' and 'is_super_admin' from metadata if provided (by Super Admin script).
-- Fallback: If no metadata, user is created without org (orphan), waiting for assignment or setup.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    full_name, 
    role, 
    organization_id,
    is_super_admin
  )
  values (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'role', 'STOREKEEPER'), -- Default to lowest role
    (new.raw_user_meta_data->>'organization_id')::uuid,
    COALESCE((new.raw_user_meta_data->>'is_super_admin')::boolean, false)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Re-create the trigger if it doesn't exist (droppping first to be safe in a script)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
