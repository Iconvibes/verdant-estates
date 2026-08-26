/**
 * Supabase Adapter — fetches data from the backend API.
 * In production, the frontend talks to the Express API which
 * talks to Supabase. The adapter ensures the same interface
 * as the static adapter.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

const formatPriceNGN = (price) => `₦${price.toLocaleString('en-NG')}`

// ═══════════════════════════════════════════════════════════════════════════════
// Properties
// ═══════════════════════════════════════════════════════════════════════════════

async function getPropertiesAll(filters = {}) {
  const params = new URLSearchParams()
  if (filters.type && filters.type !== 'All') params.set('type', filters.type)
  if (filters.minPrice) params.set('minPrice', filters.minPrice)
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
  if (filters.beds) params.set('beds', filters.beds)
  if (filters.q) params.set('q', filters.q)
  if (filters.sort) params.set('sort', filters.sort)
  const qs = params.toString()
  const data = await apiFetch(`/listings${qs ? `?${qs}` : ''}`)
  return data.listings || []
}

async function getPropertyById(id) {
  const data = await apiFetch(`/listings/${id}`)
  return data.listing || null
}

async function getPropertyTypes() {
  const data = await apiFetch('/listings/types')
  return data.types || ['All']
}

// ═══════════════════════════════════════════════════════════════════════════════
// Areas (still served from static data — not migrated to DB)
// ═══════════════════════════════════════════════════════════════════════════════

import { AREAS } from '../areas.js'

function getAreasAll() { return AREAS }
function getAreaById(id) { return AREAS.find(a => a.id === id) || null }
function getAreaListings(areaId) {
  const area = getAreaById(areaId)
  if (!area) return []
  return AREAS.length ? [] : []
}

// ═══════════════════════════════════════════════════════════════════════════════
// Agents (still served from static data)
// ═══════════════════════════════════════════════════════════════════════════════

import { AGENTS } from '../agents.js'

function getAgentsAll() { return AGENTS }
function getAgentById(id) { return AGENTS.find(a => a.id === id) || null }
function getAgentListings(agentId) { return [] }

// ═══════════════════════════════════════════════════════════════════════════════
// Blog (still served from static data)
// ═══════════════════════════════════════════════════════════════════════════════

import { BLOG_POSTS } from '../blog.js'

function getBlogAll() { return BLOG_POSTS }
function getBlogBySlug(slug) { return BLOG_POSTS.find(p => p.slug === slug) || null }
function getBlogCategories() { return [...new Set(BLOG_POSTS.map(p => p.category))] }
function getBlogRelated(post, limit = 3) {
  return BLOG_POSTS.filter(p => p.id !== post.id && p.category === post.category).slice(0, limit)
}
function formatBlogDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ═══════════════════════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════════════════════

export function createSupabaseAdapter() {
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
