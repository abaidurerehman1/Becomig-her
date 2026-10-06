import { useEffect, useState } from 'react'
import type { Signup, SignupPage, Source } from './api'
import { fmtDateTime, fmtNumber, fmtRelative } from './format'

const SOURCE_LABEL: Record<Source, string> = { hero: 'Hero form', founding: 'Founding form' }
const FILTERS: { value: Source | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'hero', label: 'Hero form' },
  { value: 'founding', label: 'Founding form' },
]

type Props = {
  data: SignupPage | null
  loading: boolean
  query: string
  source: Source | ''
  onQuery: (q: string) => void
  onSource: (s: Source | '') => void
  onPage: (p: number) => void
}

function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1400)
    return () => clearTimeout(t)
  }, [copied])
  return (
    <button
      type="button"
      className="copy"
      onClick={() => navigator.clipboard?.writeText(email).then(() => setCopied(true))}
      aria-label={`Copy ${email}`}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function Row({ s }: { s: Signup }) {
  return (
    <tr>
      <td data-label="Name">
        <span className="person">
          <span className="person__avatar" aria-hidden="true">
            {s.first_name.slice(0, 1).toUpperCase()}
          </span>
          {s.first_name}
        </span>
      </td>
      <td data-label="Email">
        <span className="email">
          <a href={`mailto:${s.email}`}>{s.email}</a>
          <CopyEmail email={s.email} />
        </span>
      </td>
      <td data-label="Form">
        <span className={`source source--${s.source}`}>{SOURCE_LABEL[s.source]}</span>
      </td>
      <td data-label="Joined">
        <time dateTime={s.created_at} title={fmtDateTime(s.created_at)}>
          {fmtRelative(s.created_at)}
        </time>
      </td>
    </tr>
  )
}

export function SignupsTable({ data, loading, query, source, onQuery, onSource, onPage }: Props) {
  const [draft, setDraft] = useState(query)

  // debounce typing into the search box
  useEffect(() => {
    const t = setTimeout(() => {
      if (draft !== query) onQuery(draft)
    }, 300)
    return () => clearTimeout(t)
  }, [draft, query, onQuery])

  const from = data && data.total ? (data.page - 1) * data.page_size + 1 : 0
  const to = data ? Math.min(data.page * data.page_size, data.total) : 0
  const pages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1
  const filtered = Boolean(query || source)

  return (
    <section className="panel-card" aria-labelledby="signups-title">
      <header className="panel-card__head">
        <div>
          <h2 className="panel-card__title" id="signups-title">
            Signups
          </h2>
          <p className="panel-card__sub">
            {data ? `${fmtNumber(data.total)} ${filtered ? 'matching' : 'total'}` : '—'}
          </p>
        </div>
        <div className="toolbar">
          <label className="search">
            <span className="visually-hidden">Search by name or email</span>
            <input
              type="search"
              placeholder="Search name or email"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </label>
          <div className="segmented" role="group" aria-label="Filter by form">
            {FILTERS.map((f) => (
              <button
                key={f.label}
                type="button"
                aria-pressed={source === f.value}
                onClick={() => onSource(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className={`table-wrap${loading ? ' is-loading' : ''}`}>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Form</th>
              <th scope="col">Joined</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((s) => (
              <Row key={s.id} s={s} />
            ))}
          </tbody>
        </table>

        {data && data.items.length === 0 && (
          <div className="empty">
            <p className="empty__title">{filtered ? 'No matches' : 'No signups yet'}</p>
            <p>
              {filtered
                ? 'Try a different name, email or form filter.'
                : 'Share the landing page — new signups will appear here.'}
            </p>
          </div>
        )}
      </div>

      {data && data.total > data.page_size && (
        <footer className="pager">
          <span>
            {fmtNumber(from)}–{fmtNumber(to)} of {fmtNumber(data.total)}
          </span>
          <div>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              disabled={data.page <= 1}
              onClick={() => onPage(data.page - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              disabled={data.page >= pages}
              onClick={() => onPage(data.page + 1)}
            >
              Next
            </button>
          </div>
        </footer>
      )}
    </section>
  )
}
