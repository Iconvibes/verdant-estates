/**
 * Data access layer — Upstash Redis (serverless) with in-memory fallback.
 *
 * If UPSTASH_REDIS_REST_URL is set (Vercel / production), all reads and
 * writes go to Redis.  Otherwise the app falls back to an in-memory store
 * seeded from seedData.js so local development works out of the box.
 */

import 'dotenv/config'
import { Redis } from '@upstash/redis'
import {
  SEED_LISTINGS,
  getSeedUsers,
  SEED_ENQUIRIES,
  SEED_SAVED_HOMES,
  SEED_ALERTS,
} from './seedData.js'

// ── Decide storage mode ─────────────────────────────────────────────────────

const USE_REDIS = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

let redis = null
if (USE_REDIS) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  console.log('🌿 Using Upstash Redis for storage')
} else {
  console.log('🌿 Redis not configured — using in-memory store (data resets on cold start)')
}

// ── In-memory tables (fallback) ─────────────────────────────────────────────

let _listings = [...SEED_LISTINGS]
let _enquiries = [...SEED_ENQUIRIES]
let _users = getSeedUsers()
let _savedHomes = [...SEED_SAVED_HOMES]
let _alerts = [...SEED_ALERTS]
let _notifications = []

// ── Redis helpers — read/write entire collections as JSON ────────────────────

async function rGet(key, fallback) {
  const data = await redis.get(key)
  return data ?? fallback
}

async function rSet(key, data) {
  await redis.set(key, JSON.stringify(data))
}

async function ensureSeeded() {
  if (!redis) return

  const existing = await redis.get('seeded')
  if (existing) return

  // Seed everything
  await rSet('listings', SEED_LISTINGS)
  await rSet('users', getSeedUsers())
  await rSet('enquiries', SEED_ENQUIRIES)
  await rSet('saved_homes', SEED_SAVED_HOMES)
  await rSet('alerts', SEED_ALERTS)
  await rSet('notifications', [])
  await redis.set('seeded', true)
  console.log('   Seeded Redis with default data')
}

// ── Listings ────────────────────────────────────────────────────────────────

export async function getListings(filters = {}) {
  let result

  if (redis) {
    await ensureSeeded()
    result = await rGet('listings', [])
  } else {
    result = [..._listings]
  }

  if (filters.type && filters.type !== 'All') result = result.filter((l) => l.type === filters.type)
  if (filters.minPrice) result = result.filter((l) => l.price >= Number(filters.minPrice))
  if (filters.maxPrice) result = result.filter((l) => l.price <= Number(filters.maxPrice))
  if (filters.beds) result = result.filter((l) => l.beds >= Number(filters.beds))
  if (filters.q) {
    const q = filters.q.toLowerCase()
    result = result.filter((l) => l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q) || l.type.toLowerCase().includes(q))
  }
  return result
}

export async function getListingById(id) {
  const numId = Number(id)
  if (redis) {
    await ensureSeeded()
    const listings = await rGet('listings', [])
    return listings.find((l) => l.id === numId) || null
  }
  return _listings.find((l) => l.id === numId) || null
}

export async function createListing(data) {
  if (redis) {
    await ensureSeeded()
    const listings = await rGet('listings', [])
    const maxId = listings.reduce((max, l) => Math.max(max, l.id), 0)
    const listing = { id: maxId + 1, ...data, createdAt: new Date().toISOString() }
    listings.push(listing)
    await rSet('listings', listings)
    return listing
  }
  const maxId = _listings.reduce((max, l) => Math.max(max, l.id), 0)
  const listing = { id: maxId + 1, ...data, createdAt: new Date().toISOString() }
  _listings.push(listing)
  return listing
}

export async function updateListing(id, data) {
  const numId = Number(id)
  if (redis) {
    await ensureSeeded()
    const listings = await rGet('listings', [])
    const index = listings.findIndex((l) => l.id === numId)
    if (index === -1) return null
    listings[index] = { ...listings[index], ...data, updatedAt: new Date().toISOString() }
    await rSet('listings', listings)
    return listings[index]
  }
  const index = _listings.findIndex((l) => l.id === numId)
  if (index === -1) return null
  _listings[index] = { ..._listings[index], ...data, updatedAt: new Date().toISOString() }
  return _listings[index]
}

export async function deleteListing(id) {
  const numId = Number(id)
  if (redis) {
    await ensureSeeded()
    const listings = await rGet('listings', [])
    const index = listings.findIndex((l) => l.id === numId)
    if (index === -1) return false
    listings.splice(index, 1)
    await rSet('listings', listings)
    return true
  }
  const index = _listings.findIndex((l) => l.id === numId)
  if (index === -1) return false
  _listings.splice(index, 1)
  return true
}

// ── Enquiries ───────────────────────────────────────────────────────────────

export async function createEnquiry(data) {
  const enquiry = { id: crypto.randomUUID(), ...data, status: 'new', createdAt: new Date().toISOString() }
  if (redis) {
    await ensureSeeded()
    const enquiries = await rGet('enquiries', [])
    enquiries.push(enquiry)
    await rSet('enquiries', enquiries)
    return enquiry
  }
  _enquiries.push(enquiry)
  return enquiry
}

export async function getEnquiries() {
  if (redis) {
    await ensureSeeded()
    return await rGet('enquiries', [])
  }
  return _enquiries
}

