import { Accent, Eyebrow } from '../components/ui'

const STEPS = ['We’ll read it together.', 'Talk about it.', 'Question it.']

export function WhatIs() {
  return (
    <section className="section section--muted what" id="what" aria-labelledby="what-title">
      <div className="container">
        <div className="what__head">
          <div>
            <Eyebrow>What it is</Eyebrow>
            <h2 className="h2" id="what-title">
              What is <Accent>Becoming HER</Accent>?
            </h2>
          </div>
          <div>
            <p className="what__lead">
              Becoming HER is a monthly self-development community for women who want to keep
              growing and want other women growing alongside them.
            </p>
            <p className="what__text">
              Every month, I’ll choose one powerful book around topics like confidence, mindset,
              relationships, ambition, habits, reinvention, business, purpose, and becoming.
            </p>
          </div>
        </div>

        <ol className="journey">
          {STEPS.map((s, i) => (
            <li key={s}>
              <span className="journey__dot">{String(i + 1).padStart(2, '0')}</span>
              <span className="journey__label">{s}</span>
            </li>
          ))}
        </ol>

        <div className="what__finale">
          <p className="what__text">And most importantly:</p>
          <p className="use-it">
            <span>use it.</span>
          </p>
          <p className="what__text">The books start the conversation.</p>
          <p className="what__point">Who you become is the point.</p>
        </div>
      </div>
    </section>
  )
}
