-- 1. Create a function to delete orphaned organizations and all their data safely
-- This function finds organizations with zero profiles (users) and deletes them, cascading to all related tables.

create or replace function delete_orphan_organizations()
returns void as $$
declare
    org_record record;
    deleted_count integer := 0;
begin
    -- Iterate through organizations that have NO matching profiles (users)
    for org_record in 
        select id, name, slug 
        from organizations 
        where id not in (select distinct organization_id from profiles where organization_id is not null)
    loop
        raise notice 'Deleting orphaned organization: % (ID: %)', org_record.name, org_record.id;
        
        -- Delete dependent data manually ensuring order (if ON DELETE CASCADE is missing)
        -- Delete Stock Movements
        delete from stock_movements where organization_id = org_record.id;
        
        -- Delete Purchase Order Items
        delete from purchase_order_items where organization_id = org_record.id;
        
        -- Delete Purchase Orders
        delete from purchase_orders where organization_id = org_record.id;
        
        -- Delete Items
        delete from items where organization_id = org_record.id;
        
        -- Delete Suppliers
        delete from suppliers where organization_id = org_record.id;

        -- Finally, delete the Organization itself
        delete from organizations where id = org_record.id;
        
        deleted_count := deleted_count + 1;
    end loop;
    
    raise notice 'Total orphaned organizations deleted: %', deleted_count;
end;
$$ language plpgsql;

-- 2. Execute the function
select delete_orphan_organizations();

-- 3. (Optional) Cleanup the function if you don't want to keep it
-- drop function delete_orphan_organizations();
