type Tone = 'dark' | 'light'

/** The Becoming HER arch: a doorway with a rising sun and a wave. */
export function LogoMark({ className, tone = 'dark' }: { className?: string; tone?: Tone }) {
  const arch = tone === 'dark' ? 'var(--ink)' : 'var(--paper)'
  const wave = tone === 'dark' ? 'var(--paper)' : 'var(--ink)'
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M6 62V30a26 26 0 0 1 52 0v32z" fill={arch} />
      <circle cx="32" cy="30" r="8" fill="var(--pink)" />
      <path
        d="M15 50c6-4.5 11.5-4.5 17 0 5.5-4.5 11-4.5 17 0"
        stroke={wave}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Logo({ tone = 'dark' }: { tone?: Tone }) {
  return (
    <span className={`logo logo--${tone}`}>
      <LogoMark className="logo__mark" tone={tone} />
      <span className="logo__word">Becoming HER</span>
    </span>
  )
}
