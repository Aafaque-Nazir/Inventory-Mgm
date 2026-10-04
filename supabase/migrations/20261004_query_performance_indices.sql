-- PERFORMANCE INDICES MIGRATION
-- Run this in your Supabase SQL Editor to maximize query speeds across all dashboard, inventory, reports, and sales views.

-- 1. Invoices composite index for reports, dashboard chart, and sales list
CREATE INDEX IF NOT EXISTS idx_invoices_org_created_at ON invoices(organization_id, created_at DESC);

-- 2. Stock movements composite indexes for warehouse filtering and dashboard activity
CREATE INDEX IF NOT EXISTS idx_stock_movements_org_created_at ON stock_movements(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_location_created_at ON stock_movements(location_id, created_at DESC);

-- 3. Item stock composite index for ultra-fast warehouse inventory lookups
CREATE INDEX IF NOT EXISTS idx_item_stock_location_item ON item_stock(location_id, item_id);

-- 4. Items sorting index by organization and name
CREATE INDEX IF NOT EXISTS idx_items_org_name ON items(organization_id, name);

-- 5. Team invitations index by organization and status
CREATE INDEX IF NOT EXISTS idx_invitations_org_status ON invitations(organization_id, status);
