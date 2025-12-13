-- Function to automatically set organization_id on insert
CREATE OR REPLACE FUNCTION public.set_tenant_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If organization_id is not provided, set it to the user's organization_id
  IF NEW.organization_id IS NULL THEN
    NEW.organization_id := (SELECT organization_id FROM public.profiles WHERE id = auth.uid());
  END IF;
  
  -- If it's still null (and not a super admin), this might be an issue, 
  -- but the NOT NULL constraint on the table will catch it.
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Trigger to Items
DROP TRIGGER IF EXISTS set_tenant_items ON public.items;
CREATE TRIGGER set_tenant_items
BEFORE INSERT ON public.items
FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();

-- Apply Trigger to Suppliers
DROP TRIGGER IF EXISTS set_tenant_suppliers ON public.suppliers;
CREATE TRIGGER set_tenant_suppliers
BEFORE INSERT ON public.suppliers
FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();

-- Apply Trigger to Purchase Orders
DROP TRIGGER IF EXISTS set_tenant_purchase_orders ON public.purchase_orders;
CREATE TRIGGER set_tenant_purchase_orders
BEFORE INSERT ON public.purchase_orders
FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();

-- Apply Trigger to Purchase Order Items
DROP TRIGGER IF EXISTS set_tenant_purchase_order_items ON public.purchase_order_items;
CREATE TRIGGER set_tenant_purchase_order_items
BEFORE INSERT ON public.purchase_order_items
FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();

-- Apply Trigger to Stock Movements
DROP TRIGGER IF EXISTS set_tenant_stock_movements ON public.stock_movements;
CREATE TRIGGER set_tenant_stock_movements
BEFORE INSERT ON public.stock_movements
FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();
