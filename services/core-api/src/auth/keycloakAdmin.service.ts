import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface KeycloakUser {
  id?: string;
  username: string;
  email: string;
  enabled: boolean;
  emailVerified: boolean;
  requiredActions?: string[];
}

interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
}

@Injectable()
export class KeycloakAdminService {
  private readonly logger = new Logger(KeycloakAdminService.name);
  private adminToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private configService: ConfigService) {}

  private getKeycloakBaseUrl(): string {
    const baseUrl = this.configService.get<string>('KC_BASE');
    if (!baseUrl) {
      throw new BadRequestException('KC_BASE is not configured');
    }
    return baseUrl;
  }

  private getRealm(): string {
    const realm = this.configService.get<string>('KC_REALM');
    if (!realm) {
      throw new BadRequestException('KC_REALM is not configured');
    }
    return realm;
  }

  private async getAdminToken(): Promise<string> {
    // Check if token is still valid (with 5 minute buffer)
    if (this.adminToken && Date.now() < this.tokenExpiry - 5 * 60 * 1000) {
      return this.adminToken;
    }

    const baseUrl = this.getKeycloakBaseUrl();
    const realm = this.getRealm();
    const clientId = this.configService.get<string>('KC_ADMIN_CLIENT_ID');
    const clientSecret = this.configService.get<string>('KC_ADMIN_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new BadRequestException('KC_ADMIN_CLIENT_ID and KC_ADMIN_CLIENT_SECRET must be configured');
    }

    try {
      const response = await fetch(`${baseUrl}/realms/${realm}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Failed to get Keycloak admin token: ${errorText}`);
        throw new BadRequestException('Failed to authenticate with Keycloak');
      }

      const data: KeycloakTokenResponse = await response.json();
      this.adminToken = data.access_token;
      this.tokenExpiry = Date.now() + data.expires_in * 1000;

      return this.adminToken;
    } catch (error) {
      this.logger.error('Error getting Keycloak admin token:', error);
      throw new BadRequestException('Failed to connect to Keycloak');
    }
  }

  /**
   * Create a user in Keycloak with email only, enabled=true
   */
  async createUser(email: string): Promise<string> {
    try {
      const token = await this.getAdminToken();
      const baseUrl = this.getKeycloakBaseUrl();
      const realm = this.getRealm();

      const user: KeycloakUser = {
        username: email,
        email,
        enabled: true,
        emailVerified: false,
      };

      // Create user
      const createResponse = await fetch(`${baseUrl}/admin/realms/${realm}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      if (!createResponse.ok) {
        if (createResponse.status === 409) {
          // User already exists, find and return existing user ID
          this.logger.log(`User ${email} already exists in Keycloak, finding user...`);
          const existingUser = await this.findUserByEmail(email);
          if (existingUser?.id) {
            return existingUser.id;
          }
        }
        const errorText = await createResponse.text();
        this.logger.error(`Failed to create Keycloak user: ${errorText}`);
        throw new BadRequestException(`Failed to create user in Keycloak: ${errorText}`);
      }

      // Get user ID from Location header
      const location = createResponse.headers.get('Location');
      if (location) {
        const userId = location.split('/').pop();
        if (userId) {
          return userId;
        }
      }

      // Fallback: find user by email
      const createdUser = await this.findUserByEmail(email);
      if (createdUser?.id) {
        return createdUser.id;
      }

      throw new BadRequestException('Failed to get created user ID from Keycloak');
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error creating Keycloak user:', error);
      throw new BadRequestException('Failed to create user in Keycloak');
    }
  }

  /**
   * Set required actions for a user (VERIFY_EMAIL, UPDATE_PASSWORD)
   */
  async setRequiredActions(userId: string, actions: string[]): Promise<void> {
    try {
      const token = await this.getAdminToken();
      const baseUrl = this.getKeycloakBaseUrl();
      const realm = this.getRealm();

      const response = await fetch(
        `${baseUrl}/admin/realms/${realm}/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            requiredActions: actions,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Failed to set required actions: ${errorText}`);
        throw new BadRequestException('Failed to set required actions');
      }

      this.logger.log(`Set required actions ${actions.join(', ')} for user ${userId}`);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error setting required actions:', error);
      throw new BadRequestException('Failed to set required actions');
    }
  }

  /**
   * Assign a realm role to a user (SUPER_ADMIN, TENANT_ADMIN, BROKER)
   */
  async assignRealmRole(userId: string, role: string): Promise<void> {
    try {
      const token = await this.getAdminToken();
      const baseUrl = this.getKeycloakBaseUrl();
      const realm = this.getRealm();

      // Get realm role
      const roleResponse = await fetch(
        `${baseUrl}/admin/realms/${realm}/roles/${role}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!roleResponse.ok) {
        const errorText = await roleResponse.text();
        this.logger.error(`Role ${role} not found in Keycloak: ${errorText}`);
        throw new BadRequestException(`Role ${role} not found in Keycloak`);
      }

      const roleData = await roleResponse.json();

      // Assign role to user
      const assignResponse = await fetch(
        `${baseUrl}/admin/realms/${realm}/users/${userId}/role-mappings/realm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify([roleData]),
        },
      );

      if (!assignResponse.ok) {
        const errorText = await assignResponse.text();
        this.logger.error(`Failed to assign role ${role} to user: ${errorText}`);
        throw new BadRequestException(`Failed to assign role ${role} to user`);
      }

      this.logger.log(`Assigned role ${role} to user ${userId}`);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error assigning role to user:', error);
      throw new BadRequestException('Failed to assign role to user');
    }
  }

  /**
   * Execute actions email to send invite/reset link
   */
  async executeActionsEmail(userId: string, actions: string[]): Promise<void> {
    try {
      const token = await this.getAdminToken();
      const baseUrl = this.getKeycloakBaseUrl();
      const realm = this.getRealm();

      const response = await fetch(
        `${baseUrl}/admin/realms/${realm}/users/${userId}/execute-actions-email`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(actions),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Failed to execute actions email: ${errorText}`);
        throw new BadRequestException('Failed to send email');
      }

      this.logger.log(`Sent actions email (${actions.join(', ')}) to user ${userId}`);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error executing actions email:', error);
      throw new BadRequestException('Failed to send email');
    }
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<KeycloakUser | null> {
    try {
      const token = await this.getAdminToken();
      const baseUrl = this.getKeycloakBaseUrl();
      const realm = this.getRealm();

      const response = await fetch(
        `${baseUrl}/admin/realms/${realm}/users?email=${encodeURIComponent(email)}&exact=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      const users: KeycloakUser[] = await response.json();
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      this.logger.error('Error finding Keycloak user:', error);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<KeycloakUser | null> {
    try {
      const token = await this.getAdminToken();
      const baseUrl = this.getKeycloakBaseUrl();
      const realm = this.getRealm();

      const response = await fetch(
        `${baseUrl}/admin/realms/${realm}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      this.logger.error('Error getting Keycloak user:', error);
      return null;
    }
  }

  /**
   * Toggle user enabled status
   */
  async toggleUserEnabled(userId: string): Promise<boolean> {
    try {
      const token = await this.getAdminToken();
      const baseUrl = this.getKeycloakBaseUrl();
      const realm = this.getRealm();

      // Get current user
      const user = await this.getUserById(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const newEnabledStatus = !user.enabled;

      // Update user
      const response = await fetch(
        `${baseUrl}/admin/realms/${realm}/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            enabled: newEnabledStatus,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Failed to toggle user enabled status: ${errorText}`);
        throw new BadRequestException('Failed to toggle user enabled status');
      }

      this.logger.log(`User ${userId} enabled status set to ${newEnabledStatus}`);
      return newEnabledStatus;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error toggling user enabled status:', error);
      throw new BadRequestException('Failed to toggle user enabled status');
    }
  }

  /**
   * Hard delete a user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const token = await this.getAdminToken();
      const baseUrl = this.getKeycloakBaseUrl();
      const realm = this.getRealm();

      const response = await fetch(
        `${baseUrl}/admin/realms/${realm}/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Failed to delete user: ${errorText}`);
        throw new BadRequestException('Failed to delete user');
      }

      this.logger.log(`Deleted user ${userId}`);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error deleting user:', error);
      throw new BadRequestException('Failed to delete user');
    }
  }
}

