import fs from "node:fs";
import path from "node:path";

const outDir = "outputs";
const apvUrl = "https://apv-amsterdamroleplay.onrender.com/";
const wetboekPdf = "assets/documents/wetboek-van-strafrecht-amrp.pdf";
const fivemConnectCommand = "connect 185.229.35.13";
const fivemServerIp = "185.229.35.13";
const fivemServerPort = "30120";
const fivemStatusEndpoint = `http://${fivemServerIp}:${fivemServerPort}/dynamic.json`;
const fivemServerCode = "";
const discordInviteCode = "PPcBUGhePj";
const statusApiUrl = "/api/status";
const cfxJoinUrl = "https://cfx.re/join/8emey4v";
// Wijzig deze URL later als je de echte store-link hebt.
const storeUrl = "https://store.amsterdamroleplay.nl";

const discord = {
  main: "https://discord.gg/PPcBUGhePj",
  support: "https://discord.gg/qjwspjT2zg",
  overheid: "https://discord.gg/k3NhmZdxty",
  overheidKanaal: "https://discord.com/channels/1402056739985162394/1509674799671017664",
  onderwereld: "https://discord.gg/feCbm7nYh4",
};

const nav = [
  ["home", "Home", "index.html"],
  ["regels", "Regels", "regels.html"],
  ["status", "Status", "status.html"],
  ["store", "Store", storeUrl, true],
];

const extraNav = [
  ["faq", "FAQ", "faq.html"],
];

const serverLinks = [
  ["Main", discord.main],
  ["Support", discord.support],
  ["Overheid", discord.overheid],
  ["Onderwereld", discord.onderwereld],
];

const legalLinks = [
  ["privacy", "Privacybeleid", "privacy.html"],
  ["cookies", "Cookiebeleid", "cookies.html"],
];

function button(label, href, tone = "primary", external = false) {
  const target = external ? ' target="_blank" rel="noopener"' : "";
  return `<a class="button ${tone}" href="${href}"${target}>${label}</a>`;
}

function cookieConsentMarkup() {
  return `
    <section class="cookie-banner" data-cookie-banner hidden aria-label="Cookie melding">
      <div class="cookie-banner-inner">
        <div>
          <h2>Cookies en live status</h2>
          <p>We bewaren alleen noodzakelijke voorkeuren. Met jouw toestemming laden we ook externe live serverstatus van Amsterdam Roleplay.</p>
        </div>
        <div class="cookie-actions">
          <button class="cookie-button" type="button" data-cookie-choice="necessary">Alleen nodig</button>
          <button class="cookie-button" type="button" data-cookie-settings>Instellingen</button>
          <button class="cookie-button primary" type="button" data-cookie-choice="all">Alles accepteren</button>
        </div>
      </div>
    </section>
    <section class="cookie-modal" data-cookie-modal hidden aria-label="Cookie instellingen">
      <div class="cookie-modal-panel">
        <h2>Cookie instellingen</h2>
        <p>Noodzakelijke opslag is nodig voor je thema en cookievoorkeur. Externe live status is optioneel.</p>
        <div class="cookie-option">
          <label><input type="checkbox" checked disabled /> Noodzakelijk</label>
          <p>Onthoudt je thema, cookiekeuze en basis sitevoorkeuren.</p>
        </div>
        <div class="cookie-option">
          <label><input type="checkbox" data-cookie-live-status /> Live serverstatus</label>
          <p>Laadt optioneel live serverstatus. Zonder toestemming gebruiken we waar mogelijk de eigen server-fallback.</p>
        </div>
        <div class="cookie-modal-actions">
          <button class="cookie-button" type="button" data-cookie-close>Sluiten</button>
          <button class="cookie-button primary" type="button" data-cookie-save>Opslaan</button>
        </div>
      </div>
    </section>`;
}

