#!/bin/bash
set -e

DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

echo "========================================";
echo "Yombri Phase 2 Test Suite";
echo "========================================";
echo "";

# Reset database
echo "Resetting database...";
psql "$DATABASE_URL" << 'EOF'
DROP SCHEMA IF EXISTS yombri CASCADE;
DROP SCHEMA IF EXISTS auth CASCADE;
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
CREATE SCHEMA auth;
GRANT ALL ON SCHEMA auth TO postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
EOF

# Apply migrations
echo "";
echo "Applying migrations...";
for f in migrations/202602*.sql; do
  echo "  - $(basename $f)";
  psql "$DATABASE_URL" -f "$f" -q || exit 1;
done

# Setup test environment
echo "";
echo "Setting up test environment...";
psql "$DATABASE_URL" -f tests/00_test_setup.sql -q

# Run tests
echo "";
echo "========================================";
echo "Running Tests";
echo "========================================";
echo "";

psql "$DATABASE_URL" -f tests/02_rls_validation.sql 2>&1 | grep -E "(NOTICE|ERROR|ROLLBACK|COMMIT)" || true
echo "";
psql "$DATABASE_URL" -f tests/03_checkin_validation.sql 2>&1 | grep -E "(NOTICE|ERROR|ROLLBACK|COMMIT)" || true
echo "";
psql "$DATABASE_URL" -f tests/04_failure_modes.sql 2>&1 | grep -E "(NOTICE|ERROR|ROLLBACK|COMMIT)" || true

echo "";
echo "========================================";
echo "✅ Test Suite Complete";
echo "========================================";
