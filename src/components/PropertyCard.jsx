import { Link } from 'react-router-dom'
import { useCurrency } from '../context/CurrencyContext'
import { useSavedHomes } from '../context/SavedHomesContext'
import { useCompare } from '../context/CompareContext'
import BlurImage from './BlurImage'
import ShareButtons from './ShareButtons'
import { AreaIcon, BathIcon, BedIcon, CompareIcon, HeartIcon, MapPinIcon } from './icons'

const PropertyCard = ({ property }) => {
  const { isSaved, toggleSaved } = useSavedHomes()
  const { formatPrice } = useCurrency()
  const { isComparing, toggleCompare, canAdd } = useCompare()
  const saved = isSaved(property.id)
  const comparing = isComparing(property.id)

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-forest-deep">
        <Link to={`/listing/${property.id}`} className="absolute inset-0 z-0">
          <BlurImage
            src={property.image}
            alt={property.name}
            className="h-full w-full transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        <span className="absolute left-4 top-4 z-10 rounded-sm bg-forest/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-cream">
          {property.type}
        </span>
        <div className="absolute bottom-3 left-3 z-10">
          <ShareButtons property={property} variant="compact" />
        </div>
      </div>

      <button
        type="button"
        aria-label={saved ? `Remove ${property.name} from saved homes` : `Save ${property.name} to saved homes`}
        aria-pressed={saved}
        title={saved ? 'Remove from saved homes' : 'Save to saved homes'}
        onClick={() => toggleSaved(property.id)}
        className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full shadow-soft transition-all duration-200 ${
          saved ? 'bg-bronze text-forest-deep' : 'bg-forest/85 text-cream hover:bg-forest'
        }`}
      >
        <HeartIcon className="h-5 w-5" filled={saved} />
      </button>

      <button
        type="button"
        aria-label={comparing ? `Remove ${property.name} from comparison` : `Add ${property.name} to comparison`}
        aria-pressed={comparing}
        title={comparing ? 'Remove from comparison' : canAdd ? 'Add to comparison (max 3)' : 'Comparison full (max 3)'}
        onClick={() => toggleCompare(property.id)}
        disabled={!comparing && !canAdd}
        className={`absolute right-4 top-16 flex h-10 w-10 items-center justify-center rounded-full shadow-soft transition-all duration-200 ${
          comparing
            ? 'bg-bronze text-forest-deep'
            : canAdd
              ? 'bg-forest/85 text-cream hover:bg-forest'
              : 'cursor-not-allowed bg-forest/40 text-cream/50'
        }`}
      >
        <CompareIcon className="h-5 w-5" />
      </button>



      <div className="flex flex-1 flex-col p-6">
        <p className="font-serif text-2xl font-bold text-forest">{formatPrice(property.price)}</p>
        <h3 className="mt-1.5 font-serif text-lg font-bold text-forest">
          <Link to={`/listing/${property.id}`} className="transition-colors hover:text-bronze">
            {property.name}
          </Link>
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-text/70">
          <MapPinIcon className="h-4 w-4 text-bronze" />
          {property.address}
        </p>

        <div className="mt-5 flex items-center gap-5 border-t border-cream pt-4 text-sm text-text/80">
          <span className="flex items-center gap-1.5">
            <BedIcon className="h-4 w-4 text-bronze" /> {property.beds} Beds
          </span>
          <span className="flex items-center gap-1.5">
            <BathIcon className="h-4 w-4 text-bronze" /> {property.baths} Baths
          </span>
          <span className="flex items-center gap-1.5">
            <AreaIcon className="h-4 w-4 text-bronze" /> {property.area} m²
          </span>
        </div>

        <Link
          to={`/listing/${property.id}`}
          className="btn-forest mt-6 w-full !py-3 text-xs"
         
        >
          View Details
        </Link>
      </div>
    </article>
  )
}

export default PropertyCard
