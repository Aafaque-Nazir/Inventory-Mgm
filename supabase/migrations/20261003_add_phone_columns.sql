-- Migration: Add phone column to profiles & customer_phone to payment_orders
-- Description: Persists customer billing mobile numbers in the database.
-- Run this in your Supabase SQL Editor if you want explicit table columns.

-- 1. Add phone column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Add customer_phone column to payment_orders
ALTER TABLE payment_orders 
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- 3. Comment for documentation
COMMENT ON COLUMN profiles.phone IS 'User billing / contact mobile number';
COMMENT ON COLUMN payment_orders.customer_phone IS 'Customer mobile number used during Cashfree checkout';
