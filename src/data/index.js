/**
 * Verdant Estates — Unified Data Interface
 *
 * Components import from this module. The actual adapter (static, API, etc.)
 * is determined at config time. This is the seam — the interface is the test surface.
 */
import { createStaticAdapter } from './adapters/static.js'
import { createSupabaseAdapter } from './adapters/supabase.js'

// Auto-select adapter: if API URL is set, use Supabase/API; otherwise static.
const hasApi = !!import.meta.env.VITE_API_URL || window.location.hostname === 'localhost'
let adapter = hasApi ? createSupabaseAdapter() : createStaticAdapter()

/**
 * Switch the data adapter at runtime.
 * Call once at app startup if needed.
 */
export function setDataAdapter(newAdapter) {
  adapter = newAdapter
}

/**
 * Get the current adapter (for testing).
 */
export function getDataAdapter() {
  return adapter
}

// ═══════════════════════════════════════════════════════════════════════════════
// Properties
// ═══════════════════════════════════════════════════════════════════════════════

export function getAllProperties(filters) {
  return adapter.properties.getAll(filters)
}

export function getPropertyById(id) {
  return adapter.properties.getById(id)
}

export function getPropertyTypes() {
  return adapter.properties.getTypes()
}

// ═══════════════════════════════════════════════════════════════════════════════
// Areas
// ═══════════════════════════════════════════════════════════════════════════════

export function getAllAreas() {
  return adapter.areas.getAll()
}

export function getAreaById(id) {
  return adapter.areas.getById(id)
}

export function getAreaListings(areaId) {
  return adapter.areas.getListings(areaId)
}

// ═══════════════════════════════════════════════════════════════════════════════
// Agents
// ═══════════════════════════════════════════════════════════════════════════════

export function getAllAgents() {
  return adapter.agents.getAll()
}

export function getAgentById(id) {
  return adapter.agents.getById(id)
}

export function getAgentListings(agentId) {
  return adapter.agents.getListings(agentId)
}

// ═══════════════════════════════════════════════════════════════════════════════
// Blog
// ═══════════════════════════════════════════════════════════════════════════════

export function getAllBlogPosts() {
  return adapter.blog.getAll()
}

export function getBlogPostBySlug(slug) {
  return adapter.blog.getBySlug(slug)
}

export function getBlogCategories() {
  return adapter.blog.getCategories()
}

export function getRelatedPosts(post, limit) {
  return adapter.blog.getRelated(post, limit)
}

export function formatBlogDate(dateStr) {
  return adapter.blog.formatDate(dateStr)
}

// ═══════════════════════════════════════════════════════════════════════════════
// Utilities
// ═══════════════════════════════════════════════════════════════════════════════

export function formatPrice(price) {
  return adapter.formatPrice(price)
}

// Re-export PROPERTIES for backward compatibility during migration
export { getAllProperties as PROPERTIES }
