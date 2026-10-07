import csv
import io
import os
import secrets
import time
from collections import deque
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal

import psycopg
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, Header, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, field_validator

# Local dev reads backend/.env. Only that exact file: in production systemd provides the
# environment, and searching parent directories would hit the owner-only deploy .env.
load_dotenv(Path(__file__).with_name(".env"))

DATABASE_URL = os.environ["DATABASE_URL"]
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]

SCHEMA = """
CREATE TABLE IF NOT EXISTS waitlist (
    id          SERIAL PRIMARY KEY,
    first_name  VARCHAR(80)  NOT NULL,
    email       VARCHAR(255) NOT NULL,
    source      VARCHAR(20)  NOT NULL DEFAULT 'hero',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_lower_idx ON waitlist (lower(email));
"""


def connect() -> psycopg.Connection:
    return psycopg.connect(DATABASE_URL)


@asynccontextmanager
async def lifespan(_: FastAPI):
    with connect() as conn:
        conn.execute(SCHEMA)
    yield


app = FastAPI(title="Becoming HER Waitlist API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)


class WaitlistIn(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    source: Literal["hero", "founding"] = "hero"

    @field_validator("first_name")
    @classmethod
    def clean_name(cls, v: str) -> str:
        v = " ".join(v.split())
        if not v:
            raise ValueError("First name is required")
        return v


class WaitlistOut(BaseModel):
    first_name: str
    already_joined: bool


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/waitlist", response_model=WaitlistOut)
def join_waitlist(entry: WaitlistIn):
    email = entry.email.lower()
    try:
        with connect() as conn:
            row = conn.execute(
                """
                INSERT INTO waitlist (first_name, email, source)
                VALUES (%s, %s, %s)
                ON CONFLICT (lower(email)) DO NOTHING
                RETURNING id
                """,
                (entry.first_name, email, entry.source),
            ).fetchone()
    except psycopg.Error:
        raise HTTPException(status_code=503, detail="We couldn't save your spot right now. Please try again.")
    return WaitlistOut(first_name=entry.first_name, already_joined=row is None)


@app.get("/api/waitlist/count")
def waitlist_count():
    with connect() as conn:
        (count,) = conn.execute("SELECT count(*) FROM waitlist").fetchone()
    return {"count": count}


# --- Admin -------------------------------------------------------------------
# Every admin route requires `Authorization: Bearer <ADMIN_TOKEN>`.
# With no ADMIN_TOKEN configured, the admin API is switched off entirely.
# Brute-force guard: after MAX_FAILED_LOGINS wrong passwords from one IP within
# LOCKOUT_SECONDS, that IP is refused until the window passes. In-memory, so it is
# per worker process and resets on restart — enough to make guessing impractical.

MAX_FAILED_LOGINS = 5
LOCKOUT_SECONDS = 15 * 60
_failed_logins: dict[str, deque[float]] = {}


def require_admin(request: Request, authorization: str | None = Header(default=None)) -> None:
    expected = os.getenv("ADMIN_TOKEN", "")
    if not expected:
        raise HTTPException(status_code=503, detail="Admin access is not configured.")

    ip = request.client.host if request.client else "unknown"
    now = time.monotonic()
    fails = _failed_logins.get(ip)
    if fails:
        while fails and now - fails[0] > LOCKOUT_SECONDS:
            fails.popleft()
        if not fails:
            del _failed_logins[ip]
        elif len(fails) >= MAX_FAILED_LOGINS:
            raise HTTPException(
                status_code=429,
                detail="Too many wrong passwords. Try again in 15 minutes.",
                headers={"Retry-After": str(int(LOCKOUT_SECONDS - (now - fails[0])) + 1)},
            )

    scheme, _, token = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not secrets.compare_digest(token.encode(), expected.encode()):
        _failed_logins.setdefault(ip, deque()).append(now)
        raise HTTPException(status_code=401, detail="Invalid admin password.")


admin = APIRouter(prefix="/api/admin", dependencies=[Depends(require_admin)])

DAILY_WINDOW = 30
PAGE_SIZE_MAX = 100


def _filters(q: str | None, source: str | None) -> tuple[str, list]:
    clauses, params = [], []
    if q and q.strip():
        like = "%" + q.strip().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%"
        clauses.append("(first_name ILIKE %s OR email ILIKE %s)")
        params += [like, like]
    if source:
        clauses.append("source = %s")
        params.append(source)
    return ("WHERE " + " AND ".join(clauses)) if clauses else "", params


@admin.get("/check")
def admin_check():
    return {"ok": True}


@admin.get("/stats")
def admin_stats(tz: str = Query("UTC", max_length=64)):
    """Headline numbers plus signups per day for the last 30 days, bucketed in the viewer's timezone."""
    try:
        with connect() as conn:
            total, today, last7, prev7, hero, founding, latest = conn.execute(
                """
                SELECT
                  count(*),
                  count(*) FILTER (WHERE (created_at AT TIME ZONE %(tz)s)::date = (now() AT TIME ZONE %(tz)s)::date),
                  count(*) FILTER (WHERE created_at >= now() - interval '7 days'),
                  count(*) FILTER (WHERE created_at >= now() - interval '14 days'
                                     AND created_at <  now() - interval '7 days'),
                  count(*) FILTER (WHERE source = 'hero'),
                  count(*) FILTER (WHERE source = 'founding'),
                  max(created_at)
                FROM waitlist
                """,
                {"tz": tz},
            ).fetchone()
            daily = conn.execute(
                """
                SELECT d::date, count(w.id)
                FROM generate_series(
                       (now() AT TIME ZONE %(tz)s)::date - (%(days)s - 1),
                       (now() AT TIME ZONE %(tz)s)::date,
                       interval '1 day') AS d
                LEFT JOIN waitlist w ON (w.created_at AT TIME ZONE %(tz)s)::date = d::date
                GROUP BY d ORDER BY d
                """,
                {"tz": tz, "days": DAILY_WINDOW},
            ).fetchall()
    except psycopg.errors.InvalidParameterValue:
        raise HTTPException(status_code=400, detail="Unknown timezone.")
    return {
        "total": total,
        "today": today,
        "last_7_days": last7,
        "previous_7_days": prev7,
        "by_source": {"hero": hero, "founding": founding},
        "latest_signup_at": latest,
        "daily": [{"date": d.isoformat(), "count": c} for d, c in daily],
    }


@admin.get("/signups")
def admin_signups(
    q: str | None = Query(None, max_length=120),
    source: Literal["hero", "founding"] | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=PAGE_SIZE_MAX),
):
    where, params = _filters(q, source)
    with connect() as conn:
        (total,) = conn.execute(f"SELECT count(*) FROM waitlist {where}", params).fetchone()
        rows = conn.execute(
            f"""
            SELECT id, first_name, email, source, created_at
            FROM waitlist {where}
            ORDER BY created_at DESC, id DESC
            LIMIT %s OFFSET %s
            """,
            [*params, page_size, (page - 1) * page_size],
        ).fetchall()
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [
            {"id": i, "first_name": n, "email": e, "source": s, "created_at": c}
            for i, n, e, s, c in rows
        ],
    }


@admin.delete("/signups/{signup_id}", status_code=204)
def admin_delete_signup(signup_id: int):
    """Permanently remove one signup (e.g. spam or a requested removal)."""
    with connect() as conn:
        row = conn.execute("DELETE FROM waitlist WHERE id = %s RETURNING id", (signup_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Signup not found.")
    return Response(status_code=204)


def _csv_safe(value: str) -> str:
    # Stop spreadsheet apps from treating user input as a formula.
    return "'" + value if value[:1] in ("=", "+", "-", "@", "\t", "\r") else value


@admin.get("/signups.csv")
def admin_signups_csv(
    q: str | None = Query(None, max_length=120),
    source: Literal["hero", "founding"] | None = None,
):
    where, params = _filters(q, source)
    with connect() as conn:
        rows = conn.execute(
            f"SELECT first_name, email, source, created_at FROM waitlist {where} ORDER BY created_at DESC",
            params,
        ).fetchall()
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["first_name", "email", "form", "joined_at_utc"])
    for name, email, src, created in rows:
        writer.writerow([_csv_safe(name), _csv_safe(email), src, created.isoformat()])
    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="becoming-her-waitlist.csv"'},
    )


app.include_router(admin)
