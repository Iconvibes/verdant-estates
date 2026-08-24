/**
 * API Adapter — uses the server REST endpoints.
 * Used for production mode with persistent data.
 */
import { fetchListings, fetchListingById } from '../../api.js'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

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

async function getPropertiesAll(filters = {}) {
  const data = await fetchListings(filters)
  return data.listings || []
}

async function getPropertyById(id) {
  const data = await fetchListingById(id)
  return data.listing || null
}

async function getPropertyTypes() {
  const data = await apiFetch('/listings/types')
  return data.types || ['All']
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
  const all = await getPropertiesAll()
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

async function getAgentListings(agentId) {
  const all = await getPropertiesAll()
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
