import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { TenantContextMiddleware } from './tenant-context.middleware';
import { Request, Response, NextFunction } from 'express';

describe('TenantContextMiddleware', () => {
  let middleware: TenantContextMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantContextMiddleware],
    }).compile();

    middleware = module.get<TenantContextMiddleware>(TenantContextMiddleware);
    mockNext = jest.fn();
  });

  describe('Cross-tenant access prevention', () => {
    it('should forbid cross-tenant access when X-Tenant header does not match JWT tenantId (per RBAC-MATRIX.md)', () => {
      mockRequest = {
        path: '/v1/admin/dashboard',
        user: {
          id: '1',
          role: 'TENANT_ADMIN',
          tenantId: 'tenant1',
        },
        headers: {
          'x-tenant': 'tenant2', // Different tenant
        },
      };

      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow(ForbiddenException);
      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }).toThrow('X-Tenant header must match your assigned tenant');
    });

    it('should allow access when X-Tenant header matches JWT tenantId', () => {
      mockRequest = {
        path: '/v1/admin/dashboard',
        user: {
          id: '1',
          role: 'TENANT_ADMIN',
          tenantId: 'tenant1',
        },
        headers: {
          'x-tenant': 'tenant1', // Same tenant
        },
      };

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.tenantId).toBe('tenant1');
    });

    it('should allow SUPER_ADMIN to override tenant via X-Tenant header', () => {
      mockRequest = {
        path: '/v1/admin/dashboard',
        user: {
          id: '1',
          role: 'SUPER_ADMIN',
          tenantId: 'tenant1',
        },
        headers: {
          'x-tenant': 'tenant2', // SUPER_ADMIN can override
        },
      };

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.tenantId).toBe('tenant2');
    });
  });

  describe('Public routes', () => {
    it('should skip tenant context for public routes', () => {
      mockRequest = {
        path: '/v1/health',
        headers: {},
      };

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});

