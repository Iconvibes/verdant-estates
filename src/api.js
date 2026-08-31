/**
 * API Layer — backed by Supabase (auth + database).
 *
 * Every function keeps the same signature as the old Express-backed version
 * so existing pages and components need zero changes.
 */
import { supabase } from './lib/supabase'

// ── Auth helpers ────────────────────────────────────────────────────────────

let authToken = localStorage.getItem('verdant.token') || null

export function setToken(token) {
  authToken = token
  if (token) {
    localStorage.setItem('verdant.token', token)
  } else {
    localStorage.removeItem('verdant.token')
  }
}

export function getToken() {
  return authToken
}

// ── Auth ────────────────────────────────────────────────────────────────────

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)

  // Store the JWT so we can use it for RLS
  setToken(data.session.access_token)

  // Fetch user profile from our users table or use auth metadata
  const user = data.user
  return {
    token: data.session.access_token,
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Admin',
      role: user.user_metadata?.role || 'admin',
      mustChangePassword: user.user_metadata?.mustChangePassword ?? false,
    },
  }
}

export async function register({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role: 'user' } },
  })
  if (error) throw new Error(error.message)
  setToken(data.session?.access_token || null)
  return {
    user: { id: data.user.id, name, email, role: 'user' },
    token: data.session?.access_token || null,
  }
}

export async function fetchCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Not authenticated')
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Admin',
      role: user.user_metadata?.role || 'admin',
      mustChangePassword: user.user_metadata?.mustChangePassword ?? false,
    },
  }
}

export async function changePassword({ currentPassword, newPassword }) {
  // Re-authenticate with current password
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (signInError) throw new Error('Current password is incorrect')

  // Update password
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw new Error(error.message)

  // Update metadata to clear mustChangePassword
  await supabase.auth.updateUser({
    data: { mustChangePassword: false },
  })

  const { data: { session } } = await supabase.auth.getSession()
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || 'Admin',
      role: user.user_metadata?.role || 'admin',
      mustChangePassword: false,
    },
    token: session?.access_token || null,
    message: 'Password changed successfully',
  }
}

// ── Listings ────────────────────────────────────────────────────────────────

