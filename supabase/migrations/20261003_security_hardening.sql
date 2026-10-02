-- Migration: Security & Payment Hardening
-- Description: Adds payment_orders idempotency table, stock constraints, and atomic stock deduction RPC.
-- Run this against your Supabase project via SQL Editor or CLI.

-- ============================================================================
-- 1. PAYMENT ORDERS TABLE — Idempotency for payment processing
-- Prevents replay attacks on /api/cashfree/verify and double-writes from webhook+verify
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL UNIQUE,             -- Cashfree order_id (dedup key)
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    amount NUMERIC(10, 2) NOT NULL DEFAULT 49.00,
    status TEXT NOT NULL DEFAULT 'CREATED',     -- CREATED | SUCCESS | FAILED
    cashfree_payment_id TEXT,                   -- Cashfree's payment CF_xxx ID
    processed_at TIMESTAMPTZ,                  -- When upgrade was applied
    source TEXT,                                -- 'VERIFY' | 'WEBHOOK' — who processed it first
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by order_id (already unique, but explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_id ON payment_orders(order_id);
-- Index for finding orders by org
CREATE INDEX IF NOT EXISTS idx_payment_orders_org_id ON payment_orders(organization_id);

-- RLS
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

-- Users can only see their own payment orders
CREATE POLICY "Users can view own payment orders"
    ON payment_orders FOR SELECT
    USING (auth.uid() = user_id);

-- Only service_role (server-side) can insert/update payment orders
-- No client-side insert/update policy needed — all writes go through server actions

-- ============================================================================
-- 2. STOCK CONSTRAINTS — Prevent negative stock at DB level
-- ============================================================================

-- Add CHECK constraint to item_stock to prevent negative quantities
-- First, fix any existing negative quantities (from before the guard was enabled)
UPDATE item_stock SET quantity = 0 WHERE quantity < 0;

-- Using DO block to make it idempotent (won't fail if constraint already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'item_stock_quantity_non_negative'
    ) THEN
        ALTER TABLE item_stock ADD CONSTRAINT item_stock_quantity_non_negative CHECK (quantity >= 0);
    END IF;
END $$;

-- ============================================================================
-- 3. ATOMIC STOCK DEDUCTION RPC — Prevents race conditions in invoice creation
-- Returns the new quantity, or raises an exception if insufficient stock.
-- ============================================================================

CREATE OR REPLACE FUNCTION atomic_stock_deduct(
    p_item_id UUID,
    p_location_id UUID,
    p_quantity NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_qty NUMERIC;
    v_new_qty NUMERIC;
BEGIN
    -- Lock the specific row to prevent concurrent modifications
    SELECT quantity INTO v_current_qty
    FROM item_stock
    WHERE item_id = p_item_id AND location_id = p_location_id
    FOR UPDATE;

    -- If no row exists, treat as 0
    IF v_current_qty IS NULL THEN
        v_current_qty := 0;
    END IF;

    v_new_qty := v_current_qty - p_quantity;

    IF v_new_qty < 0 THEN
        RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', v_current_qty, p_quantity;
    END IF;

    -- Upsert the new quantity
    INSERT INTO item_stock (item_id, location_id, quantity, updated_at)
    VALUES (p_item_id, p_location_id, v_new_qty, now())
    ON CONFLICT (item_id, location_id)
    DO UPDATE SET quantity = v_new_qty, updated_at = now();

    RETURN v_new_qty;
END;
$$;
