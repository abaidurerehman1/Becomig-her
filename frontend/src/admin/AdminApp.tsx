import { useCallback, useEffect, useState } from 'react'
import { tokenStore } from './api'
import { Dashboard } from './Dashboard'
import { Login } from './Login'
import './admin.css'

export default function AdminApp() {
  const [token, setToken] = useState<string | null>(() => tokenStore.get())

  useEffect(() => {
    document.title = 'Admin · Becoming HER'
    // keep the admin out of search engines
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.append(meta)
    return () => meta.remove()
  }, [])

  const signIn = useCallback((t: string) => {
    tokenStore.set(t)
    setToken(t)
  }, [])

  const signOut = useCallback(() => {
    tokenStore.clear()
    setToken(null)
  }, [])

  return token ? <Dashboard token={token} onSignOut={signOut} /> : <Login onSuccess={signIn} />
}
