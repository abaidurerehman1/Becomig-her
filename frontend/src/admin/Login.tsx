import { useState, type FormEvent } from 'react'
import { ArrowIcon } from '../components/Icons'
import { Logo } from '../components/Logo'
import { adminApi, AuthError } from './api'

export function Login({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!password || busy) return
    setBusy(true)
    setError(null)
    try {
      await adminApi.check(password)
      onSuccess(password)
    } catch (err) {
      setError(err instanceof AuthError ? 'That password isn’t right.' : (err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login">
      <form className="login__card" onSubmit={submit}>
        <Logo />
        <span className="login__tag">Admin</span>
        <h1 className="login__title">
          Welcome <em className="accent">back</em>
        </h1>
        <p className="login__text">Sign in to see who’s joined the Becoming HER waitlist.</p>

        <div className="field">
          <label htmlFor="admin-password">Admin password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? 'admin-password-err' : undefined}
          />
        </div>
        {error && (
          <p className="login__error" id="admin-password-err" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn--dark login__btn" type="submit" disabled={busy || !password}>
          {busy ? 'Checking…' : 'Sign in'} {!busy && <ArrowIcon />}
        </button>
      </form>
    </main>
  )
}
