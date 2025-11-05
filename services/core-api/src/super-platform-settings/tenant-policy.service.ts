import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Whitelist of allowed override paths
 * Only these paths can be overridden at the tenant level
 */
export const ALLOWED_TENANT_OVERRIDES = [
  'marketplace.review.prePublish',
  'lifecycle.autoExpireDays',
  'media.caps',
  // Add more allowed override paths as needed
] as const;

export type AllowedOverridePath = typeof ALLOWED_TENANT_OVERRIDES[number];

export interface TenantPolicyOverrides {
  'marketplace.review.prePublish'?: boolean;
  'lifecycle.autoExpireDays'?: number;
  'media.caps'?: {
    maxUploadSize?: number;
    maxFiles?: number;
    allowedTypes?: string[];
  };
  [key: string]: any;
}

@Injectable()
export class TenantPolicyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get tenant policy for a tenant
   */
  async getTenantPolicy(tenantId: string): Promise<{
    version: number;
    overrides: TenantPolicyOverrides;
  } | null> {
    const policy = await this.prisma.tenantPolicy.findUnique({
      where: { tenantId },
    });

    if (!policy) {
      return null;
    }

    return {
      version: policy.version,
      overrides: policy.overrides as TenantPolicyOverrides,
    };
  }

  /**
   * Check if tenant has any overrides
   */
  async hasOverrides(tenantId: string): Promise<boolean> {
    const policy = await this.prisma.tenantPolicy.findUnique({
      where: { tenantId },
    });

    if (!policy) {
      return false;
    }

    const overrides = policy.overrides as TenantPolicyOverrides;
    return Object.keys(overrides).length > 0;
  }

  /**
   * Validate overrides against whitelist
   */
  validateOverrides(overrides: TenantPolicyOverrides): void {
    const overrideKeys = Object.keys(overrides);
    const invalidKeys = overrideKeys.filter(
      (key) => !ALLOWED_TENANT_OVERRIDES.includes(key as AllowedOverridePath),
    );

    if (invalidKeys.length > 0) {
      throw new Error(
        `Invalid override paths: ${invalidKeys.join(', ')}. Allowed paths: ${ALLOWED_TENANT_OVERRIDES.join(', ')}`,
      );
    }
  }

  /**
   * Update tenant policy
   */
  async updateTenantPolicy(
    tenantId: string,
    overrides: TenantPolicyOverrides,
    updatedBy: string,
  ): Promise<{ version: number; overrides: TenantPolicyOverrides }> {
    // Validate overrides
    this.validateOverrides(overrides);

    const existing = await this.prisma.tenantPolicy.findUnique({
      where: { tenantId },
    });

    const newVersion = existing ? existing.version + 1 : 1;

    const policy = await this.prisma.tenantPolicy.upsert({
      where: { tenantId },
      create: {
        tenantId,
        version: newVersion,
        overrides: overrides as any,
        updatedBy,
      },
      update: {
        version: newVersion,
        overrides: overrides as any,
        updatedBy,
      },
    });

    return {
      version: policy.version,
      overrides: policy.overrides as TenantPolicyOverrides,
    };
  }
}

