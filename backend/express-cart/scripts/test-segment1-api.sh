#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
API_BASE="${BASE_URL%/}/api/v1"

SUPER_ADMIN_EMAIL="${SUPER_ADMIN_EMAIL:-admin@example.com}"
SUPER_ADMIN_PASSWORD="${SUPER_ADMIN_PASSWORD:-Admin@12345}"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

fail() {
  local msg="$1"
  echo ""
  echo "RESULT: FAIL"
  echo "Reason: ${msg}" >&2
  exit 1
}

require_cmd curl
require_cmd jq

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

REQUEST_COUNTER=0
ASSERT_COUNTER=0

request() {
  local method="$1"
  local path="$2"
  local body="${3:-}"
  local token="${4:-}"
  local name="$5"

  REQUEST_COUNTER=$((REQUEST_COUNTER + 1))
  local resp_file="$TMP_DIR/resp_${REQUEST_COUNTER}.json"
  local status

  local curl_args=(-sS -X "$method" "${API_BASE}${path}" -H 'Content-Type: application/json' -o "$resp_file" -w '%{http_code}')
  if [[ -n "$token" ]]; then
    curl_args+=(-H "Authorization: Bearer ${token}")
  fi
  if [[ -n "$body" ]]; then
    curl_args+=(-d "$body")
  fi

  status="$(curl "${curl_args[@]}")"

  echo "[$name] ${method} ${path} -> HTTP ${status}"
  jq . "$resp_file" || cat "$resp_file"

  if [[ "$status" -lt 200 || "$status" -ge 300 ]]; then
    fail "HTTP ${status} at step '${name}'"
  fi

  LAST_RESP_FILE="$resp_file"
  LAST_STATUS="$status"
}

assert_jq() {
  local argc="$#"
  if [[ "$argc" -lt 2 ]]; then
    fail "assert_jq requires at least 2 args: <jq_expr> <description> (or jq opts + expr + description)"
  fi

  local args=("$@")
  local description="${args[$((argc - 1))]}"
  local jq_expr="${args[$((argc - 2))]}"
  local jq_opts=("${args[@]:0:$((argc - 2))}")

  ASSERT_COUNTER=$((ASSERT_COUNTER + 1))

  if jq -e "${jq_opts[@]}" "$jq_expr" "$LAST_RESP_FILE" >/dev/null; then
    echo "  [ASSERT ${ASSERT_COUNTER}] PASS - ${description}"
  else
    echo "  [ASSERT ${ASSERT_COUNTER}] FAIL - ${description}" >&2
    fail "Assertion failed: ${description}"
  fi
}

extract_json() {
  local jq_expr="$1"
  jq -r "$jq_expr" "$LAST_RESP_FILE"
}

echo "Base URL: ${BASE_URL}"
echo "Testing Segment 1 endpoints under ${API_BASE}"

RUN_ID="$(date +%s)"
CUSTOMER_EMAIL="segment1_${RUN_ID}@example.com"
CUSTOMER_PASSWORD='Password@123'
CUSTOMER_NEW_PASSWORD='Password@456'

# 1) Register user
REGISTER_BODY="$(jq -nc \
  --arg email "$CUSTOMER_EMAIL" \
  --arg password "$CUSTOMER_PASSWORD" \
  --arg firstName 'Segment' \
  --arg lastName 'One' \
  '{email:$email,password:$password,firstName:$firstName,lastName:$lastName}')"
request "POST" "/auth/register" "$REGISTER_BODY" "" "Register"
assert_jq '.userId | type == "string" and length > 0' "register returns userId"
assert_jq --arg e "$CUSTOMER_EMAIL" '.email == $e' "register returns same email"
assert_jq '.otpCode | type == "string" and length == 6' "register returns 6-digit otp"
CUSTOMER_USER_ID="$(extract_json '.userId')"
SIGNUP_OTP="$(extract_json '.otpCode')"

# 2) Verify signup OTP
VERIFY_SIGNUP_BODY="$(jq -nc \
  --arg email "$CUSTOMER_EMAIL" \
  --arg purpose 'signup_verification' \
  --arg code "$SIGNUP_OTP" \
  '{email:$email,purpose:$purpose,code:$code}')"
