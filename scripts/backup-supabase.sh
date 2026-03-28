#!/usr/bin/env bash
# backup-supabase.sh
# Creates a point-in-time Postgres dump from Supabase and stores it locally.
# Run manually or add to cron for scheduled backups.
#
# Prerequisites:
#   - pg_dump installed (brew install libpq)
#   - SUPABASE_DB_URL set (get from Supabase Dashboard → Settings → Database → Connection string → URI)
#
# Usage:
#   SUPABASE_DB_URL="postgresql://postgres:[password]@[host]:5432/postgres" ./scripts/backup-supabase.sh
#
# Recommended cron (weekly, Sundays at 2am server time):
#   0 2 * * 0 cd /path/to/divisionalpha && SUPABASE_DB_URL="..." ./scripts/backup-supabase.sh >> /var/log/da-backup.log 2>&1

set -euo pipefail

DB_URL="${SUPABASE_DB_URL:?SUPABASE_DB_URL is required}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="divisionalpha_${TIMESTAMP}.sql.gz"
FILEPATH="${BACKUP_DIR}/${FILENAME}"

mkdir -p "$BACKUP_DIR"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Starting backup → $FILEPATH"

# Dump all tables except auth schema internals (those are managed by Supabase)
pg_dump "$DB_URL" \
  --no-owner \
  --no-acl \
  --schema=public \
  --schema=storage \
  | gzip > "$FILEPATH"

SIZE=$(du -sh "$FILEPATH" | cut -f1)
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Backup complete — $FILEPATH ($SIZE)"

# Prune backups older than 30 days
find "$BACKUP_DIR" -name "divisionalpha_*.sql.gz" -mtime +30 -delete
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Old backups pruned (>30 days)"

# Restore instructions (printed but not executed):
cat <<'RESTORE'

--- RESTORE INSTRUCTIONS ---
To restore this backup to a fresh Supabase project:

1. Get the new project's DB URL from Supabase Dashboard → Settings → Database
2. Run:
   gunzip -c <backup_file>.sql.gz | psql "$NEW_SUPABASE_DB_URL"

3. Re-run any migrations that may have been applied after the backup:
   supabase db push --db-url "$NEW_SUPABASE_DB_URL"

4. Update all env vars in Coolify to point to the new Supabase project.
----------------------------
RESTORE
