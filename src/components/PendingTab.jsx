import { useState } from 'react'

function formatPrice(v) {
  if (!v) return ''
  return '₦' + v.toLocaleString()
}

const PendingTab = ({ pending, onApprove, onReject }) => {
  const [expanded, setExpanded] = useState(null)
  const [feedbackMap, setFeedbackMap] = useState({})

  if (pending.length === 0) return <div className="rounded-xl bg-white p-12 text-center shadow-soft"><p className="text-text/50">No pending listings to review.</p></div>

  return (
    <div className="grid gap-4">
      {pending.map((l) => {
        const photos = l.images && l.images.length > 0 ? l.images : (l.image ? [l.image] : [])
        const isOpen = expanded === l.id
        return (
        <div key={l.id} className="rounded-xl bg-white p-4 shadow-soft sm:p-5">
          {photos.length > 0 && (
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
              {photos.map((src, i) => (
                <div key={i} className="relative h-32 w-40 shrink-0 overflow-hidden rounded-lg bg-cream">
                  <img src={src} alt={l.name + " " + (i + 1)} className="h-full w-full object-cover" />
                  {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[0.55rem] font-semibold text-white">Main</span>}
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="truncate font-serif font-bold text-forest">{l.name}</h3>
              <p className="mt-0.5 text-xs text-text/50">{l.type} &middot; {l.address}</p>
              <p className="mt-1 font-serif text-sm font-bold text-bronze">{formatPrice(l.price)}</p>
              <p className="mt-1 text-xs text-text/40">Submitted {new Date(l.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <button onClick={() => setExpanded(isOpen ? null : l.id)} className="rounded-md bg-cream px-3 py-1.5 text-xs font-semibold text-forest hover:bg-forest/10">{isOpen ? 'Collapse' : 'View Details'}</button>
              <button onClick={() => onApprove(l.id)} className="rounded-md bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200">Approve</button>
              <button onClick={() => { const fb = feedbackMap[l.id]; if (!fb || !fb.trim()) { alert("Please enter feedback before rejecting."); } else { onReject(l.id, fb); } }} className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200">Reject</button>
            </div>
          </div>
          {isOpen && (
            <div className="mt-4 border-t border-sage/20 pt-4 space-y-4">
              {l.description && (<div><h4 className="text-xs font-semibold text-forest mb-1">Description</h4><p className="text-sm text-text/70 leading-relaxed">{l.description}</p></div>)}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-cream/50 p-2 text-center"><p className="text-[0.65rem] text-text/40">Beds</p><p className="font-serif text-sm font-bold text-forest">{l.beds}</p></div>
                <div className="rounded-lg bg-cream/50 p-2 text-center"><p className="text-[0.65rem] text-text/40">Baths</p><p className="font-serif text-sm font-bold text-forest">{l.baths}</p></div>
                <div className="rounded-lg bg-cream/50 p-2 text-center"><p className="text-[0.65rem] text-text/40">Area</p><p className="font-serif text-sm font-bold text-forest">{l.area} m²</p></div>
                <div className="rounded-lg bg-cream/50 p-2 text-center"><p className="text-[0.65rem] text-text/40">Year</p><p className="font-serif text-sm font-bold text-forest">{l.yearBuilt}</p></div>
              </div>
              {l.features && l.features.length > 0 && (<div><h4 className="text-xs font-semibold text-forest mb-1">Features</h4><div className="flex flex-wrap gap-1.5">{l.features.map((f, i) => (<span key={i} className="rounded-full bg-forest/5 px-2.5 py-0.5 text-[0.65rem] text-forest/70">{f}</span>))}</div></div>)}
              {l.agent && l.agent.name && (<div><h4 className="text-xs font-semibold text-forest mb-1">Agent</h4><p className="text-sm text-text/70">{l.agent.name} &middot; {l.agent.role || ""} {l.agent.phone ? "• " + l.agent.phone : ""}</p></div>)}
              {l.tagline && (<div><h4 className="text-xs font-semibold text-forest mb-1">Tagline</h4><p className="text-sm italic text-text/60">{l.tagline}</p></div>)}
              <div>
                <h4 className="text-xs font-semibold text-forest mb-1">Feedback for Agent (required to reject)</h4>
                <textarea
                  className="w-full rounded-lg border border-sage/30 bg-cream/30 px-3 py-2 text-sm text-text focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
                  rows={3}
                  placeholder="e.g. Please add more photos of the interior, or update the price..."
                  value={feedbackMap[l.id] || ""}
                  onChange={(e) => setFeedbackMap(prev => ({ ...prev, [l.id]: e.target.value }))}
                />
              </div>
            </div>
          )}
        </div>
        )
      })}
    </div>
  )
}

export default PendingTab
