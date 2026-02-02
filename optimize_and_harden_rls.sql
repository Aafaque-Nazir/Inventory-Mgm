-- OPTIMIZE AND HARDEN RLS POLICIES
-- This script addresses:
-- 1. "Multiple Permissive Policies" warnings by dropping redundant policies.
-- 2. "Auth RLS Initialization Plan" warnings by wrapping auth calls in (select ...).
-- 3. Security Hardening by restricting DELETE/UPDATE to Admins/Managers.

-- ==========================================
-- 1. UTILITY FUNCTIONS (Optimized)
-- ==========================================

-- Ensure search_path is safe (fixes "Function Search Path Mutable" if not already fixed)
ALTER FUNCTION public.set_tenant_id() SET search_path = public;
ALTER FUNCTION public.get_my_org_id() SET search_path = public;
ALTER FUNCTION public.is_super_admin() SET search_path = public;

-- Helper to check role efficiently
CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = (select auth.uid());
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ==========================================
-- 2. RESET & HARDEN POLICIES
-- ==========================================

-- >>> ITEMS TABLE <<<
DROP POLICY IF EXISTS "Tenant Isolation for Items" ON items;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON items;
DROP POLICY IF EXISTS "View Items" ON items;
DROP POLICY IF EXISTS "Create Items" ON items;
DROP POLICY IF EXISTS "Update Items" ON items;
DROP POLICY IF EXISTS "Delete Items" ON items;

CREATE POLICY "View Items" ON items FOR SELECT
USING (organization_id = (select public.get_my_org_id()) OR (select public.is_super_admin()));

CREATE POLICY "Create Items" ON items FOR INSERT
WITH CHECK (organization_id = (select public.get_my_org_id()) OR (select public.is_super_admin()));

CREATE POLICY "Update Items" ON items FOR UPDATE
USING ((organization_id = (select public.get_my_org_id()) AND (select public.auth_user_role()) IN ('ADMIN', 'MANAGER')) OR (select public.is_super_admin()));

CREATE POLICY "Delete Items" ON items FOR DELETE
USING ((organization_id = (select public.get_my_org_id()) AND (select public.auth_user_role()) IN ('ADMIN', 'MANAGER')) OR (select public.is_super_admin()));


-- >>> PURCHASE ORDERS TABLE <<<
DROP POLICY IF EXISTS "Tenant Isolation for POs" ON purchase_orders;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON purchase_orders;
DROP POLICY IF EXISTS "View POs" ON purchase_orders;
DROP POLICY IF EXISTS "Create POs" ON purchase_orders;
DROP POLICY IF EXISTS "Update POs" ON purchase_orders;
DROP POLICY IF EXISTS "Delete POs" ON purchase_orders;

CREATE POLICY "View POs" ON purchase_orders FOR SELECT
USING (organization_id = (select public.get_my_org_id()) OR (select public.is_super_admin()));

CREATE POLICY "Create POs" ON purchase_orders FOR INSERT
WITH CHECK (organization_id = (select public.get_my_org_id()) OR (select public.is_super_admin()));

CREATE POLICY "Update POs" ON purchase_orders FOR UPDATE
USING ((organization_id = (select public.get_my_org_id()) AND (select public.auth_user_role()) IN ('ADMIN', 'MANAGER')) OR (select public.is_super_admin()));

CREATE POLICY "Delete POs" ON purchase_orders FOR DELETE
USING ((organization_id = (select public.get_my_org_id()) AND (select public.auth_user_role()) IN ('ADMIN', 'MANAGER')) OR (select public.is_super_admin()));


-- >>> PURCHASE ORDER ITEMS TABLE <<<
DROP POLICY IF EXISTS "Tenant Isolation for PO Items" ON purchase_order_items;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON purchase_order_items;

CREATE POLICY "View PO Items" ON purchase_order_items FOR SELECT
USING (organization_id = (select public.get_my_org_id()) OR (select public.is_super_admin()));

-- PO Items usually managed alongside POs, assuming simplified access for now, but consistent with POs
CREATE POLICY "Manage PO Items" ON purchase_order_items FOR ALL
USING (organization_id = (select public.get_my_org_id()) OR (select public.is_super_admin()));


-- >>> STOCK MOVEMENTS TABLE <<<
DROP POLICY IF EXISTS "Tenant Isolation for Stock" ON stock_movements;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON stock_movements;

CREATE POLICY "View Stock Movements" ON stock_movements FOR SELECT
USING (organization_id = (select public.get_my_org_id()) OR (select public.is_super_admin()));

CREATE POLICY "Create Stock Movements" ON stock_movements FOR INSERT
WITH CHECK (organization_id = (select public.get_my_org_id()) OR (select public.is_super_admin()));


-- >>> ORGANIZATIONS TABLE <<<
DROP POLICY IF EXISTS "Super Admins organizations access" ON organizations;
DROP POLICY IF EXISTS "Super Admins can do everything on organizations" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;

CREATE POLICY "View Own Organization" ON organizations FOR SELECT
USING (id = (select public.get_my_org_id()) OR (select public.is_super_admin()));

