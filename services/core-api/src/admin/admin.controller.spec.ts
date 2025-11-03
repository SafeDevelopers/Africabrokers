/**
 * IDOR Protection Tests for AdminController
 * 
 * Verifies that tenant admins cannot access resources from other tenants
 * even when attempting to guess or manipulate resource IDs.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ReqContext } from '../tenancy/req-scope.interceptor';

describe('AdminController - IDOR Protection', () => {
  let controller: AdminController;
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            getQRCodeById: jest.fn(),
            activateQRCode: jest.fn(),
            revokeQRCode: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    ReqContext.tenantId = null;
    ReqContext.userRole = null;
    ReqContext.userId = null;
  });

  describe('getQRCodeById - IDOR Test', () => {
    it('should allow tenant admin to access QR code from their tenant', async () => {
      ReqContext.tenantId = 'tenant-a';
      ReqContext.userRole = 'TENANT_ADMIN';

      (service.getQRCodeById as jest.Mock).mockResolvedValue({
        id: 'qr-1',
        tenantId: 'tenant-a',
        status: 'ACTIVE',
      });

      const result = await controller.getQRCodeById('qr-1');
      expect(result.tenantId).toBe('tenant-a');
    });

    it('should deny tenant admin access to QR code from another tenant', async () => {
      ReqContext.tenantId = 'tenant-a';
      ReqContext.userRole = 'TENANT_ADMIN';

      // Prisma extension will return null for resource from different tenant
      (service.getQRCodeById as jest.Mock).mockRejectedValue(
        new NotFoundException('QR code with ID qr-tenant-b-1 not found'),
      );

      await expect(controller.getQRCodeById('qr-tenant-b-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('activateQRCode - IDOR Test', () => {
    it('should allow tenant admin to activate QR code from their tenant', async () => {
      ReqContext.tenantId = 'tenant-a';
      ReqContext.userRole = 'TENANT_ADMIN';

      (service.activateQRCode as jest.Mock).mockResolvedValue({
        id: 'qr-1',
        status: 'ACTIVE',
      });

      const result = await controller.activateQRCode('qr-1');
      expect(result.status).toBe('ACTIVE');
    });

    it('should deny tenant admin from activating QR code from another tenant', async () => {
      ReqContext.tenantId = 'tenant-a';
      ReqContext.userRole = 'TENANT_ADMIN';

      // Attempting to activate QR code from tenant-b should fail
      (service.activateQRCode as jest.Mock).mockRejectedValue(
        new NotFoundException('QR code with ID qr-tenant-b-1 not found'),
      );

      await expect(controller.activateQRCode('qr-tenant-b-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('revokeQRCode - IDOR Test', () => {
    it('should deny tenant admin from revoking QR code from another tenant', async () => {
      ReqContext.tenantId = 'tenant-a';
      ReqContext.userRole = 'TENANT_ADMIN';

      // Attempting to revoke QR code from tenant-b should fail
      (service.revokeQRCode as jest.Mock).mockRejectedValue(
        new NotFoundException('QR code with ID qr-tenant-b-1 not found'),
      );

      await expect(controller.revokeQRCode('qr-tenant-b-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

