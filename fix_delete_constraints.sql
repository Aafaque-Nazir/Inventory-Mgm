-- 1. DROP existing constraints (names might vary, so we try to be standard or use specific names if known. 
-- Since we didn't name them explicitly in schema, Postgres generated them. 
-- We will assume standard generation or recreate tables if needed, but ALTER is better.

-- We'll try to drop by finding them or just adding CASCADE which requires dropping first.
-- Since this is development, we can run a script to fix them.

-- ORGANIZATIONS CASCADE
-- Items
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_organization_id_fkey;
ALTER TABLE items 
  ADD CONSTRAINT items_organization_id_fkey 
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Suppliers
ALTER TABLE suppliers DROP CONSTRAINT IF EXISTS suppliers_organization_id_fkey;
ALTER TABLE suppliers 
  ADD CONSTRAINT suppliers_organization_id_fkey 
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Purchase Orders
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_organization_id_fkey;
ALTER TABLE purchase_orders 
  ADD CONSTRAINT purchase_orders_organization_id_fkey 
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- PO Items
ALTER TABLE purchase_order_items DROP CONSTRAINT IF EXISTS purchase_order_items_organization_id_fkey;
ALTER TABLE purchase_order_items 
  ADD CONSTRAINT purchase_order_items_organization_id_fkey 
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Stock Movements
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_organization_id_fkey;
ALTER TABLE stock_movements 
  ADD CONSTRAINT stock_movements_organization_id_fkey 
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Profiles (Organization Link)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_organization_id_fkey;
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_organization_id_fkey 
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;


-- PROFILES SET NULL (User Deletion)
-- Purchase Orders (Created/Approved By)
ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_created_by_fkey;
ALTER TABLE purchase_orders 
  ADD CONSTRAINT purchase_orders_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_approved_by_fkey;
ALTER TABLE purchase_orders 
  ADD CONSTRAINT purchase_orders_approved_by_fkey 
  FOREIGN KEY (approved_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Stock Movements (Created By)
ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_created_by_fkey;
ALTER TABLE stock_movements 
  ADD CONSTRAINT stock_movements_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

