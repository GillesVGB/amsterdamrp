// bot.js - OVERHEID BOT MET SUPABASE OPSLAG (AMSTERDAM THEMA)
// ============================================
// OVERHEID PORTAAL - AMSTERDAM
// ============================================

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField, ChannelType, REST, Routes } = require('discord.js');
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// ============================================
// CONFIGURATIE
// ============================================
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1509476480638386206";
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || "1402056739985162394";
const ALLOWED_ROLE_ID = process.env.ALLOWED_ROLE_ID || "1504849566816796814";
const SOLLICITATIE_KANAAL_ID = process.env.SOLLICITATIE_KANAAL_ID || "1509674799671017664";
const VOG_PANEL_KANAAL_ID = process.env.VOG_PANEL_KANAAL_ID || "1513286141317615687";
const VOG_KANAAL_ID = process.env.VOG_KANAAL_ID || "1513290970668466329";
const TICKET_CATEGORIE_ID = process.env.TICKET_CATEGORIE_ID || "1511105192744194252";
// Website certificaat verificatie
const OVERHEID_PORTAL_URL = (process.env.OVERHEID_PORTAL_URL || "https://overheid.amsterdamrp.store").replace(/\/+$/, "");
const BOT_CERTIFICATE_API_KEY = process.env.BOT_CERTIFICATE_API_KEY || "";

// Log kanalen per dienst
const LOG_KANALEN = {
    politie: "1512960335399747695",
    ambulance: "1512960043195174962",
    pechhulp: "1512960277480476672",
    advocatuur: "1512960200154546337",
    beoordelingen: "1512960335399747695"
};

// Strike rollen
const STRIKE_ROLLEN = {
    1: "1504849633007108137",
    2: "1504849633845973003",
    3: "1504849635053666375"
};

// Supabase configuratie
const SUPABASE_URL = process.env.SUPABASE_URL || "https://igazfmsvevbkvzrjodzj.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY || "";

// Initialiseer Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Avatar URL (Amsterdam thema)
const BOT_AVATAR_URL = "https://cdn.discordapp.com/attachments/1507087328752177214/1515764203657494638/IMG_0944.png?ex=6a3030eb&is=6a2edf6b&hm=a1c841b7044e676a82f0e4826f63501158452bc5e2656a2e6e869b2bf5b9f7f8&";

// Kleuren thema (wit & lichtblauw)
const THEMA = {
    primary: 0x87CEEB,
    secondary: 0xADD8E6,
    success: 0x00CED1,
    error: 0xFF6B6B,
    warning: 0xFFD700,
    info: 0x4FC3F7,
    white: 0xFFFFFF,
    accent: 0xB0E0E6
};

// SLAAGCIJFER (55% = 55 punten)
const SLAGINGSGRENS = 55;

// ============================================
// SOLLICITATIE VRAGEN - ALLEEN UITLEG VRAGEN
// ============================================
const SOLLICITATIE_VRAGEN = {
    politie: {
        naam: "Politie Amsterdam",
        emoji: "👮",
        kleur: THEMA.primary,
        wsRol: "1504849455843774575",
        actief: true,
        maxScore: 100,
        vogVerplicht: true,
        vragen: [
            // GEEN PUNTEN (informatief)
            { vraag: "Wat is je Discord naam?", maxScore: 0, type: "none", belangrijk: false },
            { vraag: "Wat is je leeftijd?", maxScore: 0, type: "none", belangrijk: false },
            { vraag: "Wat is je in-game naam?", maxScore: 0, type: "none", belangrijk: false },
            { vraag: "Hoeveel uur per week ben je beschikbaar?", maxScore: 0, type: "none", belangrijk: false },
            
            // PUNTEN VRAGEN - ALLEEN UITLEG (totaal 100)
            { vraag: "Beschrijf je eerdere roleplay ervaring. Waar heb je meegespeeld en wat was je rol?", maxScore: 10, type: "text", belangrijk: true },
            { vraag: "Wat motiveert jou om agent te worden in Amsterdam? Geef een uitgebreide toelichting.", maxScore: 12, type: "text", belangrijk: true },
            { vraag: "Waarom denk jij dat wij jou moeten aannemen? Wat maakt jou geschikt?", maxScore: 12, type: "text", belangrijk: true },
            { vraag: "Noem en beschrijf 3 sterke punten die je hebt. Waarom zijn dit jouw sterke punten?", maxScore: 9, type: "list", belangrijk: true },
            { vraag: "Noem en beschrijf 3 zwakke punten. Hoe werk je hieraan?", maxScore: 9, type: "list", belangrijk: true },
            { vraag: "Beschrijf jouw ervaring met politie roleplay. Wat heb je geleerd en wat vond je leuk?", maxScore: 8, type: "text", belangrijk: true },
            { vraag: "Hoe ga je om met conflicten tussen collega's of met burgers? Geef een voorbeeld.", maxScore: 8, type: "text", belangrijk: true },
            { vraag: "Wat zijn volgens jou de belangrijkste serverregels en waarom zijn ze belangrijk?", maxScore: 8, type: "text", belangrijk: true },
            { vraag: "Wat zijn de belangrijkste politieprocedures die je moet kennen? Leg uit.", maxScore: 8, type: "text", belangrijk: true },
            { vraag: "Wat verstaan we onder professionele roleplay? Geef voorbeelden.", maxScore: 6, type: "text", belangrijk: false },
            { vraag: "Scenario: Je ziet een collega een overtreding maken tijdens een dienst. Wat doe je? Beschrijf stap voor stap.", maxScore: 10, type: "scenario", belangrijk: true },
            { vraag: "Scenario: Een burger is agressief en weigert mee te werken. Wat is jouw aanpak? Beschrijf stap voor stap.", maxScore: 10, type: "scenario", belangrijk: true }
        ]
    },
    ambulance: {
        naam: "Ambulance Amsterdam",
        emoji: "🚑",
        kleur: THEMA.secondary,
        wsRol: "1504849564186710229",
        actief: true,
        maxScore: 100,
        vogVerplicht: true,
        vragen: [
            { vraag: "Wat is je Discord naam?", maxScore: 0, type: "none", belangrijk: false },
            { vraag: "Wat is je leeftijd?", maxScore: 0, type: "none", belangrijk: false },
            { vraag: "Wat is je in-game naam?", maxScore: 0, type: "none", belangrijk: false },
            { vraag: "Hoeveel uur per week ben je beschikbaar?", maxScore: 0, type: "none", belangrijk: false },
            
            { vraag: "Beschrijf je eerdere roleplay ervaring. Waar heb je meegespeeld?", maxScore: 10, type: "text", belangrijk: true },
            { vraag: "Wat motiveert jou om bij de ambulance te werken in Amsterdam?", maxScore: 12, type: "text", belangrijk: true },
            { vraag: "Waarom denk jij dat wij jou moeten aannemen?", maxScore: 12, type: "text", belangrijk: true },
            { vraag: "Noem en beschrijf 3 sterke punten die je hebt.", maxScore: 9, type: "list", belangrijk: true },
            { vraag: "Noem en beschrijf 3 zwakke punten en hoe je eraan werkt.", maxScore: 9, type: "list", belangrijk: true },
            { vraag: "Heb je EHBO-kennis of medische ervaring? Zo ja, beschrijf wat je kunt.", maxScore: 8, type: "text", belangrijk: true },
            { vraag: "Hoe ga je om met stressvolle situaties, zoals een ernstig ongeval?", maxScore: 8, type: "text", belangrijk: true },
            { vraag: "Hoe ga je om met agressieve omstanders terwijl je een patiënt behandelt?", maxScore: 8, type: "text", belangrijk: true },
            { vraag: "Wat zijn volgens jou de belangrijkste serverregels?", maxScore: 8, type: "text", belangrijk: true },
            { vraag: "Wat verstaan we onder professionele roleplay binnen de ambulance dienst?", maxScore: 6, type: "text", belangrijk: false },
            { vraag: "Scenario: Je wordt opgeroepen voor een hartstilstand in het centrum. Wat is jouw aanpak?", maxScore: 10, type: "scenario", belangrijk: true },
            { vraag: "Scenario: Omstanders bemoeien zich met je werk en worden agressief. Wat doe je?", maxScore: 10, type: "scenario", belangrijk: true }
        ]
    },
    pechhulp: {
        naam: "Pechhulp Amsterdam",
        emoji: "🔧",
        kleur: THEMA.accent,
        wsRol: "1504849570075770982",
        actief: true,
        maxScore: 100,
        vogVerplicht: false,
        vragen: [
            { vraag: "Wat is je Discord naam?", maxScore: 0, type: "none", belangrijk: false },
            { vraag: "Wat is je leeftijd?", maxScore: 0, type: "none", belangrijk: false },
            { vraag: "Wat is je in-game naam?", maxScore: 0, type: "none", belangrijk: false },
            { vraag: "Hoeveel uur per week ben je beschikbaar?", maxScore: 0, type: "none", belangrijk: false },
            
            { vraag: "Beschrijf je eerdere roleplay ervaring of werkervaring met voertuigen.", maxScore: 10, type: "text", belangrijk: true },
            { vraag: "Wat motiveert jou om bij de pechhulp te werken in Amsterdam?", maxScore: 12, type: "text", belangrijk: true },
            { vraag: "Waarom denk jij dat wij jou moeten aannemen?", maxScore: 12, type: "text", belangrijk: true },
            { vraag: "Noem en beschrijf 3 sterke punten die je hebt voor deze functie.", maxScore: 9, type: "list", belangrijk: true },
            { vraag: "Noem en beschrijf 3 zwakke punten en hoe je eraan werkt.", maxScore: 9, type: "list", belangrijk: true },
            { vraag: "Beschrijf jouw technische kennis van voertuigen. Wat kun je allemaal?", maxScore: 10, type: "text", belangrijk: true },
            { vraag: "Heb je een rijbewijs? Zo ja, welke ervaring heb je met rijden?", maxScore: 5, type: "text", belangrijk: true },
            { vraag: "Hoe ga je om met boze of geïrriteerde klanten? Geef een voorbeeld.", maxScore: 8, type: "text", belangrijk: true },
            { vraag: "Wat zijn volgens jou de belangrijkste serverregels?", maxScore: 8, type: "text", belangrijk: true },
            { vraag: "Wat verstaan we onder professionele hulpverlening?", maxScore: 5, type: "text", belangrijk: false },
            { vraag: "Scenario: Een auto staat gestrand op de snelweg. Wat is jouw veilige aanpak?", maxScore: 9, type: "scenario", belangrijk: true },
            { vraag: "Scenario: Een klant weigert te betalen voor de geleverde pechhulp. Wat doe je?", maxScore: 9, type: "scenario", belangrijk: true }
        ]
    },
    advocatuur: {
        naam: "Advocatuur Amsterdam",
        emoji: "⚖️",
        kleur: THEMA.info,
        wsRol: null,
        actief: false,
        maxScore: 100,
        vogVerplicht: true,
        vragen: [
            { vraag: "Wat is je Discord naam?", maxScore: 0, type: "none", belangrijk: false },
            { vraag: "Wat is je leeftijd?", maxScore: 0, type: "none", belangrijk: false },
            { vraag: "Wat is je in-game naam?", maxScore: 0, type: "none", belangrijk: false },
            { vraag: "Hoeveel uur per week ben je beschikbaar?", maxScore: 0, type: "none", belangrijk: false },
            
            { vraag: "Beschrijf jouw juridische kennis of ervaring. Wat weet je van wetten en regels?", maxScore: 15, type: "text", belangrijk: true },
            { vraag: "Wat motiveert jou om advocaat te worden in Amsterdam?", maxScore: 12, type: "text", belangrijk: true },
            { vraag: "Waarom denk jij dat wij jou moeten aannemen als advocaat?", maxScore: 12, type: "text", belangrijk: true },
            { vraag: "Noem en beschrijf 3 sterke punten die je hebt voor deze functie.", maxScore: 9, type: "list", belangrijk: true },
            { vraag: "Noem en beschrijf 3 zwakke punten en hoe je eraan werkt.", maxScore: 9, type: "list", belangrijk: true },
            { vraag: "Hoe bereid jij een juridische zaak voor? Beschrijf je werkwijze.", maxScore: 10, type: "text", belangrijk: true },
            { vraag: "Hoe ga je om met conflicten tussen cliënten of met de rechtbank?", maxScore: 8, type: "text", belangrijk: true },
            { vraag: "Wat zijn volgens jou de belangrijkste serverregels?", maxScore: 8, type: "text", belangrijk: true },
            { vraag: "Wat is volgens jou een eerlijk proces? Leg uit.", maxScore: 5, type: "text", belangrijk: false },
            { vraag: "Wat zijn de rechten van een verdachte? Noem en beschrijf er een aantal.", maxScore: 5, type: "text", belangrijk: false },
            { vraag: "Scenario: Je cliënt bekent schuld aan jou. Wat doe je?", maxScore: 7, type: "scenario", belangrijk: true },
            { vraag: "Scenario: De rechter is duidelijk bevooroordeeld tegen jouw cliënt. Wat doe je?", maxScore: 7, type: "scenario", belangrijk: true }
        ]
    }
};

// ============================================
// INIT
// ============================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

function heeftToegang(member) {
    return member?.roles?.cache?.has(ALLOWED_ROLE_ID) || member?.permissions?.has(PermissionsBitField.Flags.Administrator) || false;
}

function formatUptime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h`;
    if (h > 0) return `${h}u ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
}

// ============================================
// SOLLICITATIE BEOORDELING OPSLAG (Supabase)
// ============================================
const teBeoordelenSollicitaties = new Map();

async function createSollicitatiesTabel() {
    try {
        const { error } = await supabase.from('sollicitaties').select('count').limit(1);
        if (error && error.message.includes('does not exist')) {
            console.log('⚠️ Let op: Maak de sollicitaties tabel aan in Supabase met:');
            console.log(`
CREATE TABLE sollicitaties (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_naam VARCHAR(100),
    dienst VARCHAR(50),
    antwoorden JSONB,
    scores JSONB,
    totaal_score INTEGER,
    max_score INTEGER,
    status VARCHAR(20) DEFAULT 'pending',
    feedback JSONB,
    beoordeeld_door VARCHAR(100),
    beoordeeld_op TIMESTAMP,
    datum TIMESTAMP DEFAULT NOW()
);
            `);
        }
    } catch (error) {
        console.log('Kon tabel niet checken:', error.message);
    }
}

