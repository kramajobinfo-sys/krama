#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Krama API smoke test — run after any backend change to catch regressions.
# Usage:  bash smoke-test.sh
#         ADMIN_PASS=secret bash smoke-test.sh   (override password inline)
# ─────────────────────────────────────────────────────────────────────────────

BASE="http://localhost/krama-api/public/api"

# ── Credentials (edit or pass as env vars) ───────────────────────────────────
ADMIN_EMAIL="${ADMIN_EMAIL:-moderator@krama.test}"
ADMIN_PASS="${ADMIN_PASS:-}"          # fill in your admin password

EMPLOYER_EMAIL="${EMPLOYER_EMAIL:-hr@ababank.test}"
EMPLOYER_PASS="${EMPLOYER_PASS:-}"    # fill in your employer password

# ── Colour helpers ───────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

PASS=0; FAIL=0; SKIP=0

ok()   { echo -e "  ${GREEN}✔${RESET}  $1"; ((PASS++)); }
fail() { echo -e "  ${RED}✘${RESET}  $1"; ((FAIL++)); }
skip() { echo -e "  ${YELLOW}–${RESET}  $1 ${YELLOW}(skipped — no credentials)${RESET}"; ((SKIP++)); }
section() { echo -e "\n${CYAN}${BOLD}▸ $1${RESET}"; }

# ── curl helpers ─────────────────────────────────────────────────────────────
# get <url> [token]
get() {
  local url="$BASE$1" token="$2"
  if [ -n "$token" ]; then
    curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $token" "$url"
  else
    curl -s -o /dev/null -w "%{http_code}" "$url"
  fi
}

# get_body <url> [token]
get_body() {
  local url="$BASE$1" token="$2"
  if [ -n "$token" ]; then
    curl -s -H "Authorization: Bearer $token" "$url"
  else
    curl -s "$url"
  fi
}

# post_json <url> <json> [token]
post_json() {
  local url="$BASE$1" body="$2" token="$3"
  if [ -n "$token" ]; then
    curl -s -X POST -H "Content-Type: application/json" \
         -H "Authorization: Bearer $token" -d "$body" "$url"
  else
    curl -s -X POST -H "Content-Type: application/json" -d "$body" "$url"
  fi
}

# check_status <label> <expected_code> <actual_code>
check_status() {
  local label="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then
    ok "$label → HTTP $actual"
  else
    fail "$label → expected HTTP $expected, got HTTP $actual"
  fi
}

# check_no_redirect <label> <url> [token]  — fails if response is a 3xx
check_no_redirect() {
  local label="$1" url="$BASE$2" token="$3"
  local code
  if [ -n "$token" ]; then
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-redirs 0 \
                -H "Authorization: Bearer $token" "$url")
  else
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-redirs 0 "$url")
  fi
  if [[ "$code" =~ ^3 ]]; then
    fail "$label → redirected (HTTP $code) — ForceHttps or routing issue"
  else
    ok "$label → no redirect (HTTP $code)"
  fi
}

echo -e "\n${BOLD}Krama API Smoke Test${RESET}  ${CYAN}$BASE${RESET}"
echo "────────────────────────────────────────────"

# ─────────────────────────────────────────────────────────────────────────────
section "Redirect guard (must not redirect to HTTPS)"
# ─────────────────────────────────────────────────────────────────────────────
check_no_redirect "GET /health"    "/health"
check_no_redirect "POST /auth/login" "/auth/login"

# ─────────────────────────────────────────────────────────────────────────────
section "Public endpoints (no auth)"
# ─────────────────────────────────────────────────────────────────────────────
check_status "GET /health"      "200" "$(get /health)"
check_status "GET /jobs"        "200" "$(get /jobs)"
check_status "GET /companies"   "200" "$(get /companies)"
check_status "GET /categories"  "200" "$(get /categories)"
check_status "GET /banners"     "200" "$(get /banners)"
check_status "GET /plans"       "200" "$(get /plans)"
check_status "GET /locations"   "200" "$(get /locations)"

# ─────────────────────────────────────────────────────────────────────────────
section "Auth — bad credentials must return 401, not 5xx or redirect"
# ─────────────────────────────────────────────────────────────────────────────
BAD_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-redirs 0 \
  -X POST -H "Content-Type: application/json" \
  -d '{"email":"nobody@example.com","password":"wrong"}' \
  "$BASE/auth/login")
check_status "POST /auth/login (wrong creds → 401)" "401" "$BAD_CODE"

# ─────────────────────────────────────────────────────────────────────────────
section "Auth — admin login"
# ─────────────────────────────────────────────────────────────────────────────
if [ -z "$ADMIN_PASS" ]; then
  skip "Admin login (set ADMIN_EMAIL / ADMIN_PASS to enable)"
  ADMIN_TOKEN=""
