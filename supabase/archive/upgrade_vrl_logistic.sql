UPDATE organizations
SET 
  plan_type = 'ENTERPRISE',
  max_users = 100,
  max_items = 10000,
  status = 'ACTIVE'
WHERE slug = 'vrl-logistic--9' OR name = 'VRL Logistic';