async function slaSollicitatieOp(userId, userName, dienstId, antwoorden, scores, totaalScore, maxScore) {
    try {
        const { error } = await supabase
            .from('sollicitaties')
            .insert({
                user_id: userId,
                user_naam: userName,
                dienst: dienstId,
                antwoorden: antwoorden,
                scores: scores,
                totaal_score: totaalScore,
                max_score: maxScore,
                status: 'pending',
                datum: new Date().toISOString()
            });
        
        if (error) {
            console.error('Fout bij opslaan sollicitatie:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Fout bij opslaan sollicitatie:', error);
        return false;
    }
}

async function getSollicitatie(userId, dienstId) {
    try {
        const { data, error } = await supabase
            .from('sollicitaties')
            .select('*')
            .eq('user_id', userId)
            .eq('dienst', dienstId)
            .order('datum', { ascending: false })
            .limit(1)
            .maybeSingle();
        
        if (error) {
            console.error('Fout bij ophalen sollicitatie:', error);
            return null;
        }
        return data;
    } catch (error) {
        console.error('Fout bij ophalen sollicitatie:', error);
        return null;
    }
}

async function updateSollicitatieStatus(id, status, score, feedback, beoordelaar) {
    try {
        const { error } = await supabase
            .from('sollicitaties')
            .update({
                status: status,
                totaal_score: score,
                feedback: feedback,
                beoordeeld_door: beoordelaar,
                beoordeeld_op: new Date().toISOString()
            })
            .eq('id', id);
        
        if (error) console.error('Fout bij updaten sollicitatie:', error);
    } catch (error) {
        console.error('Fout bij updaten sollicitatie:', error);
    }
}

// ============================================
// INHOUDELIJKE BEOORDELING
// ============================================
function normaliseerAntwoord(waarde) {
    return String(waarde || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function bevatEenVan(text, woorden) {
    return woorden.some((woord) => text.includes(normaliseerAntwoord(woord)));
}

function telRubricGroepen(text, groepen) {
    return groepen.reduce((totaal, groep) => totaal + (bevatEenVan(text, groep) ? 1 : 0), 0);
}

function isLeegOfOnserieus(text) {
    if (!text) return true;
    return ["idk", "weet niet", "geen idee", "nvt", "n.v.t", "-", "nee", "ja", "ok", "test"].includes(text);
}

function scoreLijstAntwoord(antwoord, vraagConfig) {
    const maxScore = vraagConfig.maxScore;
    const text = normaliseerAntwoord(antwoord);
    if (isLeegOfOnserieus(text)) return 0;
    const punten = String(antwoord || "").split(/[\n;,]+|\d+[.)-]/).map((punt) => punt.trim()).filter((punt) => normaliseerAntwoord(punt).length > 2);
    const vraag = normaliseerAntwoord(vraagConfig.vraag);
    const isZwak = vraag.includes("zwakke");
    const basisGroepen = isZwak
        ? [["feedback", "verbeter", "oefen", "leren", "werk eraan"], ["planning", "geduld", "stress", "communicatie", "twijfel"], ["reflectie", "bewust", "oplossen", "training"]]
        : [["communicatie", "rustig", "teamwork", "samenwerken"], ["professioneel", "betrouwbaar", "eerlijk", "respect"], ["leergierig", "leiding", "stressbestendig", "geduldig"]];
    const itemScore = Math.min(3, punten.length) / 3;
    const inhoudScore = telRubricGroepen(text, basisGroepen) / basisGroepen.length;
    return Math.round(maxScore * Math.min(1, (itemScore * 0.55) + (inhoudScore * 0.45)));
}

function rubricVoorSollicitatieVraag(vraag, type) {
    const q = normaliseerAntwoord(vraag);
    if (type === "scenario") return [["eerst", "stap", "daarna", "vervolgens"], ["rust", "kalmeren", "de-escaleren", "afstand"], ["melden", "leiding", "porto", "collega"], ["veilig", "protocol", "procedure"], ["noteren", "rapport", "bewijs", "registreren"]];
    if (q.includes("roleplay ervaring") || q.includes("ervaring")) return [["roleplay", "rp", "server"], ["ervaring", "gespeeld", "functie", "rol"], ["geleerd", "ontwikkeld", "situatie"], ["professioneel", "realistisch", "kwaliteit"]];
    if (q.includes("motiveert")) return [["motivatie", "helpen", "bijdragen"], ["amsterdam", "community", "stad"], ["dienst", "team", "samenwerken"], ["leren", "groeien", "inzetten"]];
    if (q.includes("aannemen") || q.includes("geschikt")) return [["geschikt", "kwaliteit", "sterk"], ["ervaring", "kennis", "vaardigheid"], ["team", "communicatie", "betrouwbaar"], ["voorbeeld", "waarom", "omdat"]];
    if (q.includes("conflict") || q.includes("agressief") || q.includes("boze")) return [["rust", "kalmeren", "de-escaleren"], ["luisteren", "communicatie", "respect"], ["grenzen", "protocol", "veiligheid"], ["collega", "leiding", "melding"]];
    if (q.includes("serverregels")) return [["rdm", "vdm", "failrp", "powergaming", "metagaming"], ["respect", "realistisch", "roleplay"], ["bewijs", "clip", "staffzaak"], ["waarom", "belangrijk", "kwaliteit"]];
    if (q.includes("procedure") || q.includes("rechten") || q.includes("arrestant")) return [["rechten", "zwijgrecht", "advocaat"], ["fouilleren", "aanhouding", "reden"], ["porto", "rapport", "registreren"], ["protocol", "procedure", "bewijs"]];
    if (q.includes("ehbo") || q.includes("medisch") || q.includes("hartstilstand") || q.includes("ambulance")) return [["veiligheid", "ademhaling", "bewustzijn"], ["reanimatie", "stabiele zijligging", "bloeding"], ["patient", "triage", "overdracht"], ["rust", "omstanders", "communicatie"]];
    if (q.includes("voertuig") || q.includes("pechhulp") || q.includes("rijbewijs")) return [["veiligheid", "weg", "afzetten"], ["voertuig", "motor", "band", "reparatie"], ["klant", "service", "communicatie"], ["factuur", "betaling", "procedure"]];
    if (q.includes("juridisch") || q.includes("advocaat") || q.includes("rechter") || q.includes("verdachte")) return [["wet", "recht", "procedure"], ["client", "verdachte", "rechten"], ["bewijs", "dossier", "zaak"], ["objectief", "eerlijk", "rechtbank"]];
    return [["voorbeeld", "omdat", "situatie"], ["professioneel", "respect", "communicatie"], ["team", "leiding", "protocol"], ["amsterdam", "roleplay", "community"]];
}

function berekenScoreVoorVraag(antwoord, vraagConfig) {
    const maxScore = vraagConfig.maxScore;
    if (maxScore === 0) return 0;
    const text = normaliseerAntwoord(antwoord);
    if (isLeegOfOnserieus(text)) return 0;
    if (vraagConfig.type === "list") return scoreLijstAntwoord(antwoord, vraagConfig);
    const groepen = rubricVoorSollicitatieVraag(vraagConfig.vraag, vraagConfig.type);
    const hits = telRubricGroepen(text, groepen);
    let ratio = hits / groepen.length;
    if (bevatEenVan(text, ["bijvoorbeeld", "voorbeeld", "omdat", "daarom", "stap", "eerst", "daarna"])) ratio += 0.12;
    if (vraagConfig.belangrijk && hits < 2) ratio *= 0.55;
    if (text.split(" ").length < 6) ratio = Math.min(ratio, 0.25);
    return Math.round(maxScore * Math.max(0, Math.min(1, ratio)));
}

// ============================================
// POLITIE ROEPNUMMER FUNCTIES (Supabase)
// ============================================
async function getPolitieRangVanGebruiker(member) {
    try {
        const { data: rollen, error } = await supabase
            .from('politie_rollen')
            .select('*')
            .order('rang_volgorde', { ascending: true });
        
        if (error) throw error;
        
        for (const rol of rollen) {
            if (member.roles.cache.has(rol.discord_rol_id)) {
                return rol;
            }
        }
        return null;
    } catch (error) {
        console.error('Fout bij ophalen politie rang:', error);
        return null;
    }
}

async function getHuidigRoepnummer(discordId) {
    try {
        const { data, error } = await supabase
            .from('gebruiker_roepnummers')
            .select('*')
            .eq('discord_id', discordId)
            .maybeSingle();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Fout bij ophalen huidig roepnummer:', error);
        return null;
    }
}

async function zoekVrijRoepnummerVoorRang(rangNaam) {
    try {
        const { data, error } = await supabase
            .from('politie_roepnummers')
            .select('*')
            .eq('rang_naam', rangNaam)
            .eq('status', 'vrij')
            .order('volgnummer', { ascending: true })
            .limit(1)
            .maybeSingle();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Fout bij zoeken vrij roepnummer:', error);
        return null;
    }
}

async function kenRoepnummerToe(discordId, discordNaam, rangNaam, dienstnummer) {
    try {
        const { error: updateError } = await supabase
            .from('politie_roepnummers')
            .update({
                status: 'bezet',
                toegewezen_aan_discord_id: discordId,
                toegewezen_aan_naam: discordNaam,
                toegewezen_op: new Date().toISOString()
            })
            .eq('dienstnummer', dienstnummer);
        
        if (updateError) throw updateError;
        
        const { error: upsertError } = await supabase
            .from('gebruiker_roepnummers')
            .upsert({
                discord_id: discordId,
                discord_naam: discordNaam,
                rang_naam: rangNaam,
                dienstnummer: dienstnummer,
                toegewezen_op: new Date().toISOString(),
                laatst_gezien: new Date().toISOString()
            }, {
                onConflict: 'discord_id'
            });
        
        if (upsertError) throw upsertError;
        
        return { success: true };
    } catch (error) {
        console.error('Fout bij toekennen roepnummer:', error);
        return { success: false, error: error.message };
    }
}

async function geefRoepnummerVrij(discordId, dienstnummer) {
    try {
        const { error: updateError } = await supabase
            .from('politie_roepnummers')
            .update({
                status: 'vrij',
                toegewezen_aan_discord_id: null,
                toegewezen_aan_naam: null,
                toegewezen_op: null
            })
            .eq('dienstnummer', dienstnummer);
        
        if (updateError) throw updateError;
        
        const { error: deleteError } = await supabase
            .from('gebruiker_roepnummers')
            .delete()
            .eq('discord_id', discordId);
        
        if (deleteError) throw deleteError;
        
        return { success: true };
    } catch (error) {
        console.error('Fout bij vrijgeven roepnummer:', error);
        return { success: false, error: error.message };
    }
}

async function updateLaatstGezien(discordId) {
    try {
        await supabase
            .from('gebruiker_roepnummers')
            .update({ laatst_gezien: new Date().toISOString() })
            .eq('discord_id', discordId);
    } catch (error) {
        console.error('Fout bij update laatst gezien:', error);
    }
}

async function getAllGebruikersMetRoepnummers() {
    try {
        const { data, error } = await supabase
            .from('gebruiker_roepnummers')
            .select('*')
            .order('toegewezen_op', { ascending: false });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Fout bij ophalen alle gebruikers:', error);
        return [];
    }
}

async function checkEnKenRoepnummerToe(member) {
    try {
        const politieRang = await getPolitieRangVanGebruiker(member);
        
        if (!politieRang) {
            const huidig = await getHuidigRoepnummer(member.id);
            if (huidig) {
                await geefRoepnummerVrij(member.id, huidig.dienstnummer);
                console.log(`Roepnummer ${huidig.dienstnummer} vrij van ${member.user.username}`);
            }
            return;
        }
        
        const huidig = await getHuidigRoepnummer(member.id);
        
        if (huidig) {
            if (huidig.rang_naam !== politieRang.rang_naam) {
                await geefRoepnummerVrij(member.id, huidig.dienstnummer);
                const nieuwRoepnummer = await zoekVrijRoepnummerVoorRang(politieRang.rang_naam);
                if (nieuwRoepnummer) {
                    await kenRoepnummerToe(member.id, member.user.username, politieRang.rang_naam, nieuwRoepnummer.dienstnummer);
                    await member.send(`Je bent gepromoveerd naar **${politieRang.rang_naam}**! Je nieuwe roepnummer is **${nieuwRoepnummer.dienstnummer}**.`);
                }
            } else {
                await updateLaatstGezien(member.id);
            }
        } else {
            const vrijRoepnummer = await zoekVrijRoepnummerVoorRang(politieRang.rang_naam);
            
            if (vrijRoepnummer) {
                await kenRoepnummerToe(member.id, member.user.username, politieRang.rang_naam, vrijRoepnummer.dienstnummer);
                await member.send(`Je hebt een roepnummer gekregen voor **${politieRang.rang_naam}**!\n\nJe roepnummer is: **${vrijRoepnummer.dienstnummer}**\n\nGebruik /roepnummer om je gegevens te bekijken.`);
                console.log(`Roepnummer ${vrijRoepnummer.dienstnummer} toegekend aan ${member.user.username} (${politieRang.rang_naam})`);
            } else {
                console.log(`Geen vrije roepnummers meer voor rang ${politieRang.rang_naam}`);
                const staffChannel = await client.channels.fetch(LOG_KANALEN.politie);
                if (staffChannel) {
                    await staffChannel.send(`⚠️ **WAARSCHUWING:** Geen vrije roepnummers meer voor rang **${politieRang.rang_naam}**! ${member.user.username} kon geen roepnummer krijgen.`);
                }
            }
        }
    } catch (error) {
        console.error('Fout bij checkEnKenRoepnummerToe:', error);
    }
}

// ============================================
// ROEPNUMMER COMMANDO HANDLER
// ============================================
async function handleRoepnummer(interaction) {
    const subCommand = interaction.options.getSubcommand();
    
    if (subCommand === 'mijn') {
        await interaction.deferReply({ flags: 64 });
        
        const huidig = await getHuidigRoepnummer(interaction.user.id);
        
        if (!huidig) {
            const embed = new EmbedBuilder()
                .setColor(THEMA.error)
                .setTitle('❌ Geen roepnummer gevonden')
                .setDescription(`Je hebt nog geen roepnummer toegewezen.\n\nZorg dat je de juiste politie rol hebt. Gebruik /roepnummer nieuw om er een te krijgen.`)
                .setFooter({ text: "Amsterdam Politie Database", iconURL: BOT_AVATAR_URL })
                .setTimestamp();
            
            return interaction.editReply({ embeds: [embed], flags: 64 });
        }
        
        await updateLaatstGezien(interaction.user.id);
        
        const embed = new EmbedBuilder()
            .setColor(THEMA.primary)
            .setTitle('👮 Jouw Politie Gegevens - Amsterdam')
            .setDescription(`Hier zijn jouw politie gegevens uit de database van **Amsterdam**:`)
            .addFields(
                { name: "🏷️ Rang", value: `${huidig.rang_naam}`, inline: true },
                { name: "📞 Dienstnummer", value: `${huidig.dienstnummer}`, inline: true },
                { name: "💬 Discord", value: `${interaction.user.username}`, inline: true },
                { name: "📅 Toegewezen op", value: `${new Date(huidig.toegewezen_op).toLocaleString('nl-NL')}`, inline: false }
            )
            .setFooter({ text: "Amsterdam Politie - Gemeente Amsterdam", iconURL: BOT_AVATAR_URL })
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed], flags: 64 });
    }
    
    else if (subCommand === 'nieuw') {
        await interaction.deferReply({ flags: 64 });
        
        const politieRang = await getPolitieRangVanGebruiker(interaction.member);
        
        if (!politieRang) {
            const embed = new EmbedBuilder()
                .setColor(THEMA.error)
                .setTitle('❌ Geen politie rol gevonden')
                .setDescription(`Je hebt geen politie rol in Discord.\n\nAlleen leden met een politie rol kunnen een roepnummer krijgen.`)
                .setFooter({ text: "Amsterdam Politie Database", iconURL: BOT_AVATAR_URL })
                .setTimestamp();
            
            return interaction.editReply({ embeds: [embed], flags: 64 });
        }
        
        const huidig = await getHuidigRoepnummer(interaction.user.id);
        
        if (huidig) {
            await geefRoepnummerVrij(interaction.user.id, huidig.dienstnummer);
            
            const nieuwRoepnummer = await zoekVrijRoepnummerVoorRang(politieRang.rang_naam);
            
            if (!nieuwRoepnummer) {
                const embed = new EmbedBuilder()
                    .setColor(THEMA.error)
                    .setTitle('❌ Geen vrije roepnummers')
                    .setDescription(`Er zijn geen vrije roepnummers meer voor de rang **${politieRang.rang_naam}**.\n\nNeem contact op met de korpsleiding van Amsterdam.`)
                    .setFooter({ text: "Amsterdam Politie Database", iconURL: BOT_AVATAR_URL })
                    .setTimestamp();
                
                return interaction.editReply({ embeds: [embed], flags: 64 });
            }
            
            await kenRoepnummerToe(interaction.user.id, interaction.user.username, politieRang.rang_naam, nieuwRoepnummer.dienstnummer);
            
            const embed = new EmbedBuilder()
                .setColor(THEMA.success)
                .setTitle('✅ Nieuw roepnummer toegewezen')
                .setDescription(`Je oude roepnummer **${huidig.dienstnummer}** is vrijgegeven.`)
                .addFields(
                    { name: "🆕 Nieuw roepnummer", value: `**${nieuwRoepnummer.dienstnummer}**`, inline: true },
                    { name: "🏷️ Rang", value: `${politieRang.rang_naam}`, inline: true }
                )
                .setFooter({ text: "Amsterdam Politie", iconURL: BOT_AVATAR_URL })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed], flags: 64 });
            await interaction.user.send(`Je hebt een nieuw roepnummer gekregen!\n\n**Oud:** ${huidig.dienstnummer}\n**Nieuw:** ${nieuwRoepnummer.dienstnummer}\n**Rang:** ${politieRang.rang_naam}`);
            
        } else {
            const vrijRoepnummer = await zoekVrijRoepnummerVoorRang(politieRang.rang_naam);
            
            if (!vrijRoepnummer) {
                const embed = new EmbedBuilder()
                    .setColor(THEMA.error)
                    .setTitle('❌ Geen vrije roepnummers')
                    .setDescription(`Er zijn geen vrije roepnummers meer voor de rang **${politieRang.rang_naam}**.`)
                    .setFooter({ text: "Amsterdam Politie Database", iconURL: BOT_AVATAR_URL })
                    .setTimestamp();
                
                return interaction.editReply({ embeds: [embed], flags: 64 });
            }
            
            await kenRoepnummerToe(interaction.user.id, interaction.user.username, politieRang.rang_naam, vrijRoepnummer.dienstnummer);
            
            const embed = new EmbedBuilder()
                .setColor(THEMA.success)
                .setTitle('✅ Roepnummer toegewezen')
                .setDescription(`Je hebt een roepnummer gekregen voor de rang **${politieRang.rang_naam}**!`)
                .addFields(
                    { name: "📞 Roepnummer", value: `**${vrijRoepnummer.dienstnummer}**`, inline: true },
                    { name: "🏷️ Rang", value: `${politieRang.rang_naam}`, inline: true }
                )
                .setFooter({ text: "Welkom bij de Amsterdamse Politie!", iconURL: BOT_AVATAR_URL })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed], flags: 64 });
            await interaction.user.send(`Je hebt een roepnummer gekregen!\n\n**Roepnummer:** ${vrijRoepnummer.dienstnummer}\n**Rang:** ${politieRang.rang_naam}\n\nWelkom bij de Amsterdamse Politie! 🚔`);
        }
    }
    
    else if (subCommand === 'vrijgeven') {
        await interaction.deferReply({ flags: 64 });
        
        const huidig = await getHuidigRoepnummer(interaction.user.id);
        
        if (!huidig) {
            return interaction.editReply({ content: '❌ Je hebt momenteel geen roepnummer toegewezen.', flags: 64 });
        }
        
        const result = await geefRoepnummerVrij(interaction.user.id, huidig.dienstnummer);
        
        if (result.success) {
            const embed = new EmbedBuilder()
                .setColor(THEMA.warning)
                .setTitle('🔓 Roepnummer Vrijgegeven')
                .setDescription(`Je hebt roepnummer **${huidig.dienstnummer}** vrij.`)
                .addFields(
                    { name: "🏷️ Rang", value: `${huidig.rang_naam}`, inline: true },
                    { name: "📞 Dienstnummer", value: `${huidig.dienstnummer}`, inline: true }
                )
                .setFooter({ text: "Gebruik /roepnummer nieuw voor een nieuw nummer", iconURL: BOT_AVATAR_URL })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed], flags: 64 });
            await interaction.user.send(`Je hebt je roepnummer **${huidig.dienstnummer}** vrij.\n\nGebruik /roepnummer nieuw voor een nieuw nummer.`);
        } else {
            await interaction.editReply({ content: `❌ Fout bij vrijgeven: ${result.error}`, flags: 64 });
        }
    }
    
    else if (subCommand === 'zoek') {
        if (!heeftToegang(interaction.member)) {
            return interaction.reply({ content: '❌ Alleen staff mag dit commando gebruiken.', flags: 64 });
        }
        
        await interaction.deferReply({ flags: 64 });
        
        const targetUser = interaction.options.getUser('gebruiker');
        
        if (!targetUser) {
            return interaction.editReply({ content: '❌ Geef een gebruiker op.', flags: 64 });
        }
        
        const roepnummer = await getHuidigRoepnummer(targetUser.id);
        
        if (!roepnummer) {
            const embed = new EmbedBuilder()
                .setColor(THEMA.error)
                .setTitle('❌ Geen roepnummer gevonden')
                .setDescription(`${targetUser.username} heeft geen roepnummer.`)
                .setFooter({ text: "Amsterdam Politie Database", iconURL: BOT_AVATAR_URL })
                .setTimestamp();
            
            return interaction.editReply({ embeds: [embed], flags: 64 });
        }
        
        const embed = new EmbedBuilder()
            .setColor(THEMA.success)
            .setTitle('👮 Politie Lid Gevonden - Amsterdam')
            .addFields(
                { name: "👤 Gebruiker", value: `${targetUser.username}`, inline: true },
                { name: "🏷️ Rang", value: `${roepnummer.rang_naam}`, inline: true },
                { name: "📞 Dienstnummer", value: `${roepnummer.dienstnummer}`, inline: true },
                { name: "📅 Toegewezen op", value: `${new Date(roepnummer.toegewezen_op).toLocaleString('nl-NL')}`, inline: false },
                { name: "👀 Laatst gezien", value: `${new Date(roepnummer.laatst_gezien).toLocaleString('nl-NL')}`, inline: false }
            )
            .setFooter({ text: "Amsterdam Politie Database", iconURL: BOT_AVATAR_URL })
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed], flags: 64 });
    }
    
    else if (subCommand === 'lijst') {
        if (!heeftToegang(interaction.member)) {
            return interaction.reply({ content: '❌ Alleen staff mag dit commando gebruiken.', flags: 64 });
        }
        
        await interaction.deferReply({ flags: 64 });
        
        const alleGebruikers = await getAllGebruikersMetRoepnummers();
        
        if (!alleGebruikers || alleGebruikers.length === 0) {
            return interaction.editReply({ content: '❌ Geen toegewezen roepnummers gevonden.', flags: 64 });
        }
        
        const perRang = {};
        for (const user of alleGebruikers) {
            if (!perRang[user.rang_naam]) perRang[user.rang_naam] = [];
            perRang[user.rang_naam].push(user);
        }
        
        let beschrijving = '';
        for (const [rang, users] of Object.entries(perRang)) {
            beschrijving += `\n**${rang}** (${users.length})\n`;
            for (const user of users) {
                beschrijving += `└ ${user.dienstnummer} - ${user.discord_naam}\n`;
            }
        }
        
        if (beschrijving.length > 4000) {
            beschrijving = beschrijving.substring(0, 4000) + '\n... (te veel resultaten)';
        }
        
        const embed = new EmbedBuilder()
            .setColor(THEMA.primary)
            .setTitle(`👮 Amsterdam Politie - Toegewezen Roepnummers (${alleGebruikers.length})`)
            .setDescription(beschrijving || 'Geen leden gevonden')
            .setFooter({ text: "Amsterdam Politie Database", iconURL: BOT_AVATAR_URL })
            .setTimestamp();
        
        await interaction.editReply({ embeds: [embed], flags: 64 });
    }
    
    else if (subCommand === 'forceer') {
        if (!heeftToegang(interaction.member)) {
            return interaction.reply({ content: '❌ Alleen staff mag dit commando gebruiken.', flags: 64 });
        }
        
        await interaction.deferReply({ flags: 64 });
        
        const targetUser = interaction.options.getUser('gebruiker');
        
        if (!targetUser) {
            return interaction.editReply({ content: '❌ Geef een gebruiker op.', flags: 64 });
        }
        
        const member = await interaction.guild.members.fetch(targetUser.id);
        await checkEnKenRoepnummerToe(member);
        
        const nieuwRoepnummer = await getHuidigRoepnummer(targetUser.id);
        
        if (nieuwRoepnummer) {
            await interaction.editReply({ 
                content: `✅ Roepnummer check geforceerd voor ${targetUser.username}.\n\n**Roepnummer:** ${nieuwRoepnummer.dienstnummer}\n**Rang:** ${nieuwRoepnummer.rang_naam}`, 
                flags: 64 
            });
        } else {
            await interaction.editReply({ 
                content: `✅ Roepnummer check geforceerd voor ${targetUser.username}.\n\n⚠️ Geen roepnummer toegewezen.`, 
                flags: 64 
            });
        }
    }
}

