import { Link } from 'react-router-dom'

export default function Impressum() {
  return (
    <div id="app-shell" className="legal-page">
      <Link to="/" className="preise-back">
        ← Zurück
      </Link>

      <h1 className="section-title" style={{ marginTop: 16 }}>
        Impressum
      </h1>

      <div className="legal-body">
        <h2>Angaben gemäß § 5 TMG</h2>
        <p>
          Wieland Planung &amp; Design GbR
          <br />
          Schwarzwaldstr. 61
          <br />
          79539 Lörrach
          <br />
          Deutschland
        </p>

        <h2>Vertretungsberechtigte Gesellschafter</h2>
        <p>
          Sophie Wieland
          <br />
          Daniel Wieland
        </p>

        <h2>Kontakt</h2>
        <p>
          E-Mail: <a href="mailto:info@dolphintennis.com">info@dolphintennis.com</a>
        </p>

        <h2>Steuernummer</h2>
        <p>64455/20518</p>

        <h2>Redaktionell verantwortlich</h2>
        <p>
          Sophie Wieland
          <br />
          Anschrift wie oben
        </p>

        <h2>EU-Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noreferrer">
            https://ec.europa.eu/consumers/odr/
          </a>
          . Unsere E-Mail-Adresse finden Sie oben im Impressum.
        </p>

        <h2>Verbraucherstreitbeilegung</h2>
        <p>
          Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </div>
    </div>
  )
}
