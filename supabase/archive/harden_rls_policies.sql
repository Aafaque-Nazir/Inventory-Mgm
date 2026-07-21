-- Harden RLS Policies
-- Split generic "ALL" policies into specific policies to restrict destructive actions.

-- 1. Helper Function to check role (Safe against search_path injection)
CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;


-- 2. HARDEN ITEMS TABLE

-- Drop existing broad policy
DROP POLICY IF EXISTS "Tenant Isolation for Items" ON items;

-- A. SELECT: Everyone in org can see items
CREATE POLICY "View Items"
ON items FOR SELECT
USING (organization_id = get_my_org_id() OR is_super_admin());

-- B. INSERT: Everyone in org can add items (Storekeepers need this often for stock, but maybe not create *Items* definition? 
-- Assuming Storekeepers might need to create items during stock intake if not found. Keeping permissive for now or restricted?
-- Plan said: "Storekeepers should only SELECT or INSERT". So we keep INSERT for all.)
CREATE POLICY "Create Items"
ON items FOR INSERT
WITH CHECK (organization_id = get_my_org_id() OR is_super_admin());

-- C. UPDATE: Only Admin/Managers
CREATE POLICY "Update Items"
ON items FOR UPDATE
USING (
  (organization_id = get_my_org_id() AND auth_user_role() IN ('ADMIN', 'MANAGER'))
  OR is_super_admin()
);

-- D. DELETE: Only Admin/Managers
CREATE POLICY "Delete Items"
ON items FOR DELETE
USING (
  (organization_id = get_my_org_id() AND auth_user_role() IN ('ADMIN', 'MANAGER'))
  OR is_super_admin()
);


-- 3. HARDEN PURCHASE ORDERS TABLE

-- Drop existing broad policy
DROP POLICY IF EXISTS "Tenant Isolation for POs" ON purchase_orders;

-- A. SELECT
CREATE POLICY "View POs"
ON purchase_orders FOR SELECT
USING (organization_id = get_my_org_id() OR is_super_admin());

-- B. INSERT
CREATE POLICY "Create POs"
ON purchase_orders FOR INSERT
WITH CHECK (organization_id = get_my_org_id() OR is_super_admin());

-- C. UPDATE (Approval, etc) - Admins/Managers only? 
-- Usually POs need approval. Storekeepers might create DRAFTS. 
-- We'll allow UPDATE for all but maybe specific status transitions require logic. 
-- For now, following plan to restrict critical updates.
CREATE POLICY "Update POs"
ON purchase_orders FOR UPDATE
USING (
  (organization_id = get_my_org_id() AND auth_user_role() IN ('ADMIN', 'MANAGER'))
  OR is_super_admin()
);

-- D. DELETE
CREATE POLICY "Delete POs"
ON purchase_orders FOR DELETE
USING (
  (organization_id = get_my_org_id() AND auth_user_role() IN ('ADMIN', 'MANAGER'))
  OR is_super_admin()
);
