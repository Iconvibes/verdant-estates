import { Link, Navigate } from 'react-router-dom'
import { useCompare } from '../context/CompareContext'
import { getPropertyById } from '../data'
import { useCurrency } from '../context/CurrencyContext'
import useHead from '../hooks/useHead'
import {
  AreaIcon,
  BathIcon,
  BedIcon,
  CheckIcon,
  ClockIcon,
  HeartIcon,
  MapPinIcon,
} from '../components/icons'

const Compare = () => {
  const { compareIds, removeCompare, clearCompare } = useCompare()
  const { formatPrice } = useCurrency()
  const properties = compareIds.map((id) => getPropertyById(id)).filter(Boolean)

  useHead({
    title: 'Compare Properties',
    description: 'Compare Verdant Estates properties side by side — beds, price, area, features and more.',
    url: 'https://verdantestates.ng/compare',
    noIndex: true,
  })

  // Redirect if fewer than 2 properties selected
  if (properties.length < 2) {
    return <Navigate to="/listings" replace />
  }

  // Collect all unique features across compared properties
  const allFeatures = [...new Set(properties.flatMap((p) => p.features || []))]

  // Find best values for highlighting
  const bestPrice = Math.min(...properties.map((p) => p.price))
  const bestBeds = Math.max(...properties.map((p) => p.beds))
  const bestBaths = Math.max(...properties.map((p) => p.baths))
  const bestArea = Math.max(...properties.map((p) => p.area))

  return (
    <>
      <section className="bg-forest-deep py-12 md:py-16">
        <div className="container-x flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Side by Side</p>
            <h1 className="mt-3 font-serif text-4xl font-bold text-cream md:text-5xl">
              Compare Properties
            </h1>
            <p className="mt-4 max-w-2xl text-cream/75">
              {properties.length} {properties.length === 1 ? 'home' : 'homes'} selected.
              Best values in each category are highlighted.
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={clearCompare} className="btn-outline-cream !py-2.5 text-xs">
              Clear All
            </button>
            <Link to="/listings" className="btn-bronze !py-2.5 text-xs">
              Add Another
            </Link>
          </div>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-x overflow-x-auto">
          {/* Property headers */}
          <div className={`grid gap-6`} style={{ gridTemplateColumns: `repeat(${properties.length}, minmax(240px, 1fr))` }}>
            {properties.map((p) => (
              <div key={p.id} className="relative overflow-hidden rounded-xl bg-white shadow-soft">
                <Link to={`/listing/${p.id}`} className="block">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="aspect-[16/10] w-full object-cover"
                  />
                </Link>
                <div className="p-5">
                  <p className="font-serif text-xl font-bold text-forest">{formatPrice(p.price)}</p>
                  <h2 className="mt-1 font-serif text-lg font-bold">
                    <Link to={`/listing/${p.id}`} className="transition-colors hover:text-bronze">
                      {p.name}
                    </Link>
                  </h2>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-text/70">
                    <MapPinIcon className="h-4 w-4 text-bronze" /> {p.address}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeCompare(p.id)}
                  className="absolute right-3 top-3 rounded-full bg-forest/85 p-2 text-cream transition-colors hover:bg-forest"
                  aria-label={`Remove ${p.name} from comparison`}
                >
                  <span className="sr-only">Remove</span>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Stats comparison */}
          <div className="mt-10 overflow-hidden rounded-xl bg-white shadow-soft">
            <h3 className="border-b border-cream px-6 py-4 font-serif text-lg font-bold text-forest">
              Key Details
            </h3>
            <div className="divide-y divide-cream">
              {/* Price */}
              <div className="grid items-center gap-4 px-6 py-4" style={{ gridTemplateColumns: `140px repeat(${properties.length}, 1fr)` }}>
                <span className="text-sm font-semibold uppercase tracking-wider text-text/60">Price</span>
                {properties.map((p) => (
                  <span
                    key={p.id}
                    className={`font-serif text-xl font-bold ${p.price === bestPrice ? 'text-bronze' : 'text-forest'}`}
                  >
                    {formatPrice(p.price)}
                    {p.price === bestPrice && properties.length > 1 && (
                      <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-bronze">Best</span>
                    )}
                  </span>
                ))}
              </div>

              {/* Beds */}
              <div className="grid items-center gap-4 px-6 py-4" style={{ gridTemplateColumns: `140px repeat(${properties.length}, 1fr)` }}>
                <span className="text-sm font-semibold uppercase tracking-wider text-text/60">Bedrooms</span>
                {properties.map((p) => (
                  <span key={p.id} className="flex items-center gap-2">
                    <BedIcon className={`h-5 w-5 ${p.beds === bestBeds ? 'text-bronze' : 'text-text/40'}`} />
                    <span className={`font-serif text-xl font-bold ${p.beds === bestBeds ? 'text-bronze' : 'text-forest'}`}>
                      {p.beds}
                    </span>
                  </span>
                ))}
              </div>

              {/* Baths */}
              <div className="grid items-center gap-4 px-6 py-4" style={{ gridTemplateColumns: `140px repeat(${properties.length}, 1fr)` }}>
                <span className="text-sm font-semibold uppercase tracking-wider text-text/60">Bathrooms</span>
                {properties.map((p) => (
                  <span key={p.id} className="flex items-center gap-2">
                    <BathIcon className={`h-5 w-5 ${p.baths === bestBaths ? 'text-bronze' : 'text-text/40'}`} />
                    <span className={`font-serif text-xl font-bold ${p.baths === bestBaths ? 'text-bronze' : 'text-forest'}`}>
                      {p.baths}
                    </span>
                  </span>
                ))}
              </div>

              {/* Area */}
              <div className="grid items-center gap-4 px-6 py-4" style={{ gridTemplateColumns: `140px repeat(${properties.length}, 1fr)` }}>
                <span className="text-sm font-semibold uppercase tracking-wider text-text/60">Living Area</span>
                {properties.map((p) => (
                  <span key={p.id} className="flex items-center gap-2">
                    <AreaIcon className={`h-5 w-5 ${p.area === bestArea ? 'text-bronze' : 'text-text/40'}`} />
                    <span className={`font-serif text-xl font-bold ${p.area === bestArea ? 'text-bronze' : 'text-forest'}`}>
                      {p.area} m²
                    </span>
                  </span>
                ))}
              </div>

              {/* Type */}
              <div className="grid items-center gap-4 px-6 py-4" style={{ gridTemplateColumns: `140px repeat(${properties.length}, 1fr)` }}>
                <span className="text-sm font-semibold uppercase tracking-wider text-text/60">Type</span>
                {properties.map((p) => (
                  <span key={p.id} className="font-semibold text-forest">{p.type}</span>
                ))}
              </div>

              {/* Year Built */}
              <div className="grid items-center gap-4 px-6 py-4" style={{ gridTemplateColumns: `140px repeat(${properties.length}, 1fr)` }}>
                <span className="text-sm font-semibold uppercase tracking-wider text-text/60">Built</span>
                {properties.map((p) => (
                  <span key={p.id} className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-text/40" />
                    <span className="font-serif text-xl font-bold text-forest">{p.yearBuilt}</span>
                  </span>
                ))}
              </div>

              {/* Price per m² */}
              <div className="grid items-center gap-4 px-6 py-4" style={{ gridTemplateColumns: `140px repeat(${properties.length}, 1fr)` }}>
                <span className="text-sm font-semibold uppercase tracking-wider text-text/60">Price / m²</span>
                {properties.map((p) => {
                  const ppm = Math.round(p.price / p.area)
                  return (
                    <span key={p.id} className="font-serif text-lg font-bold text-forest">
                      {formatPrice(ppm)}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Features checklist */}
          <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-soft">
            <h3 className="border-b border-cream px-6 py-4 font-serif text-lg font-bold text-forest">
              Features & Amenities
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text/60">
                      Feature
                    </th>
                    {properties.map((p) => (
                      <th key={p.id} className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text/60">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream">
                  {allFeatures.map((feature) => (
                    <tr key={feature} className="hover:bg-cream/50 transition-colors">
                      <td className="px-6 py-3.5 text-sm text-text/85">{feature}</td>
                      {properties.map((p) => (
                        <td key={p.id} className="px-6 py-3.5 text-center">
                          {p.features?.includes(feature) ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-forest/10">
                              <CheckIcon className="h-3.5 w-3.5 text-forest" />
                            </span>
                          ) : (
                            <span className="text-text/20">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CTAs */}
          <div className={`mt-8 grid gap-4`} style={{ gridTemplateColumns: `repeat(${properties.length}, 1fr)` }}>
            {properties.map((p) => (
              <Link
                key={p.id}
                to={`/listing/${p.id}`}
                className="btn-forest w-full text-xs"
              >
                View {p.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Compare
