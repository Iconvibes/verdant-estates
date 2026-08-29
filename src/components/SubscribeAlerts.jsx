import { useState } from 'react'
import { subscribeAlert } from '../api'
import { BellIcon, CheckIcon } from './icons'

const PROPERTY_TYPES = ['All', 'Detached Duplex', 'Waterfront Villa', 'Terrace Duplex', 'Penthouse', 'Semi-Detached Duplex', 'Detached Villa', 'Apartment', 'Duplex Apartment', 'Townhouse', 'Detached Bungalow']

const PRICE_OPTIONS = [
  { value: 'any', label: 'Any price', min: null, max: null },
  { value: 'under-300m', label: 'Under ₦300m', min: null, max: 300000000 },
  { value: '300-600m', label: '₦300m – ₦600m', min: 300000000, max: 600000000 },
  { value: '600m-1b', label: '₦600m – ₦1bn', min: 600000000, max: 1000000000 },
  { value: 'over-1b', label: 'Over ₦1bn', min: 1000000000, max: null },
]

const BED_OPTIONS = [
  { value: 'any', label: 'Any bedrooms' },
  { value: '2', label: '2+ beds' },
  { value: '3', label: '3+ beds' },
  { value: '4', label: '4+ beds' },
  { value: '5', label: '5+ beds' },
]

/**
 * Compact or full-width subscription form.
 * @param {'inline' | 'banner'} variant — inline = small card, banner = full CTA section
 */
const SubscribeAlerts = ({ variant = 'inline', defaultType = 'All', defaultPrice = 'any' }) => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState(defaultType)
  const [price, setPrice] = useState(defaultPrice)
  const [beds, setBeds] = useState('any')
  const [area, setArea] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')
  const [expanded, setExpanded] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')

    const pricePreset = PRICE_OPTIONS.find((p) => p.value === price) || PRICE_OPTIONS[0]

    const criteria = {}
    if (type !== 'All') criteria.type = type
    if (pricePreset.min) criteria.minPrice = pricePreset.min
    if (pricePreset.max) criteria.maxPrice = pricePreset.max
    if (beds !== 'any') criteria.beds = Number(beds)
    if (area.trim()) criteria.area = area.trim()

    try {
      const res = await subscribeAlert({ email, name: name || null, criteria })
      setStatus('success')
      setMessage(res.message || 'Alert created successfully!')
      setEmail('')
      setName('')
    } catch (err) {
      setStatus('error')
      setMessage(err.message || 'Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl bg-white p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-bronze">
            <CheckIcon className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h3 className="font-serif text-lg font-bold text-forest">Alert Set!</h3>
            <p className="mt-1 text-sm text-text/70">{message}</p>
            <button
              type="button"
              onClick={() => { setStatus('idle'); setMessage('') }}
              aria-label="Create another alert"
              className="mt-3 text-xs font-semibold uppercase tracking-wider text-bronze hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"
            >
              Create another alert
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <section className="relative overflow-hidden bg-forest py-12 md:py-16">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-bronze/10" aria-hidden="true" />
        <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-cream/5" aria-hidden="true" />
        <div className="container-x relative">
          <div className="mx-auto max-w-2xl text-center">
            <span className="flex mx-auto h-14 w-14 items-center justify-center rounded-full bg-bronze/20 text-bronze">
              <BellIcon className="h-7 w-7" />
            </span>
            <h2 className="mt-5 font-serif text-3xl font-bold text-cream md:text-4xl">
              Never Miss a Listing
            </h2>
            <p className="mt-4 text-cream/75">
              Tell us what you&rsquo;re looking for and we&rsquo;ll email you the moment a matching home appears.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 mx-auto max-w-lg text-left">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="alert-name-banner" className="mb-1.5 block text-xs font-semibold text-cream/80">
                    Name (optional)
                  </label>
                  <input
                    id="alert-name-banner"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-md border border-cream/20 bg-forest-deep px-4 py-2.5 text-sm text-cream outline-none transition-colors placeholder:text-cream/40 focus:border-bronze"
                  />
                </div>
                <div>
                  <label htmlFor="alert-email-banner" className="mb-1.5 block text-xs font-semibold text-cream/80">
                    Email <span className="text-bronze">*</span>
                  </label>
                  <input
                    id="alert-email-banner"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-md border border-cream/20 bg-forest-deep px-4 py-2.5 text-sm text-cream outline-none transition-colors placeholder:text-cream/40 focus:border-bronze"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
                aria-controls="alert-filters-banner"
                className="mt-4 flex items-center gap-2 text-xs font-semibold text-bronze transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"
              >
                <svg className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
                {expanded ? 'Hide filters' : 'Set specific filters'}
              </button>

              {expanded && (
                <div id="alert-filters-banner" className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-wider text-cream/60">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full rounded-md border border-cream/20 bg-forest-deep px-3 py-2 text-sm text-cream outline-none focus:border-bronze"
                    >
                      {PROPERTY_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-wider text-cream/60">Price</label>
                    <select
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-md border border-cream/20 bg-forest-deep px-3 py-2 text-sm text-cream outline-none focus:border-bronze"
                    >
                      {PRICE_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-wider text-cream/60">Bedrooms</label>
                    <select
                      value={beds}
                      onChange={(e) => setBeds(e.target.value)}
                      className="w-full rounded-md border border-cream/20 bg-forest-deep px-3 py-2 text-sm text-cream outline-none focus:border-bronze"
                    >
                      {BED_OPTIONS.map((b) => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <p className="mt-3 rounded-md bg-red-500/10 px-4 py-2 text-xs text-red-300">{message}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                aria-label="Subscribe to email alerts"
                className="btn-bronze mt-5 w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"
              >
                {status === 'loading' ? 'Subscribing…' : 'Get Notified'}
              </button>
            </form>
          </div>
        </div>
      </section>
    )
  }

  // --- Inline variant (small card) ---
  return (
    <div className="rounded-xl bg-cream p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-forest text-bronze">
          <BellIcon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-serif text-lg font-bold text-forest">New Listing Alerts</h3>
          <p className="text-xs text-text/60">Get notified when matching homes appear</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md border border-cream bg-white px-4 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text/40 focus:border-bronze"
        />

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls="alert-filters-inline"
          className="flex items-center gap-2 text-xs font-semibold text-bronze transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"
        >
          <svg className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
          {expanded ? 'Hide filters' : 'Set specific filters'}
        </button>

        {expanded && (
          <div id="alert-filters-inline" className="space-y-2 rounded-md bg-white p-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md border border-cream bg-cream px-3 py-2 text-sm text-text outline-none focus:border-bronze"
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{t === 'All' ? 'Any type' : t}</option>
              ))}
            </select>
            <select
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-md border border-cream bg-cream px-3 py-2 text-sm text-text outline-none focus:border-bronze"
            >
              {PRICE_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <select
              value={beds}
              onChange={(e) => setBeds(e.target.value)}
              className="w-full rounded-md border border-cream bg-cream px-3 py-2 text-sm text-text outline-none focus:border-bronze"
            >
              {BED_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>
        )}

        {status === 'error' && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{message}</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          aria-label="Subscribe to email alerts"
          className="btn-forest w-full !py-2.5 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          {status === 'loading' ? 'Subscribing…' : 'Subscribe to Alerts'}
        </button>
      </form>
    </div>
  )
}

export default SubscribeAlerts
