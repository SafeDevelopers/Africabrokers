# Production Deployment Guide

## Overview

This guide covers the steps required to deploy AfriBrok to production. The application consists of:
- **2 Next.js Web Applications**: `web-admin`, `web-marketplace`
- **2 NestJS Services**: `core-api`, `media-service`
- **Infrastructure**: PostgreSQL, Redis, Object Storage (MinIO/S3), Keycloak

## Prerequisites

1. **Cloud Provider Account** (AWS, Azure, GCP, or DigitalOcean)
2. **Domain Names** configured for your applications
3. **SSL Certificates** (Let's Encrypt or commercial)
4. **Database** (PostgreSQL 15+ with PostGIS)
5. **Object Storage** (S3-compatible: AWS S3, MinIO, or DigitalOcean Spaces)
6. **Redis** instance (managed or self-hosted)
7. **Container Registry** (Docker Hub, AWS ECR, GitHub Container Registry)

## Architecture Options

### Option 1: Docker Compose (Single Server)
Best for: Small deployments, single tenant, cost-effective
- All services on one server
- Use `docker-compose.prod.yml`
- Requires: 4-8GB RAM, 2-4 CPU cores

### Option 2: Kubernetes (K8s)
Best for: Scalable, multi-tenant, production-grade
- Use provided K8s manifests
- Requires: Kubernetes cluster (managed or self-hosted)

### Option 3: Cloud PaaS (Vercel/Railway/Render)
Best for: Quick deployment, managed infrastructure
- Deploy Next.js apps to Vercel
- Deploy APIs to Railway/Render
- Requires: Managed services configuration

## Quick Start: Docker Compose Deployment

### Step 1: Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo apt install docker-compose-plugin -y
```

### Step 2: Clone Repository

```bash
git clone <your-repo-url>
cd Africabrockers
```

### Step 3: Configure Environment

```bash
# Copy production environment template
cp infrastructure/compose/.env.production.example infrastructure/compose/.env.production

# Edit with your production values
nano infrastructure/compose/.env.production
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `STORAGE_ENDPOINT`: S3/MinIO endpoint
- `STORAGE_BUCKET`: Storage bucket name
- `OIDC_ISSUER_URL`: Keycloak/OIDC provider URL
- `OIDC_CLIENT_ID`: OIDC client ID
- `OIDC_CLIENT_SECRET`: OIDC client secret
- `NEXT_PUBLIC_APP_BASE_URL`: Public app URL

### Step 4: Build and Deploy

```bash
# Build all images
docker compose -f infrastructure/compose/docker-compose.prod.yml build

# Run database migrations
docker compose -f infrastructure/compose/docker-compose.prod.yml run --rm core-api pnpm db:migrate

# Seed initial data (optional)
docker compose -f infrastructure/compose/docker-compose.prod.yml run --rm core-api pnpm db:seed

# Start all services
docker compose -f infrastructure/compose/docker-compose.prod.yml up -d

# Check logs
docker compose -f infrastructure/compose/docker-compose.prod.yml logs -f
```

### Step 5: Setup Reverse Proxy (Nginx)

Create `/etc/nginx/sites-available/afribrok`:

```nginx
server {
    listen 80;
    server_name api.afribrok.com marketplace.afribrok.com admin.afribrok.com;

    location / {
        return 301 https://$host$request_uri;
    }
}

# API Server
server {
    listen 443 ssl http2;
    server_name api.afribrok.com;

    ssl_certificate /etc/letsencrypt/live/api.afribrok.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.afribrok.com/privkey.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Marketplace
server {
    listen 443 ssl http2;
    server_name marketplace.afribrok.com;

    ssl_certificate /etc/letsencrypt/live/marketplace.afribrok.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/marketplace.afribrok.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Admin Dashboard
server {
    listen 443 ssl http2;
    server_name admin.afribrok.com;

    ssl_certificate /etc/letsencrypt/live/admin.afribrok.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.afribrok.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/afribrok /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: Setup SSL Certificates

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.afribrok.com -d marketplace.afribrok.com -d admin.afribrok.com
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured
- Helm 3.x (optional)

### Steps

1. **Build and Push Images**

```bash
# Set your registry
export REGISTRY=your-registry.io/afribrok

# Build and push
docker build -t $REGISTRY/core-api:latest -f services/core-api/Dockerfile .
docker build -t $REGISTRY/media-service:latest -f services/media-service/Dockerfile .
docker build -t $REGISTRY/web-admin:latest -f apps/web-admin/Dockerfile .
docker build -t $REGISTRY/web-marketplace:latest -f apps/web-marketplace/Dockerfile .

docker push $REGISTRY/core-api:latest
docker push $REGISTRY/media-service:latest
docker push $REGISTRY/web-admin:latest
docker push $REGISTRY/web-marketplace:latest
```

2. **Create Namespace and Secrets**

```bash
kubectl create namespace afribrok
kubectl create secret generic afribrok-secrets --from-env-file=.env.production -n afribrok
```

3. **Deploy Services**

```bash
kubectl apply -f infrastructure/k8s/ -n afribrok
```

4. **Run Migrations**

```bash
kubectl run -it --rm migration --image=$REGISTRY/core-api:latest --restart=Never -- pnpm db:migrate
```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:
1. Builds Docker images on push to `main`
2. Runs tests and linting
3. Pushes images to registry
4. Deploys to staging/production

### Manual Deployment Trigger

```bash
git push origin main  # Triggers deployment
```

## Database Migrations

### Production Migration Strategy

```bash
# Always test migrations in staging first
docker compose -f docker-compose.prod.yml run --rm core-api pnpm prisma migrate deploy

# Or in K8s
kubectl run migration --image=$REGISTRY/core-api:latest --restart=Never -- pnpm prisma migrate deploy
```

## Monitoring & Health Checks

All services expose health endpoints:
- Core API: `http://api:4000/v1/health/live`, `/v1/health/ready`
- Media Service: `http://media:3001/health`
- Web Apps: Health checks via Next.js

Set up monitoring:
- Prometheus for metrics
- Grafana for dashboards
- AlertManager for alerts

## Backup Strategy

### Database Backups

```bash
# Daily automated backup script
#!/bin/bash
docker exec postgres pg_dump -U afribrok afribrok | gzip > backup_$(date +%Y%m%d).sql.gz
# Upload to S3/remote storage
aws s3 cp backup_$(date +%Y%m%d).sql.gz s3://afribrok-backups/
```

### File Storage Backups

- Configure MinIO/S3 bucket versioning
- Enable cross-region replication
- Regular snapshot schedules

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong, unique secrets for all services
- [ ] Enable PostgreSQL SSL connections
- [ ] Configure Redis password authentication
- [ ] Set up firewall rules (only allow 80, 443, SSH)
- [ ] Enable database encryption at rest
- [ ] Configure CORS properly for production domains
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Configure automatic security updates
- [ ] Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- [ ] Enable DDoS protection (Cloudflare, AWS Shield)

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs [service-name]

# Check health
curl http://localhost:4000/v1/health/ready
```

### Database Connection Issues

```bash
# Test connection
docker compose -f docker-compose.prod.yml exec postgres psql -U afribrok -d afribrok -c "SELECT 1"
```

### High Memory Usage

```bash
# Monitor resource usage
docker stats

# Adjust memory limits in docker-compose.prod.yml
```

## Rollback Procedure

```bash
# Stop current version
docker compose -f docker-compose.prod.yml down

# Checkout previous version
git checkout <previous-tag>

# Rebuild and restart
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

## Scaling

### Horizontal Scaling (Multiple Instances)

```yaml
# In docker-compose.prod.yml or K8s deployment
services:
  core-api:
    deploy:
      replicas: 3  # Run 3 instances
```

Use a load balancer (Nginx, Traefik, or cloud LB) in front.

### Vertical Scaling

Increase server resources:
- CPU: 4+ cores recommended
- RAM: 8GB+ recommended
- Storage: SSD with 100GB+ free space

## Support & Resources

- Production Issues: Check logs in `/var/log/afribrok/`
- Documentation: `/docs/`
- Health Dashboard: `http://your-domain/health`

## Next Steps After Deployment

1. Configure domain DNS records
2. Set up monitoring and alerting
3. Configure automated backups
4. Load test the application
5. Set up staging environment for testing
6. Configure CI/CD for automated deployments
7. Document runbooks for common operations
8. Train team on deployment procedures

