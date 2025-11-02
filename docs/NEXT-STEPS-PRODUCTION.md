# Next Steps for Production Deployment

## Immediate Actions Required

### 1. Configure Production Environment Variables ⚠️ CRITICAL

Create your production environment file:

```bash
# Copy the template
cp infrastructure/compose/.env.production.example infrastructure/compose/.env.production

# Edit with your actual values
nano infrastructure/compose/.env.production
```

**Required Changes:**
- [ ] `POSTGRES_PASSWORD` - Strong database password (generate: `openssl rand -base64 32`)
- [ ] `REDIS_PASSWORD` - Strong Redis password
- [ ] `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY` - Storage credentials
- [ ] `OIDC_CLIENT_SECRET` - Keycloak client secret
- [ ] `NEXT_PUBLIC_APP_BASE_URL` - Your production domain
- [ ] All `TELEBIRR_*` keys if using payment gateway
- [ ] `KEYCLOAK_ADMIN_PASSWORD` - Keycloak admin password

**⚠️ NEVER commit `.env.production` to version control!**

### 2. Choose Your Deployment Platform

#### Option A: Docker Compose (Easiest - Recommended for MVP)

**Best for:** Single server, quick deployment, cost-effective

**Steps:**
1. Provision a VPS (DigitalOcean, AWS EC2, Linode) - 4-8GB RAM, 2-4 CPUs
2. Install Docker and Docker Compose
3. Clone repository
4. Configure `.env.production`
5. Run `./scripts/deploy.sh production`

**Estimated Time:** 30-60 minutes

#### Option B: Cloud PaaS (Fastest)

**Best for:** Quick deployment, managed infrastructure

**Next.js Apps → Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy web-marketplace
cd apps/web-marketplace
vercel --prod

# Deploy web-admin
cd ../web-admin
vercel --prod
```

**API Services → Railway/Render:**
- Deploy `core-api` and `media-service` as Docker containers
- Use managed Postgres and Redis
- Configure environment variables

**Estimated Time:** 15-30 minutes per service

#### Option C: Kubernetes (Most Scalable)

**Best for:** Production-grade, multi-tenant, auto-scaling

**Steps:**
1. Provision Kubernetes cluster (EKS, GKE, AKS, or DigitalOcean Kubernetes)
2. Create namespace and secrets
3. Apply Kubernetes manifests (to be created)
4. Configure ingress and load balancer

**Estimated Time:** 2-4 hours

### 3. Setup Infrastructure Services

#### Database (PostgreSQL 15+ with PostGIS)

**Option A: Managed Database (Recommended)**
- AWS RDS, DigitalOcean Managed DB, or Railway Postgres
- Enable PostGIS extension
- Configure backups

**Option B: Self-Hosted**
- Use Postgres in docker-compose
- Ensure regular backups

#### Redis

**Option A: Managed Redis**
- AWS ElastiCache, DigitalOcean Redis, or Railway Redis

**Option B: Self-Hosted**
- Use Redis in docker-compose

#### Object Storage (S3-Compatible)

**Option A: AWS S3** (Recommended for production)
- Create S3 bucket
- Configure IAM credentials
- Update `STORAGE_ENDPOINT` and credentials

**Option B: MinIO** (Self-hosted)
- Use MinIO in docker-compose for development
- Not recommended for production at scale

#### Authentication (Keycloak/OIDC)

**Option A: Managed Keycloak**
- Use docker-compose Keycloak for now
- Consider cloud OIDC provider later (Auth0, Okta, AWS Cognito)

**Option B: Self-Hosted Keycloak**
- Use Keycloak in docker-compose
- Configure PostgreSQL as Keycloak database

### 4. Configure Domain and SSL

1. **Purchase Domain** (if not already owned)
   - Domain names needed:
     - `api.afribrok.com` (or your subdomain)
     - `marketplace.afribrok.com`
     - `admin.afribrok.com`
     - `auth.afribrok.com` (for Keycloak)

2. **DNS Configuration**
   - Point A records to your server IP
   - Or use CNAME for cloud platforms

3. **SSL Certificates**
   - Use Let's Encrypt (free) with certbot
   - Or use managed SSL from your platform

### 5. Security Hardening

**Before going live:**

- [ ] Change ALL default passwords
- [ ] Enable database SSL connections
- [ ] Configure Redis password authentication
- [ ] Set up firewall (only allow 80, 443, SSH)
- [ ] Configure CORS for your production domains only
- [ ] Enable rate limiting
- [ ] Set up DDoS protection (Cloudflare free tier)
- [ ] Review and update security headers
- [ ] Enable audit logging

### 6. Monitoring and Alerting

**Essential Setup:**

1. **Health Checks**
   - Configure monitoring service (UptimeRobot, Pingdom)
   - Monitor: `/v1/health/ready` endpoints

2. **Logging**
   - Centralize logs (Datadog, Logtail, or self-hosted)
   - Configure log rotation

3. **Metrics**
   - Set up basic monitoring (Prometheus + Grafana or managed)
   - Monitor: CPU, memory, disk, database connections

4. **Alerts**
   - Configure alerts for:
     - Service downtime
     - High error rates
     - High resource usage
     - Database connection failures

### 7. Database Migrations

**First Deployment:**
```bash
# Run migrations
docker compose -f infrastructure/compose/docker-compose.prod.yml run --rm core-api pnpm prisma migrate deploy

