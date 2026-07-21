-- Allow authenticated users to create organizations
-- This is required for the Onboarding flow to work.
create policy "Users can create organizations"
  on organizations for insert
  with check (auth.role() = 'authenticated');


 abe maine teko task diya tha na ise jo chize necessary h wo add karne biut tu kiya nai and task me bolta h done /./.usme user free hai toh plan free badge ya kuch aisa kuch laga de and and 