// ============================================
// VOG DATABASE FUNCTIES
// ============================================
async function haalVOGDataOp(userId) {
    try {
        const { data, error } = await supabase
            .from('vog_aanvragen')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            console.error('Fout bij ophalen VOG:', error);
            return null;
        }
        return data;
    } catch (error) {
        console.error('Fout bij ophalen VOG:', error);
        return null;
    }
}

async function slaVOGDataOp(userId, vogObject) {
    try {
        const bestaandeVOG = await haalVOGDataOp(userId);

        if (bestaandeVOG) {
            const { error } = await supabase
                .from('vog_aanvragen')
                .update(vogObject)
                .eq('user_id', userId);
            if (error) console.error('Fout bij updaten VOG:', error);
        } else {
            const { error } = await supabase
                .from('vog_aanvragen')
                .insert([{ user_id: userId, ...vogObject }]);
            if (error) console.error('Fout bij invoegen VOG:', error);
        }
        console.log(`VOG data opgeslagen voor ${userId}`);
    } catch (error) {
        console.error('Fout bij opslaan VOG:', error);
    }
}

async function heeftGoedgekeurdeVOG(userId) {
    const data = await haalVOGDataOp(userId);
    return data && data.status === 'approved';
}

async function getAantalGoedgekeurdeVOGs() {
    try {
        const { count, error } = await supabase
            .from('vog_aanvragen')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'approved');
        return count || 0;
    } catch (error) {
        console.error('Fout bij tellen VOGs:', error);
        return 0;
    }
}

// ============================================
// SOLLICITATIE FUNCTIES MET PUNTENSYSTEEM
// ============================================
const actieveSollicitaties = new Map();

async function startSollicitatie(interaction, dienstId) {
    const dienst = SOLLICITATIE_VRAGEN[dienstId];
    if (!dienst?.actief) {
        return interaction.reply({ content: `Sollicitaties voor ${dienst?.naam ?? 'deze dienst'} zijn gesloten.`, flags: 64 });
    }
    
    // VOG check alleen als die verplicht is voor deze dienst
    if (dienst.vogVerplicht) {
        const heeftVOG = await heeftGoedgekeurdeVOG(interaction.user.id);
        if (!heeftVOG) {
            return interaction.reply({ 
                content: `Je hebt geen goedgekeurde VOG.\n\nEen VOG is verplicht voor ${dienst.naam}.\n\nGebruik /vog aanvragen om een VOG aan te vragen.`, 
                flags: 64 
            });
        }
    }
    
    // Check of gebruiker al een sollicitatie in behandeling heeft
    const bestaande = await getSollicitatie(interaction.user.id, dienstId);
    if (bestaande && bestaande.status === 'pending') {
        return interaction.reply({ 
            content: `Je hebt al een openstaande sollicitatie voor ${dienst.naam} in behandeling. Wacht op de beoordeling.`, 
            flags: 64 
        });
    }
    
    await interaction.reply({ content: `📝 Sollicitatie voor ${dienst.emoji} ${dienst.naam} gestart!\n\nJe ontvangt ${dienst.vragen.length} vragen via DM.\n\n**Maximaal te behalen:** ${dienst.maxScore} punten\n**Minimaal nodig:** ${SLAGINGSGRENS} punten (${Math.round((SLAGINGSGRENS/dienst.maxScore)*100)}%)`, flags: 64 });
    
    actieveSollicitaties.set(interaction.user.id, {
        dienstId, 
        huidigeVraag: 0, 
        antwoorden: [], 
        scores: [],
        totaalVragen: dienst.vragen.length,
        startDatum: new Date().toISOString()
    });
    
    await stuurSollicitatieVraag(interaction.user, dienstId, 0);
}

