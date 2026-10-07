import { Accent } from '../components/ui'
import { FOR_HER } from '../content'

export function ForHer() {
  return (
    <section className="section section--pink for-her" id="for-her" aria-labelledby="for-her-title">
      <div className="container">
        <h2 className="h2 for-her__title" id="for-her-title">
          This is for the woman <Accent>who...</Accent>
        </h2>

        <ol className="checklist">
          {FOR_HER.map((line, i) => (
            <li key={line}>
              <span className="checklist__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="checklist__text">{line}</span>
              <span className="checklist__box" aria-hidden="true" />
            </li>
          ))}
        </ol>

        <div className="for-her__thought">
          <p>And somewhere inside her is a quiet thought she can't quite shake:</p>
          <p className="for-her__big">I'm not done yet.</p>
        </div>
      </div>
    </section>
  )
}
