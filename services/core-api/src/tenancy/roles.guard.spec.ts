import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockContext = (user: any, requiredRoles?: string[]): ExecutionContext => {
    const request = { user };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    // Mock reflector to return required roles
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

    return context;
  };

  describe('SUPER_ADMIN routes', () => {
    it('should allow SUPER_ADMIN to access SUPER_ADMIN routes', () => {
      const context = createMockContext(
        { id: '1', role: 'SUPER_ADMIN', tenantId: 'tenant1' },
        ['SUPER_ADMIN'],
      );
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should block TENANT_ADMIN from SUPER_ADMIN routes (per RBAC-MATRIX.md)', () => {
      const context = createMockContext(
        { id: '2', role: 'TENANT_ADMIN', tenantId: 'tenant1' },
        ['SUPER_ADMIN'],
      );
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Access denied. Required role: SUPER_ADMIN');
    });

    it('should block AGENT from SUPER_ADMIN routes', () => {
      const context = createMockContext(
        { id: '3', role: 'AGENT', tenantId: 'tenant1' },
        ['SUPER_ADMIN'],
      );
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('TENANT_ADMIN routes', () => {
    it('should allow TENANT_ADMIN to access TENANT_ADMIN routes', () => {
      const context = createMockContext(
        { id: '1', role: 'TENANT_ADMIN', tenantId: 'tenant1' },
        ['TENANT_ADMIN', 'AGENT'],
      );
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow AGENT to access TENANT_ADMIN routes', () => {
      const context = createMockContext(
        { id: '2', role: 'AGENT', tenantId: 'tenant1' },
        ['TENANT_ADMIN', 'AGENT'],
      );
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow SUPER_ADMIN to access TENANT_ADMIN routes (SUPER_ADMIN has access to everything)', () => {
      const context = createMockContext(
        { id: '3', role: 'SUPER_ADMIN', tenantId: 'tenant1' },
        ['TENANT_ADMIN', 'AGENT'],
      );
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('Unauthenticated requests', () => {
    it('should throw ForbiddenException in production when user is not authenticated', () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';
        
        const context = createMockContext(null, ['TENANT_ADMIN']);
        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        expect(() => guard.canActivate(context)).toThrow('User not authenticated');
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });
});

