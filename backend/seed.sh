#!/bin/bash

# Database seed script for express-cart
# Usage: ./seed.sh

# Load environment variables from .env if exists
if [ -f "$(dirname "$0")/.env" ]; then
  export $(cat "$(dirname "$0")/.env" | grep -v '^#' | xargs)
fi

# Default values
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_USER="${DATABASE_USER:-expresscart}"
DB_NAME="${DATABASE_NAME:-expresscart}"

echo "Seeding database..."
echo "Host: $DB_HOST"
echo "User: $DB_USER"
echo "Database: $DB_NAME"

# Run the seed SQL script
PGPASSWORD="$DATABASE_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$(dirname "$0")/seed.sql"

if [ $? -eq 0 ]; then
  echo "Seeding completed successfully!"
else
  echo "Seeding failed!"
  exit 1
fi
