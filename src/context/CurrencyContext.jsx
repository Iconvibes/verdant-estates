import { createContext, useCallback, useContext, useState } from 'react'

/**
 * Approximate exchange rates — update periodically or wire to a live API.
 * All prices in the database are stored in NGN (Nigerian Naira).
 */
const RATES = {
  NGN: 1,
  USD: 1 / 1580,
  GBP: 1 / 2000,
}

const SYMBOLS = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
}

const LABELS = {
  NGN: 'Nigerian Naira',
  USD: 'US Dollar',
  GBP: 'British Pound',
}

const CURRENCY_OPTIONS = [
  { code: 'NGN', symbol: '₦', label: 'NGN' },
  { code: 'USD', symbol: '$', label: 'USD' },
  { code: 'GBP', symbol: '£', label: 'GBP' },
]

const CurrencyContext = createContext(null)

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    try {
      return localStorage.getItem('verdant.currency') || 'NGN'
    } catch {
      return 'NGN'
    }
  })

  const switchCurrency = useCallback((code) => {
    setCurrency(code)
    try {
      localStorage.setItem('verdant.currency', code)
    } catch {
      // ignore
    }
  }, [])

  /**
   * Format a price stored in NGN into the selected currency.
   * @param {number} priceNGN - price in Nigerian Naira
   * @param {object} opts - { compact: false, showSymbol: true }
   */
  const formatPrice = useCallback(
    (priceNGN, opts = {}) => {
      if (priceNGN == null || isNaN(priceNGN)) return '—'

      const { compact = false, showSymbol = true } = opts
      const rate = RATES[currency] || 1
      const converted = priceNGN * rate
      const symbol = SYMBOLS[currency] || '₦'

      if (compact && converted >= 1_000_000) {
        const millions = converted / 1_000_000
        const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)
        return showSymbol ? `${symbol}${formatted}M` : `${formatted}M`
      }

      const formatted = Math.round(converted).toLocaleString(
        currency === 'NGN' ? 'en-NG' : currency === 'USD' ? 'en-US' : 'en-GB',
      )

      return showSymbol ? `${symbol}${formatted}` : formatted
    },
    [currency],
  )

  /**
   * Format a price for display in inputs/forms where we need the raw number.
   * Returns the converted number without symbol.
   */
  const convertPrice = useCallback(
    (priceNGN) => {
      const rate = RATES[currency] || 1
      return Math.round(priceNGN * rate)
    },
    [currency],
  )

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: switchCurrency,
        formatPrice,
        convertPrice,
        options: CURRENCY_OPTIONS,
        labels: LABELS,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider')
  return ctx
}

export { CURRENCY_OPTIONS, LABELS }
