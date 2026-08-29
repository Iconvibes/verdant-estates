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
  console.log('Using Supabase database backend')
  db = await import('../supabase/db.js')
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
