const FIVEM_DYNAMIC_URL = process.env.FIVEM_DYNAMIC_URL || "http://185.229.35.13:30120/dynamic.json";
const FIVEM_JOIN_URL = process.env.FIVEM_JOIN_URL || "https://cfx.re/join/8emey4v";
const SERVER_NAME = process.env.STATUS_SERVER_NAME || "Amsterdam Roleplay";

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(payload),
  };
}

exports.handler = async function handler() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${FIVEM_DYNAMIC_URL}?t=${Date.now()}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error("FiveM status niet bereikbaar");
    const data = await response.json();
    if (data?.clients === undefined || data?.sv_maxclients === undefined) {
      throw new Error("Ongeldige FiveM status");
    }

    return json(200, {
      online: true,
      players: Number(data.clients) || 0,
      maxPlayers: Number(data.sv_maxclients) || 0,
      status: "online",
      serverName: data.hostname || SERVER_NAME,
      join: FIVEM_JOIN_URL,
      queue: Number(process.env.QUEUE_COUNT || 0) || 0,
      maintenance: process.env.MAINTENANCE_ENABLED === "true",
      maintenanceText: process.env.MAINTENANCE_TEXT || "",
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return json(200, {
      online: false,
      players: 0,
      maxPlayers: Number(process.env.FIVEM_MAX_PLAYERS || 128) || 128,
      status: "offline",
      serverName: SERVER_NAME,
      join: FIVEM_JOIN_URL,
      queue: Number(process.env.QUEUE_COUNT || 0) || 0,
      maintenance: process.env.MAINTENANCE_ENABLED === "true",
      maintenanceText: process.env.MAINTENANCE_TEXT || "",
      error: error.message,
      updatedAt: new Date().toISOString(),
    });
  }
};