async function stuurSollicitatieVraag(user, dienstId, index) {
    const dienst = SOLLICITATIE_VRAGEN[dienstId];
    const vraag = dienst.vragen[index];
    
    if (index >= dienst.vragen.length) {
        const sessie = actieveSollicitaties.get(user.id);
        if (sessie) {
            await verwerkSollicitatieResultaat(user, dienstId, sessie.antwoorden, sessie.scores);
            actieveSollicitaties.delete(user.id);
        }
        return;
    }
    
    let extraInfo = "";
    if (vraag.type === "list") {
        extraInfo = `Geef 3 duidelijke punten met uitleg voor maximale punten.`;
    } else if (vraag.type === "scenario") {
        extraInfo = `ℹ️ Beschrijf stap voor stap wat je zou doen. Hoe specifieker, hoe meer punten.`;
    } else {
        extraInfo = `Wees uitgebreid en specifiek. Hoe gedetailleerder je antwoord, hoe meer punten je krijgt.`;
    }
    
    const embed = new EmbedBuilder()
        .setColor(dienst.kleur)
        .setTitle(`${dienst.emoji} Sollicitatie ${dienst.naam} - Vraag ${index + 1}/${dienst.vragen.length}`)
        .setDescription(`**${vraag.vraag}**`)
        .addFields(
            { name: "Maximale score", value: `${vraag.maxScore} punten`, inline: true },
            { name: "Belangrijkheid", value: vraag.belangrijk ? "Zeer belangrijk" : "Normaal", inline: true },
            { name: "Tip", value: extraInfo, inline: false }
        )
        .setFooter({ text: `Beantwoord deze vraag door hier te typen | Vraag ${index + 1}/${dienst.vragen.length}`, iconURL: BOT_AVATAR_URL });
    
    await user.send({ embeds: [embed] });
}

async function verwerkSollicitatieAntwoord(user, dienstId, antwoord, vraagIndex) {
    const sessie = actieveSollicitaties.get(user.id);
    if (!sessie || sessie.huidigeVraag !== vraagIndex) {
        await user.send("Sessie verlopen. Start opnieuw via de knop in de server.");
        return;
    }
    
    // Basis validatie
    if (antwoord.length < 5) {
        await user.send("Je antwoord is te kort. Probeer het opnieuw met een uitgebreider antwoord.");
        return;
    }
    
    const dienst = SOLLICITATIE_VRAGEN[dienstId];
    const vraag = dienst.vragen[vraagIndex];
    const score = berekenScoreVoorVraag(antwoord, vraag);
    
    sessie.antwoorden.push(antwoord);
    sessie.scores.push(score);
    sessie.huidigeVraag++;
    actieveSollicitaties.set(user.id, sessie);
    
    await user.send(`Vraag ${vraagIndex + 1} is opgeslagen! (${sessie.huidigeVraag}/${sessie.totaalVragen})\nScore voor deze vraag: **${score}/${vraag.maxScore}** punten`);
    
    if (sessie.huidigeVraag >= sessie.totaalVragen) {
        await verwerkSollicitatieResultaat(user, dienstId, sessie.antwoorden, sessie.scores);
        actieveSollicitaties.delete(user.id);
    } else {
        await stuurSollicitatieVraag(user, dienstId, sessie.huidigeVraag);
    }
}

async function verwerkSollicitatieResultaat(user, dienstId, antwoorden, scores) {
    const dienst = SOLLICITATIE_VRAGEN[dienstId];
    
    // Bereken totaalscore
    let totaalScore = 0;
    let maxScore = 0;
    const scoreDetails = [];
    
    for (let i = 0; i < dienst.vragen.length; i++) {
        const vraag = dienst.vragen[i];
        const score = scores[i] || 0;
        totaalScore += score;
        maxScore += vraag.maxScore;
        if (vraag.maxScore > 0) {
            scoreDetails.push({
                vraag: vraag.vraag,
                antwoord: antwoorden[i],
                score: score,
                maxScore: vraag.maxScore
            });
        }
    }
    
    const percentage = Math.round((totaalScore / maxScore) * 100);
    const voldoende = totaalScore >= SLAGINGSGRENS;
    
    // Opslaan in Supabase
    const opgeslagen = await slaSollicitatieOp(user.id, user.username, dienstId, antwoorden, scoreDetails, totaalScore, maxScore);
    
    if (!opgeslagen) {
        await user.send("Er is een fout opgetreden bij het opslaan van je sollicitatie. Neem contact op met een stafflid.");
        return;
    }
    
    // Haal de opgeslagen sollicitatie op voor de ID
    const sollicitatie = await getSollicitatie(user.id, dienstId);
    
    // Stuur beoordeling naar staff kanaal
    const beoordelingChannel = await client.channels.fetch(LOG_KANALEN[dienstId]);
    if (beoordelingChannel && sollicitatie) {
        let beoordelingBericht = `**NIEUWE SOLLICITATIE - ${dienst.emoji} ${dienst.naam}**\n`;
        beoordelingBericht += `─────────────────────────────────────────────────────\n`;
        beoordelingBericht += `**Sollicitant:** ${user} (${user.id})\n`;
        beoordelingBericht += `**Datum:** ${new Date().toLocaleString('nl-NL')}\n`;
        beoordelingBericht += `**Score:** ${totaalScore}/${maxScore} (${percentage}%)\n`;
        beoordelingBericht += `**Oordeel:** ${voldoende ? 'VOLDOENDE' : 'ONVOLDOENDE'}\n`;
        beoordelingBericht += `─────────────────────────────────────────────────────\n\n`;
        
        for (let i = 0; i < scoreDetails.length; i++) {
            const s = scoreDetails[i];
            beoordelingBericht += `**Vraag ${i+1}:** ${s.vraag}\n`;
            beoordelingBericht += `📝 Antwoord: ${s.antwoord.substring(0, 200)}${s.antwoord.length > 200 ? '...' : ''}\n`;
            beoordelingBericht += `⭐ Score: ${s.score}/${s.maxScore} punten\n`;
            beoordelingBericht += `─────────────────────────────────────────────────────\n\n`;
        }
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`beoordeel_${sollicitatie.id}_${dienstId}`)
                    .setLabel('📝 Beoordeel deze sollicitatie')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📝')
            );
        
        await beoordelingChannel.send({ 
            content: `<@&${ALLOWED_ROLE_ID}>`, 
            embeds: [new EmbedBuilder().setColor(THEMA.info).setTitle(`📋 Nieuwe sollicitatie - ${dienst.naam}`).setDescription(beoordelingBericht.substring(0, 4000))], 
            components: [row] 
        });
    }
    
    // Stuur bericht naar gebruiker
    const userEmbed = new EmbedBuilder()
        .setColor(voldoende ? THEMA.success : THEMA.warning)
        .setTitle(voldoende ? "✅ Sollicitatie Ontvangen" : "📋 Sollicitatie Ontvangen")
        .setDescription(`Je sollicitatie voor **${dienst.naam}** is volledig ontvangen!\n\n` +
            `📊 **Jouw score:** ${totaalScore}/${maxScore} punten (${percentage}%)\n` +
            `🎯 **Minimaal vereist:** ${SLAGINGSGRENS} punten (${Math.round((SLAGINGSGRENS/maxScore)*100)}%)\n\n` +
            (voldoende ? 
                `✅ Je hebt voldoende gescoord! Het team zal je sollicitatie beoordelen. Je hoort zo snel mogelijk van ons.` :
                `⚠️ Je hebt onvoldoende gescoord. Het team zal alsnog je sollicitatie bekijken.`))
        .setFooter({ text: "Amsterdam Overheid - Sollicitaties", iconURL: BOT_AVATAR_URL })
        .setTimestamp();
    
    await user.send({ embeds: [userEmbed] });
}

// ============================================
// BEOORDELING DOOR STAFF
// ============================================
async function handleBeoordeling(interaction) {
    if (!heeftToegang(interaction.member)) {
        return interaction.reply({ content: '❌ Alleen staff mag sollicitaties beoordelen.', flags: 64 });
    }
    
    const parts = interaction.customId.split('_');
    const sollicitatieId = parseInt(parts[1]);
    const dienstId = parts[2];
    
    // Haal sollicitatie op uit database
    const { data: sollicitatie, error } = await supabase
        .from('sollicitaties')
        .select('*')
        .eq('id', sollicitatieId)
        .maybeSingle();
    
    if (error || !sollicitatie) {
        return interaction.reply({ content: '❌ Sollicitatie niet gevonden in de database.', flags: 64 });
    }
    
    const modal = new ModalBuilder()
        .setCustomId(`beoordeel_modal_${sollicitatieId}_${dienstId}`)
        .setTitle(`Beoordeel ${sollicitatie.user_naam}`);
    
    const vragen = [
        { label: "Eindscore (0-100)", style: TextInputStyle.Short, placeholder: `Huidige score: ${sollicitatie.totaal_score}`, required: true },
        { label: "Positieve punten", style: TextInputStyle.Paragraph, placeholder: "Wat ging er goed in deze sollicitatie?", required: true },
        { label: "Verbeterpunten", style: TextInputStyle.Paragraph, placeholder: "Wat kan de sollicitant verbeteren?", required: true },
        { label: "Eindoordeel", style: TextInputStyle.Short, placeholder: "Aannemen of Afkeuren?", required: true },
        { label: "Extra opmerkingen", style: TextInputStyle.Paragraph, placeholder: "Eventuele extra feedback", required: false }
    ];
    
    vragen.forEach((vraag, i) => {
        const input = new TextInputBuilder()
            .setCustomId(`v_${i}`)
            .setLabel(vraag.label)
            .setStyle(vraag.style)
            .setPlaceholder(vraag.placeholder)
            .setRequired(vraag.required)
            .setMaxLength(1000);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
    });
    
    client.beoordelingData = { sollicitatieId, dienstId, sollicitatie };
    await interaction.showModal(modal);
}

async function verwerkBeoordeling(interaction) {
    const data = client.beoordelingData;
    if (!data) return;
    
    const score = parseInt(interaction.fields.getTextInputValue('v_0'));
    const positief = interaction.fields.getTextInputValue('v_1');
    const verbeterpunten = interaction.fields.getTextInputValue('v_2');
    const oordeel = interaction.fields.getTextInputValue('v_3');
    const opmerkingen = interaction.fields.getTextInputValue('v_4') || 'Geen extra opmerkingen';
    
    const isAangenomen = oordeel.toLowerCase().includes('aannemen');
    const status = isAangenomen ? 'approved' : 'denied';
    
    // Update in database
    await updateSollicitatieStatus(data.sollicitatieId, status, score, { positief, verbeterpunten, opmerkingen }, interaction.user.username);
    
    // Stuur bericht naar de sollicitant
    const user = await client.users.fetch(data.sollicitatie.user_id);
    const dienst = SOLLICITATIE_VRAGEN[data.dienstId];
    
    const resultEmbed = new EmbedBuilder()
        .setColor(isAangenomen ? THEMA.success : THEMA.error)
        .setTitle(isAangenomen ? "🎉 Gefeliciteerd! Je bent aangenomen!" : "📋 Update over je sollicitatie")
        .setDescription(`Je sollicitatie voor **${dienst?.naam || data.dienstId}** is beoordeeld door het team.\n\n` +
            `📊 **Jouw score:** ${score}/100\n` +
            `✅ **Eindoordeel:** ${isAangenomen ? 'AANGENOMEN 🎉' : 'AFGEKEURD'}\n\n` +
            `**💪 Positieve punten:**\n${positief}\n\n` +
            `**📈 Verbeterpunten:**\n${verbeterpunten}\n\n` +
            `**💬 Extra opmerkingen:**\n${opmerkingen}`)
        .setFooter({ text: `Beoordeeld door: ${interaction.user.username}`, iconURL: BOT_AVATAR_URL })
        .setTimestamp();
    
    await user.send({ embeds: [resultEmbed] }).catch(() => {});
    
    // VERPLAATS DIT BLOK NAAR HIER (vóór de reply)
    const logChannel = await client.channels.fetch(LOG_KANALEN[data.dienstId]);
    if (logChannel) {
        await logChannel.send(`✅ **Sollicitatie beoordeeld**\n👤 Sollicitant: ${user?.tag || data.sollicitatie.user_id}\n📊 Score: ${score}/100\n✅ Oordeel: ${isAangenomen ? 'AANGENOMEN' : 'AFGEKEURD'}\n👮 Beoordeeld door: ${interaction.user.username}`);
    }
    
    await interaction.reply({ content: `✅ Sollicitatie beoordeeld! De sollicitant is op de hoogte gesteld.`, flags: 64 });
    delete client.beoordelingData;
}

// ============================================
// VOG FUNCTIES
// ============================================
async function startVOGaanvraag(interaction) {
    const user = interaction.user;
    const vogDashboardUrl = `${OVERHEID_PORTAL_URL}/overheid/vog.html`;
    
    const bestaandeVOG = await haalVOGDataOp(user.id);
    
    if (bestaandeVOG && bestaandeVOG.status === 'approved') {
        return interaction.reply({ content: 'Je hebt al een goedgekeurde VOG.', flags: 64 });
    }
    
    if (bestaandeVOG && bestaandeVOG.status === 'pending') {
        return interaction.reply({ content: 'Je hebt al een VOG aanvraag in behandeling.', flags: 64 });
    }
    
    const embed = new EmbedBuilder()
        .setColor(THEMA.primary)
        .setTitle('VOG aanvragen via het overheid dashboard')
        .setDescription(
            'Een VOG, oftewel Verklaring Omtrent Gedrag, laat zien dat je recente gedrag binnen Amsterdam Roleplay geen bezwaar vormt voor functies waar betrouwbaarheid belangrijk is.\n\n' +
            'VOG-aanvragen verlopen via het overheid dashboard. Log in met je Discord-account en vul daar de korte aanvraag in. Het dashboard controleert je antwoorden automatisch en laat direct zien of je in aanmerking komt.\n\n' +
            'Kom je ervoor in aanmerking? Dan krijg je hier op Discord automatisch de juiste VOG-rol. Je hoeft hiervoor geen ticket meer aan te maken.'
        )
        .setFooter({ text: 'Amsterdam Roleplay Overheid', iconURL: BOT_AVATAR_URL })
        .setThumbnail(BOT_AVATAR_URL)
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Open VOG dashboard')
                .setStyle(ButtonStyle.Link)
                .setURL(vogDashboardUrl)
        );

    await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
}

