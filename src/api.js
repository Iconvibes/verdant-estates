const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

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

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await res.json()

  if (!res.ok) {
    const error = new Error(data.error || data.errors?.[0]?.msg || 'Request failed')
    error.status = res.status
    error.data = data
    throw error
  }

  return data
}

// --- Listings ---
export function fetchListings(filters = {}) {
  const params = new URLSearchParams()
  if (filters.type && filters.type !== 'All') params.set('type', filters.type)
  if (filters.minPrice) params.set('minPrice', filters.minPrice)
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
  if (filters.beds) params.set('beds', filters.beds)
  if (filters.q) params.set('q', filters.q)
  if (filters.sort && filters.sort !== 'featured') params.set('sort', filters.sort)
  const qs = params.toString()
  return request(`/listings${qs ? `?${qs}` : ''}`)
}

export function fetchListingById(id) {
  return request(`/listings/${id}`)
}

export function createListing(data) {
  return request('/listings', { method: 'POST', body: JSON.stringify(data) })
}

export function updateListing(id, data) {
  return request(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteListing(id) {
  return request(`/listings/${id}`, { method: 'DELETE' })
}

// --- Enquiries ---
export function submitEnquiry(data) {
  return request('/enquiries', { method: 'POST', body: JSON.stringify(data) })
}

// --- Auth ---
export function register(data) {
  return request('/auth/register', { method: 'POST', body: JSON.stringify(data) })
}

export function login(data) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify(data) })
}

export function fetchCurrentUser() {
  return request('/auth/me')
}

// --- Saved Homes ---
export function fetchSavedHomes() {
  return request('/saved')
}

export function toggleSavedHome(propertyId) {
  return request('/saved/toggle', { method: 'POST', body: JSON.stringify({ propertyId }) })
}

export function clearSavedHomes() {
  return request('/saved', { method: 'DELETE' })
}

// --- Alerts ---
export function subscribeAlert(data) {
  return request('/alerts', { method: 'POST', body: JSON.stringify(data) })
}

export function unsubscribeAlert(alertId) {
  return request(`/alerts/${alertId}`, { method: 'DELETE' })
}

export function fetchAlerts() {
  return request('/alerts')
}

export function checkAlerts(email) {
  return request(`/alerts/check/${encodeURIComponent(email)}`)
}
