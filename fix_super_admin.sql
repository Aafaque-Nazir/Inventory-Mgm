-- 1. Apply the Schema Changes (Safe to run multiple times if using 'if not exists' but we will just replace the trigger)

-- Ensure UUID extension
create extension if not exists "uuid-ossp";

-- Create Organizations Table if not exists
create table if not exists organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null, 
  subscription_status text check (subscription_status in ('ACTIVE', 'INACTIVE', 'SUSPENDED')) default 'ACTIVE',
  valid_until timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Add columns to Profiles if they don't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'organization_id') then
        alter table profiles add column organization_id uuid references organizations(id);
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'is_super_admin') then
        alter table profiles add column is_super_admin boolean default false;
    end if;
end $$;

-- Add organization_id to other tables
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'items' and column_name = 'organization_id') then
        alter table items add column organization_id uuid references organizations(id);
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'suppliers' and column_name = 'organization_id') then
        alter table suppliers add column organization_id uuid references organizations(id);
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'purchase_orders' and column_name = 'organization_id') then
        alter table purchase_orders add column organization_id uuid references organizations(id);
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'purchase_order_items' and column_name = 'organization_id') then
        alter table purchase_order_items add column organization_id uuid references organizations(id);
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'stock_movements' and column_name = 'organization_id') then
        alter table stock_movements add column organization_id uuid references organizations(id);
    end if;
end $$;


-- 2. UPDATE THE TRIGGER (The specific fix for Future users)
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
    COALESCE(new.raw_user_meta_data->>'role', 'STOREKEEPER'),
    (new.raw_user_meta_data->>'organization_id')::uuid,
    COALESCE((new.raw_user_meta_data->>'is_super_admin')::boolean, false)
  );
  return new;
end;
$$ language plpgsql security definer;

-- 3. FIX THE EXISTING SUPER ADMIN USER
-- We find the profile linked to the email (via auth.users joined with profiles, but simpler to just update profiles where id matches user with that email)
-- Since we can't easily join auth.users in a simple update from here without permissions sometimes, let's try a direct approach using the known email structure if possible.
-- Actually, the safest way in SQL Editor:

UPDATE public.profiles
SET 
  role = 'ADMIN',
  is_super_admin = true
FROM auth.users
WHERE public.profiles.id = auth.users.id
AND auth.users.email = 'aafaquesuper@gmail.com';

-- 4. Enable RLS (In case it wasn't) and Add Policies
-- (We'll skip full policy re-write here to keep it short, assuming you might run the full schema.sql later, 
-- but we MUST ensure super admin can access)

create policy "Super Admins can do everything"
  on profiles for all
  using (is_super_admin = true);
  
-- Allow Super Admin on Organizations
create policy "Super Admins organizations access"
  on organizations for all
  using (
     exists (select 1 from profiles where id = auth.uid() and is_super_admin = true)
  );
