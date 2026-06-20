const FIVEM_DYNAMIC_URL = "http://185.229.35.13:30120/dynamic.json";
const DISCORD_INVITE_URL = "https://discord.com/api/v10/invites/PPcBUGhePj?with_counts=true";

async function fetchJson(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
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

  const status = {
    updatedAt: new Date().toISOString(),
    fivem: {
      online: false,
      players: null,
      maxPlayers: null,
      hostname: null,
    },
    discord: {
      members: null,
      online: null,
    },
  };

  try {
    const fivem = await fetchJson(FIVEM_DYNAMIC_URL);
    status.fivem.online = true;
    status.fivem.players = Number(fivem.clients);
    status.fivem.maxPlayers = Number(fivem.sv_maxclients);
    status.fivem.hostname = fivem.hostname || null;
  } catch (error) {
    status.fivem.error = error.message;
  }

  try {
    const invite = await fetchJson(DISCORD_INVITE_URL);
    status.discord.members = Number(invite.approximate_member_count);
    status.discord.online = Number(invite.approximate_presence_count);
  } catch (error) {
    status.discord.error = error.message;
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(status));
};
