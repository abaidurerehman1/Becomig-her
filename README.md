# Becoming HER — Waitlist Landing Page

React + TypeScript (Vite) frontend, Python + FastAPI backend, PostgreSQL storage.

## Run locally

**1. Backend** (port 8000)
```
cd backend
.venv\Scripts\activate
uvicorn main:app --reload --port 8000
```
Database settings are in `backend/.env` (copy `backend/.env.example`; locally PostgreSQL 18
on port 5433, database `becoming_her`). The `waitlist` table is created automatically on startup.

**2. Frontend** (port 5173)
```
cd frontend
npm run dev
```
Open http://localhost:5173

## Admin dashboard
Open http://localhost:5173/admin and sign in with the `ADMIN_TOKEN` value from `backend/.env`.
It shows total signups, today / last 7 days, which form people used, signups per day,
and a searchable list you can export as CSV. Change the password by editing `ADMIN_TOKEN`
and restarting the backend; if `ADMIN_TOKEN` is empty the admin API is switched off.

In production, serve `index.html` for `/admin` too (SPA fallback), and only over HTTPS.

Admin API (all need `Authorization: Bearer <ADMIN_TOKEN>`):
- `GET /api/admin/stats?tz=Area/City`
- `GET /api/admin/signups?q=&source=hero|founding&page=&page_size=`
- `GET /api/admin/signups.csv?q=&source=`

## View signups from the database
```
psql -U postgres -p 5433 -d becoming_her -c "SELECT * FROM waitlist ORDER BY created_at DESC;"
```

## API
- `POST /api/waitlist` — `{ first_name, email, source: "hero" | "founding" }`
- `GET /api/waitlist/count`
- `GET /api/health`

## CI/CD and deployment

`.github/workflows/ci-cd.yml` runs on every push and pull request:

1. **Frontend**: `npm ci`, lint, typecheck + production build.
2. **Backend**: install requirements, compile, import the app.
3. **Deploy** (pushes to `main` only, after both pass): uploads the build over SSH and runs
   `deploy/deploy.sh` on the server, which installs the release into
   `/opt/becoming-her/releases/<id>`, switches the `current` symlink, restarts the API,
   health-checks it and **rolls back automatically** if it doesn't come up. The last 5
   releases are kept. A smoke test then hits the live site.

Production: **https://becomingherformula.com** (admin: https://becomingherformula.com/admin).

```
visitor → https://becomingherformula.com → network gateway (10.100.0.1, terminates HTTPS)
        → server :9160 nginx → static site, /api → uvicorn 127.0.0.1:9161 → PostgreSQL 16
```
The domain and HTTPS are configured on the gateway, not on this server. nginx redirects any
request that isn't for `becomingherformula.com` (e.g. `http://38.97.62.137:9160`, `www.`) to
the HTTPS domain, so the admin password never travels over plain HTTP; `/api/health` is exempt.
API process: systemd unit `becoming-her-api`; database `becoming_her`.

The nginx site (`deploy/nginx/becoming-her.conf`) is installed by `provision.sh`, not by each
deploy. After editing it, install it on the server and run `sudo nginx -t && sudo systemctl reload nginx`.

### GitHub Secrets

| Secret | Purpose |
|---|---|
| `SSH_HOST`, `SSH_PORT`, `SSH_USER` | deploy target |
| `SSH_PRIVATE_KEY` | deploy key (its public half is in the server's `~/.ssh/authorized_keys`) |
| `SSH_KNOWN_HOSTS` | pinned server host key |
| `DATABASE_URL` | production Postgres connection string |
| `ADMIN_TOKEN` | production `/admin` password |
| `CORS_ORIGINS` | allowed browser origins |

Secrets reach the server over SSH stdin and are written to `/opt/becoming-her/.env`
(mode 600). To change one: `gh secret set NAME`, then re-run the workflow.

### First-time server setup

Already done on the current server; for a new one, from the repo root on the server:
```
sudo DB_PASSWORD='...' DEPLOY_USER=<ssh user> bash deploy/provision.sh
```
It creates the `becomingher` service user, `/opt/becoming-her`, the venv, the Postgres role and
database, the systemd unit and the nginx site (validated with `nginx -t` before reload).

Useful on the server: `sudo systemctl status becoming-her-api`,
`sudo journalctl -u becoming-her-api -f`, `ls /opt/becoming-her/releases`.

Photos are free-to-use images from Unsplash.
