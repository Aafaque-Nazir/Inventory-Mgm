-- Migration: 20261005_features_and_improvements.sql
-- Description: Adds tables and columns for Customers (CRM Lite), Item Batches (Expiry tracking),
-- Sales Returns (Credit Notes), and GST tax breakup on invoices.
-- All statements are safe, non-destructive, and idempotent.

-- 1. CUSTOMERS TABLE (CRM Lite)
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    gstin TEXT,
    total_spent NUMERIC DEFAULT 0 NOT NULL,
    total_orders INTEGER DEFAULT 0 NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indices for fast search
CREATE INDEX IF NOT EXISTS idx_customers_org_phone ON customers(organization_id, phone);
CREATE INDEX IF NOT EXISTS idx_customers_org_name ON customers(organization_id, name);

-- RLS for customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Users can view their org customers') THEN
        CREATE POLICY "Users can view their org customers" ON customers
            FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Users can manage their org customers') THEN
        CREATE POLICY "Users can manage their org customers" ON customers
            FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
    END IF;
END $$;


-- 2. ITEM BATCHES TABLE (Batch & Expiry Tracking)
CREATE TABLE IF NOT EXISTS item_batches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    batch_number TEXT NOT NULL,
    expiry_date DATE,
    manufacturing_date DATE,
    quantity NUMERIC DEFAULT 0 NOT NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indices for batch tracking and expiry alerts
CREATE INDEX IF NOT EXISTS idx_item_batches_org_item ON item_batches(organization_id, item_id);
CREATE INDEX IF NOT EXISTS idx_item_batches_expiry ON item_batches(organization_id, expiry_date);

-- RLS for item_batches
ALTER TABLE item_batches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'item_batches' AND policyname = 'Users can view their org batches') THEN
        CREATE POLICY "Users can view their org batches" ON item_batches
            FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'item_batches' AND policyname = 'Users can manage their org batches') THEN
        CREATE POLICY "Users can manage their org batches" ON item_batches
            FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
    END IF;
END $$;


-- 3. SALES RETURNS TABLE (Sales Returns & Credit Notes)
CREATE TABLE IF NOT EXISTS sales_returns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_phone TEXT,
    total_refund_amount NUMERIC DEFAULT 0 NOT NULL,
    refund_method TEXT DEFAULT 'CASH' NOT NULL, -- CASH, UPI, CREDIT_NOTE, OTHER
    reason TEXT,
    items JSONB NOT NULL, -- Array of [{ item_id, name, quantity, unit_price, refund_amount, restock, condition }]
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indices for sales returns
CREATE INDEX IF NOT EXISTS idx_sales_returns_org ON sales_returns(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_returns_invoice ON sales_returns(invoice_id);

-- RLS for sales_returns
ALTER TABLE sales_returns ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales_returns' AND policyname = 'Users can view their org sales returns') THEN
        CREATE POLICY "Users can view their org sales returns" ON sales_returns
            FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sales_returns' AND policyname = 'Users can manage their org sales returns') THEN
        CREATE POLICY "Users can manage their org sales returns" ON sales_returns
            FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
    END IF;
END $$;


-- 4. EXTEND INVOICES TABLE (GST Breakup, Customer Association, Status)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subtotal NUMERIC;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cgst_amount NUMERIC DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sgst_amount NUMERIC DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS igst_amount NUMERIC DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PAID';

-- 5. EXTEND ORGANIZATIONS TABLE (GST Details for Invoicing)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS gstin TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS email TEXT;
