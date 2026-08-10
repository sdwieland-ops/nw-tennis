import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '🗺️',
    title: 'Jahresplanung',
    desc: 'Die ganze Saison auf einen Blick — Turniere und Etappenziele übersichtlich geplant, mit Rückmeldung von Trainern und Eltern.',
  },
  {
    icon: '📋',
    title: 'Terminplanung',
    desc: 'Trainings- und Spieltermine an einem Ort, für das ganze Team sichtbar — keine verpassten Termine mehr.',
  },
  {
    icon: '🎯',
    title: 'Trainingsfokus',
    desc: 'Vor jedem Training wissen, woran gearbeitet wird — und danach direkt festhalten, was hängen geblieben ist.',
  },
  {
    icon: '🎾',
    title: 'Matchanalyse',
    desc: 'Nach jedem Match Stärken, Schwächen und nächste Schritte festhalten — durchsuchbar und exportierbar.',
  },
  {
    icon: '📡',
    title: 'Matchticker',
    desc: 'Punktestand live mitverfolgen, inklusive Satz-, Tiebreak- und Match-Tiebreak-Logik — auch wenn niemand vor Ort sein kann.',
  },
  {
    icon: '🎬',
    title: 'Beispiele',
    desc: 'Vorbilder und Hilfestellungen als Video- oder Social-Media-Link direkt im Teamportal sammeln, statt in Chat-Verläufen zu suchen.',
  },
  {
    icon: '📁',
    title: 'Meine Dateien',
    desc: 'Videos, Bilder und Dokumente in Ordnern organisieren — für das ganze Team zugänglich, egal wer sie hochgeladen hat.',
  },
]

export default function Landing() {
  return (
    <div id="landing">
      <div className="topbar landing-topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-logo">
              <img src="/logo.png" alt="Dolphin Tennis Logo" />
            </div>
            <div className="brand-mark">
              Dolphin<span className="dot">.</span>
            </div>
          </div>
        </div>
        <div className="brand-sub">DEIN SPIELERPORTAL</div>
      </div>

      <section className="landing-hero">
        <img className="landing-hero-photo" src="/images/landing/hero.jpg" alt="" />
        <div className="landing-hero-scrim" />
        <div className="landing-hero-content">
          <h1>Die digitale Heimat für dein Tennis-Team</h1>
          <p>
            Turnierplanung, Trainingssteuerung, Matchanalyse und Liveticker an einem Ort — für Spieler, Trainer und
            Management gemeinsam.
          </p>
          <div className="landing-hero-actions">
            <Link to="/register" className="btn btn-primary">
              Kostenlos registrieren
            </Link>
            <Link to="/login" className="btn landing-btn-glass">
              Anmelden
            </Link>
          </div>
        </div>
      </section>

      <div id="app-shell">
        <h2 className="section-title">Was die App bietet</h2>
        <p className="section-sub">Alles, was ein Team für die Saison braucht.</p>
        <div className="grid">
          {FEATURES.map((f) => (
            <div className="card" key={f.title} style={{ cursor: 'default' }}>
              <div className="icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="landing-photo-break">
          <img src="/images/landing/secondary.jpg" alt="" />
          <div className="landing-photo-break-text">
            <h2>Für jedes Level, jeden Belag</h2>
            <p>Vom ersten Vereinsturnier bis zur internationalen Reise — Dolphin wächst mit deiner Saison mit.</p>
          </div>
        </div>

        <div className="landing-pricing-teaser">
          <div>
            <h2 className="section-title" style={{ marginBottom: 4 }}>
              Transparente Preise
            </h2>
            <p className="section-sub" style={{ margin: 0 }}>
              Drei Stufen, passend für jede Teamgröße — ab 5 CHF im Monat.
            </p>
          </div>
          <Link to="/preise" className="btn btn-outline">
            Preise ansehen →
          </Link>
        </div>

        <footer className="landing-footer">
          <div className="brand-mark landing-footer-mark">
            Dolphin<span className="dot">.</span>
          </div>
          <div className="landing-footer-links">
            <Link to="/preise">Preise</Link>
            <Link to="/impressum">Impressum</Link>
            <Link to="/datenschutz">Datenschutz</Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
