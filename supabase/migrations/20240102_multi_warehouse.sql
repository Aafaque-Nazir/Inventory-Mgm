-- 1. Create Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Item Stock Table (The new source of truth for quantity)
CREATE TABLE IF NOT EXISTS item_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(item_id, location_id)
);

-- 3. Migration Function (Data Backfill)
DO $$
DECLARE
    org_rec RECORD;
    loc_id UUID;
BEGIN
    -- For each organization, create a default location and move stock
    FOR org_rec IN SELECT id, name FROM organizations LOOP
        
        -- Check if default location exists, if not create one
        INSERT INTO locations (organization_id, name, is_default)
        VALUES (org_rec.id, 'Main Warehouse', true)
        ON CONFLICT DO NOTHING
        RETURNING id INTO loc_id;

        -- If we just created it (or found it via separate query if needing to be robust, 
        -- but here we assume if we are running this migration, it's fresh for this logic)
        -- Actually 'RETURNING' only works on insert.
        
        IF loc_id IS NULL THEN
            SELECT id INTO loc_id FROM locations WHERE organization_id = org_rec.id AND is_default = true LIMIT 1;
        END IF;

        -- Migrating Items: Insert into item_stock based on existing items.current_stock
        -- We presume items.current_stock is the current total.
        INSERT INTO item_stock (item_id, location_id, quantity)
        SELECT id, loc_id, current_stock
        FROM items
        WHERE organization_id = org_rec.id
        ON CONFLICT (item_id, location_id) DO UPDATE SET quantity = EXCLUDED.quantity;
        
    END LOOP;
END $$;

-- 4. Enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_stock ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "Users can view their org locations" ON locations
    FOR SELECT USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their org locations" ON locations
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view stock in their org" ON item_stock
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM items 
            WHERE items.id = item_stock.item_id 
            AND items.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can manage stock in their org" ON item_stock
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM items 
            WHERE items.id = item_stock.item_id 
            AND items.organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );
