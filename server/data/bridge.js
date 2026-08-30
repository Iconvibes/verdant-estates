/**
 * Data Bridge — auto-selects Supabase or JSON file backend
 * based on whether SUPABASE_URL is set.
 *
 * Routes import from this file: import { getListings, ... } from '../data/bridge.js'
 * No route changes needed when switching backends.
 */
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env') })

import * as jsonDb from './db.js'

let db

if (process.env.SUPABASE_URL) {
  try {
    console.log('Using Supabase database backend')
    db = await import('../supabase/db.js')
  } catch (err) {
    console.error('⚠️  Supabase backend failed to load:', err.message)
    console.error('   Falling back to in-memory store. Ensure @supabase/supabase-js is installed\n   and both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.')
    db = jsonDb
  }
} else {
  console.log('Using JSON file database backend (development mode)')
  db = jsonDb
}

export const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
  findUserByEmail,
  createUser,
  updateUserPassword,
  getSavedHomes,
  toggleSavedHome,
  clearSavedHomes,
  subscribeAlert,
  unsubscribeAlert,
  getAlerts,
  getAlertsByEmail,
  saveAlert,
  saveAlerts,
  saveNotifications,
  getNotifications,
} = db
