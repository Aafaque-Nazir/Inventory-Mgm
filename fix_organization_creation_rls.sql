-- Add created_by column if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'organizations' and column_name = 'created_by') then
    alter table organizations add column created_by uuid references auth.users(id);
  end if;
end $$;

-- Update Create Organization policy
drop policy if exists "Create Organization" on organizations;
create policy "Create Organization"
  on organizations for insert
  with check (auth.role() = 'authenticated');

-- Update View Own Organization policy to include created_by
drop policy if exists "View Own Organization" on organizations;
create policy "View Own Organization" 
  on organizations for select
  using (
    id = (select public.get_my_org_id()) 
    or (select public.is_super_admin())
    or created_by = auth.uid()
  );