else
  ADMIN_RESP=$(post_json /auth/login "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}")
  ADMIN_TOKEN=$(echo "$ADMIN_RESP" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$ADMIN_TOKEN" ]; then
    ok "Admin login → token issued"
    # verify role
    ME=$(get_body /auth/me "$ADMIN_TOKEN")
    ROLE=$(echo "$ME" | grep -o '"slug":"[^"]*"' | cut -d'"' -f4)
    if [[ "$ROLE" == "admin" || "$ROLE" == "super_admin" ]]; then
      ok "Admin /auth/me → role = $ROLE"
    else
      fail "Admin /auth/me → unexpected role: $ROLE"
    fi
  else
    ERR=$(echo "$ADMIN_RESP" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    fail "Admin login failed: $ERR"
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
section "Admin endpoints"
# ─────────────────────────────────────────────────────────────────────────────
if [ -z "$ADMIN_TOKEN" ]; then
  skip "GET /admin/subscriptions"
  skip "GET /admin/plans"
  skip "GET /admin/reports/summary"
  skip "GET /admin/companies"
  skip "GET /admin/jobs"
else
  check_status "GET /admin/subscriptions"    "200" "$(get /admin/subscriptions "$ADMIN_TOKEN")"
  check_status "GET /admin/plans"            "200" "$(get /admin/plans "$ADMIN_TOKEN")"
  check_status "GET /admin/reports/summary"  "200" "$(get /admin/reports/summary "$ADMIN_TOKEN")"
  check_status "GET /admin/companies"        "200" "$(get /admin/companies "$ADMIN_TOKEN")"
  check_status "GET /admin/jobs"             "200" "$(get /admin/jobs "$ADMIN_TOKEN")"

  # subscription list must not be an empty error — check it returns JSON with data key
  SUB_BODY=$(get_body /admin/subscriptions "$ADMIN_TOKEN")
  if echo "$SUB_BODY" | grep -q '"data"'; then
    ok "GET /admin/subscriptions → contains 'data' key"
  else
    fail "GET /admin/subscriptions → missing 'data' key — possible SQL/eager-load error"
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
section "Auth — employer login"
# ─────────────────────────────────────────────────────────────────────────────
if [ -z "$EMPLOYER_PASS" ]; then
  skip "Employer login (set EMPLOYER_EMAIL / EMPLOYER_PASS to enable)"
  EMPLOYER_TOKEN=""
else
  EMP_RESP=$(post_json /auth/login "{\"email\":\"$EMPLOYER_EMAIL\",\"password\":\"$EMPLOYER_PASS\"}")
  EMPLOYER_TOKEN=$(echo "$EMP_RESP" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$EMPLOYER_TOKEN" ]; then
    ok "Employer login → token issued"
  else
    ERR=$(echo "$EMP_RESP" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    fail "Employer login failed: $ERR"
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
section "Employer endpoints"
# ─────────────────────────────────────────────────────────────────────────────
if [ -z "$EMPLOYER_TOKEN" ]; then
  skip "GET /employer/subscription"
  skip "GET /employer/payments"
  skip "GET /employer/jobs"
else
  check_status "GET /employer/subscription" "200" "$(get /employer/subscription "$EMPLOYER_TOKEN")"
  check_status "GET /employer/payments"     "200" "$(get /employer/payments "$EMPLOYER_TOKEN")"
  check_status "GET /employer/jobs"         "200" "$(get /employer/jobs "$EMPLOYER_TOKEN")"

  # Subscription status must be a known value
  SUB_BODY=$(get_body /employer/subscription "$EMPLOYER_TOKEN")
  SUB_STATUS=$(echo "$SUB_BODY" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  VALID_STATUSES="pending active trial canceled refunded expired"
  if [ -z "$SUB_STATUS" ]; then
    ok "GET /employer/subscription → no active subscription (null)"
  elif echo "$VALID_STATUSES" | grep -qw "$SUB_STATUS"; then
    ok "GET /employer/subscription → status = $SUB_STATUS"
  else
    fail "GET /employer/subscription → unknown status: '$SUB_STATUS' (past_due or other removed value?)"
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
section "Auth guard — protected route must reject no token"
# ─────────────────────────────────────────────────────────────────────────────
check_status "GET /auth/me (no token → 401)"           "401" "$(get /auth/me)"
check_status "GET /employer/subscription (no token → 401)" "401" "$(get /employer/subscription)"
check_status "GET /admin/subscriptions (no token → 401)"   "401" "$(get /admin/subscriptions)"

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo "────────────────────────────────────────────"
TOTAL=$((PASS + FAIL + SKIP))
echo -e "  ${GREEN}${PASS} passed${RESET}  ${RED}${FAIL} failed${RESET}  ${YELLOW}${SKIP} skipped${RESET}  (${TOTAL} total)"
if [ $FAIL -gt 0 ]; then
  echo -e "  ${RED}${BOLD}✘ Smoke test FAILED — do not deploy${RESET}"
  exit 1
else
  echo -e "  ${GREEN}${BOLD}✔ All checks passed${RESET}"
  exit 0
fi