function hero(page) {
  const actions = (page.actions || []).join("");
  const stats = (page.stats || [])
    .map(([label, value]) => `<div class="metric-card"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
  const metrics = stats ? `<div class="metric-panel hero-metrics" data-count="${page.stats.length}" aria-label="Pagina highlights">${stats}</div>` : "";

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
        ${metrics}
      </div>
    </section>`;
}

function pageShell(page) {
  const navLinks = nav
    .map(([id, label, href, external]) => `<a data-page-link="${id}" href="${href}"${external ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`)
    .join("");
  const moreLinks = extraNav
    .map(([id, label, href, external]) => `<a data-page-link="${id}" href="${href}"${external ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`)
    .join("");
  const serversLinks = serverLinks
    .map(([label, href]) => `<a href="${href}" target="_blank" rel="noopener">${label}</a>`)
    .join("");
  const footerLinks = [...nav, ...extraNav]
    .map(([id, label, href, external]) => `<a data-page-link="${id}" href="${href}"${external ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`)
    .join("");
  const legalFooterLinks = legalLinks
    .map(([id, label, href]) => `<a data-page-link="${id}" href="${href}">${label}</a>`)
    .join("");

  const documentTitle = page.title === "Amsterdam Roleplay" ? page.title : `${page.title} | Amsterdam Roleplay`;

  return `<!DOCTYPE html>
<html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${documentTitle}</title>
    <meta name="description" content="${page.description}" />
    <link rel="icon" type="image/png" href="assets/logo-amsterdam-roleplay.png" />
    <link rel="preload" href="assets/logo-amsterdam-roleplay.png" as="image" />
    <link rel="preload" href="assets/banner-amsterdam-roleplay.webp" as="image" />
    <script>
      (() => {
        try {
          const savedTheme = localStorage.getItem("ar-theme");
          document.documentElement.dataset.theme = savedTheme === "light" ? "light" : "dark";
        } catch {
          document.documentElement.dataset.theme = "dark";
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
        <div class="footer-column">
          <h2>Informatie</h2>
          <div class="footer-links">${legalFooterLinks}<button class="footer-link-button" type="button" data-cookie-settings>Cookiekeuze</button></div>
        </div>
      </div>
    </footer>
    ${cookieConsentMarkup()}
    ${page.extraScripts || ""}
    <script src="script.js"></script>
  </body>
</html>`;
}

const pages = [
  {
    id: "home",
    file: "index.html",
    title: "Amsterdam Roleplay",
    description: "Amsterdam Roleplay Easy Weapons communityhub met regels, wetboek, store en Discord servers.",
    eyebrow: "Easy Weapons Amsterdam",
    heading: "Amsterdam Roleplay",
    intro:
      "Een compacte hub voor regels, straffen, wetboek, store en de juiste Discord server voor elke route.",
    actions: [
      button("Join main server", discord.main, "primary", true),
    ],
    stats: [
      ["Regels", "65 artikelen"],
      ["Server", "Easy Weapons"],
    ],
    content: `
      <section class="band">
        <div class="container">
          <div class="center-copy">
            <p class="eyebrow">Snel starten</p>
            <h2>Alles voor Amsterdam Roleplay op een plek.</h2>
            <p>Een lichte, snelle hub voor spelers die meteen willen weten waar ze moeten zijn: regels, straffen, store en de juiste Discord-route.</p>
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
          <div class="center-copy">
            <p class="eyebrow">Startflow</p>
            <h2>Van Discord naar de stad.</h2>
            <p>Nieuwe spelers moeten niet zoeken. Deze site stuurt je direct naar de juiste plek en laat zien wat je eerst moet lezen.</p>
            <div class="quick-steps">
              <div><p>Stap 1</p><h3>Main Discord</h3></div>
              <div><p>Stap 2</p><h3>Regels lezen</h3></div>
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
            <h3>Regels volledig</h3>
            <p>65 artikelen, strafcategorieen en zoekfunctie op een pagina.</p>
          </a>
          <a class="feature-card link-card" href="${discord.main}" target="_blank" rel="noopener">
            <h3>Join Discord</h3>
            <p>Start via de main Discord en gebruik daarna het F8 connect-command op deze pagina.</p>
          </a>
          <a class="feature-card link-card" href="${storeUrl}" target="_blank" rel="noopener">
            <h3>Store</h3>
            <p>Ga direct naar de store. Pas de link later makkelijk aan via storeUrl.</p>
          </a>
          <a class="feature-card link-card" href="assets/documents/wetboek-van-strafrecht-amrp.pdf" target="_blank" rel="noopener">
            <h3>Wetboek PDF</h3>
            <p>De directe PDF voor staff, overheid en spelers die willen checken.</p>
          </a>
          <a class="feature-card link-card" href="status.html">
            <h3>Serverstatus</h3>
            <p>Een nette statuspagina klaar voor live serverdata.</p>
          </a>
          <a class="feature-card link-card" href="${discord.support}" target="_blank" rel="noopener">
            <h3>Support Discord</h3>
            <p>Vragen, reports of appeals gaan rechtstreeks via Discord.</p>
          </a>
        </div>
      </section>

      <section class="band">
        <div class="container center-copy">
          <p class="eyebrow">Hoe join je?</p>
          <h2>Join Amsterdam Roleplay via F8.</h2>
          <p class="section-lead">Join eerst de Discord, start FiveM, druk op <strong>F8</strong> en plak het connect-command hieronder.</p>
          <div class="connect-command" onclick="navigator.clipboard.writeText('${fivemConnectCommand}'); alert('Connect gekopieerd!');">
            <span>F8 connect</span>
            <code>${fivemConnectCommand}</code>
          </div>
          <div class="quick-steps connect-steps">
            <div><p>Stap 1</p><h3>Join Discord</h3><span>Pak de main Discord voor updates, regels en community-info.</span></div>
            <div><p>Stap 2</p><h3>Start FiveM</h3><span>Zorg dat GTA V en je microfoon werken, open FiveM en druk op F8.</span></div>
            <div><p>Stap 3</p><h3>Connect met F8</h3><span>Plak <strong>${fivemConnectCommand}</strong> en druk op Enter.</span></div>
          </div>
          <div class="center-actions">
            <a class="button primary" href="${discord.main}" target="_blank" rel="noopener">Join main server</a>
            <a class="button secondary" href="regels.html">Regels lezen</a>
          </div>
        </div>
      </section>`,
  },
  {
    id: "regels",
    file: "regels.html",
    title: "Algemene Plaatselijke Verordening",
    description: "Zoekbare APV van Amsterdam Roleplay met uitleg per strafcategorie.",
    eyebrow: "APV en straffen",
    heading: "Algemene Plaatselijke Verordening",
    intro:
      "Alle APV-artikelen staan doorzoekbaar op deze pagina. Daaronder vind je direct wat Cat 0 t/m Cat 9 betekent.",
    actions: [button("Naar wetboek", "#wetboek")],
    stats: [
      ["Artikelen", "65"],
      ["Strafcats", "Cat 0-9"],
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

      <section class="band" id="wetboek">
        <div class="container">
          <a class="document-card document-link" href="${wetboekPdf}" target="_blank" rel="noopener">
            <span class="document-icon" aria-hidden="true">
              <svg width="54" height="64" viewBox="0 0 68 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="68" height="80" rx="6" fill="var(--panel)" stroke="var(--line)"/>
                <path d="M18 22h32v6H18zM18 34h32v6H18zM18 46h24v6H18z" fill="var(--muted)"/>
                <rect x="44" y="8" width="10" height="12" rx="1" fill="var(--gold)"/>
              </svg>
            </span>
            <span class="document-copy">
              <span class="eyebrow">Wetboek PDF</span>
              <strong>Wetboek van Strafrecht</strong>
              <small>Open de volledige PDF in een nieuw venster.</small>
            </span>
            <span class="button primary document-action">Open wetboek</span>
          </a>
        </div>
      </section>`,
  },
  {
    id: "status",
    file: "status.html",
    title: "Serverstatus",
    description: "Serverstatuspagina voor Amsterdam Roleplay met capaciteit, restartinformatie en Discord-routes.",
    eyebrow: "Live status",
    heading: "Serverstatus",
    intro:
      "Bekijk bereikbaarheid, capaciteit en connectinformatie. De serverknoppen staan overal onder Servers in de navigatie.",
    actions: [button("Join main", discord.main, "primary", true), button("Support", discord.support, "secondary", true)],
    stats: [
      ["Status", "Live"],
      ["Update", "30 sec"],
    ],
    content: `
      <section class="container section status-dashboard" data-status-widget data-status-api="${statusApiUrl}" data-discord-invite="${discordInviteCode}" data-fivem-code="${fivemServerCode}" data-fivem-endpoint="">
        <div class="status-main">
          <div class="status-signal" aria-hidden="true"><span></span><span></span><span></span></div>
          <p class="eyebrow">Amsterdam Roleplay</p>
          <h2 id="serverState">Dashboard gereed voor serverdata</h2>
          <p>Live status wordt opgehaald via de FiveM server-IP en Discord invite. Als de FiveM API geen antwoord geeft, blijft de Discord data wel zichtbaar.</p>
          <div class="status-actions">
            <a class="button primary" href="${discord.main}" target="_blank" rel="noopener">Main Discord</a>
            <a class="button secondary" href="${discord.support}" target="_blank" rel="noopener">Support Discord</a>
          </div>
        </div>
        <div class="status-cards">
          <article><span>FiveM online</span><strong data-status="players">Niet gekoppeld</strong><small>via server-IP</small></article>
          <article><span>FiveM slots</span><strong data-status="capacity">Niet gekoppeld</strong><small>max spelers</small></article>
          <article><span>Bezetting</span><strong data-status="fill">-</strong><small>wordt automatisch berekend</small></article>
          <article><span>Discord members</span><strong data-status="discordMembers">Laden...</strong><small>via main invite</small></article>
          <article><span>Discord online</span><strong data-status="discordOnline">Laden...</strong><small>ongeveer online</small></article>
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
    id: "faq",
    file: "faq.html",
    title: "Frequently Asked Questions",
    description: "Veelgestelde vragen voor nieuwe spelers van Amsterdam Roleplay.",
    eyebrow: "FAQ",
    heading: "Frequently Asked Questions",
    intro:
      "Snel antwoord op de belangrijkste vragen over joinen, Discord, regels, support en wetboek.",
    actions: [button("Join main server", discord.main, "primary", true), button("Regels lezen", "regels.html", "secondary")],
    stats: [
      ["Start", "Joinen"],
      ["Lezen", "APV + Wetboek"],
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
          <details><summary>Waar vind ik het wetboek?</summary><p>Het Wetboek van Strafrecht staat direct op deze site. De belangrijkste straffen staan ook op de APV-pagina.</p></details>
          <details><summary>Hoe solliciteer ik voor overheid?</summary><p>Gebruik de overheidserver via het Servers-menu. Politie, ambulance en pechhulp lopen via die Discord.</p></details>
          <details><summary>Hoe solliciteer ik voor staff?</summary><p>Gebruik de supportserver via het Servers-menu. Zorg dat je rustig kunt uitleggen, bewijs kunt beoordelen en regels kent.</p></details>
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
            <li><strong>Regels gelezen</strong><span>Basisregels en wapengebruik zijn duidelijk.</span></li>
            <li><strong>Character klaar</strong><span>Naam, achtergrond en doel zijn bedacht.</span></li>
          </ol>
        </div>
      </section>`,
  },
  {
    id: "privacy",
    file: "privacy.html",
    title: "Privacybeleid",
    description: "Privacybeleid voor de Amsterdam Roleplay communityhub.",
    eyebrow: "Privacy",
    heading: "Privacybeleid",
    intro:
      "Hier lees je welke gegevens deze communityhub verwerkt en welke externe diensten gebruikt kunnen worden.",
    actions: [button("Cookiebeleid", "cookies.html")],
    content: `
      <section class="container section">
        <div class="card-grid two">
          <article class="text-panel"><h3>Over deze site</h3><p>Amsterdam Roleplay is een communityhub met regels, status, wetboek, store en Discord-routes voor spelers.</p></article>
          <article class="text-panel"><h3>Welke gegevens?</h3><p>Deze site vraagt geen accountgegevens en bevat geen eigen registratieformulier. Je browser kan wel je thema en cookievoorkeur opslaan in localStorage.</p></article>
          <article class="text-panel"><h3>Externe links</h3><p>Discord, de store en Cfx.re zijn externe diensten. Als je daarop klikt, gelden ook hun eigen voorwaarden en privacyregels.</p></article>
          <article class="text-panel"><h3>Serverstatus</h3><p>Voor live status kan de site servergegevens ophalen. Zonder toestemming gebruikt de site waar mogelijk de eigen fallback.</p></article>
          <article class="text-panel"><h3>Vragen</h3><p>Voor privacyvragen kun je via de supportserver contact zoeken met het Amsterdam Roleplay-team.</p></article>
        </div>
      </section>`,
  },
  {
    id: "cookies",
    file: "cookies.html",
    title: "Cookiebeleid",
    description: "Cookiebeleid en cookie-instellingen voor Amsterdam Roleplay.",
    eyebrow: "Cookies",
    heading: "Cookiebeleid",
    intro:
      "Deze site gebruikt minimale opslag voor voorkeuren en optioneel externe live status.",
    actions: ['<button class="button primary" type="button" data-cookie-settings>Cookie instellingen</button>', button("Privacybeleid", "privacy.html", "secondary")],
    content: `
      <section class="container section">
        <div class="card-grid three">
          <article class="feature-card"><h3>Noodzakelijk</h3><p>We gebruiken localStorage voor thema, cookievoorkeur en basisinteractie. Dit is nodig om de site prettig te laten werken.</p></article>
          <article class="feature-card"><h3>Live serverstatus</h3><p>Met toestemming mag de site live serverstatus ophalen. Zonder toestemming blijft de basisstatus via de eigen server werken.</p></article>
          <article class="feature-card"><h3>Geen advertentiecookies</h3><p>Deze hub plaatst geen advertentiecookies en gebruikt geen tracking voor marketing.</p></article>
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

.page-hero { position: relative; min-height: 610px; display: flex; overflow: hidden; border-bottom: 1px solid var(--line); background: var(--banner-bg); }
.hero-bg, .hero-photo-shade { position: absolute; inset: 0; }
.hero-bg { background-image: url("assets/banner-amsterdam-roleplay.webp"); background-size: cover; background-position: center; transform: scale(1.01); }
.hero-photo-shade { background: linear-gradient(90deg, rgba(2, 7, 13, 0.98) 0%, rgba(2, 7, 13, 0.9) 38%, rgba(2, 7, 13, 0.48) 66%, rgba(2, 7, 13, 0.08) 100%), linear-gradient(0deg, rgba(2, 7, 13, 0.72) 0%, rgba(2, 7, 13, 0.12) 52%, rgba(2, 7, 13, 0) 76%); }
.hero-inner { position: relative; z-index: 1; display: grid; align-content: start; gap: 28px; padding: clamp(76px, 9vh, 96px) 0 76px; }
.hero-copy-block { max-width: 760px; }
.eyebrow { color: var(--blue); font-size: 0.76rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
  .page-hero .eyebrow { color: var(--hero-eyebrow); text-shadow: 0 2px 18px rgba(0, 0, 0, 0.38); }
h1 { margin-top: 14px; color: var(--text); font-size: clamp(2.8rem, 6.2vw, 5.8rem); line-height: 0.96; letter-spacing: 0; }
  .page-hero h1 { max-width: 720px; color: var(--hero-h1); font-size: clamp(2.65rem, 4.55vw, 4.85rem); line-height: 0.98; text-shadow: 0 14px 44px rgba(0, 0, 0, 0.55); }
  .page-hero h1 span { display: block; }
.hero-lead { max-width: 610px; margin-top: 18px; color: rgba(255, 255, 255, 0.9); font-size: clamp(1rem, 1.55vw, 1.18rem); line-height: 1.58; text-shadow: 0 8px 30px rgba(0, 0, 0, 0.46); }
.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
@media (max-width: 820px) {
  .hero-actions { flex-wrap: wrap; }
}
.button { min-height: 48px; display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: 8px; padding: 13px 18px; font: inherit; font-weight: 900; cursor: pointer; transition: transform 180ms ease, border-color 180ms ease, background 180ms ease, box-shadow 180ms ease; }
.button:hover { transform: translateY(-2px); }
  .button.primary { color: var(--button-primary-text); background: linear-gradient(135deg, var(--button-primary-start), var(--gold)); box-shadow: 0 16px 42px rgba(46, 168, 201, 0.22); }
.button.secondary { border: 1px solid var(--line); background: var(--secondary-bg); color: var(--text); }
.button.ghost { border: 1px solid rgba(241, 186, 88, 0.62); color: var(--ghost-text); background: rgba(241, 186, 88, 0.12); }
.page-hero .button.ghost { color: #ffe5a8; background: rgba(3, 9, 19, 0.52); border-color: rgba(241, 186, 88, 0.76); }
.section { padding: 54px 0; }
.section.slim { padding-top: 6px; }
.section-head { display: flex; justify-content: space-between; align-items: end; gap: 20px; margin-bottom: 16px; }
.center-copy { text-align: center; max-width: 840px; margin: 0 auto; }
.section-lead { max-width: 700px; margin: 14px auto 0; font-size: clamp(1rem, 1.8vw, 1.18rem); }
.center-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 20px; }
h2 { margin-top: 7px; font-size: clamp(1.85rem, 3.6vw, 3.35rem); line-height: 1.04; letter-spacing: 0; }
h3 { color: var(--text); font-size: 1.1rem; }
p { color: var(--muted); line-height: 1.62; }
.card-grid { display: grid; gap: 16px; }
.card-grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.card-grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.card-grid.four { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.feature-card, .job-card, .law-card, .document-card, .status-cards article, .text-panel { border: 1px solid var(--line); border-radius: 8px; background: linear-gradient(180deg, var(--card-bg), var(--card-bg-soft)); box-shadow: var(--shadow); }
.feature-card { position: relative; overflow: hidden; min-height: 170px; padding: 24px; display: flex; flex-direction: column; align-items: flex-start; }
.feature-card::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 3px; background: linear-gradient(90deg, var(--cyan), var(--gold)); opacity: 0.42; }
.feature-card.wide { min-height: 128px; }
.feature-card p, .job-card p, .law-card p { margin-top: 8px; font-size: 0.95rem; }
.feature-card .button { margin-top: auto; }
.link-card { display: block; transition: transform 180ms ease, border-color 180ms ease; }
.link-card:hover { transform: translateY(-4px); border-color: var(--line-strong); }
.card-index { display: inline-grid; place-items: center; min-width: 42px; height: 32px; margin-bottom: 20px; border-radius: 7px; background: rgba(46, 168, 201, 0.12); color: var(--blue); font-size: 0.76rem; font-weight: 900; }
.band { padding: 34px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); background: linear-gradient(135deg, var(--band-bg) 0%, var(--band-bg) 100%); }
.band[id] { scroll-margin-top: 96px; }
.band:nth-of-type(even) { background: var(--bg); border-color: transparent; }
.band h2 { color: var(--text); }
.band p { color: var(--muted); }
.band .container > div { max-width: 100%; margin: 0 auto; }
.band-dark { background: var(--bg-deep); }
.band-light { background: var(--bg); }
.quick-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 22px; }
.quick-steps div { min-height: 102px; border: 1px solid var(--line); border-radius: 8px; padding: 20px; background: linear-gradient(180deg, var(--card-bg-soft), var(--metric-bg)); box-shadow: var(--shadow); }
.quick-steps p { color: var(--muted); font-size: 0.78rem; font-weight: 900; text-transform: uppercase; }
.quick-steps h3 { margin-top: 8px; font-size: 1.22rem; }
.connect-steps { max-width: 960px; margin: 22px auto 0; text-align: left; }
.connect-command { max-width: 470px; margin: 22px auto 0; border: 1px solid var(--line-strong); border-radius: 8px; padding: 16px 18px; background: rgba(3, 9, 19, 0.42); box-shadow: var(--shadow); cursor: pointer; }
.connect-command span { display: block; margin-bottom: 7px; color: var(--muted); font-size: 0.78rem; font-weight: 900; text-transform: uppercase; }
.connect-command code { color: var(--text); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: clamp(1rem, 2vw, 1.22rem); font-weight: 900; word-break: break-word; }
.split { display: grid; grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr); gap: 54px; align-items: center; }
.metric-panel { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(210px, 100%), 1fr)); gap: 12px; }
.metric-panel div { min-height: 104px; border: 1px solid var(--line); border-radius: 8px; padding: 18px; background: linear-gradient(180deg, var(--card-bg), var(--metric-bg)); box-shadow: var(--shadow); }
.metric-panel span { color: var(--muted); font-size: 0.76rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.06em; }
.metric-panel strong { display: block; margin-top: 12px; color: var(--text); font-size: clamp(1.18rem, 2vw, 1.72rem); line-height: 1.08; overflow-wrap: anywhere; }
.hero-metrics { width: min(760px, 100%); }
.hero-metrics[data-count="2"] { width: min(520px, 100%); }
.hero-metrics[data-count="1"] { width: min(260px, 100%); }
.hero-metrics div { position: relative; overflow: hidden; min-height: 104px; padding: 18px 20px; backdrop-filter: blur(16px); background: linear-gradient(160deg, rgba(17, 26, 31, 0.9), rgba(3, 9, 19, 0.72)); border-color: rgba(241, 186, 88, 0.34); box-shadow: 0 18px 46px rgba(0, 0, 0, 0.28); }
.hero-metrics div::before { content: ""; position: absolute; inset: 0 0 auto; height: 3px; background: linear-gradient(90deg, var(--cyan), var(--gold)); opacity: 0.8; }
.hero-metrics span { color: #b8cbe0; }
.hero-metrics strong { color: #ffffff; font-size: clamp(1.28rem, 2.1vw, 1.78rem); line-height: 1.08; }

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
.document-link { grid-template-columns: auto minmax(0, 1fr) auto; width: 100%; color: inherit; transition: transform 180ms ease, border-color 180ms ease; }
.document-link:hover { transform: translateY(-3px); border-color: var(--line-strong); }
.document-icon { display: grid; place-items: center; width: 74px; height: 74px; border-radius: 8px; background: var(--secondary-bg); }
.document-copy { min-width: 0; display: grid; gap: 7px; }
.document-copy strong { color: var(--text); font-size: clamp(1.55rem, 2.5vw, 2.35rem); line-height: 1.05; white-space: nowrap; }
.document-copy small { color: var(--muted); font-size: 0.95rem; }
.document-action { white-space: nowrap; }
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
.status-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.status-cards article { min-height: 170px; padding: 24px; }
.status-cards span { color: var(--muted); font-size: 0.76rem; font-weight: 900; text-transform: uppercase; }
.status-cards strong { display: block; margin-top: 14px; font-size: clamp(1.45rem, 2.8vw, 2.4rem); line-height: 1.08; overflow-wrap: anywhere; }
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

.cookie-banner, .cookie-modal { position: fixed; z-index: 140; }
.cookie-banner[hidden], .cookie-modal[hidden] { display: none; }
.cookie-banner { left: 50%; bottom: 18px; width: min(960px, calc(100% - 28px)); transform: translateX(-50%); border: 1px solid var(--line-strong); border-radius: 12px; padding: 16px; background: rgba(9, 17, 25, 0.94); box-shadow: 0 26px 90px rgba(0, 0, 0, 0.42); backdrop-filter: blur(18px); }
.cookie-banner-inner { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 18px; align-items: center; }
.cookie-banner h2, .cookie-modal h2 { margin: 0; color: #ffffff; font-size: 1.05rem; line-height: 1.2; }
.cookie-banner p, .cookie-modal p { margin-top: 6px; color: rgba(245, 249, 255, 0.78); font-size: 0.92rem; line-height: 1.55; }
.cookie-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
.cookie-button { min-height: 42px; border: 1px solid var(--line); border-radius: 8px; padding: 10px 13px; color: var(--text); background: var(--secondary-bg); font: inherit; font-weight: 900; cursor: pointer; }
.cookie-button.primary { color: var(--button-primary-text); border-color: transparent; background: linear-gradient(135deg, var(--button-primary-start), var(--gold)); }
.cookie-button:hover { border-color: var(--line-strong); transform: translateY(-1px); }
.cookie-modal { inset: 0; display: grid; place-items: center; padding: 18px; background: rgba(2, 7, 13, 0.62); }
.cookie-modal-panel { width: min(560px, 100%); border: 1px solid var(--line-strong); border-radius: 12px; padding: 20px; background: var(--panel); box-shadow: var(--shadow); }
.cookie-modal h2, .cookie-modal p { color: var(--text); }
.cookie-modal p { color: var(--muted); }
.cookie-option { display: grid; gap: 6px; margin-top: 14px; border: 1px solid var(--line); border-radius: 8px; padding: 14px; background: var(--card-bg-soft); }
.cookie-option label { display: flex; gap: 10px; align-items: center; color: var(--text); font-weight: 900; }
.cookie-option input { width: 18px; height: 18px; accent-color: var(--cyan); }
.cookie-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }

.footer { border-top: 1px solid var(--line); background: var(--card-bg-soft); }
.footer-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.9fr) minmax(0, 0.9fr) minmax(0, 0.85fr); gap: 28px; padding: 48px 0; }
.footer p { margin-top: 16px; max-width: 440px; font-size: 0.92rem; }
.footer-column h2 { margin: 0 0 16px; font-size: 0.88rem; color: var(--soft); text-transform: uppercase; }
.footer-links { display: flex; flex-wrap: wrap; gap: 8px; }
.footer-links a, .footer-link-button { border: 1px solid var(--line); border-radius: 8px; padding: 9px 11px; color: var(--muted); background: transparent; font: inherit; font-size: 0.88rem; font-weight: 800; cursor: pointer; }
.footer-links a:hover, .footer-links a.is-active, .footer-link-button:hover { color: var(--text); border-color: var(--line-strong); background: rgba(46, 168, 201, 0.08); }

@media (max-width: 1040px) {
  .nav-links { position: absolute; inset: 78px 16px auto 16px; display: none; flex-direction: column; align-items: stretch; padding: 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--menu-bg); box-shadow: var(--shadow); }
  .nav-links.is-open { display: flex; }
  .nav-more { display: grid; }
  .nav-more > button { text-align: left; }
  .more-menu { position: static; display: grid; margin-top: 6px; box-shadow: none; background: var(--menu-panel-bg); }
  .menu-toggle { display: block; }
  .split, .status-dashboard, .footer-grid, .document-card { grid-template-columns: 1fr; }
  .document-link { justify-items: start; }
  .document-copy strong { white-space: normal; }
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
  .hero-inner { gap: 20px; padding: 40px 0 48px; }
  h1, .page-hero h1 { font-size: clamp(2.2rem, 9vw, 3.2rem); }
  .hero-lead { font-size: 0.98rem; line-height: 1.55; }
  .hero-metrics { gap: 12px; }
  .hero-metrics div { min-height: 86px; padding: 16px 18px; }
  .hero-metrics strong { font-size: clamp(1.2rem, 6vw, 1.55rem); }
  .cookie-banner-inner { grid-template-columns: 1fr; }
  .cookie-actions, .cookie-modal-actions { justify-content: stretch; }
  .cookie-button { width: 100%; }
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

const COOKIE_CONSENT_KEY = "ar-cookie-consent";

function getCookieConsent() {
  try {
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveCookieConsent(consent) {
  const nextConsent = {
    necessary: true,
    liveStatus: Boolean(consent.liveStatus),
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(nextConsent));
  } catch {}

  window.dispatchEvent(new CustomEvent("ar-cookie-consent-change", { detail: nextConsent }));
}

function canUseExternalStatus() {
  return getCookieConsent()?.liveStatus === true;
}

function initCookieConsent() {
  const banner = document.querySelector("[data-cookie-banner]");
  const modal = document.querySelector("[data-cookie-modal]");
  const liveStatusToggle = document.querySelector("[data-cookie-live-status]");

  function openModal() {
    const consent = getCookieConsent();
    if (liveStatusToggle) liveStatusToggle.checked = consent?.liveStatus !== false;
    modal?.removeAttribute("hidden");
  }

  function closeModal() {
    modal?.setAttribute("hidden", "");
  }

  function hideBanner() {
    banner?.setAttribute("hidden", "");
  }

  if (!getCookieConsent()) {
    banner?.removeAttribute("hidden");
  }

  document.querySelectorAll("[data-cookie-settings]").forEach((button) => {
    button.addEventListener("click", openModal);
  });

  document.querySelectorAll("[data-cookie-close]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.querySelectorAll("[data-cookie-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.dataset.cookieChoice;
      saveCookieConsent({ liveStatus: choice === "all" });
      hideBanner();
      closeModal();
    });
  });

  document.querySelector("[data-cookie-save]")?.addEventListener("click", () => {
    saveCookieConsent({ liveStatus: liveStatusToggle?.checked === true });
    hideBanner();
    closeModal();
  });
}

