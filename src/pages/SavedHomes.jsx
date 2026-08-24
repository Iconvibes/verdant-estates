import { Link } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import useHead from '../hooks/useHead'
import { useSavedHomes } from '../context/SavedHomesContext'
import { getPropertyById } from '../data'
import { HeartIcon } from '../components/icons'

const SavedHomes = () => {
  const { savedIds, clearSaved } = useSavedHomes()
  const saved = savedIds.map((id) => getPropertyById(id)).filter(Boolean)

  useHead({
    title: 'Saved Homes',
    description: 'Your saved Verdant Estates properties — homes you\u2019re following across Lagos.',
    url: 'https://verdantestates.ng/saved',
    noIndex: true,
  })

  return (
    <>
      <section className="bg-forest-deep py-16 md:py-20">
        <div className="container-x flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Your Wishlist</p>
            <h1 className="mt-3 font-serif text-4xl font-bold text-cream md:text-5xl">Saved Homes</h1>
            <p className="mt-4 max-w-2xl text-cream/75">
              {saved.length === 0
                ? 'Tap the heart on any listing to keep it here for later — it stays even after you close the tab.'
                : `You\u2019re following ${saved.length} ${saved.length === 1 ? 'home' : 'homes'}, saved in the order you added them.`}
            </p>
          </div>
          {saved.length > 0 && (
            <button
              type="button"
              onClick={clearSaved}
              className="text-xs font-semibold uppercase tracking-wider text-cream/70 underline-offset-4 transition-colors hover:text-bronze hover:underline"
            >
              Clear All
            </button>
          )}
        </div>
      </section>

      <section className="section bg-cream">
        <div className="container-x">
          {saved.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {saved.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest text-bronze">
                <HeartIcon className="h-8 w-8" />
              </span>
              <h2 className="mt-6 font-serif text-3xl font-bold">Nothing Saved Yet</h2>
              <p className="mt-3 leading-relaxed text-text/70">
                Browse the portfolio and tap the heart on any home you&rsquo;d like to remember —
                it will appear here instantly.
              </p>
              <Link to="/listings" className="btn-forest mt-8">
                Browse Listings
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default SavedHomes
