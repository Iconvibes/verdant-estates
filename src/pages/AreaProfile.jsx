import { Link, useParams } from 'react-router-dom'
import { getAreaById, getAreaListings, getAllAreas } from '../data'
import { useCurrency } from '../context/CurrencyContext'
import PropertyCard from '../components/PropertyCard'
import StaggerReveal from '../components/StaggerReveal'
import SEO, { breadcrumbSchema } from '../components/SEO'
import useHead from '../hooks/useHead'
import {
  CheckIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldIcon,
  StarIcon,
  TreeIcon,
  UsersIcon,
  WalkIcon,
} from '../components/icons'

const AreaProfile = () => {
  const { id } = useParams()
  const { formatPrice } = useCurrency()
  const area = getAreaById(id)
  const listings = area ? getAreaListings(area.id) : []
  const allAreas = getAllAreas()
  const otherAreas = allAreas.filter((a) => a.id !== id).slice(0, 3)

  useHead(
    area
      ? {
          title: `${area.name} — Lagos Neighbourhood Guide`,
          description: `${area.tagline}. Walkability ${area.walkabilityScore}/100, Safety ${area.safetyRating}/10. ${listings.length} available homes. Schools, restaurants and amenities.`,
          image: area.image,
          url: `https://verdantestates.ng/areas/${area.id}`,
        }
      : { title: 'Area Not Found', noIndex: true },
  )

  if (!area) {
    return (
      <>
        <SEO
          data={breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Areas', url: '/areas' },
            { name: 'Not Found', url: '/areas' },
          ])}
        />
        <section className="section bg-cream">
          <div className="container-x mx-auto max-w-xl text-center">
            <h1 className="font-serif text-4xl font-bold">Area Not Found</h1>
            <p className="mt-4 text-text/70">
              We couldn&rsquo;t find that neighbourhood guide.
            </p>
            <Link to="/areas" className="btn-forest mt-8">
              Back to Guides
            </Link>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-forest-deep py-20 md:py-28">
        <img
          src={area.image}
          alt={`${area.name}, Lagos`}
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/60 via-forest-deep/80 to-forest-deep" aria-hidden="true" />
        <div className="container-x relative">
          <nav className="text-xs font-semibold uppercase tracking-wider text-cream/60">
            <Link to="/" className="hover:text-bronze">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/areas" className="hover:text-bronze">Areas</Link>
            <span className="mx-2">/</span>
            <span className="text-bronze">{area.name}</span>
          </nav>
          <h1 className="mt-6 max-w-3xl font-serif text-4xl font-bold leading-tight text-cream md:text-5xl">
            {area.name}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-cream/80">{area.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <span className="rounded-full bg-bronze/20 px-4 py-2 text-sm font-semibold text-bronze">
              Average: {formatPrice(area.averagePrice)}
            </span>
            <span className="rounded-full bg-cream/10 px-4 py-2 text-sm text-cream/80">
              Range: {area.priceRange}
            </span>
          </div>
        </div>
      </section>

      {/* Score cards */}
      <section className="section bg-cream">
        <div className="container-x">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <ScoreCard icon={WalkIcon} value={area.walkabilityScore} max={100} label="Walkability" />
            <ScoreCard icon={ShieldIcon} value={area.safetyRating} max={10} label="Safety" />
            <ScoreCard icon={UsersIcon} value={area.familyFriendliness} max={10} label="Family" />
            <ScoreCard icon={TreeIcon} value={area.greenSpaces} max={10} label="Green Spaces" />
          </div>
        </div>
      </section>

      {/* About + Highlights */}
      <section className="section bg-white">
        <div className="container-x grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow">The Neighbourhood</p>
            <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">About {area.name}</h2>
            <p className="mt-6 leading-relaxed text-text/80">{area.description}</p>
            <p className="mt-4 rounded-md bg-cream p-4 text-sm italic text-text/70">
              &ldquo;{area.vibe}&rdquo;
            </p>
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold">Key Highlights</h3>
            <ul className="mt-4 space-y-3">
              {area.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-sm text-text/80">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Schools + Restaurants side by side */}
      <section className="section bg-cream">
        <div className="container-x grid gap-8 lg:grid-cols-2">
          {/* Schools */}
          <div className="rounded-xl bg-white p-6 shadow-soft">
            <h3 className="font-serif text-xl font-bold text-forest">Nearby Schools</h3>
            <ul className="mt-4 space-y-3">
              {area.schools.map((s) => (
                <li key={s.name} className="flex items-center justify-between rounded-lg bg-cream p-3">
                  <div>
                    <p className="text-sm font-semibold text-forest">{s.name}</p>
                    <p className="text-xs text-text/60">{s.type}</p>
                  </div>
                  <span className="text-xs font-semibold text-bronze">{s.distance}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Restaurants */}
          <div className="rounded-xl bg-white p-6 shadow-soft">
            <h3 className="font-serif text-xl font-bold text-forest">Top Restaurants</h3>
            <ul className="mt-4 space-y-3">
              {area.restaurants.map((r) => (
                <li key={r.name} className="flex items-center justify-between rounded-lg bg-cream p-3">
                  <div>
                    <p className="text-sm font-semibold text-forest">{r.name}</p>
                    <p className="text-xs text-text/60">{r.cuisine}</p>
                  </div>
                  <span className="text-xs font-semibold text-bronze">{r.price}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Amenities + Transport */}
      <section className="section bg-white">
        <div className="container-x grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="font-serif text-xl font-bold">Amenities & Lifestyle</h3>
            <ul className="mt-4 space-y-2.5">
              {area.amenities.map((a) => (
                <li key={a} className="flex items-start gap-3 text-sm text-text/80">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold">Getting Around</h3>
            <ul className="mt-4 space-y-2.5">
              {area.transport.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-text/80">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Listings in this area */}
      {listings.length > 0 && (
        <section className="section bg-cream">
          <div className="container-x">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Available Now</p>
                <h2 className="mt-3 font-serif text-3xl font-bold">Homes in {area.name}</h2>
                <p className="mt-4 text-text/70">
                  {listings.length} {listings.length === 1 ? 'property' : 'properties'} currently listed in this neighbourhood.
                </p>
              </div>
              <Link to="/listings" className="btn-forest !py-3 text-xs">
                All Listings
              </Link>
            </div>
            <StaggerReveal className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {listings.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </StaggerReveal>
          </div>
        </section>
      )}

      {/* Explore other areas */}
      <section className="section bg-white">
        <div className="container-x">
          <h2 className="font-serif text-3xl font-bold">Explore Other Areas</h2>
          <StaggerReveal className="mt-8 grid gap-8 md:grid-cols-3">
            {otherAreas.map((a) => (
              <Link
                key={a.id}
                to={`/areas/${a.id}`}
                className="group relative block aspect-[16/10] overflow-hidden rounded-xl"
              >
                <img
                  src={a.image}
                  alt={a.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5">
                  <h3 className="font-serif text-xl font-bold text-cream">{a.name}</h3>
                  <p className="text-sm text-cream/80">{a.tagline}</p>
                </div>
              </Link>
            ))}
          </StaggerReveal>
        </div>
      </section>

      <SEO
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Areas', url: '/areas' },
          { name: area.name, url: `/areas/${area.id}` },
        ])}
      />
    </>
  )
}

const ScoreCard = ({ icon: Icon, value, max, label }) => (
  <div className="flex flex-col items-center rounded-xl bg-white p-6 shadow-soft text-center">
    <Icon className="h-6 w-6 text-bronze" />
    <p className="mt-3 font-serif text-3xl font-bold text-forest">
      {value}
      <span className="text-base text-text/40">/{max}</span>
    </p>
    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-text/60">{label}</p>
    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-cream">
      <div
        className="h-full rounded-full bg-bronze transition-all duration-700"
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  </div>
)

export default AreaProfile