# Seed initial data
docker compose -f infrastructure/compose/docker-compose.prod.yml run --rm core-api pnpm db:seed
```

**Future Updates:**
- Always test migrations in staging first
- Use `prisma migrate deploy` for production

### 8. Backup Strategy

**Automated Backups:**

1. **Database Backups**
   ```bash
   # Set up cron job for daily backups
   ./scripts/backup-db.sh
   ```

2. **File Storage Backups**
   - Enable S3 bucket versioning
   - Configure cross-region replication

3. **Test Restores**
   - Regularly test backup restoration
   - Document restore procedures

### 9. CI/CD Pipeline Configuration

**GitHub Actions is already configured!**

**Next Steps:**
1. Push code to GitHub
2. Configure GitHub Secrets:
   - Container registry credentials
   - Deployment server credentials
   - Environment variables (if using secrets)

3. Customize deployment steps in `.github/workflows/deploy.yml`
   - Add SSH deployment commands
   - Configure Kubernetes deployment
   - Or use platform-specific deployment tools

### 10. Testing in Production-Like Environment

**Before Production:**

1. **Deploy to Staging**
   - Deploy to staging environment first
   - Test all functionality
   - Load test
   - Security test

2. **Production Smoke Tests**
   - Health checks
   - Authentication flow
   - Key API endpoints
   - Database connectivity

## Deployment Timeline

### Fast Track (1-2 Days)

1. **Day 1 Morning:**
   - Configure environment variables
   - Setup infrastructure (managed DB, Redis, S3)
   - Deploy to Docker Compose server

2. **Day 1 Afternoon:**
   - Configure domain and SSL
   - Security hardening
   - Basic monitoring

3. **Day 2:**
   - Testing and verification
   - Documentation
   - Team training

### Standard Track (1 Week)

- More thorough testing
- Staging environment setup
- Comprehensive monitoring
- Security audit
- Performance optimization

## Recommended Order of Operations

1. ✅ **Environment Configuration** (30 min)
2. ✅ **Infrastructure Setup** (1-2 hours)
3. ✅ **Initial Deployment** (30 min)
4. ✅ **Domain & SSL** (30 min)
5. ✅ **Security Hardening** (1 hour)
6. ✅ **Monitoring Setup** (1 hour)
7. ✅ **Testing** (2-4 hours)
8. ✅ **Documentation** (1 hour)

**Total Estimated Time: 6-10 hours**

## Common Issues & Solutions

### Issue: Database Connection Failed
**Solution:** Verify `DATABASE_URL` format and network connectivity

### Issue: Docker Images Not Building
**Solution:** Check Dockerfile paths and build context

### Issue: Health Checks Failing
**Solution:** Verify service ports and health check endpoints

### Issue: SSL Certificate Errors
**Solution:** Verify domain DNS and certificate configuration

## Getting Help

- **Deployment Guide:** `docs/PRODUCTION-DEPLOYMENT.md`
- **Checklist:** `docs/PRODUCTION-READINESS-CHECKLIST.md`
- **Logs:** `docker compose logs [service-name]`
- **Health:** `curl http://localhost:4000/v1/health/ready`

## Final Checklist Before Launch

- [ ] All environment variables configured
- [ ] Database migrated and seeded
- [ ] All services healthy
- [ ] SSL certificates configured
- [ ] CORS configured for production domains
- [ ] Monitoring and alerts configured
- [ ] Backups automated
- [ ] Team trained on deployment process
- [ ] Rollback procedure documented
- [ ] Support contacts configured

**🎉 You're ready to deploy!**

