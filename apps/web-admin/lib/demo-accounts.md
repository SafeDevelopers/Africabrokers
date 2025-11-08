# Demo Accounts for Local Development

> **Note**: This file is for documentation purposes only. These accounts are created by the database seed file for local development and testing.

## Super Admin Account
- **Email**: `admin@afribrok.com`
- **Password**: Any (not checked - system only verifies email and role)
- **Role**: `SUPER_ADMIN`
- **Access**: Full platform access, can view all tenants and manage system-wide settings

## Tenant Admin Account
- **Email**: `admin@afribrok.et`
- **Password**: Any (not checked - system only verifies email and role)
- **Role**: `TENANT_ADMIN`
- **Tenant**: `et-addis`
- **Access**: Tenant-scoped access, can manage brokers, listings, QR codes within their tenant

## Agent Account
- **Email**: `agent@afribrok.et`
- **Password**: Any (not checked - system only verifies email and role)
- **Role**: `AGENT`
- **Tenant**: `et-addis`
- **Access**: Agent-level access for government agencies, can perform inspections and verifications

## Broker Account
- **Email**: `broker@afribrok.et`
- **Password**: Any (not checked - system only verifies email and role)
- **Role**: `BROKER`
- **Tenant**: `et-addis`
- **Access**: Broker access for marketplace

## Notes
- These accounts are created by the seed file (`services/core-api/prisma/seed.ts`)
- Passwords are NOT checked - the system only verifies email and role match
- All accounts are in the `et-addis` tenant
- **In production, replace with real authentication using Keycloak/OIDC**
- This file is documentation only - no code references these accounts