export async function updateEnquiryStatus(id, status) {
  if (redis) {
    await ensureSeeded()
    const enquiries = await rGet('enquiries', [])
    const index = enquiries.findIndex((e) => e.id === id)
    if (index === -1) return null
    enquiries[index].status = status
    enquiries[index].updatedAt = new Date().toISOString()
    await rSet('enquiries', enquiries)
    return enquiries[index]
  }
  const index = _enquiries.findIndex((e) => e.id === id)
  if (index === -1) return null
  _enquiries[index].status = status
  _enquiries[index].updatedAt = new Date().toISOString()
  return _enquiries[index]
}

// ── Users ───────────────────────────────────────────────────────────────────

export async function findUserByEmail(email) {
  if (redis) {
    await ensureSeeded()
    const users = await rGet('users', [])
    return users.find((u) => u.email === email) || null
  }
  return _users.find((u) => u.email === email) || null
}

export async function createUser(data) {
  const user = { id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString() }
  if (redis) {
    await ensureSeeded()
    const users = await rGet('users', [])
    users.push(user)
    await rSet('users', users)
    return user
  }
  _users.push(user)
  return user
}

export async function updateUserPassword(userId, hashedPassword) {
  if (redis) {
    await ensureSeeded()
    const users = await rGet('users', [])
    const index = users.findIndex((u) => u.id === userId)
    if (index === -1) return null
    users[index].password = hashedPassword
    users[index].mustChangePassword = false
    await rSet('users', users)
    return users[index]
  }
  const index = _users.findIndex((u) => u.id === userId)
  if (index === -1) return null
  _users[index].password = hashedPassword
  _users[index].mustChangePassword = false
  return _users[index]
}

// ── Saved Homes ─────────────────────────────────────────────────────────────

export async function getSavedHomes(userId) {
  if (redis) {
    await ensureSeeded()
    const saved = await rGet('saved_homes', [])
    return saved.filter((s) => s.userId === userId).map((s) => s.propertyId)
  }
  return _savedHomes.filter((s) => s.userId === userId).map((s) => s.propertyId)
}

export async function toggleSavedHome(userId, propertyId) {
  if (redis) {
    await ensureSeeded()
    const saved = await rGet('saved_homes', [])
    const index = saved.findIndex((s) => s.userId === userId && s.propertyId === propertyId)
    if (index > -1) {
      saved.splice(index, 1)
      await rSet('saved_homes', saved)
      return { saved: false }
    }
    saved.push({ userId, propertyId })
    await rSet('saved_homes', saved)
    return { saved: true }
  }
  const index = _savedHomes.findIndex((s) => s.userId === userId && s.propertyId === propertyId)
  if (index > -1) {
    _savedHomes.splice(index, 1)
    return { saved: false }
  }
  _savedHomes.push({ userId, propertyId })
  return { saved: true }
}

export async function clearSavedHomes(userId) {
  if (redis) {
    await ensureSeeded()
    const saved = await rGet('saved_homes', [])
    const filtered = saved.filter((s) => s.userId !== userId)
    await rSet('saved_homes', filtered)
    return
  }
  _savedHomes = _savedHomes.filter((s) => s.userId !== userId)
}

// ── Alerts ──────────────────────────────────────────────────────────────────

export async function getAlerts() {
  if (redis) {
    await ensureSeeded()
    return await rGet('alerts', [])
  }
  return _alerts
}

export async function saveAlert(alert) {
  if (redis) {
    await ensureSeeded()
    const alerts = await rGet('alerts', [])
    alerts.push(alert)
    await rSet('alerts', alerts)
    return
  }
  _alerts.push(alert)
}

export async function saveAlerts(updated) {
  if (redis) {
    await rSet('alerts', updated)
    return
  }
  _alerts = updated
}

export async function getNotifications() {
  if (redis) {
    await ensureSeeded()
    return await rGet('notifications', [])
  }
  return _notifications
}

export async function saveNotifications(notifications) {
  if (redis) {
    await ensureSeeded()
    const existing = await rGet('notifications', [])
    await rSet('notifications', [...existing, ...notifications])
    return
  }
  _notifications.push(...notifications)
}

// ── Alert subscriptions ──────────────────────────────────────────────────

export async function subscribeAlert({ email, name, filters }) {
  const alert = {
    id: crypto.randomUUID(),
    email,
    name: name || null,
    filters: filters || {},
    active: true,
    createdAt: new Date().toISOString(),
  }
  if (redis) {
    await ensureSeeded()
    const alerts = await rGet('alerts', [])
    alerts.push(alert)
    await rSet('alerts', alerts)
    return alert
  }
  _alerts.push(alert)
  return alert
}

export async function unsubscribeAlert(id) {
  if (redis) {
    await ensureSeeded()
    const alerts = await rGet('alerts', [])
    const index = alerts.findIndex((a) => a.id === id)
    if (index === -1) return null
    alerts[index].active = false
    alerts[index].unsubscribedAt = new Date().toISOString()
    await rSet('alerts', alerts)
    return alerts[index]
  }
  const index = _alerts.findIndex((a) => a.id === id)
  if (index === -1) return null
  _alerts[index].active = false
  _alerts[index].unsubscribedAt = new Date().toISOString()
  return _alerts[index]
}

export async function getAlertsByEmail(email) {
  if (redis) {
    await ensureSeeded()
    const alerts = await rGet('alerts', [])
    return alerts.filter((a) => a.email === email && a.active)
  }
  return _alerts.filter((a) => a.email === email && a.active)
}
