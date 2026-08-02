// Divyansh Gupta Portfolio — behavior only.

let CURRENT_LANG = "en";

/**
 * Language toggle (English / Hindi)
 * Every translatable element has a `data-hi` attribute holding the Hindi
 * version. The first time we switch language, we cache the original
 * (English) HTML in `data-en` so we can always switch back to it later.
 */
function applyLangToScope(scopeEl, lang) {
  scopeEl.querySelectorAll("[data-hi]").forEach((el) => {
    if (el.dataset.en === undefined) {
      el.dataset.en = el.innerHTML;
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
  // Remember the visitor's last choice across page reloads.
  CURRENT_LANG = localStorage.getItem("portfolio-lang") || "en";
  applyLang(CURRENT_LANG);

  // The toggle button is optional — the language still applies correctly
  // from localStorage even if there's no button in the markup to switch it.
  const toggleBtn = document.getElementById("langToggle");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    CURRENT_LANG = CURRENT_LANG === "hi" ? "en" : "hi";
    localStorage.setItem("portfolio-lang", CURRENT_LANG);
    applyLang(CURRENT_LANG);
  });
}

/**
 * Theme toggle (dark / light)
 * The QR code image has separate light/dark artwork, so whenever the theme
 * changes we swap which file it points to as well.
 */
function updateQrTheme() {
  const qrImage = document.getElementById("qrImage");
  if (!qrImage) return;

  const currentTheme = document.documentElement.getAttribute("data-theme");
  qrImage.src =
    currentTheme === "light"
      ? "divyanshg221220-light.svg"
      : "divyanshg221220-dark.svg";
}

function updateThemeIcon(theme) {
  const icon = document.querySelector(".theme-icon");
  if (icon) icon.textContent = theme === "light" ? "☀" : "☾";
}

function initTheme() {
  const theme = localStorage.getItem("portfolio-theme") || "dark";
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeIcon(theme);
  updateQrTheme();

  const toggleBtn = document.getElementById("themeToggle");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("portfolio-theme", next);
    updateThemeIcon(next);
    updateQrTheme();
  });
}

/**
 * Scroll-spy navigation
 * Highlights the nav link for whichever section is currently in view.
 */
function initScrollSpy() {
  const sections = document.querySelectorAll("section[id], header[id]");
  const navLinks = document.querySelectorAll('.navlist .nav-node[href^="#"]');

  const highlightActiveLink = (sectionId) => {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${sectionId}`;
      link.style.color = isActive ? "var(--accent)" : "";
      link.style.borderColor = isActive ? "var(--accent-dim)" : "";
      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) highlightActiveLink(entry.target.id);
      });
    },
    // Treat a section as "active" once it's roughly in the middle band
    // of the viewport, rather than requiring it to fill the whole screen.
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
  );

  sections.forEach((section) => observer.observe(section));
}

/**
 * Scroll reveal
 * Fades/slides each section in the first time it scrolls into view,
 * then stops watching it (the animation only needs to run once).
 */
function initScrollReveal() {
  const sections = document.querySelectorAll("section[id]");
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries, observerRef) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observerRef.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  sections.forEach((section) => observer.observe(section));
}

/**
 * GitHub contribution count
 * Fetches total contributions from a third-party mirror of GitHub's
 * contribution graph and renders it into a stat card. Falls back to a
 * simple message if the request fails.
 */
async function addGithubStatCard() {
  const template = document.getElementById("githubStatTemplate");
  const target = document.getElementById("aboutStats");
  if (!template || !target) return;

  try {
    const res = await fetch(
      "https://github-contributions-api.jogruber.de/v4/divyanshg221220?y=all",
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const totalContributions = Object.values(data.total || {}).reduce(
      (sum, count) => sum + count,
      0,
    );

    const statCard = template.content.cloneNode(true);
    statCard.querySelector('[data-role="value"]').textContent =
      totalContributions;
    applyLangToScope(statCard, CURRENT_LANG);
    target.appendChild(statCard);
  } catch (err) {
    console.warn("GitHub stats unavailable:", err.message);
    const message =
      CURRENT_LANG === "hi"
        ? "GitHub आँकड़े अभी उपलब्ध नहीं — प्रोफ़ाइल सीधे देखें।"
        : "GitHub stats unavailable right now — see profile directly.";
    const fallback = document.createElement("div");
    fallback.className = "stat-box";
    fallback.innerHTML = `<div class="stat-label" style="margin-top:0">${message}</div>`;
    target.appendChild(fallback);
  }
}

/**
 * Nav bar horizontal scroll
 * Lets a vertical mouse wheel scroll the nav list sideways when it
 * overflows, instead of requiring a horizontal scroll gesture.
 */
function initNavWheelScroll() {
  const navlist = document.querySelector(".navlist");
  if (!navlist) return;

  navlist.addEventListener(
    "wheel",
    (e) => {
      if (navlist.scrollWidth <= navlist.clientWidth) return; // nothing to scroll

      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0) return;

      e.preventDefault();
      navlist.scrollLeft += delta;
    },
    { passive: false },
  );
}

/**
 * QR code fallback
 * If the QR image fails to load, mark its frame so CSS can show a
 * placeholder instead of a broken image icon.
 */
function initQrFallback() {
  const img = document.getElementById("qrImage");
  const frame = document.getElementById("qrFrame");
  if (!img || !frame) return;

  img.addEventListener("error", () => {
    frame.classList.add("qr-missing");
  });
}

// Boot everything once the DOM is ready.
document.addEventListener("DOMContentLoaded", () => {
  initLang();
  initTheme();
  initScrollSpy();
  initScrollReveal();
  addGithubStatCard();
  initNavWheelScroll();
  initQrFallback();
});
