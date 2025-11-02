#!/bin/bash

# Database Backup Script for AfriBrok
# Usage: ./scripts/backup-db.sh

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql.gz"
COMPOSE_FILE="infrastructure/compose/docker-compose.prod.yml"

# Load environment
ENV_FILE="infrastructure/compose/.env.production"
if [ -f "$ENV_FILE" ]; then
    export $(cat $ENV_FILE | grep -v '^#' | xargs)
fi

mkdir -p $BACKUP_DIR

echo "Creating database backup..."

# Create backup
docker compose -f $COMPOSE_FILE exec -T postgres pg_dump -U ${POSTGRES_USER:-afribrok} ${POSTGRES_DB:-afribrok} | gzip > $BACKUP_FILE

echo "✅ Backup created: $BACKUP_FILE"

# Optional: Upload to S3
if [ -n "$BACKUP_S3_BUCKET" ]; then
    echo "Uploading to S3..."
    aws s3 cp $BACKUP_FILE s3://$BACKUP_S3_BUCKET/
    echo "✅ Backup uploaded to S3"
fi

# Cleanup old backups (keep last 30 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
echo "✅ Old backups cleaned up"

