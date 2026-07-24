// ============================================================
// Divyansh Gupta Portfolio — behavior only.
// All visible text lives in index.html. English is the text
// already sitting in each element; Hindi lives in that same
// element's data-hi="..." attribute. This file only toggles
// between the two — it holds no site content itself.
//
// HOW TO EDIT THE SITE
// ---------------------------------------------------------------
// - Change English text: edit it directly inside the HTML tag.
// - Change/add Hindi text: edit or add a data-hi="..." attribute
//   on that same tag. If an element has no data-hi, it just stays
//   in English when the visitor switches languages — nothing
//   breaks.
// - Add a project/skill/certification/education entry, a social
//   link, etc.: copy an existing block in index.html (e.g. one
//   .project-card or .cert-card) and edit the copy. No JS changes
//   needed — this file works off data-hi generically, so any new
//   section picks up language + theme switching for free.
// ============================================================

let CURRENT_LANG = "en";

// ---------- 1. language toggle ----------
// Swaps innerHTML (not textContent) so inline tags like <strong>
// in the English version are preserved when switching back.
function applyLangToScope(scopeEl, lang) {
  scopeEl.querySelectorAll("[data-hi]").forEach((el) => {
    if (el.dataset.en === undefined) {
      el.dataset.en = el.innerHTML; // cache the original English once
    }
    el.innerHTML = lang === "hi" ? el.dataset.hi : el.dataset.en;
  });
}

function applyLang(lang) {
  applyLangToScope(document, lang);
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("data-lang", lang);
}

function initLang() {
  CURRENT_LANG = localStorage.getItem("portfolio-lang") || "en";
  applyLang(CURRENT_LANG);

  document.getElementById("langToggle").addEventListener("click", () => {
    CURRENT_LANG = CURRENT_LANG === "hi" ? "en" : "hi";
    localStorage.setItem("portfolio-lang", CURRENT_LANG);
    applyLang(CURRENT_LANG);
  });
}

// ---------- 2. theme toggle ----------
function initTheme() {
  const theme = localStorage.getItem("portfolio-theme") || "dark";
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeIcon(theme);

  document.getElementById("themeToggle").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("portfolio-theme", next);
    updateThemeIcon(next);
  });
}

function updateThemeIcon(theme) {
  const icon = document.querySelector(".theme-icon");
  if (icon) icon.textContent = theme === "light" ? "☀" : "☾";
}

// ---------- 3. scroll-spy nav ----------
function initScrollSpy() {
  const sections = document.querySelectorAll("section[id], header[id]");
  const navNodes = document.querySelectorAll('.navlist .nav-node[href^="#"]');

  const setActive = (id) => {
    navNodes.forEach((node) => {
      const isActive = node.getAttribute("href") === `#${id}`;
      node.style.color = isActive ? "var(--accent)" : "";
      node.style.borderColor = isActive ? "var(--accent-dim)" : "";
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
  );

  sections.forEach((section) => observer.observe(section));
}

// ---------- 4. optional live enhancement: public GitHub stats ----------
// Text for the card lives in the <template id="githubStatTemplate">
// in index.html, not here — this just fills in the number and
// drops the card into the page. Fails silently if offline/rate-limited.
async function addGithubStatCard() {
  const template = document.getElementById("githubStatTemplate");
  const target = document.getElementById("aboutStats");
  if (!template || !target) return;

  try {
    const res = await fetch(
      "https://api.github.com/search/commits?q=author:divyanshg221220",
      { headers: { Accept: "application/vnd.github+json" } },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const clone = template.content.cloneNode(true);
    clone.querySelector('[data-role="value"]').textContent = data.total_count;
    applyLangToScope(clone, CURRENT_LANG);
    target.appendChild(clone);
  } catch (err) {
    console.warn("GitHub stats unavailable:", err.message);
  }
}

// ---------- 5. boot ----------
document.addEventListener("DOMContentLoaded", () => {
  initLang();
  initTheme();
  initScrollSpy();
  addGithubStatCard();
});
