import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllBlogPosts, getBlogCategories, formatBlogDate } from '../data'
import useHead from '../hooks/useHead'
import SEO, { organisationSchema } from '../components/SEO'
import StaggerReveal from '../components/StaggerReveal'
import { getFrameUrl } from '../data/frames'
import { ArrowRightIcon, ClockIcon, SearchIcon } from '../components/icons'

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const categories = useMemo(() => ['All', ...getBlogCategories()], [])

  useHead({
    title: 'Market Insights & Guides',
    description: 'Expert insights on Lagos luxury real estate — market outlooks, buyer guides, neighbourhood comparisons, and sustainable design from Verdant Estates.',
    url: 'https://verdantestates.ng/blog',
  })

  const posts = getAllBlogPosts()
  const featured = posts.find((p) => p.featured)

  const filtered = useMemo(() => {
    let result = [...posts]
    if (activeCategory !== 'All') {
      result = result.filter((p) => p.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }
    return result
  }, [activeCategory, search, posts])

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-forest-deep py-16 md:py-20">
        <img
          src={getFrameUrl(150)}
          alt="Lagos real estate insights"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep via-forest-deep/80 to-forest-deep/50" aria-hidden="true" />
        <div className="container-x relative">
          <p className="eyebrow">Insights & Guides</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-cream md:text-5xl">
            Lagos Real Estate Intelligence
          </h1>
          <p className="mt-4 max-w-2xl text-cream/75">
            Expert analysis, buyer guides, and market insights from the team that knows
            Lagos luxury property inside out.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      {featured && activeCategory === 'All' && !search && (
        <section className="section bg-cream">
          <div className="container-x">
            <p className="eyebrow">Featured</p>
            <Link
              to={`/blog/${featured.slug}`}
              className="group mt-4 block overflow-hidden rounded-xl bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift lg:grid lg:grid-cols-2"
            >
              <div className="overflow-hidden">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center p-8 md:p-10">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-bronze/10 px-3 py-1 text-xs font-semibold text-bronze">
                    {featured.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-text/50">
                    <ClockIcon className="h-3 w-3" /> {featured.readTime} min read
                  </span>
                </div>
                <h2 className="mt-4 font-serif text-2xl font-bold text-forest transition-colors group-hover:text-bronze md:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text/70">
                  {featured.excerpt}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-xs font-bold text-bronze">
                    {featured.author.split(' ').map((n) => n[0]).join('')}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-forest">{featured.author}</p>
                    <p className="text-xs text-text/50">{formatBlogDate(featured.date)}</p>
                  </div>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-bronze transition-colors group-hover:text-forest">
                  Read Article <ArrowRightIcon className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Filter + Grid */}
      <section className="section bg-white">
        <div className="container-x">
          {/* Search + Categories */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    activeCategory === cat
                      ? 'bg-forest text-cream'
                      : 'bg-cream text-text/70 hover:bg-forest/10 hover:text-forest'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles…"
                className="rounded-md border border-cream bg-cream py-2.5 pl-10 pr-4 text-sm text-text outline-none transition-colors focus:border-bronze"
              />
            </div>
          </div>

          {/* Post Grid */}
          <StaggerReveal
            key={`${activeCategory}-${search}`}
            className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl bg-cream shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-forest/10 px-3 py-1 text-[0.65rem] font-semibold text-forest">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-[0.65rem] text-text/50">
                      <ClockIcon className="h-3 w-3" /> {post.readTime} min
                    </span>
                  </div>
                  <h3 className="mt-3 font-serif text-lg font-bold text-forest transition-colors group-hover:text-bronze">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-text/65 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="mt-5 flex items-center gap-3 border-t border-cream pt-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-[0.6rem] font-bold text-bronze">
                      {post.author.split(' ').map((n) => n[0]).join('')}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-forest">{post.author}</p>
                      <p className="text-[0.65rem] text-text/50">{formatBlogDate(post.date)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </StaggerReveal>

          {filtered.length === 0 && (
            <div className="mt-16 text-center">
              <p className="font-serif text-2xl font-bold text-forest">No Articles Found</p>
              <p className="mt-3 text-sm text-text/60">
                Try a different search term or category.
              </p>
              <button
                type="button"
                onClick={() => { setActiveCategory('All'); setSearch('') }}
                className="btn-forest mt-6"
              >
                Show All Articles
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-forest py-20">
        <div className="container-x flex flex-wrap items-center justify-between gap-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-cream md:text-4xl">
              Have a Question About Lagos Real Estate?
            </h2>
            <p className="mt-3 max-w-lg text-cream/75">
              Our team responds to every enquiry within one working day.
            </p>
          </div>
          <Link to="/contact" className="btn-bronze">
            Get in Touch
          </Link>
        </div>
      </section>

      <SEO data={organisationSchema()} />
    </>
  )
}

export default Blog
