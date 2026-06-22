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

    if (!rules.length) {
      list.innerHTML = `<div class="rule-empty">
        <strong>Geen regels gevonden</strong>
        <p>Probeer een andere zoekterm of kies opnieuw Alles.</p>
      </div>`;
      return;
    }

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

function showToast(message) {
  let toast = document.querySelector(".site-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "site-toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function initConnectCopy() {
  document.querySelectorAll("[data-connect-copy]").forEach((block) => {
    const command = block.dataset.connectCopy || "";
    const copy = () => {
      navigator.clipboard.writeText(command).then(
        () => showToast("Connect gekopieerd!"),
        () => showToast("Kopieren mislukt")
      );
    };
    block.addEventListener("click", copy);
    block.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        copy();
      }
    });
  });
}

const COOKIE_CONSENT_KEY = "ar-cookie-consent";

function getCookieConsent() {
  try {
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveCookieConsent(consent) {
  const nextConsent = {
    necessary: true,
    liveStatus: Boolean(consent.liveStatus),
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(nextConsent));
  } catch {}

  window.dispatchEvent(new CustomEvent("ar-cookie-consent-change", { detail: nextConsent }));
}

function canUseExternalStatus() {
  return getCookieConsent()?.liveStatus === true;
}

function initCookieConsent() {
  const banner = document.querySelector("[data-cookie-banner]");
  const modal = document.querySelector("[data-cookie-modal]");
  const liveStatusToggle = document.querySelector("[data-cookie-live-status]");

  function openModal() {
    const consent = getCookieConsent();
    if (liveStatusToggle) liveStatusToggle.checked = consent?.liveStatus !== false;
    modal?.removeAttribute("hidden");
  }

  function closeModal() {
    modal?.setAttribute("hidden", "");
  }

  function hideBanner() {
    banner?.setAttribute("hidden", "");
  }

  if (!getCookieConsent()) {
    banner?.removeAttribute("hidden");
  }

  document.querySelectorAll("[data-cookie-settings]").forEach((button) => {
    button.addEventListener("click", openModal);
  });

  document.querySelectorAll("[data-cookie-close]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.querySelectorAll("[data-cookie-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.dataset.cookieChoice;
      saveCookieConsent({ liveStatus: choice === "all" });
      hideBanner();
      closeModal();
    });
  });

  document.querySelector("[data-cookie-save]")?.addEventListener("click", () => {
    saveCookieConsent({ liveStatus: liveStatusToggle?.checked === true });
    hideBanner();
    closeModal();
  });
}

