-- Add trial tracking and status columns
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_used boolean DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status text;

-- (Optional) Reset your organization for testing:
-- UPDATE organizations SET trial_used = false, plan_type = 'FREE', subscription_status = 'NONE' WHERE id = 'YOUR_ORG_ID';
