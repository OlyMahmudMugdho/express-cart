#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

PORT="${PORT:-3001}"
BASE_URL="${BASE_URL:-http://127.0.0.1:${PORT}}"
API_BASE="${BASE_URL%/}/api/v1"
AUTO_START_SERVER="${AUTO_START_SERVER:-1}"

SUPER_ADMIN_EMAIL="${SUPER_ADMIN_EMAIL:-admin@example.com}"
SUPER_ADMIN_PASSWORD="${SUPER_ADMIN_PASSWORD:-Admin@12345}"

SERVER_PID_FILE="/tmp/express-cart.pid"
SERVER_LOG_FILE="/tmp/segment2.log"
STARTED_SERVER=0

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

cleanup() {
  if [[ "$STARTED_SERVER" == "1" ]] && [[ -f "$SERVER_PID_FILE" ]]; then
    local pid
    pid="$(cat "$SERVER_PID_FILE" 2>/dev/null || true)"
    if [[ -n "${pid}" ]]; then
      kill "$pid" 2>/dev/null || true
    fi
    rm -f "$SERVER_PID_FILE" || true
  fi
  rm -rf "$TMP_DIR" || true
}

require_cmd curl
require_cmd jq

TMP_DIR="$(mktemp -d)"
trap cleanup EXIT

REQUEST_COUNTER=0
ASSERT_COUNTER=0
LAST_RESP_FILE=""
LAST_STATUS=""

wait_for_server() {
  local max_wait="${1:-60}"
  local i
  for i in $(seq 1 "$max_wait"); do
    local code
    code="$(curl -s -o /dev/null -w '%{http_code}' "${API_BASE}/products" || true)"
    if [[ "$code" == "200" ]]; then
      return 0
    fi
    sleep 1
  done
  return 1
}

start_server_if_needed() {
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' "${API_BASE}/products" || true)"
  if [[ "$code" == "200" ]]; then
    return 0
  fi

  if [[ "$AUTO_START_SERVER" != "1" ]]; then
    fail "API is unreachable at ${API_BASE}. Set AUTO_START_SERVER=1 or run the server first."
  fi

  if [[ -f "$SERVER_PID_FILE" ]]; then
    local old_pid
    old_pid="$(cat "$SERVER_PID_FILE" 2>/dev/null || true)"
    if [[ -n "$old_pid" ]]; then
      kill "$old_pid" 2>/dev/null || true
    fi
    rm -f "$SERVER_PID_FILE" || true
  fi

  echo "Starting server on port ${PORT} (logs -> ${SERVER_LOG_FILE})"
  PORT="$PORT" npm run start:dev >"$SERVER_LOG_FILE" 2>&1 &
  local new_pid=$!
  echo "$new_pid" >"$SERVER_PID_FILE"
  STARTED_SERVER=1

  if ! wait_for_server 90; then
    echo "Server did not become ready. Log excerpt:"
    sed -n '1,200p' "$SERVER_LOG_FILE" || true
    fail "Server startup timeout"
  fi
}

request_json() {
  local method="$1"
  local path="$2"
  local body="${3:-}"
  local token="${4:-}"
  local name="$5"

  REQUEST_COUNTER=$((REQUEST_COUNTER + 1))
  local resp_file="$TMP_DIR/resp_${REQUEST_COUNTER}.json"
  local status

  local curl_args=(-sS -X "$method" "${API_BASE}${path}" -o "$resp_file" -w '%{http_code}')
  if [[ -n "$token" ]]; then
    curl_args+=(-H "Authorization: Bearer ${token}")
  fi
  if [[ -n "$body" ]]; then
    curl_args+=(-H 'Content-Type: application/json' -d "$body")
  fi

  status="$(curl "${curl_args[@]}")"

  echo "[$name] ${method} ${path} -> HTTP ${status}"
  jq . "$resp_file" 2>/dev/null || cat "$resp_file"

  if [[ "$status" -lt 200 || "$status" -ge 300 ]]; then
    fail "HTTP ${status} at step '${name}'"
  fi

  LAST_RESP_FILE="$resp_file"
  LAST_STATUS="$status"
}

