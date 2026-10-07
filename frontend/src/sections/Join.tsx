import { WaitlistForm } from '../components/WaitlistForm'
import { Accent } from '../components/ui'
import { FOUNDING_PRICE } from '../content'

export function Join() {
  return (
    <section className="section join" id="join" aria-labelledby="join-title" data-cta-hide>
      <div className="container">
        <div className="join__panel">
          <div className="join__copy">
            <h2 className="h2" id="join-title">
              Join the <Accent>Waitlist</Accent>
            </h2>
            <p className="join__text">
              Be the first to know when doors open and get access to the{' '}
              <strong>Founding Member rate of {FOUNDING_PRICE}</strong>, locked in for as long as
              you remain a member.
            </p>
          </div>
          <div className="join__form">
            <WaitlistForm source="hero" buttonLabel="Join the Becoming HER Waitlist" tone="dark" />
            <p className="fineprint">No commitment. Just first access when doors open.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
