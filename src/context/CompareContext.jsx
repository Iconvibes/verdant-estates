import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'verdant.compare'
const MAX_COMPARE = 3

const CompareContext = createContext(null)

const loadCompare = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((n) => Number.isFinite(n)).slice(0, MAX_COMPARE) : []
  } catch {
    return []
  }
}

export const CompareProvider = ({ children }) => {
  const [compareIds, setCompareIds] = useState(loadCompare)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compareIds))
  }, [compareIds])

  const toggleCompare = useCallback((id) => {
    const numericId = Number(id)
    setCompareIds((prev) => {
      if (prev.includes(numericId)) {
        return prev.filter((x) => x !== numericId)
      }
      if (prev.length >= MAX_COMPARE) {
        return prev // don't add more than 3
      }
      return [...prev, numericId]
    })
  }, [])

  const isComparing = useCallback((id) => compareIds.includes(Number(id)), [compareIds])

  const addCompare = useCallback((id) => {
    const numericId = Number(id)
    setCompareIds((prev) => {
      if (prev.includes(numericId) || prev.length >= MAX_COMPARE) return prev
      return [...prev, numericId]
    })
  }, [])

  const removeCompare = useCallback((id) => {
    setCompareIds((prev) => prev.filter((x) => x !== Number(id)))
  }, [])

  const clearCompare = useCallback(() => setCompareIds([]), [])

  const canAdd = compareIds.length < MAX_COMPARE

  return (
    <CompareContext.Provider
      value={{ compareIds, toggleCompare, isComparing, addCompare, removeCompare, clearCompare, canAdd, max: MAX_COMPARE }}
    >
      {children}
    </CompareContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCompare = () => {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used within a CompareProvider')
  return ctx
}