async function verwerkVOGaanvraag(interaction) {
    const user = interaction.user;
    const antwoorden = {
        naam: interaction.fields.getTextInputValue('vraag_0'),
        geboortedatum: interaction.fields.getTextInputValue('vraag_1'),
        reden: interaction.fields.getTextInputValue('vraag_2'),
        strafblad: interaction.fields.getTextInputValue('vraag_3')
    };
    
    console.log(`VOG aanvraag van ${user.id}:`, antwoorden);
    
    await slaVOGDataOp(user.id, {
        status: 'pending',
        datum: new Date().toLocaleString('nl-NL'),
        volledige_naam: antwoorden.naam,
        geboortedatum: antwoorden.geboortedatum,
        reden_aanvraag: antwoorden.reden,
        strafblad: antwoorden.strafblad,
        datum_aanvraag: new Date().toISOString()
    });
    
    const userEmbed = new EmbedBuilder()
        .setColor(THEMA.warning)
        .setTitle('VOG Aanvraag Ontvangen - Amsterdam')
        .setDescription(`Je VOG aanvraag is in behandeling genomen.\n\nAanvraagdatum: ${new Date().toLocaleString('nl-NL')}\nStatus: In afwachting van goedkeuring\n\nJe ontvangt bericht zodra er een beslissing is.`)
        .setFooter({ text: "VOG Systeem - Amsterdam", iconURL: BOT_AVATAR_URL })
        .setTimestamp();
    
    await user.send({ embeds: [userEmbed] });
    
    const staffEmbed = new EmbedBuilder()
        .setColor(THEMA.warning)
        .setTitle('NIEUWE VOG AANVRAAG - AMSTERDAM')
        .setDescription(`Aanvrager: ${user} (${user.id})\nDatum: ${new Date().toLocaleString('nl-NL')}`)
        .addFields(
            { name: "Persoonlijke gegevens", value: `Naam: ${antwoorden.naam}\nGeboortedatum: ${antwoorden.geboortedatum}`, inline: false },
            { name: "Reden van aanvraag", value: antwoorden.reden, inline: false },
            { name: "Strafblad", value: antwoorden.strafblad, inline: false }
        )
        .setFooter({ text: `Gebruik /vog goedkeuren ${user.id} of /vog afwijzen ${user.id}`, iconURL: BOT_AVATAR_URL })
        .setTimestamp();
    
    const staffChannel = await client.channels.fetch(VOG_KANAAL_ID);
    if (staffChannel) {
        await staffChannel.send({ content: `<@&${ALLOWED_ROLE_ID}>`, embeds: [staffEmbed] });
    }
    
    await interaction.reply({ content: `Je VOG aanvraag is verzonden. Je ontvangt bericht zodra deze is beoordeeld.`, flags: 64 });
}

async function keurVOGgoed(interaction, targetUser) {
    const toegestaneRolId = "1504849453268598875";
    
    if (!interaction.member.roles.cache.has(toegestaneRolId)) {
        return interaction.reply({ 
            content: 'Alleen de VOG goedkeuringsrol mag VOG aanvragen goedkeuren.', 
            flags: 64 
        });
    }
    
    const vogData = await haalVOGDataOp(targetUser.id);
    if (!vogData || vogData.status !== 'pending') {
        return interaction.reply({ content: `Geen actieve VOG aanvraag gevonden voor ${targetUser.username}.`, flags: 64 });
    }
    
    await slaVOGDataOp(targetUser.id, {
        status: 'approved',
        goedgekeurd_door: interaction.user.username,
        datum_goedkeuring: new Date().toISOString()
    });
    
    const vogRolId = "1504849665542062250";
    try {
        const member = await interaction.guild.members.fetch(targetUser.id);
        const vogRol = interaction.guild.roles.cache.get(vogRolId);
        if (vogRol) {
            await member.roles.add(vogRol);
            console.log(`VOG rol toegevoegd aan ${targetUser.username}`);
        }
    } catch (error) {
        console.error(`Fout bij toevoegen rol:`, error);
    }
    
    const userEmbed = new EmbedBuilder()
        .setColor(THEMA.success)
        .setTitle('VOG GOEDGEKEURD - AMSTERDAM')
        .setDescription(`Je VOG aanvraag is goedgekeurd door ${interaction.user.username}!`)
        .addFields(
            { name: "VOG Nummer", value: `AMS-VOG-${Date.now().toString().slice(-8)}`, inline: true },
            { name: "Geldig tot", value: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'), inline: true }
        )
        .setFooter({ text: "VOG Systeem - Amsterdam", iconURL: BOT_AVATAR_URL })
        .setTimestamp();
    
    await targetUser.send({ embeds: [userEmbed] }).catch(() => {});
    
    const staffEmbed = new EmbedBuilder()
        .setColor(THEMA.success)
        .setTitle('VOG AANVRAAG GOEDGEKEURD - AMSTERDAM')
        .setDescription(`Aanvrager: ${targetUser} (${targetUser.id})\nGoedgekeurd door: ${interaction.user}`);
    
    const staffChannel = await client.channels.fetch(VOG_KANAAL_ID);
    if (staffChannel) {
        await staffChannel.send({ embeds: [staffEmbed] });
    }
    
    await interaction.reply({ content: `VOG van ${targetUser.username} is goedgekeurd!`, flags: 64 });
}

async function wijsVOGaf(interaction, targetUser) {
    const toegestaneRolId = "1504849453268598875";
    
    if (!interaction.member.roles.cache.has(toegestaneRolId)) {
        return interaction.reply({ 
            content: 'Alleen de VOG goedkeuringsrol mag VOG aanvragen afwijzen.', 
            flags: 64 
        });
    }
    
    const vogData = await haalVOGDataOp(targetUser.id);
    if (!vogData || vogData.status !== 'pending') {
        return interaction.reply({ content: `Geen actieve VOG aanvraag gevonden.`, flags: 64 });
    }
    
    const modal = new ModalBuilder()
        .setCustomId('vog_afwijs_modal')
        .setTitle('Reden voor afwijzing');
    
    const input = new TextInputBuilder()
        .setCustomId('reden')
        .setLabel('Reden voor afwijzing')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Waarom wordt de VOG afgewezen? Minimaal 20 tekens.")
        .setRequired(true)
        .setMinLength(20);
    
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    
    client.vogAfwijsTarget = targetUser;
    await interaction.showModal(modal);
}

async function verwerkVOGafwijzing(interaction) {
    const targetUser = client.vogAfwijsTarget;
    const reden = interaction.fields.getTextInputValue('reden');
    
    await slaVOGDataOp(targetUser.id, {
        status: 'denied',
        afgewezen_door: interaction.user.username,
        afgewezen_reden: reden,
        datum_afwijzing: new Date().toISOString()
    });
    
    const userEmbed = new EmbedBuilder()
        .setColor(THEMA.error)
        .setTitle('VOG AANVRAAG AFGEWEZEN')
        .setDescription(`Je VOG aanvraag is afgewezen door ${interaction.user.username}!`)
        .addFields({ name: "Reden", value: reden })
        .setFooter({ text: "Je kunt na 30 dagen opnieuw een aanvraag indienen" })
        .setTimestamp();
    
    await targetUser.send({ embeds: [userEmbed] }).catch(() => {});
    
    await interaction.reply({ content: `VOG van ${targetUser.username} is afgewezen.`, flags: 64 });
}

async function bekijkVOGstatus(interaction, targetUser) {
    const target = targetUser || interaction.user;
    const data = await haalVOGDataOp(target.id);
    
    let statusTekst = '';
    let kleur = THEMA.info;
    let beschrijving = '';
    
    if (!data) {
        statusTekst = 'Geen VOG aanvraag';
        beschrijving = 'Je hebt nog geen VOG aangevraagd. Gebruik /vog aanvragen.';
        kleur = THEMA.info;
    } else if (data.status === 'pending') {
        statusTekst = 'In afwachting van goedkeuring';
        beschrijving = `Je VOG aanvraag is in behandeling.\n\nAanvraagdatum: ${data.datum}`;
        kleur = THEMA.warning;
    } else if (data.status === 'approved') {
        statusTekst = 'GOEDGEKEURD';
        beschrijving = `Je VOG is goedgekeurd! Je kunt nu solliciteren.\n\nGoedgekeurd door: ${data.goedgekeurd_door}`;
        kleur = THEMA.success;
    } else if (data.status === 'denied') {
        statusTekst = 'AFGEWEZEN';
        beschrijving = `Je VOG aanvraag is afgewezen.\n\nReden: ${data.afgewezen_reden}`;
        kleur = THEMA.error;
    }
    
    const embed = new EmbedBuilder()
        .setColor(kleur)
        .setTitle(`VOG Status - ${target.username}`)
        .setDescription(beschrijving)
        .addFields({ name: "Status", value: statusTekst, inline: true })
        .setFooter({ text: "VOG is verplicht voor alle functies", iconURL: BOT_AVATAR_URL })
        .setTimestamp();
    
    await interaction.reply({ embeds: [embed], flags: 64 });
}

// ============================================
// KLACHTEN FUNCTIES
// ============================================
const KLACHT_CATEGORIES = {
    politie: {
        name: "Politie Amsterdam",
        emoji: "👮",
        color: THEMA.primary,
        description: "Dien een klacht in over Politie Amsterdam",
        modalTitle: "👮 Klacht over Politie Amsterdam",
        wsRol: "1504849455843774575",
        categorieId: "1504849818332299294"
    },
    ambulance: {
        name: "Ambulance Amsterdam",
        emoji: "🚑",
        color: THEMA.secondary,
        description: "Dien een klacht in over Ambulance Amsterdam",
        modalTitle: "🚑 Klacht over Ambulance Amsterdam",
        wsRol: "1504849564186710229",
        categorieId: "1504849855426723991"
    },
    pechhulp: {
        name: "Pechhulp Amsterdam",
        emoji: "🔧",
        color: THEMA.accent,
        description: "Dien een klacht in over Pechhulp Amsterdam",
        modalTitle: "🔧 Klacht over Pechhulp Amsterdam",
        wsRol: "1504849570075770982",
        categorieId: "1504849860573265920"
    }
};

async function createKlachtPanel(channelId) {
    const channel = await client.channels.fetch(channelId);
    if (!channel) return;
    
    const embed = new EmbedBuilder()
        .setColor(THEMA.error)
        .setTitle("📢 KLACHT INDIENING - GEMEENTE AMSTERDAM")
        .setDescription("Heeft u een klacht over een van onze Amsterdamse diensten? Dien deze dan hier in.\n\nOnze klachtencommissie neemt uw klacht serieus en behandelt deze vertrouwelijk.")
        .addFields(
            { name: "📋 Wat kunt u verwachten?", value: "✅ Uw klacht wordt binnen 48 uur in behandeling genomen\n✅ U ontvangt een ticketnummer voor referentie\n✅ Een klachtencoördinator neemt contact met u op\n✅ U krijgt een schriftelijke afhandeling", inline: false },
            { name: "⚠️ Let op:", value: "• Alleen voor klachten over onze Amsterdamse dienstverlening\n• Wees zo specifiek mogelijk in uw klacht", inline: false },
            { name: "🔒 Vertrouwelijkheid", value: "Alle klachten worden vertrouwelijk behandeld binnen de gemeente Amsterdam.", inline: false }
        )
        .setFooter({ text: "Gemeente Amsterdam · Klachtenregistratie", iconURL: BOT_AVATAR_URL })
        .setTimestamp()
        .setThumbnail(BOT_AVATAR_URL);
    
    const options = Object.entries(KLACHT_CATEGORIES).map(([id, cat]) => ({
        label: cat.name,
        value: id,
        emoji: cat.emoji,
        description: cat.description.substring(0, 50)
    }));
    
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('klacht_select')
        .setPlaceholder('📌 Selecteer de dienst waar uw klacht over gaat...')
        .addOptions(options);
    
    const row = new ActionRowBuilder().addComponents(selectMenu);
    
    await channel.send({ embeds: [embed], components: [row] });
    console.log("📢 Klachten panel aangemaakt voor Amsterdam!");
}

async function createKlachtTicket(interaction, categoryId) {
    const category = KLACHT_CATEGORIES[categoryId];
    if (!category) return;
    
    const modal = new ModalBuilder()
        .setCustomId(`klacht_modal_${categoryId}`)
        .setTitle(category.modalTitle.substring(0, 45));
    
    const vragen = [
        { label: "Datum en tijd van incident", style: TextInputStyle.Short, placeholder: "Bijv. 15 januari 2024, 14:30 uur", required: true },
        { label: "Locatie van het incident in Amsterdam", style: TextInputStyle.Short, placeholder: "Bijv. Damrak 12, Amsterdam", required: true },
        { label: "Naam van betrokken medewerker(s)", style: TextInputStyle.Short, placeholder: "Indien bekend", required: false },
        { label: "Beschrijf uw klacht in detail", style: TextInputStyle.Paragraph, placeholder: "Wat is er precies gebeurd? Wat vond u niet goed?", required: true, minLength: 20 },
        { label: "Bewijsmateriaal (links/screenshots)", style: TextInputStyle.Paragraph, placeholder: "Eventuele links naar bewijsmateriaal", required: false }
    ];
    
    vragen.forEach((vraag, i) => {
        const input = new TextInputBuilder()
            .setCustomId(`v_${i}`)
            .setLabel(vraag.label.substring(0, 45))
            .setStyle(vraag.style)
            .setPlaceholder(vraag.placeholder)
            .setRequired(vraag.required);
        
        if (vraag.minLength) input.setMinLength(vraag.minLength);
        
        modal.addComponents(new ActionRowBuilder().addComponents(input));
    });
    
    await interaction.showModal(modal);
}

async function handleKlachtModal(interaction, categoryId) {
    await interaction.deferReply({ flags: 64 });
    
    const category = KLACHT_CATEGORIES[categoryId];
    if (!category) return;
    
    const antwoorden = [];
    for (let i = 0; i < 5; i++) {
        antwoorden.push(interaction.fields.getTextInputValue(`v_${i}`) || "Niet opgegeven");
    }
    
    const klachtId = `KLT-${Date.now().toString().slice(-8)}`;
    const channelName = `klacht-${interaction.user.username.toLowerCase()}`;
    
    const permissionOverwrites = [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles] },
        { id: ALLOWED_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] }
    ];
    
    const ticketChannel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: TICKET_CATEGORIE_ID,
        permissionOverwrites: permissionOverwrites,
        topic: `Klacht ID: ${klachtId} | Categorie: ${category.name} | Ingediend door: ${interaction.user.tag}`
    });
    
    const embed = new EmbedBuilder()
        .setColor(category.color)
        .setAuthor({ name: `📢 ${category.name} - Klacht`, iconURL: BOT_AVATAR_URL })
        .setTitle(`Klacht #${klachtId}`)
        .setDescription(`**Ingediend door:** ${interaction.user}\n**Datum:** ${new Date().toLocaleString('nl-NL')}\n**Categorie:** ${category.emoji} ${category.name}\n**Stad:** Amsterdam 🇳🇱`)
        .addFields(
            { name: "📅 Datum/tijd incident", value: antwoorden[0], inline: false },
            { name: "📍 Locatie", value: antwoorden[1], inline: false },
            { name: "👤 Betrokken medewerker(s)", value: antwoorden[2] || "Niet opgegeven", inline: false },
            { name: "📝 Klacht beschrijving", value: antwoorden[3], inline: false },
            { name: "📎 Bewijsmateriaal", value: antwoorden[4] || "Geen bewijsmateriaal", inline: false }
        )
        .setFooter({ text: `Klacht ID: ${klachtId} | Behandel deze klacht vertrouwelijk`, iconURL: BOT_AVATAR_URL })
        .setTimestamp();
    
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`klacht_close_${klachtId}`)
            .setLabel('🔒 Klacht Sluiten')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒'),
        new ButtonBuilder()
            .setCustomId(`klacht_transcript_${klachtId}`)
            .setLabel('📄 Transcript')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📄'),
        new ButtonBuilder()
            .setCustomId(`klacht_claim_${klachtId}`)
            .setLabel('📋 Claim Klacht')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('📋')
    );
    
    await ticketChannel.send({ 
        content: `${interaction.user} <@&${ALLOWED_ROLE_ID}>`,
        embeds: [embed], 
        components: [row] 
    });
    
    const confirmEmbed = new EmbedBuilder()
        .setColor(THEMA.success)
        .setTitle("✅ Klacht ingediend")
        .setDescription(`Je klacht is succesvol ingediend!\n\n**Klacht kanaal:** ${ticketChannel}\n**Klacht ID:** ${klachtId}\n**Categorie:** ${category.emoji} ${category.name}\n\nEen klachtencoördinator neemt zo snel mogelijk contact met je op.`)
        .setFooter({ text: "Gemeente Amsterdam", iconURL: BOT_AVATAR_URL })
        .setTimestamp();
    
    await interaction.editReply({ embeds: [confirmEmbed], flags: 64 });
    
    const logChannel = await client.channels.fetch(LOG_KANALEN.politie);
    if (logChannel) {
        await logChannel.send(`📢 **Nieuwe klacht ingediend**\n👤 Door: ${interaction.user.tag}\n📂 Categorie: ${category.name}\n🆔 ID: ${klachtId}\n🔗 Kanaal: ${ticketChannel}`);
    }
}

