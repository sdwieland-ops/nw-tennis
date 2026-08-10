import { Link } from 'react-router-dom'

export default function Datenschutz() {
  return (
    <div id="app-shell" className="legal-page">
      <Link to="/" className="preise-back">
        ← Zurück
      </Link>

      <h1 className="section-title" style={{ marginTop: 16 }}>
        Datenschutzerklärung
      </h1>

      <div className="legal-body">
        <h2>1. Verantwortlicher</h2>
        <p>
          Wieland Planung &amp; Design GbR
          <br />
          Schwarzwaldstr. 61
          <br />
          79539 Lörrach, Deutschland
          <br />
          E-Mail: <a href="mailto:info@dolphintennis.com">info@dolphintennis.com</a>
        </p>

        <h2>2. Allgemeines zur Datenverarbeitung</h2>
        <p>
          Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur Bereitstellung
          einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist. Die Verarbeitung
          personenbezogener Daten erfolgt regelmäßig nur mit Einwilligung des Nutzers (Art. 6 Abs. 1 lit. a DSGVO),
          zur Erfüllung eines Vertrags mit dem Nutzer (Art. 6 Abs. 1 lit. b DSGVO) oder auf Grundlage unserer
          berechtigten Interessen (Art. 6 Abs. 1 lit. f DSGVO), etwa an einem technisch fehlerfreien Betrieb der
          Website.
        </p>

        <h2>3. Bereitstellung der Website / Server-Logfiles</h2>
        <p>
          Beim Aufruf unserer Website erhebt unser Hosting-Provider (all-inkl.com, ALL-INKL.COM – Neue Medien
          Münnich, Hauptstraße 68, 02742 Friedersdorf) automatisch Informationen in sogenannten Server-Logfiles, die
          Ihr Browser automatisch übermittelt. Dies sind: IP-Adresse, Datum und Uhrzeit der Anfrage, Inhalt der
          Anforderung, Zugriffsstatus/HTTP-Statuscode, übertragene Datenmenge, Browsertyp und -version sowie das
          verwendete Betriebssystem. Diese Daten sind nicht bestimmten Personen zuordenbar und werden ausschließlich
          zur Gewährleistung eines störungsfreien Betriebs sowie zur Sicherheit unserer Systeme verwendet
          (berechtigtes Interesse, Art. 6 Abs. 1 lit. f DSGVO).
        </p>

        <h2>4. Registrierung und Nutzerkonto</h2>
        <p>
          Zur Nutzung von Dolphin ist ein Nutzerkonto erforderlich. Bei der Registrierung erheben wir E-Mail-Adresse,
          Passwort (verschlüsselt gespeichert) sowie die von Ihnen angegebenen Team- und Spielerdaten. Diese Angaben
          sind zur Erfüllung des Nutzungsvertrags erforderlich (Art. 6 Abs. 1 lit. b DSGVO). Weitere im Rahmen der
          Nutzung eingegebene Daten (z. B. Matchanalysen, Trainingspläne, hochgeladene Dateien) verbleiben im
          Verantwortungsbereich des jeweiligen Teams und werden ausschließlich zur Bereitstellung der App-Funktionen
          verarbeitet.
        </p>

        <h2>5. Eingesetzte Auftragsverarbeiter</h2>
        <p>Zur Bereitstellung unserer Dienste setzen wir folgende Dienstleister ein, mit denen jeweils ein Auftragsverarbeitungsvertrag besteht bzw. die entsprechenden Standardvertragsklauseln zugrunde liegen:</p>
        <ul>
          <li>
            <strong>Supabase</strong> (Datenbank, Authentifizierung, Datei-Speicherung) — verarbeitet sämtliche in der
            App eingegebenen Daten im Auftrag.
          </li>
          <li>
            <strong>all-inkl.com</strong> (Hosting der Website, Versand von System-E-Mails wie Bestätigungs- und
            Einladungslinks über das Postfach support@dolphintennis.com).
          </li>
          <li>
            <strong>Stripe</strong> (Zahlungsabwicklung für kostenpflichtige Abos) — verarbeitet die zur Zahlung
            notwendigen Daten (z. B. Zahlungsmittel, Rechnungsadresse) direkt; wir selbst erhalten und speichern
            keine vollständigen Zahlungsdaten (z. B. Kreditkartennummern).
          </li>
        </ul>

        <h2>6. Zahlungsabwicklung über Stripe</h2>
        <p>
          Für kostenpflichtige Abos nutzen wir den Zahlungsdienstleister Stripe (Stripe Payments Europe, Ltd., 1
          Grand Canal Street Lower, Dublin, Irland). Bei Abschluss einer Buchung werden Sie auf eine von Stripe
          gehostete Bezahlseite weitergeleitet; die dort eingegebenen Zahlungsdaten werden ausschließlich von Stripe
          verarbeitet. Wir erhalten lediglich Informationen zum Abo-Status (z. B. aktiv, gekündigt) sowie eine
          Stripe-interne Kunden- und Abo-Kennung, jedoch keine vollständigen Zahlungsdetails. Rechtsgrundlage ist die
          Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO).
        </p>

        <h2>7. Cookies und Tracking</h2>
        <p>
          Unsere Website setzt aktuell keine Cookies zu Analyse- oder Marketingzwecken und keine Tracking- oder
          Analysewerkzeuge Dritter ein. Für die Anmeldung wird ein technisch notwendiger Sitzungsspeicher im Browser
          verwendet, der ausschließlich der Aufrechterhaltung Ihrer Anmeldung dient.
        </p>

        <h2>8. Speicherdauer</h2>
        <p>
          Wir speichern personenbezogene Daten so lange, wie es für die Bereitstellung unserer Dienste erforderlich
          ist bzw. wie es gesetzliche Aufbewahrungspflichten (insbesondere handels- und steuerrechtliche) vorsehen.
          Nach Kündigung eines Nutzerkontos werden die zugehörigen Daten gelöscht, soweit keine gesetzliche
          Aufbewahrungspflicht entgegensteht.
        </p>

        <h2>9. Ihre Rechte</h2>
        <p>Ihnen stehen folgende Rechte zu:</p>
        <ul>
          <li>Auskunft über die zu Ihrer Person gespeicherten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
        </ul>
        <p>
          Zur Ausübung dieser Rechte genügt eine E-Mail an{' '}
          <a href="mailto:info@dolphintennis.com">info@dolphintennis.com</a>. Ihnen steht zudem ein Beschwerderecht
          bei einer Datenschutzaufsichtsbehörde zu, etwa dem Landesbeauftragten für den Datenschutz
          Baden-Württemberg.
        </p>

        <h2>10. Hinweis für Nutzer aus der Schweiz</h2>
        <p>
          Soweit Sie unsere Dienste von der Schweiz aus nutzen, verarbeiten wir Ihre Daten nach denselben in dieser
          Erklärung beschriebenen Grundsätzen; diese entsprechen inhaltlich auch den Anforderungen des Schweizer
          Datenschutzgesetzes (DSG).
        </p>

        <p className="legal-disclaimer">
          Diese Datenschutzerklärung wurde sorgfältig erstellt, ersetzt aber keine rechtliche Beratung. Insbesondere
          aufgrund des grenzüberschreitenden Angebots in Deutschland und der Schweiz empfehlen wir vor dem
          produktiven Einsatz eine Prüfung durch eine auf Datenschutzrecht spezialisierte Kanzlei.
        </p>
      </div>
    </div>
  )
}