request_upload() {
  local path="$1"
  local file_path="$2"
  local product_id="${3:-}"
  local token="$4"
  local name="$5"

  REQUEST_COUNTER=$((REQUEST_COUNTER + 1))
  local resp_file="$TMP_DIR/resp_${REQUEST_COUNTER}.json"
  local status

  local curl_args=(-sS -X POST "${API_BASE}${path}" -o "$resp_file" -w '%{http_code}' -H "Authorization: Bearer ${token}" -F "file=@${file_path}")
  if [[ -n "$product_id" ]]; then
    curl_args+=(-F "productId=${product_id}")
  fi

  status="$(curl "${curl_args[@]}")"
  echo "[$name] POST ${path} -> HTTP ${status}"
  jq . "$resp_file" 2>/dev/null || cat "$resp_file"

  if [[ "$status" -lt 200 || "$status" -ge 300 ]]; then
    fail "HTTP ${status} at step '${name}'"
  fi

  LAST_RESP_FILE="$resp_file"
  LAST_STATUS="$status"
}

assert_jq() {
  local argc="$#"
  if [[ "$argc" -lt 2 ]]; then
    fail "assert_jq requires at least 2 args"
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

ensure_permission() {
  local action="$1"
  local description="$2"
  local token="$3"

  request_json "GET" "/admin/permissions" "" "$token" "List Permissions (ensure: ${action})"
  local found_id
  found_id="$(jq -r --arg action "$action" '.[] | select(.action == $action) | .id' "$LAST_RESP_FILE" | head -n1)"
  if [[ -n "$found_id" ]]; then
    ENSURED_PERMISSION_ID="$found_id"
    return 0
  fi

  local body
  body="$(jq -nc --arg action "$action" --arg description "$description" '{action:$action,description:$description}')"
  request_json "POST" "/admin/permissions" "$body" "$token" "Create Permission (ensure: ${action})"
  assert_jq --arg action "$action" '.action == $action' "ensured permission action matches"
  ENSURED_PERMISSION_ID="$(extract_json '.id')"
}

start_server_if_needed

echo "Base URL: ${BASE_URL}"
echo "Testing complete API surface under ${API_BASE}"

RUN_ID="$(date +%s)"
CUSTOMER_EMAIL="segment2_${RUN_ID}@example.com"
CUSTOMER_PASSWORD='Password@123'
CUSTOMER_NEW_PASSWORD='Password@456'

# 1) Root endpoint
request_json "GET" "/" "" "" "App Root"
assert_jq -R 'contains("Hello World!")' "root endpoint returns greeting"

# 2) Register customer
REGISTER_BODY="$(jq -nc --arg email "$CUSTOMER_EMAIL" --arg password "$CUSTOMER_PASSWORD" --arg firstName 'Segment' --arg lastName 'Two' '{email:$email,password:$password,firstName:$firstName,lastName:$lastName}')"
request_json "POST" "/auth/register" "$REGISTER_BODY" "" "Register Customer"
assert_jq '.userId | type == "string" and length > 0' "register returns userId"
assert_jq --arg e "$CUSTOMER_EMAIL" '.email == $e' "register returns matching email"
assert_jq '.otpCode | type == "string" and length == 6' "register returns signup OTP"
CUSTOMER_USER_ID="$(extract_json '.userId')"
SIGNUP_OTP="$(extract_json '.otpCode')"

# 3) Verify signup OTP
VERIFY_SIGNUP_BODY="$(jq -nc --arg email "$CUSTOMER_EMAIL" --arg purpose 'signup_verification' --arg code "$SIGNUP_OTP" '{email:$email,purpose:$purpose,code:$code}')"
request_json "POST" "/auth/otp/verify" "$VERIFY_SIGNUP_BODY" "" "Verify Signup OTP"
assert_jq '.verified == true' "signup verification succeeded"

# 4) Login customer
LOGIN_BODY="$(jq -nc --arg email "$CUSTOMER_EMAIL" --arg password "$CUSTOMER_PASSWORD" '{email:$email,password:$password}')"
request_json "POST" "/auth/login" "$LOGIN_BODY" "" "Customer Login"
assert_jq '.accessToken | type == "string" and length > 20' "customer login returns access token"
assert_jq '.refreshToken | type == "string" and length > 20' "customer login returns refresh token"
CUSTOMER_ACCESS_TOKEN="$(extract_json '.accessToken')"
CUSTOMER_REFRESH_TOKEN="$(extract_json '.refreshToken')"

# 5) Refresh customer token
REFRESH_BODY="$(jq -nc --arg refreshToken "$CUSTOMER_REFRESH_TOKEN" '{refreshToken:$refreshToken}')"
request_json "POST" "/auth/refresh" "$REFRESH_BODY" "" "Refresh Customer Token"
assert_jq '.accessToken | type == "string" and length > 20' "refresh returns access token"
assert_jq '.refreshToken | type == "string" and length > 20' "refresh returns refresh token"
CUSTOMER_ACCESS_TOKEN="$(extract_json '.accessToken')"
CUSTOMER_REFRESH_TOKEN="$(extract_json '.refreshToken')"

# 6) OTP send endpoint coverage
OTP_SEND_BODY="$(jq -nc --arg email "$CUSTOMER_EMAIL" --arg purpose 'password_reset' '{email:$email,purpose:$purpose}')"
request_json "POST" "/auth/otp/send" "$OTP_SEND_BODY" "" "Send OTP"
assert_jq '.otpCode | type == "string" and length == 6' "otp/send returns OTP code"
DIRECT_OTP_CODE="$(extract_json '.otpCode')"

# 7) OTP verify endpoint coverage
OTP_VERIFY_BODY="$(jq -nc --arg email "$CUSTOMER_EMAIL" --arg purpose 'password_reset' --arg code "$DIRECT_OTP_CODE" '{email:$email,purpose:$purpose,code:$code}')"
request_json "POST" "/auth/otp/verify" "$OTP_VERIFY_BODY" "" "Verify OTP"
assert_jq '.verified == true' "otp/verify returns verified true"

# 8) Forgot password
FORGOT_BODY="$(jq -nc --arg email "$CUSTOMER_EMAIL" '{email:$email}')"
request_json "POST" "/auth/password/forgot" "$FORGOT_BODY" "" "Forgot Password"
assert_jq '.message | type == "string" and length > 0' "forgot-password returns message"
assert_jq '.otpCode | type == "string" and length == 6' "forgot-password returns reset OTP"
RESET_OTP="$(extract_json '.otpCode')"

# 9) Reset password
RESET_BODY="$(jq -nc --arg email "$CUSTOMER_EMAIL" --arg code "$RESET_OTP" --arg newPassword "$CUSTOMER_NEW_PASSWORD" '{email:$email,code:$code,newPassword:$newPassword}')"
request_json "POST" "/auth/password/reset" "$RESET_BODY" "" "Reset Password"
assert_jq '.message == "Password reset successful"' "password reset succeeded"

# 10) Login with new password
LOGIN_NEW_BODY="$(jq -nc --arg email "$CUSTOMER_EMAIL" --arg password "$CUSTOMER_NEW_PASSWORD" '{email:$email,password:$password}')"
request_json "POST" "/auth/login" "$LOGIN_NEW_BODY" "" "Customer Login (New Password)"
assert_jq '.accessToken | type == "string" and length > 20' "new password login returns access token"
CUSTOMER_ACCESS_TOKEN="$(extract_json '.accessToken')"

# 11) Admin login
ADMIN_LOGIN_BODY="$(jq -nc --arg email "$SUPER_ADMIN_EMAIL" --arg password "$SUPER_ADMIN_PASSWORD" '{email:$email,password:$password}')"
request_json "POST" "/auth/login" "$ADMIN_LOGIN_BODY" "" "Admin Login"
assert_jq '.accessToken | type == "string" and length > 20' "admin login returns access token"
ADMIN_ACCESS_TOKEN="$(extract_json '.accessToken')"

# 12) RBAC list endpoints
request_json "GET" "/admin/roles" "" "$ADMIN_ACCESS_TOKEN" "List Roles"
assert_jq 'type == "array" and length >= 1' "roles endpoint returns array"
SUPER_ADMIN_ROLE_ID="$(jq -r '.[] | select(.name == "SUPER_ADMIN") | .id' "$LAST_RESP_FILE" | head -n1)"
if [[ -z "$SUPER_ADMIN_ROLE_ID" ]]; then
  fail "SUPER_ADMIN role not found"
fi

request_json "GET" "/admin/permissions" "" "$ADMIN_ACCESS_TOKEN" "List Permissions"
assert_jq 'type == "array" and length >= 1' "permissions endpoint returns array"

# 13) Create and update permission
NEW_PERMISSION_ACTION="segment2:test:perm:${RUN_ID}"
CREATE_PERMISSION_BODY="$(jq -nc --arg action "$NEW_PERMISSION_ACTION" --arg description 'Segment2 API test permission' '{action:$action,description:$description}')"
request_json "POST" "/admin/permissions" "$CREATE_PERMISSION_BODY" "$ADMIN_ACCESS_TOKEN" "Create Permission"
assert_jq --arg action "$NEW_PERMISSION_ACTION" '.action == $action' "created permission action matches"
NEW_PERMISSION_ID="$(extract_json '.id')"

UPDATED_PERMISSION_ACTION="segment2:test:perm:updated:${RUN_ID}"
UPDATE_PERMISSION_BODY="$(jq -nc --arg action "$UPDATED_PERMISSION_ACTION" --arg description 'Updated by Segment2 API test' '{action:$action,description:$description}')"
request_json "PATCH" "/admin/permissions/${NEW_PERMISSION_ID}" "$UPDATE_PERMISSION_BODY" "$ADMIN_ACCESS_TOKEN" "Update Permission"
assert_jq --arg action "$UPDATED_PERMISSION_ACTION" '.action == $action' "updated permission action matches"

# 14) Create and update role
NEW_ROLE_NAME="SEGMENT2_ROLE_${RUN_ID}"
CREATE_ROLE_BODY="$(jq -nc --arg name "$NEW_ROLE_NAME" --arg description 'Segment2 API test role' '{name:$name,description:$description}')"
request_json "POST" "/admin/roles" "$CREATE_ROLE_BODY" "$ADMIN_ACCESS_TOKEN" "Create Role"
assert_jq --arg name "$NEW_ROLE_NAME" '.name == $name' "created role name matches"
NEW_ROLE_ID="$(extract_json '.id')"

UPDATED_ROLE_NAME="SEGMENT2_ROLE_UPDATED_${RUN_ID}"
UPDATE_ROLE_BODY="$(jq -nc --arg name "$UPDATED_ROLE_NAME" --arg description 'Updated by Segment2 API test' '{name:$name,description:$description}')"
request_json "PATCH" "/admin/roles/${NEW_ROLE_ID}" "$UPDATE_ROLE_BODY" "$ADMIN_ACCESS_TOKEN" "Update Role"
assert_jq --arg name "$UPDATED_ROLE_NAME" '.name == $name' "updated role name matches"

# 15) Assign and remove permission from role
ASSIGN_PERMISSION_BODY="$(jq -nc --arg permissionId "$NEW_PERMISSION_ID" '{permissionId:$permissionId}')"
request_json "POST" "/admin/roles/${NEW_ROLE_ID}/permissions" "$ASSIGN_PERMISSION_BODY" "$ADMIN_ACCESS_TOKEN" "Assign Permission To Role"
assert_jq '.message == "Permission assigned to role"' "permission assignment acknowledged"

request_json "DELETE" "/admin/roles/${NEW_ROLE_ID}/permissions/${NEW_PERMISSION_ID}" "" "$ADMIN_ACCESS_TOKEN" "Remove Permission From Role"
assert_jq '.message == "Permission removed from role"' "permission removal acknowledged"

# 16) Assign and remove role from user
ASSIGN_ROLE_BODY="$(jq -nc --arg userId "$CUSTOMER_USER_ID" --arg roleId "$NEW_ROLE_ID" '{userId:$userId,roleId:$roleId}')"
request_json "POST" "/admin/users/roles" "$ASSIGN_ROLE_BODY" "$ADMIN_ACCESS_TOKEN" "Assign Role To User"
assert_jq '.message == "Role assigned to user"' "role assignment acknowledged"

request_json "DELETE" "/admin/users/${CUSTOMER_USER_ID}/roles/${NEW_ROLE_ID}" "" "$ADMIN_ACCESS_TOKEN" "Remove Role From User"
assert_jq '.message == "Role removed from user"' "role removal acknowledged"

# 17) Ensure super-admin has catalog write permission, then refresh admin token
ensure_permission 'catalog:products:write' 'Catalog product management' "$ADMIN_ACCESS_TOKEN"
CATALOG_WRITE_PERMISSION_ID="$ENSURED_PERMISSION_ID"
CATALOG_ASSIGN_BODY="$(jq -nc --arg permissionId "$CATALOG_WRITE_PERMISSION_ID" '{permissionId:$permissionId}')"
request_json "POST" "/admin/roles/${SUPER_ADMIN_ROLE_ID}/permissions" "$CATALOG_ASSIGN_BODY" "$ADMIN_ACCESS_TOKEN" "Assign Catalog Write Permission To SUPER_ADMIN"
assert_jq '.message == "Permission assigned to role"' "catalog permission assignment acknowledged"

request_json "POST" "/auth/login" "$ADMIN_LOGIN_BODY" "" "Admin Re-Login (Catalog Permission)"
assert_jq '.accessToken | type == "string" and length > 20' "admin re-login returns access token"
ADMIN_ACCESS_TOKEN="$(extract_json '.accessToken')"

# 18) Catalog list endpoint
request_json "GET" "/products?page=1&limit=10&q=segment2" "" "" "List Products"
assert_jq '.items | type == "array"' "products list returns items array"
assert_jq '.total | type == "number"' "products list returns total count"

# 19) Catalog create/get/update/delete endpoints
PRODUCT_SKU="SEG2-SKU-${RUN_ID}"
CREATE_PRODUCT_BODY="$(jq -nc --arg name "Segment2 Device ${RUN_ID}" --arg sku "$PRODUCT_SKU" --argjson price 899.99 --arg description 'Segment2 test device' --arg type 'device' '{name:$name,sku:$sku,price:$price,description:$description,type:$type,stock:25}')"
request_json "POST" "/admin/products" "$CREATE_PRODUCT_BODY" "$ADMIN_ACCESS_TOKEN" "Create Product"
assert_jq --arg sku "$PRODUCT_SKU" '.sku == $sku' "created product SKU matches"
assert_jq '.id | type == "string" and length > 0' "created product returns id"
PRODUCT_ID="$(extract_json '.id')"

request_json "GET" "/products/${PRODUCT_ID}" "" "" "Get Product By ID"
assert_jq --arg id "$PRODUCT_ID" '.id == $id' "product fetch by id matches"

UPDATE_PRODUCT_BODY="$(jq -nc --arg name "Segment2 Book ${RUN_ID}" --arg type 'book' --argjson price 59.50 --arg description 'Converted to book type' '{name:$name,type:$type,price:$price,description:$description,stock:7}')"
request_json "PATCH" "/admin/products/${PRODUCT_ID}" "$UPDATE_PRODUCT_BODY" "$ADMIN_ACCESS_TOKEN" "Update Product"
assert_jq '.type == "book"' "product type updated to book"
assert_jq '.stock == 7' "product stock updated"

# 20) Upload and delete image
UPLOAD_FILE="${TMP_DIR}/segment2-upload.txt"
printf 'segment2 upload file %s\n' "$RUN_ID" >"$UPLOAD_FILE"
request_upload "/uploads/images" "$UPLOAD_FILE" "$PRODUCT_ID" "$CUSTOMER_ACCESS_TOKEN" "Upload Product Image"
assert_jq '.id | type == "string" and length > 0' "upload returns image id"
assert_jq --arg pid "$PRODUCT_ID" '.productId == $pid' "upload links image to product"
IMAGE_ID="$(extract_json '.id')"

request_json "DELETE" "/uploads/images/${IMAGE_ID}" "" "$CUSTOMER_ACCESS_TOKEN" "Delete Product Image"
assert_jq '.message == "Image deleted"' "image deletion acknowledged"

request_json "DELETE" "/admin/products/${PRODUCT_ID}" "" "$ADMIN_ACCESS_TOKEN" "Delete Product"
assert_jq '.message == "Product deleted"' "product deletion acknowledged"

# 21) Cleanup role + permission
request_json "DELETE" "/admin/roles/${NEW_ROLE_ID}" "" "$ADMIN_ACCESS_TOKEN" "Delete Role"
assert_jq '.message == "Role deleted"' "role deletion acknowledged"

request_json "DELETE" "/admin/permissions/${NEW_PERMISSION_ID}" "" "$ADMIN_ACCESS_TOKEN" "Delete Permission"
assert_jq '.message == "Permission deleted"' "permission deletion acknowledged"

# 22) Logout endpoint coverage
request_json "POST" "/auth/logout" '{}' "$CUSTOMER_ACCESS_TOKEN" "Customer Logout"
assert_jq '.message == "Logged out successfully"' "customer logout acknowledged"

request_json "POST" "/auth/logout" '{}' "$ADMIN_ACCESS_TOKEN" "Admin Logout"
assert_jq '.message == "Logged out successfully"' "admin logout acknowledged"

echo ""
echo "RESULT: PASS"
echo "Requests: ${REQUEST_COUNTER}"
echo "Assertions: ${ASSERT_COUNTER}"
