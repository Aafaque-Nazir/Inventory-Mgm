-- RLS Policy Fix Script
-- Run this in Supabase SQL Editor to fix the policies

-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON items;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON items;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON suppliers;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON suppliers;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON purchase_orders;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON purchase_orders;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON purchase_order_items;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON purchase_order_items;
DROP POLICY IF EXISTS "Allow read access for authenticated users" ON stock_movements;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON stock_movements;

-- Create new policies with correct syntax
CREATE POLICY "Enable all for authenticated users" ON items
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable all for authenticated users" ON suppliers
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable all for authenticated users" ON purchase_orders
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable all for authenticated users" ON purchase_order_items
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable all for authenticated users" ON stock_movements
  FOR ALL USING (auth.uid() IS NOT NULL);
