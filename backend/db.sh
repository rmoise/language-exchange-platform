#!/bin/bash

# Database connection script for Language Exchange Platform
# Usage: ./db.sh [command]

PSQL="/opt/homebrew/opt/postgresql@16/bin/psql"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="language_exchange"
DB_USER="postgres"
DB_PASSWORD="password"

# Export password to avoid prompt
export PGPASSWORD=$DB_PASSWORD

if [ $# -eq 0 ]; then
    # Interactive mode
    echo "Connecting to Language Exchange database..."
    $PSQL -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
else
    # Execute command and exit
    $PSQL -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$*"
fi