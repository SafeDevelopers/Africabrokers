#!/usr/bin/env node

/**
 * Smoke test for admin app authentication
 * Validates NEXTAUTH_URL and KEYCLOAK_ISSUER configuration
 */

const https = require('https');
const http = require('http');

const NEXTAUTH_URL = process.env.NEXTAUTH_URL;
const KEYCLOAK_ISSUER = process.env.KEYCLOAK_ISSUER || 'https://keycloak.afribrok.com/realms/afribrok';

async function fetch(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, data, headers: res.headers });
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('🧪 Testing admin app authentication configuration...\n');

  // Check env vars
  if (!NEXTAUTH_URL) {
    console.error('❌ NEXTAUTH_URL is not set');
    process.exit(1);
  }
  console.log(`✅ NEXTAUTH_URL: ${NEXTAUTH_URL}`);

  if (!KEYCLOAK_ISSUER) {
    console.error('❌ KEYCLOAK_ISSUER is not set');
    process.exit(1);
  }
  console.log(`✅ KEYCLOAK_ISSUER: ${KEYCLOAK_ISSUER}\n`);

  // Test Keycloak well-known endpoint
  const wellKnownUrl = `${KEYCLOAK_ISSUER}/.well-known/openid-configuration`;
  console.log(`Testing Keycloak well-known endpoint: ${wellKnownUrl}`);
  
  try {
    const response = await fetch(wellKnownUrl);
    if (response.status === 200) {
      const config = JSON.parse(response.data);
      console.log('✅ Keycloak well-known endpoint is reachable');
      console.log(`   Issuer: ${config.issuer}`);
      console.log(`   Authorization endpoint: ${config.authorization_endpoint}`);
    } else {
      console.error(`❌ Keycloak well-known endpoint returned status ${response.status}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Failed to reach Keycloak well-known endpoint: ${error.message}`);
    process.exit(1);
  }

  console.log('\n✅ All authentication tests passed!');
}

main().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

