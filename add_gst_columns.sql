-- Add GST fields to items table
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS hsn_code text,
ADD COLUMN IF NOT EXISTS gst_rate numeric DEFAULT 0;
