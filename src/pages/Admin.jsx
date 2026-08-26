import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  login,
  setToken,
  getToken,
} from '../api'
import useHead from '../hooks/useHead'
import { formatPrice } from '../data'
import SEO, { organisationSchema } from '../components/SEO'
import {
  BedIcon,
  BriefcaseIcon,
  CheckIcon,
  CloseIcon,
  HomeIcon,
  MailIcon,
  MapPinIcon,
  MenuIcon,
  PhoneIcon,
  SearchIcon,
  TrashIcon,
} from '../components/icons'
import ImageUploader from '../components/ImageUploader'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'listings', label: 'Listings' },
  { id: 'enquiries', label: 'Enquiries' },
  { id: 'alerts', label: 'Alerts' },
]

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
}

const STATUS_OPTIONS = ['new', 'contacted', 'resolved', 'archived']

/* ──────────── API helpers ──────────── */

async function apiFetch(path, opts = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...opts.headers }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers })
  if (res.status === 401) {
    setToken(null)
    window.location.reload()
    throw new Error('Session expired')
  }
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

/* ──────────── Login Form ──────────── */

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login({ email, password })
      setToken(res.token)
      onLogin(res.user)
    } catch (err) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section flex min-h-[80vh] items-center justify-center bg-cream">
      <div className="w-full max-w-md rounded-xl bg-white p-10 shadow-lift">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-forest text-bronze">
            <HomeIcon className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-serif text-2xl font-bold text-forest">Admin</h1>
            <p className="text-xs text-text/60">Verdant Estates Dashboard</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-sm font-semibold text-forest">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@verdantestates.ng"
              className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none transition-colors focus:border-bronze"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold text-forest">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none transition-colors focus:border-bronze"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-4 py-2.5 text-xs text-red-600">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-forest w-full">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>


      </div>
    </section>
  )
}

/* ──────────── Metric Card ──────────── */

const MetricCard = ({ icon: Icon, value, label, accent = false }) => (
  <div className="rounded-xl bg-white p-6 shadow-soft">
    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-forest/10 text-bronze">
      <Icon className="h-5 w-5" />
    </span>
    <p className={`mt-4 font-serif text-3xl font-bold ${accent ? 'text-bronze' : 'text-forest'}`}>
      {value}
    </p>
    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-text/60">{label}</p>
  </div>
)

/* ──────────── Dashboard Tab ──────────── */

