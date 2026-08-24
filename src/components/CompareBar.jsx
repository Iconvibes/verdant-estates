import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { useCompare } from '../context/CompareContext'
import { getPropertyById } from '../data'
import { CloseIcon, CompareIcon } from './icons'

const CompareBar = () => {
  const { compareIds, removeCompare, clearCompare, max } = useCompare()
  const barRef = useRef(null)
  const properties = compareIds.map((id) => getPropertyById(id)).filter(Boolean)

  // Animate bar in/out
  useEffect(() => {
    if (!barRef.current) return
    if (compareIds.length > 0) {
      gsap.fromTo(barRef.current, { y: 100, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power2.out' })
    } else {
      gsap.to(barRef.current, { y: 100, autoAlpha: 0, duration: 0.3, ease: 'power2.in' })
    }
  }, [compareIds.length])

  return (
    <div
      ref={barRef}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-cream bg-white/95 shadow-lift backdrop-blur-sm print:hidden"
      style={{ autoAlpha: 0, transform: 'translateY(100px)' }}
    >
      <div className="container-x flex items-center gap-4 py-4">
        {/* Selected property chips */}
        <div className="flex flex-1 items-center gap-3 overflow-x-auto" role="list" aria-label="Properties selected for comparison">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-forest text-bronze" aria-hidden="true">
            <CompareIcon className="h-4 w-4" />
          </span>
          {properties.map((p) => (
            <div
              key={p.id}
              role="listitem"
              className="flex shrink-0 items-center gap-2 rounded-full border border-cream bg-cream px-4 py-2"
            >
              <img src={p.image} alt="" className="h-6 w-6 rounded-full object-cover" />
              <span className="text-xs font-semibold text-forest">{p.name}</span>
              <button
                type="button"
                onClick={() => removeCompare(p.id)}
                className="ml-1 rounded-full p-0.5 text-text/40 transition-colors hover:bg-forest/10 hover:text-forest"
                aria-label={`Remove ${p.name} from comparison`}
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
          {compareIds.length < max && (
            <span className="text-xs text-text/50">
              {compareIds.length} of {max} selected
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-3">              <button
                type="button"
                onClick={clearCompare}
                aria-label="Clear all properties from comparison"
                className="text-xs font-semibold uppercase tracking-wider text-text/50 transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              >
            Clear
          </button>
          <Link
            to="/compare"
            className={`btn text-xs ${compareIds.length >= 2 ? 'btn-forest' : 'bg-cream text-text/50 cursor-not-allowed'}`}
            onClick={(e) => {
              if (compareIds.length < 2) e.preventDefault()
            }}
          >
            Compare {compareIds.length >= 2 ? `(${compareIds.length})` : ''}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CompareBar
