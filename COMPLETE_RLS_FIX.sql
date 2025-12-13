-- ============================================
-- COMPREHENSIVE RLS FIX SCRIPT
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- STEP 1: Ensure helper functions exist
CREATE OR REPLACE FUNCTION get_my_org_id()
RETURNS uuid AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- STEP 2: FORCE Enable RLS on ALL tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- STEP 3: Force RLS for table OWNERS too (this is often the missing step!)
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE items FORCE ROW LEVEL SECURITY;
ALTER TABLE suppliers FORCE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders FORCE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items FORCE ROW LEVEL SECURITY;
ALTER TABLE stock_movements FORCE ROW LEVEL SECURITY;

-- STEP 4: DROP existing policies (clean slate)
DROP POLICY IF EXISTS "Super Admins can do everything on organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
DROP POLICY IF EXISTS "Super Admins can do everything on profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their own org" ON profiles;
DROP POLICY IF EXISTS "Org Admins can update profiles in their own org" ON profiles;
DROP POLICY IF EXISTS "Tenant Isolation for Items" ON items;
DROP POLICY IF EXISTS "Tenant Isolation for Suppliers" ON suppliers;
DROP POLICY IF EXISTS "Tenant Isolation for POs" ON purchase_orders;
DROP POLICY IF EXISTS "Tenant Isolation for PO Items" ON purchase_order_items;
DROP POLICY IF EXISTS "Tenant Isolation for Stock" ON stock_movements;

-- STEP 5: RECREATE all policies

-- Organizations
CREATE POLICY "Super Admins can do everything on organizations"
  ON organizations FOR ALL
  USING (is_super_admin());

CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (id = get_my_org_id());

-- Profiles
CREATE POLICY "Super Admins can do everything on profiles"
  ON profiles FOR ALL
  USING (is_super_admin());

CREATE POLICY "Users can view profiles in their own org"
  ON profiles FOR SELECT
  USING (organization_id = get_my_org_id() OR id = auth.uid());

-- Items (THE KEY ONE!)
CREATE POLICY "Tenant Isolation for Items"
  ON items FOR ALL
  USING (organization_id = get_my_org_id() OR is_super_admin());

-- Suppliers
CREATE POLICY "Tenant Isolation for Suppliers"
  ON suppliers FOR ALL
  USING (organization_id = get_my_org_id() OR is_super_admin());

-- Purchase Orders
CREATE POLICY "Tenant Isolation for POs"
  ON purchase_orders FOR ALL
  USING (organization_id = get_my_org_id() OR is_super_admin());

-- Purchase Order Items
CREATE POLICY "Tenant Isolation for PO Items"
  ON purchase_order_items FOR ALL
  USING (organization_id = get_my_org_id() OR is_super_admin());

-- Stock Movements  
CREATE POLICY "Tenant Isolation for Stock"
  ON stock_movements FOR ALL
  USING (organization_id = get_my_org_id() OR is_super_admin());

-- STEP 6: VERIFICATION - Run this to confirm everything is set up
SELECT 
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('items', 'suppliers', 'profiles', 'organizations', 'stock_movements', 'purchase_orders');
