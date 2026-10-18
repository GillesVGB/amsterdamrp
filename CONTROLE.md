# Controle — 19 oktober 2026

Vooraf zijn de publieke Amsterdam- en Heerlen-websites vergeleken. De Amsterdam-app is een andere applicatie dan de eerder gebruikte statische APV-repository. Daarom is de bestaande publieke React-app als basis behouden en is het ontwerp met extra assets geïntegreerd. De huidige lokale preview gebruikt de originele app via een alleen-lezen proxy.

## Gecontroleerd

- De 65 APV-artikelen, 11 strafcategorieën, 9 algemene regels en 10 Discord-regels komen inhoudelijk overeen met de opgehaalde Heerlen-versie. De vergelijking staat alleen wijzigingen van Heerlen naar Amsterdam en de Discord-uitnodiging toe.
- APV-zoeken op artikelnummer en tekst, strafcategoriefilter, onderwerpkeuze, uitklappen/inklappen, bewaren en openen van bewaarde artikelen, directe artikellinks en mobiele navigatie.
- De winkel toont de oorspronkelijke 10 coinproducten; zoeken blijft werken. Productpagina openen, toevoegen aan de winkelmand, aantallen aanpassen, herladen met behoud van de winkelmand en verwijderen zijn gecontroleerd.
- De oorspronkelijke Discord-loginknop gebruikt nog hetzelfde OAuth-pad. Het loginverzoek is in de testbrowser afgevangen. Uitgelogde bezoekers houden de originele blokkade op afrekenen en Server ID. Met uitsluitend een gesimuleerde gebruiker in de testbrowser zijn de checkoutvelden gecontroleerd.
- De 3D-skin-editor, Woodland-preset, schuifregelaar, reset en tabblad Mijn skins zijn bediend. Het canvas blijft aanwezig. Er zijn geen skins opgeslagen of geclaimd.
- De leaderboards-tabbladen Coins en Uitgegeven zijn bediend. Privacy en voorwaarden blijven bereikbaar.
- Navigatie van home naar APV, onderwerpfilter en terug naar home, themaopslag en Ctrl+K-paginazoeker zijn gecontroleerd.
- Het installatiescript is tweemaal op een kopie van de originele index uitgevoerd. De tweede uitvoering levert dezelfde HTML op, zonder dubbele tags. De originele back-up blijft intact.

## Grenzen van deze controle

Er is geen echte Discord-aanmelding, betaling, levering, rolclaim, upload of skinopslag uitgevoerd. Hiervoor moeten de bestaande authenticatie, betaalprovider en serverkoppelingen op de echte hosting worden getest met een geschikt testaccount. De backend is niet vervangen en maakt geen deel uit van dit pakket.

Er zijn geen wijzigingen op amsterdamrp.nl gepubliceerd. Dit pakket moet op de bestaande hosting worden geïnstalleerd; een aparte statische hosting kan de bestaande backendfuncties niet zelfstandig leveren.

## Regels en herkomst

Bron voor de overgenomen regelgeving en het regelpagina-ontwerp: https://heerlenrp.netlify.app/content.js en https://heerlenrp.netlify.app/style.css, opgehaald op 19 oktober 2026. Bestaande verschillen tussen strafduren in artikelen en de strafcategorietabel zijn behouden, inclusief de toelichting om bij twijfel staff om verduidelijking te vragen.

## Laatste visuele en technische controles

- Geen horizontale overflow op 1440, 768, 390 en 320 pixels op APV, winkel, skin-editor en winkelmand.
- De originele React-bundle in de preview komt byte voor byte overeen met de opgehaalde Amsterdam-bundle.
- De professionele heropeningsmelding blijft correct na automatisch vernieuwen; een andere melding uit het beheer wordt niet herschreven.
- De login gebruikt hetzelfde Discord-lijnicoon als het communityblok.
- Geen JavaScript-fouten en geen schrijfacties naar externe APIs in de laatste controle.

## Serverstatuskaart

De gekozen kaart heeft Online/Offline/Onbekend, spelerstelling, capaciteit, controletijd en vernieuwen. De bron is de bestaande `/api/server/status`-koppeling. Alleen verse gegevens (maximaal 90 seconden oud) met een expliciete livebevestiging tonen Online. Nul spelers betekent op zichzelf niet Offline. Ontbrekende, gecachete, verouderde of onbereikbare gegevens tonen Onbekend en geen oude speleraantallen. Getest met online (0/128), expliciet offline, verouderde gegevens, live=false en netwerkfout, inclusief mobiele weergave en navigatie terug naar de APV.
