import { Link } from 'react-router-dom'
import { formatPrice } from '../data/properties'
import { ShieldIcon, TreeIcon, UsersIcon, WalkIcon } from './icons'

const AreaCard = ({ area }) => {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link to={`/areas/${area.id}`} className="relative block aspect-[16/10] overflow-hidden bg-forest-deep">
        <img
          src={area.image}
          alt={`${area.name}, Lagos — ${area.tagline}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="font-serif text-2xl font-bold text-cream">{area.name}</h3>
          <p className="mt-1 text-sm text-cream/80">{area.tagline}</p>
        </div>
      </Link>

      {/* Stats */}
      <div className="grid grid-cols-4 divide-x divide-cream border-t border-cream">
        <Stat icon={WalkIcon} value={area.walkabilityScore} label="Walk" />
        <Stat icon={ShieldIcon} value={area.safetyRating} label="Safety" />
        <Stat icon={UsersIcon} value={area.familyFriendliness} label="Family" />
        <Stat icon={TreeIcon} value={area.greenSpaces} label="Green" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text/50">Average price</p>
          <p className="font-serif text-lg font-bold text-forest">{formatPrice(area.averagePrice)}</p>
        </div>
        <Link
          to={`/areas/${area.id}`}
          className="text-xs font-semibold uppercase tracking-wider text-bronze transition-colors hover:text-forest"
        >
          Guide →
        </Link>
      </div>
    </article>
  )
}

const Stat = ({ icon: Icon, value, label }) => (
  <div className="flex flex-col items-center py-3">
    <Icon className="h-4 w-4 text-bronze" />
    <span className="mt-1 font-serif text-lg font-bold text-forest">{value}</span>
    <span className="text-[0.6rem] uppercase tracking-wider text-text/50">{label}</span>
  </div>
)

export default AreaCard
