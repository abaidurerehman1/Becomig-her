import { useRef, type PointerEvent } from 'react'
import { LogoMark } from './Logo'

/** A founding-member card that tilts toward the pointer. Decorative. */
export function MemberCard() {
  const ref = useRef<HTMLDivElement>(null)

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-y * 14).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(x * 18).toFixed(2)}deg`)
    el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`)
    el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`)
  }

  function onLeave() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <div className="member" aria-hidden="true" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="member__card" ref={ref}>
        <div className="member__top">
          <LogoMark className="member__mark" tone="light" />
          <span className="member__kind">Founding Member</span>
        </div>
        <span className="member__chip" />
        <div className="member__bottom">
          <span className="member__name">Becoming HER</span>
          <span className="member__price">
            $12<small>/month</small>
          </span>
        </div>
      </div>
    </div>
  )
}
