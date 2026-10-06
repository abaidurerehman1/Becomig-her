import { Ticker } from '../components/ui'
import { TOPICS } from '../content'

/** Two crossed ticker tapes between hero and waitlist. Decorative. */
export function Tapes() {
  return (
    <div className="tapes" aria-hidden="true">
      <div className="tapes__tape tapes__tape--pink">
        <Ticker tone="pink-solid" items={['One book', 'One month', 'One goal']} />
      </div>
      <div className="tapes__tape tapes__tape--dark">
        <Ticker items={TOPICS} />
      </div>
    </div>
  )
}
