/**
 * Platform Settings Types
 * Ethiopia-friendly defaults specified in our plan
 */

export interface BrandingSettings {
  siteName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export interface LocalizationSettings {
  defaultLocale: string;
  supportedLocales: string[];
  currency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
}

export interface SecuritySettings {
  require2FA: boolean;
  sessionTimeout: number; // minutes
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  ipAllowlist?: string[]; // Optional IP allowlist
  rateLimits?: {
    authRPM?: number; // Auth endpoints per minute
    publicRPM?: number; // Public endpoints per minute
  };
}

export interface TenancySettings {
  allowMultiTenant: boolean;
  defaultTenantId?: string;
  tenantIsolationLevel: 'strict' | 'relaxed';
  brokerKyc?: {
    requiredDocs?: string[]; // e.g., ['license', 'id', 'selfie']
  };
  license?: {
    pattern?: string; // Regex pattern for license number validation
    defaultExpiryMonths?: number; // Default expiry in months
    qrSignature?: 'signed-ttl' | 'none'; // QR signature type
  };
  inspector?: {
    offlineAllowed?: boolean; // Allow offline replay usage
  };
}

export interface MarketplaceSettings {
  enableSellPageLeads: boolean;
  enablePublicListings: boolean;
  requireBrokerVerification: boolean;
  listingApprovalRequired: boolean;
  review?: {
    prePublish?: boolean; // Require review before publishing listing
  };
}

export interface PaymentsSettings {
  defaultPaymentProvider?: string;
  supportedCurrencies: string[];
  enableSubscriptions: boolean;
  enableInvoicing: boolean;
}

export interface IntegrationsSettings {
  webhookUrl?: string;
  webhookSecret?: string;
  emailProvider?: string;
  smsProvider?: string;
  analyticsEnabled: boolean;
}

export interface ObservabilitySettings {
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableMetrics: boolean;
  enableTracing: boolean;
}

export interface LegalSettings {
  termsOfServiceUrl?: string;
  privacyPolicyUrl?: string;
  cookiePolicyUrl?: string;
  gdprCompliant: boolean;
}

export interface PlatformSettings {
  branding: BrandingSettings;
  localization: LocalizationSettings;
  security: SecuritySettings;
  tenancy: TenancySettings;
  marketplace: MarketplaceSettings;
  payments: PaymentsSettings;
  integrations: IntegrationsSettings;
  observability: ObservabilitySettings;
  legal: LegalSettings;
}

/**
 * Default platform settings (Ethiopia-friendly defaults)
 */
export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  branding: {
    siteName: 'AfriBrok',
    theme: 'light',
  },
  localization: {
    defaultLocale: 'en-ET',
    supportedLocales: ['en-ET', 'am-ET'],
    currency: 'ETB',
    timezone: 'Africa/Addis_Ababa',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
  },
  security: {
    require2FA: false,
    sessionTimeout: 60,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: false,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    rateLimits: {
      authRPM: 60,
      publicRPM: 100,
    },
  },
  tenancy: {
    allowMultiTenant: true,
    tenantIsolationLevel: 'strict',
    brokerKyc: {
      requiredDocs: ['license', 'id', 'selfie'],
    },
    license: {
      pattern: '^[A-Z]{2,3}-[A-Z]{2}-\\d{4,6}$',
      defaultExpiryMonths: 12,
      qrSignature: 'none',
    },
    inspector: {
      offlineAllowed: true,
    },
  },
  marketplace: {
    enableSellPageLeads: false,
    enablePublicListings: true,
    requireBrokerVerification: true,
    listingApprovalRequired: true,
    review: {
      prePublish: true,
    },
  },
  payments: {
    supportedCurrencies: ['ETB', 'USD'],
    enableSubscriptions: true,
    enableInvoicing: true,
  },
  integrations: {
    analyticsEnabled: true,
  },
  observability: {
    enableLogging: true,
    logLevel: 'info',
    enableMetrics: true,
    enableTracing: false,
  },
  legal: {
    gdprCompliant: false,
  },
};

