-- Add explicit foreign key to profiles for PostgREST to detect the relationship
ALTER TABLE support_tickets
DROP CONSTRAINT IF EXISTS support_tickets_user_id_fkey, -- Drop existing if it points to auth.users only
ADD CONSTRAINT support_tickets_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id)
    ON DELETE CASCADE;

-- Also ensure organization relationship is clear
ALTER TABLE support_tickets
DROP CONSTRAINT IF EXISTS support_tickets_organization_id_fkey,
ADD CONSTRAINT support_tickets_organization_id_fkey
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id)
    ON DELETE CASCADE;
