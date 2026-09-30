#!/bin/zsh
# Applique les migrations sur la base de PRODUCTION (PROD_DATABASE_URL de .env.local).
# Journal : .e2e-logs/migration-prod.log
cd "${0:A:h}/.." || exit 1
mkdir -p .e2e-logs
{
  echo "=== début $(date '+%H:%M:%S') ==="
  URL="$(grep '^PROD_DATABASE_URL=' .env.local | cut -d= -f2- | tr -d '"')"
  DATABASE_URL="$URL" npx tsx src/server/db/migrate.ts
  echo "=== code de sortie : $? ==="
  echo "TERMINÉ"
} > .e2e-logs/migration-prod.log 2>&1
(sleep 1; osascript -e 'tell application "Terminal" to close (every window whose name contains "'"${0:t}"'")' >/dev/null 2>&1) &
