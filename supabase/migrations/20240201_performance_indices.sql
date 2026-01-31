-- PERFORMANCE INDICES MIGRATION
-- Run this in your Supabase SQL Editor to improve query speed.

-- 1. Index 'organization_id' on all major tables
-- This ensures that "Row Level Security" (RLS) policies are fast.
-- Without this, every query scans the whole table to check permissions.

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

CREATE INDEX IF NOT EXISTS idx_items_organization_id ON items(organization_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_organization_id ON suppliers(organization_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_organization_id ON purchase_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_organization_id ON stock_movements(organization_id);

-- 2. Composite Index for Item Lookups
-- We frequently query items by 'organization_id' AND 'sku' (e.g., in createItem or getItemBySku).
-- This index makes that specific combination instant.
CREATE INDEX IF NOT EXISTS idx_items_org_sku ON items(organization_id, sku);

-- 3. Stock Movement Optimization
-- We often fetch history for a specific item.
CREATE INDEX IF NOT EXISTS idx_movements_item_id ON stock_movements(item_id);

-- 4. Purchase Order Lookups
-- Speed up fetching POs by status or supplier.
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);

-- 5. Foreign Key Indices (Best Practice)
-- Postgres doesn't automatically index FKs, so deletes/updates on parent tables can be slow.
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);
