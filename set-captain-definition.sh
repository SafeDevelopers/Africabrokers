#!/bin/bash

# Set Captain Definition files for CapRover deployment
# This script creates captain-definition files in the root of each app
# Run this script before deploying to CapRover

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Setting up Captain Definition files for CapRover deployment..."

# Core API
echo "📦 Setting up core-api..."
mkdir -p services/core-api
cat > services/core-api/captain-definition <<EOF
{
  "schemaVersion": 2,
  "dockerfilePath": "./Dockerfile",
  "contextPath": "/",
  "envVars": {
    "PORT": "8080"
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
  "dockerfilePath": "./Dockerfile",
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

