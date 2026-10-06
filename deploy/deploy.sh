#!/usr/bin/env bash
# Runs on the server (called by the GitHub Actions deploy job).
#   deploy.sh <release-id> <unpacked-release-dir>   < env-file-contents
# Installs the release, writes /opt/becoming-her/.env from stdin, switches the
# `current` symlink, restarts the API, health-checks it and rolls back on failure.
set -euo pipefail

RELEASE_ID="$1"
SRC="$2"
APP=/opt/becoming-her
REL="$APP/releases/$RELEASE_ID"
KEEP=5
HEALTH=http://127.0.0.1:9161/api/health

# 1. secrets from GitHub (stdin) -> .env, owner-only
umask 077
tmp_env="$(mktemp)"
cat > "$tmp_env"
grep -q '^DATABASE_URL=' "$tmp_env" || { echo "missing DATABASE_URL"; exit 1; }
install -m 600 "$tmp_env" "$APP/.env"
rm -f "$tmp_env"

# 2. release files (world-readable code; no secrets in here)
umask 022
rm -rf "$REL"
mkdir -p "$REL/server"
cp -r "$SRC/web" "$REL/web"
cp "$SRC/main.py" "$SRC/requirements.txt" "$REL/server/"

# 3. python deps, only reinstalled when requirements change
req_hash="$(sha256sum "$REL/server/requirements.txt" | cut -d' ' -f1)"
if [ "$(cat "$APP/venv/.req-hash" 2>/dev/null)" != "$req_hash" ]; then
  "$APP/venv/bin/pip" install --quiet --upgrade pip
  "$APP/venv/bin/pip" install --quiet -r "$REL/server/requirements.txt"
  echo "$req_hash" > "$APP/venv/.req-hash"
fi

# 4. switch + restart
previous="$(readlink -f "$APP/current" 2>/dev/null || true)"
ln -sfn "$REL" "$APP/current"
sudo systemctl restart becoming-her-api.service

# 5. health check, roll back if the new release doesn't come up
for _ in $(seq 1 30); do
  if curl -fsS "$HEALTH" >/dev/null 2>&1; then
    echo "deployed $RELEASE_ID"
    # keep the newest $KEEP releases
    ls -1dt "$APP"/releases/*/ | tail -n +$((KEEP + 1)) | xargs -r rm -rf
    rm -rf "$SRC"
    exit 0
  fi
  sleep 1
done

echo "health check failed for $RELEASE_ID" >&2
sudo journalctl -u becoming-her-api.service -n 40 --no-pager >&2 || true
if [ -n "$previous" ] && [ -d "$previous" ]; then
  ln -sfn "$previous" "$APP/current"
  sudo systemctl restart becoming-her-api.service
  echo "rolled back to $(basename "$previous")" >&2
fi
exit 1
