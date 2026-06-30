const FIVEM_HOST = process.env.FIVEM_STATUS_HOST || "185.229.35.13";
const FIVEM_PORT = process.env.FIVEM_STATUS_PORT || "30120";
const FIVEM_JOIN_URL = process.env.FIVEM_JOIN_URL || "https://cfx.re/join/8emey4v";
const DISCORD_GUILD_ID =
  process.env.STATUS_DISCORD_GUILD_ID ||
  process.env.MAIN_DISCORD_GUILD_ID ||
  "1521182073967083610";
const DISCORD_BOT_TOKEN = cleanToken(
  process.env.STATUS_DISCORD_BOT_TOKEN ||
    process.env.MAIN_DISCORD_BOT_TOKEN ||
    process.env.STAFF_DISCORD_BOT_TOKEN ||
    process.env.DISCORD_BOT_TOKEN
);

function cleanToken(token) {
  return String(token || "").replace(/^Bot\s+/i, "").trim();
}

async function fetchJson(url, timeoutMs = 8000, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

async function getFivemStatus() {
  const dynamicUrl = `http://${FIVEM_HOST}:${FIVEM_PORT}/dynamic.json?t=${Date.now()}`;
  const data = await fetchJson(dynamicUrl, 6000);
  const players = numberOrNull(data.clients);
  const maxPlayers = numberOrNull(data.sv_maxclients);

  if (players === null || maxPlayers === null) {
    throw new Error("Ongeldige FiveM status");
  }

  return {
    online: true,
    players,
    maxPlayers,
    hostname: data.hostname || "Amsterdam Roleplay",
    queue: numberOrNull(data.queue) ?? numberOrNull(data.vars?.queue) ?? null,
    maintenance: false,
    maintenanceText: "",
    endpoint: `${FIVEM_HOST}:${FIVEM_PORT}`,
  };
}

async function getDiscordStatusWithBot() {
  if (!DISCORD_GUILD_ID || !DISCORD_BOT_TOKEN) return null;

  const guild = await fetchJson(
    `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}?with_counts=true`,
    6000,
    {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      },
    }
  );

  return {
    id: DISCORD_GUILD_ID,
    name: guild.name || "Amsterdam Roleplay",
    members: numberOrNull(guild.approximate_member_count),
    online: numberOrNull(guild.approximate_presence_count),
    source: "bot",
  };
}

async function getDiscordStatusWithWidget() {
  if (!DISCORD_GUILD_ID) return null;

  const widget = await fetchJson(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/widget.json`, 6000);
  const online = Array.isArray(widget.members) ? widget.members.length : null;

  return {
    id: DISCORD_GUILD_ID,
    name: widget.name || "Amsterdam Roleplay",
    members: null,
    online,
    source: "widget",
  };
}

async function getDiscordStatus() {
  try {
    const status = await getDiscordStatusWithBot();
    if (status) return status;
  } catch {
    // Fall back to the public widget if the bot lacks access or counts fail.
  }

  try {
    return await getDiscordStatusWithWidget();
  } catch {
    return {
      id: DISCORD_GUILD_ID,
      name: "Amsterdam Roleplay",
      members: null,
      online: null,
      source: "unavailable",
    };
  }
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const [fivemResult, discordResult] = await Promise.allSettled([getFivemStatus(), getDiscordStatus()]);
  const fivem =
    fivemResult.status === "fulfilled"
      ? fivemResult.value
      : {
          online: false,
          players: null,
          maxPlayers: null,
          hostname: null,
          queue: null,
          maintenance: false,
          maintenanceText: "",
          endpoint: `${FIVEM_HOST}:${FIVEM_PORT}`,
          error: fivemResult.reason?.message || "FiveM status niet bereikbaar",
        };
  const discord =
    discordResult.status === "fulfilled"
      ? discordResult.value
      : {
          id: DISCORD_GUILD_ID,
          name: "Amsterdam Roleplay",
          members: null,
          online: null,
          source: "unavailable",
        };

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(
    JSON.stringify({
      online: fivem.online,
      players: fivem.players,
      maxPlayers: fivem.maxPlayers,
      status: fivem.online ? "online" : "offline",
      serverName: fivem.hostname,
      join: FIVEM_JOIN_URL,
      queue: fivem.queue,
      maintenance: fivem.maintenance,
      maintenanceText: fivem.maintenanceText,
      updatedAt: new Date().toISOString(),
      fivem,
      discord,
    })
  );
};
