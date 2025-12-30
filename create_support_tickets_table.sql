-- Create Support Tickets Table
create table if not exists support_tickets (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references organizations(id),
  user_id uuid references auth.users(id),
  type text check (type in ('BUG', 'FEATURE_REQUEST', 'GENERAL', 'OTHER')) not null,
  subject text not null,
  message text not null,
  status text check (status in ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')) default 'OPEN',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS Policies for Support Tickets
alter table support_tickets enable row level security;

-- Users can view their own tickets
create policy "Users can view their own tickets"
  on support_tickets for select
  using (auth.uid() = user_id);

-- Users can create tickets
create policy "Users can create tickets"
  on support_tickets for insert
  with check (auth.uid() = user_id);

-- Super Admins can view all tickets
create policy "Super Admins can view all tickets"
  on support_tickets for all
  using (is_super_admin());
