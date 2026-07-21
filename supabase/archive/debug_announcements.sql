-- Check existing announcements
SELECT * FROM system_announcements;

-- Check RLS policies for system_announcements
select * from pg_policies where tablename = 'system_announcements';

-- Ensure public access policy exists (or authenticated access)
-- If missing, we might need to add:
-- CREATE POLICY "Everyone can view active announcements" ON system_announcements FOR SELECT TO authenticated USING (is_active = true);
