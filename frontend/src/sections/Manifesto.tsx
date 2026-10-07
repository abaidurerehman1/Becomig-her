import { RevealText } from '../components/RevealText'
import { A_YEAR_FROM_NOW } from '../content'

export function Manifesto() {
  return (
    <section className="section section--dark manifesto" aria-labelledby="manifesto-title">
      <div className="container">
        <h2 className="manifesto__title" id="manifesto-title">
          This isn’t about finishing <span>more books.</span>
        </h2>
        <p className="manifesto__intro">I want you to look back a year from now and realize:</p>

        <ol className="year">
          {A_YEAR_FROM_NOW.map((line, i) => (
            <li key={line}>
              <span className="year__num">{String(i + 1).padStart(2, '0')}</span>
              <RevealText className="year__text" text={line} />
            </li>
          ))}
        </ol>

        <p className="manifesto__outro">That is what Becoming HER is about.</p>
      </div>
    </section>
  )
}
