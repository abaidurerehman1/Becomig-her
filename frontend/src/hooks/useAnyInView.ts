import { useEffect, useState } from 'react'

/** True while any element matching `selector` intersects the viewport. */
export function useAnyInView(selector: string) {
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const targets = document.querySelectorAll(selector)
    if (!targets.length || !('IntersectionObserver' in window)) return

    const visible = new Set<Element>()
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target)
        else visible.delete(entry.target)
      }
      setInView(visible.size > 0)
    })
    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [selector])

  return inView
}
