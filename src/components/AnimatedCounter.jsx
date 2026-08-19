import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Animates a number from 0 to `end` when the element scrolls into view.
 * Supports prefixes/suffixes like "₦", "m²", "+", etc.
 *
 * @param {number}  end       – target number
 * @param {object}  [opts]
 * @param {string}  [opts.prefix]  – e.g. "₦"
 * @param {string}  [opts.suffix]  – e.g. "+", "m²"
 * @param {number}  [opts.decimals] – decimal places (default: 0)
 * @param {number}  [opts.duration] – animation duration in seconds (default: 2)
 */
const AnimatedCounter = ({ end, prefix = '', suffix = '', decimals = 0, duration = 2 }) => {
  const ref = useRef(null)
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const obj = { value: 0 }

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          value: end,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            const v = decimals > 0 ? obj.value.toFixed(decimals) : Math.round(obj.value)
            setDisplay(String(v))
          },
        })
      },
    })

    return () => trigger.kill()
  }, [end, decimals, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{display}{suffix}
    </span>
  )
}

export default AnimatedCounter
