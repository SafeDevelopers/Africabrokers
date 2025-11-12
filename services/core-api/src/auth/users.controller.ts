import { Controller, Post, Param, Delete, BadRequestException } from '@nestjs/common';
import { KeycloakAdminService } from './keycloakAdmin.service';
import { Roles } from '../tenancy/roles.guard';

@Controller('users')
@Roles('SUPER_ADMIN', 'TENANT_ADMIN')
export class UsersController {
  constructor(private readonly keycloakAdminService: KeycloakAdminService) {}

  @Post(':id/disable')
  async toggleUserEnabled(@Param('id') userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const enabled = await this.keycloakAdminService.toggleUserEnabled(userId);
      return {
        success: true,
        message: `User ${enabled ? 'enabled' : 'disabled'} successfully`,
        enabled,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to toggle user enabled status');
    }
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  async deleteUser(@Param('id') userId: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      await this.keycloakAdminService.deleteUser(userId);
      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete user');
    }
  }
}