function initStatus() {
  const widgets = [...document.querySelectorAll("[data-status-widget]")];
  if (!widgets.length) return;

  const config = {
    statusApi: widgets[0].dataset.statusApi || "",
    discordInviteCode: widgets[0].dataset.discordInvite || "",
    fivemCode: widgets[0].dataset.fivemCode || "",
    fivemEndpoint: widgets[0].dataset.fivemEndpoint || "",
  };

  const data = {
    players: null,
    maxPlayers: null,
    hostname: null,
    online: null,
    joinUrl: "https://cfx.re/join/8emey4v",
    loading: true,
    state: "Gegevens laden...",
    discordMembers: null,
    discordOnline: null,
    queue: null,
    maintenance: false,
    maintenanceText: "",
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

  function setVisualState(state) {
    document.querySelectorAll("[data-status-signal], .status-signal").forEach((el) => {
      el.dataset.state = state;
    });
    document.querySelectorAll(".status-main").forEach((el) => {
      el.dataset.state = state;
    });
    document.querySelectorAll("[data-status-cards]").forEach((el) => {
      el.dataset.state = state;
    });
    widgets.forEach((widget) => {
      widget.dataset.state = state;
    });
  }

  function setBadge(label, state) {
    document.querySelectorAll('[data-status="badge"]').forEach((el) => {
      el.textContent = label;
      el.dataset.state = state;
    });
  }

  function updateJoinLinks() {
    const joinUrl = data.joinUrl || "https://cfx.re/join/8emey4v";
    const joinCode = joinUrl.replace(/^https?:\/\/cfx\.re\/join\//, "");
    document.querySelectorAll("[data-status-join]").forEach((el) => {
      el.href = joinUrl;
      const codeEl = el.querySelector("code");
      if (codeEl && joinCode) codeEl.textContent = "cfx.re/join/" + joinCode;
    });
  }

  function isExternalApi(url) {
    return /^https?:\/\//i.test(url);
  }

  async function fetchStatusApi(url) {
    if (isExternalApi(url)) return fetchJson(url);
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Status API " + response.status);
    return response.json();
  }

  function withTimeout(promise, timeoutMs) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Status timeout")), timeoutMs)),
    ]);
  }

  function applyStatusPayload(status) {
    if (!status || typeof status !== "object") return false;

    if (status.fivem || status.discord) {
      const fivem = status.fivem || {};
      const discord = status.discord || {};
      data.players = fivem.players ?? data.players;
      data.maxPlayers = fivem.maxPlayers ?? data.maxPlayers;
      data.hostname = fivem.hostname ?? data.hostname;
      data.discordMembers = discord.members ?? data.discordMembers;
      data.discordOnline = discord.online ?? data.discordOnline;
      data.queue = fivem.queue ?? status.queue ?? data.queue;
      data.maintenance = status.maintenance ?? fivem.maintenance ?? data.maintenance;
      data.maintenanceText = status.maintenanceText ?? status.maintenanceMessage ?? fivem.maintenanceText ?? data.maintenanceText;
      if (fivem.online === true || fivem.online === false) data.online = fivem.online;
      return true;
    }

    if (
      status.online !== undefined ||
      status.players !== undefined ||
      status.maxPlayers !== undefined ||
      status.serverName !== undefined
    ) {
      data.players = status.players ?? data.players;
      data.maxPlayers = status.maxPlayers ?? data.maxPlayers;
      data.hostname = status.serverName ?? status.hostname ?? data.hostname;
      data.queue = status.queue ?? status.queueSize ?? status.playersQueue ?? data.queue;
      data.maintenance = status.maintenance ?? status.maintenanceMode ?? data.maintenance;
      data.maintenanceText = status.maintenanceText ?? status.maintenanceMessage ?? status.message ?? data.maintenanceText;
      data.online = status.online === true || status.status === "online";
      if (status.online === false || status.status === "offline") data.online = false;
      if (status.join) data.joinUrl = status.join;
      return true;
    }

    return false;
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
    if (!canUseExternalStatus()) {
      data.discordMembers = null;
      data.discordOnline = null;
      return;
    }

    try {
      const invite = await fetchJson("https://discord.com/api/v10/invites/" + encodeURIComponent(config.discordInviteCode) + "?with_counts=true");
      data.discordMembers = invite.approximate_member_count;
      data.discordOnline = invite.approximate_presence_count;
    } catch {
      data.discordMembers = null;
      data.discordOnline = null;
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
      data.hostname = server.hostname ?? data.hostname;
      data.online = true;
    } catch {
      data.players = null;
      data.maxPlayers = null;
      data.hostname = null;
      data.online = false;
    }
  }

  async function loadStatusApi() {
    if (!config.statusApi) return false;
    const urls = [config.statusApi];

    if (config.statusApi !== "/api/status" && window.location.protocol !== "file:") {
      urls.push("/api/status");
    }

    const attempts = urls
      .filter((url) => !(url.startsWith("/") && window.location.protocol === "file:"))
      .map((url) =>
        withTimeout(fetchStatusApi(url), url === config.statusApi ? 4000 : 10000).then((status) => {
          if (applyStatusPayload(status)) return true;
          throw new Error("Ongeldig statusformaat");
        })
      );

    if (!attempts.length) return false;

    try {
      return await Promise.any(attempts);
    } catch {
      return false;
    }
  }

  async function loadLiveData() {
    data.loading = true;
    update();

    const [apiResult] = await Promise.allSettled([loadStatusApi(), withTimeout(loadDiscordStats(), 5000)]);

    if (!apiResult.value) {
      await loadFivemStats();
    }

    if (!getFivemUrl() && config.discordInviteCode && data.online !== true) {
      data.online = data.online === false ? false : null;
    }

    data.loading = false;
    update();
  }

  function update() {
    const now = new Date();
    const players = Number(data.players);
    const maxPlayers = Number(data.maxPlayers);
    const queue = Number(data.queue);
    const hasLiveCount = Number.isFinite(players) && Number.isFinite(maxPlayers) && maxPlayers > 0;
    const fillPercent = hasLiveCount ? Math.round((players / maxPlayers) * 100) : 0;
    const maintenanceActive = data.maintenance === true || data.maintenance === "true" || data.maintenance === "active";

    if (data.loading) {
      data.state = "Gegevens laden...";
      setVisualState("loading");
      setBadge("Laden", "loading");
    } else if (maintenanceActive) {
      data.state = "Onderhoud actief";
      setVisualState("loading");
      setBadge("Onderhoud", "loading");
    } else if (data.online === true && hasLiveCount) {
      data.state = "Server online - " + numberText(players, "?") + "/" + numberText(maxPlayers, "?") + " spelers";
      setVisualState("online");
      setBadge("Online", "online");
    } else if (data.online === false) {
      data.state = "Server offline";
      setVisualState("offline");
      setBadge("Offline", "offline");
    } else if (data.discordMembers !== null) {
      data.state = "Discord actief, FiveM nog niet gekoppeld";
      setVisualState("loading");
      setBadge("Gedeeltelijk", "loading");
    } else {
      data.state = "Status niet beschikbaar";
      setVisualState("offline");
      setBadge("Onbekend", "offline");
    }

    setText("players", numberText(players, data.online === false ? "Offline" : "-"));
    setText("playersCompact", numberText(players, data.online === false ? "0" : "-"));
    setText("capacity", numberText(maxPlayers, "-"));
    setText("fill", hasLiveCount ? fillPercent + "%" : "-");
    setText("queue", Number.isFinite(queue) && queue > 0 ? numberText(queue, "-") : "Geen wachtrij");
    setText("maintenance", maintenanceActive ? "Actief" : "Geen");
    setText("maintenanceText", maintenanceActive ? data.maintenanceText || "Er is een onderhoudsmelding actief." : "Geen melding actief");
    setText("discordMembers", canUseExternalStatus() ? numberText(data.discordMembers, "Niet beschikbaar") : "Cookiekeuze nodig");
    setText("discordOnline", canUseExternalStatus() ? numberText(data.discordOnline, "Niet beschikbaar") : "Cookiekeuze nodig");
    setText("updated", now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    setText("hostname", data.hostname || (data.online === false ? "Server niet bereikbaar" : "Servernaam verschijnt zodra de server online is."));
    setText("stateCompact", data.loading ? "Laden..." : data.online === true ? "Online" : data.online === false ? "Offline" : "Status onbekend");

    document.querySelectorAll('[data-status="fillBar"]').forEach((el) => {
      el.style.width = hasLiveCount ? fillPercent + "%" : "0%";
      el.dataset.level = hasLiveCount ? (fillPercent >= 85 ? "high" : fillPercent >= 55 ? "mid" : "low") : "";
    });

    document.querySelectorAll("[data-status-capacity-ring]").forEach((el) => {
      const ring = el.querySelector(".ring-fill");
      const circumference = 2 * Math.PI * 42;
      if (ring) {
        ring.style.strokeDasharray = String(circumference);
        ring.style.strokeDashoffset = hasLiveCount ? String(circumference * (1 - fillPercent / 100)) : String(circumference);
      }
      el.dataset.level = hasLiveCount ? (fillPercent >= 85 ? "high" : fillPercent >= 55 ? "mid" : "low") : "";
      el.dataset.state = data.loading ? "loading" : data.online === true ? "online" : data.online === false ? "offline" : "loading";
    });

    document.querySelectorAll(".status-card-maintenance").forEach((el) => {
      el.dataset.maintenance = maintenanceActive ? "active" : "none";
    });

    updateJoinLinks();

    const state = document.querySelector("#serverState");
    if (state) state.textContent = data.state;
  }

  update();
  loadLiveData();
  setInterval(loadLiveData, 30000);
  window.addEventListener("ar-cookie-consent-change", loadLiveData);
}

initRules();
initConnectCopy();
initCookieConsent();
initStatus();
