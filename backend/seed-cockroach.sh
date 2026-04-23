#!/bin/bash

# Database seed script for CockroachDB
# Usage: ./seed-cockroach.sh

# Load environment variables from .env if exists
if [ -f "$(dirname "$0")/.env" ]; then
  export $(grep -v '^#' "$(dirname "$0")/.env" | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL is not set in your .env file."
  exit 1
fi

echo "🚀 Seeding CockroachDB cluster..."
echo "🔗 URL: $(echo $DATABASE_URL | sed -e 's|:.*@|:****@|')"

# Run the seed SQL script using the full DATABASE_URL
# -v ON_ERROR_STOP=1 ensures the script stops if any error occurs
if command -v psql >/dev/null 2>&1; then
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$(dirname "$0")/seed-cockroach.sql"
elif command -v node >/dev/null 2>&1; then
  echo "⚠️ psql not found locally. Running via Node.js 'pg' client..."
  node -e "
    const fs = require('fs');
    const path = require('path');
    const { Client } = require('pg');
    const sqlPath = path.resolve('$(dirname $0)', 'seed-cockroach.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    client.connect()
      .then(() => client.query(sql))
      .then(() => client.end())
      .catch(err => { console.error(err); process.exit(1); });
  "
else
  echo "❌ Error: Neither psql nor node is available."
  exit 1
fi

if [ $? -eq 0 ]; then
  echo "----------------------------------------"
  echo "✅ CockroachDB Seeding completed successfully!"
  echo "----------------------------------------"
else
  echo "----------------------------------------"
  echo "❌ Seeding failed!"
  echo "----------------------------------------"
  exit 1
fi
