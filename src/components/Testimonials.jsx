import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { TESTIMONIALS } from '../data/testimonials'
import { StarIcon } from './icons'

const Testimonials = ({ limit } = {}) => {
  const items = limit ? TESTIMONIALS.slice(0, limit) : TESTIMONIALS
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const trackRef = useRef(null)
  const timerRef = useRef(null)

  const goTo = useCallback((index) => {
    setActive(index)
    if (trackRef.current) {
      gsap.to(trackRef.current, {
        x: `-${index * 100}%`,
        duration: 0.6,
        ease: 'power2.inOut',
      })
    }
  }, [])

  const next = useCallback(() => {
    goTo((active + 1) % items.length)
  }, [active, items.length, goTo])

  const prev = useCallback(() => {
    goTo((active - 1 + items.length) % items.length)
  }, [active, items.length, goTo])

  // Auto-play
  useEffect(() => {
    if (paused) {
      clearInterval(timerRef.current)
      return undefined
    }
    timerRef.current = setInterval(next, 6000)
    return () => clearInterval(timerRef.current)
  }, [paused, next])

  // Touch/swipe support
  const touchStart = useRef(null)
  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStart.current === null) return
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev()
    }
    touchStart.current = null
  }

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Track */}
      <div
        ref={trackRef}
        className="flex transition-none"
        style={{ width: `${items.length * 100}%`, transform: `translateX(-${(active * 100) / items.length}%)` }}
      >
        {items.map((t) => (
          <div key={t.id} className="w-full shrink-0 px-0" style={{ width: `${100 / items.length}%` }}>
            <div className="mx-auto max-w-2xl text-center">
              {/* Stars */}
              <div className="flex justify-center gap-1">
                {Array.from({ length: t.rating }, (_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-bronze" filled />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="mt-6 font-serif text-lg leading-relaxed text-text/85 md:text-xl">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="mt-8 flex items-center justify-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest font-serif text-sm font-bold text-bronze">
                  {t.avatar}
                </span>
                <div className="text-left">
                  <p className="font-serif text-base font-bold text-forest">{t.name}</p>
                  <p className="text-xs text-text/60">{t.role}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous testimonial"
        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2.5 text-forest shadow-soft transition-all hover:bg-white hover:shadow-lift md:left-4"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next testimonial"
        className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2.5 text-forest shadow-soft transition-all hover:bg-white hover:shadow-lift md:right-4"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      {/* Dots */}
      <div className="mt-8 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to testimonial ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? 'w-8 bg-bronze' : 'w-2 bg-forest/20 hover:bg-forest/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default Testimonials
