#!/usr/bin/env node

/**
 * Environment variable validation script
 * Asserts required envs exist at runtime; logs warnings for missing ones
 */

const requiredVars = [
  'NEXT_PUBLIC_API_BASE_URL',
];

const recommendedVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'KEYCLOAK_ISSUER',
  'KEYCLOAK_CLIENT_ID',
  'NEXT_PUBLIC_DEFAULT_TENANT',
];

function main() {
  console.log('🧪 Validating environment variables...\n');

  const missing = [];
  const warnings = [];

  // Check required vars
  for (const key of requiredVars) {
    if (!process.env[key]) {
      missing.push(key);
    } else {
      console.log(`✅ ${key}: ${process.env[key]}`);
    }
  }

  // Check recommended vars
  for (const key of recommendedVars) {
    if (!process.env[key]) {
      warnings.push(key);
    } else {
      console.log(`✅ ${key}: ${process.env[key]}`);
    }
  }

  // Print results
  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Missing recommended environment variables:');
    warnings.forEach(key => console.warn(`   - ${key}`));
    console.warn('   These may cause issues in production.\n');
  }

  if (missing.length === 0 && warnings.length === 0) {
    console.log('\n✅ All environment variables are set!');
  }
}

main();

