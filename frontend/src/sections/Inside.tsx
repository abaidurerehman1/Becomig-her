import type { ReactNode } from 'react'
import { Accent } from '../components/ui'
import { FEATURES } from '../content'

type Tile = { className: string; art: ReactNode }

// Presentation for each feature, in content order. Art is decorative only.
const TILES: Tile[] = [
  {
    className: 'bento__tile--pink bento__tile--book',
    art: <span className="art-numeral">1</span>,
  },
  {
    className: 'bento__tile--dark bento__tile--live',
    art: (
      <span className="art-live">
        <i /> Live
      </span>
    ),
  },
  {
    className: 'bento__tile--community',
    art: (
      <span className="art-circles">
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
    ),
  },
  {
    className: 'bento__tile--muted bento__tile--prompts',
    art: <span className="art-quote">“</span>,
  },
  {
    className: 'bento__tile--challenges',
    art: (
      <span className="art-track">
        <i />
        <i />
        <i />
        <i />
      </span>
    ),
  },
  {
    className: 'bento__tile--wash bento__tile--bonus',
    art: (
      <span className="art-chips">
        <i>Exercises</i>
        <i>Prompts</i>
        <i>Guides</i>
        <i>Resources</i>
      </span>
    ),
  },
]

export function Inside() {
  return (
    <section className="section inside" id="inside" aria-labelledby="inside-title">
      <div className="container">
        <h2 className="h2" id="inside-title">
          Inside <Accent>Becoming HER</Accent>
        </h2>

        <ul className="bento">
          {FEATURES.map((f, i) => (
            <li className={`bento__tile ${TILES[i]?.className ?? ''}`} key={f.title}>
              <div className="bento__art" aria-hidden="true">
                {TILES[i]?.art}
              </div>
              <span className="bento__index">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="bento__title">{f.title}</h3>
              <div className="bento__body">{f.body}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
