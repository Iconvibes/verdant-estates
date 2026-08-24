/**
 * Static Adapter — wraps the existing JS data files.
 * Used for dev/demo mode. No network calls.
 */
import { PROPERTIES } from '../properties.js'
import { AREAS } from '../areas.js'
import { AGENTS } from '../agents.js'
import { BLOG_POSTS } from '../blog.js'

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

const formatPriceNGN = (price) => `₦${price.toLocaleString('en-NG')}`

// ═══════════════════════════════════════════════════════════════════════════════
// Properties
// ═══════════════════════════════════════════════════════════════════════════════

function getPropertiesAll(filters = {}) {
  let result = [...PROPERTIES]

  if (filters.type && filters.type !== 'All') {
    result = result.filter((p) => p.type === filters.type)
  }
  if (filters.minPrice) {
    result = result.filter((p) => p.price >= Number(filters.minPrice))
  }
  if (filters.maxPrice) {
    result = result.filter((p) => p.price <= Number(filters.maxPrice))
  }
  if (filters.beds) {
    result = result.filter((p) => p.beds >= Number(filters.beds))
  }
  if (filters.q) {
    const q = filters.q.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q),
    )
  }
  if (filters.sort) {
    if (filters.sort === 'price-asc') result.sort((a, b) => a.price - b.price)
    else if (filters.sort === 'price-desc') result.sort((a, b) => b.price - a.price)
    else if (filters.sort === 'newest') result.sort((a, b) => (b.yearBuilt || 0) - (a.yearBuilt || 0))
  }

  return result
}

function getPropertyById(id) {
  return PROPERTIES.find((p) => p.id === Number(id)) || null
}

function getPropertyTypes() {
  return ['All', ...new Set(PROPERTIES.map((p) => p.type))]
}

// ═══════════════════════════════════════════════════════════════════════════════
// Areas
// ═══════════════════════════════════════════════════════════════════════════════

function getAreasAll() {
  return AREAS
}

function getAreaById(id) {
  return AREAS.find((a) => a.id === id) || null
}

function getAreaListings(areaId) {
  const area = getAreaById(areaId)
  if (!area) return []
  return PROPERTIES.filter((p) => {
    const addr = p.address.toLowerCase()
    return addr.includes(area.name.toLowerCase()) || addr.includes(area.id.replace('-', ' '))
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// Agents
// ═══════════════════════════════════════════════════════════════════════════════

function getAgentsAll() {
  return AGENTS
}

function getAgentById(id) {
  return AGENTS.find((a) => a.id === id) || null
}

function getAgentListings(agentId) {
  return PROPERTIES.filter((p) => p.agent?.email?.includes(agentId.replace('-', '.')))
}

// ═══════════════════════════════════════════════════════════════════════════════
// Blog
// ═══════════════════════════════════════════════════════════════════════════════

function getBlogAll() {
  return BLOG_POSTS
}

function getBlogBySlug(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug) || null
}

function getBlogCategories() {
  return [...new Set(BLOG_POSTS.map((p) => p.category))]
}

function getBlogRelated(post, limit = 3) {
  return BLOG_POSTS.filter((p) => p.id !== post.id && p.category === post.category).slice(0, limit)
}

function formatBlogDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════════════════════

export function createStaticAdapter() {
  return {
    properties: {
      getAll: getPropertiesAll,
      getById: getPropertyById,
      getTypes: getPropertyTypes,
    },
    areas: {
      getAll: getAreasAll,
      getById: getAreaById,
      getListings: getAreaListings,
    },
    agents: {
      getAll: getAgentsAll,
      getById: getAgentById,
      getListings: getAgentListings,
    },
    blog: {
      getAll: getBlogAll,
      getBySlug: getBlogBySlug,
      getCategories: getBlogCategories,
      getRelated: getBlogRelated,
      formatDate: formatBlogDate,
    },
    formatPrice: formatPriceNGN,
  }
}
