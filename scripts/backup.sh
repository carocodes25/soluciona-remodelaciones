#!/bin/bash

# Backup script for Soluciona platform
# This script creates backups of PostgreSQL database

BACKUP_DIR="/opt/backups/soluciona"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="soluciona-postgres"
DB_USER="soluciona"
DB_NAME="soluciona_db"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "Starting backup at $(date)"

# Create database backup
docker exec $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: backup_$DATE.sql.gz"
    
    # Delete backups older than 7 days
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
    echo "🗑️  Old backups cleaned up"
else
    echo "❌ Backup failed!"
    exit 1
fi

echo "Backup completed at $(date)"
