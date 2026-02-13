#!/bin/bash

FILE="20260210180600_phase2_schema.sql"

echo "Fixing pgcrypto function references in $FILE..."

# Backup original
cp "$FILE" "$FILE.backup"

# Fix all pgcrypto functions
sed -i 's/default gen_random_uuid()/default extensions.gen_random_uuid()/g' "$FILE"
sed -i 's/\bdigest(/extensions.digest(/g' "$FILE"
sed -i 's/\bhmac(/extensions.hmac(/g' "$FILE"
sed -i 's/gen_random_bytes(/extensions.gen_random_bytes(/g' "$FILE"

# Avoid double-prefixing
sed -i 's/extensions\.extensions\./extensions./g' "$FILE"

echo "✅ Fixed! Backup saved as $FILE.backup"
