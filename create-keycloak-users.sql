-- ============================================
-- Create Keycloak Users in Database
-- ============================================
-- This script creates users in the database that match your Keycloak users
-- Run this SQL in your PostgreSQL database
-- ============================================

-- Step 1: Ensure tenant exists (et-addis)
-- If tenant doesn't exist, create it
INSERT INTO "Tenant" (id, slug, "key", name, country, locales, policies, "brandConfig", currency, "createdAt", "updatedAt")
VALUES (
  COALESCE((SELECT id FROM "Tenant" WHERE "key" = 'et-addis' LIMIT 1), gen_random_uuid()::text),
  'et-addis',
  'et-addis',
  'AfriBrok Ethiopia - Addis Ababa',
  'Ethiopia',
  '{"default": "en", "supported": ["en", "am"]}'::jsonb,
  '{"dataRetention": "90 days", "privacyPolicy": "https://afribrok.com/privacy"}'::jsonb,
  '{"primaryColor": "#1f2937", "secondaryColor": "#4f46e5"}'::jsonb,
  'ETB',
  NOW(),
  NOW()
)
ON CONFLICT ("key") DO NOTHING;

-- Get tenant ID (we'll use this for all users)
DO $$
DECLARE
  tenant_id TEXT;
  agent_office_id TEXT;
BEGIN
  -- Get or create tenant
  SELECT id INTO tenant_id FROM "Tenant" WHERE "key" = 'et-addis' LIMIT 1;
  
  -- Create agent office if it doesn't exist (needed for tenant-admin and agent)
  agent_office_id := tenant_id || '-addis-office';
  
  INSERT INTO "AgentOffice" (id, "tenantId", city, "isCapital", "createdAt", "updatedAt")
  VALUES (
    agent_office_id,
    tenant_id,
    'Addis Ababa',
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Step 2: Create Super Admin User
  -- Email: superadmin@afribrok.com (must match Keycloak)
  INSERT INTO "User" (id, "tenantId", email, role, status, "authProviderId", "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid()::text,
    tenant_id,
    'superadmin@afribrok.com',
    'SUPER_ADMIN',
    'ACTIVE',
    'keycloak|super-admin',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE
  SET 
    role = 'SUPER_ADMIN',
    status = 'ACTIVE',
    "authProviderId" = 'keycloak|super-admin',
    "updatedAt" = NOW();

  -- Step 3: Create Tenant Admin User
  -- Email: tenantadmin@afribrok.com (must match Keycloak)
  INSERT INTO "User" (id, "tenantId", "agentOfficeId", email, role, status, "authProviderId", "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid()::text,
    tenant_id,
    agent_office_id,
    'tenantadmin@afribrok.com',
    'TENANT_ADMIN',
    'ACTIVE',
    'keycloak|tenant-admin',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE
  SET 
    role = 'TENANT_ADMIN',
    status = 'ACTIVE',
    "tenantId" = tenant_id,
    "agentOfficeId" = agent_office_id,
    "authProviderId" = 'keycloak|tenant-admin',
    "updatedAt" = NOW();

  -- Step 4: Create Broker User
  -- Email: broker@afribrok.com (must match Keycloak)
  INSERT INTO "User" (id, "tenantId", email, role, status, "authProviderId", "createdAt", "updatedAt")
  VALUES (
    gen_random_uuid()::text,
    tenant_id,
    'broker@afribrok.com',
    'BROKER',
    'ACTIVE',
    'keycloak|broker',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE
  SET 
    role = 'BROKER',
    status = 'ACTIVE',
    "tenantId" = tenant_id,
    "authProviderId" = 'keycloak|broker',
    "updatedAt" = NOW();

  RAISE NOTICE '✅ Users created successfully!';
  RAISE NOTICE '   - Super Admin: superadmin@afribrok.com';
  RAISE NOTICE '   - Tenant Admin: tenantadmin@afribrok.com';
  RAISE NOTICE '   - Broker: broker@afribrok.com';
END $$;

-- Verify users were created
SELECT 
  email,
  role,
  status,
  "tenantId"
FROM "User"
WHERE email IN (
  'superadmin@afribrok.com',
  'tenantadmin@afribrok.com',
  'broker@afribrok.com'
)
ORDER BY role;

