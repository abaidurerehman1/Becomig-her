#!/usr/bin/env bash
# One-time (idempotent) server setup for Becoming HER. Run with sudo from the repo root:
#   sudo DB_PASSWORD='...' DEPLOY_USER=paisol.developer bash deploy/provision.sh
# Creates the service user, /opt/becoming-her, the venv, the Postgres role + database,
# and installs the systemd unit and nginx site. Safe to re-run.
set -euo pipefail

: "${DB_PASSWORD:?set DB_PASSWORD}"
DEPLOY_USER="${DEPLOY_USER:-paisol.developer}"
APP=/opt/becoming-her
SVC_USER=becomingher
HERE="$(cd "$(dirname "$0")" && pwd)"

# service account (no login, no home)
id "$SVC_USER" >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin "$SVC_USER"

# app directories, owned by the deploy user so CI can ship releases without root
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 755 "$APP" "$APP/releases"
if [ ! -x "$APP/venv/bin/python" ]; then
  sudo -u "$DEPLOY_USER" python3 -m venv "$APP/venv"
fi

# database: role + db, password always synced to DB_PASSWORD
sudo -u postgres psql -v ON_ERROR_STOP=1 -v pw="$DB_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE becoming_her LOGIN PASSWORD %L', :'pw')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'becoming_her') \gexec
SELECT format('ALTER ROLE becoming_her WITH LOGIN PASSWORD %L', :'pw') \gexec
SELECT 'CREATE DATABASE becoming_her OWNER becoming_her'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'becoming_her') \gexec
SQL

# systemd unit (started by the first deploy, once code exists)
install -m 644 "$HERE/systemd/becoming-her-api.service" /etc/systemd/system/becoming-her-api.service
systemctl daemon-reload
systemctl enable becoming-her-api.service

# nginx site on :9160 — validate before reloading so other sites are never affected
install -m 644 "$HERE/nginx/becoming-her.conf" /etc/nginx/sites-available/becoming-her
ln -sfn /etc/nginx/sites-available/becoming-her /etc/nginx/sites-enabled/becoming-her
nginx -t
systemctl reload nginx

echo "provisioned: $APP (service user: $SVC_USER, db: becoming_her)"
