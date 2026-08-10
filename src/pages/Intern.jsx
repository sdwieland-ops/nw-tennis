import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../lib/ToastContext'
import { createCoupon, getDashboardData, updatePrice } from '../lib/adminApi'

const PLAN_LABELS = { basis: 'Basis', fortgeschritten: 'Fortgeschritten', pro: 'Pro' }

function PriceRow({ price, onSaved }) {
  const toast = useToast()
  const [value, setValue] = useState((price.amount / 100).toString())
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const amount = Math.round(parseFloat(value.replace(',', '.')) * 100)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast('Ungültiger Betrag.')
      return
    }
    setSaving(true)
    try {
      await updatePrice(price.id, amount)
      onSaved()
      toast('Preis gespeichert.')
    } catch (err) {
      console.error(err)
      toast('Speichern fehlgeschlagen: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="intern-price-row">
      <span className="intern-price-plan">
        {PLAN_LABELS[price.plan] || price.plan} ({price.currency.toUpperCase()})
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ width: 90 }}
      />
      <button type="button" className="btn btn-outline btn-sm" onClick={handleSave} disabled={saving}>
        {saving ? '…' : 'Speichern'}
      </button>
      {!price.stripe_price_id && <span className="intern-price-warning">Kein Stripe-Preis verknüpft</span>}
    </div>
  )
}

function CouponForm({ onCreated }) {
  const toast = useToast()
  const [code, setCode] = useState('')
  const [percentOff, setPercentOff] = useState('10')
  const [creating, setCreating] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!code.trim()) return
    setCreating(true)
    try {
      await createCoupon({ code: code.trim().toUpperCase(), percentOff: Number(percentOff) })
      toast(`Aktionscode „${code.trim().toUpperCase()}" angelegt.`)
      setCode('')
      onCreated()
    } catch (err) {
      console.error(err)
      toast('Anlegen fehlgeschlagen: ' + err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <form className="filter-bar" onSubmit={handleSubmit} style={{ alignItems: 'end' }}>
      <div className="field">
        <label htmlFor="coupon-code">Code</label>
        <input
          id="coupon-code"
          type="text"
          placeholder="z. B. SAISON26"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="coupon-percent">Rabatt in %</label>
        <input
          id="coupon-percent"
          type="number"
          min="1"
          max="100"
          value={percentOff}
          onChange={(e) => setPercentOff(e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={creating}>
        {creating ? '…' : '+ Anlegen'}
      </button>
    </form>
  )
}

export default function Intern() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const toast = useToast()

  function load() {
    getDashboardData()
      .then(setData)
      .catch((err) => setError(err.message))
  }

  useEffect(load, [])

  if (error) {
    return (
      <div id="app-shell" className="preise-page">
        <Link to="/" className="preise-back">
          ← Zurück
        </Link>
        <div className="empty-state">
          <div className="big-emoji">🔒</div>
          <p>
            <strong>Kein Zugriff.</strong>
          </p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div id="app-shell" className="preise-page">
      <Link to="/" className="preise-back">
        ← Zurück
      </Link>

      <h1 className="section-title" style={{ marginTop: 16 }}>
        Interner Bereich
      </h1>
      <p className="section-sub">Übersicht und Einstellungen für Dolphin insgesamt.</p>

      <div className="intern-stats-grid">
        <div className="intern-stat-card">
          <div className="intern-stat-value">{data.teamCount}</div>
          <div className="intern-stat-label">Teams</div>
        </div>
        <div className="intern-stat-card">
          <div className="intern-stat-value">{data.totalUsers}</div>
          <div className="intern-stat-label">Nutzer gesamt</div>
        </div>
        <div className="intern-stat-card">
          <div className="intern-stat-value">{data.trainerCount}</div>
          <div className="intern-stat-label">Trainer</div>
        </div>
        <div className="intern-stat-card">
          <div className="intern-stat-value">{data.trainerExtraSeatsBooked}</div>
          <div className="intern-stat-label">Trainer als Zusatzbuchung</div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Teams ({data.teamCount})</h3>
        <div className="match-list">
          {data.teams.map((t) => (
            <div className="match-row" key={t.id} style={{ cursor: 'default' }}>
              <div className="match-meta">
                <div className="opp">{t.name}</div>
              </div>
              {!t.approved && <span className="filed-tag">Nicht freigeschaltet</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3>Preise</h3>
        <p className="section-hint" style={{ margin: '0 0 14px' }}>
          Änderungen wirken sich nur auf neue Buchungen aus, nicht auf bereits laufende Abos.
        </p>
        <div className="intern-price-list">
          {data.prices.map((p) => (
            <PriceRow key={p.id} price={p} onSaved={load} />
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3>Aktionscodes</h3>
        <CouponForm onCreated={load} />
        <div className="intern-price-list" style={{ marginTop: 16 }}>
          {data.promotionCodes.length === 0 && <p className="section-hint">Noch keine Aktionscodes angelegt.</p>}
          {data.promotionCodes.map((pc) => (
            <div className="intern-price-row" key={pc.id}>
              <span className="intern-price-plan">{pc.code}</span>
              <span>{pc.percentOff ? `${pc.percentOff}%` : `${(pc.amountOff / 100).toFixed(2)} ${pc.currency?.toUpperCase()}`}</span>
              <span className="section-hint">
                {pc.timesRedeemed}× eingelöst{pc.maxRedemptions ? ` / max. ${pc.maxRedemptions}` : ''}
              </span>
              {!pc.active && <span className="filed-tag">Inaktiv</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
