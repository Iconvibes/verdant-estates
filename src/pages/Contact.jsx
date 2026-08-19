import { useState } from 'react'
import SEO, { organisationSchema } from '../components/SEO'
import useHead from '../hooks/useHead'
import {
  CheckIcon,
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from '../components/icons'

const initialForm = { name: '', email: '', phone: '', interest: 'Private viewing', message: '' }

const Contact = () => {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)

  useHead({
    title: 'Book a Tour, Ask a Question',
    description: 'Book a private viewing of any Verdant Estates home in Lagos. Our partners reply within one working day — in person or virtual walkthrough.',
    url: 'https://verdantestates.ng/contact',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setForm(initialForm)
  }

  return (
    <>
      <section className="bg-forest-deep py-16 md:py-20">
        <div className="container-x">
          <p className="eyebrow">Get in Touch</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-cream md:text-5xl">Book a Tour, Ask a Question</h1>
          <p className="mt-4 max-w-2xl text-cream/75">
            Whether you&rsquo;re ready to view a home or just starting your search, our partners
            reply within one working day.
          </p>
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-x grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          {/* FORM */}
          <div className="rounded-xl bg-white p-8 shadow-soft md:p-10">
            {submitted ? (
              <div className="flex flex-col items-center py-16 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest text-bronze">
                  <CheckIcon className="h-8 w-8" />
                </span>
                <h2 className="mt-6 font-serif text-3xl font-bold">Thank You, We&rsquo;re On It</h2>
                <p className="mt-4 max-w-md text-text/70">
                  Your enquiry is with our team. Expect a call or email from us within one
                  working day — usually sooner.
                </p>
                <button type="button" className="btn-forest mt-8" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-semibold text-forest">
                    Full Name <span className="text-bronze">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Amara Okonkwo"
                    className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none transition-colors focus:border-bronze"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-forest">
                    Email Address <span className="text-bronze">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none transition-colors focus:border-bronze"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-forest">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+234 800 000 0000"
                    className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none transition-colors focus:border-bronze"
                  />
                </div>
                <div>
                  <label htmlFor="interest" className="mb-2 block text-sm font-semibold text-forest">
                    I&rsquo;m Interested In
                  </label>
                  <select
                    id="interest"
                    name="interest"
                    value={form.interest}
                    onChange={handleChange}
                    className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none transition-colors focus:border-bronze"
                  >
                    <option>Private viewing</option>
                    <option>Buying a home</option>
                    <option>Selling my home</option>
                    <option>Virtual walkthrough</option>
                    <option>Investment advice</option>
                    <option>Something else</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="message" className="mb-2 block text-sm font-semibold text-forest">
                    Your Message <span className="text-bronze">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows="5"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us which homes you&rsquo;d like to see, your preferred viewing days, or what you&rsquo;re looking for…"
                    className="w-full resize-y rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none transition-colors focus:border-bronze"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="btn-forest w-full sm:w-auto">
                    Send Enquiry
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* INFO SIDEBAR */}
          <aside className="space-y-6">
            <div className="rounded-xl bg-forest p-8 text-cream shadow-lift">
              <h2 className="font-serif text-2xl font-bold">Verdant Estates</h2>
              <ul className="mt-6 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
                  <span>18B Akin Adesola Street, Victoria Island, Lagos</span>
                </li>
                <li className="flex items-center gap-3">
                  <PhoneIcon className="h-4 w-4 shrink-0 text-bronze" />
                  <a href="tel:+2348000000000" className="hover:text-bronze">+234 800 000 0000</a>
                </li>
                <li className="flex items-center gap-3">
                  <MailIcon className="h-4 w-4 shrink-0 text-bronze" />
                  <a href="mailto:hello@verdantestates.ng" className="hover:text-bronze">hello@verdantestates.ng</a>
                </li>
                <li className="flex items-start gap-3">
                  <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
                  <span>
                    Mon – Fri: 9:00 – 18:00<br />
                    Saturday: 10:00 – 16:00<br />
                    Sunday: Private viewings only
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-cream bg-white p-8 shadow-soft">
              <h3 className="font-serif text-xl font-bold">What Happens Next?</h3>
              <ol className="mt-5 space-y-4 text-sm text-text/75">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bronze text-xs font-bold text-forest-deep">1</span>
                  We confirm your enquiry within one working day.
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bronze text-xs font-bold text-forest-deep">2</span>
                  Your partner arranges a private viewing — in person or virtual.
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bronze text-xs font-bold text-forest-deep">3</span>
                  We share verified titles, costs and a clear next-steps plan.
                </li>
              </ol>
            </div>
          </aside>
        </div>
      </section>
      <SEO data={organisationSchema()} />
    </>
  )
}

export default Contact
