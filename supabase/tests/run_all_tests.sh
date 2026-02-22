#!/usr/bin/env bash

# Be strict where supported, but don't hard-fail on shells without pipefail. [web:251]
set -eu

# Enable pipefail if the current shell supports it (bash does; some /bin/sh do not). [web:251]
if (set -o pipefail) 2>/dev/null; then
  set -o pipefail
fi

# nounset (bash: -u) is already enabled above via set -eu
# If you want it explicitly: set -u is already active.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Load local env (keys/urls) if present
ENV_FILE="${SCRIPT_DIR}/.env.local.sh"
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

DATABASE_URL="${SUPABASE_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"

run_psql_file () {
  local file="$1"

  if [[ ! -f "$file" ]]; then
    echo "❌ Missing SQL file: $file"
    exit 1
  fi

  echo ""
  echo "---- Running: $(basename "$file") ----"

  local out
  out="$(mktemp)"

  if ! psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file" >"$out" 2>&1; then
    cat "$out"
    rm -f "$out"
    exit 1
  fi

  grep -E "(NOTICE|ERROR|ROLLBACK|COMMIT|ASSERT_|Missing table|Missing function)" "$out" || true
  rm -f "$out"
}

echo "========================================"
echo "Yombri Supabase SQL Test Suite (Phase 2 + Phase 4A)"
echo "========================================"
echo ""

cd "$REPO_ROOT"

echo "Resetting database via Supabase CLI (applies supabase/migrations)..."
supabase db reset --no-seed
node "${SCRIPT_DIR}/seed_section_a_users.mjs"


echo ""
echo "Setting up test environment..."
run_psql_file "${SCRIPT_DIR}/00_test_setup.sql"

echo ""
echo "========================================"
echo "Running Phase 2 SQL Tests"
echo "========================================"

run_psql_file "${SCRIPT_DIR}/02_rls_validation.sql"
run_psql_file "${SCRIPT_DIR}/03_checkin_validation.sql"
run_psql_file "${SCRIPT_DIR}/04_failure_modes.sql"

echo ""
echo "========================================"
echo "Running Phase 4A SQL Tests (RLS/RPC)"
echo "========================================"

run_psql_file "${SCRIPT_DIR}/06_event_chat_rls.sql"
run_psql_file "${SCRIPT_DIR}/07_block_rls.sql"
run_psql_file "${SCRIPT_DIR}/08_follows.sql"
run_psql_file "${SCRIPT_DIR}/09_ejection_atomic.sql"
run_psql_file "${SCRIPT_DIR}/10_abuse_counters.sql"

echo ""
echo "========================================"
echo "Optional: Realtime smoke (A6)"
echo "========================================"

if [[ "${RUN_REALTIME_SMOKE:-0}" == "1" ]]; then
  : "${SUPABASE_URL:?SUPABASE_URL is required}"
  : "${SUPABASE_ANON_KEY:?SUPABASE_ANON_KEY is required}"
  : "${SUPABASE_SERVICE_ROLE_KEY:?SUPABASE_SERVICE_ROLE_KEY is required}"

  node "${SCRIPT_DIR}/realtime_smoke_event_chat.mjs"
else
  echo "Skipping realtime smoke. To run:"
  echo "  RUN_REALTIME_SMOKE=1 bash supabase/tests/run_all_tests.sh"
fi

echo ""
echo "========================================"
echo "✅ Test Suite Complete"
echo "========================================"
