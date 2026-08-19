import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * A thin progress bar pinned to the very top of the viewport
 * that fills from 0% to 100% width as the page is scrolled.
 */
const ScrollProgress = () => {
  const barRef = useRef(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return undefined

    // Set initial width to 0
    gsap.set(bar, { scaleX: 0, transformOrigin: 'left' })

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
      onUpdate: (self) => {
        gsap.to(bar, {
          scaleX: self.progress,
          duration: 0.1,
          overwrite: true,
        })
      },
    })

    return () => trigger.kill()
  }, [])

  return (
    <div className="fixed left-0 right-0 top-0 z-[100] h-[3px] bg-transparent print:hidden">
      <div
        ref={barRef}
        className="h-full w-full bg-gradient-to-r from-bronze via-bronze to-forest"
      />
    </div>
  )
}

export default ScrollProgress