function normalizeListing(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    price: row.price,
    address: row.address,
    beds: row.beds,
    baths: row.baths,
    area: row.area,
    yearBuilt: row.year_built,
    image: row.image,
    images: row.images || [],
    tagline: row.tagline,
    description: row.description,
    features: row.features || [],
    agent: row.agent || {},
    coords: row.coords || [0, 0],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toDbRow(data) {
  const row = {}
  if (data.name !== undefined) row.name = data.name
  if (data.type !== undefined) row.type = data.type
  if (data.price !== undefined) row.price = data.price
  if (data.address !== undefined) row.address = data.address
  if (data.beds !== undefined) row.beds = data.beds
  if (data.baths !== undefined) row.baths = data.baths
  if (data.area !== undefined) row.area = data.area
  if (data.yearBuilt !== undefined) row.year_built = data.yearBuilt
  if (data.image !== undefined) row.image = data.image
  if (data.images !== undefined) row.images = data.images
  if (data.tagline !== undefined) row.tagline = data.tagline
  if (data.description !== undefined) row.description = data.description
  if (data.features !== undefined) row.features = data.features
  if (data.agent !== undefined) row.agent = data.agent
  if (data.coords !== undefined) row.coords = data.coords
  return row
}

export async function fetchListings(filters = {}) {
  let query = supabase.from('listings').select('*')

  if (filters.type && filters.type !== 'All') {
    query = query.eq('type', filters.type)
  }
  if (filters.minPrice) {
    query = query.gte('price', Number(filters.minPrice))
  }
  if (filters.maxPrice) {
    query = query.lte('price', Number(filters.maxPrice))
  }
  if (filters.beds) {
    query = query.gte('beds', Number(filters.beds))
  }
  if (filters.q) {
    const q = filters.q.toLowerCase()
    query = query.or(`name.ilike.%${q}%,address.ilike.%${q}%,type.ilike.%${q}%`)
  }

  const { data, error } = await query.order('id', { ascending: true })
  if (error) throw new Error(error.message)
  return { listings: (data || []).map(normalizeListing) }
}

export async function fetchListingById(id) {
  const { data, error } = await supabase.from('listings').select('*').eq('id', id).single()
  if (error) throw new Error(error.message)
  return { listing: normalizeListing(data) }
}

export async function createListing(listingData) {
  const row = toDbRow(listingData)
  row.created_at = new Date().toISOString()
  const { data, error } = await supabase.from('listings').insert(row).select().single()
  if (error) throw new Error(error.message)
  return { listing: normalizeListing(data) }
}

export async function updateListing(id, listingData) {
  const row = toDbRow(listingData)
  row.updated_at = new Date().toISOString()
  const { data, error } = await supabase.from('listings').update(row).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return { listing: normalizeListing(data) }
}

export async function deleteListing(id) {
  const { error } = await supabase.from('listings').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return { success: true }
}

// ── Enquiries ───────────────────────────────────────────────────────────────

export async function submitEnquiry(data) {
  const { error } = await supabase.from('enquiries').insert({
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    interest: data.interest || data.message?.slice(0, 50) || 'General',
    message: data.message || '',
    property_id: data.propertyId || null,
    property_name: data.listingName || null,
  })
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function fetchEnquiries() {
  const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return {
    enquiries: (data || []).map((e) => ({
      id: e.id,
      name: e.name,
      email: e.email,
      phone: e.phone,
      interest: e.interest,
      message: e.message,
      propertyId: e.property_id,
      propertyName: e.property_name || null,
      status: e.status,
      createdAt: e.created_at,
    })),
  }
}

export async function updateEnquiryStatus(id, status) {
  const { error } = await supabase.from('enquiries').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw new Error(error.message)
  return { success: true }
}

// ── Saved Homes ─────────────────────────────────────────────────────────────

export async function fetchSavedHomes() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { savedIds: [] }

  const { data, error } = await supabase.from('saved_homes').select('property_id').eq('user_id', user.id)
  if (error) return { savedIds: [] }
  return { savedIds: (data || []).map((s) => s.property_id) }
}

export async function toggleSavedHome(propertyId) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if already saved
  const { data: existing } = await supabase
    .from('saved_homes')
    .select('id')
    .eq('user_id', user.id)
    .eq('property_id', propertyId)
    .maybeSingle()

  if (existing) {
    await supabase.from('saved_homes').delete().eq('id', existing.id)
    const { data: remaining } = await supabase.from('saved_homes').select('property_id').eq('user_id', user.id)
    return { saved: false, savedIds: (remaining || []).map((s) => s.property_id) }
  } else {
    await supabase.from('saved_homes').insert({ user_id: user.id, property_id: propertyId })
    const { data: all } = await supabase.from('saved_homes').select('property_id').eq('user_id', user.id)
    return { saved: true, savedIds: (all || []).map((s) => s.property_id) }
  }
}

export async function clearSavedHomes() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('saved_homes').delete().eq('user_id', user.id)
}

// ── Alerts ──────────────────────────────────────────────────────────────────

export async function subscribeAlert({ email, name, filters }) {
  const { error } = await supabase.from('alerts').insert({
    email,
    name: name || null,
    filters: filters || {},
  })
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function fetchAlerts() {
  const { data, error } = await supabase.from('alerts').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return {
    alerts: (data || []).map((a) => ({
      id: a.id,
      email: a.email,
      name: a.name,
      criteria: a.filters,
      active: a.active,
      createdAt: a.created_at,
    })),
  }
}

export async function unsubscribeAlert(alertId) {
  const { error } = await supabase.from('alerts').update({ active: false, unsubscribed_at: new Date().toISOString() }).eq('id', alertId)
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function checkAlerts(email) {
  const { data, error } = await supabase.from('alerts').select('*').eq('email', email).eq('active', true)
  if (error) throw new Error(error.message)
  return { alerts: data || [] }
}
