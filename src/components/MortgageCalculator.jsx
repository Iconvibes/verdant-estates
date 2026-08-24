import { useMemo, useState } from 'react'
import { useCurrency } from '../context/CurrencyContext'
import { CalculatorIcon, ChevronDownIcon } from './icons'

const NIGERIAN_RATES = [
  { label: 'Commercial Bank Mortgage', rate: 18 },
  { label: 'Federal Mortgage Bank (FMBN)', rate: 12 },
  { label: 'Primary Mortgage Institution', rate: 15 },
  { label: 'Developer Installment Plan', rate: 10 },
]

const TERM_OPTIONS = [5, 10, 15, 20, 25, 30]

function calculateMortgage(principal, annualRate, years) {
  if (principal <= 0 || annualRate <= 0 || years <= 0) {
    return { monthly: 0, totalPaid: 0, totalInterest: 0 }
  }
  const r = annualRate / 100 / 12
  const n = years * 12
  const monthly = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  const totalPaid = monthly * n
  const totalInterest = totalPaid - principal
  return { monthly, totalPaid, totalInterest }
}

const MortgageCalculator = ({ price }) => {
  const { formatPrice } = useCurrency()
  const fmt = (n) => formatPrice(Math.round(n))
  const [downPaymentPct, setDownPaymentPct] = useState(20)
  const [rateIdx, setRateIdx] = useState(0)
  const [customRate, setCustomRate] = useState(false)
  const [rate, setRate] = useState(NIGERIAN_RATES[0].rate)
  const [term, setTerm] = useState(20)
  const [showAmortisation, setShowAmortisation] = useState(false)

  const downPayment = price * (downPaymentPct / 100)
  const loanAmount = price - downPayment

  const { monthly, totalPaid, totalInterest } = useMemo(
    () => calculateMortgage(loanAmount, rate, term),
    [loanAmount, rate, term],
  )

  // Year-by-year amortisation summary
  const yearlyData = useMemo(() => {
    if (loanAmount <= 0 || rate <= 0 || term <= 0) return []
    const r = rate / 100 / 12
    let balance = loanAmount
    const rows = []
    let cumulativeInterest = 0
    let cumulativePrincipal = 0

    for (let year = 1; year <= term; year++) {
      let yearInterest = 0
      let yearPrincipal = 0
      for (let m = 0; m < 12; m++) {
        if (balance <= 0) break
        const interest = balance * r
        const princ = monthly - interest
        yearInterest += interest
        yearPrincipal += princ
        balance = Math.max(0, balance - princ)
      }
      cumulativeInterest += yearInterest
      cumulativePrincipal += yearPrincipal
      rows.push({
        year,
        principalPaid: yearPrincipal,
        interestPaid: yearInterest,
        balance: Math.max(0, balance),
        cumulativePrincipal,
        cumulativeInterest,
      })
    }
    return rows
  }, [loanAmount, rate, term, monthly])

  const principalPct = loanAmount > 0 ? ((loanAmount / totalPaid) * 100).toFixed(1) : 0
  const interestPct = totalPaid > 0 ? ((totalInterest / totalPaid) * 100).toFixed(1) : 0

  return (
    <div className="rounded-xl bg-white p-6 shadow-soft md:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-forest text-bronze">
          <CalculatorIcon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-serif text-xl font-bold text-forest">Mortgage Calculator</h3>
          <p className="text-xs text-text/60">Estimate your monthly payments</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="mt-6 space-y-5">
        {/* Down payment */}
        <div>
          <label className="mb-2 flex items-center justify-between text-sm font-semibold text-forest">
            <span>Down Payment</span>
            <span className="font-serif text-lg font-bold text-bronze">
              {fmt(downPayment)} ({downPaymentPct}%)
            </span>
          </label>
          <input
            type="range"
            min={0}
            max={60}
            step={5}
            value={downPaymentPct}
            onChange={(e) => setDownPaymentPct(Number(e.target.value))}
            aria-label={`Down payment: ${downPaymentPct}% of ${fmt(price)}`}
            aria-valuemin={0}
            aria-valuemax={60}
            aria-valuenow={downPaymentPct}
            className="w-full accent-bronze focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze"
          />
          <div className="mt-1 flex justify-between text-[0.65rem] text-text/40">
            <span>0%</span>
            <span>20%</span>
            <span>40%</span>
            <span>60%</span>
          </div>
        </div>

        {/* Interest rate */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-forest">Interest Rate</label>
          <div className="relative">
            <select
              value={customRate ? 'custom' : rateIdx}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setCustomRate(true)
                } else {
                  setCustomRate(false)
                  setRateIdx(Number(e.target.value))
                  setRate(NIGERIAN_RATES[Number(e.target.value)].rate)
                }
              }}
              aria-label="Interest rate option"
              className="w-full appearance-none rounded-md border border-cream bg-cream px-4 py-3 pr-10 text-sm text-text outline-none transition-colors focus:border-bronze"
            >
              {NIGERIAN_RATES.map((r, i) => (
                <option key={i} value={i}>
                  {r.label} — {r.rate}% p.a.
                </option>
              ))}
              <option value="custom">Custom rate…</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />
          </div>
          {customRate && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={50}
                step={0.5}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                aria-label="Custom interest rate percentage"
                className="w-24 rounded-md border border-cream bg-cream px-3 py-2 text-sm text-text outline-none transition-colors focus:border-bronze"
              />
              <span className="text-sm text-text/60">% per annum</span>
            </div>
          )}
        </div>

        {/* Loan term */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-forest">Loan Term</label>
          <div className="flex flex-wrap gap-2">
            {TERM_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTerm(t)}
                aria-pressed={term === t}
                aria-label={`${t} year loan term`}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
                  term === t
                    ? 'bg-forest text-cream'
                    : 'bg-cream text-text/70 hover:bg-forest/10 hover:text-forest'
                }`}
              >
                {t} yrs
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8 rounded-xl bg-forest p-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-bronze">Estimated Monthly Payment</p>
        <p className="mt-2 font-serif text-4xl font-bold text-cream">{fmt(monthly)}</p>
        <p className="mt-1 text-sm text-cream/60">per month for {term} years</p>

        {/* Visual bar */}
        <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-forest-deep">
          <div className="flex h-full">
            <div
              className="bg-bronze transition-all duration-300"
              style={{ width: `${principalPct}%` }}
              title="Principal"
            />
            <div
              className="bg-cream/40 transition-all duration-300"
              style={{ width: `${interestPct}%` }}
              title="Interest"
            />
          </div>
        </div>
        <div className="mt-2 flex justify-between text-[0.65rem] text-cream/50">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-bronze" />
            Principal ({principalPct}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-cream/40" />
            Interest ({interestPct}%)
          </span>
        </div>

        {/* Summary */}
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-cream/10 pt-5 text-sm">
          <div>
            <p className="text-cream/50">Loan Amount</p>
            <p className="font-serif text-lg font-bold text-cream">{fmt(loanAmount)}</p>
          </div>
          <div>
            <p className="text-cream/50">Down Payment</p>
            <p className="font-serif text-lg font-bold text-cream">{fmt(downPayment)}</p>
          </div>
          <div>
            <p className="text-cream/50">Total Interest</p>
            <p className="font-serif text-lg font-bold text-bronze">{fmt(totalInterest)}</p>
          </div>
          <div>
            <p className="text-cream/50">Total Cost</p>
            <p className="font-serif text-lg font-bold text-cream">{fmt(totalPaid + downPayment)}</p>
          </div>
        </div>
      </div>

      {/* Yearly amortisation toggle */}
      <button
        type="button"
        onClick={() => setShowAmortisation(!showAmortisation)}
        aria-expanded={showAmortisation}
        aria-controls="amortisation-table"
        className="mt-5 flex w-full items-center justify-between rounded-md bg-cream px-4 py-3 text-sm font-semibold text-forest transition-colors hover:bg-forest/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        <span>Amortisation Schedule</span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-200 ${showAmortisation ? 'rotate-180' : ''}`}
        />
      </button>

      {showAmortisation && yearlyData.length > 0 && (
        <div id="amortisation-table" className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-cream">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-cream">
              <tr className="border-b border-cream text-left font-semibold uppercase tracking-wider text-text/60">
                <th className="px-3 py-2">Year</th>
                <th className="px-3 py-2 text-right">Principal</th>
                <th className="px-3 py-2 text-right">Interest</th>
                <th className="px-3 py-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream">
              {yearlyData.map((row) => (
                <tr key={row.year} className="hover:bg-cream/50">
                  <td className="px-3 py-2 font-semibold text-forest">{row.year}</td>
                  <td className="px-3 py-2 text-right text-forest">{fmt(row.principalPaid)}</td>
                  <td className="px-3 py-2 text-right text-bronze">{fmt(row.interestPaid)}</td>
                  <td className="px-3 py-2 text-right text-text/70">{fmt(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 rounded-md bg-cream p-3 text-[0.7rem] leading-relaxed text-text/50">
        This calculator provides estimates only. Actual mortgage terms, rates and fees vary by lender.
        Contact our sales partners for tailored financing options.
      </p>
    </div>
  )
}

export default MortgageCalculator
