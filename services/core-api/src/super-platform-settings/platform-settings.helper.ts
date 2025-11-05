import { Injectable } from '@nestjs/common';
import { PlatformSettingsService } from './platform-settings.service';
import { TenantPolicyService } from './tenant-policy.service';
import { PlatformSettings } from './platform-settings.types';
import { TenantPolicyOverrides } from './tenant-policy.service';
import { ReqContext } from '../tenancy/req-scope.interceptor';

/**
 * Helper service to get platform settings with caching and tenant overrides
 * Use this in validators/guards/services to access settings
 * Resolution order: platform defaults -> tenant overrides -> runtime flags
 */
@Injectable()
export class PlatformSettingsHelper {
  private settingsCache: { settings: PlatformSettings; timestamp: number } | null = null;
  private readonly CACHE_TTL = 60 * 1000; // 1 minute cache

  constructor(
    private platformSettingsService: PlatformSettingsService,
    private tenantPolicyService: TenantPolicyService,
  ) {}

  /**
   * Get current platform settings (with caching)
   * Does NOT include tenant overrides - use getEffectiveSettings() for that
   */
  async getSettings(): Promise<PlatformSettings> {
    const now = Date.now();
    
    // Return cached settings if still valid
    if (
      this.settingsCache &&
      now - this.settingsCache.timestamp < this.CACHE_TTL
    ) {
      return this.settingsCache.settings;
    }

    // Fetch fresh settings
    const { settings } = await this.platformSettingsService.get();
    
    // Update cache
    this.settingsCache = {
      settings,
      timestamp: now,
    };

    return settings;
  }

  /**
   * Get effective settings with tenant overrides applied
   * Resolution order: platform defaults -> tenant overrides -> runtime flags
   */
  async getEffectiveSettings(
    tenantId?: string,
  ): Promise<PlatformSettings> {
    // Get platform defaults
    const platformSettings = await this.getSettings();

    // If no tenant ID, return platform settings only
    const effectiveTenantId = tenantId || ReqContext.tenantId;
    if (!effectiveTenantId) {
      return platformSettings;
    }

    // Get tenant overrides
    const tenantPolicy = await this.tenantPolicyService.getTenantPolicy(
      effectiveTenantId,
    );

    if (!tenantPolicy || Object.keys(tenantPolicy.overrides).length === 0) {
      return platformSettings;
    }

    // Apply tenant overrides using deep merge
    return this.applyOverrides(platformSettings, tenantPolicy.overrides);
  }

  /**
   * Apply tenant overrides to platform settings using deep merge
   */
  private applyOverrides(
    platformSettings: PlatformSettings,
    overrides: TenantPolicyOverrides,
  ): PlatformSettings {
    const result = JSON.parse(JSON.stringify(platformSettings)); // Deep clone

    for (const [path, value] of Object.entries(overrides)) {
      this.setNestedValue(result, path, value);
    }

    return result;
  }

  /**
   * Set a nested value in an object using dot notation path
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Check if tenant has overrides
   */
  async hasTenantOverrides(tenantId?: string): Promise<boolean> {
    const effectiveTenantId = tenantId || ReqContext.tenantId;
    if (!effectiveTenantId) {
      return false;
    }

    return this.tenantPolicyService.hasOverrides(effectiveTenantId);
  }

  /**
   * Clear settings cache (call after settings update)
   */
  clearCache(): void {
    this.settingsCache = null;
  }
}

