import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/**
 * Decorative cursor follower — keeps the OS arrow, adds a ring + label on top.
 * Does NOT hide the default cursor.
 *
 * Usage: <CustomCursor /> once in App, then data-cursor="view"|"drag"|"explore"|"text"|"close" on any element.
 */
const CustomCursor = () => {
  const ringRef = useRef(null)
  const labelRef = useRef(null)
  const [variant, setVariant] = useState('default')
  const pos = useRef({ x: -100, y: -100 })
  const visible = useRef(false)

  const config = {
    default: { ring: 32, label: null, ringColor: 'border-forest/30' },
    view:    { ring: 96, label: 'View', ringColor: 'border-bronze/60' },
    drag:    { ring: 80, label: 'Drag', ringColor: 'border-forest/40' },
    explore: { ring: 88, label: 'Explore', ringColor: 'border-bronze/50' },
    text:    { ring: 64, label: 'Read', ringColor: 'border-forest/30' },
    close:   { ring: 72, label: 'Close', ringColor: 'border-red-400/50' },
  }

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return undefined

    const ring = ringRef.current
    const label = labelRef.current
    if (!ring) return undefined

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }

      if (!visible.current) {
        visible.current = true
        gsap.to(ring, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' })
      }
    }

    const onLeave = () => {
      visible.current = false
      gsap.to([ring, label], { autoAlpha: 0, duration: 0.2 })
    }

    // Ring follows mouse with lag
    const tick = () => {
      gsap.to(ring, {
        x: pos.current.x,
        y: pos.current.y,
        duration: 0.4,
        ease: 'power3.out',
      })
      if (label) {
        gsap.to(label, {
          x: pos.current.x,
          y: pos.current.y - 58,
          duration: 0.35,
          ease: 'power3.out',
        })
      }
    }
    const ticker = gsap.ticker.add(tick)

    const onOver = (e) => {
      const target = e.target.closest('[data-cursor]')
      if (target) setVariant(target.dataset.cursor)
    }

    const onOut = (e) => {
      const target = e.target.closest('[data-cursor]')
      if (target) setVariant('default')
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      gsap.ticker.remove(ticker)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [])

  // Animate ring size + label on variant change
  useEffect(() => {
    const ring = ringRef.current
    const label = labelRef.current
    if (!ring) return

    const { ring: size, label: text } = config[variant] || config.default

    gsap.to(ring, {
      width: size,
      height: size,
      duration: 0.5,
      ease: 'power3.out',
    })

    if (label) {
      if (text) {
        gsap.to(label, { autoAlpha: 1, duration: 0.3, ease: 'power2.out', delay: 0.1 })
      } else {
        gsap.to(label, { autoAlpha: 0, duration: 0.15 })
      }
    }
  }, [variant])

  if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    return null
  }

  return (
    <>
      {/* Decorative ring — follows mouse with smooth lag */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-[border-color] duration-300"
        style={{
          autoAlpha: 0,
          width: config.default.ring,
          height: config.default.ring,
          borderColor: variant === 'view' || variant === 'explore'
            ? 'rgba(180,144,84,0.55)'
            : variant === 'close'
              ? 'rgba(248,113,113,0.5)'
              : 'rgba(29,66,53,0.3)',
        }}
      />

      {/* Floating text label above the ring */}
      <div
        ref={labelRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ autoAlpha: 0 }}
      >
        <span className="whitespace-nowrap rounded-full bg-forest/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-cream shadow-md">
          {config[variant]?.label || ''}
        </span>
      </div>
    </>
  )
}

export default CustomCursor
