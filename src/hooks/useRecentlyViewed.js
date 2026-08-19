import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'verdant.recentlyViewed'
const MAX_ITEMS = 8

const loadRecent = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((n) => Number.isFinite(n)) : []
  } catch {
    return []
  }
}

/**
 * Tracks recently viewed property IDs.
 * Returns { recentIds, trackView, clearRecent }.
 * `trackView(id)` adds the property to the front, deduplicates, and caps at MAX_ITEMS.
 */
export default function useRecentlyViewed() {
  const [recentIds, setRecentIds] = useState(loadRecent)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentIds))
  }, [recentIds])

  const trackView = useCallback((id) => {
    const numericId = Number(id)
    setRecentIds((prev) => {
      const filtered = prev.filter((x) => x !== numericId)
      return [numericId, ...filtered].slice(0, MAX_ITEMS)
    })
  }, [])

  const clearRecent = useCallback(() => setRecentIds([]), [])

  return { recentIds, trackView, clearRecent }
}
