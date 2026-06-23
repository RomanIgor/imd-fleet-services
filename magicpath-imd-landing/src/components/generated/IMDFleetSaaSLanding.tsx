import { useState, type FormEvent, type ReactElement } from "react";

const logo = "https://storage.googleapis.com/storage.magicpath.ai/component-assets/411021778580832256/411021778580832257/fb8a148b5b51b5003a1241044de5815befa29d4c5caa42b497ff8d39d8e72b30.png";
const heroOffice = "https://storage.googleapis.com/storage.magicpath.ai/component-assets/411021778580832256/411028121635155968/afd923fc97400f783799baaad0fa3cb6ae08617aecf210f2e16b98eb0349c9e9.jpg";
const formCar = "https://storage.googleapis.com/storage.magicpath.ai/component-assets/411021778580832256/411028121635155968/1e1a3321236010003aa4bcb253b1fedfd6ca51805a1cdaddf704453fce108404.jpg";
const servicesBuilding = "https://storage.googleapis.com/storage.magicpath.ai/component-assets/411021778580832256/411028121635155968/2c104da26ce8d1f787e8dcc730021d580e2f525a0bed3b503383bc8bb1d74f85.jpg";
const pwaPhones = "https://storage.googleapis.com/storage.magicpath.ai/component-assets/411021778580832256/411028121635155968/2efbec7c4b4ac22e9a4383f9cecf55254e41b5cbe51d67c5e3da51fa82adbbf0.jpg";

type InfoKey = "about" | "benefits" | "fleet" | "services" | "invoice" | "network";

const infoText: Record<InfoKey, { title: string; text: string; bullets: string[] }> = {
  about: {
    title: "Volle Verantwortung in einem Prozess",
    text: "IMD uebernimmt die operative Koordination zwischen Fahrer, Fuhrpark, Partnerwerkstatt, Gutachten und Abrechnung.",
    bullets: ["Ein Ansprechpartner", "Klare Statuslogik", "Dokumentierte Abwicklung"],
  },
  benefits: {
    title: "Mehr Kontrolle bei weniger Aufwand",
    text: "Alle Beteiligten arbeiten mit eindeutigen Informationen. Dadurch sinken Rueckfragen, Reibung und manuelle Nacharbeit.",
    bullets: ["Transparente Kosten", "Schnellere Reaktion", "Messbare Ergebnisse"],
  },
  fleet: {
    title: "Skalierbar fuer einzelne Fahrzeuge und ganze Flotten",
    text: "Die Prozesse bleiben gleich verstaendlich, egal ob ein Fahrzeug, zehn Standorte oder grosse Fuhrparks angebunden werden.",
    bullets: ["Flottengroessen skalierbar", "Bundesweite Abwicklung", "Persoenlicher Service"],
  },
  services: {
    title: "Schadenmanagement und Fahrzeugankauf verbunden",
    text: "Zwei operative Kernprozesse werden in einer klaren Struktur zusammengefuehrt: Schadenfall bearbeiten und Fahrzeuge verwerten.",
    bullets: ["Schadenfall digital steuern", "Fahrzeugankauf vorbereiten", "Dokumente zentral halten"],
  },
  invoice: {
    title: "Rechnungen pruefen, freigeben und nachvollziehen",
    text: "Werkstattrechnungen, Plausibilitaet, Freigaben und Reporting werden so aufbereitet, dass Kontrolle moeglich bleibt.",
    bullets: ["Eingangspruefung", "Kostenkontrolle", "Archivierung"],
  },
  network: {
    title: "Partnernetzwerk mit bundesweiter Reichweite",
    text: "Zertifizierte Partner und klare Qualitaetsstandards sorgen fuer schnelle Hilfe, weniger Standzeiten und nachvollziehbare Leistung.",
    bullets: ["300+ Partner", "Qualitaetsstandards", "Kurze Wege"],
  },
};

