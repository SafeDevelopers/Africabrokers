import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

type UserRole = 'certified_broker' | 'agency' | 'individual_seller' | 'inspector' | 'regulator' | 'admin' | 'public';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async loginWithEmail(dto: { email: string; role?: string }) {
    const normalizedEmail = dto.email?.trim().toLowerCase();
    if (!normalizedEmail) {
      throw new BadRequestException('Email is required');
    }

    const expectedRole = dto.role?.toUpperCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check role match - allow if role matches or if no role specified
    if (expectedRole && user.role !== expectedRole) {
      throw new UnauthorizedException(
        `Role mismatch. User has role '${user.role}' but '${expectedRole}' was requested. Please select the correct role.`
      );
    }

    // For admin users (TENANT_ADMIN, AGENT), normalize role to 'admin' and include tenant slug
    const isAdminRole = user.role === 'TENANT_ADMIN' || user.role === 'AGENT';
    const jwtRole = isAdminRole ? 'admin' : user.role;
    
    // Get tenant slug for admin users
    const tenantSlug = user.tenant?.slug || null;
    
    if (isAdminRole && !tenantSlug) {
      throw new BadRequestException('Tenant slug is required for admin users');
    }

    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
    
    // Build JWT claims
    const claims: any = {
      sub: user.id,
      role: jwtRole,
    };
    
    // For admin users, include tenant slug
    if (isAdminRole && tenantSlug) {
      claims.tenant = tenantSlug;
    } else if (user.role !== 'SUPER_ADMIN') {
      // For non-admin, non-super-admin users, include tenantId for backward compatibility
      const tenantId = user.tenantId || user.tenant?.id || null;
      if (tenantId) {
        claims.tenantId = tenantId;
      }
    }
    
    const token = jwt.sign(claims, jwtSecret, { expiresIn: '12h' });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.authProviderId || user.email.split('@')[0],
      },
      tenant: user.tenant
        ? {
            id: user.tenant.id,
            slug: user.tenant.slug,
            name: user.tenant.name,
          }
        : null,
    };
  }

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