const DashboardTab = ({ listings, enquiries, alerts }) => {
  const totalValue = useMemo(
    () => listings.reduce((sum, l) => sum + (l.price || 0), 0),
    [listings],
  )

  const enquiriesByStatus = useMemo(() => {
    const counts = { new: 0, contacted: 0, resolved: 0, archived: 0 }
    enquiries.forEach((e) => {
      if (counts[e.status] !== undefined) counts[e.status]++
    })
    return counts
  }, [enquiries])

  const listingsByType = useMemo(() => {
    const counts = {}
    listings.forEach((l) => {
      counts[l.type] = (counts[l.type] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [listings])

  const avgPrice = listings.length > 0 ? totalValue / listings.length : 0

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
        <MetricCard icon={HomeIcon} value={listings.length} label="Total Listings" />
        <MetricCard icon={MailIcon} value={enquiries.length} label="Total Enquiries" accent />
        <MetricCard
          icon={BriefcaseIcon}
          value={formatPrice(Math.round(avgPrice))}
          label="Avg Listing Price"
        />
        <MetricCard icon={CheckIcon} value={alerts.length} label="Active Alerts" />
      </div>

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {/* Enquiry funnel */}
        <div className="rounded-xl bg-white p-6 shadow-soft">
          <h3 className="font-serif text-lg font-bold text-forest">Enquiry Pipeline</h3>
          <div className="mt-5 space-y-3">
            {STATUS_OPTIONS.map((status) => (
              <div key={status} className="flex items-center gap-3">
                <span className={`inline-block w-24 rounded-full px-3 py-1 text-center text-xs font-semibold ${STATUS_COLORS[status]}`}>
                  {status}
                </span>
                <div className="flex-1">
                  <div className="h-4 overflow-hidden rounded-full bg-cream">
                    <div
                      className="h-full rounded-full bg-forest transition-all duration-500"
                      style={{
                        width: enquiries.length
                          ? `${(enquiriesByStatus[status] / enquiries.length) * 100}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right font-serif text-sm font-bold text-forest">
                  {enquiriesByStatus[status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Listings by type */}
        <div className="rounded-xl bg-white p-6 shadow-soft">
          <h3 className="font-serif text-lg font-bold text-forest">Listings by Type</h3>
          <div className="mt-5 space-y-3">
            {listingsByType.map(([type, count]) => (
              <div key={type} className="flex items-center gap-3">
                <span className="w-40 truncate text-xs font-semibold text-text/70">{type}</span>
                <div className="flex-1">
                  <div className="h-4 overflow-hidden rounded-full bg-cream">
                    <div
                      className="h-full rounded-full bg-bronze transition-all duration-500"
                      style={{
                        width: listings.length ? `${(count / listings.length) * 100}%` : '0%',
                      }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right font-serif text-sm font-bold text-forest">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent enquiries */}
      <div className="rounded-xl bg-white p-6 shadow-soft">
        <h3 className="font-serif text-lg font-bold text-forest">Recent Enquiries</h3>
        {enquiries.length === 0 ? (
          <p className="mt-4 text-sm text-text/60">No enquiries yet.</p>
        ) : (
          <div className="mt-4 space-y-3 lg:space-y-0">
            {/* Mobile card view */}
            <div className="space-y-2 lg:hidden">
              {enquiries.slice(-5).reverse().map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg bg-cream/50 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-forest">{e.name}</p>
                    <p className="truncate text-xs text-text/50">{e.email} · {e.interest}</p>
                  </div>
                  <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-semibold ${STATUS_COLORS[e.status] || 'bg-gray-100 text-gray-500'}`}>{e.status}</span>
                </div>
              ))}
            </div>
            {/* Desktop table view */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cream text-left text-xs font-semibold uppercase tracking-wider text-text/60">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Interest</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream">
                  {enquiries.slice(-5).reverse().map((e) => (
                    <tr key={e.id} className="hover:bg-cream/50">
                      <td className="py-3 pr-4 font-semibold text-forest">{e.name}</td>
                      <td className="py-3 pr-4 text-text/70">{e.email}</td>
                      <td className="py-3 pr-4 text-text/70">{e.interest}</td>
                      <td className="py-3 pr-4"><span className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold ${STATUS_COLORS[e.status] || 'bg-gray-100 text-gray-500'}`}>{e.status}</span></td>
                      <td className="py-3 text-text/50">{new Date(e.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ──────────── Listings Tab ──────────── */

const ListingsTab = ({ listings, onRefresh }) => {
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast] = useState('')
  const timerRef = useRef(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setToast(''), 2500)
  }, [])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const filtered = useMemo(() => {
    if (!search.trim()) return listings
    const q = search.toLowerCase()
    return listings.filter(
      (l) =>
        l.name?.toLowerCase().includes(q) ||
        l.address?.toLowerCase().includes(q) ||
        l.type?.toLowerCase().includes(q),
    )
  }, [listings, search])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await apiFetch(`/listings/${id}`, { method: 'DELETE' })
      showToast('Listing deleted')
      onRefresh()
    } catch (err) {
      showToast(`Error: ${err.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-serif text-2xl font-bold text-forest">
          Listings ({filtered.length})
        </h2>
        <div className="flex gap-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search listings…"
              className="rounded-md border border-cream bg-white py-2.5 pl-10 pr-4 text-sm text-text outline-none transition-colors focus:border-bronze"
            />
          </div>
          <button type="button" onClick={() => { setShowAdd(!showAdd); setEditingId(null) }} className="btn-bronze !py-2.5 text-xs">
            + Add Listing
          </button>
        </div>
      </div>

      {/* Add / Edit Form */}
      {(showAdd || editingId) && (
        <ListingForm
          listing={editingId ? listings.find((l) => l.id === editingId) : null}
          onSaved={() => { setShowAdd(false); setEditingId(null); onRefresh(); showToast(editingId ? 'Listing updated' : 'Listing created') }}
          onCancel={() => { setShowAdd(false); setEditingId(null) }}
        />
      )}

      {/* Listings — Card view on mobile, table on desktop */}
      <div className="space-y-4 lg:space-y-0">
        {/* Mobile card view */}
        <div className="space-y-3 lg:hidden">
          {filtered.map((l) => (
            <div key={l.id} className="flex gap-3 rounded-xl bg-white p-3 shadow-soft">
              <img src={l.image} alt={l.name} className="h-20 w-24 shrink-0 rounded-lg object-cover" />
              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div>
                  <Link to={`/listing/${l.id}`} className="font-serif text-sm font-bold text-forest hover:text-bronze line-clamp-1">
                    {l.name}
                  </Link>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-text/50 line-clamp-1">
                    <MapPinIcon className="h-3 w-3 shrink-0 text-bronze" />
                    {l.address}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-cream px-2 py-0.5 text-[0.6rem] font-semibold text-text/60">{l.type}</span>
                    <span className="text-xs text-text/50">{l.beds}🛏 {l.baths}🛁</span>
                  </div>
                  <span className="font-serif text-sm font-bold text-forest">{formatPrice(l.price)}</span>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button type="button" onClick={() => { setEditingId(l.id); setShowAdd(false) }} className="rounded bg-cream px-2 py-1 text-[0.6rem] font-semibold text-forest">Edit</button>
                <button type="button" onClick={() => handleDelete(l.id, l.name)} className="rounded bg-red-50 p-1 text-red-500" aria-label={`Delete ${l.name}`}><TrashIcon className="h-3 w-3" /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-xl bg-white py-12 text-center text-sm text-text/50 shadow-soft">No listings found.</div>
          )}
        </div>

        {/* Desktop table view */}
        <div className="hidden overflow-hidden rounded-xl bg-white shadow-soft lg:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream bg-cream/50 text-left text-xs font-semibold uppercase tracking-wider text-text/60">
                  <th className="px-5 py-3">Property</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3 text-right">Price</th>
                  <th className="px-5 py-3 text-center">Beds</th>
                  <th className="px-5 py-3 text-center">Baths</th>
                  <th className="px-5 py-3 text-center">m²</th>
                  <th className="px-5 py-3 text-center">Built</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-cream/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={l.image} alt={l.name} className="h-12 w-16 rounded-md object-cover" />
                        <div>
                          <Link to={`/listing/${l.id}`} className="font-semibold text-forest hover:text-bronze">{l.name}</Link>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-text/60"><MapPinIcon className="h-3 w-3 text-bronze" />{l.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-text/70">{l.type}</span></td>
                    <td className="px-5 py-4 text-right font-serif font-bold text-forest">{formatPrice(l.price)}</td>
                    <td className="px-5 py-4 text-center"><span className="flex items-center justify-center gap-1"><BedIcon className="h-3.5 w-3.5 text-bronze" /> {l.beds}</span></td>
                    <td className="px-5 py-4 text-center"><span className="flex items-center justify-center gap-1">🛁 {l.baths}</span></td>
                    <td className="px-5 py-4 text-center text-text/70">{l.area}</td>
                    <td className="px-5 py-4 text-center text-text/70">{l.yearBuilt}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => { setEditingId(l.id); setShowAdd(false) }} className="rounded-md bg-cream px-3 py-1.5 text-xs font-semibold text-forest transition-colors hover:bg-forest/10">Edit</button>
                        <button type="button" onClick={() => handleDelete(l.id, l.name)} className="rounded-md bg-red-50 p-1.5 text-red-500 transition-colors hover:bg-red-100" aria-label={`Delete ${l.name}`}><TrashIcon className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-md bg-forest px-5 py-3 text-cream shadow-lift">
            <CheckIcon className="h-4 w-4 shrink-0 text-bronze" />
            <span className="text-sm font-semibold">{toast}</span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ──────────── Listing Form ──────────── */

const ListingForm = ({ listing, onSaved, onCancel }) => {
  const initial = listing
    ? {
        ...listing,
        featuresText: (listing.features || []).join('\n'),
        images: listing.images || (listing.image ? [listing.image] : []),
      }
    : {
        name: '',
        type: 'Detached Duplex',
        price: '',
        address: '',
        coords: '3.4333, 6.4542',
        beds: 3,
        baths: 3,
        area: 300,
        yearBuilt: 2025,
        image: '/images/properties/property-1.jpg',
        images: [],
        tagline: '',
        description: '',
        featuresText: '',
      }

  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const coords = form.coords.split(',').map((s) => parseFloat(s.trim()))
      // Use first image as the primary image, images array for gallery
      const images = form.images || []
      const payload = {
        ...form,
        price: Number(form.price),
        beds: Number(form.beds),
        baths: Number(form.baths),
        area: Number(form.area),
        yearBuilt: Number(form.yearBuilt),
        coords,
        features: form.featuresText.split('\n').filter((f) => f.trim()),
        image: images.length > 0 ? images[0] : form.image || '',
        images,
      }
      delete payload.featuresText

      if (listing) {
        await apiFetch(`/listings/${listing.id}`, { method: 'PUT', body: JSON.stringify(payload) })
      } else {
        await apiFetch('/listings', { method: 'POST', body: JSON.stringify(payload) })
      }
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-bronze/30 bg-white p-6 shadow-soft md:p-8">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl font-bold text-forest">
          {listing ? `Edit: ${listing.name}` : 'Add New Listing'}
        </h3>
        <button type="button" onClick={onCancel} className="rounded-md p-2 text-text/50 hover:text-forest">
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-xs font-semibold text-forest">Property Photos</label>
        <ImageUploader
          images={form.images || []}
          onChange={(images) => setForm((f) => ({ ...f, images }))}
          maxImages={20}
          listingId={listing?.id}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-forest">Name *</label>
          <input name="name" required value={form.name} onChange={handleChange} className="w-full rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-forest">Type *</label>
          <select name="type" value={form.type} onChange={handleChange} className="w-full rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze">
            {['Detached Duplex', 'Waterfront Villa', 'Terrace Duplex', 'Penthouse', 'Semi-Detached Duplex', 'Detached Villa', 'Apartment', 'Duplex Apartment', 'Townhouse', 'Detached Bungalow'].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-forest">Price (₦) *</label>
          <input name="price" type="number" required value={form.price} onChange={handleChange} className="w-full rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-forest">Address *</label>
          <input name="address" required value={form.address} onChange={handleChange} className="w-full rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-forest">Coords (lng, lat)</label>
          <input name="coords" value={form.coords} onChange={handleChange} className="w-full rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-forest">Beds *</label>
          <input name="beds" type="number" min="1" required value={form.beds} onChange={handleChange} className="w-full rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-forest">Baths *</label>
          <input name="baths" type="number" min="1" required value={form.baths} onChange={handleChange} className="w-full rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-forest">Area (m²) *</label>
          <input name="area" type="number" min="1" required value={form.area} onChange={handleChange} className="w-full rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-forest">Year Built *</label>
          <input name="yearBuilt" type="number" min="1900" required value={form.yearBuilt} onChange={handleChange} className="w-full rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze" />
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <label className="mb-1 block text-xs font-semibold text-forest">Tagline</label>
          <input name="tagline" value={form.tagline} onChange={handleChange} className="w-full rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze" />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="mb-1 block text-xs font-semibold text-forest">Description</label>
          <textarea name="description" rows="3" value={form.description} onChange={handleChange} className="w-full resize-y rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze" />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="mb-1 block text-xs font-semibold text-forest">Features (one per line)</label>
          <textarea name="featuresText" rows="4" value={form.featuresText} onChange={handleChange} placeholder={"Swimming pool\nSmart home automation\n24/7 security"} className="w-full resize-y rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze" />
        </div>
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-2.5 text-xs text-red-600">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button type="submit" disabled={saving} className="btn-forest !py-2.5 text-xs">
          {saving ? 'Saving…' : listing ? 'Update Listing' : 'Create Listing'}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline-forest !py-2.5 text-xs">
          Cancel
        </button>
      </div>
    </form>
  )
}

/* ──────────── Enquiries Tab ──────────── */

const EnquiriesTab = ({ enquiries, onRefresh }) => {
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState('')
  const timerRef = useRef(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setToast(''), 2500)
  }, [])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const filtered = useMemo(() => {
    if (filter === 'all') return enquiries
    return enquiries.filter((e) => e.status === filter)
  }, [enquiries, filter])

  const handleStatus = async (id, status) => {
    try {
      await apiFetch(`/enquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      showToast(`Status updated to "${status}"`)
      onRefresh()
    } catch (err) {
      showToast(`Error: ${err.message}`)
    }
  }

  const statusCounts = useMemo(() => {
    const counts = { all: enquiries.length, new: 0, contacted: 0, resolved: 0, archived: 0 }
    enquiries.forEach((e) => {
      if (counts[e.status] !== undefined) counts[e.status]++
    })
    return counts
  }, [enquiries])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-serif text-2xl font-bold text-forest">Enquiries</h2>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter === s
                ? 'bg-forest text-cream'
                : 'bg-cream text-text/70 hover:bg-forest/10 hover:text-forest'
            }`}
          >
            {s} ({statusCounts[s] || 0})
          </button>
        ))}
      </div>

      {/* Enquiries — Card view on mobile, table on desktop */}
      <div className="space-y-4 lg:space-y-0">
        {/* Mobile card view */}
        <div className="space-y-3 lg:hidden">
          {filtered.length === 0 && (
            <div className="rounded-xl bg-white py-12 text-center text-sm text-text/50 shadow-soft">No enquiries match this filter.</div>
          )}
          {[...filtered].reverse().map((e) => (
            <div key={e.id} className="rounded-xl bg-white p-4 shadow-soft">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-serif text-sm font-bold text-forest">{e.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-text/50"><MailIcon className="h-3 w-3 text-bronze" />{e.email}</p>
                  {e.phone && <p className="mt-0.5 flex items-center gap-1 text-xs text-text/50"><PhoneIcon className="h-3 w-3 text-bronze" />{e.phone}</p>}
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold ${STATUS_COLORS[e.status] || 'bg-gray-100 text-gray-500'}`}>{e.status}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-cream px-2 py-0.5 text-[0.6rem] font-semibold text-text/60">{e.interest}</span>
                  <span className="text-[0.6rem] text-text/40">{new Date(e.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span>
                </div>
                <select value={e.status} onChange={(ev) => handleStatus(e.id, ev.target.value)} className="rounded border border-cream bg-cream px-2 py-1 text-[0.65rem] font-semibold text-text outline-none focus:border-bronze" aria-label={`Change status for enquiry from ${e.name}`}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {e.message && <p className="mt-2 text-xs text-text/60 line-clamp-2">{e.message}</p>}
            </div>
          ))}
        </div>

        {/* Desktop table view */}
        <div className="hidden overflow-hidden rounded-xl bg-white shadow-soft lg:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream bg-cream/50 text-left text-xs font-semibold uppercase tracking-wider text-text/60">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Interest</th>
                  <th className="px-5 py-3 max-w-xs">Message</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-text/50">No enquiries match this filter.</td></tr>
                )}
                {[...filtered].reverse().map((e) => (
                  <tr key={e.id} className="hover:bg-cream/30 transition-colors">
                    <td className="px-5 py-4 font-semibold text-forest">{e.name}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5 text-text/70"><MailIcon className="h-3 w-3 text-bronze" /> {e.email}</span>
                        {e.phone && <span className="flex items-center gap-1.5 text-text/70"><PhoneIcon className="h-3 w-3 text-bronze" /> {e.phone}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4"><span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-text/70">{e.interest}</span></td>
                    <td className="px-5 py-4 max-w-xs"><p className="truncate text-text/70" title={e.message}>{e.message}</p>{e.propertyId && <span className="mt-1 inline-block rounded bg-bronze/10 px-2 py-0.5 text-[0.6rem] font-semibold text-bronze">Property #{e.propertyId}</span>}</td>
                    <td className="px-5 py-4 text-center"><span className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold ${STATUS_COLORS[e.status] || 'bg-gray-100 text-gray-500'}`}>{e.status}</span></td>
                    <td className="px-5 py-4 text-xs text-text/50">{new Date(e.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</td>
                    <td className="px-5 py-4 text-right"><select value={e.status} onChange={(ev) => handleStatus(e.id, ev.target.value)} className="rounded-md border border-cream bg-cream px-2 py-1.5 text-xs font-semibold text-text outline-none focus:border-bronze" aria-label={`Change status for enquiry from ${e.name}`}>{STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-md bg-forest px-5 py-3 text-cream shadow-lift">
            <CheckIcon className="h-4 w-4 shrink-0 text-bronze" />
            <span className="text-sm font-semibold">{toast}</span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ──────────── Alerts Tab ──────────── */

const AlertsTab = ({ alerts }) => (
  <div className="space-y-6">
    <h2 className="font-serif text-2xl font-bold text-forest">
      Email Alerts ({alerts.length})
    </h2>

    {alerts.length === 0 ? (
      <div className="rounded-xl bg-white p-12 text-center shadow-soft">
        <p className="text-sm text-text/60">No alert subscriptions yet.</p>
      </div>
    ) : (
      <div className="space-y-4 lg:space-y-0">
        {/* Mobile card view */}
        <div className="space-y-3 lg:hidden">
          {alerts.map((a) => (
            <div key={a.id} className="rounded-xl bg-white p-4 shadow-soft">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-serif text-sm font-bold text-forest">{a.email}</p>
                  <p className="mt-0.5 text-xs text-text/50">{a.name || 'No name'}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold ${a.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{a.active ? 'active' : 'unsubscribed'}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {a.criteria?.type && a.criteria.type !== 'All' && <span className="rounded-full bg-cream px-2 py-0.5 text-[0.6rem] font-semibold text-text/60">{a.criteria.type}</span>}
                {a.criteria?.minPrice && <span className="rounded-full bg-cream px-2 py-0.5 text-[0.6rem] font-semibold text-text/60">Min: {formatPrice(a.criteria.minPrice)}</span>}
                {a.criteria?.maxPrice && <span className="rounded-full bg-cream px-2 py-0.5 text-[0.6rem] font-semibold text-text/60">Max: {formatPrice(a.criteria.maxPrice)}</span>}
                {a.criteria?.beds && <span className="rounded-full bg-cream px-2 py-0.5 text-[0.6rem] font-semibold text-text/60">{a.criteria.beds}+ beds</span>}
                {Object.keys(a.criteria || {}).length === 0 && <span className="rounded-full bg-cream px-2 py-0.5 text-[0.6rem] font-semibold text-text/50">All listings</span>}
              </div>
              <p className="mt-2 text-[0.6rem] text-text/40">Created {new Date(a.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          ))}
        </div>

        {/* Desktop table view */}
        <div className="hidden overflow-hidden rounded-xl bg-white shadow-soft lg:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream bg-cream/50 text-left text-xs font-semibold uppercase tracking-wider text-text/60">
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Criteria</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream">
                {alerts.map((a) => (
                  <tr key={a.id} className="hover:bg-cream/30 transition-colors">
                    <td className="px-5 py-4 font-semibold text-forest">{a.email}</td>
                    <td className="px-5 py-4 text-text/70">{a.name || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {a.criteria?.type && a.criteria.type !== 'All' && <span className="rounded-full bg-cream px-2.5 py-0.5 text-[0.65rem] font-semibold text-text/70">{a.criteria.type}</span>}
                        {a.criteria?.minPrice && <span className="rounded-full bg-cream px-2.5 py-0.5 text-[0.65rem] font-semibold text-text/70">Min: {formatPrice(a.criteria.minPrice)}</span>}
                        {a.criteria?.maxPrice && <span className="rounded-full bg-cream px-2.5 py-0.5 text-[0.65rem] font-semibold text-text/70">Max: {formatPrice(a.criteria.maxPrice)}</span>}
                        {a.criteria?.beds && <span className="rounded-full bg-cream px-2.5 py-0.5 text-[0.65rem] font-semibold text-text/70">{a.criteria.beds}+ beds</span>}
                        {a.criteria?.area && <span className="rounded-full bg-cream px-2.5 py-0.5 text-[0.65rem] font-semibold text-text/70">Area: {a.criteria.area}</span>}
                        {Object.keys(a.criteria || {}).length === 0 && <span className="rounded-full bg-cream px-2.5 py-0.5 text-[0.65rem] font-semibold text-text/50">All listings</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center"><span className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold ${a.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{a.active ? 'active' : 'unsubscribed'}</span></td>
                    <td className="px-5 py-4 text-xs text-text/50">{new Date(a.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
  </div>
)

/* ──────────── Main Admin Page ──────────── */

const Admin = () => {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [listings, setListings] = useState([])
  const [enquiries, setEnquiries] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useHead({
    title: 'Admin Dashboard',
    description: 'Manage Verdant Estates listings, enquiries, and alerts.',
    noIndex: true,
  })

  const fetchAll = useCallback(async () => {
    try {
      const [listingsRes, enquiriesRes, alertsRes] = await Promise.allSettled([
        apiFetch('/listings'),
        apiFetch('/enquiries'),
        apiFetch('/alerts'),
      ])
      setListings(listingsRes.status === 'fulfilled' ? (listingsRes.value.listings || []) : [])
      setEnquiries(enquiriesRes.status === 'fulfilled' ? (enquiriesRes.value.enquiries || []) : [])
      setAlerts(alertsRes.status === 'fulfilled' ? (alertsRes.value.alerts || []) : [])
    } catch {
      // handled by individual calls
    } finally {
      setLoading(false)
    }
  }, [])

  // Check existing session on mount
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    fetchCurrentUser()
      .then((res) => { setUser(res.user); fetchAll() })
      .catch(() => { setToken(null); setLoading(false) })
  }, [])

  const fetchCurrentUser = async () => {
    const token = getToken()
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Not authenticated')
    return res.json()
  }

  const handleLogin = (userData) => {
    setUser(userData)
    fetchAll()
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
    setListings([])
    setEnquiries([])
    setAlerts([])
  }

  if (loading) {
    return (
      <section className="section flex min-h-[60vh] items-center justify-center bg-cream">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-bronze border-t-transparent" />
          <p className="mt-4 text-sm text-text/60">Loading dashboard…</p>
        </div>
      </section>
    )
  }

  if (!user) return <LoginForm onLogin={handleLogin} />

  return (
    <>
      <SEO data={organisationSchema()} />
      <div className="flex min-h-[calc(100vh-200px)] bg-cream">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-forest-deep text-cream transition-transform duration-300 md:static md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex items-center justify-between border-b border-cream/10 px-5 py-5">
              <Link to="/" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-bronze text-forest-deep">
                  <HomeIcon className="h-5 w-5" />
                </span>
                <span className="font-serif text-lg font-bold text-cream">
                  Admin <span className="text-bronze">Panel</span>
                </span>
              </Link>
              <button
                type="button"
                className="rounded p-1 text-cream/60 hover:text-cream md:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 px-3 py-4">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'bg-bronze/20 text-bronze'
                      : 'text-cream/70 hover:bg-cream/5 hover:text-cream'
                  }`}
                >
                  {tab.label}
                  {tab.id === 'enquiries' && enquiries.length > 0 && (
                    <span className="ml-auto rounded-full bg-bronze px-2 py-0.5 text-[0.6rem] font-bold text-forest-deep">
                      {enquiries.filter((e) => e.status === 'new').length || enquiries.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* User info */}
            <div className="border-t border-cream/10 px-5 py-4">
              <p className="text-xs text-cream/50">Signed in as</p>
              <p className="mt-0.5 truncate text-sm font-semibold text-cream">{user.email}</p>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 w-full rounded-md border border-cream/20 px-3 py-2 text-xs font-semibold text-cream/70 transition-colors hover:border-cream/40 hover:text-cream"
              >
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          {/* Top bar */}
          <div className="sticky top-0 z-30 flex items-center gap-4 border-b border-cream bg-white/80 px-5 py-3 backdrop-blur-sm md:px-8">
            <button
              type="button"
              className="rounded-md p-2 text-text/60 hover:text-forest md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <h1 className="font-serif text-lg font-bold text-forest capitalize">{activeTab}</h1>
            <div className="ml-auto flex items-center gap-3">
              <Link to="/" className="text-xs font-semibold text-text/60 transition-colors hover:text-forest">
                ← Back to Site
              </Link>
            </div>
          </div>

          {/* Tab content */}
          <div className="p-5 md:p-8">
            {activeTab === 'dashboard' && (
              <DashboardTab listings={listings} enquiries={enquiries} alerts={alerts} />
            )}
            {activeTab === 'listings' && (
              <ListingsTab listings={listings} onRefresh={fetchAll} />
            )}
            {activeTab === 'enquiries' && (
              <EnquiriesTab enquiries={enquiries} onRefresh={fetchAll} />
            )}
            {activeTab === 'alerts' && <AlertsTab alerts={alerts} />}
          </div>
        </main>
      </div>
    </>
  )
}

export default Admin