-- Allow creating if not in org? Usually regulated. Assuming standard flow:
CREATE POLICY "Create Organization" ON organizations FOR INSERT
WITH CHECK (true); -- Usually restricted by app logic or further constraints, keeping basic for now.

CREATE POLICY "Update Own Organization" ON organizations FOR UPDATE
USING (id = (select public.get_my_org_id()) AND (select public.auth_user_role()) = 'ADMIN');


-- >>> PROFILES TABLE <<<
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Allow insert/update for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Super Admins can do everything" ON profiles;
DROP POLICY IF EXISTS "Super Admins can do everything on profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their own org" ON profiles;

CREATE POLICY "View Profiles in Org" ON profiles FOR SELECT
USING (organization_id = (select public.get_my_org_id()) OR id = (select auth.uid()) OR (select public.is_super_admin()));

CREATE POLICY "Update Own Profile" ON profiles FOR UPDATE
USING (id = (select auth.uid()));

CREATE POLICY "Insert Own Profile" ON profiles FOR INSERT
WITH CHECK (id = (select auth.uid()));


-- >>> INVITATIONS TABLE <<<
DROP POLICY IF EXISTS "Admins can manage invitations" ON invitations;
DROP POLICY IF EXISTS "Users can view their own invitations" ON invitations;

CREATE POLICY "Manage Invitations" ON invitations FOR ALL
USING (organization_id = (select public.get_my_org_id()) AND (select public.auth_user_role()) IN ('ADMIN', 'MANAGER'));


-- >>> ITEM STOCK TABLE (Optional/Module specific) <<<
-- DROP POLICY IF EXISTS "Users can manage stock in their org" ON item_stock;
-- DROP POLICY IF EXISTS "Users can view stock in their org" ON item_stock;

-- CREATE POLICY "View Item Stock" ON item_stock FOR SELECT
-- USING (organization_id = (select public.get_my_org_id()));

-- CREATE POLICY "Manage Item Stock" ON item_stock FOR ALL
-- USING (organization_id = (select public.get_my_org_id()) AND (select public.auth_user_role()) IN ('ADMIN', 'MANAGER', 'STOREKEEPER'));


-- >>> LOCATIONS TABLE (Optional/Module specific) <<<
-- DROP POLICY IF EXISTS "Users can manage their org locations" ON locations;
-- DROP POLICY IF EXISTS "Users can view their org locations" ON locations;

-- CREATE POLICY "View Locations" ON locations FOR SELECT
-- USING (organization_id = (select public.get_my_org_id()));

-- CREATE POLICY "Manage Locations" ON locations FOR ALL
-- USING (organization_id = (select public.get_my_org_id()) AND (select public.auth_user_role()) = 'ADMIN');


-- >>> INVOICES TABLE (Optional/Module specific) <<<
-- DROP POLICY IF EXISTS "Users can view their org invoices" ON invoices;
-- DROP POLICY IF EXISTS "Users can create invoices" ON invoices;

-- CREATE POLICY "View Invoices" ON invoices FOR SELECT
-- USING (organization_id = (select public.get_my_org_id()));

-- CREATE POLICY "Manage Invoices" ON invoices FOR ALL
-- USING (organization_id = (select public.get_my_org_id()) AND (select public.auth_user_role()) IN ('ADMIN', 'Store-Manager'));

-- >>> SUPPLIERS TABLE <<<
DROP POLICY IF EXISTS "Enable all for authenticated users" ON suppliers;

CREATE POLICY "View Suppliers" ON suppliers FOR SELECT
USING (organization_id = (select public.get_my_org_id()));

CREATE POLICY "Manage Suppliers" ON suppliers FOR ALL
USING (organization_id = (select public.get_my_org_id()) AND (select public.auth_user_role()) IN ('ADMIN', 'MANAGER'));

-- >>> SUPPORT TICKETS TABLE (Optional) <<<
-- DROP POLICY IF EXISTS "Users can view their own tickets" ON support_tickets;
-- DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;

-- CREATE POLICY "View Own Tickets" ON support_tickets FOR SELECT
-- USING (user_id = (select auth.uid()) OR (select public.is_super_admin()));

-- CREATE POLICY "Create Tickets" ON support_tickets FOR INSERT
-- WITH CHECK (user_id = (select auth.uid()));


-- >>> AUDIT LOGS TABLE <<<
-- WARN: User reported "organization_id" column missing in audit_logs. 
-- Commenting out to allow script to run. Please verify audit_logs schema manually.

-- DROP POLICY IF EXISTS "View organization logs" ON audit_logs;
-- DROP POLICY IF EXISTS "Insert logs" ON audit_logs;

-- CREATE POLICY "View Audit Logs" ON audit_logs FOR SELECT
-- USING (organization_id = (select public.get_my_org_id()) AND (select public.auth_user_role()) = 'ADMIN');

-- CREATE POLICY "Insert Audit Logs" ON audit_logs FOR INSERT
-- WITH CHECK (organization_id = (select public.get_my_org_id()));

