-- Drop the old constraint that restricts status values
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_subscription_status_check;

-- Add new constraint including 'TRIALING'
ALTER TABLE organizations 
ADD CONSTRAINT organizations_subscription_status_check 
CHECK (subscription_status IN ('ACTIVE', 'INACTIVE', 'CANCELLED', 'PAST_DUE', 'TRIALING', 'NONE'));
