import { Link } from 'react-router-dom'
import { MapPinIcon, BriefcaseIcon } from './icons'

const AgentCard = ({ agent, listingCount = 0 }) => {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      {/* Header with avatar */}
      <div className="relative bg-gradient-to-br from-forest to-forest-deep px-6 pt-8 pb-14">
        <span className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/20 bg-bronze font-serif text-2xl font-bold text-forest-deep">
          {agent.initials}
        </span>
      </div>

      {/* Name + role (overlapping header) */}
      <div className="relative -mt-6 px-6">
        <Link to={`/agents/${agent.id}`}>
          <h3 className="font-serif text-xl font-bold text-forest transition-colors group-hover:text-bronze">
            {agent.name}
          </h3>
        </Link>
        <p className="mt-0.5 text-sm text-text/60">{agent.role}</p>

        {/* Specialties */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {agent.specialties.map((s) => (
            <span
              key={s}
              className="rounded-full bg-cream px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-text/60"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Stats + contact */}
      <div className="mt-auto flex items-center justify-between border-t border-cream px-6 py-4">
        <div className="flex items-center gap-4 text-xs text-text/60">
          <span className="flex items-center gap-1.5">
            <BriefcaseIcon className="h-3.5 w-3.5 text-bronze" />
            {agent.experience} yrs
          </span>
          {listingCount > 0 && (
            <span className="flex items-center gap-1.5">
              <MapPinIcon className="h-3.5 w-3.5 text-bronze" />
              {listingCount} {listingCount === 1 ? 'listing' : 'listings'}
            </span>
          )}
        </div>
        <Link
          to={`/agents/${agent.id}`}
          className="text-xs font-semibold uppercase tracking-wider text-bronze transition-colors hover:text-forest"
        >
          View Profile →
        </Link>
      </div>
    </article>
  )
}

export default AgentCard
