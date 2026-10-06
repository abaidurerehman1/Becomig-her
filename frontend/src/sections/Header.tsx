import { Logo } from '../components/Logo'

const LINKS = [
  { href: '#problem', label: 'The Problem' },
  { href: '#what', label: 'What It Is' },
  { href: '#inside', label: 'Inside' },
  { href: '#for-her', label: 'Who It’s For' },
  { href: '#founding', label: 'Founding Rate' },
]

/** Floating pill navigation. */
export function Header() {
  return (
    <header className="nav">
      <div className="nav__pill">
        <a href="#top" aria-label="Becoming HER, back to top">
          <Logo />
        </a>
        <nav className="nav__links" aria-label="Page sections">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a className="btn btn--dark btn--sm" href="#join">
          Join the Waitlist
        </a>
      </div>
    </header>
  )
}
