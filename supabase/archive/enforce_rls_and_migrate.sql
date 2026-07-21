-- 1. FORCE ENABLE RLS on all tables (This is likely the missing step)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- 2. Create a "Legacy Data" Organization to hold old data
DO $$
DECLARE
  legacy_org_id uuid;
BEGIN
  -- Check if we already have an organization, if so, use the first one, otherwise create one
  SELECT id INTO legacy_org_id FROM organizations LIMIT 1;
  
  IF legacy_org_id IS NULL THEN
    INSERT INTO organizations (name, slug, subscription_status)
    VALUES ('Legacy Data', 'legacy-data', 'ACTIVE')
    RETURNING id INTO legacy_org_id;
  END IF;

  -- 3. Assign all NULL organization_id records to this Legacy Org
  -- This "hides" them from new tenants (who have different IDs)
  UPDATE items SET organization_id = legacy_org_id WHERE organization_id IS NULL;
  UPDATE suppliers SET organization_id = legacy_org_id WHERE organization_id IS NULL;
  UPDATE purchase_orders SET organization_id = legacy_org_id WHERE organization_id IS NULL;
  UPDATE purchase_order_items SET organization_id = legacy_org_id WHERE organization_id IS NULL;
  UPDATE stock_movements SET organization_id = legacy_org_id WHERE organization_id IS NULL;

  -- Optionally update profiles that are NULL too
  UPDATE profiles SET organization_id = legacy_org_id WHERE organization_id IS NULL AND is_super_admin = false;
  
END $$;
