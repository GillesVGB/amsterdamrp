# Bot.js aanpassen voor website-verificatie

Voeg dit toe bij je configuratie bovenaan `bot.js`, bijvoorbeeld onder je Supabase configuratie:

```js
const OVERHEID_PORTAL_URL = process.env.OVERHEID_PORTAL_URL || "https://overheid.amsterdamrp.store";
const BOT_CERTIFICATE_API_KEY = process.env.BOT_CERTIFICATE_API_KEY || "";
```

Voeg deze helper toe boven `async function stuurCertificaatNaarDM(...)`:

```js
async function maakWebsiteCertificaat(user, trainingNaam, score, slagingsgrens = 90) {
    if (!BOT_CERTIFICATE_API_KEY) {
        console.warn("BOT_CERTIFICATE_API_KEY ontbreekt; certificaat wordt niet op website opgeslagen.");
        return null;
    }

    const response = await fetch(`${OVERHEID_PORTAL_URL}/api/overheid/certificates/bot-issue`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${BOT_CERTIFICATE_API_KEY}`,
        },
        body: JSON.stringify({
            service: "Politie",
            holderName: user.globalName || user.username,
            discordId: user.id,
            trainingName: trainingNaam,
            score,
            maxScore: 100,
            passPercent: slagingsgrens,
            issuedBy: "Amsterdam Overheid Bot",
        }),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
        throw new Error(data.message || "Website certificaat kon niet worden opgeslagen.");
    }

    return data;
}
```

Vervang in `async function stuurCertificaatNaarDM(user, trainingNaam, score)` deze regel:

```js
const certNummer = `AMS-${Date.now().toString().slice(-8)}-${user.id.slice(-4)}`;
```

door:

```js
let websiteCertificaat = null;
try {
    websiteCertificaat = await maakWebsiteCertificaat(user, trainingNaam, score, TRAININGEN[trainingNaam]?.slagingsgrens || 90);
} catch (error) {
    console.error("Kon certificaat niet op website opslaan:", error.message);
}

const certNummer = websiteCertificaat?.certificate?.code || `AMS-${Date.now().toString().slice(-8)}-${user.id.slice(-4)}`;
const verifyUrl = websiteCertificaat?.verifyUrl || `${OVERHEID_PORTAL_URL}/overheid/verify.html?code=${encodeURIComponent(certNummer)}`;
```

Voeg in de `.addFields(...)` van het certificaat-embed dit veld toe, bijvoorbeeld direct na `Certificaat Nr.`:

```js
{ name: "Verificatie", value: `[Controleer certificaat](${verifyUrl})`, inline: false },
```

En pas de DM content aan naar bijvoorbeeld:

```js
content: `GEFELICITEERD! Je bent geslaagd voor **${trainingNaam}** met **${score}%**!\n\nHier is je officiele certificaat van de Amsterdamse Politie.\nVerifieer: ${verifyUrl}`,
```

Render env voor de bot:

```text
OVERHEID_PORTAL_URL=https://overheid.amsterdamrp.store
BOT_CERTIFICATE_API_KEY=dezelfde_lange_random_key_als_op_de_overheidsite
```

Render env voor de overheidsite:

```text
BOT_CERTIFICATE_API_KEY=dezelfde_lange_random_key_als_op_de_bot
```
