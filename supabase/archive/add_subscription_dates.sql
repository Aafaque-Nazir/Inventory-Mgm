-- Add subscription date columns to organizations table
-- Run this in Supabase SQL Editor

-- Add start and end date columns
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Set default end date for existing orgs (1 year from now)
UPDATE organizations 
SET subscription_end_date = NOW() + INTERVAL '1 year'
WHERE subscription_end_date IS NULL;

-- Verify the columns
SELECT id, name, subscription_status, subscription_start_date, subscription_end_date 
FROM organizations;
