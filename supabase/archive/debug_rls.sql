-- DEBUG SCRIPT: Run this in Supabase SQL Editor to check the state of your data

-- 1. Check your profiles table to see which users have which organization_id
SELECT id, full_name, role, organization_id, is_super_admin FROM profiles;

-- 2. Check your organizations table
SELECT id, name, slug FROM organizations;

-- 3. Check items and their organization_id (if you see NULLs, RLS won't work!)
SELECT id, name, organization_id FROM items LIMIT 10;

-- 4. Test the get_my_org_id() function as the current logged-in user
-- This should return the organization_id of the currently logged-in user
-- If this returns NULL, RLS policies won't filter anything!
SELECT get_my_org_id();
