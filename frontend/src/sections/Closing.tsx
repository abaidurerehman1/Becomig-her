import { RotatingBadge } from '../components/RotatingBadge'

export function Closing() {
  return (
    <section className="final" aria-labelledby="final-title">
      <div className="container container--wide final__inner">
        <p className="final__lead">
          If you've been waiting for a reason to start prioritizing your own growth:
        </p>
        <h2 className="final__title" id="final-title">
          this is it.
        </h2>
        <div className="final__foot">
          <p className="final__sig">Read it. Live it. Become HER.</p>
          <RotatingBadge text="Read it • Live it • Become HER • Join the waitlist • " href="#join" />
        </div>
      </div>
    </section>
  )
}
