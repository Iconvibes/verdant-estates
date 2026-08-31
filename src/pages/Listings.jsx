import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import gsap from 'gsap'
import PropertyCard from '../components/PropertyCard'
import StaggerReveal from '../components/StaggerReveal'
import SubscribeAlerts from '../components/SubscribeAlerts'
import SEO, { breadcrumbSchema } from '../components/SEO'
import useHead from '../hooks/useHead'
import { getAllProperties } from '../data'
import { getFrameUrl } from '../data/frames'
import { CheckIcon, CloseIcon, LinkIcon, SearchIcon } from '../components/icons'

const PRICE_PRESETS = [
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
  { value: '6', label: '6+ beds' },
]

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
]

const numParam = (value) => {
  if (value === null || value === '') return null
  const n = Number(value)
  return Number.isNaN(n) ? null : n
}

const copyText = async (text) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

const Listings = () => {
  const allProperties = getAllProperties()
  const types = useMemo(() => ['All', ...new Set(allProperties.map((p) => p.type))], [allProperties])

  const [toast, setToast] = useState(null)
  const toastRef = useRef(null)
  const toastTimer = useRef(null)
  const [searchParams, setSearchParams] = useSearchParams()

  // read + validate filters from the URL query string
  const rawType = searchParams.get('type')
  const rawSort = searchParams.get('sort')
  const type = types.slice(1).includes(rawType) ? rawType : 'All'
  const minPrice = numParam(searchParams.get('minPrice'))
  const maxPrice = numParam(searchParams.get('maxPrice'))
  const beds = numParam(searchParams.get('beds'))
  const sort = SORT_OPTIONS.some((o) => o.value === rawSort) ? rawSort : 'featured'
  const query = (searchParams.get('q') || '').trim().toLowerCase()

  // drop invalid/unknown params from a shared link (no history entry)
  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    let dirty = false
    if (rawType && !types.slice(1).includes(rawType)) {
      next.delete('type')
      dirty = true
    }
    if (rawSort && !SORT_OPTIONS.some((o) => o.value === rawSort)) {
      next.delete('sort')
      dirty = true
    }
    if (dirty) setSearchParams(next, { replace: true })
  }, [rawType, rawSort, searchParams, setSearchParams, types])

  const updateParams = (patch, options = {}) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === undefined || value === '') next.delete(key)
      else next.set(key, String(value))
    }
    setSearchParams(next, options)
  }

  const setType = (t) => updateParams({ type: t === 'All' ? null : t })
  const setPricePreset = (value) => {
    const preset = PRICE_PRESETS.find((p) => p.value === value) || PRICE_PRESETS[0]
    updateParams({ minPrice: preset.min, maxPrice: preset.max })
  }
  const setBeds = (value) => updateParams({ beds: value === 'any' ? null : value })
  const clearFilters = () => setSearchParams({})

  const copyShareLink = async () => {
    const ok = await copyText(window.location.href)
    setToast(
      ok
        ? 'Link copied to clipboard — filters and sorting included'
        : 'Couldn\u2019t copy automatically — press Ctrl/Cmd+C on the address bar',
    )
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }

  // animate the toast in each time it appears
  useEffect(() => {
    if (!toast || !toastRef.current) return undefined
    const tween = gsap.fromTo(
      toastRef.current,
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' },
    )
    return () => tween.kill()
  }, [toast])

  // clear the auto-hide timer on unmount
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const activePrice = PRICE_PRESETS.find((p) => p.min === minPrice && p.max === maxPrice)?.value || 'any'
  const hasFilters =
    type !== 'All' || minPrice !== null || maxPrice !== null || beds !== null || query !== ''

  useHead({
    title: 'Our Listings',
    description: "Twelve residences, one standard: modern architecture, deep greenery and natural light. Filter by type, price and bedrooms. Every home is available for private viewing.",
    url: 'https://verdantestates.ng/listings',
  })

  const visible = allProperties.filter((p) => {
    if (type !== 'All' && p.type !== type) return false
    if (minPrice !== null && p.price < minPrice) return false
    if (maxPrice !== null && p.price > maxPrice) return false
    if (beds !== null && p.beds < beds) return false
    if (query && !`${p.name} ${p.address}`.toLowerCase().includes(query)) return false
    return true
  })

  const sorted = [...visible].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price
    if (sort === 'price-desc') return b.price - a.price
    if (sort === 'newest') return b.yearBuilt - a.yearBuilt
    return 0 // featured: keep the portfolio's curated order
  })

  return (
    <>
      <section className="relative overflow-hidden bg-forest-deep py-16 md:py-20">
        <img
          src={getFrameUrl(20)}
          alt="Luxury homes in Lagos"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep via-forest-deep/80 to-forest-deep/50" aria-hidden="true" />
        <div className="container-x relative">
          <p className="eyebrow">The Portfolio</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-cream md:text-5xl">Our Listings</h1>
          <p className="mt-4 max-w-2xl text-cream/75">
            Twelve residences, one standard: modern architecture, deep greenery and natural light.
            Every home below is available for private viewing. Filter with the controls — your
            selections are saved in the address bar, so share the link or come back later.
          </p>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-x">
          <div className="rounded-xl border border-cream bg-white p-5 shadow-soft md:p-6">
            {/* search */}
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />
              <input
                type="text"
                value={searchParams.get('q') || ''}
                onChange={(e) => updateParams({ q: e.target.value || null }, { replace: true })}
                placeholder="Search by name or neighbourhood — try “Ikoyi” or “Villa”"
                aria-label="Search listings by name or neighbourhood"
                className="w-full rounded-md border border-cream bg-cream py-2.5 pl-10 pr-10 text-sm text-text outline-none transition-colors placeholder:text-text/40 focus:border-bronze"
              />
              {searchParams.get('q') && (
                <button
                  type="button"
                  onClick={() => updateParams({ q: null }, { replace: true })}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-text/50 transition-colors hover:bg-forest/10 hover:text-forest"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* type chips */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {types.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  aria-pressed={type === t}
                  className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
                    type === t
                      ? 'bg-forest text-cream'
                      : 'bg-cream text-text/70 hover:bg-forest/10 hover:text-forest'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* price + beds + summary */}
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-cream pt-4">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text/60">
                Price
                <select
                  value={activePrice}
                  onChange={(e) => setPricePreset(e.target.value)}
                  aria-label="Filter by price range"
                  className="rounded-md border border-cream bg-cream px-3 py-2 text-sm font-medium normal-case tracking-normal text-text outline-none transition-colors focus:border-bronze"
                >
                  {PRICE_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text/60">
                Beds
                <select
                  value={beds === null ? 'any' : String(beds)}
                  onChange={(e) => setBeds(e.target.value)}
                  aria-label="Filter by number of bedrooms"
                  className="rounded-md border border-cream bg-cream px-3 py-2 text-sm font-medium normal-case tracking-normal text-text outline-none transition-colors focus:border-bronze"
                >
                  {BED_OPTIONS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text/60">
                Sort
                <select
                  value={sort}
                  onChange={(e) => updateParams({ sort: e.target.value === 'featured' ? null : e.target.value })}
                  aria-label="Sort listings"
                  className="rounded-md border border-cream bg-cream px-3 py-2 text-sm font-medium normal-case tracking-normal text-text outline-none transition-colors focus:border-bronze"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="ml-auto flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={copyShareLink}
                  aria-label="Share current filter results"
                  className="flex items-center gap-2 rounded-md border border-cream bg-cream px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text/70 transition-colors hover:border-bronze hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  Share
                </button>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    aria-label="Clear all active filters"
                    className="text-xs font-semibold uppercase tracking-wider text-bronze underline-offset-4 transition-colors hover:text-forest hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                  >
                    Clear All
                  </button>
                )}

              </div>


            </div>
          </div>

          <StaggerReveal key={`${type}-${sort}-${beds}-${minPrice}-${maxPrice}-${query}`} className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </StaggerReveal>

          <SEO
            data={breadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: 'Listings', url: '/listings' },
            ])}
          />

          {visible.length === 0 && (
            <div className="mx-auto mt-16 max-w-md text-center">
              <p className="font-serif text-2xl font-bold">No Homes Match Those Filters</p>
              <p className="mt-3 text-text/70">
                Try a different search term, widening the price range or lowering the bedroom
                count — or clear the filters to see the full portfolio.
              </p>
              <button type="button" onClick={clearFilters} className="btn-forest mt-6">
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-x grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <p className="eyebrow">Stay Updated</p>
            <h2 className="mt-3 font-serif text-3xl font-bold">Don&rsquo;t Miss Your Perfect Home</h2>
            <p className="mt-4 max-w-lg text-text/70">
              New listings sell fast in Lagos. Set an alert and we&rsquo;ll email you the moment
              a home matching your criteria goes live — before it hits the public listings.
            </p>
          </div>
          <SubscribeAlerts
            defaultType={type}
            defaultPrice={activePrice}
          />
        </div>
      </section>

      {/* toast confirmation */}
      {toast && (
        <div
          ref={toastRef}
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-md bg-forest px-5 py-3 text-cream shadow-lift">
            <CheckIcon className="h-4 w-4 shrink-0 text-bronze" />
            <span className="text-sm font-semibold">{toast}</span>
          </div>
        </div>
      )}
    </>
  )
}

export default Listings
