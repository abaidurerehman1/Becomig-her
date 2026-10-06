import { ArrowIcon } from '../components/Icons'
import { Photo } from '../components/Photo'
import { RotatingBadge } from '../components/RotatingBadge'
import { Eyebrow } from '../components/ui'

export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title" data-cta-hide>
      <div className="container container--wide">
        <div className="hero__top">
          <Eyebrow>Opening soon</Eyebrow>
          <p className="hero__lead">
            A monthly self-development community for women who know they’re made for more.
          </p>
        </div>

        <h1 className="hero__title" id="hero-title">
          <span className="hero__word">Becoming</span> <em className="hero__her">HER</em>
        </h1>

        <div className="hero__grid">
          <div className="hero__col">
            <p className="hero__text">
              Each month, we’ll read one powerful book together and turn what we learn into
              something we actually use in our lives.
            </p>
            <p className="hero__text">Because the goal isn’t to read more.</p>
            <p className="hero__punch">It’s to become more.</p>
          </div>

          <figure className="hero__media">
            <Photo
              className="hero__photo"
              id="photo-1506880018603-83d5b814b5a6"
              width={1000}
              height={1250}
              sizes="(min-width: 1000px) 30vw, 80vw"
              priority
            />
            <RotatingBadge text="Join the waitlist • Founding Member rate $12/month • " href="#join" />
          </figure>

          <div className="hero__col hero__col--end">
            <ol className="goal">
              <li>
                <span>01</span>One book.
              </li>
              <li>
                <span>02</span>One month.
              </li>
              <li>
                <span>03</span>One goal: to leave the month different than you entered it.
              </li>
            </ol>
            <div className="hero__actions">
              <a className="btn btn--dark" href="#join">
                Join the Waitlist <ArrowIcon />
              </a>
              <a className="btn btn--outline" href="#inside">
                See what’s inside
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
