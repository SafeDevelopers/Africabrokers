import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface KeycloakUser {
  id?: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  emailVerified: boolean;
  credentials?: Array<{
    type: string;
    value: string;
    temporary: boolean;
  }>;
}

interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
}

@Injectable()
export class KeycloakService {
  private readonly logger = new Logger(KeycloakService.name);
  private adminToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private configService: ConfigService) {}

  private getKeycloakBaseUrl(): string {
    const issuerUrl = this.configService.get<string>('KEYCLOAK_ISSUER');
    if (!issuerUrl) {
      throw new BadRequestException('KEYCLOAK_ISSUER is not configured');
    }
    // Extract base URL from issuer (e.g., https://keycloak.afribrok.com/realms/afribrok -> https://keycloak.afribrok.com)
    const url = new URL(issuerUrl);
    return `${url.protocol}//${url.host}`;
  }

  private getRealm(): string {
    const realm = this.configService.get<string>('KEYCLOAK_REALM');
    if (realm) {
      return realm;
    }
    // Fallback: Extract realm from issuer URL if KEYCLOAK_REALM is not set
    const issuerUrl = this.configService.get<string>('KEYCLOAK_ISSUER');
    if (!issuerUrl) {
      throw new BadRequestException('KEYCLOAK_ISSUER or KEYCLOAK_REALM is not configured');
    }
    // Extract realm from issuer URL (e.g., https://keycloak.afribrok.com/realms/afribrok -> afribrok)
    const match = issuerUrl.match(/\/realms\/([^/]+)/);
    return match ? match[1] : 'master';
  }

  private async getAdminToken(): Promise<string> {
    // Check if token is still valid (with 5 minute buffer)
    if (this.adminToken && Date.now() < this.tokenExpiry - 5 * 60 * 1000) {
      return this.adminToken;
    }

    const baseUrl = this.getKeycloakBaseUrl();
    const realm = this.getRealm();
    const adminUsername = this.configService.get<string>('KEYCLOAK_ADMIN') || 'admin';
    const adminPassword = this.configService.get<string>('KEYCLOAK_ADMIN_PASSWORD');

    if (!adminPassword) {
      this.logger.warn('KEYCLOAK_ADMIN_PASSWORD not set, skipping Keycloak user creation');
      throw new BadRequestException('Keycloak admin password not configured');
    }

    try {
      const response = await fetch(`${baseUrl}/realms/master/protocol/openid-connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: 'admin-cli',
          username: adminUsername,
          password: adminPassword,
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

  async createUser(
    email: string,
    role: string,
    firstName?: string,
    lastName?: string,
    temporaryPassword?: string,
  ): Promise<string> {
    try {
      const token = await this.getAdminToken();
      const baseUrl = this.getKeycloakBaseUrl();
      const realm = this.getRealm();

      const user: KeycloakUser = {
        username: email,
        email,
        firstName: firstName || email.split('@')[0],
        lastName: lastName || '',
        enabled: true,
        emailVerified: true,
      };

      if (temporaryPassword) {
        user.credentials = [
          {
            type: 'password',
            value: temporaryPassword,
            temporary: true, // User must change password on first login
          },
        ];
      }

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
          if (existingUser) {
            return existingUser.id!;
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
          // Assign role to user
          await this.assignRoleToUser(userId, role);
          return userId;
        }
      }

      // Fallback: find user by email
      const createdUser = await this.findUserByEmail(email);
      if (createdUser?.id) {
        await this.assignRoleToUser(createdUser.id, role);
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

  async assignRoleToUser(userId: string, role: string): Promise<void> {
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
        this.logger.warn(`Role ${role} not found in Keycloak, skipping role assignment`);
        return;
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
        this.logger.warn(`Failed to assign role ${role} to user: ${errorText}`);
        // Don't throw - role assignment failure shouldn't block user creation
      } else {
        this.logger.log(`Assigned role ${role} to user ${userId}`);
      }
    } catch (error) {
      this.logger.error('Error assigning role to user:', error);
      // Don't throw - role assignment failure shouldn't block user creation
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      const token = await this.getAdminToken();
      const baseUrl = this.getKeycloakBaseUrl();
      const realm = this.getRealm();

      const user = await this.findUserByEmail(email);
      if (!user?.id) {
        throw new BadRequestException('User not found in Keycloak');
      }

      const response = await fetch(
        `${baseUrl}/admin/realms/${realm}/users/${user.id}/execute-actions-email`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(['UPDATE_PASSWORD']),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Failed to send password reset email: ${errorText}`);
        throw new BadRequestException('Failed to send password reset email');
      }

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error sending password reset email:', error);
      throw new BadRequestException('Failed to send password reset email');
    }
  }

  async setUserPassword(userId: string, password: string, temporary: boolean = true): Promise<void> {
    try {
      const token = await this.getAdminToken();
      const baseUrl = this.getKeycloakBaseUrl();
      const realm = this.getRealm();

      const response = await fetch(
        `${baseUrl}/admin/realms/${realm}/users/${userId}/reset-password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: 'password',
            value: password,
            temporary,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Failed to set user password: ${errorText}`);
        throw new BadRequestException('Failed to set user password');
      }

      this.logger.log(`Password set for user ${userId}`);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error setting user password:', error);
      throw new BadRequestException('Failed to set user password');
    }
  }
}

