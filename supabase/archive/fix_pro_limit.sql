-- Fix for Pro Plan users who are stuck with 1 user limit
-- This updates all organizations with 'PRO' plan to have 5 max_users

UPDATE organizations
SET max_users = 5
WHERE plan_type = 'PRO' AND max_users < 5;

-- Optional: Ensure Free plans are set to 1
UPDATE organizations
SET max_users = 1
WHERE plan_type = 'FREE';
