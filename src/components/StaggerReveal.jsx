import { useEffect, useRef, useState } from 'react'

/**
 * Wraps a grid/list container and staggers the reveal of its direct children
 * when the container scrolls into view. Uses IntersectionObserver + CSS
 * for reliability (no GSAP dependency).
 */
const StaggerReveal = ({
  children,
  className = '',
  stagger = 120,
  duration = 600,
}) => {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div
              key={child?.key ?? i}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity ${duration}ms ease ${i * stagger}ms, transform ${duration}ms ease ${i * stagger}ms`,
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  )
}

export default StaggerReveal
