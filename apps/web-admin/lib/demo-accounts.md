# Demo Accounts for Testing

## Super Admin Account
- **Email**: `admin@afribrok.com`
- **Password**: `admin123`
- **Role**: `SUPER_ADMIN`
- **Access**: Full platform access, can view all tenants and manage system-wide settings

## Broker Account (Tenant Admin)
- **Email**: `broker@afribrok.com`
- **Password**: `broker123`
- **Role**: `TENANT_ADMIN`
- **Tenant**: `et-addis`
- **Access**: Tenant-scoped access, can manage brokers, listings, QR codes within their tenant

## Agency Account (Agent)
- **Email**: `agency@afribrok.com`
- **Password**: `agency123`
- **Role**: `AGENT`
- **Tenant**: `et-addis`
- **Access**: Agent-level access for government agencies, can perform inspections and verifications

## Notes
- These are demo accounts for development and testing
- In production, replace with real authentication using the backend API
- Passwords should be hashed and stored securely in the database
- JWT tokens should be properly signed and verified

