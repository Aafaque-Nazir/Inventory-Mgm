-- Fix "Function Search Path Mutable" Warnings
-- By setting a fixed search_path to 'public', we prevent search path hijacking attacks.

ALTER FUNCTION public.set_tenant_id() SET search_path = public;
ALTER FUNCTION public.get_my_org_id() SET search_path = public;
ALTER FUNCTION public.is_super_admin() SET search_path = public;

-- Also ensuring handle_new_user has it (it was added in the previous script too, but good to be explicit here)
ALTER FUNCTION public.handle_new_user() SET search_path = public;
