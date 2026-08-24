import { getAllAreas } from '../data'
import AreaCard from '../components/AreaCard'
import SEO, { organisationSchema } from '../components/SEO'
import useHead from '../hooks/useHead'
import StaggerReveal from '../components/StaggerReveal'
import { getFrameUrl } from '../data/frames'

const Areas = () => {
  useHead({
    title: 'Lagos Neighbourhood Guides',
    description: 'Explore Lagos\'s premier neighbourhoods — Ikoyi, Lekki, Banana Island, Victoria Island, Eko Atlantic, and Oniru. Walkability scores, schools, restaurants, and available homes.',
    url: 'https://verdantestates.ng/areas',
  })

  return (
    <>
      <section className="relative overflow-hidden bg-forest-deep py-16 md:py-20">
        <img
          src={getFrameUrl(50)}
          alt="Lagos neighbourhood aerial view"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep via-forest-deep/80 to-forest-deep/50" aria-hidden="true" />
        <div className="container-x relative">
          <p className="eyebrow">Discover Lagos</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-cream md:text-5xl">Neighbourhood Guides</h1>
          <p className="mt-4 max-w-2xl text-cream/75">
            Every Lagos neighbourhood has a distinct character. Explore our guides to find the one that
            matches your lifestyle — from the quiet leafy streets of Ikoyi to the beachside energy of Lekki.
          </p>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-x">
          <StaggerReveal className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {getAllAreas().map((area) => (
              <AreaCard key={area.id} area={area} />
            ))}
          </StaggerReveal>
        </div>
      </section>

      <section className="bg-forest py-20">
        <div className="container-x flex flex-wrap items-center justify-between gap-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-cream md:text-4xl">
              Not Sure Which Neighbourhood?
            </h2>
            <p className="mt-3 max-w-lg text-cream/75">
              Tell us about your daily routine and we&rsquo;ll recommend the area that fits your life.
            </p>
          </div>
          <a href="/contact" className="btn-bronze">
            Get Personalised Advice
          </a>
        </div>
      </section>

      <SEO data={organisationSchema()} />
    </>
  )
}

export default Areas