function initStatus() {
  const root = document.querySelector("[data-status-widget]");
  if (!root) return;

  const config = {
    statusApi: root.dataset.statusApi || "",
    discordInviteCode: root.dataset.discordInvite || "",
    fivemCode: root.dataset.fivemCode || "",
    fivemEndpoint: root.dataset.fivemEndpoint || "",
  };

  const data = {
    players: null,
    maxPlayers: null,
    state: "Live serverdata nog niet gekoppeld",
    discordMembers: null,
    discordOnline: null,
    discordMembersText: config.discordInviteCode ? "Laden..." : "Niet gekoppeld",
    discordOnlineText: config.discordInviteCode ? "Laden..." : "Niet gekoppeld",
    playersText: config.fivemCode || config.fivemEndpoint ? "Laden..." : "Niet gekoppeld",
    capacityText: config.fivemCode || config.fivemEndpoint ? "Laden..." : "Niet gekoppeld",
    ...(window.AR_STATUS || {}),
  };

  function setText(name, value) {
    document.querySelectorAll('[data-status="' + name + '"]').forEach((el) => {
      el.textContent = value;
    });
  }

  function numberText(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? new Intl.NumberFormat("nl-NL").format(number) : fallback;
  }

  function getFivemUrl() {
    if (config.fivemEndpoint) return config.fivemEndpoint;
    if (config.fivemCode) return "https://servers-frontend.fivem.net/api/servers/single/" + encodeURIComponent(config.fivemCode);
    return "";
  }

  async function fetchJson(url) {
    const urls = [
      url,
      "https://api.allorigins.win/raw?url=" + encodeURIComponent(url),
      "https://api.allorigins.win/get?url=" + encodeURIComponent(url),
    ];
    let lastError;

    for (const target of urls) {
      try {
        const response = await fetch(target, { cache: "no-store" });
        if (!response.ok) throw new Error("Status " + response.status);
        const text = await response.text();
        const json = JSON.parse(text);

        if (json && typeof json.contents === "string") {
          return JSON.parse(json.contents);
        }

        return json;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  }

  async function loadDiscordStats() {
    if (!config.discordInviteCode) return;

    try {
      const invite = await fetchJson("https://discord.com/api/v10/invites/" + encodeURIComponent(config.discordInviteCode) + "?with_counts=true");
      data.discordMembers = invite.approximate_member_count;
      data.discordOnline = invite.approximate_presence_count;
      data.discordMembersText = "Niet beschikbaar";
      data.discordOnlineText = "Niet beschikbaar";
    } catch {
      data.discordMembers = null;
      data.discordOnline = null;
      data.discordMembersText = "Niet beschikbaar";
      data.discordOnlineText = "Niet beschikbaar";
    }
  }

  async function loadFivemStats() {
    const url = getFivemUrl();
    if (!url) return;

    try {
      const json = await fetchJson(url);
      const server = json.Data || json;
      const vars = server.vars || {};
      data.players = server.clients ?? server.players?.length ?? data.players;
      data.maxPlayers = server.sv_maxclients ?? server.maxPlayers ?? vars.sv_maxClients ?? vars.sv_maxclients ?? data.maxPlayers;
      data.playersText = "Niet beschikbaar";
      data.capacityText = "Niet beschikbaar";

      const players = Number(data.players);
      data.state = Number.isFinite(players) ? "FiveM server online" : "FiveM serverdata gevonden";
    } catch {
      data.players = null;
      data.maxPlayers = null;
      data.playersText = "Offline";
      data.capacityText = "Niet gevonden";
      data.state = "FiveM server offline of niet gevonden";
    }
  }

  async function loadStatusApi() {
    if (!config.statusApi || window.location.protocol === "file:") return false;
    const urls = [];

    if (!/^https?:\/\//i.test(config.statusApi) || canUseExternalStatus()) {
      urls.push(config.statusApi);
    }

    if (config.statusApi !== "/api/status") {
      urls.push("/api/status");
    }

    for (const url of urls) {
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error("Status API " + response.status);

        const status = await response.json();
        const fivem = status.fivem || {};
        const discord = status.discord || {};

        data.players = fivem.players ?? status.players ?? data.players;
        data.maxPlayers = fivem.maxPlayers ?? status.maxPlayers ?? data.maxPlayers;
        data.discordMembers = discord.members ?? data.discordMembers;
        data.discordOnline = discord.online ?? data.discordOnline;
        data.playersText = "Niet beschikbaar";
        data.capacityText = "Niet beschikbaar";
        data.discordMembersText = "Niet beschikbaar";
        data.discordOnlineText = "Niet beschikbaar";
        data.state = (fivem.online ?? status.online) === false ? "FiveM server offline" : "Live serverdata actief";
        return true;
      } catch {}
    }

    return false;
  }

  async function loadLiveData() {
    const loadedFromApi = await loadStatusApi();

    if (!loadedFromApi) {
      await Promise.allSettled([loadDiscordStats(), loadFivemStats()]);
    }

    if (!getFivemUrl() && config.discordInviteCode) {
      data.state = "Discord statistieken actief, FiveM nog niet gekoppeld";
    }
    update();
  }

  function update() {
    const now = new Date();
    const hasPlayers = data.players !== null && data.players !== undefined && data.players !== "";
    const hasMaxPlayers = data.maxPlayers !== null && data.maxPlayers !== undefined && data.maxPlayers !== "";
    const players = hasPlayers ? Number(data.players) : NaN;
    const maxPlayers = hasMaxPlayers ? Number(data.maxPlayers) : NaN;
    const hasLiveCount = Number.isFinite(players) && Number.isFinite(maxPlayers) && maxPlayers > 0;

    setText("players", numberText(players, data.playersText || "Niet gekoppeld"));
    setText("capacity", numberText(maxPlayers, data.capacityText || "Niet gekoppeld"));
    setText("fill", hasLiveCount ? Math.round((players / maxPlayers) * 100) + "%" : "-");
    setText("discordMembers", numberText(data.discordMembers, data.discordMembersText || "Niet gekoppeld"));
    setText("discordOnline", numberText(data.discordOnline, data.discordOnlineText || "Niet gekoppeld"));
    setText("updated", now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }));
    const state = document.querySelector("#serverState");
    if (state) state.textContent = data.state;
  }

  update();
  loadLiveData();
  setInterval(update, 15000);
  setInterval(loadLiveData, 60000);
}

initRules();
initCookieConsent();
initStatus();
`,
  "utf8"
);

console.log(`Built ${pages.length} pages.`);
