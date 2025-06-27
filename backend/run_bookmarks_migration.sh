#!/bin/bash

# Database connection parameters
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="language_exchange"
DB_USER="testuser"

echo "Running bookmarks migration..."

# Run the bookmarks migration
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "internal/database/migrations/006_bookmarks.sql"

echo "Bookmarks migration completed!"