// ============================================
// TRAININGEN (Amsterdam thema)
// ============================================
const TRAININGEN = {
    "Basis Training Amsterdam": {
        vragen: [
            "Leg prioriteiten (Prio 1,2,3) uit met voorbeelden uit Amsterdam.",
            "Beschrijf portofoonprocedure en regels.",
            "Hoe de-escaleer je een agressieve burger op de Wallen?",
            "Wat zijn rechten van een arrestant? Noem 3.",
            "Welke uitrusting neem je mee bij een inbraak in een Amsterdams grachtenpand?"
        ],
        slagingsgrens: 90
    },
    "Offroad Training": {
        vragen: [
            "Waarom bandenspanning verlagen bij offroad?",
            "Hoe neem je een steile helling?",
            "Rijtechniek in diepe modder?",
            "Wat controleer je voor offroad missie in Amsterdamse parken?",
            "Offroad achtervolging: risico's?"
        ],
        slagingsgrens: 90
    },
    "Tactische Weerbaarheid": {
        vragen: [
            "Wanneer mag je dienstwapen trekken?",
            "Beschrijf de 4 stappen van de-escalatie.",
            "Verdachte met mes op het Museumplein - wat doe je?",
            "Hoe werkt een taser?",
            "Defensief vs offensief wapenstok?"
        ],
        slagingsgrens: 90
    },
    "Rijtraining Amsterdam": {
        vragen: [
            "Stap voor stap noodstop met sirene in Amsterdam centrum?",
            "Wanneer sirenes, wanneer alleen zwaailichten?",
            "Kruispunt met sirene - hoe gedragen?",
            "Regels voor achteruitrijlichten?",
            "Wanneer achtervolging afbreken in de grachten?"
        ],
        slagingsgrens: 90
    },
    "SIV Training": {
        vragen: [
            "Verschillen SIV vs standaard?",
            "Prio 1 rit communicatie?",
            "Positionering bij plaats delict in Amsterdam?",
            "Wat is een PIT maneuver?",
            "Kruispunt met 120 km/u?"
        ],
        slagingsgrens: 90
    },
    "Motor Training": {
        vragen: [
            "Balans- en kijktechnieken motor?",
            "Remtechniek in noodsituatie?",
            "Lichaamshouding in scherpe bocht?",
            "Manoevreren tussen files op de A10?",
            "Voordelen motor boven auto in Amsterdam?"
        ],
        slagingsgrens: 90
    },
    "UM Training": {
        vragen: [
            "Tactisch voordeel van UM?",
            "Verdachte onopvallend volgen in de Wallen?",
            "Wat is tactisch rijden?",
            "Observatie drugstransactie - noteren?",
            "Wanneer bijstand inschakelen?"
        ],
        slagingsgrens: 90
    },
    "Onderhandelaar Training": {
        vragen: [
            "Eerste doel onderhandelaar?",
            "Wat is actief luisteren?",
            "Onmogelijke eisen - hoe reageren?",
            "Herkennen van afbouwen?",
            "Zelfmoorddreiging op een Amsterdams brug - prioriteiten?"
        ],
        slagingsgrens: 90
    },
    "Zulu Training": {
        vragen: [
            "Primaire rol van Zulu?",
            "Communicatie met grondtroepen?",
            "Beperkingen luchtsteun boven Amsterdam?",
            "Grondtroepen leiden naar voortvluchtige?",
            "Contact verlies - wat doen?"
        ],
        slagingsgrens: 90
    }
};

// ============================================
// KENNISTOETS FUNCTIES
// ============================================
const actieveToetsen = new Map();

async function startKennistoets(interaction, trainingNaam) {
    const training = TRAININGEN[trainingNaam];
    if (!training) return interaction.editReply({ content: 'Training niet gevonden.', flags: 64 });
    
    await interaction.editReply({ content: `${trainingNaam} gestart! Je ontvangt ${training.vragen.length} vragen via DM.`, flags: 64 });
    
    actieveToetsen.set(interaction.user.id, {
        trainingNaam, huidigeVraag: 0, antwoorden: [], totaalVragen: training.vragen.length
    });
    
    await stuurToetsVraag(interaction.user, trainingNaam, 0);
}

async function stuurToetsVraag(user, trainingNaam, index) {
    const training = TRAININGEN[trainingNaam];
    if (index >= training.vragen.length) {
        const toetsData = actieveToetsen.get(user.id);
        if (toetsData) {
            await beoordeelToets(user, trainingNaam, toetsData.antwoorden);
            actieveToetsen.delete(user.id);
        }
        return;
    }
    
    const embed = new EmbedBuilder()
        .setColor(THEMA.primary)
        .setTitle(`${trainingNaam} - Vraag ${index + 1}/${training.vragen.length}`)
        .setDescription(training.vragen[index])
        .setFooter({ text: "Minimaal 50 woorden voor een goede score.", iconURL: BOT_AVATAR_URL });
    
    await user.send({ embeds: [embed] });
}

async function verwerkToetsAntwoord(user, trainingNaam, antwoord, vraagIndex) {
    const toetsData = actieveToetsen.get(user.id);
    if (!toetsData || toetsData.huidigeVraag !== vraagIndex) {
        await user.send("Toets sessie verlopen. Start opnieuw met /kennistoets.");
        return;
    }
    
    toetsData.antwoorden.push(antwoord);
    toetsData.huidigeVraag++;
    actieveToetsen.set(user.id, toetsData);
    await user.send(`Vraag ${vraagIndex + 1} is opgeslagen!`);
    
    if (toetsData.huidigeVraag >= toetsData.totaalVragen) {
        await beoordeelToets(user, trainingNaam, toetsData.antwoorden);
        actieveToetsen.delete(user.id);
    } else {
        await stuurToetsVraag(user, trainingNaam, toetsData.huidigeVraag);
    }
}

const TOETS_CRITERIA = {
    "Basis Training Amsterdam": [
        [["prio 1", "spoed", "levensgevaar"], ["prio 2", "dringend"], ["prio 3", "geen spoed", "normaal"], ["voorbeeld", "situatie", "melding"]],
        [["porto", "communicatie", "ether"], ["kort", "duidelijk", "roepnummer"], ["status", "locatie", "melding"], ["geen onnodige", "rust"]],
        [["rust", "kalmeren", "de-escaleren"], ["afstand", "veiligheid"], ["luisteren", "communicatie"], ["backup", "collega", "leiding"]],
        [["zwijgrecht", "advocaat", "rechten"], ["reden", "aanhouding"], ["fouilleren", "uitleg"], ["registreren", "rapport"]],
        [["porto", "vest", "wapen", "taser"], ["zaklamp", "handschoenen"], ["backup", "collega"], ["veiligheid", "procedure"]]
    ],
    "Offroad Training": [
        [["grip", "contactvlak"], ["bandenspanning", "verlagen"], ["ondergrond", "modder", "zand"], ["veiligheid"]],
        [["lage versnelling", "controle"], ["rechte lijn", "helling"], ["afstand", "remmen"], ["niet stoppen", "rustig"]],
        [["constant", "gas"], ["sturen", "spoor"], ["grip", "tractie"], ["niet slippen", "controle"]],
        [["banden", "schade"], ["brandstof", "uitrusting"], ["route", "kaart"], ["porto", "communicatie"]],
        [["gevaar", "risico"], ["burgers", "omgeving"], ["voertuigschade"], ["afbreken", "veiligheid"]]
    ],
    "Tactische Weerbaarheid": [
        [["levensgevaar", "dreiging"], ["proportioneel", "noodzakelijk"], ["waarschuwing", "procedure"], ["veiligheid"]],
        [["rust", "luisteren"], ["afstand", "de-escaleren"], ["duidelijke instructies"], ["backup", "tijd"]],
        [["afstand", "dekking"], ["communicatie", "porto"], ["taser", "wapen"], ["omstanders", "veiligheid"]],
        [["stroom", "prikkels"], ["spieren", "uitschakelen"], ["waarschuwing"], ["medische check"]],
        [["verdedigen", "defensief"], ["aanvallen", "offensief"], ["proportioneel"], ["controle"]]
    ],
    "Rijtraining Amsterdam": [
        [["spiegel", "kijken"], ["remmen", "controle"], ["sirene", "zwaailicht"], ["veiligheid", "afstand"]],
        [["prio", "spoed"], ["sirene", "zwaailicht"], ["verkeer", "kruispunt"], ["geen gevaar"]],
        [["afremmen", "kijken"], ["voorrang", "veilig"], ["sirene", "lichten"], ["oogcontact", "verkeer"]],
        [["waarschuwen", "zichtbaar"], ["achteruit", "manoeuvre"], ["veiligheid"], ["omstanders"]],
        [["gevaar", "drukte"], ["snelheid", "controle"], ["burgers"], ["afbreken", "leiding"]]
    ],
    "SIV Training": [
        [["snel", "interventie"], ["standaard", "verschil"], ["uitrusting"], ["inzet"]],
        [["prio 1", "spoed"], ["porto", "locatie"], ["route", "veilig"], ["backup"]],
        [["dekking", "positie"], ["toegang", "uitgang"], ["omstanders"], ["plaats delict"]],
        [["pit", "stoppen"], ["gevaar", "risico"], ["toestemming", "leiding"], ["veiligheid"]],
        [["afremmen", "kijken"], ["kruispunt"], ["risico"], ["nooit blind", "veiligheid"]]
    ],
    "Motor Training": [
        [["kijken", "bocht"], ["balans"], ["houding"], ["controle"]],
        [["voorrem", "achterrem"], ["doseren"], ["rechtop"], ["afstand"]],
        [["lichaam", "kijken"], ["bocht"], ["balans"], ["snelheid"]],
        [["file", "ruimte"], ["snelheid"], ["spiegels"], ["veiligheid"]],
        [["wendbaar", "snel"], ["drukte", "stad"], ["bereikbaarheid"], ["verkeer"]]
    ],
    "UM Training": [
        [["onopvallend", "observatie"], ["informatie"], ["volgen"], ["tactisch"]],
        [["afstand", "niet opvallen"], ["route"], ["communicatie"], ["backup"]],
        [["anticiperen", "positie"], ["veiligheid"], ["omgeving"], ["controle"]],
        [["kenteken", "personen"], ["tijd", "locatie"], ["bewijs"], ["rapport"]],
        [["gevaar", "contact verlies"], ["backup"], ["leiding"], ["veiligheid"]]
    ],
    "Onderhandelaar Training": [
        [["veiligheid", "tijd"], ["contact", "rust"], ["informatie"], ["de-escaleren"]],
        [["luisteren"], ["samenvatten"], ["doorvragen"], ["empathie", "rust"]],
        [["niet beloven"], ["grenzen"], ["alternatief"], ["leiding", "overleg"]],
        [["rustiger", "meewerken"], ["wapen weg"], ["communicatie"], ["signalen"]],
        [["veiligheid"], ["contact houden"], ["hulpdiensten"], ["rust", "tijd"]]
    ],
    "Zulu Training": [
        [["luchtsteun"], ["overzicht"], ["observatie"], ["coordinatie"]],
        [["porto"], ["duidelijke locatie"], ["richting"], ["eenheden"]],
        [["hoogte", "zicht"], ["bebouwing"], ["veiligheid"], ["regels"]],
        [["locatie", "richting"], ["coordinaten"], ["communicatie"], ["grondtroepen"]],
        [["laatste locatie"], ["zoekgebied"], ["communicatie"], ["backup"]]
    ]
};

function criteriaVoorToetsVraag(trainingNaam, vraagIndex) {
    return TOETS_CRITERIA[trainingNaam]?.[vraagIndex] || [["veiligheid"], ["procedure"], ["communicatie"], ["voorbeeld"]];
}

function scoreToetsAntwoord(antwoord, trainingNaam, vraagIndex) {
    const text = normaliseerAntwoord(antwoord);
    if (isLeegOfOnserieus(text)) return 0;
    const groepen = criteriaVoorToetsVraag(trainingNaam, vraagIndex);
    const hits = telRubricGroepen(text, groepen);
    let ratio = hits / groepen.length;
    if (bevatEenVan(text, ["eerst", "daarna", "stap", "omdat", "bijvoorbeeld", "vervolgens"])) ratio += 0.08;
    if (hits <= 1) ratio *= 0.55;
    return Math.round(Math.max(0, Math.min(1, ratio)) * 100);
}

async function beoordeelToets(user, trainingNaam, antwoorden) {
    const training = TRAININGEN[trainingNaam];
    const vraagScores = antwoorden.map((antwoord, index) => scoreToetsAntwoord(antwoord, trainingNaam, index));
    const score = Math.round(vraagScores.reduce((som, item) => som + item, 0) / Math.max(1, vraagScores.length));
    const geslaagd = score >= training.slagingsgrens;
    let resultaat = "TOETS RESULTAAT - " + trainingNaam + "\n\n";
    resultaat += "Jouw score: " + score + "%\n";
    resultaat += "Slagingsgrens: " + training.slagingsgrens + "%\n";
    resultaat += "--------------------------------\n\n";
    for (let i = 0; i < antwoorden.length; i++) {
        const icoon = vraagScores[i] >= 80 ? "✅" : vraagScores[i] >= 55 ? "⚠️" : "❌";
        resultaat += icoon + " Vraag " + (i + 1) + ": " + vraagScores[i] + "% inhoudelijk correct\n";
    }
    resultaat += "\n--------------------------------\n";
    if (geslaagd) {
        resultaat += "GEFELICITEERD! Je bent geslaagd!\nJe ontvangt een certificaat via DM.\n";
        await user.send(resultaat);
        await stuurCertificaatNaarDM(user, trainingNaam, score);
    } else {
        resultaat += "Helaas, je bent niet geslaagd.\nLees de training opnieuw en probeer daarna /kennistoets opnieuw.\n";
        await user.send(resultaat);
    }
}

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

