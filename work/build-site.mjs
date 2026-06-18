import fs from "node:fs";
import path from "node:path";

const outDir = "outputs";
const apvUrl = "https://apv-amsterdamroleplay.onrender.com/";
const wetboekPdf = "assets/documents/wetboek-van-strafrecht-amrp.pdf";

const discord = {
  main: "https://discord.gg/9W7wgZF6T4",
  support: "https://discord.gg/qjwspjT2zg",
  overheid: "https://discord.gg/k3NhmZdxty",
  overheidKanaal: "https://discord.com/channels/1402056739985162394/1509674799671017664",
  onderwereld: "https://discord.gg/feCbm7nYh4",
};

const nav = [
  ["home", "Home", "index.html"],
  ["regels", "APV", "regels.html"],
  ["vacatures", "Vacatures", "vacatures.html"],
  ["status", "Status", "status.html"],
  ["informatie", "Informatie", "informatie.html"],
  ["joinen", "Joinen", "joinen.html"],
];

const extraNav = [
  ["faq", "FAQ", "faq.html"],
  ["support", "Support", "support.html"],
];

const serverLinks = [
  ["Main", discord.main],
  ["Support", discord.support],
  ["Overheid", discord.overheid],
  ["Onderwereld", discord.onderwereld],
];

function button(label, href, tone = "primary", external = false) {
  const target = external ? ' target="_blank" rel="noopener"' : "";
  return `<a class="button ${tone}" href="${href}"${target}>${label}</a>`;
}

function hero(page) {
  const actions = (page.actions || []).join("");

  return `
    <section class="page-hero ${page.heroClass || ""}">
      <div class="hero-bg" aria-hidden="true"></div>
      <div class="hero-photo-shade" aria-hidden="true"></div>
      <div class="container hero-inner">
        <div class="hero-copy-block">
          <p class="eyebrow">${page.eyebrow}</p>
          <h1>${page.heading}</h1>
          <p class="hero-lead">${page.intro}</p>
          <div class="hero-actions">${actions}</div>
        </div>
      </div>
    </section>`;
}

