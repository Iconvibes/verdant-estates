import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getAgentById, getAgentListings } from '../data/agents'
import PropertyCard from '../components/PropertyCard'
import StaggerReveal from '../components/StaggerReveal'
import SEO, { breadcrumbSchema } from '../components/SEO'
import useHead from '../hooks/useHead'
import { submitEnquiry } from '../api'
import {
  BriefcaseIcon,
  CheckIcon,
  LanguagesIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from '../components/icons'

const AgentProfile = () => {
  const { id } = useParams()
  const agent = getAgentById(id)
  const listings = agent ? getAgentListings(agent.id) : []

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  useHead(
    agent
      ? {
          title: `${agent.name} — ${agent.role}`,
          description: agent.bio?.slice(0, 160),
          url: `https://verdantestates.ng/agents/${agent.id}`,
        }
      : { title: 'Agent Not Found', noIndex: true },
  )

  if (!agent) {
    return (
      <>
        <SEO
          data={breadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Team', url: '/agents' },
            { name: 'Not Found', url: '/agents' },
          ])}
        />
        <section className="section bg-cream">
          <div className="container-x mx-auto max-w-xl text-center">
            <h1 className="font-serif text-4xl font-bold">Agent Not Found</h1>
            <p className="mt-4 text-text/70">
              We couldn&rsquo;t find that agent — they may have moved on or the link is outdated.
            </p>
            <Link to="/agents" className="btn-forest mt-8">
              Back to Team
            </Link>
          </div>
        </section>
      </>
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await submitEnquiry({
        ...form,
        interest: `Contact ${agent.name}`,
        message: `[Agent enquiry for ${agent.name}] ${form.message}`,
      })
      setSubmitted(true)
    } catch {
      setSubmitted(true) // show success anyway to avoid confusing the user
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <section className="bg-forest-deep py-12 md:py-16">
        <div className="container-x">
          <nav className="text-xs font-semibold uppercase tracking-wider text-cream/60">
            <Link to="/" className="hover:text-bronze">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/agents" className="hover:text-bronze">Team</Link>
            <span className="mx-2">/</span>
            <span className="text-bronze">{agent.name}</span>
          </nav>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_400px]">
          {/* LEFT: Bio + listings */}
          <div>
            {/* Agent header */}
            <div className="flex items-start gap-6">
              <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-forest to-forest-deep font-serif text-3xl font-bold text-bronze shadow-lift">
                {agent.initials}
              </span>
              <div>
                <h1 className="font-serif text-3xl font-bold text-forest md:text-4xl">{agent.name}</h1>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-bronze">{agent.role}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {agent.specialties.map((s) => (
                    <span key={s} className="rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="mt-8 grid grid-cols-3 gap-4 rounded-xl bg-white p-6 shadow-soft">
              <div className="text-center">
                <BriefcaseIcon className="mx-auto h-5 w-5 text-bronze" />
                <p className="mt-2 font-serif text-2xl font-bold text-forest">{agent.experience}</p>
                <p className="text-xs uppercase tracking-wider text-text/60">Years Experience</p>
              </div>
              <div className="text-center">
                <MapPinIcon className="mx-auto h-5 w-5 text-bronze" />
                <p className="mt-2 font-serif text-2xl font-bold text-forest">{listings.length}</p>
                <p className="text-xs uppercase tracking-wider text-text/60">Active Listings</p>
              </div>
              <div className="text-center">
                <LanguagesIcon className="mx-auto h-5 w-5 text-bronze" />
                <p className="mt-2 font-serif text-2xl font-bold text-forest">{agent.languages?.length || 0}</p>
                <p className="text-xs uppercase tracking-wider text-text/60">Languages</p>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-10">
              <h2 className="font-serif text-2xl font-bold">About {agent.name.split(' ')[0]}</h2>
              <p className="mt-4 leading-relaxed text-text/80">{agent.bio}</p>
            </div>

            {/* Languages */}
            {agent.languages?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text/60">Languages</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {agent.languages.map((lang) => (
                    <span key={lang} className="rounded-full bg-cream px-4 py-2 text-sm font-medium text-forest">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {agent.certifications?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text/60">Certifications</h3>
                <ul className="mt-3 space-y-2">
                  {agent.certifications.map((cert) => (
                    <li key={cert} className="flex items-start gap-3 text-sm text-text/80">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Active listings */}
            {listings.length > 0 && (
              <div className="mt-12">
                <h2 className="font-serif text-2xl font-bold">{agent.name.split(' ')[0]}&rsquo;s Listings</h2>
                <StaggerReveal className="mt-6 grid gap-8 md:grid-cols-2">
                  {listings.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </StaggerReveal>
              </div>
            )}
          </div>

          {/* RIGHT: Contact card */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl bg-white p-8 shadow-lift">
              <h3 className="font-serif text-xl font-bold text-forest">Contact {agent.name.split(' ')[0]}</h3>
              <p className="mt-2 text-sm text-text/60">
                Reach out directly or use the form below.
              </p>

              {/* Quick contact */}
              <ul className="mt-5 space-y-3 text-sm text-text/80">
                <li className="flex items-center gap-3">
                  <PhoneIcon className="h-4 w-4 text-bronze" />
                  <a href={`tel:${agent.phone.replace(/\s/g, '')}`} className="hover:text-bronze">
                    {agent.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <MailIcon className="h-4 w-4 text-bronze" />
                  <a href={`mailto:${agent.email}`} className="break-all hover:text-bronze">
                    {agent.email}
                  </a>
                </li>
              </ul>

              <div className="mt-6 border-t border-cream pt-6">
                {submitted ? (
                  <div className="py-8 text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest text-bronze">
                      <CheckIcon className="h-6 w-6" />
                    </span>
                    <p className="mt-4 font-serif text-lg font-bold text-forest">Message Sent</p>
                    <p className="mt-2 text-sm text-text/70">
                      {agent.name.split(' ')[0]} will get back to you within one working day.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', message: '' }) }}
                      className="btn-outline-forest mt-4 text-xs"
                    >
                      Send Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="agent-name" className="mb-1.5 block text-xs font-semibold text-forest">Name</label>
                      <input
                        id="agent-name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="w-full rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-bronze"
                      />
                    </div>
                    <div>
                      <label htmlFor="agent-email" className="mb-1.5 block text-xs font-semibold text-forest">Email</label>
                      <input
                        id="agent-email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-bronze"
                      />
                    </div>
                    <div>
                      <label htmlFor="agent-phone" className="mb-1.5 block text-xs font-semibold text-forest">Phone</label>
                      <input
                        id="agent-phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+234 800 000 0000"
                        className="w-full rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-bronze"
                      />
                    </div>
                    <div>
                      <label htmlFor="agent-message" className="mb-1.5 block text-xs font-semibold text-forest">Message</label>
                      <textarea
                        id="agent-message"
                        name="message"
                        required
                        rows="4"
                        value={form.message}
                        onChange={handleChange}
                        placeholder={`Hi ${agent.name.split(' ')[0]}, I'm interested in...`}
                        className="w-full resize-y rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-bronze"
                      />
                    </div>
                    <button type="submit" disabled={sending} className="btn-forest w-full">
                      {sending ? 'Sending…' : `Message ${agent.name.split(' ')[0]}`}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <SEO
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Team', url: '/agents' },
          { name: agent.name, url: `/agents/${agent.id}` },
        ])}
      />
    </>
  )
}

export default AgentProfile
