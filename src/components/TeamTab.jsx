import { useState, useRef } from 'react'
import { uploadAgentPhoto, createTeamMember, updateTeamMember, deleteTeamMember } from '../api'
import { CloseIcon, TrashIcon, CheckIcon, SearchIcon } from './icons'

const emptyForm = {
  name: '', role: 'Sales Partner', phone: '', email: '', bio: '',
  specialties: '', experience: 0, languages: 'English', certifications: '',
}

const TeamTab = ({ members, onRefresh }) => {
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [viewMember, setViewMember] = useState(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const fileRef = useRef(null)
  const timerRef = useRef(null)

  const showToast = (msg) => {
    setToast(msg)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setToast(''), 2500)
  }

  const handlePhotoChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setPhoto(f)
    setPhotoPreview(URL.createObjectURL(f))
  }

  const startEdit = (m) => {
    setEditingId(m.id)
    setForm({
      name: m.name || '', role: m.role || 'Sales Partner',
      phone: m.phone || '', email: m.email || '', bio: m.bio || '',
      specialties: (m.specialties || []).join('\n'),
      experience: m.experience || 0,
      languages: (m.languages || ['English']).join(', '),
      certifications: (m.certifications || []).join('\n'),
    })
    setPhotoPreview(m.photo || null)
    setPhoto(null)
  }

  const cancelForm = () => {
    setEditingId(null); setForm(emptyForm); setPhoto(null); setPhotoPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      let photoUrl = photoPreview
      if (photo) photoUrl = await uploadAgentPhoto(photo)
      const data = {
        name: form.name, role: form.role, phone: form.phone, email: form.email,
        photo: photoUrl, bio: form.bio,
        specialties: form.specialties.split('\n').filter(Boolean),
        experience: Number(form.experience),
        languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
        certifications: form.certifications.split('\n').filter(Boolean),
      }
      if (editingId === '__new__') { await createTeamMember(data); showToast('Added') }
      else { await updateTeamMember(editingId, data); showToast('Updated') }
      cancelForm(); onRefresh()
    } catch (err) { showToast('Error: ' + err.message) } finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm('Remove ' + name + '?')) return
    try { await deleteTeamMember(id); showToast('Removed'); onRefresh() }
    catch (err) { showToast('Error: ' + err.message) }
  }

  const filtered = (members || []).filter(m => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return m.name?.toLowerCase().includes(q) || m.role?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-serif text-2xl font-bold text-forest">Team ({filtered.length})</h2>
        <div className="flex gap-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search team..."
              className="rounded-md border border-cream bg-white py-2.5 pl-10 pr-4 text-sm text-text outline-none focus:border-bronze" />
          </div>
          <button type="button" onClick={() => { cancelForm(); setEditingId('__new__') }}
            className="btn-bronze !py-2.5 text-xs">+ Add Member</button>
        </div>
      </div>

      {editingId && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-bronze/30 bg-white p-6 shadow-soft md:p-8">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-forest">
              {editingId === '__new__' ? 'Add Team Member' : 'Edit: ' + form.name}
            </h3>
            <button type="button" onClick={cancelForm} className="rounded-md p-2 text-text/50 hover:text-forest"><CloseIcon className="h-5 w-5" /></button>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-cream">
              {photoPreview ? <img src={photoPreview} alt="" className="h-full w-full object-cover" />
              : <span className="flex h-full w-full items-center justify-center font-serif text-2xl font-bold text-forest/30">{form.name ? form.name.split(' ').map(n => n[0]).join('').slice(0,2) : '?'}</span>}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()} className="rounded-md bg-cream px-3 py-1.5 text-xs font-semibold text-forest hover:bg-forest/10">
                {photoPreview ? 'Change Photo' : 'Upload Photo'}
              </button>
              {photoPreview && <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null) }} className="ml-2 text-xs text-red-500 hover:text-red-700">Remove</button>}
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2"><label className="mb-1 block text-xs font-semibold text-forest">Full Name *</label>
              <input name="name" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                className="w-full rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-forest">Role</label>
              <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}
                className="w-full rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze">
                {['Sales Partner', 'Senior Sales Partner', 'Private Office Director', 'Luxury Resale Manager', 'Consultant', 'Managing Director'].map(r => <option key={r}>{r}</option>)}
              </select></div>
            <div><label className="mb-1 block text-xs font-semibold text-forest">Phone</label>
              <input name="phone" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                className="w-full rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-forest">Email</label>
              <input name="email" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                className="w-full rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-forest">Experience (years)</label>
              <input name="experience" type="number" min="0" value={form.experience} onChange={e => setForm(f => ({...f, experience: e.target.value}))}
                className="w-full rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze" /></div>
            <div className="sm:col-span-2 lg:col-span-3"><label className="mb-1 block text-xs font-semibold text-forest">Bio</label>
              <textarea name="bio" rows="2" value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))}
                className="w-full resize-y rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze" /></div>
            <div className="sm:col-span-2 lg:col-span-3"><label className="mb-1 block text-xs font-semibold text-forest">Specialties (one per line)</label>
              <textarea name="specialties" rows="2" value={form.specialties} onChange={e => setForm(f => ({...f, specialties: e.target.value}))}
                className="w-full resize-y rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze" /></div>
            <div><label className="mb-1 block text-xs font-semibold text-forest">Languages</label>
              <input name="languages" value={form.languages} onChange={e => setForm(f => ({...f, languages: e.target.value}))}
                className="w-full rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze" /></div>
            <div className="sm:col-span-2"><label className="mb-1 block text-xs font-semibold text-forest">Certifications (one per line)</label>
              <textarea name="certifications" rows="2" value={form.certifications} onChange={e => setForm(f => ({...f, certifications: e.target.value}))}
                className="w-full resize-y rounded-md border border-cream bg-cream px-4 py-2.5 text-sm text-text outline-none focus:border-bronze" /></div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="submit" disabled={saving} className="btn-forest !py-2.5 text-xs">
              {saving ? 'Saving...' : editingId === '__new__' ? 'Add Member' : 'Update Member'}</button>
            <button type="button" onClick={cancelForm} className="btn-outline-forest !py-2.5 text-xs">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && <div className="col-span-full rounded-xl bg-white py-12 text-center text-sm text-text/50 shadow-soft">{members?.length > 0 ? 'No matches.' : 'No team members yet.'}</div>}
        {filtered.map(m => (
          <div key={m.id} className="rounded-xl bg-white p-5 shadow-soft transition-shadow hover:shadow-lift">
            <div className="flex items-start gap-3">
              {m.photo ? <img src={m.photo} alt={m.name} className="h-16 w-16 shrink-0 rounded-full object-cover" />
              : <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-forest/10 font-serif text-xl font-bold text-forest">{m.name?.split(' ').map(n => n[0]).join('').slice(0,2)}</span>}
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-serif font-bold text-forest">{m.name}</h4>
                <p className="text-xs font-semibold text-bronze">{m.role}</p>
                {m.phone && <p className="mt-0.5 text-[0.65rem] text-text/50">{m.phone}</p>}
                {m.email && <p className="mt-0.5 text-[0.65rem] text-text/50">{m.email}</p>}
              </div>
            </div>
            {m.bio && <p className="mt-3 text-xs text-text/50 line-clamp-2">{m.bio}</p>}
            {m.specialties?.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{m.specialties.slice(0,3).map(s => <span key={s} className="rounded-full bg-cream px-2 py-0.5 text-[0.6rem] font-semibold text-text/60">{s}</span>)}{m.specialties.length > 3 && <span className="text-[0.6rem] text-text/40">+{m.specialties.length - 3}</span>}</div>}
            <div className="mt-4 flex items-center justify-between">
              <button type="button" onClick={() => setViewMember(m)} className="text-xs font-semibold text-forest hover:text-bronze">View Details</button>
              <div className="flex gap-2">
                <button type="button" onClick={() => startEdit(m)} className="rounded-md bg-cream px-3 py-1.5 text-[0.65rem] font-semibold text-forest hover:bg-forest/10">Edit</button>
                <button type="button" onClick={() => handleDelete(m.id, m.name)} className="rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"><TrashIcon className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {viewMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setViewMember(null)}>
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lift max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {viewMember.photo ? <img src={viewMember.photo} alt={viewMember.name} className="h-20 w-20 rounded-full object-cover" />
                : <span className="flex h-20 w-20 items-center justify-center rounded-full bg-forest/10 font-serif text-2xl font-bold text-forest">{viewMember.name?.split(' ').map(n => n[0]).join('').slice(0,2)}</span>}
                <div>
                  <h3 className="font-serif text-xl font-bold text-forest">{viewMember.name}</h3>
                  <p className="text-sm font-semibold text-bronze">{viewMember.role}</p>
                  {viewMember.experience > 0 && <p className="text-xs text-text/50">{viewMember.experience} years experience</p>}
                </div>
              </div>
              <button onClick={() => setViewMember(null)} className="rounded p-1 text-text/50 hover:text-forest"><CloseIcon className="h-5 w-5" /></button>
            </div>
            <div className="mt-6 space-y-4">
              {viewMember.phone && <div><p className="text-[0.65rem] font-semibold uppercase tracking-wider text-text/40">Phone</p><p className="text-sm text-forest">{viewMember.phone}</p></div>}
              {viewMember.email && <div><p className="text-[0.65rem] font-semibold uppercase tracking-wider text-text/40">Email</p><p className="text-sm text-forest">{viewMember.email}</p></div>}
              {viewMember.bio && <div><p className="text-[0.65rem] font-semibold uppercase tracking-wider text-text/40">Bio</p><p className="text-sm text-text/70">{viewMember.bio}</p></div>}
              {viewMember.specialties?.length > 0 && <div><p className="text-[0.65rem] font-semibold uppercase tracking-wider text-text/40">Specialties</p>
                <div className="mt-1 flex flex-wrap gap-1.5">{viewMember.specialties.map(s => <span key={s} className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-forest">{s}</span>)}</div></div>}
              {viewMember.languages?.length > 0 && <div><p className="text-[0.65rem] font-semibold uppercase tracking-wider text-text/40">Languages</p>
                <p className="text-sm text-text/70">{viewMember.languages.join(', ')}</p></div>}
              {viewMember.certifications?.length > 0 && <div><p className="text-[0.65rem] font-semibold uppercase tracking-wider text-text/40">Certifications</p>
                <div className="mt-1 space-y-1">{viewMember.certifications.map(v => <div key={v} className="flex items-center gap-1.5 text-sm text-text/70"><CheckIcon className="h-3 w-3 text-green-500" /> {v}</div>)}</div></div>}
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => { setViewMember(null); startEdit(viewMember) }} className="btn-forest !py-2 text-xs">Edit Member</button>
              <button type="button" onClick={() => setViewMember(null)} className="btn-outline-forest !py-2 text-xs">Close</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2"><div className="flex items-center gap-3 rounded-md bg-forest px-5 py-3 text-cream shadow-lift"><CheckIcon className="h-4 w-4 shrink-0 text-bronze" /><span className="text-sm font-semibold">{toast}</span></div></div>}
    </div>
  )
}

export default TeamTab
