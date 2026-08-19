import { Link } from 'react-router-dom'
import { useCompare } from '../context/CompareContext'
import { useSavedHomes } from '../context/SavedHomesContext'
import { getPropertyById, formatPrice } from '../data/properties'
import { AreaIcon, BathIcon, BedIcon, CompareIcon, HeartIcon, MapPinIcon, TrashIcon } from './icons'

const RecentlyViewed = ({ ids, excludeId, onClear }) => {
  const properties = ids
    .filter((id) => id !== Number(excludeId))
    .map((id) => getPropertyById(id))
    .filter(Boolean)

  if (properties.length === 0) return null

  return (
    <section className="section overflow-hidden bg-white">
      <div className="container-x">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Keep Exploring</p>
            <h2 className="mt-3 font-serif text-3xl font-bold">You Recently Viewed</h2>
          </div>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text/50 transition-colors hover:text-forest"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>

        <div className="mt-8 flex gap-6 overflow-x-auto pb-4 -mx-5 px-5 snap-x snap-mandatory sm:-mx-8 sm:px-8">
          {properties.map((p) => (
            <MiniCard key={p.id} property={p} />
          ))}
        </div>
      </div>
    </section>
  )
}

const MiniCard = ({ property }) => {
  const { isSaved, toggleSaved } = useSavedHomes()
  const { isComparing, toggleCompare, canAdd } = useCompare()
  const saved = isSaved(property.id)
  const comparing = isComparing(property.id)

  return (
    <article className="group relative flex w-64 shrink-0 flex-col overflow-hidden rounded-xl bg-cream shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift snap-start">
      <Link to={`/listing/${property.id}`} className="relative block aspect-[4/3] overflow-hidden bg-forest-deep">
        <img
          src={property.image}
          alt={property.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 z-10 rounded-sm bg-forest/90 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-wider text-cream">
          {property.type}
        </span>
      </Link>

      {/* Quick action buttons */}
      <button
        type="button"
        aria-label={saved ? 'Unsave' : 'Save'}
        aria-pressed={saved}
        onClick={() => toggleSaved(property.id)}
        className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-soft transition-all duration-200 ${
          saved ? 'bg-bronze text-forest-deep' : 'bg-forest/85 text-cream hover:bg-forest'
        }`}
      >
        <HeartIcon className="h-4 w-4" filled={saved} />
      </button>
      <button
        type="button"
        aria-label={comparing ? 'Remove from compare' : 'Add to compare'}
        aria-pressed={comparing}
        onClick={() => toggleCompare(property.id)}
        disabled={!comparing && !canAdd}
        className={`absolute right-3 top-12 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-soft transition-all duration-200 ${
          comparing
            ? 'bg-bronze text-forest-deep'
            : canAdd
              ? 'bg-forest/85 text-cream hover:bg-forest'
              : 'cursor-not-allowed bg-forest/40 text-cream/50'
        }`}
      >
        <CompareIcon className="h-4 w-4" />
      </button>

      <div className="flex flex-1 flex-col p-4">
        <p className="font-serif text-lg font-bold text-forest">{formatPrice(property.price)}</p>
        <h3 className="mt-1 font-serif text-sm font-bold">
          <Link to={`/listing/${property.id}`} className="transition-colors hover:text-bronze">
            {property.name}
          </Link>
        </h3>
        <p className="mt-1.5 flex items-center gap-1 text-xs text-text/60">
          <MapPinIcon className="h-3 w-3 text-bronze" /> {property.address}
        </p>

        <div className="mt-auto flex items-center gap-4 border-t border-cream pt-3 text-xs text-text/70">
          <span className="flex items-center gap-1">
            <BedIcon className="h-3 w-3 text-bronze" /> {property.beds}
          </span>
          <span className="flex items-center gap-1">
            <BathIcon className="h-3 w-3 text-bronze" /> {property.baths}
          </span>
          <span className="flex items-center gap-1">
            <AreaIcon className="h-3 w-3 text-bronze" /> {property.area} m²
          </span>
        </div>
      </div>
    </article>
  )
}

export default RecentlyViewed
