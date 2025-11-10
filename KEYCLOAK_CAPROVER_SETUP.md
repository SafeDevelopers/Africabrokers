# Keycloak Setup in CapRover

This guide explains how to deploy Keycloak to CapRover.

## Prerequisites

1. **PostgreSQL Database**: Keycloak requires a PostgreSQL database. You can either:
   - Use an existing PostgreSQL app in CapRover
   - Deploy a new PostgreSQL app in CapRover
   - Use an external PostgreSQL database

2. **CapRover Access**: Access to your CapRover instance

## Option 1: Deploy Keycloak as a One-Click App (Recommended)

CapRover has a one-click app for Keycloak:

1. **In CapRover Dashboard**:
   - Go to **Apps** → **One-Click Apps/Databases**
   - Search for **Keycloak**
   - Click **Install**

2. **Configure Keycloak**:
   - **App Name**: `keycloak` (or your preferred name)
   - **Keycloak Admin Username**: `admin` (or your choice)
   - **Keycloak Admin Password**: Set a strong password
   - **Database Type**: PostgreSQL
   - **Database Host**: Your PostgreSQL service name (e.g., `srv-captain--postgres`)
   - **Database Port**: `5432`
   - **Database Name**: `keycloak` (or your database name)
   - **Database Username**: Your PostgreSQL username
   - **Database Password**: Your PostgreSQL password

3. **Click Install** and wait for deployment

## Option 2: Deploy Keycloak Manually

### Step 1: Create Keycloak App in CapRover

1. In CapRover Dashboard, go to **Apps** → **New App**
2. Enter app name: `keycloak`
3. Click **Create New App**

### Step 2: Set Up Database Connection

You need to configure Keycloak to connect to your PostgreSQL database. In CapRover, you can reference other apps using their service name format: `srv-captain--<app-name>`.

For example, if your PostgreSQL app is named `postgres`, the host would be: `srv-captain--postgres`

### Step 3: Configure Environment Variables

In the Keycloak app settings, go to **App Configs** → **Environment Variables** and add:

```bash
# Keycloak Admin Credentials
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=<your-strong-password>

# Database Configuration
KC_DB=postgres
KC_DB_URL_HOST=srv-captain--postgres  # Your PostgreSQL service name
KC_DB_URL_PORT=5432
KC_DB_URL_DATABASE=keycloak
KC_DB_USERNAME=<postgres-username>
KC_DB_PASSWORD=<postgres-password>

# Keycloak Configuration
KC_HOSTNAME_STRICT=false
KC_HOSTNAME_STRICT_HTTPS=false
KC_HTTP_ENABLED=true
KC_HEALTH_ENABLED=true

# Optional: Production mode (recommended for production)
KC_HOSTNAME=<your-keycloak-domain>
KC_HOSTNAME_ADMIN=<your-keycloak-admin-domain>
```

### Step 4: Deploy Using Docker Image

In the Keycloak app settings:

1. Go to **Deployment** tab
2. Select **Method 1: Deploy from Docker Hub**
3. Enter image: `quay.io/keycloak/keycloak:23.0` (or latest version)
4. Click **Save & Update**

### Step 5: Configure HTTP Port

1. Go to **HTTP Settings**
2. Set **Container Port**: `8080`
3. Set **HTTP Port**: `80` (or your preferred port)
4. Enable **HTTPS** if you have SSL certificates

### Step 6: Set Command (if needed)

If using production mode, you may need to set the command:

1. Go to **App Configs** → **Docker Run Arguments**
2. Add command: `start --optimized`

Or for development mode:
```
start-dev --http-port=8080 --hostname-strict=false
```

## Option 3: Deploy Using Captain Definition (Git-based)

If you want to deploy Keycloak from your Git repository:

### Step 1: Create Captain Definition

Create a `captain-definition` file in your repository:

```json
{
  "schemaVersion": 2,
  "dockerfileLines": [
    "FROM quay.io/keycloak/keycloak:23.0",
    "USER root",
    "RUN microdnf install -y curl",
    "USER keycloak",
    "ENTRYPOINT [\"/opt/keycloak/bin/kc.sh\"]",
    "CMD [\"start\", \"--optimized\", \"--http-port=8080\", \"--hostname-strict=false\"]"
  ]
}
```

Or use a Dockerfile:

**Dockerfile**:
```dockerfile
FROM quay.io/keycloak/keycloak:23.0

USER root
RUN microdnf install -y curl
USER keycloak

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized", "--http-port=8080", "--hostname-strict=false"]
```

**captain-definition**:
```json
{
  "schemaVersion": 2,
  "dockerfilePath": "./Dockerfile"
}
```

### Step 2: Connect CapRover to Git Repository

