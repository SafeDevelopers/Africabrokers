import {
  IsObject,
  ValidateNested,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsEnum,
  IsUrl,
  MinLength,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PlatformSettings,
  BrandingSettings,
  LocalizationSettings,
  SecuritySettings,
  TenancySettings,
  MarketplaceSettings,
  PaymentsSettings,
  IntegrationsSettings,
  ObservabilitySettings,
  LegalSettings,
} from './platform-settings.types';

export class BrandingSettingsDto implements BrandingSettings {
  @IsString()
  siteName!: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  faviconUrl?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @IsOptional()
  @IsEnum(['light', 'dark', 'auto'])
  theme?: 'light' | 'dark' | 'auto';
}

export class LocalizationSettingsDto implements LocalizationSettings {
  @IsString()
  defaultLocale!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  supportedLocales!: string[];

  @IsString()
  currency!: string;

  @IsString()
  timezone!: string;

  @IsString()
  dateFormat!: string;

  @IsString()
  timeFormat!: string;
}

export class SecuritySettingsDto implements SecuritySettings {
  @IsBoolean()
  require2FA!: boolean;

  @IsNumber()
  @Min(5)
  @Max(1440)
  sessionTimeout!: number;

  @IsNumber()
  @Min(6)
  @Max(128)
  passwordMinLength!: number;

  @IsBoolean()
  passwordRequireUppercase!: boolean;

  @IsBoolean()
  passwordRequireLowercase!: boolean;

  @IsBoolean()
  passwordRequireNumbers!: boolean;

  @IsBoolean()
  passwordRequireSpecialChars!: boolean;

  @IsNumber()
  @Min(3)
  @Max(10)
  maxLoginAttempts!: number;

  @IsNumber()
  @Min(1)
  @Max(60)
  lockoutDuration!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ipAllowlist?: string[];
}

export class TenancySettingsDto implements TenancySettings {
  @IsBoolean()
  allowMultiTenant!: boolean;

  @IsOptional()
  @IsString()
  defaultTenantId?: string;

  @IsEnum(['strict', 'relaxed'])
  tenantIsolationLevel!: 'strict' | 'relaxed';
}

export class MarketplaceSettingsDto implements MarketplaceSettings {
  @IsBoolean()
  enableSellPageLeads!: boolean;

  @IsBoolean()
  enablePublicListings!: boolean;

  @IsBoolean()
  requireBrokerVerification!: boolean;

  @IsBoolean()
  listingApprovalRequired!: boolean;
}

export class PaymentsSettingsDto implements PaymentsSettings {
  @IsOptional()
  @IsString()
  defaultPaymentProvider?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  supportedCurrencies!: string[];

  @IsBoolean()
  enableSubscriptions!: boolean;

  @IsBoolean()
  enableInvoicing!: boolean;
}

export class IntegrationsSettingsDto implements IntegrationsSettings {
  @IsOptional()
  @IsUrl()
  webhookUrl?: string;

  @IsOptional()
  @IsString()
  webhookSecret?: string;

  @IsOptional()
  @IsString()
  emailProvider?: string;

  @IsOptional()
  @IsString()
  smsProvider?: string;

  @IsBoolean()
  analyticsEnabled!: boolean;
}

export class ObservabilitySettingsDto implements ObservabilitySettings {
  @IsBoolean()
  enableLogging!: boolean;

  @IsEnum(['debug', 'info', 'warn', 'error'])
  logLevel!: 'debug' | 'info' | 'warn' | 'error';

  @IsBoolean()
  enableMetrics!: boolean;

  @IsBoolean()
  enableTracing!: boolean;
}

export class LegalSettingsDto implements LegalSettings {
  @IsOptional()
  @IsUrl()
  termsOfServiceUrl?: string;

  @IsOptional()
  @IsUrl()
  privacyPolicyUrl?: string;

  @IsOptional()
  @IsUrl()
  cookiePolicyUrl?: string;

  @IsBoolean()
  gdprCompliant!: boolean;
}

export class PlatformSettingsDto implements PlatformSettings {
  @ValidateNested()
  @Type(() => BrandingSettingsDto)
  branding!: BrandingSettingsDto;

  @ValidateNested()
  @Type(() => LocalizationSettingsDto)
  localization!: LocalizationSettingsDto;

  @ValidateNested()
  @Type(() => SecuritySettingsDto)
  security!: SecuritySettingsDto;

  @ValidateNested()
  @Type(() => TenancySettingsDto)
  tenancy!: TenancySettingsDto;

  @ValidateNested()
  @Type(() => MarketplaceSettingsDto)
  marketplace!: MarketplaceSettingsDto;

  @ValidateNested()
  @Type(() => PaymentsSettingsDto)
  payments!: PaymentsSettingsDto;

  @ValidateNested()
  @Type(() => IntegrationsSettingsDto)
  integrations!: IntegrationsSettingsDto;

  @ValidateNested()
  @Type(() => ObservabilitySettingsDto)
  observability!: ObservabilitySettingsDto;

  @ValidateNested()
  @Type(() => LegalSettingsDto)
  legal!: LegalSettingsDto;
}

