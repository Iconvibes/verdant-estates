import { Link } from 'react-router-dom'
import SEO, { organisationSchema } from '../components/SEO'
import Testimonials from '../components/Testimonials'
import useHead from '../hooks/useHead'
import { tourFrames } from '../data/frames'
import { KeyIcon, LeafIcon, MapPinIcon, ShieldIcon, SunIcon } from '../components/icons'

const values = [
  {
    icon: LeafIcon,
    title: 'Nature First',
    copy: 'Native planting, rain gardens and passive cooling are design briefs, not add-ons. We build for the Lagos climate, not against it.',
  },
  {
    icon: SunIcon,
    title: 'Light as a Material',
    copy: 'Every room is placed to follow the sun. Glazing is tuned so homes stay bright without baking — less cooling load, more calm.',
  },
  {
    icon: MapPinIcon,
    title: 'Lagos Know-How',
    copy: 'Fifteen years, twelve estates, and the title, drainage and security realities of every street we build on.',
  },
  {
    icon: ShieldIcon,
    title: 'Long-Term Stewardship',
    copy: 'We still manage most of the estates we built. Our success is measured in resale values and referrals, not closing volume.',
  },
  {
    icon: KeyIcon,
    title: 'Honest Handover',
    copy: 'Itemised costs, verified titles and a documented snagging process. You see everything, before and after you buy.',
  },
  {
    icon: LeafIcon,
    title: 'Community of Calm',
    copy: 'Compound management, gardens and security that are maintained for decades — a neighbourhood that ages well.',
  },
]

const milestones = [
  { year: '2014', event: 'Founded with one house on a leafy Ikoyi street' },
  { year: '2017', event: 'First gated estate delivered in Lekki Phase 1' },
  { year: '2020', event: 'Began solar-ready design on every new build' },
  { year: '2024', event: '200th home handed over across Lagos' },
  { year: '2026', event: 'Launch of the Verdant walkthrough experience' },
]

const About = () => {
  useHead({
    title: 'About Us',
    description: "Since 2014 Verdant Estates has built 200+ sustainable luxury homes across Lagos. Learn about our biophilic design philosophy, solar-ready builds, and 15 years of honest handovers.",
    url: 'https://verdantestates.ng/about',
  })

  return (
    <>
      <section className="relative overflow-hidden bg-forest-deep py-20 md:py-28">
        <img
          src={tourFrames[60]}
          alt="Bright, open living space in a Verdant Estates home"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep via-forest-deep/80 to-forest-deep/40" aria-hidden="true" />
        <div className="container-x relative">
          <p className="eyebrow">Our Story</p>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl font-bold leading-tight text-cream md:text-5xl">
            Sustainable Luxury Living in Lagos
          </h1>
          <p className="mt-5 max-w-xl text-cream/80">
            Since 2014 we&rsquo;ve built a different kind of Lagos address — one where modern
            architecture, deep greenery and honest service share the same foundation.
          </p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">What Our Clients Say</p>
            <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">Trusted by Lagos Families</h2>
            <p className="mt-4 text-text/70">
              Our greatest metric is referrals — most of our clients come from homeowners who already live in a Verdant estate.
            </p>
          </div>
          <div className="mt-12">
            <Testimonials />
          </div>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Why We Exist</p>
            <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">
              The City Keeps Its Pace. Your Home Doesn&rsquo;t Have To.
            </h2>
            <div className="mt-6 space-y-5 leading-relaxed text-text/80">
              <p>
                Lagos rewards speed — in business, in opportunity, in the way the city moves.
                But at home, we believe the opposite should be true. Verdant Estates was
                founded on a simple conviction: the best homes in Africa&rsquo;s most dynamic
                city should also be its most restful.
              </p>
              <p>
                So we build with the climate. Deep verandas, courtyards that pull air through
                the house, native gardens that need a fraction of the water, and rooftops
                ready for solar from day one. We call it forest luxury — the finishes and
                craft of a five-star residence, wrapped in the calm of a private grove.
              </p>
              <p>
                Fifteen years and two hundred homes later, most of our business still comes
                from referrals. That&rsquo;s the measurement we care about.
              </p>
            </div>
            <Link to="/listings" className="btn-forest mt-8">
              See the Homes
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <img
              src={tourFrames[40]}
              alt="Modern home exterior at Verdant Estates"
              className="aspect-[4/5] w-full rounded-xl object-cover shadow-soft"
            />
            <img
              src={tourFrames[110]}
              alt="Open kitchen and living space with natural light"
              className="mt-10 aspect-[4/5] w-full rounded-xl object-cover shadow-soft"
            />
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">What We Stand For</p>
            <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">The Verdant Principles</h2>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl border border-cream bg-cream p-7 transition-shadow hover:shadow-soft">
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-forest text-bronze">
                  <v.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-serif text-xl font-bold">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text/70">{v.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="eyebrow">The Journey</p>
              <h2 className="mt-3 font-serif text-3xl font-bold md:text-4xl">Fifteen Years, One Standard</h2>
              <p className="mt-4 text-text/70">
                From a single Ikoyi house to a portfolio across the city&rsquo;s best addresses.
              </p>
            </div>
            <ol className="relative space-y-8 border-l-2 border-bronze/40 pl-8">
              {milestones.map((m) => (
                <li key={m.year} className="relative">
                  <span className="absolute -left-[2.45rem] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-bronze bg-cream">
                    <span className="h-2 w-2 rounded-full bg-bronze" />
                  </span>
                  <p className="font-serif text-2xl font-bold text-forest">{m.year}</p>
                  <p className="mt-1 text-text/75">{m.event}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-forest py-20">
        <div className="container-x flex flex-wrap items-center justify-between gap-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-cream md:text-4xl">
              Ready to Find Your Forest?
            </h2>
            <p className="mt-3 max-w-lg text-cream/75">
              Tell us about the life you&rsquo;re planning and we&rsquo;ll match you to the home
              that fits it.
            </p>
          </div>
          <Link to="/contact" className="btn-bronze">
            Start the Conversation
          </Link>
        </div>
      </section>
      <SEO data={organisationSchema()} />
    </>
  )
}

export default About
