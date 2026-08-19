import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DATA_DIR = join(__dirname)

const files = {
  listings: join(DATA_DIR, 'listings.json'),
  enquiries: join(DATA_DIR, 'enquiries.json'),
  users: join(DATA_DIR, 'users.json'),
  savedHomes: join(DATA_DIR, 'savedHomes.json'),
}

const defaults = {
  listings: [],
  enquiries: [],
  users: [],
  savedHomes: [], // { userId: string, propertyId: number }[]
}

function read(filename) {
  const filepath = files[filename]
  if (!existsSync(filepath)) {
    writeFileSync(filepath, JSON.stringify(defaults[filename], null, 2))
    return defaults[filename]
  }
  return JSON.parse(readFileSync(filepath, 'utf-8'))
}

function write(filename, data) {
  writeFileSync(files[filename], JSON.stringify(data, null, 2))
}

// --- Listings ---
export function getListings(filters = {}) {
  let listings = read('listings')

  if (filters.type && filters.type !== 'All') {
    listings = listings.filter((l) => l.type === filters.type)
  }
  if (filters.minPrice) {
    listings = listings.filter((l) => l.price >= Number(filters.minPrice))
  }
  if (filters.maxPrice) {
    listings = listings.filter((l) => l.price <= Number(filters.maxPrice))
  }
  if (filters.beds) {
    listings = listings.filter((l) => l.beds >= Number(filters.beds))
  }
  if (filters.q) {
    const q = filters.q.toLowerCase()
    listings = listings.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q) ||
        l.type.toLowerCase().includes(q),
    )
  }
  return listings
}

export function getListingById(id) {
  const listings = read('listings')
  return listings.find((l) => l.id === Number(id)) || null
}

export function createListing(data) {
  const listings = read('listings')
  const maxId = listings.reduce((max, l) => Math.max(max, l.id), 0)
  const listing = { id: maxId + 1, ...data, createdAt: new Date().toISOString() }
  listings.push(listing)
  write('listings', listings)
  return listing
}

export function updateListing(id, data) {
  const listings = read('listings')
  const index = listings.findIndex((l) => l.id === Number(id))
  if (index === -1) return null
  listings[index] = { ...listings[index], ...data, updatedAt: new Date().toISOString() }
  write('listings', listings)
  return listings[index]
}

export function deleteListing(id) {
  const listings = read('listings')
  const index = listings.findIndex((l) => l.id === Number(id))
  if (index === -1) return false
  listings.splice(index, 1)
  write('listings', listings)
  return true
}

// --- Enquiries ---
export function createEnquiry(data) {
  const enquiries = read('enquiries')
  const enquiry = {
    id: crypto.randomUUID(),
    ...data,
    status: 'new',
    createdAt: new Date().toISOString(),
  }
  enquiries.push(enquiry)
  write('enquiries', enquiries)
  return enquiry
}

export function getEnquiries() {
  return read('enquiries')
}

export function updateEnquiryStatus(id, status) {
  const enquiries = read('enquiries')
  const index = enquiries.findIndex((e) => e.id === id)
  if (index === -1) return null
  enquiries[index].status = status
  enquiries[index].updatedAt = new Date().toISOString()
  write('enquiries', enquiries)
  return enquiries[index]
}

// --- Users (simple token-based auth) ---
export function findUserByEmail(email) {
  const users = read('users')
  return users.find((u) => u.email === email) || null
}

export function createUser(data) {
  const users = read('users')
  const user = { id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString() }
  users.push(user)
  write('users', users)
  return user
}

// --- Saved Homes ---
export function getSavedHomes(userId) {
  const saved = read('savedHomes')
  return saved.filter((s) => s.userId === userId).map((s) => s.propertyId)
}

export function toggleSavedHome(userId, propertyId) {
  const saved = read('savedHomes')
  const index = saved.findIndex((s) => s.userId === userId && s.propertyId === propertyId)
  if (index > -1) {
    saved.splice(index, 1)
    write('savedHomes', saved)
    return { saved: false }
  }
  saved.push({ userId, propertyId })
  write('savedHomes', saved)
  return { saved: true }
}

export function clearSavedHomes(userId) {
  const saved = read('savedHomes')
  const filtered = saved.filter((s) => s.userId !== userId)
  write('savedHomes', filtered)
}
