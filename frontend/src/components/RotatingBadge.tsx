import { useId } from 'react'
import { ArrowIcon } from './Icons'

/** Circular text badge that slowly spins around a centre arrow; links to the waitlist. */
export function RotatingBadge({ text, href }: { text: string; href: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <a className="badge" href={href} aria-label="Join the waitlist">
      <svg className="badge__ring" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <path id={id} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text>
          <textPath href={`#${id}`} textLength="488">
            {text}
          </textPath>
        </text>
      </svg>
      <span className="badge__core" aria-hidden="true">
        <ArrowIcon />
      </span>
    </a>
  )
}
