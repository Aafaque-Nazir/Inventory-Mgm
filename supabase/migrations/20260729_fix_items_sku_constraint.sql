-- Drop the existing global unique constraint on SKU
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_sku_key;

-- Add a new unique constraint scoped to the organization
ALTER TABLE items ADD CONSTRAINT items_organization_id_sku_key UNIQUE (organization_id, sku);
