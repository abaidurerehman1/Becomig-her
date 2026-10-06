import { MemberCard } from '../components/MemberCard'
import { WaitlistForm } from '../components/WaitlistForm'
import { Accent, Eyebrow } from '../components/ui'

export function Founding() {
  return (
    <section className="section section--muted founding" id="founding" aria-labelledby="founding-title" data-cta-hide>
      <div className="container founding__grid">
        <MemberCard />

        <div className="founding__copy">
          <Eyebrow>Founding members</Eyebrow>
          <h2 className="h2" id="founding-title">
            Become a <Accent>Founding Member</Accent>
          </h2>
          <p className="founding__text">Becoming HER is opening soon.</p>
          <p className="founding__text">
            Join the waitlist and you'll be the first invited when doors open.
          </p>

          <div className="rate">
            <h3 className="rate__label">Founding Member Rate</h3>
            <p className="rate__amount">
              $12<span>/month</span>
            </p>
            <p className="rate__note">
              Your founding rate will stay{' '}
              <strong>$12/month for as long as you remain a member</strong>, even when the price
              increases for future members.
            </p>
          </div>

          <WaitlistForm source="founding" buttonLabel="Join the Waitlist" />
        </div>
      </div>
    </section>
  )
}
