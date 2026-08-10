import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listPrices } from '../lib/billingApi'

// Feature lists stay static here — only the amount is money (and therefore
// DB-driven, see billing_prices/listPrices). plan keys match the `plan`
// check constraint on billing_prices.
const PLAN_INFO = {
  basis: {
    name: 'Basis',
    features: [
      'Turnierplanung',
      'Matchübersicht mit Portalverknüpfungen',
      'Matchanalyse',
      'Matchtracker',
      'Meine Datenablage mit 500 MB Speicherplatz',
    ],
  },
  fortgeschritten: {
    name: 'Fortgeschritten',
    features: ['Alle Leistungen aus Basis', '3 Teamnutzer (weitere buchbar)', 'Input für Trainer und Teammitglieder'],
  },
  pro: {
    name: 'Pro',
    features: ['Alle Leistungen aus Fortgeschritten', 'Speicherplatzerweiterung durch eigenen Cloudspeicher'],
  },
}

// Launch currency — Switzerland goes live first. EUR joins once the German
// rollout starts; this page will need a currency switch at that point.
const CURRENCY = 'chf'
const PLAN_ORDER = ['basis', 'fortgeschritten', 'pro']

export default function Preise() {
  const [prices, setPrices] = useState(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    listPrices(CURRENCY)
      .then((data) => !cancelled && setPrices(data))
      .catch(() => !cancelled && setLoadError(true))
    return () => {
      cancelled = true
    }
  }, [])

  const byPlan = Object.fromEntries((prices || []).map((p) => [p.plan, p]))

  return (
    <div id="app-shell" className="preise-page">
      <Link to="/" className="preise-back">
        ← Zurück
      </Link>

      <h1 className="section-title" style={{ marginTop: 16 }}>
        Plan und Preise
      </h1>
      <p className="section-sub">Für jedes Team die passende Stufe.</p>

      {loadError && <p className="preise-hint">Preise konnten nicht geladen werden.</p>}

      {prices && (
        <div className="pricing-grid">
          {PLAN_ORDER.filter((key) => byPlan[key]).map((key) => (
            <div className="pricing-card" key={key}>
              <h3>{PLAN_INFO[key].name}</h3>
              <div className="pricing-price">
                <span className="amount">{(byPlan[key].amount / 100).toFixed(0)} CHF</span>
                <span className="period">/ Monat</span>
              </div>
              <ul>
                {PLAN_INFO[key].features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <p className="preise-hint">
        Online-Buchung folgt in Kürze. Bis dahin: <Link to="/register">kostenlos registrieren</Link> — dein Team
        wird nach kurzer Prüfung freigeschaltet.
      </p>
    </div>
  )
}
