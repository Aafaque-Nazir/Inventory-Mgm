-- Add plan_type to organizations
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS plan_type text CHECK (plan_type IN ('FREE', 'PRO', 'ENTERPRISE')) DEFAULT 'FREE',
ADD COLUMN IF NOT EXISTS max_users integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_items integer DEFAULT 50;

-- Update existing organizations to have defaults
UPDATE organizations SET max_users = 1, max_items = 50, plan_type = 'FREE' WHERE plan_type IS NULL;

-- Create Invitations Table for Team Management
CREATE TABLE IF NOT EXISTS invitations (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) NOT NULL,
    email text NOT NULL,
    role text CHECK (role IN ('STOREKEEPER', 'MANAGER', 'ADMIN')) DEFAULT 'STOREKEEPER',
    token text NOT NULL, -- Generic token for link
    invited_by uuid REFERENCES auth.users(id),
    status text CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED')) DEFAULT 'PENDING',
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT (now() + interval '7 days'),
    UNIQUE(organization_id, email)
);

-- RLS for Invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Only Admins of the organization can view/create invitations
CREATE POLICY "Admins can manage invitations"
    ON invitations
    FOR ALL
    USING (
        organization_id IN (
            SELECT organization_id FROM profiles 
            WHERE id = auth.uid() AND (role = 'ADMIN' OR is_super_admin = true)
        )
    );

-- Users can view invitations matching their email (for accepting)
CREATE POLICY "Users can view their own invitations"
    ON invitations
    FOR SELECT
    USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
