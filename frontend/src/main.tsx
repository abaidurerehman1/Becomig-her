import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// The admin dashboard is a separate chunk so landing-page visitors never download it.
const AdminApp = lazy(() => import('./admin/AdminApp.tsx'))
const isAdmin = /^\/admin\/?$/.test(window.location.pathname)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
