import { useEffect } from 'react'

const SITE_NAME = 'Verdant Estates'
const SITE_URL = 'https://verdantestates.ng'
const DEFAULT_IMAGE = `${SITE_URL}/images/og-default.jpg`
const DEFAULT_DESCRIPTION =
  "Verdant Estates curates Lagos's most serene addresses — light-filled modern homes wrapped in greenery, from Ikoyi to Eko Atlantic."

function setMeta(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    if (property.startsWith('og:') || property.startsWith('article:')) {
      el.setAttribute('property', property)
    } else {
      el.setAttribute('name', property)
    }
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * Sets the document title and all relevant meta tags for the current page.
 *
 * @param {Object} opts
 * @param {string} opts.title       – Page-specific title (site name appended automatically)
 * @param {string} opts.description – Page description for meta + OG
 * @param {string} [opts.image]     – OG image URL (absolute). Falls back to default.
 * @param {string} [opts.url]       – Canonical / OG URL. Falls back to current location.
 * @param {string} [opts.type]      – OG type. Defaults to "website".
 * @param {boolean} [opts.noIndex]  – If true, adds noindex robots tag.
 */
export default function useHead({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noIndex = false,
} = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
    const canonicalUrl = url || window.location.href
    const absoluteImage = image?.startsWith('http') ? image : `${SITE_URL}${image}`

    // Title
    document.title = fullTitle

    // Basic meta
    setMeta('description', description)

    // Robots
    if (noIndex) {
      setMeta('robots', 'noindex, nofollow')
    } else {
      setMeta('robots', 'index, follow')
    }

    // Open Graph
    setMeta('og:type', type)
    setMeta('og:title', fullTitle)
    setMeta('og:description', description)
    setMeta('og:image', absoluteImage)
    setMeta('og:url', canonicalUrl)
    setMeta('og:site_name', SITE_NAME)

    // Twitter Card
    setMeta('twitter:card', image ? 'summary_large_image' : 'summary')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', description)
    setMeta('twitter:image', absoluteImage)

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)
  }, [title, description, image, url, type, noIndex])
}
