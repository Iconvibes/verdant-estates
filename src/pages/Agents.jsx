import { getAllAgents, getAllProperties } from '../data'
import AgentCard from '../components/AgentCard'
import SEO, { organisationSchema } from '../components/SEO'
import useHead from '../hooks/useHead'
import StaggerReveal from '../components/StaggerReveal'
import { getFrameUrl } from '../data/frames'

const Agents = () => {
  const agents = getAllAgents()
  const properties = getAllProperties()

  useHead({
    title: 'Our Team',
    description: 'Meet the Verdant Estates sales partners — experienced, trusted advisors specialising in Lagos luxury property, waterfront villas, and sustainable homes.',
    url: 'https://verdantestates.ng/agents',
  })

  // Count listings per agent
  const listingCounts = {}
  for (const agent of agents) {
    listingCounts[agent.id] = properties.filter(
      (p) => p.agent?.email?.includes(agent.id.replace('-', '.')),
    ).length
  }

  return (
    <>
      <section className="relative overflow-hidden bg-forest-deep py-16 md:py-20">
        <img
          src={getFrameUrl(120)}
          alt="Verdant Estates team"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep via-forest-deep/80 to-forest-deep/50" aria-hidden="true" />
        <div className="container-x relative">
          <p className="eyebrow">Our Partners</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-cream md:text-5xl">Meet the Team</h1>
          <p className="mt-4 max-w-2xl text-cream/75">
            Every Verdant home is sold by a dedicated partner who knows the property, the neighbourhood
            and the Lagos market inside out. Choose an advisor — or let us match you.
          </p>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-x">
          <StaggerReveal className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent, i) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                listingCount={listingCounts[agent.id]}
                index={i}
              />
            ))}
          </StaggerReveal>
        </div>
      </section>

      <section className="bg-forest py-20">
        <div className="container-x flex flex-wrap items-center justify-between gap-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-cream md:text-4xl">
              Ready to Start Your Search?
            </h2>
            <p className="mt-3 max-w-lg text-cream/75">
              Tell us what you&rsquo;re looking for and we&rsquo;ll match you to the right partner.
            </p>
          </div>
          <a href="/contact" className="btn-bronze">
            Get Matched
          </a>
        </div>
      </section>

      <SEO data={organisationSchema()} />
    </>
  )
}

export default Agents