async function stuurCertificaatNaarDM(user, trainingNaam, score) {
    let websiteCertificaat = null;
    try {
        websiteCertificaat = await maakWebsiteCertificaat(user, trainingNaam, score, TRAININGEN[trainingNaam]?.slagingsgrens || 90);
    } catch (error) {
        console.error("Kon certificaat niet op website opslaan:", error.message);
    }

    const certNummer = websiteCertificaat?.certificate?.code || `AMS-${Date.now().toString().slice(-8)}-${user.id.slice(-4)}`;
    const verifyUrl = websiteCertificaat?.verifyUrl || `${OVERHEID_PORTAL_URL}/overheid/verify.html?code=${encodeURIComponent(certNummer)}`;
    const datum = new Date().toLocaleDateString('nl-NL');

    const embed = new EmbedBuilder()
        .setColor(THEMA.primary)
        .setTitle("OFFICIEEL CERTIFICAAT - AMSTERDAM")
        .setDescription("Amsterdam Roleplay Politie - digitaal trainingscertificaat")
        .addFields(
            { name: "Certificaat Nr.", value: `\`${certNummer}\``, inline: true },
            { name: "Naam", value: `**${user.username}**`, inline: true },
            { name: "Training", value: `**${trainingNaam}**`, inline: false },
            { name: "Score", value: `\`\`\`diff\n+ ${score}% - GESLAAGD +\n\`\`\``, inline: false },
            { name: "Datum", value: `\`${datum}\``, inline: true },
            { name: "Prestatie", value: "**UITMUNTEND**", inline: true },
            { name: "Verificatie", value: `[Controleer certificaat](${verifyUrl})`, inline: false },
            { name: "Status", value: "Dit certificaat is uitgegeven voor het succesvol afronden van de vereiste training binnen Amsterdam Roleplay.", inline: false }
        )
        .setFooter({ text: "Amsterdam Politie - Digitaal ondertekend", iconURL: BOT_AVATAR_URL })
        .setTimestamp()
        .setThumbnail(BOT_AVATAR_URL);

    try {
        await user.send({
            content: `GEFELICITEERD! Je bent geslaagd voor **${trainingNaam}** met **${score}%**!\n\nHier is je officiele certificaat van de Amsterdamse Politie.\nVerifieer: ${verifyUrl}`,
            embeds: [embed]
        });
        console.log(`Certificaat gestuurd naar ${user.username} voor ${trainingNaam}: ${certNummer}`);
        return true;
    } catch (error) {
        console.error(`Kon geen DM sturen naar ${user.username}:`, error);
        return false;
    }
}

// ============================================
// VOG PANEL
// ============================================
async function createVOGPanel() {
    try {
        const channel = await client.channels.fetch(VOG_PANEL_KANAAL_ID);
        const vogDashboardUrl = `${OVERHEID_PORTAL_URL}/overheid/vog.html`;
        if (!channel) {
            console.log(`Kanaal ${VOG_PANEL_KANAAL_ID} niet gevonden!`);
            return;
        }
        
        const messages = await channel.messages.fetch({ limit: 20 });
        for (const msg of messages.values()) {
            if (msg.author.id === client.user.id) {
                await msg.delete().catch(() => {});
            }
        }
        
        const embed = new EmbedBuilder()
            .setColor(THEMA.primary)
            .setTitle("🏛️ VOG aanvragen via het overheid dashboard")
            .setDescription(
                "Een VOG, oftewel **Verklaring Omtrent Gedrag**, laat zien dat je recente gedrag binnen Amsterdam Roleplay geen bezwaar vormt voor bepaalde functies, diensten of verantwoordelijkheden.\n\n" +
                "Denk aan functies waarbij vertrouwen, goed gedrag en verantwoordelijkheid belangrijk zijn, zoals Politie, KMar, Ambulance, Advocatuur of andere overheidsrollen.\n\n" +
                `VOG-aanvragen verlopen via het overheid dashboard: ${vogDashboardUrl}\n\n` +
                "Log in met je Discord-account, vul de vragen in en je ziet direct of je in aanmerking komt voor een VOG."
            )
            .addFields(
                { name: "📋 Hoe werkt het?", value: "Ga naar het dashboard, log in met Discord en dien je VOG-aanvraag in via de vragen op de website.", inline: false },
                { name: "✅ Kom je in aanmerking?", value: "Dan krijg je hier op Discord automatisch de juiste VOG-rol.", inline: false },
                { name: "⚠️ Belangrijk", value: "Je hoeft hiervoor geen ticket meer aan te maken. De controle gebeurt automatisch via het dashboard.", inline: false }
            )
            .setFooter({ text: "Amsterdam Roleplay Overheid", iconURL: BOT_AVATAR_URL })
            .setTimestamp()
            .setThumbnail(BOT_AVATAR_URL);
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Open VOG dashboard')
                    .setStyle(ButtonStyle.Link)
                    .setURL(vogDashboardUrl)
            );
        
        await channel.send({ embeds: [embed], components: [row] });
        console.log("VOG panel aangemaakt in kanaal", VOG_PANEL_KANAAL_ID);
    } catch (error) {
        console.error("Fout bij aanmaken VOG panel:", error);
    }
}

async function createSollicitatiePanel() {
    const channel = await client.channels.fetch(SOLLICITATIE_KANAAL_ID).catch(() => null);
    if (!channel) {
        console.log(`Kanaal ${SOLLICITATIE_KANAAL_ID} niet gevonden!`);
        return;
    }
    
    const messages = await channel.messages.fetch({ limit: 20 });
    for (const msg of messages.values()) {
        if (msg.author.id === client.user.id) {
            await msg.delete().catch(() => {});
        }
    }
    
    for (const [dienstId, dienst] of Object.entries(SOLLICITATIE_VRAGEN)) {
        const status = dienst.actief ? "GEOPEND" : "GESLOTEN";
        const vogTekst = dienst.vogVerplicht ? "✅ VOG verplicht" : "❌ Geen VOG nodig";
        
        const embed = new EmbedBuilder()
            .setColor(dienst.actief ? THEMA.success : THEMA.error)
            .setTitle(`${dienst.emoji} ${dienst.naam} - Sollicitaties`)
            .setDescription(`${status}\n\n${vogTekst}\n\nSolliciteer door op onderstaande knop te drukken!\n\nDe sollicitatie bestaat uit ${dienst.vragen.length} vragen die je via DM ontvangt.\n\n**Maximaal te behalen:** ${dienst.maxScore} punten\n**Minimaal nodig:** ${SLAGINGSGRENS} punten (${Math.round((SLAGINGSGRENS/dienst.maxScore)*100)}%)`)
            .setFooter({ text: "Gemeente Amsterdam - Sollicitaties", iconURL: BOT_AVATAR_URL })
            .setThumbnail(BOT_AVATAR_URL);
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`sollicitatie_${dienstId}`)
                    .setLabel('Solliciteer direct!')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(!dienst.actief)
                    .setEmoji('📝')
            );
        
        await channel.send({ embeds: [embed], components: [row] });
    }
    console.log("Sollicitatie panel aangemaakt voor Amsterdam!");
}

// ============================================
// COMMANDS REGISTRATIE
// ============================================
async function registerCommands() {
    const commands = [
        { name: 'strike', description: 'Geef een strike aan een Amsterdamse agent', options: [
            { name: 'gebruiker', type: 6, description: 'De gebruiker', required: true },
            { name: 'nummer', type: 4, description: 'Strike 1, 2 of 3', required: true, choices: [
                { name: 'Strike 1', value: 1 }, { name: 'Strike 2', value: 2 }, { name: 'Strike 3', value: 3 }
            ]},
            { name: 'reden', type: 3, description: 'Reden voor strike', required: false }
        ]},
        { name: 'ban', description: 'Ban een gebruiker van de Amsterdam server', options: [
            { name: 'gebruiker', type: 6, description: 'De gebruiker', required: true },
            { name: 'reden', type: 3, description: 'Reden voor ban', required: false }
        ]},
        { name: 'rolaanvraag', description: 'Voeg rollen toe of verwijder rollen van een gebruiker', options: [
            { name: 'gebruiker', type: 6, description: 'De gebruiker', required: true },
            { name: 'actie', type: 3, description: 'Toevoegen of verwijderen', required: true, choices: [
                { name: 'Toevoegen', value: 'toevoegen' }, 
                { name: 'Verwijderen', value: 'verwijderen' }
            ]},
            { name: 'rollen', type: 3, description: 'Rol IDs gescheiden door kommas', required: true }
        ]},
        { name: 'kennistoets', description: 'Start een kennistoets voor Amsterdam training', options: [
            { name: 'training', type: 3, description: 'Selecteer de training', required: true, choices: Object.keys(TRAININGEN).map(t => ({ name: t, value: t })) }
        ]},
        { name: 'vog', description: 'VOG beheer - Verplicht voor Amsterdam overheidsfuncties', options: [
            { name: 'actie', type: 3, description: 'Kies een actie', required: true, choices: [
                { name: 'Aanvragen', value: 'aanvragen' },
                { name: 'Goedkeuren', value: 'goedkeuren' },
                { name: 'Afwijzen', value: 'afwijzen' },
                { name: 'Status bekijken', value: 'status' }
            ]},
            { name: 'gebruiker', type: 6, description: 'De gebruiker (voor goedkeuren/afwijzen)', required: false }
        ]},
        { name: 'sollicitatie_korpsleiding', description: 'KORPSLEIDING AMSTERDAM - GESLOTEN', options: [
            { name: 'gebruiker', type: 6, description: 'De sollicitant', required: true }
        ]},
        { name: 'maak_vog_panel', description: 'Maak VOG aanvraag panel aan voor Amsterdam (staff only)' },
        { name: 'maak_panels', description: 'Maak klacht & sollicitatie panels aan voor Amsterdam (staff only)' },
        { name: 'sollicitatie', description: 'Maak sollicitatie panel aan (staff only)' },
        { name: 'status', description: 'Bekijk de bot status van Amsterdam' },
        { name: 'help', description: 'Toon alle beschikbare commando\'s voor Amsterdam' },
        { name: 'roepnummer', description: 'Amsterdam Politie roepnummer beheer', options: [
            { name: 'mijn', type: 1, description: 'Toon je eigen Amsterdam politie roepnummer' },
            { name: 'nieuw', type: 1, description: 'Krijg een nieuw Amsterdam roepnummer' },
            { name: 'vrijgeven', type: 1, description: 'Geef je Amsterdam roepnummer vrij' },
            { name: 'zoek', type: 1, description: 'Zoek een Amsterdam agent (staff only)', options: [
                { name: 'gebruiker', type: 6, description: 'Discord gebruiker', required: true }
            ] },
            { name: 'lijst', type: 1, description: 'Toon alle Amsterdam agenten met roepnummer (staff only)' },
            { name: 'forceer', type: 1, description: 'Forceer een roepnummer check (staff only)', options: [
                { name: 'gebruiker', type: 6, description: 'Discord gebruiker', required: true }
            ] }
        ] }
    ];
    
    try {
        const existing = await rest.get(Routes.applicationCommands(DISCORD_CLIENT_ID));
        for (const cmd of existing) {
            try {
                await rest.delete(Routes.applicationCommand(DISCORD_CLIENT_ID, cmd.id));
                console.log(`Verwijderd: ${cmd.name}`);
            } catch (e) {}
        }
        
        await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });
        console.log('Commands geregistreerd voor Amsterdam!');
        console.log('🇳🇱 Gemeente Amsterdam - Overheid Portaal actief');
    } catch (error) { 
        console.error('Fout bij command registratie:', error); 
    }
}

// ============================================
// BOT EVENTS
// ============================================
client.once('ready', async () => {
    console.log(`Bot online! ${client.user.tag}`);
    console.log(`🏛️ Gemeente Amsterdam - Overheid Portaal`);
    client.user.setActivity(`Amsterdam | /help`, { type: 3 });
    
    try {
        await client.user.setAvatar(BOT_AVATAR_URL);
        console.log(`✅ Bot avatar geüpdatet naar Amsterdam logo`);
    } catch (error) {
        console.log(`Kon avatar niet updaten: ${error.message}`);
    }
    
    await registerCommands();
    console.log("Bot is klaar! Gebruik /maak_panels om de panels aan te maken.");
    
    await createSollicitatiesTabel();
    
    const { data, error } = await supabase.from('vog_aanvragen').select('count').limit(1);
    if (error) {
        console.error('Supabase verbinding fout:', error);
    } else {
        console.log('Supabase verbinding OK!');
    }
    
    setTimeout(async () => {
        await createVOGPanel();
    }, 2000);
});

client.on('guildMemberAdd', async (member) => {
    try {
        const role = member.guild.roles.cache.get("1402058415395704884");
        if (role) {
            await member.roles.add(role);
            console.log(`✅ Welkom rol toegevoegd aan ${member.user.tag}`);
        }
    } catch (error) {
        console.error(`Fout bij toevoegen welkom rol:`, error);
    }
    
    setTimeout(async () => {
        await checkEnKenRoepnummerToe(member);
    }, 5000);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const oldRoles = oldMember.roles.cache.map(r => r.id);
    const newRoles = newMember.roles.cache.map(r => r.id);
    
    if (JSON.stringify(oldRoles) !== JSON.stringify(newRoles)) {
        await checkEnKenRoepnummerToe(newMember);
    }
});

