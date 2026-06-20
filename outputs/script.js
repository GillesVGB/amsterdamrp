const menuToggle = document.querySelector(".menu-toggle");
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
        (rule) => `<details class="rule-card cat${rule.category}">
          <summary>
            <span class="rule-title"><span class="rule-num">Art. ${rule.num}</span><strong>${rule.title}</strong></span>
            <span class="rule-meta">

              <span class="rule-sanction cat${rule.category}">${rule.sanction}</span>
            </span>
          </summary>
          <div class="rule-body">${rule.content}</div>
        </details>`
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

    try {
      const response = await fetch(config.statusApi, { cache: "no-store" });
      if (!response.ok) throw new Error("Status API " + response.status);

      const status = await response.json();
      const fivem = status.fivem || {};
      const discord = status.discord || {};

      data.players = fivem.players ?? data.players;
      data.maxPlayers = fivem.maxPlayers ?? data.maxPlayers;
      data.discordMembers = discord.members ?? data.discordMembers;
      data.discordOnline = discord.online ?? data.discordOnline;
      data.playersText = "Niet beschikbaar";
      data.capacityText = "Niet beschikbaar";
      data.discordMembersText = "Niet beschikbaar";
      data.discordOnlineText = "Niet beschikbaar";
      data.state = fivem.online === false ? "FiveM server offline" : "Live serverdata actief";
      return true;
    } catch {
      return false;
    }
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
initStatus();
