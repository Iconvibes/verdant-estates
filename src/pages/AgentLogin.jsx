import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, setToken, fetchAgentProfile } from '../api'
import useHead from '../hooks/useHead'

const AgentLogin = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useHead({ title: 'Agent Login | Verdant Estates', noIndex: true })

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(form)
      const role = result.user.role
      if (role !== 'agent') {
        throw new Error('This account is not registered as an agent. Please use the admin login.')
      }
      setToken(result.token)
      // Fetch agent profile to get the agent_id
      const profile = await fetchAgentProfile(result.user.id)
      sessionStorage.setItem('agent.profile', JSON.stringify(profile))
      sessionStorage.setItem('agent.user', JSON.stringify(result.user))
      navigate('/agent/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          <h1 className="mt-4 font-serif text-2xl font-bold text-forest">Agent Portal</h1>
          <p className="mt-2 text-sm text-text/60">Log in to manage your listings and enquiries</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-forest">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@verdantestates.ng"
              className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none transition-colors focus:border-bronze"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-forest">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none transition-colors focus:border-bronze"
            />
          </div>

          {error && <p className="rounded-md bg-red-50 px-4 py-2.5 text-xs text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-forest w-full disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text/60">
          Don&rsquo;t have an account?{' '}
          <Link to="/agent/register" className="font-semibold text-forest hover:text-bronze">Register here</Link>
        </p>

        <div className="mt-4 border-t border-cream pt-4 text-center space-y-2">
          <Link to="/admin" className="text-xs text-text/40 hover:text-forest">Admin Login →</Link>
          <div><Link to="/" className="text-xs font-semibold text-text/40 hover:text-forest">← Back to website</Link></div>
        </div>
      </div>
    </section>
  )
}

export default AgentLogin
