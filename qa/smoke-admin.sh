#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=${1:-qa/env.sample.json}
if [[ ! -f "$ENV_FILE" ]]; then
  echo "[smoke-admin] env file not found: $ENV_FILE" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "[smoke-admin] jq is required" >&2
  exit 1
fi

API_BASE=$(jq -r '.API_BASE' "$ENV_FILE")
ADMIN_BASE=$(jq -r '.ADMIN_BASE' "$ENV_FILE")
TENANT=$(jq -r '.TENANT' "$ENV_FILE")
JWT_SUPER_ADMIN=$(jq -r '.JWT_SUPER_ADMIN' "$ENV_FILE")
JWT_TENANT_ADMIN=$(jq -r '.JWT_TENANT_ADMIN' "$ENV_FILE")

PASS=0
FAIL=0

function note() {
  echo "[smoke-admin] $*"
}

function pass() {
  echo "✅ $*"
  PASS=$((PASS+1))
}

function fail() {
  echo "❌ $*" >&2
  FAIL=$((FAIL+1))
}

function check_json_endpoint() {
  local label=$1
  local url=$2
  local token=$3
  local expected_status=$4

  local headers body status ctype
  headers=$(mktemp)
  body=$(mktemp)
  status=$(curl -sS -D "$headers" -o "$body" -w "%{http_code}" \
    -H "Authorization: Bearer $token" \
    -H "X-Tenant: $TENANT" \
    -H "x-tenant-id: $TENANT" \
    "$url") || status="000"
  ctype=$(grep -i '^content-type' "$headers" | tail -1 | cut -d' ' -f2- | tr -d '\r')

  # Normalize content-type to lowercase for comparison
  ctype_lower=$(echo "$ctype" | tr '[:upper:]' '[:lower:]')
  
  # Fail if /v1/* returns HTML or non-JSON content-type
  if [[ "$url" == *"/v1/"* ]]; then
    if [[ "$ctype_lower" != application/json* ]]; then
      fail "$label: /v1/* must return JSON, got '${ctype:-unknown}'"
      rm -f "$headers" "$body"
      return 1
    fi
    if grep -qi '<html' "$body"; then
      fail "$label: /v1/* returned HTML instead of JSON"
      rm -f "$headers" "$body"
      return 1
    fi
  fi

  if [[ "$status" != "$expected_status" ]]; then
    fail "$label expected $expected_status got $status"
  elif [[ "$ctype_lower" != application/json* ]]; then
    fail "$label expected JSON content-type, got '${ctype:-unknown}'"
  elif grep -qi '<html' "$body"; then
    fail "$label returned HTML instead of JSON"
  else
    local summary=$(jq 'if type=="object" and has("items") then (.items|length) else length end' "$body" 2>/dev/null || cat "$body")
    pass "$label status=$status"
  fi
  rm -f "$headers" "$body"
}

function check_admin_page() {
  local route=$1
  local url="$ADMIN_BASE$route"
  local body status
  body=$(mktemp)
  status=$(curl -sS -o "$body" -w "%{http_code}" -H "Cookie: afribrok-role=SUPER_ADMIN; afribrok-tenant=$TENANT" "$url") || status="000"
  if [[ "$status" == "404" || "$status" == "500" || "$status" == "000" ]]; then
    fail "admin page $route returned status $status"
  elif grep -qi 'not found' "$body" || grep -qi '<title>error' "$body"; then
    fail "admin page $route looks like an HTML error"
  else
    pass "admin page $route status=$status"
  fi
  rm -f "$body"
}

note "Checking core API status as SUPER_ADMIN"
check_json_endpoint "_status (SA)" "$API_BASE/v1/_status" "$JWT_SUPER_ADMIN" "200"

ADMIN_ROUTES=(
  "/"
  "/brokers"
  "/brokers/pending"
  "/brokers/verification"
  "/listings"
  "/listings/pending"
  "/reviews"
  "/payouts/pending"
  "/settings"
  "/settings/services"
  "/qr-codes"
  "/activity"
  "/reports"
  "/users"
  "/billing/invoices"
  "/verifications/pending"
  "/super"
  "/super/settings"
  "/super/agents"
  "/super/analytics"
  "/super/billing/plans"
  "/super/tenants"
)

note "Checking rendered admin pages"
for route in "${ADMIN_ROUTES[@]}"; do
  check_admin_page "$route"
done

note "Checking admin API collections with SUPER_ADMIN token"
ADMIN_ENDPOINTS=(
  "/v1/admin/reviews/pending"
  "/v1/admin/verifications/pending"
  "/v1/admin/payouts/pending"
)
for ep in "${ADMIN_ENDPOINTS[@]}"; do
  check_json_endpoint "${ep} (SA)" "$API_BASE$ep" "$JWT_SUPER_ADMIN" "200"
done

note "Checking RBAC: TENANT_ADMIN access (per RBAC-MATRIX.md)"
declare -A TA_EXPECTED=(
  ["/v1/admin/reviews/pending"]=200
  ["/v1/admin/verifications/pending"]=403
  ["/v1/admin/payouts/pending"]=200
  ["/v1/superadmin/tenants"]=403
  ["/v1/admin/settings"]=403
)
for ep in "${!TA_EXPECTED[@]}"; do
  check_json_endpoint "${ep} (TA)" "$API_BASE$ep" "$JWT_TENANT_ADMIN" "${TA_EXPECTED[$ep]}"
done

note "Checking RBAC: SUPER_ADMIN access (per RBAC-MATRIX.md)"
check_json_endpoint "/v1/superadmin/tenants (SA)" "$API_BASE/v1/superadmin/tenants" "$JWT_SUPER_ADMIN" "200"

note "Checking preflight OPTIONS for key routes"
function check_preflight() {
  local label=$1
  local url=$2
  local headers body status ctype
  headers=$(mktemp)
  body=$(mktemp)
  status=$(curl -sS -X OPTIONS -D "$headers" -o "$body" -w "%{http_code}" \
    -H "Origin: https://admin.afribrok.com" \
    -H "Access-Control-Request-Method: GET" \
    "$url") || status="000"
  ctype=$(grep -i '^content-type' "$headers" | tail -1 | cut -d' ' -f2- | tr -d '\r')
  ctype_lower=$(echo "$ctype" | tr '[:upper:]' '[:lower:]')
  
  if [[ "$status" != "200" ]]; then
    fail "$label OPTIONS expected 200 got $status"
  elif [[ "$ctype_lower" != application/json* ]]; then
    fail "$label OPTIONS must return JSON, got '${ctype:-unknown}'"
  elif grep -qi '<html' "$body"; then
    fail "$label OPTIONS returned HTML instead of JSON"
  else
    pass "$label OPTIONS status=$status"
  fi
  rm -f "$headers" "$body"
}

check_preflight "/v1/admin/reviews/pending" "$API_BASE/v1/admin/reviews/pending"
check_preflight "/v1/superadmin/tenants" "$API_BASE/v1/superadmin/tenants"

note "Finished: $PASS passed, $FAIL failed"
[[ $FAIL -eq 0 ]]
