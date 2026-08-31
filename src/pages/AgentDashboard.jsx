import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  fetchAgentProfile,
  fetchAgentListings,
  createListingForAgent,
  updateListingForAgent,
  deleteListingForAgent,
  fetchAgentEnquiries,
  getListingMetrics,
  changePassword,
  updateEnquiryStatus,
  setToken,
} from '../api'
import useHead from '../hooks/useHead'
import { formatPrice } from '../data'
import ImageUploader from '../components/ImageUploader'

const PROPERTY_TYPES = ['Detached Duplex', 'Semi-Detached Duplex', 'Terrace Duplex', 'Detached Villa', 'Waterfront Villa', 'Penthouse', 'Apartment', 'Duplex Apartment', 'Townhouse', 'Detached Bungalow']

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  published: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-500',
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
}

const emptyListing = {
  name: '', type: 'Detached Duplex', price: '', address: '',
  beds: 3, baths: 3, area: 300, yearBuilt: 2024,
  image: '', images: [], tagline: '', description: '',
  features: '', agent: {}, coords: [0, 0],
}

const AgentDashboard = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [enquiries, setEnquiries] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [tab, setTab] = useState('listings')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyListing)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useHead({ title: 'Agent Dashboard | Verdant Estates', noIndex: true })

  // Load profile and data
  const loadData = useCallback(async () => {
    try {
      const userJson = sessionStorage.getItem('agent.user')
      const profileJson = sessionStorage.getItem('agent.profile')
      if (!userJson || !profileJson) {
        navigate('/agent/login')
        return
      }
      const user = JSON.parse(userJson)
      const prof = JSON.parse(profileJson)
      setProfile(prof)

      const [listingsResult, enquiriesResult, metricsResult] = await Promise.all([
        fetchAgentListings(prof.id),
        fetchAgentEnquiries(prof.id),
        getListingMetrics(prof.id),
      ])
      setListings(listingsResult.listings || [])
      setEnquiries(enquiriesResult.enquiries || [])
      setMetrics(metricsResult)
    } catch {
      navigate('/agent/login')
    }
  }, [navigate])

  useEffect(() => { loadData() }, [loadData])

  const handleLogout = () => {
    sessionStorage.removeItem('agent.user')
    sessionStorage.removeItem('agent.profile')
    setToken(null)
    navigate('/agent/login')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const startEdit = (listing) => {
    setEditingId(listing.id)
    setForm({
      name: listing.name,
      type: listing.type,
      price: listing.price,
      address: listing.address,
      beds: listing.beds,
      baths: listing.baths,
      area: listing.area,
      yearBuilt: listing.yearBuilt,
      image: listing.image,
      images: listing.images || [],
      tagline: listing.tagline || '',
      description: listing.description || '',
      features: Array.isArray(listing.features) ? listing.features.join('\n') : '',
      agent: listing.agent || {},
      coords: listing.coords || [0, 0],
    })
    setTab('new')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const data = {
        ...form,
        price: Number(form.price),
        beds: Number(form.beds),
        baths: Number(form.baths),
        area: Number(form.area),
        yearBuilt: Number(form.yearBuilt),
        features: form.features.split('\n').filter(Boolean),
        agent: { name: profile.name, email: profile.email, phone: profile.phone || '', role: profile.role || 'Sales Partner' },
      }
      if (editingId) {
        await updateListingForAgent(editingId, data, profile.id)
        setMessage({ type: 'success', text: 'Listing updated and resubmitted for review.' })
      } else {
        await createListingForAgent(data, profile.id)
        setMessage({ type: 'success', text: 'Listing submitted for admin review. It will appear on the site once approved.' })
      }
      setEditingId(null)
      setForm(emptyListing)
      setTab('listings')
      const result = await fetchAgentListings(profile.id)
      setListings(result.listings || [])
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to save listing.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!profile || !window.confirm('Are you sure you want to delete this listing?')) return
    try {
      await deleteListingForAgent(id, profile.id)
      setListings((prev) => prev.filter((l) => l.id !== id))
    } catch {
      // ignore
    }
  }

  const stats = useMemo(() => ({
    total: listings.length,
    published: listings.filter((l) => l.status === 'published').length,
    pending: listings.filter((l) => l.status === 'pending').length,
    enquiries: enquiries.length,
    views: metrics?.totalViews || 0,
    saves: metrics?.totalSaves || 0,
  }), [listings, enquiries, metrics])

  if (!profile) return null

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-forest-deep text-cream">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bronze font-serif text-sm font-bold text-forest-deep">
              {profile.name.split(' ').map((n) => n[0]).join('')}
            </span>
            <div>
              <p className="font-serif font-bold">{profile.name}</p>
              <p className="text-xs text-cream/60">{profile.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xs text-cream/60 hover:text-cream">← Back to site</Link>
            <button onClick={handleLogout} className="rounded-md bg-cream/10 px-3 py-1.5 text-xs text-cream hover:bg-cream/20">Sign Out</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'Total Listings', value: stats.total },
            { label: 'Published', value: stats.published, color: 'text-green-600' },
            { label: 'Pending Review', value: stats.pending, color: 'text-amber-600' },
            { label: 'Total Views', value: stats.views, color: 'text-purple-600' },
            { label: 'Enquiries', value: stats.enquiries, color: 'text-blue-600' },
            { label: 'Saves', value: stats.saves, color: 'text-pink-600' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-white p-5 shadow-soft">
              <p className={`font-serif text-3xl font-bold ${s.color || 'text-forest'}`}>{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-text/50">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-cream">
          {[
            { id: 'listings', label: 'My Listings' },
            { id: 'new', label: editingId ? 'Edit Listing' : 'New Listing' },
            { id: 'enquiries', label: 'Enquiries' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); if (t.id === 'new' && !editingId) setForm(emptyListing) }}
              className={`px-5 py-3 text-sm font-semibold transition-colors ${tab === t.id ? 'border-b-2 border-forest text-forest' : 'text-text/50 hover:text-forest'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {message.text && (
          <div className={`mb-4 rounded-md px-4 py-2.5 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {message.text}
          </div>
        )}

        {/* ─── My Listings ─── */}
        {tab === 'listings' && (
          <div className="grid gap-4">
            {listings.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-soft">
                <p className="text-text/50">No listings yet.</p>
                <button onClick={() => setTab('new')} className="btn-forest mt-4">Add Your First Listing</button>
              </div>
            ) : listings.map((l) => {
              const m = metrics?.listings?.find((ml) => ml.id === l.id) || {}
              return (
              <div key={l.id} className="rounded-xl bg-white p-4 shadow-soft sm:p-5">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-cream">
                    {l.image ? <img src={l.image} alt={l.name} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-serif font-bold text-forest">{l.name}</h3>
                      <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase">{l.status}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-text/50">{l.type} &middot; {l.address}</p>
                    <p className="mt-1 font-serif text-sm font-bold text-bronze">{formatPrice(l.price)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => startEdit(l)} className="rounded-md bg-cream px-3 py-1.5 text-xs font-semibold text-forest hover:bg-forest/10">Edit</button>
                    <button onClick={() => handleDelete(l.id)} className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">Delete</button>
                  </div>
                </div>
                {/* Performance metrics */}
                {(m.views || m.enquiries || m.saves) ? (
                  <div className="mt-3 flex gap-4 border-t border-cream pt-3">
                    <div className="flex items-center gap-1.5 text-xs text-text/60">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      <span className="font-semibold text-purple-600">{m.views || 0}</span> views
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text/60">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      <span className="font-semibold text-blue-600">{m.enquiries || 0}</span> enquiries
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text/60">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      <span className="font-semibold text-pink-600">{m.saves || 0}</span> saves
                    </div>
                  </div>
                ) : null}
              </div>
              )
            })}
          </div>
        )}

        {tab === 'new' && (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow-soft sm:p-8">
            <h2 className="font-serif text-xl font-bold text-forest">{editingId ? 'Edit Listing' : 'Add New Listing'}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-semibold text-forest">Property Name *</label><input name="name" required value={form.name} onChange={handleChange} className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none focus:border-bronze" /></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-forest">Type *</label><select name="type" value={form.type} onChange={handleChange} className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none focus:border-bronze">{PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-forest">Price *</label><input name="price" type="number" required value={form.price} onChange={handleChange} className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none focus:border-bronze" /></div>
              <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-semibold text-forest">Address *</label><input name="address" required value={form.address} onChange={handleChange} className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none focus:border-bronze" /></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-forest">Bedrooms</label><input name="beds" type="number" value={form.beds} onChange={handleChange} className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none focus:border-bronze" /></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-forest">Bathrooms</label><input name="baths" type="number" value={form.baths} onChange={handleChange} className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none focus:border-bronze" /></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-forest">Area (m2)</label><input name="area" type="number" value={form.area} onChange={handleChange} className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none focus:border-bronze" /></div>
              <div><label className="mb-1.5 block text-sm font-semibold text-forest">Year Built</label><input name="yearBuilt" type="number" value={form.yearBuilt} onChange={handleChange} className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none focus:border-bronze" /></div>
              <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-semibold text-forest">Tagline</label><input name="tagline" value={form.tagline} onChange={handleChange} className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none focus:border-bronze" /></div>
              <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-semibold text-forest">Description *</label><textarea name="description" required rows="4" value={form.description} onChange={handleChange} className="w-full resize-y rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none focus:border-bronze" /></div>
              <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-semibold text-forest">Features (one per line)</label><textarea name="features" rows="4" value={form.features} onChange={handleChange} className="w-full resize-y rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none focus:border-bronze" placeholder={'Swimming pool\nSmart home\n24/7 security'} /></div>
              <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-semibold text-forest">Main Image URL</label><input name="image" value={form.image} onChange={handleChange} placeholder="https://..." className="w-full rounded-md border border-cream bg-cream px-4 py-3 text-sm text-text outline-none focus:border-bronze" /></div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-forest disabled:opacity-50">{saving ? 'Saving...' : editingId ? 'Update & Resubmit' : 'Submit for Review'}</button>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyListing) }} className="btn-outline-forest">Cancel</button>}
            </div>
          </form>
        )}

        {tab === 'enquiries' && (
          <div className="grid gap-3">
            {enquiries.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-soft"><p className="text-text/50">No enquiries yet.</p></div>
            ) : enquiries.map((e) => (
              <div key={e.id} className="rounded-xl bg-white p-5 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-forest">{e.name}</h3>
                      <span className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase">{e.status}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-text/50">{e.email}</p>
                    {e.propertyName && <p className="mt-1 text-xs text-bronze font-semibold">Re: {e.propertyName}</p>}
                  </div>
                  <div className="flex gap-1.5">
                    {e.status === 'new' && <button onClick={() => updateEnquiryStatus(e.id, 'contacted').then(() => loadData())} className="rounded-md bg-amber-50 px-2.5 py-1 text-[0.65rem] font-semibold text-amber-700 hover:bg-amber-100">Mark Contacted</button>}
                    {e.status !== 'resolved' && <button onClick={() => updateEnquiryStatus(e.id, 'resolved').then(() => loadData())} className="rounded-md bg-green-50 px-2.5 py-1 text-[0.65rem] font-semibold text-green-700 hover:bg-green-100">Resolve</button>}
                  </div>
                </div>
                <p className="mt-3 text-sm text-text/70">{e.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentDashboard
