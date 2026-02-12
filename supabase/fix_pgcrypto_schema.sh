#!/bin/bash

set -e

echo "Fixing pgcrypto schema references..."

# Determine pgcrypto schema (default to extensions for Supabase)
PGCRYPTO_SCHEMA=${1:-extensions}

echo "Using schema: $PGCRYPTO_SCHEMA"

# Fix migration file
if [ -f "migrations/20260210180600_phase2_schema.sql" ]; then
  echo "Fixing migration file..."
  cp migrations/20260210180600_phase2_schema.sql migrations/20260210180600_phase2_schema.sql.backup
  
  sed -i "s/\bgen_random_bytes(/${PGCRYPTO_SCHEMA}.gen_random_bytes(/g" migrations/20260210180600_phase2_schema.sql
  sed -i "s/\bgen_random_uuid()/${PGCRYPTO_SCHEMA}.gen_random_uuid()/g" migrations/20260210180600_phase2_schema.sql
  sed -i "s/\bgen_salt(/${PGCRYPTO_SCHEMA}.gen_salt(/g" migrations/20260210180600_phase2_schema.sql
  sed -i "s/\bcrypt(/${PGCRYPTO_SCHEMA}.crypt(/g" migrations/20260210180600_phase2_schema.sql
  
  # Fix search_path in security definer functions
  sed -i "s/set search_path = public, yombri, pg_catalog/set search_path = pg_catalog, public, yombri, ${PGCRYPTO_SCHEMA}/g" migrations/20260210180600_phase2_schema.sql
  
  echo "✓ Migration file fixed"
fi

# Fix test files
for testfile in tests/*.sql; do
  if [ -f "$testfile" ]; then
    echo "Fixing $testfile..."
    sed -i "s/crypt('password', gen_salt('bf'))/${PGCRYPTO_SCHEMA}.crypt('password', ${PGCRYPTO_SCHEMA}.gen_salt('bf'))/g" "$testfile"
    sed -i "s/\bgen_random_uuid()/${PGCRYPTO_SCHEMA}.gen_random_uuid()/g" "$testfile"
    echo "✓ $testfile fixed"
  fi
done

echo ""
echo "✅ All files fixed!"
echo ""
echo "Next steps:"
echo "1. Reset database: psql \$DATABASE_URL -c 'DROP SCHEMA IF EXISTS yombri CASCADE;'"
echo "2. Apply migration: psql \$DATABASE_URL -f migrations/20260210180600_phase2_schema.sql"
echo "3. Run tests: psql \$DATABASE_URL -f tests/02_rls_validation.sql"
