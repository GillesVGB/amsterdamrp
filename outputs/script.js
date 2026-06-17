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

  const data = window.AR_STATUS || {
    players: null,
    maxPlayers: null,
    state: "Live serverdata nog niet gekoppeld",
    peakHour: "Koppel live data om piekdrukte te tonen.",
    peakDay: "Koppel live data om dagrecords te tonen.",
  };

  function setText(name, value) {
    document.querySelectorAll(`[data-status="${name}"]`).forEach((el) => {
      el.textContent = value;
    });
  }

  function update() {
    const now = new Date();
    const hasPlayers = data.players !== null && data.players !== undefined && data.players !== "";
    const hasMaxPlayers = data.maxPlayers !== null && data.maxPlayers !== undefined && data.maxPlayers !== "";
    const players = hasPlayers ? Number(data.players) : NaN;
    const maxPlayers = hasMaxPlayers ? Number(data.maxPlayers) : NaN;
    const hasLiveCount = Number.isFinite(players) && Number.isFinite(maxPlayers) && maxPlayers > 0;

    setText("players", Number.isFinite(players) ? players : "Niet gekoppeld");
    setText("capacity", Number.isFinite(maxPlayers) ? maxPlayers : "Niet gekoppeld");
    setText("fill", hasLiveCount ? Math.round((players / maxPlayers) * 100) + "%" : "-");
    setText("updated", now.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }));
    setText("peakHour", data.peakHour);
    setText("peakDay", data.peakDay);
    const state = document.querySelector("#serverState");
    if (state) state.textContent = data.state;
  }

  update();
  setInterval(update, 15000);
}

initRules();
initStatus();
