-- The database has a check constraint limiting subscription_status values
-- Run this to add our required values (INACTIVE, EXPIRED)

-- First, drop the existing constraint
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_subscription_status_check;

-- Add new constraint with all required values
ALTER TABLE organizations ADD CONSTRAINT organizations_subscription_status_check 
CHECK (subscription_status IN ('ACTIVE', 'INACTIVE', 'EXPIRED', 'TRIAL', 'PENDING'));

-- Verify it worked
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%subscription%';
