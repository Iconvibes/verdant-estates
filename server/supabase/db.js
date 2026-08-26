/**
 * Supabase Database Layer
 * Replaces server/data/db.js (JSON file reads/writes).
 * Same export signatures — routes don't need to change.
 */
import supabase from './client.js'

// ═══════════════════════════════════════════════════════════════════════════════
// Listings
// ═══════════════════════════════════════════════════════════════════════════════

export async function getListings(filters = {}) {
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
  if (error) throw error
  return data || []
}

export async function getListingById(id) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', Number(id))
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createListing(data) {
  const { data: listing, error } = await supabase
    .from('listings')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return listing
}

export async function updateListing(id, data) {
  const { data: listing, error } = await supabase
    .from('listings')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', Number(id))
    .select()
    .single()
  if (error) throw error
  return listing
}

export async function deleteListing(id) {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', Number(id))
  if (error) throw error
  return true
}

// ═══════════════════════════════════════════════════════════════════════════════
// Enquiries
// ═══════════════════════════════════════════════════════════════════════════════

export async function createEnquiry(data) {
  const { data: enquiry, error } = await supabase
    .from('enquiries')
    .insert({
      name: data.name || '',
      email: data.email,
      phone: data.phone || '',
      message: data.message || '',
      property_id: data.propertyId || null,
      property_name: data.propertyName || '',
    })
    .select()
    .single()
  if (error) throw error
  return enquiry
}

export async function getEnquiries() {
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateEnquiryStatus(id, status) {
  const { data, error } = await supabase
    .from('enquiries')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ═══════════════════════════════════════════════════════════════════════════════
// Users (kept for JWT auth — not using Supabase Auth yet)
// ═══════════════════════════════════════════════════════════════════════════════

export async function findUserByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createUser(data) {
  const { data: user, error } = await supabase
    .from('users')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return user
}

// ═══════════════════════════════════════════════════════════════════════════════
// Saved Homes
// ═══════════════════════════════════════════════════════════════════════════════

export async function getSavedHomes(userId) {
  const { data, error } = await supabase
    .from('saved_homes')
    .select('property_id')
    .eq('user_id', userId)
  if (error) throw error
  return (data || []).map((s) => s.property_id)
}

export async function toggleSavedHome(userId, propertyId) {
  // Check if it exists
  const { data: existing } = await supabase
    .from('saved_homes')
    .select('id')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .single()

  if (existing) {
    await supabase.from('saved_homes').delete().eq('id', existing.id)
    return { saved: false }
  }

  await supabase.from('saved_homes').insert({ user_id: userId, property_id: propertyId })
  return { saved: true }
}

export async function clearSavedHomes(userId) {
  await supabase.from('saved_homes').delete().eq('user_id', userId)
}

// ═══════════════════════════════════════════════════════════════════════════════
// Alerts
// ═══════════════════════════════════════════════════════════════════════════════

export async function subscribeAlert(data) {
  const { data: alert, error } = await supabase
    .from('alerts')
    .insert({ email: data.email, name: data.name || '', filters: data.filters || {} })
    .select()
    .single()
  if (error) throw error
  return alert
}

export async function unsubscribeAlert(alertId) {
  const { error } = await supabase
    .from('alerts')
    .delete()
    .eq('id', alertId)
  if (error) throw error
  return true
}

export async function getAlerts() {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getAlertsByEmail(email) {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('email', email)
    .eq('active', true)
  if (error) throw error
  return data || []
}