const Icon = ({ name }: { name: string }) => {
  const paths: Record<string, ReactElement> = {
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    handshake: <><path d="M8 11l3 3a3 3 0 0 0 4 0l4-4" /><path d="M2 12l5-5 4 4" /><path d="M22 12l-5-5-3 3" /><path d="M7 17l2 2M11 18l2 2M15 17l2 2" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    shield: <><path d="M12 3l7 3v5c0 4.5-2.9 8.4-7 10-4.1-1.6-7-5.5-7-10V6l7-3z" /><path d="M9 12l2 2 4-5" /></>,
    chart: <><path d="M4 19h16" /><path d="M7 16V9M12 16V5M17 16v-7" /></>,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
    heart: <><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></>,
    map: <><path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z" /><path d="M9 3v15M15 6v15" /></>,
  };

  return (
    <svg className="bro-icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

const Check = () => <span className="check-dot" aria-hidden="true">✓</span>;

export const IMDFleetSaaSLanding = () => {
  const [sent, setSent] = useState(false);
  const [activeInfo, setActiveInfo] = useState<InfoKey | null>(null);

  const jumpTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main className="bro-page">
      <nav className="site-nav" aria-label="Landing page navigation">
        <button type="button" onClick={() => jumpTo("top")}>Start</button>
        <button type="button" onClick={() => jumpTo("services")}>Leistungen</button>
        <button type="button" onClick={() => jumpTo("invoice")}>Rechnungen</button>
        <button type="button" onClick={() => jumpTo("network")}>Netzwerk</button>
        <button type="button" className="nav-primary" onClick={() => jumpTo("contact")}>Kontakt</button>
      </nav>

      <section className="bro-grid" aria-label="IMD Fleet Services corporate brochure">
        <article className="tile tile-hero image-tile" id="top">
          <img className="tile-logo" src={logo} alt="IMD Fleet Services" />
          <div className="hero-claim">
            <h1>Effizient.<br />Digital.<br />Transparent.</h1>
            <p>Ihr Partner fuer professionelles Schadenmanagement, Fahrzeugankauf und digitale Fuhrparkprozesse.</p>
            <strong>We care. You drive.</strong>
            <div className="hero-actions">
              <button type="button" onClick={() => jumpTo("services")}>Leistungen ansehen</button>
              <button type="button" onClick={() => jumpTo("contact")}>Kontakt</button>
            </div>
          </div>
          <img className="hero-photo" src={formCar} alt="Business fleet vehicle" />
        </article>

        <article className="tile tile-about">
          <p className="eyebrow">Ueber IMD Fleet Services</p>
          <h2>Ein Partner.<br />Ein Versprechen.<br /><span>Volle Verantwortung.</span></h2>
          <p className="copy">IMD Fleet Services steht fuer professionelle Loesungen rund um Schadenmanagement, Fahrzeugankauf und die dazugehoerige Rechnungsabwicklung.</p>
          <div className="icon-grid">
            <div><Icon name="users" /><span>Spezialist fuer Flottenkunden</span></div>
            <div><Icon name="handshake" /><span>Ein Ansprechpartner fuer alles</span></div>
            <div><Icon name="clock" /><span>Schnelle Reaktion und Abwicklung</span></div>
            <div><Icon name="chart" /><span>Volle Transparenz und Kontrolle</span></div>
            <div><Icon name="map" /><span>Bundesweites Partnernetzwerk</span></div>
            <div><Icon name="shield" /><span>Hohe Qualitaetsstandards</span></div>
          </div>
          <button className="tile-action" type="button" onClick={() => setActiveInfo("about")}>Mehr erfahren</button>
          <div className="tile-band"><Check /> Weniger Aufwand. Mehr Kontrolle. Bessere Ergebnisse.</div>
        </article>

        <article className="tile tile-benefits">
          <p className="eyebrow">Ihre Vorteile auf einen Blick</p>
          <h2>Mehr Leistung.<br />Weniger Aufwand.<br /><span>Bessere Ergebnisse.</span></h2>
          <div className="benefit-wrap">
            <ul className="check-list">
              <li><Check /> Transparente Ablaeufe und Kosten</li>
              <li><Check /> Schnelle Reaktionszeiten</li>
              <li><Check /> Zentrale Kommunikation</li>
              <li><Check /> Maximale Kosteneffizienz</li>
              <li><Check /> Volle Prozesskontrolle</li>
              <li><Check /> Messbare Ergebnisse</li>
            </ul>
            <div className="orbit">
              <div className="orbit-core"><img src={logo} alt="" /></div>
              <span className="o o1">Transparenz</span>
              <span className="o o2">Kontrolle</span>
              <span className="o o3">Qualitaet</span>
              <span className="o o4">Effizienz</span>
            </div>
          </div>
          <blockquote>Wir schaffen Klarheit in komplexen Prozessen, damit Sie sich auf Ihr Kerngeschaeft konzentrieren koennen.</blockquote>
          <button className="tile-action" type="button" onClick={() => setActiveInfo("benefits")}>Vorteile oeffnen</button>
        </article>

        <article className="tile tile-fleet" id="fleet">
          <p className="eyebrow">Fuer Flottenkunden</p>
          <h2>Loesungen, die Ihren Fuhrpark nach vorne bringen.</h2>
          <p className="copy">Wir verstehen die Anforderungen moderner Flotten. Unsere Loesungen sind darauf ausgelegt, Prozesse einfacher, schneller und wirtschaftlicher zu gestalten.</p>
          <img src={heroOffice} alt="Fleet office" />
          <div className="mini-icons">
            <div><Icon name="users" /><span>Skalierbar fuer jede Flottengroesse</span></div>
            <div><Icon name="target" /><span>Individuelle Loesungen</span></div>
            <div><Icon name="clock" /><span>Flexible Prozesse</span></div>
            <div><Icon name="chart" /><span>Messbare Reports</span></div>
            <div><Icon name="heart" /><span>Persoenliche Betreuung</span></div>
          </div>
          <button className="tile-action" type="button" onClick={() => setActiveInfo("fleet")}>Fuhrpark-Loesung</button>
          <div className="tile-band"><Check /> Ihre Flotte. Unsere Loesungen. Gemeinsam erfolgreich.</div>
        </article>

        <article className="tile tile-services" id="services">
          <p className="eyebrow">Was wir tun</p>
          <h2>Zwei Bereiche.<br />Ein Anspruch: Exzellenz.</h2>
          <div className="service-cards">
            <button type="button" onClick={() => setActiveInfo("services")} style={{ backgroundImage: `linear-gradient(rgba(7,27,54,.22), rgba(7,27,54,.84)), url(${pwaPhones})` }}>
              <strong>Schadenmanagement</strong>
              <span>Komplette Abwicklung im Schadenfall, schnell, zuverlaessig und transparent.</span>
            </button>
            <button type="button" onClick={() => setActiveInfo("services")} style={{ backgroundImage: `linear-gradient(rgba(7,27,54,.12), rgba(7,27,54,.78)), url(${heroOffice})` }}>
              <strong>Fahrzeugankauf</strong>
              <span>Wir kaufen Ihre Fahrzeuge fair, schnell und unkompliziert.</span>
            </button>
          </div>
          <div className="notice"><Check /> Inklusive kompletter Rechnungsabwicklung - digital, praezise und voller Ueberblick.</div>
        </article>

        <article className="tile tile-invoice" id="invoice">
          <p className="eyebrow">Rechnungsabwicklung</p>
          <h2>Alle Rechnungen.<br />Eine Uebersicht.<br />Volle Kontrolle.</h2>
          <div className="invoice-layout">
            <ul className="check-list">
              <li><Check /> Eingangspruefung aller Werkstattrechnungen</li>
              <li><Check /> Plausibilitaetspruefung und Kostenkontrolle</li>
              <li><Check /> Digitale Freigabeprozesse</li>
              <li><Check /> Zahlungsabwicklung</li>
              <li><Check /> Archivierung und Reporting</li>
            </ul>
            <div className="dashboard-card">
              <div className="dash-top"><span>Rechnungsuebersicht</span><b>Q2</b></div>
              <div className="dash-kpis"><b>2.842</b><b>2.567</b><b>2.284</b></div>
              <div className="dash-chart"><i /><i /><i /><i /><i /></div>
            </div>
          </div>
          <button className="tile-action" type="button" onClick={() => setActiveInfo("invoice")}>Abrechnung ansehen</button>
          <div className="tile-band"><Check /> Jede Rechnung im Blick. Jede Zahlung unter Kontrolle.</div>
        </article>

        <article className="tile tile-trust">
          <p className="eyebrow">Warum Kunden uns vertrauen</p>
          <h2>Weil wir liefern, was zaehlt.</h2>
          <div className="trust-row">
            <div><Icon name="shield" /><strong>Zuverlaessig</strong><span>Wir halten, was wir versprechen.</span></div>
            <div><Icon name="target" /><strong>Effizient</strong><span>Schnelle Prozesse sparen Zeit und Kosten.</span></div>
            <div><Icon name="eye" /><strong>Transparent</strong><span>Volle Sicht auf alle relevanten Daten.</span></div>
            <div><Icon name="users" /><strong>Kompetent</strong><span>Erfahrene Experten an Ihrer Seite.</span></div>
            <div><Icon name="heart" /><strong>Persoenlich</strong><span>Echter Service, echte Partnerschaft.</span></div>
          </div>
          <div className="tile-band"><Check /> Vertrauen ist kein Zufall. Sondern das Ergebnis guter Arbeit.</div>
        </article>

        <article className="tile tile-network" id="network">
          <p className="eyebrow">Unser Netzwerk - Ihre Staerke</p>
          <h2>Bundesweit.<br />Zertifiziert.<br />Leistungsstark.</h2>
          <div className="network-map">
            <span className="n n1" /><span className="n n2" /><span className="n n3" /><span className="n n4" /><span className="n n5" /><span className="n n6" />
          </div>
          <div className="network-stats">
            <div><b>300+</b><span>zertifizierte Partnerwerkstaetten</span></div>
            <div><b>100%</b><span>Qualitaetsstandards durch Audits</span></div>
            <div><b>100%</b><span>Abdeckung in Deutschland</span></div>
            <div><b>Kurz</b><span>schnelle Hilfe, weniger Standzeiten</span></div>
          </div>
          <button className="tile-action" type="button" onClick={() => setActiveInfo("network")}>Netzwerkdetails</button>
          <div className="tile-band"><Check /> Qualitaet, auf die Sie sich verlassen koennen - ueberall in Deutschland.</div>
        </article>

        <article className="tile tile-contact image-tile" id="contact">
          <div>
            <img className="contact-logo" src={logo} alt="IMD Fleet Services" />
            <strong className="script">We care.<br />You drive.</strong>
            <ul>
              <li>Dieselstrasse 10, 61169 Friedberg</li>
              <li>+49 6031 68499-0</li>
              <li>info@imdfleet.de</li>
              <li>www.imdfleet.de</li>
            </ul>
            <form onSubmit={submit}>
              <input placeholder="Ihre E-Mail" type="email" required />
              <button>{sent ? "Vorgemerkt" : "Kontakt aufnehmen"}</button>
            </form>
          </div>
          <img src={servicesBuilding} alt="IMD office building" />
          <div className="tile-band"><Check /> Bereit, Ihre Flotte auf das naechste Level zu bringen?</div>
        </article>
      </section>

      {activeInfo ? (
        <div className="info-overlay" role="dialog" aria-modal="true" aria-labelledby="info-title" onClick={() => setActiveInfo(null)}>
          <section className="info-panel" onClick={(event) => event.stopPropagation()}>
            <button className="close-panel" type="button" aria-label="Schliessen" onClick={() => setActiveInfo(null)}>x</button>
            <p className="eyebrow">IMD Detail</p>
            <h2 id="info-title">{infoText[activeInfo].title}</h2>
            <p>{infoText[activeInfo].text}</p>
            <ul>
              {infoText[activeInfo].bullets.map((item) => <li key={item}><Check /> {item}</li>)}
            </ul>
            <button className="panel-cta" type="button" onClick={() => { setActiveInfo(null); jumpTo("contact"); }}>Kontakt aufnehmen</button>
          </section>
        </div>
      ) : null}
    </main>
  );
};
