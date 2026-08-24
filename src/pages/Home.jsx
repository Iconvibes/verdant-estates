import { Link } from 'react-router-dom'
import ScrollHouseTour from '../components/ScrollHouseTour'
import PropertyCard from '../components/PropertyCard'
import AnimatedCounter from '../components/AnimatedCounter'
import StaggerReveal from '../components/StaggerReveal'
import SubscribeAlerts from '../components/SubscribeAlerts'
import Testimonials from '../components/Testimonials'
import SEO, { organisationSchema } from '../components/SEO'
import useHead from '../hooks/useHead'
import { getAllProperties } from '../data'
import { getFrameUrl } from '../data/frames'
import { ArrowRightIcon, KeyIcon, LeafIcon, ShieldIcon, SunIcon } from '../components/icons'

const stats = [
  { end: 12, suffix: '', label: 'Exclusive estates in Lagos' },
  { end: 200, suffix: '+', label: 'Homes sold and delivered' },
  { end: 4.9, suffix: '', decimals: 1, label: 'Average client rating' },
  { end: 15, suffix: '', label: 'Years in the Lagos market' },
]

const values = [
  {
    icon: LeafIcon,
    title: 'Biophilic Design',
    copy: 'Homes organised around gardens, courtyards and native planting — greenery you can see from every window.',
  },
  {
    icon: SunIcon,
    title: 'Solar-Ready Living',
    copy: 'Every residence ships with rooftop solar capacity, smart metering and battery-ready wiring for true independence.',
  },
  {
    icon: ShieldIcon,
    title: 'Security That Sleeps',
    copy: 'Gated streets, 24-hour guardhouses and layered access control — luxury you never have to think twice about.',
  },
  {
    icon: KeyIcon,
    title: 'White-Glove Sales',
    copy: 'From first viewing to handover, one dedicated partner manages title checks, documentation and furnishing.',
  },
]

const Home = () => {
  const featured = getAllProperties().slice(0, 3)

  useHead({
    title: 'Sustainable Luxury Homes in Lagos',
    description: "Verdant Estates curates Lagos's most serene addresses — light-filled modern homes wrapped in greenery, from Ikoyi to Banana Island. Browse 12 exclusive listings.",
    image: getFrameUrl(0),
    url: 'https://verdantestates.ng',
  })

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-forest-deep">
        <img
          src={getFrameUrl(0)}
          alt="A modern luxury home surrounded by lush greenery, showcasing the Verdant Estates design philosophy"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/70 via-forest/40 to-cream" aria-hidden="true" />

        <div className="container-x relative py-24">
          <p className="eyebrow">Sustainable Luxury Living · Lagos</p>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl font-bold leading-tight text-cream sm:text-5xl md:text-6xl">
            Homes Where Nature and <span className="text-bronze">Luxury</span> Meet
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/85">
            Verdant Estates curates Lagos&rsquo;s most serene addresses — light-filled modern
            homes wrapped in greenery, minutes from the city&rsquo;s best schools, beaches and business districts.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link to="/listings" className="btn-bronze">
              Browse Listings <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="btn-outline-cream">
              Book a Private Tour
            </Link>
          </div>

          <div className="mt-16 grid max-w-3xl grid-cols-2 gap-6 border-t border-cream/20 pt-8 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-serif text-3xl font-bold text-bronze">
                  <AnimatedCounter end={s.end} suffix={s.suffix} decimals={s.decimals} />
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-cream/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PINNED SCROLL WALKTHROUGH */}
      <ScrollHouseTour />

      {/* FEATURED LISTINGS */}
      <section className="section bg-cream">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Featured Estates</p>
              <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">This Season&rsquo;s Favourites</h2>
              <p className="mt-4 max-w-xl text-text/70">
                A first look at the residences our clients are touring this month — from Ikoyi
                duplexes to Banana Island waterfront villas.
              </p>
            </div>
            <Link to="/listings" className="btn-forest !py-3 text-xs">
              View All 12 Listings
            </Link>
          </div>

          <StaggerReveal className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* WHY VERDANT */}
      <section className="section bg-white">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">The Verdant Standard</p>
            <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">Why Lagos Chooses Us</h2>
            <p className="mt-4 text-text/70">
              We build and sell homes for people who want the city&rsquo;s energy and the forest&rsquo;s
              quiet — without compromising either.
            </p>
          </div>

          <StaggerReveal className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl border border-cream bg-cream p-7 transition-shadow hover:shadow-soft">
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-forest text-bronze">
                  <v.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-serif text-xl font-bold">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text/70">{v.copy}</p>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section bg-cream">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">What Our Clients Say</p>
            <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">Trusted by Lagos Families</h2>
            <p className="mt-4 text-text/70">
              Don&rsquo;t just take our word for it — hear from the families who call Verdant home.
            </p>
          </div>
          <div className="mt-12">
            <Testimonials limit={4} />
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <SEO data={organisationSchema()} />
      <section className="relative overflow-hidden bg-forest py-20 md:py-24">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-bronze/10" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-cream/5" aria-hidden="true" />
        <div className="container-x relative text-center">
          <p className="eyebrow">Private Viewings</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl font-bold text-cream md:text-4xl">
            Come See It for Yourself
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-cream/75">
            Book a guided walkthrough of any listing — or tell us what you&rsquo;re looking for and
            we&rsquo;ll match you to the right home.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn-bronze">
              Book a Tour
            </Link>
            <Link to="/listings" className="btn-outline-cream">
              Explore Listings
            </Link>
          </div>
        </div>
      </section>

      {/* EMAIL ALERTS CTA */}
      <SubscribeAlerts variant="banner" />
    </>
  )
}

export default Home
