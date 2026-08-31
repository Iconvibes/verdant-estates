/**
 * API Adapter — fetches properties from Supabase via src/api.js.
 * Includes an in-memory cache so components that call getAllProperties()
 * or getPropertyById() synchronously still work (return cached data).
 */
import { fetchListings, fetchListingById } from '../../api.js'
import { supabase } from '../../lib/supabase'

// ═══════════════════════════════════════════════════════════════════════════════
// In-memory cache
// ═══════════════════════════════════════════════════════════════════════════════

let listingsCache = null
let listingsPromise = null

function fetchAndCache() {
  if (!listingsPromise) {
    listingsPromise = fetchListings({})
      .then((data) => {
        listingsCache = data.listings || []
        return listingsCache
      })
      .catch(() => {
        listingsCache = []
        return listingsCache
      })
  }
  return listingsPromise
}

// Kick off the fetch immediately on module load
fetchAndCache()

// ═══════════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════════

const formatPriceNGN = (price) => `₦${price.toLocaleString('en-NG')}`

// Cache for static data that doesn't change often
let areasCache = null
let agentsCache = null
let blogCache = null

// ═══════════════════════════════════════════════════════════════════════════════
// Properties
// ═══════════════════════════════════════════════════════════════════════════════

function getPropertiesAll(filters = {}) {
  // Return from cache synchronously if available, or trigger fetch
  if (!listingsCache) {
    fetchAndCache() // fire-and-forget — will populate cache asynchronously
    return []
  }

  const all = listingsCache

  // Apply filters in-memory (matching the old API behavior)
  let result = [...all]

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
    result = result.filter((p) =>
      `${p.name} ${p.address} ${p.type}`.toLowerCase().includes(q)
    )
  }
  if (filters.sort === 'price-asc') {
    result.sort((a, b) => a.price - b.price)
  } else if (filters.sort === 'price-desc') {
    result.sort((a, b) => b.price - a.price)
  } else if (filters.sort === 'newest') {
    result.sort((a, b) => (b.yearBuilt || 0) - (a.yearBuilt || 0))
  }

  return result
}

function getPropertyById(id) {
  if (!listingsCache) return null
  const numId = Number(id)
  return listingsCache.find((p) => p.id === numId || p.id === String(id)) || null
}

function getPropertyTypes() {
  if (!listingsCache) return ['All']
  const types = [...new Set(listingsCache.map((p) => p.type))]
  return ['All', ...types.sort()]
}

// ═══════════════════════════════════════════════════════════════════════════════
// Areas — still from static data (no API endpoint yet)
// ═══════════════════════════════════════════════════════════════════════════════

async function getAreasAll() {
  if (!areasCache) {
    const { AREAS } = await import('../areas.js')
    areasCache = AREAS
  }
  return areasCache
}

async function getAreaById(id) {
  const areas = await getAreasAll()
  return areas.find((a) => a.id === id) || null
}

async function getAreaListings(areaId) {
  const area = await getAreaById(areaId)
  if (!area) return []
  const all = listingsCache || []
  return all.filter((p) => {
    const addr = p.address.toLowerCase()
    return addr.includes(area.name.toLowerCase()) || addr.includes(area.id.replace('-', ' '))
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// Agents — still from static data
// ═══════════════════════════════════════════════════════════════════════════════

async function getAgentsAll() {
  if (!agentsCache) {
    const { AGENTS } = await import('../agents.js')
    agentsCache = AGENTS
  }
  return agentsCache
}

async function getAgentById(id) {
  const agents = await getAgentsAll()
  return agents.find((a) => a.id === id) || null
}

function getAgentListings(agentId) {
  const all = listingsCache || []
  return all.filter((p) => p.agent?.email?.includes(agentId.replace('-', '.')))
}

// ═══════════════════════════════════════════════════════════════════════════════
// Blog — still from static data
// ═══════════════════════════════════════════════════════════════════════════════

async function getBlogAll() {
  if (!blogCache) {
    const { BLOG_POSTS } = await import('../blog.js')
    blogCache = BLOG_POSTS
  }
  return blogCache
}

async function getBlogBySlug(slug) {
  const posts = await getBlogAll()
  return posts.find((p) => p.slug === slug) || null
}

async function getBlogCategories() {
  const posts = await getBlogAll()
  return [...new Set(posts.map((p) => p.category))]
}

async function getBlogRelated(post, limit = 3) {
  const posts = await getBlogAll()
  return posts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, limit)
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

export function createApiAdapter() {
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
