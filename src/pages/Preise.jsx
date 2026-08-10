import { Link } from 'react-router-dom'

// Static for now — becomes Stripe-backed in a later stage (checkout buttons,
// live prices from the DB catalog instead of this hardcoded array). Values
// here are the same three tiers already shown pre-launch.
const PLANS = [
  {
    name: 'Basis',
    price: '5',
    features: [
      'Turnierplanung',
      'Matchübersicht mit Portalverknüpfungen',
      'Matchanalyse',
      'Matchtracker',
      'Meine Datenablage mit 500 MB Speicherplatz',
    ],
  },
  {
    name: 'Fortgeschritten',
    price: '8',
    features: ['Alle Leistungen aus Basis', '3 Teamnutzer (weitere buchbar)', 'Input für Trainer und Teammitglieder'],
  },
  {
    name: 'Pro',
    price: '10',
    features: ['Alle Leistungen aus Fortgeschritten', 'Speicherplatzerweiterung durch eigenen Cloudspeicher'],
  },
]

export default function Preise() {
  return (
    <div id="app-shell" className="preise-page">
      <Link to="/" className="preise-back">
        ← Zurück
      </Link>

      <h1 className="section-title" style={{ marginTop: 16 }}>
        Plan und Preise
      </h1>
      <p className="section-sub">Für jedes Team die passende Stufe.</p>

      <div className="pricing-grid">
        {PLANS.map((plan) => (
          <div className="pricing-card" key={plan.name}>
            <h3>{plan.name}</h3>
            <div className="pricing-price">
              <span className="amount">{plan.price} €</span>
              <span className="period">/ Monat</span>
            </div>
            <ul>
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="preise-hint">
        Online-Buchung folgt in Kürze. Bis dahin: <Link to="/register">kostenlos registrieren</Link> — dein Team
        wird nach kurzer Prüfung freigeschaltet.
      </p>
    </div>
  )
}
