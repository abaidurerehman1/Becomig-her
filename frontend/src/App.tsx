import { ArrowIcon } from './components/Icons'
import { Logo } from './components/Logo'
import { useAnyInView } from './hooks/useAnyInView'
import { Closing } from './sections/Closing'
import { ForHer } from './sections/ForHer'
import { Founding } from './sections/Founding'
import { Header } from './sections/Header'
import { Hero } from './sections/Hero'
import { Inside } from './sections/Inside'
import { Join } from './sections/Join'
import { Manifesto } from './sections/Manifesto'
import { Problem } from './sections/Problem'
import { Tapes } from './sections/Tapes'
import { WhatIs } from './sections/WhatIs'

export default function App() {
  // The mobile CTA only appears when no signup form (or the hero) is on screen.
  const ctaHidden = useAnyInView('[data-cta-hide]')

  return (
    <>
      <a className="skip-link" href="#join">
        Skip to the waitlist
      </a>
      <div className="grain" aria-hidden="true" />

      <Header />
      <main>
        <Hero />
        <Tapes />
        <Join />
        <Problem />
        <WhatIs />
        <Inside />
        <ForHer />
        <Manifesto />
        <Founding />
        <Closing />
      </main>

      <footer className="footer">
        <div className="container container--wide footer__inner">
          <Logo tone="light" />
          <p>© {new Date().getFullYear()} Becoming HER. All rights reserved.</p>
        </div>
        <p className="footer__mark" aria-hidden="true">
          Becoming HER
        </p>
      </footer>

      <a
        className="mobile-cta"
        href="#join"
        aria-hidden={ctaHidden}
        tabIndex={ctaHidden ? -1 : undefined}
        data-hidden={ctaHidden}
      >
        Join the Waitlist · $12/month <ArrowIcon />
      </a>
    </>
  )
}
