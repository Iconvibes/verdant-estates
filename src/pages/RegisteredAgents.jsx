import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AgentCard from '../components/AgentCard'
import SEO, { organisationSchema } from '../components/SEO'
import useHead from '../hooks/useHead'
import StaggerReveal from '../components/StaggerReveal'

const RegisteredAgents = () => {
  const [agents, setAgents] = useState([])

  useHead({
    title: 'Our Agents | Verdant Estates',
    description: 'Browse our registered property agents — verified professionals ready to help you find your dream home in Lagos.',
    url: 'https://verdantestates.ng/registered-agents',
  })

  useEffect(() => {
    supabase
      .from('agents')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const mapped = (data || []).map((a) => ({
          id: a.id,
          name: a.full_name || a.name,
          role: a.role || 'Property Agent',
          phone: a.phone || '',
          email: a.email || '',
          photo: a.photo_url || '',
          initials: (a.full_name || a.name || '').split(' ').map((n) => n[0]).join(''),
          specialties: a.specialties || [],
          experience: a.experience || 0,
          bio: a.bio || '',
          languages: a.languages || ['English'],
          certifications: a.certifications || [],
        }))
        setAgents(mapped)
      })
      .catch(() => {})
  }, [])

  return (
    <>
      <SEO data={organisationSchema()} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-forest-deep py-24">
        <div className="container-x relative z-10 text-center">
          <h1 className="font-serif text-4xl font-bold text-cream md:text-5xl">
            Our <span className="text-bronze">Agents</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-cream/70">
            Verified property agents ready to help you find your dream home in Lagos.
          </p>
        </div>
      </section>

      {/* Agents grid */}
      <section className="section bg-cream">
        <div className="container-x">
          {agents.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-text/40">No agents registered yet.</p>
              <p className="mt-2 text-sm text-text/30">Agents who join our platform will appear here.</p>
            </div>
          ) : (
            <StaggerReveal className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent, i) => (
                <AgentCard key={agent.id} agent={agent} index={i} />
              ))}
            </StaggerReveal>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-forest py-20">
        <div className="container-x flex flex-wrap items-center justify-between gap-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-cream md:text-4xl">
              Want to Join Our Team?
            </h2>
            <p className="mt-3 max-w-lg text-cream/75">
              Register as an agent and start listing properties on our platform.
            </p>
          </div>
          <a href="/agent/register" className="btn-bronze">
            Become an Agent
          </a>
        </div>
      </section>
    </>
  )
}

export default RegisteredAgents
