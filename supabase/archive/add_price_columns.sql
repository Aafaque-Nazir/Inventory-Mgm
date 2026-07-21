-- Add cost_price and selling_price to items table
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10,2) DEFAULT 0;

-- Add unit_price to stock_movements table to record price at time of movement
ALTER TABLE stock_movements
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);