request "POST" "/auth/otp/verify" "$VERIFY_SIGNUP_BODY" "" "Verify Signup OTP"
assert_jq '.verified == true' "signup OTP verification succeeded"

# 3) Login user
LOGIN_BODY="$(jq -nc --arg email "$CUSTOMER_EMAIL" --arg password "$CUSTOMER_PASSWORD" '{email:$email,password:$password}')"
request "POST" "/auth/login" "$LOGIN_BODY" "" "User Login"
assert_jq '.accessToken | type == "string" and length > 20' "login returns access token"
assert_jq '.refreshToken | type == "string" and length > 20' "login returns refresh token"
LOGIN_ACCESS_TOKEN="$(extract_json '.accessToken')"
LOGIN_REFRESH_TOKEN="$(extract_json '.refreshToken')"
CUSTOMER_ACCESS_TOKEN="$LOGIN_ACCESS_TOKEN"
CUSTOMER_REFRESH_TOKEN="$LOGIN_REFRESH_TOKEN"

# 4) Refresh token
REFRESH_BODY="$(jq -nc --arg refreshToken "$CUSTOMER_REFRESH_TOKEN" '{refreshToken:$refreshToken}')"
request "POST" "/auth/refresh" "$REFRESH_BODY" "" "Refresh Token"
assert_jq '.accessToken | type == "string" and length > 20' "refresh returns access token"
assert_jq '.refreshToken | type == "string" and length > 20' "refresh returns refresh token"
REFRESHED_ACCESS_TOKEN="$(extract_json '.accessToken')"
REFRESHED_REFRESH_TOKEN="$(extract_json '.refreshToken')"
if [[ "$REFRESHED_ACCESS_TOKEN" == "$LOGIN_ACCESS_TOKEN" ]]; then
  echo "  [WARN] refreshed access token is identical to login token (same-second issuance can cause this)."
fi
if [[ "$REFRESHED_REFRESH_TOKEN" == "$LOGIN_REFRESH_TOKEN" ]]; then
  echo "  [WARN] refreshed refresh token is identical to login token (same-second issuance can cause this)."
fi
CUSTOMER_ACCESS_TOKEN="$REFRESHED_ACCESS_TOKEN"
CUSTOMER_REFRESH_TOKEN="$REFRESHED_REFRESH_TOKEN"

# 5) Forgot password (gets OTP in current implementation)
FORGOT_BODY="$(jq -nc --arg email "$CUSTOMER_EMAIL" '{email:$email}')"
request "POST" "/auth/password/forgot" "$FORGOT_BODY" "" "Forgot Password"
assert_jq '.message | type == "string" and length > 0' "forgot-password returns message"
assert_jq '.otpCode | type == "string" and length == 6' "forgot-password returns OTP"
RESET_OTP="$(extract_json '.otpCode')"

# 6) Reset password
RESET_BODY="$(jq -nc \
  --arg email "$CUSTOMER_EMAIL" \
  --arg code "$RESET_OTP" \
  --arg newPassword "$CUSTOMER_NEW_PASSWORD" \
  '{email:$email,code:$code,newPassword:$newPassword}')"
request "POST" "/auth/password/reset" "$RESET_BODY" "" "Reset Password"
assert_jq '.message == "Password reset successful"' "password reset confirms success"

# 7) Login with new password
LOGIN_NEW_BODY="$(jq -nc --arg email "$CUSTOMER_EMAIL" --arg password "$CUSTOMER_NEW_PASSWORD" '{email:$email,password:$password}')"
request "POST" "/auth/login" "$LOGIN_NEW_BODY" "" "User Login (New Password)"
assert_jq '.accessToken | type == "string" and length > 20' "new password login returns access token"
CUSTOMER_ACCESS_TOKEN="$(extract_json '.accessToken')"

# 8) Admin login
ADMIN_LOGIN_BODY="$(jq -nc --arg email "$SUPER_ADMIN_EMAIL" --arg password "$SUPER_ADMIN_PASSWORD" '{email:$email,password:$password}')"
request "POST" "/auth/login" "$ADMIN_LOGIN_BODY" "" "Admin Login"
assert_jq '.accessToken | type == "string" and length > 20' "admin login returns access token"
assert_jq '.refreshToken | type == "string" and length > 20' "admin login returns refresh token"
ADMIN_ACCESS_TOKEN="$(extract_json '.accessToken')"

