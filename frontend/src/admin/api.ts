export type Source = 'hero' | 'founding'

export type Stats = {
  total: number
  today: number
  last_7_days: number
  previous_7_days: number
  by_source: Record<Source, number>
  latest_signup_at: string | null
  daily: { date: string; count: number }[]
}

export type Signup = {
  id: number
  first_name: string
  email: string
  source: Source
  created_at: string
}

export type SignupPage = { total: number; page: number; page_size: number; items: Signup[] }

export class AuthError extends Error {}

const TOKEN_KEY = 'bh-admin-token'

export const tokenStore = {
  get(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string) {
    try {
      sessionStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* private mode: stays signed in for this page view only */
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(TOKEN_KEY)
    } catch {
      /* ignore */
    }
  },
}

async function request(path: string, token: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`/api/admin${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 401) throw new AuthError('Invalid admin password.')
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.detail ?? `Request failed (${res.status})`)
  }
  return res
}

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

function query(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') q.set(k, String(v))
  const s = q.toString()
  return s ? `?${s}` : ''
}

export const adminApi = {
  check: (token: string) => request('/check', token),
  stats: async (token: string): Promise<Stats> =>
    (await request(`/stats${query({ tz: timezone })}`, token)).json(),
  signups: async (
    token: string,
    opts: { q?: string; source?: Source; page: number; pageSize: number },
  ): Promise<SignupPage> =>
    (
      await request(
        `/signups${query({ q: opts.q, source: opts.source, page: opts.page, page_size: opts.pageSize })}`,
        token,
      )
    ).json(),
  /** Permanently deletes one signup. */
  deleteSignup: async (token: string, id: number): Promise<void> => {
    await request(`/signups/${id}`, token, { method: 'DELETE' })
  },
  /** Downloads the (filtered) list as CSV via an authenticated fetch. */
  async exportCsv(token: string, opts: { q?: string; source?: Source }) {
    const res = await request(`/signups.csv${query({ q: opts.q, source: opts.source })}`, token)
    const url = URL.createObjectURL(await res.blob())
    const a = document.createElement('a')
    a.href = url
    a.download = `becoming-her-waitlist-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.append(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },
}