client.on('interactionCreate', async (interaction) => {
    try {
        // BUTTON HANDLER voor sollicitatie beoordeling
        if (interaction.isButton() && interaction.customId?.startsWith('beoordeel_')) {
            await handleBeoordeling(interaction);
            return;
        }
        
        // MODAL HANDLER voor beoordeling
        if (interaction.isModalSubmit() && interaction.customId?.startsWith('beoordeel_modal_')) {
            await verwerkBeoordeling(interaction);
            return;
        }
        
        // ROEPNUMMER COMMAND
        if (interaction.isCommand() && interaction.commandName === 'roepnummer') {
            await handleRoepnummer(interaction);
            return;
        }
        
        // ANDERE COMMANDS
        if (interaction.isCommand()) {
            const { commandName, options } = interaction;
            
            if (commandName === 'strike') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'Alleen admins.', flags: 64 });
                const user = options.getUser('gebruiker');
                const num = options.getInteger('nummer');
                const reden = options.getString('reden') || 'Geen reden';
                const member = await interaction.guild.members.fetch(user.id);
                const role = interaction.guild.roles.cache.get(STRIKE_ROLLEN[num]);
                if (!role) return interaction.reply({ content: 'Strike rol niet gevonden.', flags: 64 });
                await member.roles.add(role);
                interaction.reply({ content: `${user.username} heeft strike ${num}!\nReden: ${reden}`, flags: 64 });
                try { await user.send(`Je hebt strike ${num} ontvangen op Amsterdam server.\nReden: ${reden}`); } catch(e) {}
            }
            
            else if (commandName === 'ban') {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply({ content: 'Geen permissie.', flags: 64 });
                const user = options.getUser('gebruiker');
                const reden = options.getString('reden') || 'Geen reden';
                const member = await interaction.guild.members.fetch(user.id);
                if (!member.bannable) return interaction.reply({ content: 'Kan niet bannen.', flags: 64 });
                await member.ban({ reason: reden });
                interaction.reply({ content: `${user.username} is verbannen!\nReden: ${reden}`, flags: 64 });
            }
            
            else if (commandName === 'rolaanvraag') {
                if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
                    return interaction.reply({ content: 'Alleen de specifieke staffrol mag dit commando gebruiken.', flags: 64 });
                }
                
                const user = options.getUser('gebruiker');
                const actie = options.getString('actie');
                const rollenString = options.getString('rollen');
                const roleIds = rollenString.split(',').map(id => id.trim());
                const member = await interaction.guild.members.fetch(user.id);
                let successRoles = [];
                let failedRoles = [];
                
                for (const roleId of roleIds) {
                    const role = interaction.guild.roles.cache.get(roleId);
                    if (!role) {
                        failedRoles.push(roleId);
                        continue;
                    }
                    
                    if (actie === 'toevoegen') {
                        if (!member.roles.cache.has(roleId)) {
                            await member.roles.add(role);
                            successRoles.push(role.name);
                        } else {
                            failedRoles.push(`${role.name} (reeds aanwezig)`);
                        }
                    } else if (actie === 'verwijderen') {
                        if (member.roles.cache.has(roleId)) {
                            await member.roles.remove(role);
                            successRoles.push(role.name);
                        } else {
                            failedRoles.push(`${role.name} (niet aanwezig)`);
                        }
                    }
                }
                
                let replyMsg = actie === 'toevoegen' 
                    ? `${user.username} heeft rollen gekregen:\n${successRoles.join(', ') || 'Geen'}`
                    : `${user.username} heeft rollen verwijderd:\n${successRoles.join(', ') || 'Geen'}`;
                
                if (failedRoles.length > 0) {
                    replyMsg += `\n\nNiet gelukt:\n${failedRoles.join(', ')}`;
                }
                
                await interaction.reply({ content: replyMsg, flags: 64 });
                
                const logChannel = await client.channels.fetch(LOG_KANALEN.politie).catch(() => null);
                if (logChannel) {
                    await logChannel.send(`Rol ${actie === 'toevoegen' ? 'toevoeging' : 'verwijdering'}\n👤 ${user.username}\n🎭 ${successRoles.join(', ')}\n👮 Door: ${interaction.user.username}`);
                }
            }
            
            else if (commandName === 'kennistoets') {
                await interaction.reply({ content: 'Start toets...', flags: 64 });
                await startKennistoets(interaction, options.getString('training'));
            }
            
            else if (commandName === 'vog') {
                const actie = options.getString('actie');
                const gebruiker = options.getUser('gebruiker');
                
                if (actie === 'aanvragen') {
                    await startVOGaanvraag(interaction);
                }
                else if (actie === 'goedkeuren') {
                    if (!gebruiker) return interaction.reply({ content: 'Geef een gebruiker op.', flags: 64 });
                    await keurVOGgoed(interaction, gebruiker);
                }
                else if (actie === 'afwijzen') {
                    if (!gebruiker) return interaction.reply({ content: 'Geef een gebruiker op.', flags: 64 });
                    await wijsVOGaf(interaction, gebruiker);
                }
                else if (actie === 'status') {
                    await bekijkVOGstatus(interaction, gebruiker || null);
                }
            }
            
            else if (commandName === 'sollicitatie_korpsleiding') {
                return interaction.reply({ 
                    content: `KORPSLEIDING SOLLICITATIE AMSTERDAM IS GESLOTEN\n\nDeze functie is tijdelijk niet beschikbaar.`, 
                    flags: 64 
                });
            }
            
            else if (commandName === 'maak_vog_panel') {
                if (!heeftToegang(interaction.member)) return interaction.reply({ content: 'Alleen staff.', flags: 64 });
                await interaction.reply({ content: 'VOG panel wordt aangemaakt...', flags: 64 });
                await createVOGPanel();
                await interaction.followUp({ content: `VOG panel aangemaakt in <#${VOG_PANEL_KANAAL_ID}>!`, flags: 64 });
            }
            
            else if (commandName === 'maak_panels') {
                if (!heeftToegang(interaction.member)) return interaction.reply({ content: 'Alleen staff.', flags: 64 });
                await interaction.reply({ content: 'Panels worden aangemaakt...', flags: 64 });
                await createKlachtPanel(interaction.channel.id);
                await createSollicitatiePanel();
                await interaction.followUp({ content: 'Klachten panel en Sollicitatie panel zijn aangemaakt voor Amsterdam!', flags: 64 });
            }
            
            else if (commandName === 'sollicitatie') {
                if (!heeftToegang(interaction.member)) return interaction.reply({ content: 'Alleen staff.', flags: 64 });
                await interaction.reply({ content: 'Sollicitatie panel wordt aangemaakt...', flags: 64 });
                await createSollicitatiePanel();
                await interaction.followUp({ content: `Sollicitatie panel aangemaakt in <#${SOLLICITATIE_KANAAL_ID}>!`, flags: 64 });
            }
            
            else if (commandName === 'status') {
                const vogAantal = await getAantalGoedgekeurdeVOGs();
                const embed = new EmbedBuilder().setColor(THEMA.primary).setTitle('🏛️ Amsterdam Overheid Portaal Status')
                    .addFields(
                        { name: 'Bot', value: client.user.tag, inline: true },
                        { name: 'Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true },
                        { name: 'Uptime', value: formatUptime(client.uptime), inline: true },
                        { name: 'Trainingen', value: `${Object.keys(TRAININGEN).length}`, inline: true },
                        { name: 'Goedgekeurde VOGs', value: `${vogAantal}`, inline: true },
                        { name: 'Stad', value: 'Amsterdam 🇳🇱', inline: true }
                    )
                    .setFooter({ text: "Gemeente Amsterdam - Overheid Portaal", iconURL: BOT_AVATAR_URL })
                    .setTimestamp();
                await interaction.reply({ embeds: [embed] });
            }
            
            else if (commandName === 'help') {
                const embed = new EmbedBuilder()
                    .setColor(THEMA.primary)
                    .setTitle('🏛️ Amsterdam Overheid Bot Commando\'s')
                    .setDescription('Welkom bij de Amsterdam Overheid Portaal bot!')
                    .addFields(
                        { name: '🚨 Sancties', value: '/strike - Geef strike (1-3)\n/ban - Ban gebruiker', inline: false },
                        { name: '🎭 Rollen Beheer', value: '/rolaanvraag - Voeg/verwijder rollen', inline: false },
                        { name: '📚 Trainingen', value: '/kennistoets - Start toets (90% nodig voor certificaat)', inline: false },
                        { name: '📋 VOG Systeem', value: '/vog aanvragen - VOG aanvragen (VERPLICHT)\n/vog status - Status bekijken', inline: false },
                        { name: '📞 Roepnummer Systeem', value: '/roepnummer mijn - Jouw roepnummer\n/roepnummer nieuw - Krijg nieuw nummer\n/roepnummer vrijgeven - Geef vrij\n/roepnummer zoek - Zoek (staff)\n/roepnummer lijst - Alle nummers (staff)\n/roepnummer forceer - Forceer check (staff)', inline: false },
                        { name: '📝 Sollicitaties', value: 'Sollicitatie via panel - Beoordeling door staff (55 punten nodig)', inline: false },
                        { name: '🛠️ Panels', value: '/maak_panels - Klacht & Sollicitatie panels\n/maak_vog_panel - VOG panel\n/sollicitatie - Alleen sollicitatie panel', inline: false },
                        { name: 'ℹ️ Info', value: '/status - Bot status\n/help - Dit menu', inline: false }
                    )
                    .setFooter({ text: "Gemeente Amsterdam - VOG is verplicht voor alle functies", iconURL: BOT_AVATAR_URL })
                    .setTimestamp()
                    .setThumbnail(BOT_AVATAR_URL);
                await interaction.reply({ embeds: [embed] });
            }
        }
        
        // VOG PANEL BUTTONS
        else if (interaction.isButton() && interaction.customId === 'vog_panel_aanvragen') {
            await startVOGaanvraag(interaction);
        }
        else if (interaction.isButton() && interaction.customId === 'vog_panel_status') {
            await bekijkVOGstatus(interaction, null);
        }
        
        // SOLLICITATIE KNOP
        else if (interaction.isButton() && interaction.customId.startsWith('sollicitatie_')) {
            await startSollicitatie(interaction, interaction.customId.replace('sollicitatie_', ''));
        }
        
        // KLACHTEN SELECTIE
        else if (interaction.isStringSelectMenu() && interaction.customId === 'klacht_select') {
            await createKlachtTicket(interaction, interaction.values[0]);
        }
        
        // KLACHTEN MODAL
        else if (interaction.isModalSubmit() && interaction.customId.startsWith('klacht_modal_')) {
            const categoryId = interaction.customId.replace('klacht_modal_', '');
            await handleKlachtModal(interaction, categoryId);
        }
        
        // KLACHT CLAIM BUTTON
        else if (interaction.isButton() && interaction.customId?.startsWith('klacht_claim_')) {
            if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
                return interaction.reply({ content: '❌ Alleen staff kan klachten claimen.', flags: 64 });
            }
            
            const embed = interaction.message.embeds[0];
            const claimedBy = interaction.user;
            
            const claimEmbed = new EmbedBuilder()
                .setColor(THEMA.success)
                .setTitle("📋 Klacht geclaimd")
                .setDescription(`Deze klacht wordt nu behandeld door **${claimedBy.username}**.\n\nJe kunt je klacht hier verder bespreken.`)
                .setTimestamp();
            
            await interaction.reply({ embeds: [claimEmbed] });
            
            const updatedEmbed = EmbedBuilder.from(embed)
                .addFields({ name: "📋 Behandeld door", value: claimedBy.username, inline: true });
            
            await interaction.message.edit({ embeds: [updatedEmbed] });
        }
        
        // KLACHT SLUITEN BUTTON
        else if (interaction.isButton() && interaction.customId?.startsWith('klacht_close_')) {
            if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID) && interaction.user.id !== interaction.channel.name.split('-')[1]) {
                return interaction.reply({ content: '❌ Alleen staff of de klacht indiener kan deze klacht sluiten.', flags: 64 });
            }
            
            await interaction.reply({ content: '🔒 Klacht sluit over 5 seconden...' });
            setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
        }
        
        // KLACHT TRANSCRIPT BUTTON
        else if (interaction.isButton() && interaction.customId?.startsWith('klacht_transcript_')) {
            if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
                return interaction.reply({ content: '❌ Alleen staff kan een transcript maken.', flags: 64 });
            }
            
            await interaction.reply({ content: '📄 Transcript wordt gegenereerd...', flags: 64 });
            
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            let transcript = `🏛️ GEMEENTE AMSTERDAM - KLACHT TRANSCRIPT\n`;
            transcript += `─────────────────────────────────────────────────────\n`;
            transcript += `Kanaal: ${interaction.channel.name}\n`;
            transcript += `Datum: ${new Date().toLocaleString('nl-NL')}\n`;
            transcript += `─────────────────────────────────────────────────────\n\n`;
            
            messages.reverse().forEach(msg => {
                transcript += `[${msg.createdAt.toLocaleTimeString('nl-NL')}] ${msg.author.tag}: ${msg.content}\n`;
                if (msg.embeds.length > 0) {
                    transcript += `[EMBED] ${msg.embeds[0].title || 'Embed'}: ${msg.embeds[0].description || ''}\n`;
                }
            });
            
            transcript += `\n─────────────────────────────────────────────────────\n`;
            transcript += `Einde van transcript - Gemeente Amsterdam`;
            
            const buffer = Buffer.from(transcript, 'utf-8');
            await interaction.followUp({ 
                content: `📄 Transcript voor klacht ${interaction.channel.name}:`,
                files: [{ attachment: buffer, name: `klacht-transcript-${interaction.channel.name}.txt` }],
                flags: 64 
            });
        }
        
        // VOG MODAL HANDLERS
        else if (interaction.isModalSubmit() && interaction.customId === 'vog_modal') {
            await verwerkVOGaanvraag(interaction);
        }
        else if (interaction.isModalSubmit() && interaction.customId === 'vog_afwijs_modal') {
            await verwerkVOGafwijzing(interaction);
        }
        
    } catch (error) { 
        console.error('Error:', error); 
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'Er is een fout opgetreden in de Amsterdam bot.', flags: 64 }).catch(() => {});
        }
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.type !== ChannelType.DM) return;
    
    const user = message.author;
    
    const sollicitatieSessie = actieveSollicitaties.get(user.id);
    if (sollicitatieSessie && sollicitatieSessie.huidigeVraag < sollicitatieSessie.totaalVragen) {
        await verwerkSollicitatieAntwoord(user, sollicitatieSessie.dienstId, message.content, sollicitatieSessie.huidigeVraag);
        return;
    }
    
    const toetsSessie = actieveToetsen.get(user.id);
    if (toetsSessie && toetsSessie.huidigeVraag < toetsSessie.totaalVragen) {
        await verwerkToetsAntwoord(user, toetsSessie.trainingNaam, message.content, toetsSessie.huidigeVraag);
        return;
    }
    
    if (!message.content.startsWith('/')) {
        await user.send("Je hebt geen actieve sollicitatie of toets. Gebruik /sollicitatie of /kennistoets in de server om te starten.\n\nEen VOG is verplicht voor alle functies bij de gemeente Amsterdam (behalve Pechhulp).");
    }
});

// ============================================
// WEBSERVER
// ============================================
const path = require('path');
const webApp = express();
const PORT = process.env.PORT || 3000;

webApp.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

webApp.get('/health', async (req, res) => {
    let vogCount = 0;
    try {
        const { count, error } = await supabase
            .from('vog_aanvragen')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'approved');
        
        if (!error) {
            vogCount = count || 0;
        }
    } catch (error) {
        console.error('Fout bij ophalen VOG count:', error);
    }
    
    res.json({ 
        status: 'online', 
        bot: client.user?.tag, 
        stad: 'Amsterdam',
        ping: `${Math.round(client.ws.ping)}ms`,
        uptime: formatUptime(client.uptime),
        vogCount: vogCount
    });
});

webApp.listen(PORT, () => {
    console.log(`✅ Webpagina op poort ${PORT} - Gemeente Amsterdam`);
});

// ============================================
// LOGIN
// ============================================
client.login(DISCORD_BOT_TOKEN);
