-- Replace with the exact email address of the super admin
UPDATE profiles
SET 
  is_super_admin = true,
  role = 'ADMIN'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'aafaquesuper@gmail.com'
);

-- Optional: Ensure they have an organization (if they got stuck somewhere)
-- But usually the onboarding handles org creation.
