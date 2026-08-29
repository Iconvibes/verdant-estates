import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getFrameUrl, TOTAL_FRAMES, useFrameUrl } from '../data/frames'

gsap.registerPlugin(ScrollTrigger)

const OVERLAYS = [
  {
    key: 'nature',
    eyebrow: 'The Approach',
    title: 'Homes Surrounded by Nature',
    copy: 'Every Verdant estate begins where the city softens — mature trees, native planting and green space that belongs to you alone.',
    from: 0,
    to: 0.3,
  },
  {
    key: 'light',
    eyebrow: 'Inside',
    title: 'Open Living Spaces with Natural Light',
    copy: 'Double-height glazing, wide terraces and rooms that follow the sun from dawn to dusk — designed for slow, bright living.',
    from: 0.35,
    to: 0.65,
  },
  {
    key: 'bedrooms',
    eyebrow: 'Upstairs',
    title: 'Luxury Bedrooms, Peaceful Views',
    copy: 'Quiet suites wrapped in timber and linen, waking to the canopy and sleeping to the breeze. Your calm is the final word.',
    from: 0.7,
    to: 1,
  },
]

const ScrollHouseTour = () => {
  const sectionRef = useRef(null)
  const imgRef = useRef(null)
  const textRefs = useRef([])
  const [isMobile, setIsMobile] = useState(false)
  const initialFrameUrl = useFrameUrl(0)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // When the initial frame URL resolves, push it into the img element
  // (bypasses React's img reconciliation for smoother scroll performance)
  useEffect(() => {
    if (initialFrameUrl && imgRef.current && !imgRef.current.src) {
      imgRef.current.src = initialFrameUrl
    }
  }, [initialFrameUrl])

  useLayoutEffect(() => {
    if (isMobile) return undefined

    const img = imgRef.current
    let currentFrame = -1

    const frameCache = {}
    const setFrame = (index) => {
      if (index === currentFrame) return
      currentFrame = index
      // Lazy-load frame URL on first access
      const url = frameCache[index] || getFrameUrl(index)
      if (url) {
        frameCache[index] = url
        img.src = url
      }
      // preload the next two frames for a seamless walkthrough
      for (let n = 1; n <= 2; n++) {
        const nextIdx = index + n
        if (nextIdx < TOTAL_FRAMES && !frameCache[nextIdx]) {
          frameCache[nextIdx] = getFrameUrl(nextIdx)
        }
      }
    }

    // Set frame 0 immediately if available
    if (getFrameUrl(0)) {
      setFrame(0)
    }

    const ctx = gsap.context(() => {
      // Pin the section for 400vh and scrub the frame sequence with 0.1 snapping.
      // Function-based end (re-read on refresh) so the pin distance tracks the real viewport height.
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${window.innerHeight * 4}`, // 400vh
        scrub: 2,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const index = Math.min(
            TOTAL_FRAMES - 1,
            Math.max(0, Math.round(self.progress * (TOTAL_FRAMES - 1))),
          )
          setFrame(index)
        },
      })

      // Scrubbed timeline that fades the three message blocks in and out
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 4}`, // 400vh
          scrub: 1.5,
        },
      })

      OVERLAYS.forEach((block, i) => {
        const el = textRefs.current[i]
        if (!el) return
        tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08, ease: 'none' }, block.from)
        tl.to(el, { autoAlpha: 0, duration: 0.08, ease: 'none' }, block.to)
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [isMobile])

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-forest-deep"
      aria-label="Scroll-driven virtual walkthrough of a Verdant Estates home"
    >
      <img
        ref={imgRef}
        src={initialFrameUrl || getFrameUrl(0)}
        alt="Virtual walkthrough of a modern Verdant Estates home"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* message blocks */}
      {OVERLAYS.map((block, i) => (
        <div
          key={block.key}
          ref={(el) => {
            textRefs.current[i] = el
          }}
          className="absolute bottom-10 left-5 right-5 max-w-xl sm:left-10 md:bottom-16 md:left-16"
        >
          <div className="border-l-4 border-bronze bg-forest p-6 shadow-lift md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-bronze">{block.eyebrow}</p>
            <h2 className="mt-3 font-serif text-2xl font-bold leading-tight text-cream sm:text-3xl md:text-4xl">
              {block.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cream/80 md:text-base">{block.copy}</p>
          </div>
        </div>
      ))}
    </section>
  )
}

export default ScrollHouseTour
