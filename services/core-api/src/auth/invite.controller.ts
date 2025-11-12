import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { KeycloakAdminService } from './keycloakAdmin.service';
import { Roles } from '../tenancy/roles.guard';

export class InviteBrokerDto {
  email!: string;
}

export class InviteTenantAdminDto {
  email!: string;
}

@Controller('invite')
export class InviteController {
  constructor(private readonly keycloakAdminService: KeycloakAdminService) {}

  @Post('broker')
  @Roles('SUPER_ADMIN', 'TENANT_ADMIN')
  async inviteBroker(@Body() dto: InviteBrokerDto) {
    if (!dto.email) {
      throw new BadRequestException('Email is required');
    }

    try {
      // Create user with email only, enabled=true
      const userId = await this.keycloakAdminService.createUser(dto.email);

      // Set required actions: VERIFY_EMAIL, UPDATE_PASSWORD
      await this.keycloakAdminService.setRequiredActions(userId, [
        'VERIFY_EMAIL',
        'UPDATE_PASSWORD',
      ]);

      // Assign realm role: BROKER
      await this.keycloakAdminService.assignRealmRole(userId, 'BROKER');

      // Execute actions email to send invite/reset link
      await this.keycloakAdminService.executeActionsEmail(userId, [
        'VERIFY_EMAIL',
        'UPDATE_PASSWORD',
      ]);

      return {
        success: true,
        message: 'Broker invitation sent successfully',
        userId,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to invite broker');
    }
  }

  @Post('tenant-admin')
  @Roles('SUPER_ADMIN')
  async inviteTenantAdmin(@Body() dto: InviteTenantAdminDto) {
    if (!dto.email) {
      throw new BadRequestException('Email is required');
    }

    try {
      // Create user with email only, enabled=true
      const userId = await this.keycloakAdminService.createUser(dto.email);

      // Set required actions: VERIFY_EMAIL, UPDATE_PASSWORD
      await this.keycloakAdminService.setRequiredActions(userId, [
        'VERIFY_EMAIL',
        'UPDATE_PASSWORD',
      ]);

      // Assign realm role: TENANT_ADMIN
      await this.keycloakAdminService.assignRealmRole(userId, 'TENANT_ADMIN');

      // Execute actions email to send invite/reset link
      await this.keycloakAdminService.executeActionsEmail(userId, [
        'VERIFY_EMAIL',
        'UPDATE_PASSWORD',
      ]);

      return {
        success: true,
        message: 'Tenant admin invitation sent successfully',
        userId,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to invite tenant admin');
    }
  }
}

