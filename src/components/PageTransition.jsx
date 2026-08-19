import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import gsap from 'gsap'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Wraps the routed page and cross-fades between routes:
 *  - fade the current page out (it stays mounted in state),
 *  - scroll to top,
 *  - swap in the new route and fade it in.
 */
const PageTransition = () => {
  const location = useLocation()
  const currentOutlet = useOutlet()
  const wrapRef = useRef(null)
  const animatingRef = useRef(false)
  const [outlet, setOutlet] = useState(currentOutlet)
  const [displayedPath, setDisplayedPath] = useState(location.pathname)

  // reset scroll on first load, matching the old ScrollToTop-on-mount behaviour
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  // fade the outgoing page out, then swap in the new route and reset scroll
  useLayoutEffect(() => {
    if (location.pathname === displayedPath || animatingRef.current) return

    const swap = () => {
      window.scrollTo({ top: 0, behavior: 'instant' })
      setOutlet(currentOutlet)
      setDisplayedPath(location.pathname)
      animatingRef.current = false
    }

    if (prefersReducedMotion()) {
      swap()
      return
    }

    animatingRef.current = true
    const tween = gsap.to(wrapRef.current, {
      autoAlpha: 0,
      duration: 0.3,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: swap,
    })
    return () => tween.kill()
  }, [location, currentOutlet, displayedPath])

  // fade the incoming page in once it has mounted
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    gsap.fromTo(
      wrapRef.current,
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto', clearProps: 'transform' },
    )
  }, [outlet])

  return (
    <div ref={wrapRef} className="min-h-full">
      {outlet}
    </div>
  )
}

export default PageTransition
