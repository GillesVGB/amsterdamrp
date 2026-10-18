# Amsterdam Roleplay — Heerlen-design en regelgeving

Dit pakket voegt het Heerlen-design toe aan de bestaande Amsterdam-publicatie van 19 oktober 2026. De originele React-app, checkout, Discord-login, APIs, winkelgegevens, leaderboards en skin-editor blijven de bron voor de bestaande functies. Er worden geen backendbestanden vervangen.

Op verzoek zijn de regels van https://heerlenrp.netlify.app/ overgenomen: 65 APV-artikelen, 11 strafcategorieën, 9 algemene regels en 10 Discord-regels. Alleen Heerlen-verwijzingen en de Discord-uitnodiging zijn aangepast naar Amsterdam. Het oorspronkelijke Amsterdam-reglement wordt op `/regels` vervangen door deze nieuwe weergave. De regeltekst staat in `assets/amsterdam-regulations-data.js`.

De navigatie heeft aparte groepen: Ontdek Amsterdam, Regelgeving (APV, Strafcategorieën, Algemene regels, Discord-regels), Extra (Winkelmand) en Informatie. De APV heeft onderwerpfilters, zoekfunctie, strafcategoriefilter, uitklapbare artikelen, bewaarde artikelen per browser, artikellinks en afdrukken/PDF.

## Installeren op de bestaande hosting

Dit is een integratiepakket voor de bestaande website, geen zelfstandige Netlify-website. De originele server en bestanden van amsterdamrp.nl zijn nodig voor de bestaande account- en betaalfuncties. Het pakket is nog niet op amsterdamrp.nl geïnstalleerd.

1. Maak op de bestaande hosting een back-up van de publieke webmap.
2. Pak dit pakket buiten die webmap uit.
3. Voer met Node.js uit:

   ```sh
   node apply-design.mjs --root /volledig/pad/naar/de/bestaande/publieke/webmap
   ```

Het script controleert of `index.html` de onderzochte originele React-build `/assets/index-ChlEB3UH.js` gebruikt. Bij een andere build stopt het, zodat eerst de compatibiliteit kan worden gecontroleerd. Het wijzigt `index.html`, plaatst vijf extra assets en bewaart de originele HTML als `index.html.before-heerlen-design`. Opnieuw uitvoeren maakt geen dubbele scripts aan.

De vijf assets zijn:

- `amsterdam-heerlen.css` — bestaande Amsterdam-componenten in Heerlen-stijl.
- `amsterdam-heerlen.js` — zijmenu, navigatie, thema en paginazoeker.
- `amsterdam-regulations.css` — Heerlen-regelgeving, afgeschermd van de overige pagina's.
- `amsterdam-regulations-data.js` — de overgenomen regels, aangepast naar Amsterdam.
- `amsterdam-regulations.js` — interactieve regelgeving.

Laat bestaande serverroutes, betaalwebhooks, omgevingsvariabelen en SPA-fallbacks intact. Bij een nieuwe originele appbuild moet de compatibiliteit opnieuw worden gecontroleerd.

## Terugzetten

Zet `index.html.before-heerlen-design` terug als `index.html`. Daarmee vervallen de nieuwe assetverwijzingen en wordt de oorspronkelijke weergave, inclusief het oorspronkelijke reglement, weer gebruikt. De vijf extra bestanden mogen daarna worden verwijderd.

## Lokaal ontwerpvoorbeeld

Voer `node preview.cjs` uit en open http://127.0.0.1:4300/regels#apv. Node.js 20 of nieuwer en internettoegang zijn nodig. Dit voorbeeld haalt de publieke originele app en gegevens van amsterdamrp.nl op en voegt lokaal de nieuwe assets toe. Het is afhankelijk van de bereikbaarheid van die website.

Het voorbeeld stuurt geen browsersessiecookies naar de originele server en blokkeert schrijfacties. De Discord-login verwijst naar de echte website. Aankopen, uploads, accountwijzigingen en rolclaims kunnen daarom niet vanuit het ontwerpvoorbeeld worden uitgevoerd. Deze beperking geldt voor `preview.cjs`, niet voor de installatie op de bestaande hosting.

## Controle

Zie `CONTROLE.md` voor de uitgevoerde controles en de resterende verificatie op de echte hosting. Test daar een volledige ingelogde checkout, betaling en levering, rolclaim en skinopslag met een geschikt testaccount voordat dit ontwerp voor alle bezoekers wordt ingeschakeld.
