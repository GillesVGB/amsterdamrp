# Amsterdam Roleplay

Deze repository bevat de bestaande statische website in `outputs/` en het nieuwe Heerlen-ontwerp als integratiepakket in [`integrations/heerlen-design`](integrations/heerlen-design/LEES-MIJ.md).

Het nieuwe ontwerp is gemaakt voor de publieke React-app van amsterdamrp.nl. Die app en haar backend verschillen van de oudere statische website in deze repository. Daarom blijven de bestaande bestanden en standaard deployconfiguratie behouden. Het integratiepakket is apart toegevoegd; deze commit installeert het niet automatisch op amsterdamrp.nl.

## Nieuw ontwerp bekijken

Gebruik Node.js 20 of nieuwer:

```sh
npm run design:preview
```

Open http://127.0.0.1:4300/regels#apv. Het voorbeeld haalt de bestaande publieke Amsterdam-app op en voegt het nieuwe ontwerp en de overgenomen Heerlen-regels toe. Internettoegang is nodig. Het voorbeeld blokkeert schrijfacties en is niet bedoeld voor echte aankopen of accountwijzigingen.

## Installeren op de huidige Amsterdam-app

```sh
npm run design:apply -- --root /pad/naar/de/bestaande/publieke/webmap
```

Zie de [installatie-instructies](integrations/heerlen-design/LEES-MIJ.md) en het [controleverslag](integrations/heerlen-design/CONTROLE.md). Het script controleert de originele appbuild en bewaart een back-up van de index. Gebruik hiervoor de webmap van de huidige React-app; de oudere `outputs/`-map is geen geschikte installatiedoelmap.

## Bestaande statische website

```sh
npm run build
npm start
```

Deze commando's blijven de oudere statische website en haar bestaande status-API gebruiken.
