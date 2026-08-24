import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getPropertyById, getAllProperties } from '../data'
import { useCurrency } from '../context/CurrencyContext'
import PropertyCard from '../components/PropertyCard'
import ShareButtons from '../components/ShareButtons'
import SEO, { listingSchema, breadcrumbSchema } from '../components/SEO'
import MortgageCalculator from '../components/MortgageCalculator'
import FloorPlanTab from '../components/FloorPlanViewer'
import RecentlyViewed from '../components/RecentlyViewed'
import StaggerReveal from '../components/StaggerReveal'
import useHead from '../hooks/useHead'
import useRecentlyViewed from '../hooks/useRecentlyViewed'
import { useSavedHomes } from '../context/SavedHomesContext'
import { getFrameUrl, TOTAL_FRAMES } from '../data/frames'
gsap.registerPlugin(ScrollTrigger)

import {
  AreaIcon,
  ArrowRightIcon,
  BathIcon,
  BedIcon,
  CheckIcon,
  ClockIcon,
  HeartIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from '../components/icons'

const ListingDetail = () => {
  const { id } = useParams()
  const { formatPrice } = useCurrency()
  const property = getPropertyById(id)
  const { isSaved, toggleSaved } = useSavedHomes()
  const { recentIds, trackView, clearRecent } = useRecentlyViewed()
  const saved = property ? isSaved(property.id) : false

  // three interior shots from the walkthrough sequence, deterministic per property
  const interiorShots = useMemo(() => {
    if (!property) return []
    const start = (property.id * 37) % Math.max(TOTAL_FRAMES - 45, 1)
    return [start, start + 15, start + 30].map((i) => getFrameUrl(i % TOTAL_FRAMES))
  }, [property])

  const [activeImage, setActiveImage] = useState(property ? property.image : null)
  const [viewTab, setViewTab] = useState('gallery') // 'gallery' | 'floorplan'

  // Parallax refs
  const heroRef = useRef(null)
  const heroImgRef = useRef(null)
  const galleryRef = useRef(null)

  useLayoutEffect(() => {
    if (!property) return undefined

    const ctx = gsap.context(() => {
      // Hero image parallax — moves slower than scroll
      if (heroImgRef.current) {
        gsap.fromTo(
          heroImgRef.current,
          { yPercent: -15 },
          {
            yPercent: 15,
            ease: 'none',
            scrollTrigger: {
              trigger: heroRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      }

      // Gallery image — subtle parallax on scroll
      if (galleryRef.current) {
        gsap.fromTo(
          galleryRef.current,
          { y: 0 },
          {
            y: 30,
            ease: 'none',
            scrollTrigger: {
              trigger: galleryRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        )
      }
    })

    return () => ctx.revert()
  }, [property])

  useHead(
    property
      ? {
          title: `${property.name} — ${formatPrice(property.price)}`,
          description: property.tagline || property.description?.slice(0, 160),
          image: property.image,
          url: `https://verdantestates.ng/listing/${property.id}`,
          type: 'article',
        }
      : { title: 'Listing Not Found', noIndex: true },
  )

  // Track this property as recently viewed
  useEffect(() => {
    if (property) trackView(property.id)
  }, [property, trackView])

  if (!property) {
    return (
      <>
        <SEO
          data={breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Listings', url: '/listings' },
            { name: 'Not Found', url: '/listings' },
          ])}
        />
        <section className="section bg-cream">
          <div className="container-x mx-auto max-w-xl text-center">
            <h1 className="font-serif text-4xl font-bold">Home Not Found</h1>
            <p className="mt-4 text-text/70">
              We couldn&rsquo;t find that listing — it may have sold or the link is out of date.
            </p>
            <Link to="/listings" className="btn-forest mt-8">
              Back to Listings
            </Link>
          </div>
        </section>
      </>
    )
  }

  const gallery = [property.image, ...interiorShots]
  const related = getAllProperties().filter((p) => p.id !== property.id).slice(0, 3)

  return (
    <>
      <section ref={heroRef} className="relative overflow-hidden bg-forest-deep py-10 md:py-16">
        <img
          ref={heroImgRef}
          src={property.image}
          alt=""
          className="absolute inset-0 h-[120%] w-full object-cover opacity-25 will-change-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/60 via-forest-deep/80 to-forest-deep" aria-hidden="true" />
        <div className="container-x relative">
          <nav className="text-xs font-semibold uppercase tracking-wider text-cream/60">
            <Link to="/" className="hover:text-bronze">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/listings" className="hover:text-bronze">Listings</Link>
            <span className="mx-2">/</span>
            <span className="text-bronze">{property.name}</span>
          </nav>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
            {/* LEFT: gallery / floorplan + details */}
            <div>
              {/* Tab Switcher */}
              <div className="mb-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setViewTab('gallery')}
                  className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    viewTab === 'gallery'
                      ? 'bg-forest text-cream'
                      : 'bg-cream text-text/70 hover:bg-forest/10 hover:text-forest'
                  }`}
                >
                  Gallery
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab('floorplan')}
                  className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    viewTab === 'floorplan'
                      ? 'bg-forest text-cream'
                      : 'bg-cream text-text/70 hover:bg-forest/10 hover:text-forest'
                  }`}
                >
                  Floor Plan
                </button>
              </div>

              {viewTab === 'gallery' ? (
                <>
                  <div className="overflow-hidden rounded-xl bg-forest-deep shadow-lift">
                    <img
                      ref={galleryRef}
                      src={activeImage}
                      alt={property.name}
                     
                      className="aspect-[16/10] w-full object-cover will-change-transform"
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
                    {gallery.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImage(src)}
                       
                        className={`overflow-hidden rounded-lg transition-all duration-200 ${
                          activeImage === src
                            ? 'ring-2 ring-bronze ring-offset-2 ring-offset-cream'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={src} alt={`${property.name} view ${i + 1}`} className="aspect-[4/3] w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <FloorPlanTab property={property} />
              )}

              <div className="mt-10">
                <p className="eyebrow">About This Home</p>
                <h2 className="mt-2 font-serif text-3xl font-bold">{property.name}</h2>
                <p className="mt-2 flex items-center gap-2 text-text/70">
                  <MapPinIcon className="h-4 w-4 text-bronze" /> {property.address}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-white p-6 shadow-soft sm:grid-cols-4">
                  <div>
                    <BedIcon className="h-5 w-5 text-bronze" />
                    <p className="mt-2 font-serif text-xl font-bold">{property.beds}</p>
                    <p className="text-xs uppercase tracking-wider text-text/60">Bedrooms</p>
                  </div>
                  <div>
                    <BathIcon className="h-5 w-5 text-bronze" />
                    <p className="mt-2 font-serif text-xl font-bold">{property.baths}</p>
                    <p className="text-xs uppercase tracking-wider text-text/60">Bathrooms</p>
                  </div>
                  <div>
                    <AreaIcon className="h-5 w-5 text-bronze" />
                    <p className="mt-2 font-serif text-xl font-bold">{property.area} m²</p>
                    <p className="text-xs uppercase tracking-wider text-text/60">Living Area</p>
                  </div>
                  <div>
                    <ClockIcon className="h-5 w-5 text-bronze" />
                    <p className="mt-2 font-serif text-xl font-bold">{property.yearBuilt}</p>
                    <p className="text-xs uppercase tracking-wider text-text/60">Built</p>
                  </div>
                </div>

                <p className="mt-8 leading-relaxed text-text/80">{property.description}</p>

                <div className="mt-10">
                  <h3 className="font-serif text-2xl font-bold">Features &amp; Amenities</h3>
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {property.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-text/85">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* RIGHT: price card + agent */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl bg-white p-8 shadow-lift">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-bronze">Offered At</p>
                <p className="mt-2 font-serif text-4xl font-bold text-forest">{formatPrice(property.price)}</p>
                <p className="mt-1 text-sm text-text/60">{property.type} · For Sale</p>

                <Link to="/contact" className="btn-forest mt-7 w-full">
                  Book a Tour <ArrowRightIcon className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => toggleSaved(property.id)}
                  aria-pressed={saved}
                  className={`mt-3 w-full ${saved ? 'btn-bronze' : 'btn-outline-forest'}`}
                >
                  <HeartIcon className="h-4 w-4" filled={saved} />
                  {saved ? 'Saved — Remove from Wishlist' : 'Save This Home'}
                </button>

                <div className="mt-4">
                  <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-wider text-text/50">Share this property</p>
                  <ShareButtons property={property} variant="full" />
                </div>

                <div className="mt-8 border-t border-cream pt-6">
                  <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forest font-serif text-lg font-bold text-bronze">
                      {property.agent.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                    <div>
                      <p className="font-serif text-lg font-bold text-forest">{property.agent.name}</p>
                      <p className="text-xs uppercase tracking-wider text-text/60">{property.agent.role}</p>
                    </div>
                  </div>
                  <ul className="mt-5 space-y-3 text-sm text-text/80">
                    <li className="flex items-center gap-3">
                      <PhoneIcon className="h-4 w-4 text-bronze" />
                      <a href={`tel:${property.agent.phone.replace(/\s/g, '')}`} className="hover:text-bronze">
                        {property.agent.phone}
                      </a>
                    </li>
                    <li className="flex items-center gap-3">
                      <MailIcon className="h-4 w-4 text-bronze" />
                      <a href={`mailto:${property.agent.email}`} className="break-all hover:text-bronze">
                        {property.agent.email}
                      </a>
                    </li>
                  </ul>
                  <p className="mt-5 rounded-md bg-cream p-4 text-xs leading-relaxed text-text/70">
                    Viewings are private and arranged at your convenience. Ask about our
                    virtual walkthrough option — the full tour is available on the home page.
                  </p>
                </div>
              </div>
            </aside>
          </div>

          {/* MORTGAGE CALCULATOR */}
          <div className="mt-12 lg:mt-16 lg:grid lg:grid-cols-[1fr_400px] lg:gap-12">
            <div />
            <MortgageCalculator price={property.price} />
          </div>
        </div>
      </section>

      {/* RELATED */}
      <SEO data={listingSchema(property)} />
      <SEO data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Listings', url: '/listings' },
        { name: property.name, url: `/listing/${property.id}` },
      ])} />
      <section className="section bg-white">
        <div className="container-x">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Keep Exploring</p>
              <h2 className="mt-3 font-serif text-3xl font-bold">Similar Homes</h2>
            </div>
            <Link to="/listings" className="btn-forest !py-3 text-xs">
              All Listings
            </Link>
          </div>
          <StaggerReveal className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </StaggerReveal>
        </div>
      </section>

      <RecentlyViewed
        ids={recentIds}
        excludeId={property.id}
        onClear={clearRecent}
      />
    </>
  )
}

export default ListingDetail
