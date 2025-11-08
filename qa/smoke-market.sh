#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=${1:-qa/env.sample.json}
if [[ ! -f "$ENV_FILE" ]]; then
  echo "[smoke-market] env file not found: $ENV_FILE" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "[smoke-market] jq is required" >&2
  exit 1
fi

API_BASE=$(jq -r '.API_BASE' "$ENV_FILE")
MARKET_BASE=$(jq -r '.MARKET_BASE' "$ENV_FILE")
TENANT=$(jq -r '.TENANT' "$ENV_FILE")
JWT_BROKER=$(jq -r '.JWT_BROKER' "$ENV_FILE")

PASS=0
FAIL=0

function note() { echo "[smoke-market] $*"; }
function pass() { echo "✅ $*"; PASS=$((PASS+1)); }
function fail() { echo "❌ $*" >&2; FAIL=$((FAIL+1)); }

function check_page() {
  local route=$1
  local url="$MARKET_BASE$route"
  local body status final
  body=$(mktemp)
  read -r status final < <(curl -sS -L -o "$body" -w "%{http_code} %{url_effective}" "$url" || echo "000 $url")
  if [[ "$status" == "404" || "$status" == "500" || "$status" == "000" ]]; then
    fail "page $route status=$status"
  elif grep -qi '<title>sign in' "$body" || grep -qi '/login' <<<"$final"; then
    fail "page $route redirected to login ($final)"
  else
    pass "page $route status=$status final=${final}" 
  fi
  rm -f "$body"
}

function check_api() {
  local label=$1
  local endpoint=$2
  local token=$3
  local expected_csv=$4
  local headers body status ctype
  headers=$(mktemp)
  body=$(mktemp)
  local auth_args=()
  if [[ -n "$token" ]]; then
    auth_args=(-H "Authorization: Bearer $token" -H "X-Tenant: $TENANT" -H "x-tenant-id: $TENANT")
  fi
  status=$(curl -sS -D "$headers" -o "$body" -w "%{http_code}" "${auth_args[@]}" "$API_BASE$endpoint" || echo "000")
  ctype=$(grep -i '^content-type' "$headers" | tail -1 | cut -d' ' -f2- | tr -d '\r')
  ctype_lower=$(echo "$ctype" | tr '[:upper:]' '[:lower:]')
  
  # Fail if /v1/* returns HTML or non-JSON content-type
  if [[ "$endpoint" == "/v1/"* ]]; then
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
  
  local ok=1
  IFS=',' read -ra allowed <<<"$expected_csv"
  for cand in "${allowed[@]}"; do
    if [[ "$status" == "$cand" ]]; then ok=0; break; fi
  done
  if [[ $ok -ne 0 ]]; then
    fail "$label expected [$expected_csv] got $status"
  elif [[ "$ctype_lower" != application/json* ]]; then
    fail "$label expected JSON got '${ctype:-unknown}'"
  elif grep -qi '<html' "$body"; then
    fail "$label returned HTML"
  else
    pass "$label status=$status"
  fi
  rm -f "$headers" "$body"
}

note "Checking marketplace public pages"
MARKET_PAGES=(
  "/"
  "/search?q=verified"
  "/listings"
  "/listings/sample-listing"
)
for route in "${MARKET_PAGES[@]}"; do
  check_page "$route"
done

note "Checking RBAC: broker APIs (per RBAC-MATRIX.md)"
check_api "broker inquiries (BROKER)" "/v1/broker/inquiries" "$JWT_BROKER" "200"
check_api "broker inquiries (PUBLIC)" "/v1/broker/inquiries" "" "401,403"

note "Checking marketplace listings endpoint structure"
function check_listings_structure() {
  local label=$1
  local endpoint=$2
  local token=$3
  local headers body status ctype
  headers=$(mktemp)
  body=$(mktemp)
  local auth_args=()
  if [[ -n "$token" ]]; then
    auth_args=(-H "Authorization: Bearer $token" -H "X-Tenant: $TENANT" -H "x-tenant-id: $TENANT")
  fi
  status=$(curl -sS -D "$headers" -o "$body" -w "%{http_code}" "${auth_args[@]}" "$API_BASE$endpoint" || echo "000")
  ctype=$(grep -i '^content-type' "$headers" | tail -1 | cut -d' ' -f2- | tr -d '\r')
  ctype_lower=$(echo "$ctype" | tr '[:upper:]' '[:lower:]')
  
  if [[ "$status" != "200" ]]; then
    fail "$label expected 200 got $status"
    rm -f "$headers" "$body"
    return 1
  fi
  
  if [[ "$ctype_lower" != application/json* ]]; then
    fail "$label must return JSON, got '${ctype:-unknown}'"
    rm -f "$headers" "$body"
    return 1
  fi
  
  if grep -qi '<html' "$body"; then
    fail "$label returned HTML instead of JSON"
    rm -f "$headers" "$body"
    return 1
  fi
  
  # Verify structure: must have {items, count} even when empty
  if ! jq -e 'has("items") and has("count")' "$body" >/dev/null 2>&1; then
    fail "$label must return {items, count}, got: $(jq -c . "$body" 2>/dev/null || cat "$body" | head -c 100)"
    rm -f "$headers" "$body"
    return 1
  fi
  
  local items_count=$(jq -r '.items | length' "$body" 2>/dev/null || echo "0")
  local count=$(jq -r '.count // 0' "$body" 2>/dev/null || echo "0")
  pass "$label items=$items_count count=$count"
  rm -f "$headers" "$body"
}

check_listings_structure "marketplace listings" "/v1/marketplace/listings" ""

note "Checking preflight OPTIONS for key routes"
function check_preflight() {
  local label=$1
  local url=$2
  local headers body status ctype
  headers=$(mktemp)
  body=$(mktemp)
  status=$(curl -sS -X OPTIONS -D "$headers" -o "$body" -w "%{http_code}" \
    -H "Origin: https://afribrok.com" \
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

check_preflight "/v1/marketplace/listings" "$API_BASE/v1/marketplace/listings"
check_preflight "/v1/broker/inquiries" "$API_BASE/v1/broker/inquiries"

note "Finished: $PASS passed, $FAIL failed"
[[ $FAIL -eq 0 ]]
