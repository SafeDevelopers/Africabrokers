#!/usr/bin/env node

/**
 * Smoke test for marketplace API
 * Tests public listings endpoint with X-Tenant header
 */

const https = require('https');
const http = require('http');

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_CORE_API_BASE_URL;
const DEFAULT_TENANT = process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'et-addis';

async function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, data, headers: res.headers });
      });
    });
    req.on('error', reject);
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        req.setHeader(key, value);
      });
    }
    req.end();
  });
}

async function main() {
  console.log('🧪 Testing marketplace API...\n');

  if (!API_BASE_URL) {
    console.error('❌ NEXT_PUBLIC_API_BASE_URL is not set');
    process.exit(1);
  }
  console.log(`✅ API Base URL: ${API_BASE_URL}`);
  console.log(`✅ Default Tenant: ${DEFAULT_TENANT}\n`);

  // Test public listings endpoint
  const listingsUrl = `${API_BASE_URL}/v1/marketplace/listings?limit=1`;
  console.log(`Testing public listings endpoint: ${listingsUrl}`);
  
  try {
    const response = await fetch(listingsUrl, {
      headers: {
        'Accept': 'application/json',
        'X-Tenant': DEFAULT_TENANT,
      },
    });

    if (response.status === 200) {
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('application/json')) {
        console.error(`❌ Expected JSON response, got ${contentType}`);
        process.exit(1);
      }

      const data = JSON.parse(response.data);
      console.log('✅ Public listings endpoint is accessible');
      console.log(`   Response contains: ${data.items ? 'items array' : 'no items array'}`);
      console.log(`   Total count: ${data.count || 0}`);
    } else {
      console.error(`❌ Listings endpoint returned status ${response.status}`);
      console.error(`   Response: ${response.data.substring(0, 200)}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Failed to reach listings endpoint: ${error.message}`);
    process.exit(1);
  }

  console.log('\n✅ All marketplace API tests passed!');
}

main().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

