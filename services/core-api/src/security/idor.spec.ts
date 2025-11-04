/**
 * IDOR (Insecure Direct Object Reference) Test Utilities
 * 
 * Use these utilities to test that tenant admins cannot access
 * resources from other tenants, even when guessing IDs.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { IdorGuard } from './idor.guard';
import { PrismaService } from '../prisma/prisma.service';
import { ReqContext } from '../tenancy/req-scope.interceptor';

describe('IDOR Protection Tests', () => {
  let guard: IdorGuard;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdorGuard,
        {
          provide: PrismaService,
          useValue: {
            qrCode: {
              findUnique: jest.fn(),
            },
            listing: {
              findUnique: jest.fn(),
            },
            brokerApplication: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    guard = module.get<IdorGuard>(IdorGuard);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    // Reset context after each test
    ReqContext.tenantId = null;
    ReqContext.userRole = null;
    ReqContext.userId = null;
  });

  describe('QrCode IDOR Protection', () => {
    it('should allow tenant admin to access their own QR code', async () => {
      ReqContext.tenantId = 'tenant-a';
      ReqContext.userRole = 'TENANT_ADMIN';
      ReqContext.userId = 'user-1';

      const mockRequest = {
        params: { id: 'qr-code-1' },
      } as any;

      const handler = () => undefined;
      Reflect.defineMetadata('idorProtection', 'QrCode', handler);

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: () => handler,
      } as ExecutionContext;

      // Mock Prisma to return resource from same tenant
      prismaService.qrCode.findUnique = jest.fn().mockResolvedValue({
        id: 'qr-code-1',
        tenantId: 'tenant-a',
      });

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should deny tenant admin access to another tenant\'s QR code', async () => {
      ReqContext.tenantId = 'tenant-a';
      ReqContext.userRole = 'TENANT_ADMIN';
      ReqContext.userId = 'user-1';

      const mockRequest = {
        params: { id: 'qr-code-from-tenant-b' },
      } as any;

      const handler = () => undefined;
      Reflect.defineMetadata('idorProtection', 'QrCode', handler);

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: () => handler,
      } as ExecutionContext;

      // Mock Prisma to return resource from different tenant (should not happen with Prisma extension)
      // But if it does, IDOR guard catches it
      prismaService.qrCode.findUnique = jest.fn().mockResolvedValue(null);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    });

    it('should allow SUPER_ADMIN to access any tenant\'s QR code', async () => {
      ReqContext.tenantId = 'tenant-a';
      ReqContext.userRole = 'SUPER_ADMIN';
      ReqContext.userId = 'super-admin-1';

      const mockRequest = {
        params: { id: 'qr-code-from-tenant-b' },
      } as any;

      const handler = () => undefined;
      Reflect.defineMetadata('idorProtection', 'QrCode', handler);

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: () => handler,
      } as ExecutionContext;

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
      // SUPER_ADMIN bypasses IDOR check
      expect(prismaService.qrCode.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('Listing IDOR Protection', () => {
    it('should allow tenant admin to access their own listing', async () => {
      ReqContext.tenantId = 'tenant-a';
      ReqContext.userRole = 'TENANT_ADMIN';

      const mockRequest = {
        params: { id: 'listing-1' },
      } as any;

      const handler = () => undefined;
      Reflect.defineMetadata('idorProtection', 'Listing', handler);

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: () => handler,
      } as ExecutionContext;

      prismaService.listing.findUnique = jest.fn().mockResolvedValue({
        id: 'listing-1',
        tenantId: 'tenant-a',
      });

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should deny tenant admin access to another tenant\'s listing', async () => {
      ReqContext.tenantId = 'tenant-a';
      ReqContext.userRole = 'TENANT_ADMIN';

      const mockRequest = {
        params: { id: 'listing-from-tenant-b' },
      } as any;

      const handler = () => undefined;
      Reflect.defineMetadata('idorProtection', 'Listing', handler);

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
        getHandler: () => handler,
      } as ExecutionContext;

      prismaService.listing.findUnique = jest.fn().mockResolvedValue(null);

      await expect(guard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    });
  });
});

/**
 * Helper function to run IDOR tests for new controllers
 * 
 * Usage:
 * ```typescript
 * testIdorProtection('QrCode', 'tenant-a', 'qr-code-1', async () => {
 *   await controller.getQRCodeById('qr-code-1');
 * });
 * ```
 */
export async function testIdorProtection(
  entityType: string,
  userTenantId: string,
  resourceId: string,
  action: () => Promise<any>,
  expectedResult: 'allow' | 'deny' = 'allow',
): Promise<void> {
  // Set up context
  ReqContext.tenantId = userTenantId;
  ReqContext.userRole = 'TENANT_ADMIN';
  ReqContext.userId = 'test-user';

  try {
    await action();
    if (expectedResult === 'deny') {
      throw new Error('Expected action to be denied, but it was allowed');
    }
  } catch (error) {
    if (expectedResult === 'allow' && error instanceof ForbiddenException) {
      throw new Error(`Expected action to be allowed, but got ForbiddenException: ${error.message}`);
    }
    if (expectedResult === 'deny' && !(error instanceof ForbiddenException)) {
      throw error; // Re-throw if it's not the expected error
    }
  }
}
