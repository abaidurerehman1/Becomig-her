import { RevealText } from '../components/RevealText'
import { Accent } from '../components/ui'
import { WANTS } from '../content'

// Each "want" is drawn as a book spine in the stack.
const SPINES = ['spine--ink', 'spine--pink', 'spine--paper', 'spine--deep', 'spine--lift']

export function Problem() {
  return (
    <>
      <section className="section problem" id="problem" aria-labelledby="problem-title">
        <div className="container problem__grid">
          <div className="problem__head">
            <h2 className="h2" id="problem-title">
              You probably don’t need <Accent>another book</Accent>.
            </h2>
          </div>

          <div className="problem__body">
            <p className="problem__lead">You probably already have a stack of them.</p>
            <p className="problem__text">Books you bought because you wanted to be more confident.</p>

            <ul className="stack">
              {WANTS.map((w, i) => (
                <li key={w} className={`spine ${SPINES[i % SPINES.length]}`}>
                  <span>{w}</span>
                </li>
              ))}
            </ul>

            <div className="problem__story">
              <p>And maybe you finished some of them.</p>
              <p>Maybe you highlighted half the book.</p>
              <p>Maybe you even thought:</p>
            </div>
            <blockquote className="problem__quote">
              <p>
                <mark>This is going to change my life.</mark>
              </p>
            </blockquote>
            <p className="sticker">And then life got busy.</p>
          </div>
        </div>
      </section>

      <section className="statement" aria-label="Why Becoming HER exists">
        <div className="container">
          <RevealText
            className="statement__text"
            text="Becoming HER exists to close the gap between what you learn and how you actually live."
            marks={['what you learn', 'how you actually live']}
          />
        </div>
      </section>
    </>
  )
}
