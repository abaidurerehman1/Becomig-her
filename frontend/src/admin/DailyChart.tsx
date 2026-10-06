import { useState } from 'react'
import type { Stats } from './api'
import { fmtDayLong, fmtDayShort, fmtNumber } from './format'

const H = 220 // plot height
const PAD_TOP = 18
const BAR_MAX = 24

/** Round the axis top up to a clean step so ticks are whole, readable numbers. */
function niceMax(max: number) {
  if (max <= 4) return 4
  const pow = 10 ** Math.floor(Math.log10(max))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => max / s <= 4) ?? 10 * pow
  return Math.ceil(max / step) * step
}

/** Signups per day: single-series columns, one hue, hover tooltip per day. */
export function DailyChart({ daily }: { daily: Stats['daily'] }) {
  const [active, setActive] = useState<number | null>(null)
  const max = niceMax(Math.max(0, ...daily.map((d) => d.count)))
  const ticks = [0, max / 2, max]
  const total = daily.reduce((s, d) => s + d.count, 0)
  const n = daily.length
  const y = (v: number) => PAD_TOP + H - (v / max) * H
  const hovered = active === null ? null : daily[active]

  return (
    <figure className="chart">
      <div className="chart__plot" onPointerLeave={() => setActive(null)}>
        <div className="chart__ticks" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} style={{ top: y(t) }}>
              {fmtNumber(t)}
            </span>
          ))}
        </div>

        <svg
          className="chart__svg"
          viewBox={`0 0 ${n * 10} ${PAD_TOP + H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`Signups per day for the last ${n} days. ${fmtNumber(total)} in total.`}
        >
          {ticks.map((t) => (
            <line key={t} className="chart__grid" x1={0} x2={n * 10} y1={y(t)} y2={y(t)} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>

        <ol className="chart__cols">
          {daily.map((d, i) => {
            const h = (d.count / max) * H
            return (
              <li
                key={d.date}
                className={active === i ? 'is-active' : undefined}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                tabIndex={0}
                aria-label={`${fmtDayLong(d.date)}: ${d.count} signup${d.count === 1 ? '' : 's'}`}
              >
                <span
                  className="chart__bar"
                  style={{ height: d.count ? Math.max(h, 3) : 0, maxWidth: BAR_MAX }}
                />
              </li>
            )
          })}
        </ol>

        {hovered && active !== null && (
          <div
            className="chart__tip"
            style={{ left: `${((active + 0.5) / n) * 100}%`, top: y(hovered.count) }}
            role="status"
          >
            <strong>{fmtNumber(hovered.count)}</strong> signup{hovered.count === 1 ? '' : 's'}
            <span>{fmtDayLong(hovered.date)}</span>
          </div>
        )}
      </div>

      <div className="chart__x" aria-hidden="true">
        {daily.map((d, i) => (
          <span key={d.date}>{(n - 1 - i) % 7 === 0 ? fmtDayShort(d.date) : ''}</span>
        ))}
      </div>

      {total === 0 && <p className="chart__empty">No signups in the last {n} days yet.</p>}
    </figure>
  )
}
