-- Add location_id to purchase_orders table
ALTER TABLE purchase_orders 
ADD COLUMN location_id UUID REFERENCES locations(id);

-- Backfill existing orders to default location (optional, or leave null if acceptable, but better to assign)
DO $$
DECLARE
    default_loc_id UUID;
BEGIN
    -- For each organization, find a default location and assign it to their orders
    -- This is a bit complex for a simple query if we want to be perfect, 
    -- but usually we can just assign to the 'is_default' location of the same org.
    
    UPDATE purchase_orders po
    SET location_id = l.id
    FROM locations l
    WHERE po.organization_id = l.organization_id 
    AND l.is_default = true
    AND po.location_id IS NULL;
END $$;
