import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { fetchSavedHomes, toggleSavedHome, clearSavedHomes as apiClearSaved, getToken } from '../api'

const STORAGE_KEY = 'verdant.savedHomes'

const SavedHomesContext = createContext(null)

const loadSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((n) => Number.isFinite(n)) : []
  } catch {
    return []
  }
}

export const SavedHomesProvider = ({ children }) => {
  const [savedIds, setSavedIds] = useState(loadSaved)
  const [syncing, setSyncing] = useState(false)

  // Persist to localStorage as fallback
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds))
  }, [savedIds])

  // When a token becomes available, sync with the server
  useEffect(() => {
    const token = getToken()
    if (!token) return

    let cancelled = false
    ;(async () => {
      setSyncing(true)
      try {
        const data = await fetchSavedHomes()
        if (!cancelled && data.savedIds) {
          setSavedIds(data.savedIds)
        }
      } catch {
        // Keep local state on sync failure
      } finally {
        if (!cancelled) setSyncing(false)
      }
    })()

    return () => { cancelled = true }
  }, []) // run once on mount

  const toggleSaved = useCallback(async (id) => {
    const numericId = Number(id)

    // Optimistic update
    setSavedIds((prev) =>
      prev.includes(numericId) ? prev.filter((x) => x !== numericId) : [...prev, numericId],
    )

    // Sync with server if authenticated
    if (getToken()) {
      try {
        const data = await toggleSavedHome(numericId)
        if (data.savedIds) {
          setSavedIds(data.savedIds)
        }
      } catch {
        // Revert on failure — the optimistic update stays for now
      }
    }
  }, [])

  const isSaved = useCallback((id) => savedIds.includes(Number(id)), [savedIds])

  const clearSaved = useCallback(async () => {
    setSavedIds([])
    if (getToken()) {
      try {
        await apiClearSaved()
      } catch {
        // ignore
      }
    }
  }, [])

  return (
    <SavedHomesContext.Provider value={{ savedIds, toggleSaved, isSaved, clearSaved, syncing }}>
      {children}
    </SavedHomesContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSavedHomes = () => {
  const ctx = useContext(SavedHomesContext)
  if (!ctx) throw new Error('useSavedHomes must be used within a SavedHomesProvider')
  return ctx
}
