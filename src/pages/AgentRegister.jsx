import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerAgent, uploadAgentPhoto } from '../api'
import useHead from '../hooks/useHead'

const AgentRegister = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef(null)

  useHead({ title: 'Agent Registration | Verdant Estates', noIndex: true })

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5MB')
      return
    }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      let photoUrl = null
      if (photo) {
        setUploading(true)
        photoUrl = await uploadAgentPhoto(photo)
        setUploading(false)
      }
      const result = await registerAgent({ ...form, photoUrl })
      setSuccess(result.message)
      setTimeout(() => navigate('/agent/login'), 3000)
    } catch (err) {
      const msg = err.message || 'Registration failed.'
      if (msg.includes('invalid')) {
        setError('Registration failed. Please check your email address and try again.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
      setUploading(false)
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

        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
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
          {/* Photo upload */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-forest">Profile Photo</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-dashed border-cream bg-cream hover:border-bronze transition-colors"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center">
                    <svg className="h-6 w-6 text-text/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
                  </div>
                )}
              </button>
              <div>
                <button type="button" onClick={() => fileRef.current?.click()} className="text-xs font-semibold text-forest hover:text-bronze">Upload photo</button>
                <p className="mt-0.5 text-[0.65rem] text-text/40">JPG, PNG or WebP. Max 5MB.</p>
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" />
            </div>
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

          <div className="sm:col-span-2">
            <button type="submit" disabled={loading || uploading} className="btn-forest w-full disabled:opacity-50">
              {uploading ? 'Uploading photo…' : loading ? 'Creating account…' : 'Create Account'}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-text/60">
          Already have an account?{' '}
          <Link to="/agent/login" className="font-semibold text-forest hover:text-bronze">Sign in</Link>
        </p>

        <div className="mt-4 border-t border-cream pt-4 text-center">
          <Link to="/" className="text-xs font-semibold text-text/40 hover:text-forest">← Back to website</Link>
        </div>
      </div>
    </section>
  )
}

export default AgentRegister
