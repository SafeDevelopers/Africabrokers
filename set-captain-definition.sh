#!/bin/bash

# Set Captain Definition files for CapRover deployment
# This script creates captain-definition files in the root of each app
# Usage: ./set-captain-definition.sh [app-name]
#   app-name: core-api, web-admin, web-marketplace, media-service
#   If no argument provided, defaults to core-api
# Run this script before deploying to CapRover

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Get the app name from argument, default to core-api
APP_NAME="${1:-core-api}"

echo "🚀 Setting up Captain Definition files for CapRover deployment..."
echo "📦 Root captain-definition will be set for: $APP_NAME"

# Root captain-definition (CapRover looks for this in root)
# IMPORTANT: CapRover Method 2 requires captain-definition in root
# This determines which app gets deployed when using root captain-definition
case "$APP_NAME" in
  core-api)
    echo "📦 Setting up root captain-definition for core-api..."
    cat > captain-definition <<EOF
{
  "schemaVersion": 2,
  "dockerfilePath": "./services/core-api/Dockerfile",
  "contextPath": "/",
  "envVars": {
    "PORT": "8080",
    "KEYCLOAK_REALM": "afribrok",
    "KEYCLOAK_CLIENT_ID": "core-api",
    "KEYCLOAK_ISSUER": "https://keycloak.afribrok.com/realms/afribrok",
    "KEYCLOAK_JWKS_URI": "https://keycloak.afribrok.com/realms/afribrok/protocol/openid-connect/certs",
    "KEYCLOAK_AUDIENCE": "core-api"
  }
}
EOF
    echo "✅ Created captain-definition (root) for core-api"
    ;;
  web-admin)
    echo "📦 Setting up root captain-definition for web-admin..."
    cat > captain-definition <<EOF
{
  "schemaVersion": 2,
  "dockerfilePath": "./apps/web-admin/Dockerfile",
  "contextPath": "/",
  "envVars": {
    "PORT": "3000"
  }
}
EOF
    echo "✅ Created captain-definition (root) for web-admin"
    ;;
  web-marketplace)
    echo "📦 Setting up root captain-definition for web-marketplace..."
    cat > captain-definition <<EOF
{
  "schemaVersion": 2,
  "dockerfilePath": "./apps/web-marketplace/Dockerfile",
  "contextPath": "/",
  "envVars": {
    "PORT": "3000"
  }
}
EOF
    echo "✅ Created captain-definition (root) for web-marketplace"
    ;;
  media-service)
    echo "📦 Setting up root captain-definition for media-service..."
    cat > captain-definition <<EOF
{
  "schemaVersion": 2,
  "dockerfilePath": "./services/media-service/Dockerfile",
  "contextPath": "/",
  "envVars": {
    "PORT": "3001"
  }
}
EOF
    echo "✅ Created captain-definition (root) for media-service"
    ;;
  *)
    echo "❌ Error: Unknown app name: $APP_NAME"
    echo "   Valid options: core-api, web-admin, web-marketplace, media-service"
    exit 1
    ;;
esac

# Core API (subdirectory - for reference)
echo "📦 Setting up core-api subdirectory..."
mkdir -p services/core-api
cat > services/core-api/captain-definition <<EOF
{
  "schemaVersion": 2,
  "dockerfilePath": "./Dockerfile",
  "contextPath": "/",
  "envVars": {
    "PORT": "8080",
    "KEYCLOAK_REALM": "afribrok",
    "KEYCLOAK_CLIENT_ID": "core-api",
    "KEYCLOAK_ISSUER": "https://keycloak.afribrok.com/realms/afribrok",
    "KEYCLOAK_JWKS_URI": "https://keycloak.afribrok.com/realms/afribrok/protocol/openid-connect/certs",
    "KEYCLOAK_AUDIENCE": "core-api"
  }
}
EOF
echo "✅ Created services/core-api/captain-definition"

# Media Service
echo "📦 Setting up media-service..."
mkdir -p services/media-service
cat > services/media-service/captain-definition <<EOF
{
  "schemaVersion": 2,
  "dockerfilePath": "./Dockerfile",
  "contextPath": "/",
  "envVars": {
    "PORT": "3001"
  }
}
EOF
echo "✅ Created services/media-service/captain-definition"

# Web Admin
echo "📦 Setting up web-admin..."
mkdir -p apps/web-admin
cat > apps/web-admin/captain-definition <<EOF
{
  "schemaVersion": 2,
  "dockerfilePath": "./apps/web-admin/Dockerfile",
  "contextPath": "/",
  "envVars": {
    "PORT": "3000"
  }
}
EOF
echo "✅ Created apps/web-admin/captain-definition"

# Web Marketplace
echo "📦 Setting up web-marketplace..."
mkdir -p apps/web-marketplace
cat > apps/web-marketplace/captain-definition <<EOF
{
  "schemaVersion": 2,
  "dockerfilePath": "./Dockerfile",
  "contextPath": "/",
  "envVars": {
    "PORT": "3000"
  }
}
EOF
echo "✅ Created apps/web-marketplace/captain-definition"

echo ""
echo "✅ All Captain Definition files created successfully!"
echo ""
echo "📋 Files created:"
echo "   - services/core-api/captain-definition"
echo "   - services/media-service/captain-definition"
echo "   - apps/web-admin/captain-definition"
echo "   - apps/web-marketplace/captain-definition"
echo ""
echo "🚀 You can now deploy to CapRover!"
echo ""
echo "💡 For CapRover deployment:"
echo "   - Dockerfile Path: services/core-api/Dockerfile (or respective path)"
echo "   - Context Path: / (root of repository)"
echo ""

