import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Wraps a grid/list container and staggers the reveal of its direct children
 * when the container scrolls into view.
 *
 * <StaggerReveal className="grid md:grid-cols-2">
 *   <Card />   ← animates first
 *   <Card />   ← +0.12s
 *   <Card />   ← +0.24s
 * </StaggerReveal>
 */
const StaggerReveal = ({
  children,
  className = '',
  stagger = 0.12,
  duration = 0.7,
  y = 40,
  once = true,
}) => {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const children = el.children
    if (!children.length) return undefined

    const ctx = gsap.context(() => {
      gsap.fromTo(
        children,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration,
          stagger,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once,
          },
        },
      )
    })

    return () => ctx.revert()
  }, [stagger, duration, y, once])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

export default StaggerReveal
