import { useCallback, useEffect, useState } from 'react'
import { ArrowIcon } from '../components/Icons'
import { Logo } from '../components/Logo'
import { adminApi, AuthError, type Signup, type SignupPage, type Source, type Stats } from './api'
import { DailyChart } from './DailyChart'
import { fmtNumber, fmtRelative } from './format'
import { SignupsTable } from './SignupsTable'

const PAGE_SIZE = 25

function Delta({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous
  if (previous === 0 && current === 0) return <span className="delta">No change vs previous 7 days</span>
  const dir = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat'
  const arrow = dir === 'up' ? '↑' : dir === 'down' ? '↓' : '→'
  return (
    <span className={`delta delta--${dir}`}>
      <span aria-hidden="true">{arrow}</span> {diff > 0 ? '+' : ''}
      {fmtNumber(diff)} vs previous 7 days
    </span>
  )
}

export function Dashboard({ token, onSignOut }: { token: string; onSignOut: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [page, setPage] = useState<SignupPage | null>(null)
  const [query, setQuery] = useState('')
  const [source, setSource] = useState<Source | ''>('')
  const [pageNo, setPageNo] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [refreshedAt, setRefreshedAt] = useState(Date.now())

  const handle = useCallback(
    (err: unknown) => {
      if (err instanceof AuthError) onSignOut()
      else setError((err as Error).message)
    },
    [onSignOut],
  )

  useEffect(() => {
    let live = true
    adminApi
      .stats(token)
      .then((s) => live && setStats(s))
      .catch(handle)
    return () => {
      live = false
    }
  }, [token, refreshedAt, handle])

  useEffect(() => {
    let live = true
    setLoading(true)
    adminApi
      .signups(token, { q: query, source: source || undefined, page: pageNo, pageSize: PAGE_SIZE })
      .then((p) => live && setPage(p))
      .catch(handle)
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [token, query, source, pageNo, refreshedAt, handle])

  const onQuery = useCallback((q: string) => {
    setQuery(q)
    setPageNo(1)
  }, [])

  async function deleteSignup(s: Signup) {
    try {
      await adminApi.deleteSignup(token, s.id)
    } catch (err) {
      handle(err)
      throw err // keep the row's confirm open
    }
    // deleting the last row on a page steps back a page; then refresh list + stats
    if (page && page.items.length === 1 && pageNo > 1) setPageNo(pageNo - 1)
    setRefreshedAt(Date.now())
  }

  async function exportCsv() {
    setExporting(true)
    try {
      await adminApi.exportCsv(token, { q: query, source: source || undefined })
    } catch (err) {
      handle(err)
    } finally {
      setExporting(false)
    }
  }

  const split = stats ? stats.by_source : { hero: 0, founding: 0 }
  const splitTotal = split.hero + split.founding
  const heroShare = splitTotal ? Math.round((split.hero / splitTotal) * 100) : 0

  return (
    <div className="admin">
      <header className="admin-bar">
        <div className="admin-bar__brand">
          <Logo />
          <span className="admin-bar__tag">Admin</span>
        </div>
        <div className="admin-bar__actions">
          <a className="admin-bar__link" href="/" target="_blank" rel="noreferrer">
            View site ↗
          </a>
          <button type="button" className="btn btn--outline btn--sm" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-head">
          <div>
            <span className="eyebrow">Waitlist dashboard</span>
            <h1 className="admin-head__title">
              Your <em className="accent">waitlist</em>
            </h1>
            <p className="admin-head__sub">
              {stats?.latest_signup_at
                ? `Latest signup ${fmtRelative(stats.latest_signup_at)}`
                : stats
                  ? 'No signups yet'
                  : 'Loading…'}
            </p>
          </div>
          <div className="admin-head__actions">
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => setRefreshedAt(Date.now())}
            >
              Refresh
            </button>
            <button
              type="button"
              className="btn btn--dark btn--sm"
              onClick={exportCsv}
              disabled={exporting || !page?.total}
            >
              {exporting ? 'Exporting…' : 'Export CSV'} {!exporting && <ArrowIcon />}
            </button>
          </div>
        </div>

        {error && (
          <p className="admin-error" role="alert">
            {error}{' '}
            <button type="button" onClick={() => setError(null)}>
              Dismiss
            </button>
          </p>
        )}

        <section className="tiles" aria-label="Summary">
          <article className="tile tile--hero">
            <h2 className="tile__label">Total signups</h2>
            <p className="tile__value tile__value--hero">{stats ? fmtNumber(stats.total) : '—'}</p>
            <p className="tile__note">Women waiting for doors to open</p>
          </article>

          <article className="tile">
            <h2 className="tile__label">Today</h2>
            <p className="tile__value">{stats ? fmtNumber(stats.today) : '—'}</p>
            <p className="tile__note">Since midnight, your time</p>
          </article>

          <article className="tile">
            <h2 className="tile__label">Last 7 days</h2>
            <p className="tile__value">{stats ? fmtNumber(stats.last_7_days) : '—'}</p>
            {stats && <Delta current={stats.last_7_days} previous={stats.previous_7_days} />}
          </article>

          <article className="tile">
            <h2 className="tile__label">Where they joined</h2>
            <dl className="split">
              <div>
                <dt>Hero form</dt>
                <dd>{fmtNumber(split.hero)}</dd>
              </div>
              <div>
                <dt>Founding form</dt>
                <dd>{fmtNumber(split.founding)}</dd>
              </div>
            </dl>
            <div
              className="meter"
              role="img"
              aria-label={`${heroShare}% joined from the hero form`}
            >
              <span style={{ width: `${heroShare}%` }} />
            </div>
            <p className="tile__note">{splitTotal ? `${heroShare}% from the hero form` : 'No signups yet'}</p>
          </article>
        </section>

        <section className="panel-card" aria-labelledby="daily-title">
          <header className="panel-card__head">
            <div>
              <h2 className="panel-card__title" id="daily-title">
                Signups per day
              </h2>
              <p className="panel-card__sub">Last 30 days</p>
            </div>
          </header>
          {stats ? <DailyChart daily={stats.daily} /> : <div className="chart-skeleton" />}
        </section>

        <SignupsTable
          data={page}
          loading={loading}
          query={query}
          source={source}
          onQuery={onQuery}
          onSource={(s) => {
            setSource(s)
            setPageNo(1)
          }}
          onPage={setPageNo}
          onDelete={deleteSignup}
        />
      </main>
    </div>
  )
}
