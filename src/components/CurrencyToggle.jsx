import { useRef, useState, useEffect } from 'react'
import { useCurrency } from '../context/CurrencyContext'

/**
 * Compact dropdown that toggles between NGN, USD, and GBP.
 * Designed for the navbar — minimal footprint, keyboard accessible.
 */
const CurrencyToggle = () => {
  const { currency, setCurrency, options } = useCurrency()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return undefined
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return undefined
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const current = options.find((o) => o.code === currency) || options[0]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`Currency: ${current.code}. Click to change.`}
        className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-bold tracking-wide text-cream/90 transition-colors hover:bg-cream/10 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"
      >
        <span className="text-bronze">{current.symbol}</span>
        <span>{current.code}</span>
        <svg
          className={`h-3 w-3 text-cream/50 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[60] mt-1 w-36 overflow-hidden rounded-lg border border-cream/10 bg-forest-deep shadow-lift">
          {options.map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={() => { setCurrency(opt.code); setOpen(false) }}
              className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
                currency === opt.code
                  ? 'bg-bronze/20 text-bronze'
                  : 'text-cream/80 hover:bg-cream/5 hover:text-cream'
              }`}
            >
              <span className="w-5 text-center font-bold">{opt.symbol}</span>
              <span className="font-semibold">{opt.code}</span>
              {currency === opt.code && (
                <svg className="ml-auto h-4 w-4 text-bronze" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m4 12.5 5 5L20 6.5" />
                </svg>
              )}
            </button>
          ))}
          <div className="border-t border-cream/10 px-4 py-2">
            <p className="text-[0.6rem] leading-relaxed text-cream/40">
              Rates are indicative and updated periodically.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CurrencyToggle
