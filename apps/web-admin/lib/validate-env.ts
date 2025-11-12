/**
 * Environment variable validation for web-admin
 * Validates required env vars at build/start time
 */

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_API_BASE_URL',
] as const;

const RECOMMENDED_ENV_VARS = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'KEYCLOAK_ISSUER',
  'KEYCLOAK_CLIENT_ID',
] as const;

const OPTIONAL_ENV_VARS = [
  'NEXT_PUBLIC_CORE_API_BASE_URL',
  'NEXT_PUBLIC_VERIFY_BASE_URL',
  'NEXT_PUBLIC_TENANT_KEY',
  'NEXT_PUBLIC_DEFAULT_TENANT',
  'NEXT_PUBLIC_APP_BASE_URL',
  'KEYCLOAK_CLIENT_SECRET',
  'NODE_ENV',
] as const;

export function validateEnv(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required env vars
  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Check recommended env vars (warn in dev, error in production)
  for (const key of RECOMMENDED_ENV_VARS) {
    if (!process.env[key]) {
      if (process.env.NODE_ENV === 'production') {
        missing.push(key);
      } else {
        warnings.push(`Recommended env var ${key} is not set. This may cause issues in production.`);
      }
    }
  }

  // Check for common typos or duplicates
  const envKeys = Object.keys(process.env);
  
  // Check for NEXT_PUBLIC_API_BASE_URL vs NEXT_PUBLIC_CORE_API_BASE_URL
  if (process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NEXT_PUBLIC_CORE_API_BASE_URL) {
    if (process.env.NEXT_PUBLIC_API_BASE_URL !== process.env.NEXT_PUBLIC_CORE_API_BASE_URL) {
      warnings.push(
        `NEXT_PUBLIC_API_BASE_URL (${process.env.NEXT_PUBLIC_API_BASE_URL}) and ` +
        `NEXT_PUBLIC_CORE_API_BASE_URL (${process.env.NEXT_PUBLIC_CORE_API_BASE_URL}) have different values. ` +
        `Consider using only NEXT_PUBLIC_API_BASE_URL.`
      );
    }
  }

  // Check NEXTAUTH_URL matches current origin (dev warning only)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    const currentOrigin = window.location.origin;
    if (nextAuthUrl && nextAuthUrl !== currentOrigin) {
      console.warn(
        `⚠️  NEXTAUTH_URL (${nextAuthUrl}) does not match current origin (${currentOrigin}). ` +
        `This may cause redirect issues.`
      );
    }
  }

  // Check KEYCLOAK_ISSUER matches expected format (dev warning only)
  if (process.env.KEYCLOAK_ISSUER && process.env.NODE_ENV === 'development') {
    const issuer = process.env.KEYCLOAK_ISSUER;
    if (!issuer.includes('/realms/')) {
      warnings.push(
        `KEYCLOAK_ISSUER (${issuer}) should include /realms/ path. ` +
        `Expected format: https://keycloak.afribrok.com/realms/afribrok`
      );
    }
  }

  // Print errors
  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach(key => {
      console.error(`   - ${key}`);
    });
    console.error('\n💡 Please set these in your .env.local file.');
    console.error('   See .env.example for reference.\n');
    process.exit(1);
  }

  // Print warnings
  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment variable warnings:');
    warnings.forEach(warning => {
      console.warn(`   ${warning}`);
    });
    console.warn('');
  }
}

// Auto-validate in non-test environments (only in Node.js context)
// This runs at build time via next.config.js
if (process.env.NODE_ENV !== 'test' && typeof window === 'undefined' && typeof require !== 'undefined') {
  validateEnv();
}

