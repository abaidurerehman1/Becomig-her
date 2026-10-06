import type { ReactNode } from 'react'

/** All page copy lives here, verbatim from the approved waitlist copy doc. */

export const FOUNDING_PRICE = '$12/month'

/** The book topics named in "What is Becoming HER?" — reused in the ticker. */
export const TOPICS = [
  'Confidence',
  'Mindset',
  'Relationships',
  'Ambition',
  'Habits',
  'Reinvention',
  'Business',
  'Purpose',
  'Becoming',
]

export const WANTS = [
  'More disciplined.',
  'More intentional.',
  'Better with money.',
  'Better in your relationships.',
  'Braver about going after what you want.',
]

type Feature = {
  title: string
  body: ReactNode
}

export const FEATURES: Feature[] = [
  {
    title: 'One carefully selected book every month',
    body: (
      <p>
        I'll choose books designed to challenge the way we think, live, make decisions, and see
        ourselves.
      </p>
    ),
  },
  {
    title: 'A monthly LIVE call with Rosy',
    body: (
      <p>
        We’ll unpack the biggest ideas from the book, talk about how they apply to real life, and
        have an open conversation about what came up for us while reading.
      </p>
    ),
  },
  {
    title: 'Open community discussions',
    body: (
      <p>
        Share what you’re learning, ask questions, talk through what you’re struggling with, and
        hear perspectives from women walking alongside you.
      </p>
    ),
  },
  {
    title: 'Guided reflection prompts',
    body: (
      <>
        <p>Not questions designed to prove you read the chapter.</p>
        <p>
          Questions designed to make you think about <strong>your life</strong>.
        </p>
      </>
    ),
  },
  {
    title: 'Monthly action challenges',
    body: (
      <>
        <p>Every month, we’ll take something we've learned and put it into practice.</p>
        <p>Because information doesn't change your life.</p>
        <p>
          <strong>What you do with it does.</strong>
        </p>
      </>
    ),
  },
  {
    title: 'Bonus resources + tools',
    body: (
      <p>
        Exercises, prompts, guides, recommendations, and occasional resources to help you go
        deeper.
      </p>
    ),
  },
]

export const FOR_HER = [
  'Loves self-development but sometimes consumes more than she implements.',
  'Knows she\'s capable of more but isn\'t completely sure what “more” looks like yet.',
  'Wants to be more confident, intentional, ambitious, disciplined, and sure of herself.',
  'Is navigating a new season of life.',
  'Wants to stop thinking about the things she wants to do and start actually doing some of them.',
  'Wants deeper conversations than the ones she’s having now.',
]

export const A_YEAR_FROM_NOW = [
  'I think differently.',
  'I make different decisions.',
  'I trust myself more.',
  'I stopped waiting for permission.',
  'I actually went after some of the things I used to only think about.',
]
