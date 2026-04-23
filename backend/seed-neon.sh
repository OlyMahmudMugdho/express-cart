#!/bin/bash

# Database seed script for Neon (PostgreSQL)
# Usage: ./seed-neon.sh

# Load environment variables from .env if exists
if [ -f "$(dirname "$0")/.env" ]; then
  # Use a safer way to export variables from .env
  # This handles cases where there are spaces or special characters
  export $(grep -v '^#' "$(dirname "$0")/.env" | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL is not set in your .env file."
  exit 1
fi

echo "🚀 Seeding Neon database..."
echo "🔗 URL: $(echo $DATABASE_URL | sed -e 's|:.*@|:****@|')" # Hide password in logs

# Run the seed SQL script using the full DATABASE_URL
# -v ON_ERROR_STOP=1 ensures the script stops if any error occurs
# We use the psql client. If running in docker, we might need a different approach.
if command -v psql >/dev/null 2>&1; then
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$(dirname "$0")/seed.sql"
else
  echo "⚠️ psql not found locally. Trying via Docker container 'express-cart-db'..."
  docker exec -i express-cart-db psql "$DATABASE_URL" -v ON_ERROR_STOP=1 < "$(dirname "$0")/seed.sql"
fi

if [ $? -eq 0 ]; then
  echo "----------------------------------------"
  echo "✅ Seeding completed successfully!"
  echo "----------------------------------------"
else
  echo "----------------------------------------"
  echo "❌ Seeding failed!"
  echo "----------------------------------------"
  exit 1
fi
