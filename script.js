// ============================================================
// Divyansh Gupta Portfolio — behavior only.
// ============================================================

let CURRENT_LANG = "en";

// ---------- 1. language toggle ----------
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
  CURRENT_LANG = localStorage.getItem("portfolio-lang") || "en";
  applyLang(CURRENT_LANG);

  document.getElementById("langToggle").addEventListener("click", () => {
    CURRENT_LANG = CURRENT_LANG === "hi" ? "en" : "hi";
    localStorage.setItem("portfolio-lang", CURRENT_LANG);
    applyLang(CURRENT_LANG);
  });
}

// ---------- 2. theme toggle & QR Image Dynamic Switch ----------
function updateQrTheme() {
  const qrImage = document.getElementById("qrImage");
  if (!qrImage) return;

  const currentTheme = document.documentElement.getAttribute("data-theme");
  if (currentTheme === "light") {
    qrImage.src = "divyanshg221220 light.svg";
  } else {
    qrImage.src = "divyanshg221220 dark.svg";
  }
}

function initTheme() {
  const theme = localStorage.getItem("portfolio-theme") || "dark";
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeIcon(theme);
  updateQrTheme();

  document.getElementById("themeToggle").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("portfolio-theme", next);
    updateThemeIcon(next);
    updateQrTheme();
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
      if (isActive) {
        node.setAttribute("aria-current", "true");
      } else {
        node.removeAttribute("aria-current");
      }
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

// ---------- 4. scroll reveal ----------
function initScrollReveal() {
  const sections = document.querySelectorAll("section[id]");
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  sections.forEach((section) => observer.observe(section));
}

// ---------- 5. GitHub stats ----------
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

    const total = Object.values(data.total || {}).reduce(
      (sum, n) => sum + n,
      0,
    );

    const clone = template.content.cloneNode(true);
    clone.querySelector('[data-role="value"]').textContent = total;
    applyLangToScope(clone, CURRENT_LANG);
    target.appendChild(clone);
  } catch (err) {
    console.warn("GitHub stats unavailable:", err.message);
    const fallback = document.createElement("div");
    fallback.className = "stat-box";
    fallback.innerHTML =
      '<div class="stat-label" style="margin-top:0">GitHub stats unavailable right now — see profile directly.</div>';
    target.appendChild(fallback);
  }
}

// ---------- 6. nav mouse-wheel scroll ----------
function initNavWheelScroll() {
  const navlist = document.querySelector(".navlist");
  if (!navlist) return;

  navlist.addEventListener(
    "wheel",
    (e) => {
      if (navlist.scrollWidth <= navlist.clientWidth) return;
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0) return;
      e.preventDefault();
      navlist.scrollLeft += delta;
    },
    { passive: false },
  );
}

// ---------- 7. QR code fallback ----------
function initQrFallback() {
  const img = document.getElementById("qrImage");
  const frame = document.getElementById("qrFrame");
  if (!img || !frame) return;

  img.addEventListener("error", () => {
    frame.classList.add("qr-missing");
  });
}

// ---------- 8. boot ----------
document.addEventListener("DOMContentLoaded", () => {
  initLang();
  initTheme();
  initScrollSpy();
  initScrollReveal();
  addGithubStatCard();
  initNavWheelScroll();
  initQrFallback();
});
