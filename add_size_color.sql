-- Add size and color columns to items table
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS size text,
ADD COLUMN IF NOT EXISTS color text;

-- Update the handle_new_user function or similar if needed (not needed here as this is a table schema change)
