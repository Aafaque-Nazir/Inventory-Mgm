-- STEP 1: Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('items', 'suppliers', 'profiles', 'organizations', 'stock_movements', 'purchase_orders');

-- STEP 2: Check what policies exist on items table
SELECT 
    policyname, 
    permissive, 
    roles, 
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'items';

-- STEP 3: Test the get_my_org_id() function
-- This shows what organization_id the current user has
SELECT get_my_org_id();
