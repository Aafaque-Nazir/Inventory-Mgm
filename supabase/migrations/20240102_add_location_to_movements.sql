-- Add location_id to stock_movements
ALTER TABLE stock_movements 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

-- Backfill: Assign all existing movements to the organization's Default 'Main Warehouse'
DO $$
DECLARE
    org_rec RECORD;
    default_loc_id UUID;
BEGIN
    FOR org_rec IN SELECT id FROM organizations LOOP
        -- Get the default location for this org
        SELECT id INTO default_loc_id 
        FROM locations 
        WHERE organization_id = org_rec.id AND is_default = true 
        LIMIT 1;

        -- Update movements for this org that have no location
        IF default_loc_id IS NOT NULL THEN
            UPDATE stock_movements
            SET location_id = default_loc_id
            WHERE organization_id = org_rec.id AND location_id IS NULL;
        END IF;
    END LOOP;
END $$;
