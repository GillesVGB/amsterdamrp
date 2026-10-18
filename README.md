# Amsterdam Roleplay — nieuw ontwerp

Het nieuwe Amsterdam-ontwerp staat rechtstreeks in deze repository. Het gebruikt de uitstraling en regelgeving van Heerlen Roleplay, met Amsterdam als identiteit. De oude statische website is verwijderd op verzoek van de eigenaar. De vorige versie blijft terug te halen via commit `d5b2811f8224ac94233012d7f7523c15a0eed86d`.

Inbegrepen: navigatie, responsive styling, thema, paginazoeker, 65 APV-artikelen, strafcategorieën, algemene regels, Discord-regels, zoeken en filters, bewaarde artikelen, artikellinks en afdrukken. De serverstatuskaart bevat status, spelers, capaciteit, controletijd en vernieuwen. De knop Open FiveM is verwijderd.

## Lokaal bekijken

Node.js 20 of nieuwer en internettoegang zijn nodig. Er zijn geen npm-dependencies nodig.

```sh
npm run preview
```

Open http://127.0.0.1:4300/regels#apv. Voor de homepage: http://127.0.0.1:4300/.

Het voorbeeld haalt de publieke Amsterdam-app en gegevens van amsterdamrp.nl op en voegt de ontwerpbestanden lokaal toe. Deze repository bevat niet de oorspronkelijke React-broncode of backend. De preview is alleen-lezen: accountwijzigingen, betalingen, uploads en rolclaims worden geblokkeerd. De Discord-login gaat naar de bestaande website.

## Installeren op de bestaande Amsterdam-app

```sh
npm run apply -- --root /volledig/pad/naar/de/bestaande/publieke/webmap
```

Het script controleert de bestaande React-build, bewaart de originele index en voegt de vijf ontwerpassets toe. De bestaande backend blijft verantwoordelijk voor inloggen, afrekenen, betalingen, winkelgegevens, skins en rolclaims.

Dit project is een ontwerp- en integratiepakket. Alleen deze repository op een statische hosting publiceren levert de oorspronkelijke backendfuncties niet op. Er is geen automatische productie-deployment toegevoegd.

Zie [installatie en terugzetten](LEES-MIJ.md) en [uitgevoerde controles](CONTROLE.md).

## Bestanden controleren

```sh
npm run check
```
