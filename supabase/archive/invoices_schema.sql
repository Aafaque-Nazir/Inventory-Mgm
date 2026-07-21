-- RUN THIS IN SUPABASE SQL EDITOR

create table if not exists invoices (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  organization_id uuid references organizations(id),
  customer_name text,
  customer_phone text,
  total_amount numeric,
  payment_method text default 'CASH', -- CASH, UPI, CARD, OTHER
  items jsonb, -- Stores snapshot: [{id, name, quantity, price, total}]
  created_by uuid references profiles(id)
);

-- Enable RLS
alter table invoices enable row level security;

-- Policies
create policy "Users can view their org invoices" on invoices
  for select using (organization_id in (select organization_id from profiles where id = auth.uid()));

create policy "Users can create invoices" on invoices
  for insert with check (organization_id in (select organization_id from profiles where id = auth.uid()));
