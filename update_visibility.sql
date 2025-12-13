-- 1. Add columns for storing credentials (DEMO/DEV PURPOSE ONLY)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS temp_password text;

-- 2. Update the trigger function to capture email and password from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    role, 
    organization_id,
    is_super_admin,
    email,
    temp_password
  )
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'role', 'STOREKEEPER'),
    (new.raw_user_meta_data->>'organization_id')::uuid,
    COALESCE((new.raw_user_meta_data->>'is_super_admin')::boolean, false),
    new.email,
    new.raw_user_meta_data->>'temp_password'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
