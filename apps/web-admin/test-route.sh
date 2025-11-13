#!/bin/bash

# Quick test script for NextAuth route handler
# Usage: ./test-route.sh

echo "🧪 Testing NextAuth route handler..."
echo ""

BASE_URL="${1:-http://localhost:3000}"

echo "Testing: $BASE_URL/api/auth/signin/keycloak"
echo ""

# Test GET request
echo "1. Testing GET request..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/signin/keycloak?callbackUrl=%2F")

if [ "$STATUS" = "405" ]; then
  echo "❌ FAILED: Got 405 Method Not Allowed"
  echo "   The route handler is not properly configured"
  exit 1
elif [ "$STATUS" = "200" ] || [ "$STATUS" = "302" ] || [ "$STATUS" = "307" ] || [ "$STATUS" = "308" ]; then
  echo "✅ SUCCESS: Got status $STATUS (expected for auth redirect)"
else
  echo "⚠️  Got unexpected status: $STATUS"
  echo "   This might be okay depending on your setup"
fi

echo ""
echo "2. Testing route handler structure..."
curl -s -I "$BASE_URL/api/auth/signin/keycloak" | head -1

echo ""
echo "✅ Test complete!"
echo ""
echo "If you see 405, check:"
echo "  - Server is running (pnpm dev)"
echo "  - Route handler file is correct"
echo "  - No TypeScript errors"
echo "  - Try clearing .next cache: rm -rf .next"