# 9) List roles and permissions
request "GET" "/admin/roles" "" "$ADMIN_ACCESS_TOKEN" "List Roles"
assert_jq 'type == "array" and length >= 1' "roles endpoint returns array"
request "GET" "/admin/permissions" "" "$ADMIN_ACCESS_TOKEN" "List Permissions"
assert_jq 'type == "array" and length >= 1' "permissions endpoint returns array"

# 10) Create permission
NEW_PERMISSION_ACTION="orders:test:${RUN_ID}"
CREATE_PERMISSION_BODY="$(jq -nc --arg action "$NEW_PERMISSION_ACTION" --arg description 'Test permission from script' '{action:$action,description:$description}')"
request "POST" "/admin/permissions" "$CREATE_PERMISSION_BODY" "$ADMIN_ACCESS_TOKEN" "Create Permission"
assert_jq --arg a "$NEW_PERMISSION_ACTION" '.action == $a' "created permission action matches"
NEW_PERMISSION_ID="$(extract_json '.id')"

# 11) Create role
NEW_ROLE_NAME="TEST_ROLE_${RUN_ID}"
CREATE_ROLE_BODY="$(jq -nc --arg name "$NEW_ROLE_NAME" --arg description 'Test role from script' '{name:$name,description:$description}')"
request "POST" "/admin/roles" "$CREATE_ROLE_BODY" "$ADMIN_ACCESS_TOKEN" "Create Role"
assert_jq --arg n "$NEW_ROLE_NAME" '.name == $n' "created role name matches"
NEW_ROLE_ID="$(extract_json '.id')"

# 12) Assign permission to role
ASSIGN_PERMISSION_BODY="$(jq -nc --arg permissionId "$NEW_PERMISSION_ID" '{permissionId:$permissionId}')"
request "POST" "/admin/roles/${NEW_ROLE_ID}/permissions" "$ASSIGN_PERMISSION_BODY" "$ADMIN_ACCESS_TOKEN" "Assign Permission To Role"
assert_jq '.message == "Permission assigned to role"' "permission assignment acknowledged"

# 13) Assign role to user
ASSIGN_ROLE_BODY="$(jq -nc --arg userId "$CUSTOMER_USER_ID" --arg roleId "$NEW_ROLE_ID" '{userId:$userId,roleId:$roleId}')"
request "POST" "/admin/users/roles" "$ASSIGN_ROLE_BODY" "$ADMIN_ACCESS_TOKEN" "Assign Role To User"
assert_jq '.message == "Role assigned to user"' "role assignment acknowledged"

# 14) Remove role from user
request "DELETE" "/admin/users/${CUSTOMER_USER_ID}/roles/${NEW_ROLE_ID}" "" "$ADMIN_ACCESS_TOKEN" "Remove Role From User"
assert_jq '.message == "Role removed from user"' "role removal acknowledged"

# 15) Remove permission from role
request "DELETE" "/admin/roles/${NEW_ROLE_ID}/permissions/${NEW_PERMISSION_ID}" "" "$ADMIN_ACCESS_TOKEN" "Remove Permission From Role"
assert_jq '.message == "Permission removed from role"' "permission removal acknowledged"

# 16) Cleanup role + permission
request "DELETE" "/admin/roles/${NEW_ROLE_ID}" "" "$ADMIN_ACCESS_TOKEN" "Delete Role"
assert_jq '.message == "Role deleted"' "role delete acknowledged"
request "DELETE" "/admin/permissions/${NEW_PERMISSION_ID}" "" "$ADMIN_ACCESS_TOKEN" "Delete Permission"
assert_jq '.message == "Permission deleted"' "permission delete acknowledged"

# 17) Logout
request "POST" "/auth/logout" '{}' "$CUSTOMER_ACCESS_TOKEN" "User Logout"
assert_jq '.message == "Logged out successfully"' "user logout acknowledged"
request "POST" "/auth/logout" '{}' "$ADMIN_ACCESS_TOKEN" "Admin Logout"
assert_jq '.message == "Logged out successfully"' "admin logout acknowledged"

echo ""
echo "RESULT: PASS"
echo "Requests: ${REQUEST_COUNTER}"
echo "Assertions: ${ASSERT_COUNTER}"