1. In Keycloak app settings, go to **Deployment** tab
2. Select **Method 2: Deploy from GitHub/Bitbucket/GitLab**
3. Connect your repository
4. Set **Branch**: `main` (or your branch)
5. Set **Dockerfile Path**: `./Dockerfile` (or path to your Dockerfile)
6. Click **Save & Update**

## Database Setup

### Create Keycloak Database

If you need to create a new database for Keycloak:

1. Connect to your PostgreSQL instance
2. Create database:
   ```sql
   CREATE DATABASE keycloak;
   CREATE USER keycloak WITH PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak;
   ```

### Using CapRover PostgreSQL One-Click App

1. Install PostgreSQL one-click app in CapRover
2. Note the service name (e.g., `srv-captain--postgres`)
3. Use this as `KC_DB_URL_HOST` in Keycloak environment variables

## Post-Deployment Configuration

### 1. Access Keycloak Admin Console

1. Go to your Keycloak app URL (e.g., `https://keycloak.yourdomain.com`)
2. Click **Administration Console**
3. Login with:
   - Username: `admin` (or your `KEYCLOAK_ADMIN`)
   - Password: Your `KEYCLOAK_ADMIN_PASSWORD`

### 2. Create Realm

1. In Keycloak Admin Console, click **Create Realm**
2. Enter realm name (e.g., `afribrok`)
3. Click **Create**

### 3. Create Client

1. Go to **Clients** → **Create client**
2. Configure:
   - **Client ID**: `afribrok-api` (or your client ID)
   - **Client authentication**: Enable if using confidential client
   - **Valid redirect URIs**: Add your app URLs
   - **Web origins**: Add your app domains
3. Click **Save**

### 4. Configure Client Credentials

1. Go to **Credentials** tab
2. Copy **Client Secret** (if using confidential client)
3. Use this in your application's OIDC configuration

## Environment Variables Reference

### Required Variables

```bash
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=<strong-password>
KC_DB=postgres
KC_DB_URL_HOST=<postgres-host>
KC_DB_URL_PORT=5432
KC_DB_URL_DATABASE=keycloak
KC_DB_USERNAME=<db-username>
KC_DB_PASSWORD=<db-password>
```

### Optional Variables

```bash
# Hostname configuration
KC_HOSTNAME=<your-domain>
KC_HOSTNAME_ADMIN=<admin-domain>
KC_HOSTNAME_STRICT=false
KC_HOSTNAME_STRICT_HTTPS=false

# HTTP/HTTPS
KC_HTTP_ENABLED=true
KC_HTTPS_PORT=8443

# Health checks
KC_HEALTH_ENABLED=true

# Proxy configuration (if behind reverse proxy)
KC_PROXY=edge
KC_PROXY_HEADERS=xforwarded
```

## Troubleshooting

### Keycloak Won't Start

1. **Check Logs**: In CapRover, go to app → **App Logs**
2. **Check Database Connection**: Verify PostgreSQL is accessible
3. **Check Environment Variables**: Ensure all required variables are set

### Database Connection Issues

1. **Verify Service Name**: Use `srv-captain--<app-name>` format
2. **Check Database Credentials**: Verify username/password
3. **Test Connection**: Use CapRover's terminal to test connection

### Health Check Failing

1. **Enable Health Endpoint**: Set `KC_HEALTH_ENABLED=true`
2. **Check Port**: Ensure container port is `8080`
3. **Check Health Endpoint**: Visit `http://your-keycloak/health`

## Production Recommendations

1. **Use Production Mode**: Set command to `start --optimized`
2. **Enable HTTPS**: Configure SSL certificates in CapRover
3. **Set Strong Passwords**: Use strong admin and database passwords
4. **Configure Hostname**: Set `KC_HOSTNAME` to your domain
5. **Enable Proxy**: Set `KC_PROXY=edge` if behind CapRover's reverse proxy
6. **Database Backups**: Set up regular PostgreSQL backups
7. **Resource Limits**: Set appropriate CPU/memory limits in CapRover

## Integration with Your Apps

After Keycloak is set up, configure your apps to use it:

### Core API Configuration

Add to your core-api environment variables:

```bash
OIDC_ISSUER=https://keycloak.yourdomain.com/realms/afribrok
OIDC_CLIENT_ID=afribrok-api
OIDC_CLIENT_SECRET=<client-secret>
```

### Web Apps Configuration

Add to your Next.js apps:

```bash
NEXT_PUBLIC_OIDC_ISSUER=https://keycloak.yourdomain.com/realms/afribrok
NEXT_PUBLIC_OIDC_CLIENT_ID=afribrok-web
```

## Additional Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Keycloak Docker Image](https://quay.io/repository/keycloak/keycloak)
- [CapRover Documentation](https://caprover.com/docs/)

