const WIDTHS = [480, 800, 1200, 1600]

const src = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=72`

type Props = {
  id: string
  /** Intrinsic aspect ratio, used to reserve space and avoid layout shift. */
  width: number
  height: number
  sizes: string
  priority?: boolean
  className?: string
}

/** Decorative Unsplash photo with a responsive srcset. */
export function Photo({ id, width, height, sizes, priority = false, className }: Props) {
  return (
    <img
      className={className}
      src={src(id, 1200)}
      srcSet={WIDTHS.map((w) => `${src(id, w)} ${w}w`).join(', ')}
      sizes={sizes}
      width={width}
      height={height}
      alt=""
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  )
}
