import { Link, useParams } from 'react-router-dom'
import { getBlogPostBySlug, getRelatedPosts, formatBlogDate, getAllBlogPosts } from '../data'
import useHead from '../hooks/useHead'
import SEO, { organisationSchema, breadcrumbSchema } from '../components/SEO'
import StaggerReveal from '../components/StaggerReveal'
import { ArrowRightIcon, ClockIcon } from '../components/icons'

const BlogPost = () => {
  const { slug } = useParams()
  const post = getBlogPostBySlug(slug)
  const related = post ? getRelatedPosts(post, 3) : []

  useHead(
    post
      ? {
          title: post.title,
          description: post.excerpt,
          image: post.image,
          url: `https://verdantestates.ng/blog/${post.slug}`,
          type: 'article',
        }
      : { title: 'Article Not Found', noIndex: true },
  )

  if (!post) {
    return (
      <>
        <section className="section bg-cream">
          <div className="container-x mx-auto max-w-xl text-center">
            <h1 className="font-serif text-4xl font-bold">Article Not Found</h1>
            <p className="mt-4 text-text/70">
              We couldn&rsquo;t find that article — it may have been moved or the link is outdated.
            </p>
            <Link to="/blog" className="btn-forest mt-8">
              Back to Blog
            </Link>
          </div>
        </section>
      </>
    )
  }

  // Simple markdown-like rendering for the content
  const renderContent = (markdown) => {
    const lines = markdown.split('\n')
    const elements = []
    let inList = false
    let listItems = []

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="my-4 space-y-2 pl-5">
            {listItems.map((item, i) => (
              <li key={i} className="text-text/80 list-disc">{item}</li>
            ))}
          </ul>,
        )
        listItems = []
        inList = false
      }
    }

    lines.forEach((line, idx) => {
      const trimmed = line.trim()

      // Empty line
      if (!trimmed) {
        flushList()
        return
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        flushList()
        elements.push(
          <h4 key={idx} className="mt-8 mb-3 font-serif text-xl font-bold text-forest">
            {trimmed.slice(4)}
          </h4>,
        )
        return
      }
      if (trimmed.startsWith('## ')) {
        flushList()
        elements.push(
          <h3 key={idx} className="mt-10 mb-4 font-serif text-2xl font-bold text-forest">
            {trimmed.slice(3)}
          </h3>,
        )
        return
      }

      // Bold text
      const boldText = (text) => {
        const parts = text.split(/\*\*(.*?)\*\*/)
        return parts.map((part, i) =>
          i % 2 === 1 ? <strong key={i} className="font-semibold text-forest">{part}</strong> : part,
        )
      }

      // List items
      if (trimmed.startsWith('- ')) {
        inList = true
        listItems.push(
          <span className="leading-relaxed">{boldText(trimmed.slice(2))}</span>,
        )
        return
      }

      // Paragraphs
      flushList()
      elements.push(
        <p key={idx} className="my-3 leading-relaxed text-text/80">
          {boldText(trimmed)}
        </p>,
      )
    })

    flushList()
    return elements
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-forest-deep py-16 md:py-20">
        <img
          src={post.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/60 via-forest-deep/80 to-forest-deep" aria-hidden="true" />
        <div className="container-x relative">
          <nav className="text-xs font-semibold uppercase tracking-wider text-cream/60">
            <Link to="/" className="hover:text-bronze">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-bronze">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-bronze">{post.category}</span>
          </nav>

          <div className="mt-6 flex items-center gap-3">
            <span className="rounded-full bg-bronze/20 px-3 py-1 text-xs font-semibold text-bronze">
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-cream/60">
              <ClockIcon className="h-3 w-3" /> {post.readTime} min read
            </span>
          </div>

          <h1 className="mt-4 max-w-3xl font-serif text-3xl font-bold leading-tight text-cream md:text-5xl">
            {post.title}
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-cream/70">
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* Article */}
      <section className="section bg-cream">
        <div className="container-x">
          <div className="mx-auto grid gap-12 lg:grid-cols-[1fr_300px]">
            {/* Main content */}
            <article>
              {/* Author bar */}
              <div className="flex items-center justify-between border-b border-cream pb-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-forest font-serif text-sm font-bold text-bronze">
                    {post.author.split(' ').map((n) => n[0]).join('')}
                  </span>
                  <div>
                    <p className="font-serif text-base font-bold text-forest">{post.author}</p>
                    <p className="text-xs text-text/60">{post.authorRole}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-text/60">{formatBlogDate(post.date)}</p>
                  <p className="text-[0.65rem] text-text/40">{post.readTime} min read</p>
                </div>
              </div>

              {/* Article body */}
              <div className="prose-verdant mt-8">
                {renderContent(post.content)}
              </div>

              {/* Tags */}
              <div className="mt-10 flex flex-wrap gap-2 border-t border-cream pt-6">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-forest/5 px-3 py-1.5 text-xs font-semibold text-forest/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Share */}
              <div className="mt-8 rounded-xl bg-white p-6 shadow-soft">
                <h3 className="font-serif text-lg font-bold text-forest">Share This Article</h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${post.title} — ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#1877F2] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Facebook
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#1DA1F2] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Twitter / X
                  </a>
                  <a
                    href={`https://www.instagram.com/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Instagram
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#0A66C2] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    LinkedIn
                  </a>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(window.location.href)}
                    className="rounded-full bg-cream px-4 py-2 text-xs font-semibold text-forest transition-colors hover:bg-forest/10"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
              {/* Related posts */}
              {related.length > 0 && (
                <div className="rounded-xl bg-white p-6 shadow-soft">
                  <h3 className="font-serif text-lg font-bold text-forest">Related Articles</h3>
                  <div className="mt-4 space-y-4">
                    {related.map((r) => (
                      <Link
                        key={r.id}
                        to={`/blog/${r.slug}`}
                        className="group flex gap-3"
                      >
                        <img
                          src={r.image}
                          alt={r.title}
                          className="h-16 w-20 shrink-0 rounded-md object-cover"
                        />
                        <div>
                          <p className="text-xs font-semibold text-bronze">{r.category}</p>
                          <p className="mt-0.5 text-sm font-semibold text-forest transition-colors group-hover:text-bronze line-clamp-2">
                            {r.title}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <div className="rounded-xl bg-forest p-6 text-cream">
                <h3 className="font-serif text-lg font-bold">Stay Updated</h3>
                <p className="mt-2 text-sm text-cream/70">
                  Get market insights delivered to your inbox.
                </p>
                <div className="mt-4 space-y-3">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-md border border-cream/20 bg-forest-deep px-4 py-2.5 text-sm text-cream outline-none placeholder:text-cream/40 focus:border-bronze"
                  />
                  <button type="button" className="btn-bronze w-full !py-2.5 text-xs">
                    Subscribe
                  </button>
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-xl border border-cream bg-white p-6 shadow-soft">
                <h3 className="font-serif text-lg font-bold text-forest">Ready to Buy?</h3>
                <p className="mt-2 text-sm text-text/60">
                  Talk to our team about finding your perfect home in Lagos.
                </p>
                <Link to="/contact" className="btn-forest mt-4 w-full !py-2.5 text-xs">
                  Book a Tour
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* More articles */}
      {getAllBlogPosts().filter((p) => p.id !== post.id).length > 0 && (
        <section className="section bg-white">
          <div className="container-x">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Keep Reading</p>
                <h2 className="mt-3 font-serif text-3xl font-bold">More Articles</h2>
              </div>
              <Link to="/blog" className="btn-forest !py-3 text-xs">
                All Articles
              </Link>
            </div>
            <StaggerReveal className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {getAllBlogPosts().filter((p) => p.id !== post.id)
                .slice(0, 3)
                .map((p) => (
                  <Link
                    key={p.id}
                    to={`/blog/${p.slug}`}
                    className="group flex flex-col overflow-hidden rounded-xl bg-cream shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                  >
                    <div className="overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.title}
                        loading="lazy"
                        className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <span className="text-[0.65rem] font-semibold text-bronze">{p.category}</span>
                      <h3 className="mt-2 font-serif text-lg font-bold text-forest transition-colors group-hover:text-bronze">
                        {p.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm text-text/60 line-clamp-2">{p.excerpt}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-bronze">
                        Read More <ArrowRightIcon className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                ))}
            </StaggerReveal>
          </div>
        </section>
      )}

      <SEO data={breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Blog', url: '/blog' },
        { name: post.title, url: `/blog/${post.slug}` },
      ])} />
    </>
  )
}

export default BlogPost
