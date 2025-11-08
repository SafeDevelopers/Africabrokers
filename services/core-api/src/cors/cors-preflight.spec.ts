import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/core';
import * as request from 'supertest';
import { AppModule } from '../app/app.module';

describe('CORS Preflight (OPTIONS) Handling', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    
    // Apply same CORS config as main.ts
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3006',
      'https://admin.afribrok.com',
      'https://afribrok.com',
      'https://market.afribrok.com',
    ];

    // Handle OPTIONS preflight requests - must return 200 with correct headers, JSON Content-Type, and no HTML
    app.use((req, res, next) => {
      if (req.method === 'OPTIONS') {
        const origin = req.headers.origin as string | undefined;
        
        // Set CORS headers
        if (origin && allowedOrigins.includes(origin)) {
          res.setHeader('Access-Control-Allow-Origin', origin);
        }
        
        // Allow methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        
        // Allow headers: Authorization, Content-Type, X-Tenant
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Tenant, x-tenant-id, x-tenant');
        
        // Credentials: true (explicitly enabled)
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        
        // Preflight must return 200 with JSON Content-Type, and no HTML
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ ok: true });
        return;
      }
      next();
    });

    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'Content-Type', 'X-Tenant', 'x-tenant-id', 'x-tenant'],
      preflightContinue: false,
      optionsSuccessStatus: 200,
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Preflight from marketplace origin', () => {
    it('should return 200 with correct CORS headers and JSON Content-Type (per CORS-CHECK.md)', async () => {
      // Example preflight probe from CORS-CHECK.md:
      // curl -i -X OPTIONS "$API_BASE/v1/marketplace/listings" \
      //   -H "Origin: https://afribrok.com" \
      //   -H "Access-Control-Request-Method: GET"
      const response = await request(app.getHttpServer())
        .options('/v1/marketplace/listings')
        .set('Origin', 'https://afribrok.com')
        .set('Access-Control-Request-Method', 'GET')
        .expect(200);

      // Preflight must return 200
      expect(response.status).toBe(200);

      // Access-Control-Allow-Origin must match the Origin
      expect(response.headers['access-control-allow-origin']).toBe('https://afribrok.com');

      // Access-Control-Allow-Credentials: true must be present
      expect(response.headers['access-control-allow-credentials']).toBe('true');

      // Access-Control-Allow-Methods must include requested method
      expect(response.headers['access-control-allow-methods']).toContain('GET');
      expect(response.headers['access-control-allow-methods']).toContain('OPTIONS');

      // Access-Control-Allow-Headers must include required headers
      expect(response.headers['access-control-allow-headers']).toContain('Authorization');
      expect(response.headers['access-control-allow-headers']).toContain('Content-Type');
      expect(response.headers['access-control-allow-headers']).toContain('X-Tenant');

      // Content-Type must be application/json (not HTML)
      expect(response.headers['content-type']).toContain('application/json');

      // Response body must be JSON (not HTML)
      expect(response.body).toEqual({ ok: true });
    });
  });

  describe('Preflight from admin origin', () => {
    it('should return 200 with correct CORS headers for admin origin', async () => {
      // Example preflight probe from CORS-CHECK.md:
      // curl -i -X OPTIONS "$API_BASE/v1/_status" \
      //   -H "Origin: https://admin.afribrok.com" \
      //   -H "Access-Control-Request-Method: GET"
      const response = await request(app.getHttpServer())
        .options('/v1/_status')
        .set('Origin', 'https://admin.afribrok.com')
        .set('Access-Control-Request-Method', 'GET')
        .expect(200);

      // Preflight must return 200
      expect(response.status).toBe(200);

      // Access-Control-Allow-Origin must match the Origin
      expect(response.headers['access-control-allow-origin']).toBe('https://admin.afribrok.com');

      // Access-Control-Allow-Credentials: true must be present
      expect(response.headers['access-control-allow-credentials']).toBe('true');

      // Content-Type must be application/json (not HTML)
      expect(response.headers['content-type']).toContain('application/json');

      // Response body must be JSON (not HTML)
      expect(response.body).toEqual({ ok: true });
    });
  });
});

