-- Migration: 20261006_update_plan_limits.sql
-- Description: Updates Free plan item limit from 50 to 200 items.
-- Idempotent and non-destructive.

-- 1. Update table defaults for Free organizations
ALTER TABLE organizations ALTER COLUMN max_items SET DEFAULT 200;
ALTER TABLE organizations ALTER COLUMN max_users SET DEFAULT 1;

-- 2. Upgrade existing Free organizations that have the old 50-item limit or null users
UPDATE organizations
SET max_items = 200
WHERE plan_type = 'FREE' AND (max_items IS NULL OR max_items = 50);

UPDATE organizations
SET max_users = 1
WHERE plan_type = 'FREE' AND max_users IS NULL;

-- 3. Ensure any existing Pro organizations have 5 users allocated
UPDATE organizations
SET max_users = 5
WHERE plan_type = 'PRO' AND (max_users IS NULL OR max_users > 5);
