import { useEffect, useRef, useState } from 'react'

type Props = {
  text: string
  /** Phrases inside `text` to emphasise once revealed. */
  marks?: string[]
  className?: string
}

type Segment = { word: string; marked: boolean }

function segment(text: string, marks: string[]): Segment[] {
  const out: Segment[] = []
  let rest = text
  while (rest) {
    const hits = marks
      .map((m) => ({ m, i: rest.indexOf(m) }))
      .filter((h) => h.i >= 0)
      .sort((a, b) => a.i - b.i)
    const hit = hits[0]
    const plain = hit ? rest.slice(0, hit.i) : rest
    plain.split(/\s+/).filter(Boolean).forEach((w) => out.push({ word: w, marked: false }))
    if (!hit) break
    hit.m.split(/\s+/).forEach((w) => out.push({ word: w, marked: true }))
    rest = rest.slice(hit.i + hit.m.length)
    // keep trailing punctuation attached to the marked phrase
    const punct = rest.match(/^[^\s]+/)
    if (punct) {
      out[out.length - 1].word += punct[0]
      rest = rest.slice(punct[0].length)
    }
  }
  return out
}

/**
 * Text whose words light up one by one as it scrolls through the viewport.
 * The full sentence is always in the DOM; only colour changes.
 */
export function RevealText({ text, marks = [], className = '' }: Props) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [lit, setLit] = useState(0)
  const words = segment(text, marks)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLit(Number.POSITIVE_INFINITY)
      return
    }
    let frame = 0
    const update = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      // 0 when the block's top hits 85% of the viewport, 1 when its bottom reaches 45%
      const start = vh * 0.85
      const end = vh * 0.45
      const progress = (start - r.top) / (start - end + r.height)
      setLit(Math.max(0, Math.min(1, progress)) * words.length)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [words.length])

  return (
    <p ref={ref} className={`reveal ${className}`}>
      {words.map((w, i) => (
        <span
          key={i}
          className={`reveal__word${i < lit ? ' is-lit' : ''}${w.marked ? ' is-marked' : ''}`}
        >
          {w.word}{' '}
        </span>
      ))}
    </p>
  )
}