function pageShell(page) {
  const navLinks = nav
    .map(([id, label, href]) => `<a data-page-link="${id}" href="${href}">${label}</a>`)
    .join("");
  const moreLinks = extraNav
    .map(([id, label, href]) => `<a data-page-link="${id}" href="${href}">${label}</a>`)
    .join("");
  const serversLinks = serverLinks
    .map(([label, href]) => `<a href="${href}" target="_blank" rel="noopener">${label}</a>`)
    .join("");
  const footerLinks = [...nav, ...extraNav]
    .map(([id, label, href]) => `<a data-page-link="${id}" href="${href}">${label}</a>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${page.title} | Amsterdam Roleplay</title>
    <meta name="description" content="${page.description}" />
    <link rel="icon" type="image/png" href="assets/logo-amsterdam-roleplay.png" />
    <link rel="preload" href="assets/logo-amsterdam-roleplay.png" as="image" />
    <link rel="preload" href="assets/banner-amsterdam-roleplay.webp" as="image" />
    <script>
      (() => {
        try {
          const savedTheme = localStorage.getItem("ar-theme");
          document.documentElement.dataset.theme = savedTheme === "dark" ? "dark" : "light";
        } catch {
          document.documentElement.dataset.theme = "light";
        }
      })();
    </script>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body data-page="${page.id}">
    <header class="site-header">
      <nav class="nav container" aria-label="Hoofdnavigatie">
        <a class="brand" href="index.html" aria-label="Amsterdam Roleplay home">
          <img src="assets/logo-amsterdam-roleplay.png" alt="" />
          <span>
            <strong>Amsterdam Roleplay</strong>
            <small>Easy Weapons roleplay</small>
          </span>
        </a>
        <button class="menu-toggle" type="button" aria-label="Menu openen" aria-expanded="false" aria-controls="navLinks">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div class="nav-links" id="navLinks">
          ${navLinks}
          <div class="nav-more">
            <button type="button" aria-expanded="false">Meer</button>
            <div class="more-menu">${moreLinks}</div>
          </div>
          <div class="nav-more nav-servers">
            <button type="button" aria-expanded="false">Servers</button>
            <div class="more-menu">${serversLinks}</div>
          </div>
          <button class="theme-toggle" type="button" data-theme-toggle aria-label="Schakel naar zwart thema">
            <span class="theme-dot" aria-hidden="true"></span>
            <span data-theme-label>Zwart</span>
          </button>
        </div>
      </nav>
    </header>
    <a class="skip-link" href="#content">Naar inhoud</a>
    <main id="content">
      ${hero(page)}
      ${page.content}
    </main>
    <footer class="footer">
      <div class="container footer-grid">
        <div>
          <a class="brand footer-brand" href="index.html" aria-label="Amsterdam Roleplay home">
            <img src="assets/logo-amsterdam-roleplay.png" alt="" />
            <span>
              <strong>Amsterdam Roleplay</strong>
              <small>Communityhub</small>
            </span>
          </a>
          <p>Niet geassocieerd met Cfx.re, Rockstar Games of Take-Two Interactive.</p>
        </div>
        <div class="footer-column">
          <h2>Pagina's</h2>
          <div class="footer-links">${footerLinks}</div>
        </div>
        <div class="footer-column">
          <h2>Direct</h2>
          <div class="footer-links">
            <a href="${discord.main}" target="_blank" rel="noopener">Main server</a>
            <a href="${discord.support}" target="_blank" rel="noopener">Support server</a>
            <a href="${discord.overheid}" target="_blank" rel="noopener">Overheid server</a>
            <a href="${discord.onderwereld}" target="_blank" rel="noopener">Onderwereld server</a>
          </div>
        </div>
      </div>
    </footer>
    ${page.extraScripts || ""}
    <script src="script.js"></script>
  </body>
</html>`;
}

const pages = [
  {
    id: "home",
    file: "index.html",
    title: "Home",
    description: "Amsterdam Roleplay Easy Weapons communityhub met APV, vacatures, wetboek en Discord servers.",
    eyebrow: "Easy Weapons Amsterdam",
    heading: "<span>Amsterdam Roleplay</span><span>direct speelbaar.</span>",
    intro:
      "Een compacte hub voor APV, straffen, vacatures, wetboek, support en de juiste Discord server voor elke route.",
    actions: [
      button("Bekijk APV", "regels.html"),
      button("Join main server", discord.main, "secondary", true),
      button("Open wetboek", wetboekPdf, "ghost", true),
    ],
    stats: [
      ["APV", "65 artikelen"],
      ["Wetboek", "13 pagina's"],
      ["Focus", "Easy Weapons"],
    ],
    content: `
      <section class="band">
        <div class="container">
          <div style="text-align: center; max-width: 760px; margin: 0 auto;">
            <p class="eyebrow">Snel starten</p>
            <h2>Alles voor Amsterdam Roleplay op een plek.</h2>
            <p>Een lichte, snelle hub voor spelers die meteen willen weten waar ze moeten zijn: APV, straffen, vacatures, support en de juiste Discord-route.</p>
          </div>
        </div>
      </section>

      <section class="container section">
        <div class="section-head">
          <p class="eyebrow">Kies je route</p>
          <h2>Speel via overheid, onderwereld of staff.</h2>
        </div>
        <div class="card-grid two">
          <div class="feature-card">
            <h3>Onderwereld</h3>
            <p><strong>Easy Weapons, spanning en consequenties.</strong></p>
            <p>Bouw een groep op, maak slimme deals en speel scenario's uit binnen de APV. Minder gedoe, meer actie, maar wel met duidelijke regels.</p>
            <a class="button secondary" href="${discord.onderwereld}" target="_blank" rel="noopener">Onderwereld Discord</a>
          </div>
          <div class="feature-card">
            <h3>Overheid</h3>
            <p><strong>Politie, ambulance en overheid.</strong></p>
            <p>Solliciteer voor een whitelisted job en speel situaties uit met porto, bewijs, overleg en duidelijke straffen. De overheidserver staat klaar.</p>
            <a class="button secondary" href="${discord.overheid}" target="_blank" rel="noopener">Overheid Discord</a>
          </div>
        </div>
      </section>

      <section class="band">
        <div class="container">
          <div style="text-align: center; max-width: 760px; margin: 0 auto;">
            <p class="eyebrow">Startflow</p>
            <h2>Van Discord naar de stad.</h2>
            <p>Nieuwe spelers moeten niet zoeken. Deze site stuurt je direct naar de juiste plek en laat zien wat je eerst moet lezen.</p>
            <div class="quick-steps">
              <div><p>Stap 1</p><h3>Main Discord</h3></div>
              <div><p>Stap 2</p><h3>APV lezen</h3></div>
              <div><p>Stap 3</p><h3>FiveM joinen</h3></div>
            </div>
          </div>
        </div>
      </section>

      <section class="container section">
        <div class="section-head">
          <p class="eyebrow">Overzicht</p>
          <h2>Alles wat je nodig hebt om mee te spelen.</h2>
        </div>
        <div class="card-grid three">
          <a class="feature-card link-card" href="regels.html">
            <h3>APV volledig</h3>
            <p>65 artikelen, strafcategorieen en zoekfunctie op een pagina.</p>
          </a>
          <a class="feature-card link-card" href="joinen.html">
            <h3>Start nu</h3>
            <p>De korte route voor nieuwe spelers: Discord, regels en FiveM.</p>
          </a>
          <a class="feature-card link-card" href="vacatures.html">
            <h3>Vacatures</h3>
            <p>Overheid, staff en onderwereld met werkende Discord-knoppen.</p>
          </a>
          <a class="feature-card link-card" href="assets/documents/wetboek-van-strafrecht-amrp.pdf" target="_blank" rel="noopener">
            <h3>Wetboek PDF</h3>
            <p>De directe PDF voor staff, overheid en spelers die willen checken.</p>
          </a>
          <a class="feature-card link-card" href="status.html">
            <h3>Serverstatus</h3>
            <p>Een nette statuspagina klaar voor live serverdata.</p>
          </a>
          <a class="feature-card link-card" href="support.html">
            <h3>Support</h3>
            <p>Vragen, reports of appeals gaan via de support Discord.</p>
          </a>
        </div>
      </section>

      <section class="band">
        <div class="container" style="text-align: center;">
          <p class="eyebrow">Klaar om te joinen</p>
          <h2 style="font-size: 2.5rem; margin-bottom: 1rem;">Amsterdam staat open.</h2>
          <p style="font-size: 1.2rem; margin-bottom: 2rem; max-width: 620px; margin-left: auto; margin-right: auto;">Pak de main Discord, lees de APV en kies je route. De rest van de site helpt je snel verder.</p>
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <a class="button primary" href="${discord.main}" target="_blank" rel="noopener">Join main server</a>
            <a class="button secondary" href="joinen.html">Hoe begin ik?</a>
          </div>
        </div>
      </section>`,
  },
  {
    id: "regels",
    file: "regels.html",
    title: "APV en Straffen",
    description: "Zoekbare APV van Amsterdam Roleplay met uitleg per strafcategorie.",
    eyebrow: "APV en straffen",
    heading: "APV zoeken en straffen snel vinden.",
    intro:
      "Alle APV-artikelen staan doorzoekbaar op deze pagina. Daaronder vind je direct wat Cat 0 t/m Cat 9 betekent.",
    actions: [button("Open APV bron", apvUrl, "primary", true), button("Open wetboek PDF", wetboekPdf, "secondary", true)],
    stats: [
      ["Artikelen", "65"],
      ["Categorieen", "0 t/m 9"],
      ["Variabel", "Context"],
    ],
    extraScripts: '<script src="assets/apv-rules.js"></script>',
    content: `
      <section class="container section">
        <div class="rules-toolbar">
          <label class="search-box">
            <span>Zoeken</span>
            <input id="ruleSearch" type="search" placeholder="Zoek op RDM, FailRP, categorie, artikel..." />
          </label>
          <div class="filter-row" aria-label="APV categorie filters">
            <button class="filter-chip is-active" data-category="all" type="button">Alles</button>
            <button class="filter-chip" data-category="1" type="button">Cat 1</button>
            <button class="filter-chip" data-category="2" type="button">Cat 2</button>
            <button class="filter-chip" data-category="3" type="button">Cat 3</button>
            <button class="filter-chip" data-category="4" type="button">Cat 4</button>
            <button class="filter-chip" data-category="5" type="button">Cat 5</button>
            <button class="filter-chip" data-category="6" type="button">Cat 6</button>
            <button class="filter-chip" data-category="7" type="button">Cat 7</button>
            <button class="filter-chip" data-category="8" type="button">Cat 8</button>
            <button class="filter-chip" data-category="9" type="button">Cat 9</button>
          </div>
        </div>
        <div class="rules-summary">
          <strong id="ruleCount">65 APV-regels</strong>
          <span>Gebruik zoeken voor artikelen, termen en sancties.</span>
        </div>
        <div class="rules-list" id="rulesList"></div>
      </section>

      <section class="container section slim">
        <div class="section-head">
          <p class="eyebrow">Strafcategorieen</p>
          <h2>Betekenis van Cat 0 t/m Cat 9.</h2>
        </div>
        <div class="category-scroll">
          <table class="category-table">
            <thead>
              <tr>
                <th>Categorie</th>
                <th>Sanctie</th>
                <th>Omschrijving</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><span class="cat-badge cat0">Categorie 0</span></td><td>Mondelinge waarschuwing</td><td>Informeel / eerste lichte fout, geen ban.</td></tr>
              <tr><td><span class="cat-badge cat1">Categorie 1</span></td><td>Waarschuwing + 20 taken</td><td>Kleine overtredingen: karakter breken, earrape, taal, lichte failRP.</td></tr>
              <tr><td><span class="cat-badge cat2">Categorie 2</span></td><td>30 taken taakstraf</td><td>Middelgroot: NLR, criminele basisregels, rippen zonder indicatie, gangwar basis.</td></tr>
              <tr><td><span class="cat-badge cat3">Categorie 3</span></td><td>50 taken taakstraf</td><td>Ernstig: powergamen, metagamen, stream sniping, AFK omzeilen, onder dreiging houden.</td></tr>
              <tr><td><span class="cat-badge cat4">Categorie 4</span></td><td>1 dag ban</td><td>Zeer ernstig: RDM, failRP structureel, NVOL, combatloggen, VDM meerdere slachtoffers.</td></tr>
              <tr><td><span class="cat-badge cat5">Categorie 5</span></td><td>2 dagen ban</td><td>Zwaar: schelden ziektes, toxiciteit, erotische RP, gang-warns, wraak op whitelisted jobs.</td></tr>
              <tr><td><span class="cat-badge cat6">Categorie 6</span></td><td>3 dagen ban</td><td>Structureel: streamers in kwaad daglicht, corruptie hulpdiensten, racisme, haatzaaien.</td></tr>
              <tr><td><span class="cat-badge cat7">Categorie 7</span></td><td>1 week ban</td><td>Extreem: combatgedrag alleen vechten, externe software, duplicatie-exploits.</td></tr>
              <tr><td><span class="cat-badge cat8">Categorie 8</span></td><td>Permanente verbanning</td><td>Economische fraude: IRL trade, startersgeld misbruik, alt-fraude, goederen weggeven.</td></tr>
              <tr><td><span class="cat-badge cat9">Categorie 9</span></td><td>Permanente ban + account wipe</td><td>Cheats, hacks, alt misbruik, bedreiging/doxing.</td></tr>
              <tr><td><span class="cat-badge cat-var">Variabel</span></td><td>Afhankelijk van context</td><td>Hoogte van de straf, /report gebruik, staff limiet, situationeel.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="band">
        <div class="container split">
          <div>
            <p class="eyebrow">Wetboek PDF</p>
            <h2>Wetboek van Strafrecht direct beschikbaar.</h2>
            <p class="muted">Het officiele wetboek als PDF. Gebruikt door staff en overheid als primaire referentie. Open, bekijk of download in een klik.</p>
            <ul style="margin: 1rem 0 0.5rem; padding-left: 1.15rem; color: var(--muted);">
              <li><strong>Volledig PDF:</strong> Complete tekst van het wetboek.</li>
              <li><strong>Direct referentie:</strong> Voor politie, justitie en staff.</li>
              <li><strong>Snel toegang:</strong> Open in nieuw venster of download.</li>
            </ul>
            <div style="margin-top:1rem; display:flex; gap:0.6rem; flex-wrap:wrap;">
              <a class="button primary" href="${wetboekPdf}" target="_blank" rel="noopener">Open wetboek PDF</a>
              <a class="button secondary" href="${wetboekPdf}" download>Download PDF</a>
            </div>
          </div>
          <div class="document-card" aria-hidden="true" style="display:flex;align-items:center;justify-content:center;">
            <div style="display:flex;align-items:center;gap:16px;max-width:360px;">
              <svg width="68" height="80" viewBox="0 0 68 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="68" height="80" rx="6" fill="var(--panel)" stroke="var(--line)"/>
                <path d="M18 22h32v6H18zM18 34h32v6H18zM18 46h24v6H18z" fill="var(--muted)"/>
                <rect x="44" y="8" width="10" height="12" rx="1" fill="var(--gold)"/>
              </svg>
              <div>
                <h3 style="margin:0 0 6px 0;">Wetboek van Strafrecht</h3>
                <p style="margin:0 0 8px 0; color:var(--muted);">13 pagina's - officiele referentie</p>
                <a class="text-link" href="${wetboekPdf}" target="_blank" rel="noopener">Bekijk in nieuw venster</a>
              </div>
            </div>
          </div>
        </div>
      </section>`,
  },
  {
    id: "vacatures",
    file: "vacatures.html",
    title: "Vacatures",
    description: "Werkende vacaturepagina met Discord-links voor overheid, staff en onderwereld.",
    eyebrow: "Vacatures",
    heading: "Solliciteer direct via Discord.",
    intro:
      "Kies je route en ga meteen naar de juiste Discord. Overheid loopt via de overheidserver en staff via de staff/support sollicitatie.",
    actions: [button("Overheid Discord", discord.overheid, "primary", true), button("Staff sollicitatie", discord.support, "secondary", true)],
    stats: [
      ["Overheid", "Discord join"],
      ["Staff", "Sollicitatie"],
      ["Onderwereld", "Aanvragen"],
    ],
    content: `
      <section class="container section">
        <div class="section-head">
          <p class="eyebrow">Open routes</p>
          <h2>Elke vacature heeft een werkende knop.</h2>
        </div>
        <div class="job-grid">
          <article class="job-card"><span>Overheid</span><h3>Politie Amsterdam</h3><p>Handhaving, meldingen, achtervolgingen, onderzoek en proces-verbalen.</p><ul><li>APV en wetboek kennen</li><li>Rustig communiceren</li><li>Teamplay</li></ul><div class="job-actions"><a href="${discord.overheid}" target="_blank" rel="noopener">Join overheid</a><a href="${discord.overheidKanaal}" target="_blank" rel="noopener">Open kanaal</a></div></article>
          <article class="job-card"><span>Overheid</span><h3>Ambulancezorg</h3><p>Medische roleplay met triage, behandeling, vervoer en nazorg.</p><ul><li>Geduldige RP</li><li>Scenario's uitspelen</li><li>Duidelijke porto</li></ul><div class="job-actions"><a href="${discord.overheid}" target="_blank" rel="noopener">Join overheid</a><a href="${discord.overheidKanaal}" target="_blank" rel="noopener">Open kanaal</a></div></article>
          <article class="job-card"><span>Overheid</span><h3>Pechhulp en ANWB</h3><p>Reparaties, sleepdiensten, tuning en hulp onderweg.</p><ul><li>Actief op straat</li><li>Klantgericht</li><li>Voertuigkennis</li></ul><div class="job-actions"><a href="${discord.overheid}" target="_blank" rel="noopener">Join overheid</a><a href="${discord.overheidKanaal}" target="_blank" rel="noopener">Open kanaal</a></div></article>
          <article class="job-card"><span>Team</span><h3>Staffteam</h3><p>Reports behandelen, bewijs beoordelen en spelers helpen.</p><ul><li>Neutraal blijven</li><li>Regels consequent toepassen</li><li>Goed kunnen uitleggen</li></ul><div class="job-actions"><a href="${discord.support}" target="_blank" rel="noopener">Staff sollicitatie</a></div></article>
          <article class="job-card"><span>Onderwereld</span><h3>Criminele organisatie</h3><p>Bouw een groep met stijl, grenzen en scenario's die binnen de APV passen.</p><ul><li>Onderwereldregels kennen</li><li>Scenario's opbouwen</li><li>Bewijs bewaren</li></ul><div class="job-actions"><a href="${discord.onderwereld}" target="_blank" rel="noopener">Join onderwereld</a></div></article>
        </div>
      </section>

      <section class="band">
        <div class="container split">
          <div>
            <p class="eyebrow">Overheid</p>
            <h2>Gebruik de overheidserver voor dienstaanvragen.</h2>
            <p>De overheidlink en het kanaal zijn beide toegevoegd. Spelers kunnen direct naar de server of naar het opgegeven Discord-kanaal.</p>
          </div>
          <ol class="timeline">
            <li><strong>1. Join de juiste Discord</strong><span>Overheid, staff, main of onderwereld.</span></li>
            <li><strong>2. Lees APV en wetboek</strong><span>Vooral overheid moet de strafregels kennen.</span></li>
            <li><strong>3. Dien je sollicitatie in</strong><span>Gebruik de aangewezen intake- of ticketroute.</span></li>
            <li><strong>4. Wacht op beoordeling</strong><span>Staff of leiding neemt contact op.</span></li>
          </ol>
        </div>
      </section>`,
  },
  {
    id: "status",
    file: "status.html",
    title: "Serverstatus",
    description: "Serverstatuspagina voor Amsterdam Roleplay met capaciteit, restartinformatie en Discord-routes.",
    eyebrow: "Live status",
    heading: "Serverdashboard voor Amsterdam Roleplay.",
    intro:
      "Bekijk bereikbaarheid, capaciteit en connectinformatie. De serverknoppen staan overal onder Servers in de navigatie.",
    actions: [button("Join main", discord.main, "primary", true), button("Support", discord.support, "secondary", true)],
    stats: [
      ["Status", "Dashboard"],
      ["Update", "15 sec"],
      ["Servers", "4 routes"],
    ],
    content: `
      <section class="container section status-dashboard" data-status-widget>
        <div class="status-main">
          <div class="status-signal" aria-hidden="true"><span></span><span></span><span></span></div>
          <p class="eyebrow">Amsterdam Roleplay</p>
          <h2 id="serverState">Dashboard gereed voor serverdata</h2>
          <p>Totdat een FiveM-endpoint is ingesteld toont deze pagina een duidelijke handmatige status, connectadvies en laatste update.</p>
          <div class="status-actions">
            <a class="button primary" href="${discord.main}" target="_blank" rel="noopener">Main Discord</a>
            <a class="button secondary" href="${discord.support}" target="_blank" rel="noopener">Support Discord</a>
          </div>
        </div>
        <div class="status-cards">
          <article><span>Nu online</span><strong data-status="players">Niet gekoppeld</strong><small>koppel FiveM endpoint</small></article>
          <article><span>Capaciteit</span><strong data-status="capacity">Niet gekoppeld</strong><small>max spelers via endpoint</small></article>
          <article><span>Bezetting</span><strong data-status="fill">-</strong><small>wordt automatisch berekend</small></article>
          <article><span>Laatste update</span><strong data-status="updated">-</strong><small>lokale tijd</small></article>
        </div>
      </section>

      <section class="container section slim">
        <div class="server-grid">
          <a class="feature-card link-card" href="${discord.main}" target="_blank" rel="noopener"><h3>Main</h3><p>Algemene server en community.</p></a>
          <a class="feature-card link-card" href="${discord.support}" target="_blank" rel="noopener"><h3>Support</h3><p>Tickets en staff sollicitaties.</p></a>
          <a class="feature-card link-card" href="${discord.overheid}" target="_blank" rel="noopener"><h3>Overheid</h3><p>Politie, ambulance en pechhulp.</p></a>
          <a class="feature-card link-card" href="${discord.onderwereld}" target="_blank" rel="noopener"><h3>Onderwereld</h3><p>Criminele routes en aanvragen.</p></a>
        </div>
      </section>`,
  },
  {
    id: "informatie",
    file: "informatie.html",
    title: "Informatie",
    description: "Informatiepagina voor Amsterdam Roleplay Easy Weapons met servers, rollen en verwachtingen.",
    eyebrow: "Informatie",
    heading: "Alles over de stad en routes.",
    intro:
      "Een overzicht voor spelers die willen weten welke servers, rollen en wetboek belangrijk zijn voor Amsterdam Roleplay.",
    actions: [button("Join main", discord.main, "primary", true), button("Open wetboek", wetboekPdf, "secondary", true)],
    stats: [
      ["Routes", "Legaal en illegaal"],
      ["Community", "Easy Weapons"],
      ["Support", "Discord"],
    ],
    content: `
      <section class="container section">
        <div class="section-head">
          <p class="eyebrow">Stadsoverzicht</p>
          <h2>De kern van Amsterdam Roleplay.</h2>
        </div>
        <div class="info-layout">
          <article class="feature-card wide"><h3>Burgers</h3><p>Maak een karakter met doelen, werk, relaties en plekken waar andere spelers op kunnen reageren.</p></article>
          <article class="feature-card wide"><h3>Overheid</h3><p>Politie, ambulance en pechhulp gebruiken de overheidserver voor intake en communicatie.</p></article>
          <article class="feature-card wide"><h3>Onderwereld</h3><p>Criminele roleplay draait om opbouw, spanning, bewijs en consequenties. De APV blijft leidend.</p></article>
          <article class="feature-card wide"><h3>Wetboek</h3><p>APV en Wetboek van Strafrecht vormen de basis voor staff, overheid en spelers.</p></article>
        </div>
      </section>

      <section class="band">
        <div class="container split">
          <div>
            <p class="eyebrow">Voor je begint</p>
            <h2>Drie dingen die elke speler moet doen.</h2>
          </div>
          <ol class="timeline">
            <li><strong>Lees de APV</strong><span>Ken de basis rond RDM, VDM, FailRP, NVOL en metagame.</span></li>
            <li><strong>Check het wetboek</strong><span>Voor overheid en scenario's zijn straffen belangrijk.</span></li>
            <li><strong>Join de juiste Discord</strong><span>Main, support, overheid of onderwereld.</span></li>
          </ol>
        </div>
      </section>`,
  },
  {
    id: "joinen",
    file: "joinen.html",
    title: "Joinen",
    description: "Startgids om Amsterdam Roleplay te joinen via FiveM en Discord.",
    eyebrow: "Joinen",
    heading: "Van installatie naar de server.",
    intro:
      "Een startpagina voor nieuwe spelers met uitleg over FiveM, APV, characterbouw en de juiste Discord-routes.",
    actions: [button("Join main server", discord.main, "primary", true), button("APV openen", "regels.html", "secondary")],
    stats: [
      ["Stap 1", "Installeren"],
      ["Stap 2", "APV lezen"],
      ["Stap 3", "Joinen"],
    ],
    content: `
      <section class="band">
        <div class="container" style="text-align: center;">
          <p class="eyebrow">Snelle Connect</p>
          <p style="margin-bottom: 0.75rem; font-size: 0.9rem;">Plak in FiveM:</p>
          <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.4rem; padding: 0.7rem; font-family: monospace; font-size: 0.85rem; word-break: break-all; margin: 0 auto 0.5rem; max-width: 350px; cursor: pointer;" onclick="navigator.clipboard.writeText('connect 185.229.35.13'); alert('Gekopieerd!');">
            <code>connect 185.229.35.13</code>
          </div>
          <p style="font-size: 0.8rem; color: var(--muted);">Klik om te kopiëren</p>
        </div>
      </section>

      <section class="container section">
        <div class="section-head">
          <p class="eyebrow">Startgids</p>
          <h2>Begin netjes, speel sterker.</h2>
        </div>
        <div class="guide-list">
          <article><span>01</span><div><h3>Installeer FiveM</h3><p>Zorg voor een werkende GTA V-installatie, FiveM-client en een stabiele microfoon.</p></div></article>
          <article><span>02</span><div><h3>Join de main Discord</h3><p>Gebruik de serverknop om updates, regels en communityinformatie te volgen.</p></div></article>
          <article><span>03</span><div><h3>Lees APV en wetboek</h3><p>Regels over RDM, VDM, FailRP, wapens en straffen bepalen wat kan.</p></div></article>
          <article><span>04</span><div><h3>Maak een character</h3><p>Bedenk naam, achtergrond, doelen en gedrag voordat je grote scenario's zoekt.</p></div></article>
        </div>
      </section>

      <section class="container section slim">
        <div class="card-grid three">
          <article class="feature-card"><h3>In character</h3><p>Je reageert vanuit je personage en niet vanuit wat jij als speler weet.</p></article>
          <article class="feature-card"><h3>Value of life</h3><p>Je personage wil overleven en neemt dreiging serieus.</p></article>
          <article class="feature-card"><h3>Easy Weapons</h3><p>Wapenbezit en gebruik hebben duidelijke gevolgen in APV en wetboek.</p></article>
        </div>
      </section>`,
  },
  {
    id: "support",
    file: "support.html",
    title: "Support",
    description: "Supportpagina voor Amsterdam Roleplay met tickettypes en support Discord-link.",
    eyebrow: "Support",
    heading: "Support loopt via Discord.",
    intro:
      "Gebruik de supportserver voor tickets, reports, refunds, ban appeals, bugs en staff sollicitaties.",
    actions: [button("Join support", discord.support, "primary", true), button("APV checken", "regels.html", "secondary")],
    stats: [
      ["Tickets", "Support"],
      ["Staff", "Sollicitatie"],
      ["Bewijs", "Clips"],
    ],
    content: `
      <section class="container section">
        <div class="section-head">
          <p class="eyebrow">Tickettypes</p>
          <h2>Sneller geholpen met de juiste informatie.</h2>
        </div>
        <div class="card-grid three">
          <article class="feature-card"><h3>Report speler</h3><p>Gebruik clips, tijdstip, betrokken spelers en korte uitleg van de situatie.</p></article>
          <article class="feature-card"><h3>Refund</h3><p>Geef bewijs van verlies, oorzaak en exacte items of bedrag.</p></article>
          <article class="feature-card"><h3>Ban appeal</h3><p>Leg uit wat er gebeurde, wat je begrijpt van de sanctie en waarom staff opnieuw moet kijken.</p></article>
          <article class="feature-card"><h3>Bugmelding</h3><p>Beschrijf stappen om de bug te herhalen, locatie en screenshots.</p></article>
          <article class="feature-card"><h3>Staff sollicitatie</h3><p>Gebruik de staff sollicitatie-link naar de supportserver.</p></article>
          <article class="feature-card"><h3>Algemene vraag</h3><p>Voor uitleg over APV, verbinden, roleplay of communityzaken.</p></article>
        </div>
      </section>

      <section class="band">
        <div class="container split">
          <div>
            <p class="eyebrow">Supportflow</p>
            <h2>Van melding naar besluit.</h2>
          </div>
          <ol class="timeline">
            <li><strong>Join support Discord</strong><span>Gebruik de knop bovenaan.</span></li>
            <li><strong>Maak het juiste ticket</strong><span>Kies report, refund, appeal, bug of sollicitatie.</span></li>
            <li><strong>Voeg bewijs toe</strong><span>Clips en details maken beoordeling eerlijker.</span></li>
            <li><strong>Wacht op staff</strong><span>Staff sluit af met beslissing of vervolgvraag.</span></li>
          </ol>
        </div>
      </section>`,
  },
  {
    id: "faq",
    file: "faq.html",
    title: "FAQ",
    description: "Veelgestelde vragen voor nieuwe spelers van Amsterdam Roleplay.",
    eyebrow: "FAQ",
    heading: "Veelgestelde vragen voor nieuwe spelers.",
    intro:
      "Snel antwoord op de belangrijkste vragen over joinen, Discord, APV, vacatures, support en wetboek.",
    actions: [button("Join main server", discord.main, "primary", true), button("APV lezen", "regels.html", "secondary")],
    stats: [
      ["Start", "Joinen + Discord"],
      ["Lezen", "APV + wetboek"],
      ["Hulp", "Support"],
    ],
    content: `
      <section class="container section">
        <div class="section-head">
          <p class="eyebrow">Nieuwe spelers</p>
          <h2>Alles wat je eerst wilt weten.</h2>
        </div>
        <div class="faq-list">
          <details open><summary>Hoe join ik Amsterdam Roleplay?</summary><p>Installeer FiveM, zorg dat GTA V werkt, join de main Discord en zoek Amsterdam Roleplay in FiveM. Gebruik de serverknop als startpunt.</p></details>
          <details><summary>Welke Discord moet ik joinen?</summary><p>Main is voor de community, Support voor tickets en staff sollicitaties, Overheid voor politie/ambulance/pechhulp en Onderwereld voor criminele routes.</p></details>
          <details><summary>Moet ik de APV lezen?</summary><p>Ja. De APV bepaalt wat wel en niet mag. Lees vooral regels over RDM, VDM, FailRP, combatloggen, wapens en overvallen.</p></details>
          <details><summary>Waar vind ik het wetboek?</summary><p>Het Wetboek van Strafrecht staat direct als PDF klaar vanaf deze site. De belangrijkste straffen staan ook op de APV-pagina.</p></details>
          <details><summary>Hoe solliciteer ik voor overheid?</summary><p>Ga naar Vacatures en gebruik de overheidknop of het overheidkanaal. Politie, ambulance en pechhulp lopen via de overheidserver.</p></details>
          <details><summary>Hoe solliciteer ik voor staff?</summary><p>Gebruik de staff sollicitatieknop op Vacatures of de supportserver. Zorg dat je rustig kunt uitleggen, bewijs kunt beoordelen en regels kent.</p></details>
          <details><summary>Waar maak ik een ticket?</summary><p>Tickets lopen via de supportserver. Voeg clips, tijdstip, betrokken spelers en een korte uitleg toe.</p></details>
          <details><summary>Wat doe ik als ik nieuw ben in RP?</summary><p>Begin simpel: maak een character, zoek normaal werk of interactie, lees de APV en vraag support als je iets niet begrijpt.</p></details>
        </div>
      </section>

      <section class="band">
        <div class="container split">
          <div>
            <p class="eyebrow">Checklist</p>
            <h2>Voor je eerste sessie.</h2>
          </div>
          <ol class="timeline">
            <li><strong>FiveM werkt</strong><span>GTA V, FiveM en microfoon zijn klaar.</span></li>
            <li><strong>Discord joined</strong><span>Main server en eventueel support/overheid/onderwereld.</span></li>
            <li><strong>APV gelezen</strong><span>Basisregels en wapengebruik zijn duidelijk.</span></li>
            <li><strong>Character klaar</strong><span>Naam, achtergrond en doel zijn bedacht.</span></li>
          </ol>
        </div>
      </section>`,
  },
];

for (const page of pages) {
  fs.writeFileSync(path.join(outDir, page.file), pageShell(page), "utf8");
}

fs.writeFileSync(
  path.join(outDir, "styles.css"),
  `:root {
  --bg: #f6fbff;
  --bg-deep: #e8f6ff;
  --panel: #ffffff;
  --panel-2: #edf8ff;
  --text: #071b2f;
  --muted: #5c7184;
  --soft: #173652;
  --blue: #225f9f;
  --cyan: #2ea8c9;
  --gold: #f1ba58;
  --green: #2fb76e;
  --line: rgba(7, 27, 47, 0.13);
  --line-strong: rgba(46, 168, 201, 0.38);
  --shadow: 0 24px 70px rgba(20, 73, 110, 0.14);
  --body-glow: rgba(241, 186, 88, 0.22);
  --body-end: #ffffff;
  --header-bg: rgba(255, 255, 255, 0.88);
  --hero-eyebrow: #9feaf6;
  --hero-h1: #ffffff;
  --button-primary-start: #70d9e7;
  --button-primary-text: #051a2d;
  --nav-servers-text: var(--text);
  --skip-link-text: var(--text);
  --guide-badge-text: var(--text);
  --nav-link: rgba(7, 27, 47, 0.72);
  --nav-hover-bg: rgba(46, 168, 201, 0.1);
  --menu-bg: rgba(255, 255, 255, 0.98);
  --menu-panel-bg: rgba(46, 168, 201, 0.06);
  --hero-bg: linear-gradient(180deg, #f8fcff 0%, #ffffff 100%);
  --banner-bg: #061525;
  --lead: rgba(7, 27, 47, 0.72);
  --card-bg: rgba(255, 255, 255, 0.82);
  --card-bg-soft: rgba(255, 255, 255, 0.76);
  --field-bg: rgba(255, 255, 255, 0.9);
  --panel-glass: rgba(255, 255, 255, 0.78);
  --metric-bg: rgba(255, 255, 255, 0.62);
  --secondary-bg: rgba(255, 255, 255, 0.76);
  --band-bg: rgba(46, 168, 201, 0.06);
  --ghost-text: #684611;
  --gold-chip-text: #735015;
  --theme-toggle-bg: rgba(46, 168, 201, 0.08);
  color-scheme: light;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  scroll-behavior: smooth;
}

:root[data-theme="dark"] {
  --bg: #0b1014;
  --bg-deep: #050708;
  --panel: #111a1f;
  --panel-2: #16262b;
  --text: #f5f9ff;
  --muted: #9db2c7;
  --soft: #d9ebf8;
  --blue: #72c9ff;
  --cyan: #57d5e8;
  --gold: #f1be67;
  --green: #4bd38a;
  --line: rgba(217, 235, 248, 0.14);
  --line-strong: rgba(87, 213, 232, 0.34);
  --shadow: 0 26px 90px rgba(0, 0, 0, 0.35);
  --body-glow: rgba(87, 213, 232, 0.1);
  --body-end: #0b1014;
  --header-bg: rgba(3, 9, 19, 0.78);
  --nav-link: rgba(245, 249, 255, 0.78);
  --nav-hover-bg: rgba(255, 255, 255, 0.07);
  --menu-bg: rgba(7, 17, 31, 0.98);
  --menu-panel-bg: rgba(255, 255, 255, 0.04);
  --hero-bg: linear-gradient(180deg, #07111f 0%, #0b1014 100%);
  --banner-bg: #02070d;
  --lead: rgba(245, 249, 255, 0.82);
  --card-bg: rgba(17, 26, 31, 0.88);
  --card-bg-soft: rgba(17, 26, 31, 0.76);
  --field-bg: rgba(255, 255, 255, 0.06);
  --panel-glass: rgba(9, 27, 43, 0.82);
  --metric-bg: rgba(3, 9, 19, 0.35);
  --secondary-bg: rgba(255, 255, 255, 0.07);
  --band-bg: rgba(87, 213, 232, 0.04);
  --ghost-text: #fff0c5;
  --gold-chip-text: #ffdb9a;
  --theme-toggle-bg: rgba(87, 213, 232, 0.08);
  color-scheme: dark;
}

* { box-sizing: border-box; }
body { margin: 0; background: radial-gradient(circle at top right, var(--body-glow), transparent 34%), linear-gradient(180deg, var(--bg-deep), var(--bg) 42%, var(--body-end)); color: var(--text); }
a { color: inherit; text-decoration: none; }
a:focus-visible, button:focus-visible, input:focus-visible { outline: 3px solid rgba(87, 213, 232, 0.72); outline-offset: 3px; }
p, h1, h2, h3, dl, dd, ol, ul { margin: 0; }
ul, ol { padding-left: 1.2rem; }
.container { width: min(1200px, calc(100% - 32px)); margin: 0 auto; }
  .skip-link { position: fixed; left: 16px; top: 16px; z-index: 100; transform: translateY(-140%); border-radius: 8px; padding: 10px 14px; color: var(--skip-link-text); background: var(--gold); font-weight: 900; transition: transform 160ms ease; }
.skip-link:focus { transform: translateY(0); }

.site-header { position: sticky; top: 0; z-index: 30; border-bottom: 1px solid var(--line); background: var(--header-bg); backdrop-filter: blur(18px); }
.nav { min-height: 78px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.brand { display: inline-flex; align-items: center; gap: 12px; min-width: 0; }
.brand img { width: 48px; height: 48px; object-fit: contain; border-radius: 50%; filter: drop-shadow(0 10px 22px rgba(87, 213, 232, 0.18)); }
.brand strong, .brand small { display: block; line-height: 1.1; }
.brand strong { font-size: 1rem; }
.brand small { margin-top: 5px; color: var(--muted); font-size: 0.72rem; }
.nav-links { display: flex; align-items: center; gap: 6px; }
.nav-links a, .nav-more > button, .theme-toggle { min-height: 42px; border: 0; border-radius: 8px; padding: 11px 13px; color: var(--nav-link); background: transparent; font: inherit; font-size: 0.88rem; font-weight: 800; cursor: pointer; }
.nav-links a:hover, .nav-links a.is-active, .nav-more > button:hover, .theme-toggle:hover { background: var(--nav-hover-bg); color: var(--text); }
.nav-more { position: relative; }
  .nav-servers > button { color: var(--nav-servers-text); background: linear-gradient(135deg, var(--gold), var(--gold-chip-text)); border: 1px solid rgba(241, 190, 103, 0.38); }
  .nav-servers > button:hover { background: linear-gradient(135deg, var(--gold-chip-text), #fff0bf); color: var(--nav-servers-text); }
.theme-toggle { display: inline-flex; align-items: center; gap: 9px; border: 1px solid var(--line); background: var(--theme-toggle-bg); }
.theme-dot { width: 14px; height: 14px; border-radius: 999px; background: linear-gradient(135deg, var(--cyan), var(--gold)); box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.42); }
.more-menu { position: absolute; right: 0; top: calc(100% + 10px); min-width: 190px; padding: 8px; border: 1px solid var(--line); border-radius: 8px; background: var(--menu-bg); box-shadow: var(--shadow); display: none; }
.nav-more:hover .more-menu, .nav-more.is-open .more-menu { display: grid; gap: 4px; }
.more-menu a { display: block; }
.menu-toggle { display: none; width: 42px; height: 42px; border: 1px solid var(--line); border-radius: 8px; background: var(--theme-toggle-bg); padding: 9px; }
.menu-toggle span { display: block; height: 2px; margin: 5px 0; border-radius: 999px; background: var(--text); }

.page-hero { position: relative; min-height: 560px; display: flex; overflow: hidden; border-bottom: 1px solid var(--line); background: var(--banner-bg); }
.hero-bg, .hero-photo-shade { position: absolute; inset: 0; }
.hero-bg { background-image: url("assets/banner-amsterdam-roleplay.webp"); background-size: cover; background-position: center; transform: scale(1.01); }
.hero-photo-shade { background: linear-gradient(90deg, rgba(2, 7, 13, 0.98) 0%, rgba(2, 7, 13, 0.94) 36%, rgba(2, 7, 13, 0.62) 54%, rgba(2, 7, 13, 0.16) 78%, rgba(2, 7, 13, 0.04) 100%), linear-gradient(0deg, rgba(2, 7, 13, 0.55) 0%, rgba(2, 7, 13, 0.1) 42%, rgba(2, 7, 13, 0) 72%); }
.hero-inner { position: relative; z-index: 1; display: block; padding: clamp(58px, 8vh, 88px) 0 104px; }
.hero-copy-block { max-width: 680px; }
.eyebrow { color: var(--blue); font-size: 0.76rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
  .page-hero .eyebrow { color: var(--hero-eyebrow); text-shadow: 0 2px 18px rgba(0, 0, 0, 0.38); }
h1 { margin-top: 14px; color: var(--text); font-size: clamp(2.8rem, 6.2vw, 5.8rem); line-height: 0.96; letter-spacing: 0; }
  .page-hero h1 { max-width: 720px; color: var(--hero-h1); font-size: clamp(2.65rem, 4.55vw, 4.85rem); line-height: 0.98; text-shadow: 0 14px 44px rgba(0, 0, 0, 0.55); }
  .page-hero h1 span { display: block; }
.hero-lead { max-width: 610px; margin-top: 18px; color: rgba(255, 255, 255, 0.9); font-size: clamp(1rem, 1.55vw, 1.18rem); line-height: 1.58; text-shadow: 0 8px 30px rgba(0, 0, 0, 0.46); }
.hero-actions { display: flex; flex-wrap: nowrap; gap: 12px; margin-top: 24px; }
@media (max-width: 820px) {
  .hero-actions { flex-wrap: wrap; }
}
.button { min-height: 48px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; padding: 13px 18px; font-weight: 900; transition: transform 180ms ease, border-color 180ms ease, background 180ms ease; }
.button:hover { transform: translateY(-2px); }
  .button.primary { color: var(--button-primary-text); background: linear-gradient(135deg, var(--button-primary-start), var(--gold)); box-shadow: 0 16px 42px rgba(46, 168, 201, 0.22); }
.button.secondary { border: 1px solid var(--line); background: var(--secondary-bg); color: var(--text); }
.button.ghost { border: 1px solid rgba(241, 186, 88, 0.62); color: var(--ghost-text); background: rgba(241, 186, 88, 0.12); }
.page-hero .button.ghost { color: #ffe5a8; background: rgba(3, 9, 19, 0.52); border-color: rgba(241, 186, 88, 0.76); }
.section { padding: 42px 0; }
.section.slim { padding-top: 6px; }
.section-head { display: flex; justify-content: space-between; align-items: end; gap: 20px; margin-bottom: 16px; }
h2 { margin-top: 7px; font-size: clamp(1.85rem, 3.6vw, 3.35rem); line-height: 1.04; letter-spacing: 0; }
h3 { color: var(--text); font-size: 1.1rem; }
p { color: var(--muted); line-height: 1.62; }
.card-grid { display: grid; gap: 14px; }
.card-grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.card-grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.card-grid.four { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.feature-card, .job-card, .law-card, .document-card, .status-cards article, .text-panel { border: 1px solid var(--line); border-radius: 8px; background: var(--card-bg); box-shadow: var(--shadow); }
.feature-card { min-height: 162px; padding: 20px; }
.feature-card.wide { min-height: 128px; }
.feature-card p, .job-card p, .law-card p { margin-top: 8px; font-size: 0.95rem; }
.link-card { display: block; transition: transform 180ms ease, border-color 180ms ease; }
.link-card:hover { transform: translateY(-4px); border-color: var(--line-strong); }
.card-index { display: inline-grid; place-items: center; min-width: 42px; height: 32px; margin-bottom: 20px; border-radius: 7px; background: rgba(46, 168, 201, 0.12); color: var(--blue); font-size: 0.76rem; font-weight: 900; }
.band { padding: 34px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); background: linear-gradient(135deg, var(--band-bg) 0%, var(--band-bg) 100%); }
.band:nth-of-type(even) { background: var(--bg); border-color: transparent; }
.band h2 { color: var(--text); }
.band p { color: var(--muted); }
.band .container > div { max-width: 100%; margin: 0 auto; }
.band-dark { background: var(--bg-deep); }
.band-light { background: var(--bg); }
.quick-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 20px; }
.quick-steps div { min-height: 86px; border: 1px solid var(--line); border-radius: 8px; padding: 16px; background: var(--card-bg-soft); box-shadow: var(--shadow); }
.quick-steps p { color: var(--muted); font-size: 0.78rem; font-weight: 900; text-transform: uppercase; }
.quick-steps h3 { margin-top: 8px; font-size: 1.22rem; }
.split { display: grid; grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr); gap: 54px; align-items: center; }
.metric-panel { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.metric-panel div { min-height: 118px; border: 1px solid var(--line); border-radius: 8px; padding: 20px; background: var(--metric-bg); }
.metric-panel span { color: var(--muted); font-size: 0.76rem; font-weight: 900; text-transform: uppercase; }
.metric-panel strong { display: block; margin-top: 12px; font-size: 1.2rem; }

.server-grid, .law-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.law-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.law-card { min-height: 220px; padding: 24px; }
.law-card span { color: var(--gold); font-size: 0.74rem; font-weight: 900; text-transform: uppercase; }
.law-card h3 { margin-top: 12px; }
.category-scroll { overflow-x: auto; border: 1px solid var(--line); border-radius: 8px; background: var(--card-bg); box-shadow: var(--shadow); }
.category-table { width: 100%; min-width: 780px; border-collapse: collapse; }
.category-table th, .category-table td { padding: 16px 18px; text-align: left; border-bottom: 1px solid var(--line); vertical-align: top; }
.category-table th { color: var(--blue); background: rgba(46, 168, 201, 0.1); font-size: 0.78rem; text-transform: uppercase; }
.category-table td:first-child, .category-table td:nth-child(2) { color: var(--text); font-weight: 900; }
.category-table tr:last-child td { border-bottom: 0; }
.category-table tbody tr:nth-child(even) { background: rgba(46, 168, 201, 0.045); }
.document-card { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 24px; align-items: center; padding: 30px; }
.text-link { color: var(--cyan); font-weight: 900; }
.faq-list { display: grid; gap: 12px; }
.faq-list details { border: 1px solid var(--line); border-radius: 8px; background: var(--card-bg-soft); overflow: hidden; box-shadow: var(--shadow); }
.faq-list summary { cursor: pointer; padding: 18px 20px; color: var(--text); font-weight: 900; }
.faq-list p { padding: 0 20px 20px; }

.rules-toolbar { position: sticky; top: 90px; z-index: 10; display: grid; gap: 12px; padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: var(--field-bg); backdrop-filter: blur(18px); box-shadow: var(--shadow); }
.search-box { display: grid; gap: 8px; }
.search-box span { color: var(--muted); font-size: 0.76rem; font-weight: 900; text-transform: uppercase; }
.search-box input { width: 100%; min-height: 50px; border: 1px solid var(--line); border-radius: 8px; padding: 0 15px; color: var(--text); background: var(--field-bg); font: inherit; outline: none; }
.search-box input:focus { border-color: var(--line-strong); }
.filter-row { display: flex; flex-wrap: wrap; gap: 8px; }
.filter-chip { border: 1px solid var(--line); border-radius: 999px; padding: 9px 12px; color: var(--muted); background: var(--secondary-bg); font: inherit; font-size: 0.82rem; font-weight: 900; cursor: pointer; }
.filter-chip[data-category="all"] { color: var(--text); background: rgba(46, 168, 201, 0.12); border-color: rgba(46, 168, 201, 0.25); }
.filter-chip[data-category="1"] { color: #165642; background: rgba(160, 229, 198, 0.32); border-color: rgba(160, 229, 198, 0.45); }
.filter-chip[data-category="2"] { color: #15476d; background: rgba(160, 204, 236, 0.32); border-color: rgba(160, 204, 236, 0.45); }
.filter-chip[data-category="3"] { color: #6f4a21; background: rgba(243, 217, 164, 0.42); border-color: rgba(243, 217, 164, 0.6); }
.filter-chip[data-category="4"] { color: #66282a; background: rgba(244, 179, 179, 0.42); border-color: rgba(244, 179, 179, 0.6); }
.filter-chip[data-category="5"] { color: #4b2d6e; background: rgba(216, 177, 235, 0.42); border-color: rgba(216, 177, 235, 0.6); }
.filter-chip[data-category="6"] { color: #16455f; background: rgba(165, 207, 221, 0.42); border-color: rgba(165, 207, 221, 0.6); }
.filter-chip[data-category="7"] { color: #1b5f43; background: rgba(183, 223, 196, 0.42); border-color: rgba(183, 223, 196, 0.6); }
.filter-chip[data-category="8"] { color: #6a4a18; background: rgba(242, 216, 154, 0.42); border-color: rgba(242, 216, 154, 0.6); }
.filter-chip[data-category="9"] { color: #6a2f3f; background: rgba(246, 184, 188, 0.42); border-color: rgba(246, 184, 188, 0.6); }
.filter-chip.is-active { color: #06111f; background: var(--gold); border-color: var(--gold); }
.category-table .cat-badge { display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; padding: 8px 14px; font-size: 0.88rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.01em; }
.category-table .cat0 { color: #10334c; background: #d4e4ec; }
.category-table .cat1 { color: #1d5d4d; background: #c7eee0; }
.category-table .cat2 { color: #113d62; background: #c3ddf0; }
.category-table .cat3 { color: #634b24; background: #f3ddb0; }
.category-table .cat4 { color: #6d282b; background: #f4c3c3; }
.category-table .cat5 { color: #3f2660; background: #d8b8eb; }
.category-table .cat6 { color: #164760; background: #c9dfe7; }
.category-table .cat7 { color: #1f5f44; background: #c6e3cd; }
.category-table .cat8 { color: #6d5318; background: #f2dbb2; }
.category-table .cat9 { color: #6d2f3f; background: #f6b5c0; }
.category-table .cat-var { color: #2f4b63; background: #d6e3ed; }
.rules-summary { display: flex; justify-content: space-between; gap: 16px; margin: 24px 0; color: var(--muted); }
.rules-summary strong { color: var(--text); }
.rules-list { display: grid; gap: 12px; }
.rule-card { border: 1px solid var(--line); border-radius: 8px; overflow: hidden; background: var(--card-bg); box-shadow: var(--shadow); }
.rule-card summary { list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 18px; cursor: pointer; }
.rule-card summary::-webkit-details-marker { display: none; }
.rule-title { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.rule-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.rule-badge { display: inline-flex; align-items: center; justify-content: center; min-height: 28px; border-radius: 999px; padding: 0 12px; font-size: 0.78rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.01em; }
.rule-num { display: inline-grid; place-items: center; min-width: 74px; min-height: 30px; border-radius: 999px; background: rgba(46, 168, 201, 0.12); color: var(--blue); font-size: 0.78rem; font-weight: 900; }
.rule-sanction { flex: 0 0 auto; border-radius: 999px; padding: 8px 11px; background: rgba(241, 186, 88, 0.18); color: var(--gold-chip-text); font-size: 0.78rem; font-weight: 900; }
.rule-sanction.cat0 { color: #10334c; background: #d4e4ec; }
.rule-sanction.cat1 { color: #1d5d4d; background: #c7eee0; }
.rule-sanction.cat2 { color: #113d62; background: #c3ddf0; }
.rule-sanction.cat3 { color: #634b24; background: #f3ddb0; }
.rule-sanction.cat4 { color: #6d282b; background: #f4c3c3; }
.rule-sanction.cat5 { color: #3f2660; background: #d8b8eb; }
.rule-sanction.cat6 { color: #164760; background: #c9dfe7; }
.rule-sanction.cat7 { color: #1f5f44; background: #c6e3cd; }
.rule-sanction.cat8 { color: #6d5318; background: #f2dbb2; }
.rule-sanction.cat9 { color: #6d2f3f; background: #f6b5c0; }
.rule-sanction.catvar { color: #2f4b63; background: #d6e3ed; }
.rule-body { padding: 0 18px 20px; color: var(--muted); }
.rule-badge.cat0 { color: #10334c; background: #d4e4ec; }
.rule-badge.cat1 { color: #1d5d4d; background: #c7eee0; }
.rule-badge.cat2 { color: #113d62; background: #c3ddf0; }
.rule-badge.cat3 { color: #634b24; background: #f3ddb0; }
.rule-badge.cat4 { color: #6d282b; background: #f4c3c3; }
.rule-badge.cat5 { color: #3f2660; background: #d8b8eb; }
.rule-badge.cat6 { color: #164760; background: #c9dfe7; }
.rule-badge.cat7 { color: #1f5f44; background: #c6e3cd; }
.rule-badge.cat8 { color: #6d5318; background: #f2dbb2; }
.rule-badge.cat9 { color: #6d2f3f; background: #f6b5c0; }
.rule-badge.catvar { color: #2f4b63; background: #d6e3ed; }
.rule-body p { margin-top: 12px; }
.rule-body strong { color: var(--soft); }

.job-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.job-card { padding: 24px; min-height: 330px; display: flex; flex-direction: column; }
.job-card span { color: var(--gold); font-size: 0.74rem; font-weight: 900; text-transform: uppercase; }
.job-card h3 { margin-top: 14px; }
.job-card ul { margin-top: 16px; color: var(--muted); line-height: 1.7; }
.job-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: auto; padding-top: 20px; }
.job-actions a, .job-card > a { border: 1px solid var(--line-strong); border-radius: 8px; padding: 9px 11px; color: var(--blue); background: rgba(46, 168, 201, 0.09); font-weight: 900; }
.timeline { display: grid; gap: 10px; list-style: none; padding: 0; }
.timeline li { border: 1px solid var(--line); border-radius: 8px; padding: 18px; background: var(--card-bg-soft); }
.timeline strong, .timeline span { display: block; }
.timeline span { margin-top: 6px; color: var(--muted); }

.status-dashboard { display: grid; grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr); gap: 16px; align-items: stretch; }
.status-main { position: relative; overflow: hidden; border: 1px solid var(--line-strong); border-radius: 8px; padding: 34px; background: linear-gradient(135deg, rgba(46, 168, 201, 0.14), rgba(241, 186, 88, 0.16)); box-shadow: var(--shadow); }
.status-main h2 { margin-top: 10px; font-size: clamp(2rem, 4vw, 3.4rem); }
.status-main p:not(.eyebrow) { margin-top: 16px; max-width: 600px; }
.status-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
.status-signal { position: absolute; right: 28px; top: 28px; display: flex; gap: 7px; padding: 8px; border: 1px solid var(--line); border-radius: 999px; background: var(--card-bg-soft); }
.status-signal span { width: 9px; height: 9px; border-radius: 50%; background: var(--green); box-shadow: 0 0 18px rgba(75, 211, 138, 0.55); }
.status-signal span:nth-child(2) { background: var(--gold); box-shadow: 0 0 18px rgba(241, 190, 103, 0.45); }
.status-signal span:nth-child(3) { background: var(--soft); box-shadow: 0 0 18px rgba(217, 235, 248, 0.35); }
.status-cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.status-cards article { min-height: 170px; padding: 24px; }
.status-cards span { color: var(--muted); font-size: 0.76rem; font-weight: 900; text-transform: uppercase; }
.status-cards strong { display: block; margin-top: 14px; font-size: 2.4rem; }
.status-cards small { color: var(--muted); }

.info-layout { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.guide-list { display: grid; gap: 12px; }
.guide-list article { display: grid; grid-template-columns: 74px minmax(0, 1fr); gap: 18px; align-items: start; border: 1px solid var(--line); border-radius: 8px; padding: 22px; background: var(--card-bg-soft); box-shadow: var(--shadow); }
  .guide-list span { display: grid; place-items: center; width: 54px; height: 54px; border-radius: 8px; color: var(--guide-badge-text); background: var(--gold); font-weight: 900; }
.guide-list p { margin-top: 8px; }
.sanction-table { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.sanction-table div { display: flex; justify-content: space-between; gap: 20px; border: 1px solid var(--line); border-radius: 8px; padding: 16px; background: var(--card-bg-soft); }
.sanction-table strong { color: var(--gold); }
.sanction-table span { color: var(--muted); }
.text-panel { padding: 24px; }

.footer { border-top: 1px solid var(--line); background: var(--card-bg-soft); }
.footer-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 0.8fr); gap: 34px; padding: 48px 0; }
.footer p { margin-top: 16px; max-width: 440px; font-size: 0.92rem; }
.footer-column h2 { margin: 0 0 16px; font-size: 0.88rem; color: var(--soft); text-transform: uppercase; }
.footer-links { display: flex; flex-wrap: wrap; gap: 8px; }
.footer-links a { border: 1px solid var(--line); border-radius: 8px; padding: 9px 11px; color: var(--muted); font-size: 0.88rem; font-weight: 800; }
.footer-links a:hover, .footer-links a.is-active { color: var(--text); border-color: var(--line-strong); background: rgba(46, 168, 201, 0.08); }

@media (max-width: 1040px) {
  .nav-links { position: absolute; inset: 78px 16px auto 16px; display: none; flex-direction: column; align-items: stretch; padding: 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--menu-bg); box-shadow: var(--shadow); }
  .nav-links.is-open { display: flex; }
  .nav-more { display: grid; }
  .nav-more > button { text-align: left; }
  .more-menu { position: static; display: grid; margin-top: 6px; box-shadow: none; background: var(--menu-panel-bg); }
  .menu-toggle { display: block; }
  .split, .status-dashboard, .footer-grid, .document-card { grid-template-columns: 1fr; }
  .card-grid.two, .card-grid.three, .card-grid.four, .job-grid, .server-grid, .law-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 680px) {
  .container { width: min(100% - 24px, 1200px); }
  .nav { min-height: 70px; }
  .brand img { width: 42px; height: 42px; }
  .brand strong { font-size: 0.9rem; }
  .brand small { font-size: 0.68rem; }
  .nav-links { inset: 70px 12px auto 12px; }
  .page-hero { min-height: 560px; }
  .hero-bg { background-position: 0% center; transform: scale(1.06); }
  .hero-photo-shade { background: linear-gradient(90deg, rgba(2, 7, 13, 0.97) 0%, rgba(2, 7, 13, 0.9) 62%, rgba(2, 7, 13, 0.34) 100%), linear-gradient(0deg, rgba(2, 7, 13, 0.55) 0%, rgba(2, 7, 13, 0.08) 42%, rgba(2, 7, 13, 0) 72%); }
  .hero-inner { padding: 40px 0 78px; }
  h1, .page-hero h1 { font-size: clamp(2.2rem, 9vw, 3.2rem); }
  .hero-lead { font-size: 0.98rem; line-height: 1.55; }
  .card-grid.two, .card-grid.three, .card-grid.four, .job-grid, .server-grid, .law-grid, .status-cards, .info-layout, .sanction-table, .metric-panel, .quick-steps { grid-template-columns: 1fr; }
  .section { padding: 34px 0; }
  .section.slim { padding-top: 4px; }
  .section-head, .rules-summary, .sanction-table div { flex-direction: column; align-items: flex-start; }
  .rules-toolbar { top: 78px; }
  .rule-card summary { align-items: flex-start; flex-direction: column; }
  .guide-list article { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
}
`,
  "utf8"
);

fs.writeFileSync(
  path.join(outDir, "script.js"),
  `const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#navLinks");
const currentPage = document.body.dataset.page;
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeLabel = document.querySelector("[data-theme-label]");

function getTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function saveTheme(theme) {
  try {
    localStorage.setItem("ar-theme", theme);
  } catch {}
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  saveTheme(theme);
  if (themeToggle) {
    const nextTheme = theme === "dark" ? "wit" : "zwart";
    themeToggle.setAttribute("aria-label", "Schakel naar " + nextTheme + " thema");
  }
  if (themeLabel) {
    themeLabel.textContent = theme === "dark" ? "Wit" : "Zwart";
  }
}

applyTheme(getTheme());

themeToggle?.addEventListener("click", () => {
  applyTheme(getTheme() === "dark" ? "light" : "dark");
});

document.querySelectorAll("[data-page-link]").forEach((link) => {
  if (link.dataset.pageLink === currentPage) {
    link.classList.add("is-active");
  }
});

menuToggle?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav-more").forEach((menu) => {
  const button = menu.querySelector("button");
  button?.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
    document.querySelectorAll(".nav-more").forEach((other) => {
      if (other !== menu) {
        other.classList.remove("is-open");
        other.querySelector("button")?.setAttribute("aria-expanded", "false");
      }
    });
  });
});

navLinks?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    navLinks.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    document.querySelectorAll(".nav-more").forEach((menu) => {
      menu.classList.remove("is-open");
      menu.querySelector("button")?.setAttribute("aria-expanded", "false");
    });
  }
});

function normalizeRuleText(rule) {
  const div = document.createElement("div");
  div.innerHTML = rule.content;
  return [rule.num, rule.title, rule.sanction, div.textContent || ""].join(" ").toLowerCase();
}

function initRules() {
  const list = document.querySelector("#rulesList");
  if (!list || !window.APV_RULES) return;

  const search = document.querySelector("#ruleSearch");
  const count = document.querySelector("#ruleCount");
  const chips = [...document.querySelectorAll(".filter-chip")];
  let activeCategory = "all";

  function render() {
    const query = (search?.value || "").trim().toLowerCase();
    const rules = window.APV_RULES.filter((rule) => {
      const categoryMatch = activeCategory === "all" || rule.category === activeCategory;
      const textMatch = !query || normalizeRuleText(rule).includes(query);
      return categoryMatch && textMatch;
    });

    count.textContent = rules.length === 1 ? "1 APV-regel" : rules.length + " APV-regels";
    list.innerHTML = rules
      .map(
        (rule) => \`<details class="rule-card cat\${rule.category}">
          <summary>
            <span class="rule-title"><span class="rule-num">Art. \${rule.num}</span><strong>\${rule.title}</strong></span>
            <span class="rule-meta">

              <span class="rule-sanction cat\${rule.category}">\${rule.sanction}</span>
            </span>
          </summary>
          <div class="rule-body">\${rule.content}</div>
        </details>\`
      )
      .join("");
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeCategory = chip.dataset.category;
      chips.forEach((item) => item.classList.toggle("is-active", item === chip));
      render();
    });
  });

  search?.addEventListener("input", render);
  render();
}

function initStatus() {
  const root = document.querySelector("[data-status-widget]");
  if (!root) return;

  const data = window.AR_STATUS || {
    players: null,
    maxPlayers: null,
    state: "Live serverdata nog niet gekoppeld",
    peakHour: "Koppel live data om piekdrukte te tonen.",
    peakDay: "Koppel live data om dagrecords te tonen.",
  };

  function setText(name, value) {
    document.querySelectorAll(\`[data-status="\${name}"]\`).forEach((el) => {
      el.textContent = value;
    });
  }

  function update() {
    const now = new Date();
    const hasPlayers = data.players !== null && data.players !== undefined && data.players !== "";
    const hasMaxPlayers = data.maxPlayers !== null && data.maxPlayers !== undefined && data.maxPlayers !== "";
    const players = hasPlayers ? Number(data.players) : NaN;
    const maxPlayers = hasMaxPlayers ? Number(data.maxPlayers) : NaN;
    const hasLiveCount = Number.isFinite(players) && Number.isFinite(maxPlayers) && maxPlayers > 0;

    setText("players", Number.isFinite(players) ? players : "Niet gekoppeld");
    setText("capacity", Number.isFinite(maxPlayers) ? maxPlayers : "Niet gekoppeld");
    setText("fill", hasLiveCount ? Math.round((players / maxPlayers) * 100) + "%" : "-");
    setText("updated", now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }));
    setText("peakHour", data.peakHour);
    setText("peakDay", data.peakDay);
    const state = document.querySelector("#serverState");
    if (state) state.textContent = data.state;
  }

  update();
  setInterval(update, 15000);
}

initRules();
initStatus();
`,
  "utf8"
);

console.log(`Built ${pages.length} pages.`);
