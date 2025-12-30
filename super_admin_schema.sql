-- Add status to organizations if it doesn't exist
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('ACTIVE', 'SUSPENDED', 'BANNED')) DEFAULT 'ACTIVE';

-- Create Announcements Table
CREATE TABLE IF NOT EXISTS system_announcements (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    message text NOT NULL,
    type text CHECK (type IN ('INFO', 'WARNING', 'CRITICAL')) DEFAULT 'INFO',
    is_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- RLS for Announcements
ALTER TABLE system_announcements ENABLE ROW LEVEL SECURITY;

-- Everyone can view active announcements
CREATE POLICY "Everyone can view active announcements"
    ON system_announcements
    FOR SELECT
    USING (is_active = true);

-- Only Super Admins can manage announcements
CREATE POLICY "Super Admins can manage announcements"
    ON system_announcements
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE is_super_admin = true
        )
    );
