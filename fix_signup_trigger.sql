-- Secure the Signup Trigger
-- Prevents users from injecting 'is_super_admin': true in metadata to gain admin access.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    role, 
    organization_id,
    is_super_admin
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'STOREKEEPER'), 
    (NEW.raw_user_meta_data->>'organization_id')::uuid,
    false -- ALWAYS FALSE. Promotion must be done manually via SQL or Admin Panel.
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
