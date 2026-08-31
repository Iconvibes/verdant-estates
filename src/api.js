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

// ── Storage helpers ──────────────────────────────────────────────────────────

export async function uploadAgentPhoto(file) {
  const ext = file.name.split('.').pop()
  const path = `agent-photos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await supabase.storage
    .from('agent-photos')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw new Error(error.message)
  const { data: urlData } = supabase.storage.from('agent-photos').getPublicUrl(path)
  return urlData.publicUrl
}

// ── Auth ────────────────────────────────────────────────────────────────────

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)

  // Store the JWT so we can use it for RLS
  setToken(data.session.access_token)

  const user = data.user

  // Check if user is an admin by looking up admin_users table
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  // Check if user is an agent by looking up agents table
  const { data: agentRow } = await supabase
    .from('agents')
    .select('id, full_name, photo_url, approved')
    .eq('user_id', user.id)
    .maybeSingle()

  // Determine role
  const role = adminRow ? 'admin' : agentRow ? 'agent' : null

  if (!role) {
    setToken(null)
    throw new Error('This account is not authorized. Contact the administrator.')
  }

  // Agents must be approved by admin before they can log in
  if (role === 'agent' && agentRow && !agentRow.approved) {
    setToken(null)
    throw new Error('Your account is pending admin approval. You will be able to log in once approved.')
  }

  return {
    token: data.session.access_token,
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || agentRow?.full_name || user.email?.split('@')[0] || 'User',
      role,
      photoUrl: agentRow?.photo_url || null,
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

  // Check role from database tables
  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: agentRow } = await supabase
    .from('agents')
    .select('id, full_name, photo_url')
    .eq('user_id', user.id)
    .maybeSingle()

  const role = adminRow ? 'admin' : agentRow ? 'agent' : null
  if (!role) {
    throw new Error('Account not authorized')
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || agentRow?.full_name || user.email?.split('@')[0] || 'User',
      role,
      photoUrl: agentRow?.photo_url || null,
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

// ═══════════════════════════════════════════════════════════════════════════════
// Agent Auth & Profile
// ═══════════════════════════════════════════════════════════════════════════════

export async function registerAgent({ name, email, password, phone, photoUrl }) {
  // 1. Create Supabase Auth user with role: 'agent'
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role: 'agent' } },
  })
  if (error) throw new Error(error.message)

  // 2. Create agent profile in agents table
  if (data.user) {
    const { error: profileError } = await supabase.from('agents').insert({
      user_id: data.user.id,
      full_name: name,
      email,
      phone: phone || null,
      photo_url: photoUrl || null,
    })
    if (profileError) throw new Error(profileError.message)
  }

  return {
    user: {
      id: data.user?.id,
      name,
      email,
      role: 'agent',
    },
    message: 'Account created. Please check your email to confirm, then log in.',
  }
}

export async function fetchAgentProfile(userId) {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) throw new Error(error.message)
  return {
    id: data.id,
    userId: data.user_id,
    name: data.full_name || data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    photo: data.photo_url || data.photo || null,
    photoUrl: data.photo_url || data.photo || null,
    bio: data.bio,
    specialties: data.specialties || [],
    languages: data.languages || ['English'],
    experience: data.experience,
    createdAt: data.created_at,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Agent Listing Management
// ═══════════════════════════════════════════════════════════════════════════════

function normalizeListingWithStatus(row) {
  const base = normalizeListing(row)
  return {
    ...base,
    status: row.status || 'published',
    agentId: row.agent_id || null,
  }
}

export async function fetchAgentListings(agentId) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return { listings: (data || []).map(normalizeListingWithStatus) }
}

export async function createListingForAgent(listingData, agentId) {
  const row = toDbRow(listingData)
  row.created_at = new Date().toISOString()
  row.status = 'pending'
  row.agent_id = agentId
  const { data, error } = await supabase.from('listings').insert(row).select().single()
  if (error) throw new Error(error.message)
  return { listing: normalizeListingWithStatus(data) }
}

export async function updateListingForAgent(id, listingData, agentId) {
  const row = toDbRow(listingData)
  row.updated_at = new Date().toISOString()
  row.status = 'pending' // re-submit for review on edit
  const { data, error } = await supabase
    .from('listings')
    .update(row)
    .eq('id', id)
    .eq('agent_id', agentId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return { listing: normalizeListingWithStatus(data) }
}

export async function deleteListingForAgent(id, agentId) {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)
    .eq('agent_id', agentId)
  if (error) throw new Error(error.message)
  return { success: true }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Admin: Listing Approval
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchPendingListings() {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return { listings: (data || []).map(normalizeListingWithStatus) }
}

export async function approveListing(id) {
  const { error } = await supabase
    .from('listings')
    .update({ status: 'published', updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function rejectListing(id) {
  const { error } = await supabase
    .from('listings')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  return { success: true }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Admin: Agent Approval
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchPendingAgents() {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('approved', false)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return {
    agents: (data || []).map((a) => ({
      id: a.id,
      userId: a.user_id,
      name: a.full_name || a.name,
      email: a.email,
      phone: a.phone,
      photo: a.photo_url || a.photo || null,
      bio: a.bio,
      createdAt: a.created_at,
    })),
  }
}

export async function approveAgent(id) {
  const { error } = await supabase
    .from('agents')
    .update({ approved: true })
    .eq('id', id)
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function rejectAgent(id) {
  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
  return { success: true }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Agent Enquiries
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchAgentEnquiries(agentId) {
  // Get agent's listing IDs
  const { data: listings } = await supabase
    .from('listings')
    .select('id')
    .eq('agent_id', agentId)
  const listingIds = (listings || []).map((l) => l.id)
  if (listingIds.length === 0) return { enquiries: [] }

  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .in('property_id', listingIds)
    .order('created_at', { ascending: false })
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

// ═══════════════════════════════════════════════════════════════════════════════
// Admin: Fetch All Agents
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchAgents() {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return {
    agents: (data || []).map((a) => ({
      id: a.id,
      userId: a.user_id,
      name: a.full_name || a.name,
      email: a.email,
      phone: a.phone,
      photo: a.photo_url || a.photo || null,
      bio: a.bio,
      createdAt: a.created_at,
    })),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Listing Performance Metrics
// ═══════════════════════════════════════════════════════════════════════════════

export async function trackListingView(listingId) {
  // Increment view count atomically
  const { error } = await supabase.rpc('increment_view_count', { p_listing_id: listingId })
  if (error) {
    // Fallback: fetch current count, increment, and update
    const { data } = await supabase
      .from('listings')
      .select('view_count')
      .eq('id', listingId)
      .single()
    if (data) {
      await supabase
        .from('listings')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', listingId)
    }
  }
}

export async function getListingMetrics(agentId) {
  // Get agent's listing IDs
  const { data: agentListings } = await supabase
    .from('listings')
    .select('id, name, status, view_count')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })

  const listingIds = (agentListings || []).map((l) => l.id)
  if (listingIds.length === 0) {
    return { listings: [], totalViews: 0, totalEnquiries: 0, totalSaves: 0 }
  }

  // Count enquiries per listing
  const { data: enquiries } = await supabase
    .from('enquiries')
    .select('property_id')
    .in('property_id', listingIds)

  // Count saves per listing
  const { data: saves } = await supabase
    .from('saved_homes')
    .select('property_id')
    .in('property_id', listingIds)

  // Build metrics per listing
  const enquiryCounts = {}
  const saveCounts = {}
  ;(enquiries || []).forEach((e) => {
    enquiryCounts[e.property_id] = (enquiryCounts[e.property_id] || 0) + 1
  })
  ;(saves || []).forEach((s) => {
    saveCounts[s.property_id] = (saveCounts[s.property_id] || 0) + 1
  })

  const listings = (agentListings || []).map((l) => ({
    id: l.id,
    name: l.name,
    status: l.status,
    views: l.view_count || 0,
    enquiries: enquiryCounts[l.id] || 0,
    saves: saveCounts[l.id] || 0,
  }))

  return {
    listings,
    totalViews: listings.reduce((sum, l) => sum + l.views, 0),
    totalEnquiries: listings.reduce((sum, l) => sum + l.enquiries, 0),
    totalSaves: listings.reduce((sum, l) => sum + l.saves, 0),
  }
}
