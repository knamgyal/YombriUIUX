#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

echo "========================================"
echo "Yombri Phase 2 Test Suite"
echo "========================================"
echo ""

echo "Resetting database via Supabase CLI (applies supabase/migrations)..."
cd "$REPO_ROOT"
supabase db reset --no-seed

echo ""
echo "Setting up test environment..."
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "${SCRIPT_DIR}/00_test_setup.sql" -q

echo ""
echo "========================================"
echo "Running Tests"
echo "========================================"
echo ""

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "${SCRIPT_DIR}/02_rls_validation.sql"        2>&1 | grep -E "(NOTICE|ERROR|ROLLBACK|COMMIT)" || true
echo ""
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "${SCRIPT_DIR}/03_checkin_validation.sql"    2>&1 | grep -E "(NOTICE|ERROR|ROLLBACK|COMMIT)" || true
echo ""
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "${SCRIPT_DIR}/04_failure_modes.sql"         2>&1 | grep -E "(NOTICE|ERROR|ROLLBACK|COMMIT)" || true

echo ""
echo "========================================"
echo "✅ Test Suite Complete"
echo "========================================"
