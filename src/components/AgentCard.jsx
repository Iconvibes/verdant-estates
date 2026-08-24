import { Link } from 'react-router-dom'
import { MapPinIcon, BriefcaseIcon, StarIcon } from './icons'

// Each agent gets a unique accent color and layout variant for visual variety
const cardVariants = [
  { accent: 'from-bronze/90 to-bronze/60', tagStyle: 'bg-bronze text-forest-deep' },
  { accent: 'from-forest/90 to-forest/60', tagStyle: 'bg-forest text-cream' },
  { accent: 'from-forest-deep/90 to-forest-deep/60', tagStyle: 'bg-forest-deep text-bronze' },
  { accent: 'from-forest-deep/80 to-forest/70', tagStyle: 'bg-cream text-forest' },
  { accent: 'from-bronze/80 to-forest-deep/60', tagStyle: 'bg-bronze/20 text-forest-deep' },
  { accent: 'from-forest/80 to-bronze/60', tagStyle: 'bg-forest-deep text-cream' },
]

const AgentCard = ({ agent, listingCount = 0, index = 0 }) => {
  const variant = cardVariants[index % cardVariants.length]

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-lift">
      {/* Large photo header with name overlay */}
      <div className="relative h-72 overflow-hidden">
        {agent.photo ? (
          <img
            src={agent.photo}
            alt={agent.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-forest to-forest-deep">
            <span className="font-serif text-5xl font-bold text-bronze/40">{agent.initials}</span>
          </div>
        )}

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Experience badge - top right */}
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-forest shadow-md backdrop-blur-sm">
          <BriefcaseIcon className="h-3.5 w-3.5 text-bronze" />
          {agent.experience} yrs
        </div>

        {/* Name + role overlay at bottom of photo */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <Link to={`/agents/${agent.id}`}>
            <h3 className="font-serif text-2xl font-bold text-white drop-shadow-lg transition-colors group-hover:text-bronze">
              {agent.name}
            </h3>
          </Link>
          <p className="mt-1 text-sm font-medium text-white/80">{agent.role}</p>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col p-5">
        {/* Specialties as styled tags */}
        <div className="flex flex-wrap gap-1.5">
          {agent.specialties.map((s) => (
            <span
              key={s}
              className={`rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${variant.tagStyle}`}
            >
              {s}
            </span>
          ))}
        </div>

        {/* Bio preview */}
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-text/60">
          {agent.bio?.slice(0, 120)}…
        </p>

        {/* Footer with listings count + CTA */}
        <div className="mt-auto flex items-center justify-between border-t border-cream pt-4">
          {listingCount > 0 ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-text/60">
              <MapPinIcon className="h-3.5 w-3.5 text-bronze" />
              {listingCount} {listingCount === 1 ? 'active listing' : 'active listings'}
            </span>
          ) : (
            <span />
          )}
          <Link
            to={`/agents/${agent.id}`}
            className="inline-flex items-center gap-1 rounded-full bg-forest px-4 py-2 text-xs font-bold uppercase tracking-wider text-cream transition-all duration-300 hover:bg-bronze hover:text-forest-deep"
          >
            View Profile
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  )
}

export default AgentCard
