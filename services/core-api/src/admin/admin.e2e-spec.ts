import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { AppModule } from '../app/app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

  // Test data
  let tenant1: any;
  let tenant2: any;
  let adminUser1: any;
  let adminUser2: any;
  let review1: any;
  let review2: any;
  let broker1: any;
  let broker2: any;

  beforeAll(async () => {
    // Set NODE_ENV to production for tests to enforce authentication
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply global prefix
    app.setGlobalPrefix('v1');
    
    // Enable global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    
    // Enable CORS for tests
    app.enableCors({
      origin: '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-tenant'],
    });
    
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
    
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;

    // Create test tenants
    tenant1 = await prisma.tenant.upsert({
      where: { slug: 'test-tenant-1' },
      update: {},
      create: {
        slug: 'test-tenant-1',
        key: 'test-tenant-1-key',
        name: 'Test Tenant 1',
        country: 'ET',
        locales: ['en'],
        policies: {},
        brandConfig: {},
        currency: 'ETB',
      },
    });

    tenant2 = await prisma.tenant.upsert({
      where: { slug: 'test-tenant-2' },
      update: {},
      create: {
        slug: 'test-tenant-2',
        key: 'test-tenant-2-key',
        name: 'Test Tenant 2',
        country: 'ET',
        locales: ['en'],
        policies: {},
        brandConfig: {},
        currency: 'ETB',
      },
    });

    // Create test admin users
    adminUser1 = await prisma.user.upsert({
      where: { email: 'admin1@test.com' },
      update: {},
      create: {
        email: 'admin1@test.com',
        tenantId: tenant1.id,
        authProviderId: 'admin1',
        role: 'TENANT_ADMIN',
        status: 'ACTIVE',
      },
    });

    adminUser2 = await prisma.user.upsert({
      where: { email: 'admin2@test.com' },
      update: {},
      create: {
        email: 'admin2@test.com',
        tenantId: tenant2.id,
        authProviderId: 'admin2',
        role: 'TENANT_ADMIN',
        status: 'ACTIVE',
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (review1) await prisma.kycReview.deleteMany({ where: { id: review1.id } }).catch(() => {});
    if (review2) await prisma.kycReview.deleteMany({ where: { id: review2.id } }).catch(() => {});
    if (broker1) await prisma.broker.deleteMany({ where: { id: broker1.id } }).catch(() => {});
    if (broker2) await prisma.broker.deleteMany({ where: { id: broker2.id } }).catch(() => {});
    if (adminUser1) await prisma.user.deleteMany({ where: { id: adminUser1.id } }).catch(() => {});
    if (adminUser2) await prisma.user.deleteMany({ where: { id: adminUser2.id } }).catch(() => {});
    if (tenant1) await prisma.tenant.deleteMany({ where: { id: tenant1.id } }).catch(() => {});
    if (tenant2) await prisma.tenant.deleteMany({ where: { id: tenant2.id } }).catch(() => {});
    
    await app.close();
  });

  describe('GET /v1/admin/reviews/pending', () => {
    it('should return 401 without auth', async () => {
      return request(app.getHttpServer())
        .get('/v1/admin/reviews/pending')
        .expect(401);
    });

    it('should return 403 with admin JWT wrong tenant', async () => {
      // Create JWT for adminUser1 (tenant1) but try to access tenant2
      const token = jwt.sign(
        {
          sub: adminUser1.id,
          role: 'admin',
          tenant: tenant1.slug, // Correct tenant
        },
        JWT_SECRET,
        { expiresIn: '1h' },
      );

      // Try to access with wrong tenant header
      return request(app.getHttpServer())
        .get('/v1/admin/reviews/pending')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Tenant', tenant2.slug) // Wrong tenant
        .expect(403);
    });

    it('should return 200 with empty items when no data', async () => {
      // Create JWT for adminUser1
      const token = jwt.sign(
        {
          sub: adminUser1.id,
          role: 'admin',
          tenant: tenant1.slug,
        },
        JWT_SECRET,
        { expiresIn: '1h' },
      );

      const response = await request(app.getHttpServer())
        .get('/v1/admin/reviews/pending')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Tenant', tenant1.slug)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('count');
      expect(response.body.items).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    it('should return 200 with 2 seeded reviews', async () => {
      // Create test reviews for tenant1
      broker1 = await prisma.broker.create({
        data: {
          tenantId: tenant1.id,
          licenseNumber: 'TEST-LICENSE-1',
          status: 'submitted',
          licenseDocs: {},
        },
      });

      review1 = await prisma.kycReview.create({
        data: {
          tenantId: tenant1.id,
          brokerId: broker1.id,
          decision: 'pending',
          submittedAt: new Date(),
        },
      });

      broker2 = await prisma.broker.create({
        data: {
          tenantId: tenant1.id,
          licenseNumber: 'TEST-LICENSE-2',
          status: 'submitted',
          licenseDocs: {},
        },
      });

      review2 = await prisma.kycReview.create({
        data: {
          tenantId: tenant1.id,
          brokerId: broker2.id,
          decision: 'pending',
          submittedAt: new Date(),
        },
      });

      // Create JWT for adminUser1
      const token = jwt.sign(
        {
          sub: adminUser1.id,
          role: 'admin',
          tenant: tenant1.slug,
        },
        JWT_SECRET,
        { expiresIn: '1h' },
      );

      const response = await request(app.getHttpServer())
        .get('/v1/admin/reviews/pending')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Tenant', tenant1.slug)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.count).toBeGreaterThanOrEqual(2);
      
      // Verify review structure
      const reviews = response.body.items;
      expect(reviews.length).toBeGreaterThanOrEqual(2);
      
      // Check that reviews have required fields
      const review = reviews.find((r: any) => r.id === review1.id || r.id === review2.id);
      expect(review).toBeDefined();
      expect(review).toHaveProperty('id');
      expect(review).toHaveProperty('status');
      expect(review).toHaveProperty('createdAt');
    });
  });

  describe('GET /v1/_status', () => {
    it('should return all keys with status and latencyMs', async () => {
      // Create JWT for adminUser1
      const token = jwt.sign(
        {
          sub: adminUser1.id,
          role: 'admin',
          tenant: tenant1.slug,
        },
        JWT_SECRET,
        { expiresIn: '1h' },
      );

      const response = await request(app.getHttpServer())
        .get('/v1/_status')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Tenant', tenant1.slug)
        .expect(200);

      expect(response.body).toHaveProperty('services');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('time');

      const services = response.body.services;
      expect(services).toHaveProperty('reviews');
      expect(services).toHaveProperty('verifications');
      expect(services).toHaveProperty('payouts');
      expect(services).toHaveProperty('notifications');

      // Check each service has status and latencyMs
      Object.values(services).forEach((service: any) => {
        expect(service).toHaveProperty('status');
        expect(service).toHaveProperty('latencyMs');
        expect(service).toHaveProperty('updatedAt');
        expect(['ok', 'degraded', 'down']).toContain(service.status);
        expect(typeof service.latencyMs).toBe('number');
        expect(service.latencyMs).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

