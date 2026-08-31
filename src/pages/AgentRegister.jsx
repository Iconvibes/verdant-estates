import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerAgent } from '../api'
import useHead from '../hooks/useHead'

const AgentRegister = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useHead({ title: 'Agent Registration | Verdant Estates', noIndex: true })

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const result = await registerAgent(form)
      setSuccess(result.message)
      setTimeout(() => navigate('/agent/login'), 3000)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section flex min-h-[80vh] items-center justify-center bg-cream">
      <div className="w-full max-w-md rounded-xl bg-white p-10 shadow-lift">
        <div className="mb-8 text-center">
          <span className="flex mx-auto h-12 w-12 items-center justify-center rounded-md bg-forest text-bronze">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </span>
          <h1 className="mt-4 font-serif text-2xl font-bold text-forest">Join as an Agent</h1>
          <p className="mt-2 text-sm text-text/60">Create your account and start listing properties</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-forest">Full Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Adaeze Okafor"
              className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none transition-colors focus:border-bronze"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-forest">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@email.com"
              className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none transition-colors focus:border-bronze"
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-forest">Phone</label>
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
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-forest">Password *</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none transition-colors focus:border-bronze"
            />
          </div>

          {error && <p className="rounded-md bg-red-50 px-4 py-2.5 text-xs text-red-600">{error}</p>}
          {success && <p className="rounded-md bg-green-50 px-4 py-2.5 text-xs text-green-600">{success}</p>}

          <button type="submit" disabled={loading} className="btn-forest w-full disabled:opacity-50">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text/60">
          Already have an account?{' '}
          <Link to="/agent/login" className="font-semibold text-forest hover:text-bronze">Sign in</Link>
        </p>
      </div>
    </section>
  )
}

export default AgentRegister
