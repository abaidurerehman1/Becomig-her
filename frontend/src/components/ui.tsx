import type { ReactNode } from 'react'

/** Italic serif accent word inside a display heading. */
export function Accent({ children }: { children: ReactNode }) {
  return <em className="accent">{children}</em>
}

/** Infinite horizontal ticker. Decorative: the same words appear elsewhere as real text. */
export function Ticker({ items, tone = 'dark' }: { items: string[]; tone?: 'dark' | 'pink-solid' }) {
  const group = (key: number) => (
    <div className="ticker__group" key={key}>
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  )
  return (
    <div className={`ticker ticker--${tone}`} aria-hidden="true">
      <div className="ticker__track">{[0, 1].map(group)}</div>
    </div>
  )
}
