import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type UserRole = 'certified_broker' | 'agency' | 'individual_seller' | 'inspector' | 'regulator' | 'admin' | 'public';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async handleOidcCallback(code: string, state?: string) {
    // TODO: Implement OIDC callback handling
    // 1. Exchange code for token
    // 2. Get user info from OIDC provider
    // 3. Create or update user in database
    // 4. Return session token
    return {
      success: true,
      message: 'OIDC callback handling not yet implemented',
      sessionToken: 'mock-session-token'
    };
  }

  async selectUserRole(userId: string, role: UserRole) {
    // Update user role selection
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return {
      success: true,
      user: {
        id: user.id,
        role: user.role,
      }
    };
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: true,
        brokers: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      role: user.role,
      tenant: user.tenant,
      kycStatus: user.kycStatus,
      mfaEnabled: user.mfaEnabled,
      brokers: user.brokers,
    };
  }
}