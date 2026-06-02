/* JustStepover — main.js */

const ARTICLES_URL = './articles.json';
const STORIES_URL = './stories.json';
const WEATHER_CITIES_URL = './weather-cities.json';

/* ── Helpers ──────────────────────────────────────── */
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
function slugToUrl(slug) { return `article.html?slug=${slug}`; }

async function fetchArticles() {
  const res = await fetch(ARTICLES_URL);
  if (!res.ok) throw new Error('Could not load articles');
  return res.json();
}

async function fetchStories() {
  const res = await fetch(STORIES_URL);
  if (!res.ok) throw new Error('Could not load stories');
  return res.json();
}

/* ── Layout partials ──────────────────────────────── */
async function loadPartial(url, mountId) {
  const el = document.getElementById(mountId);
  if (!el) return;
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    el.innerHTML = await res.text();
  } catch { /* offline / file:// */ }
}

function markActiveNav() {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll('[data-nav-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.navPage === page);
  });
}

/* ── Theme ────────────────────────────────────────── */
function initTheme() {
  const stored = localStorage.getItem('jso-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);

  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.checked = theme === 'dark';
    toggle.addEventListener('change', () => {
      applyTheme(toggle.checked ? 'dark' : 'light');
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('jso-theme', theme);
  const toggle = document.getElementById('themeToggle');
  if (toggle) toggle.checked = theme === 'dark';
}

/* ── Date ─────────────────────────────────────────── */
function setDate() {
  const el = document.getElementById('today-date');
  if (el) {
    el.textContent = new Date().toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}

/* ── Desktop nav — hover only (keyboard via focus-within in CSS) ── */
function initDesktopNav() {
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', e => e.preventDefault());
  });
}

/* ── Mobile drawer ────────────────────────────────── */
function initDrawer() {
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const hamBtn = document.getElementById('hamburgerBtn');
  const closeBtn = document.getElementById('drawerClose');
  if (!drawer) return;

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay?.classList.remove('open');
    hamBtn?.classList.remove('open');
    hamBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function openDrawer() {
    drawer.classList.add('open');
    overlay?.classList.add('open');
    hamBtn?.classList.add('open');
    hamBtn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  hamBtn?.addEventListener('click', () => {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  closeBtn?.addEventListener('click', closeDrawer);
  overlay?.addEventListener('click', closeDrawer);

  document.querySelectorAll('[data-drawer-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.drawer-nav-item');
      if (!item) return;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.drawer-nav-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  document.getElementById('drawerSearch')?.addEventListener('click', e => {
    e.preventDefault();
    closeDrawer();
    openModal('searchModal');
    document.getElementById('searchInput')?.focus();
  });
}

/* ── Modals ───────────────────────────────────────── */
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
  document.body.style.overflow = '';
}

function initModals() {
  document.getElementById('searchBtn')?.addEventListener('click', () => {
    openModal('searchModal');
    setTimeout(() => document.getElementById('searchInput')?.focus(), 50);
  });
  document.getElementById('searchClose')?.addEventListener('click', () => closeModal('searchModal'));
  document.getElementById('subscribeBtn')?.addEventListener('click', () => openModal('subscribeModal'));
  document.getElementById('subscribeClose')?.addEventListener('click', () => closeModal('subscribeModal'));

  document.querySelectorAll('.modal-backdrop').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => closeModal(m.id));
    }
  });

  document.getElementById('subscribeForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = e.target.querySelector('.subscribe-btn');
    btn.textContent = "✓ You're subscribed!";
    btn.style.background = '#27ae60';
    setTimeout(() => closeModal('subscribeModal'), 1600);
  });

  document.querySelectorAll('.newsletter-form, .newsletter-page-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"], .newsletter-btn');
      if (btn) {
        btn.textContent = '✓ Subscribed!';
        btn.disabled = true;
      }
    });
  });

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keydown', async e => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        const query = searchInput.value.trim().toLowerCase();
        closeModal('searchModal');
        try {
          const articles = await fetchArticles();
          const hits = articles.filter(a =>
            a.title.toLowerCase().includes(query) ||
            a.subtitle.toLowerCase().includes(query) ||
            a.category.toLowerCase().includes(query)
          );
          if (hits.length === 1) window.location.href = slugToUrl(hits[0].slug);
          else if (hits.length > 1) alert(`Found ${hits.length} results for "${query}".`);
          else alert(`No articles found for "${query}".`);
        } catch { /* ignore */ }
      }
    });
  }
}

/* ── Reading progress (articles) ────────────────── */
function initReadProgress() {
  const bar = document.getElementById('readProgress');
  const body = document.getElementById('article-body');
  if (!bar || !body) return;

  bar.style.display = 'block';

  function update() {
    const rect = body.getBoundingClientRect();
    const start = window.scrollY + rect.top;
    const height = body.offsetHeight;
    const scrolled = window.scrollY - start + window.innerHeight * 0.35;
    const pct = Math.min(100, Math.max(0, (scrolled / height) * 100));
    bar.style.width = `${pct}%`;
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ── Weather page (OpenWeatherMap) ────────────────── */
function getOpenWeatherKey() {
  return (window.JSO_CONFIG?.OPENWEATHER_API_KEY || '').trim();
}

function weatherCardId(city) {
  return `w-${city.lat}-${city.lon}`.replace(/\./g, '_');
}

function renderWeatherCard(data, cityLabel) {
  const name = cityLabel?.name || data.name;
  const country = cityLabel?.country || data.sys?.country || '';
  const temp = Math.round(data.main.temp);
  const feels = Math.round(data.main.feels_like);
  const icon = data.weather[0]?.icon || '01d';
  const desc = data.weather[0]?.description || '';
  const humidity = data.main.humidity;
  const wind = Math.round((data.wind?.speed || 0) * 3.6);

  return `
    <article class="weather-card" id="${weatherCardId({ lat: data.coord.lat, lon: data.coord.lon })}">
      <div class="weather-card-header">
        <div>
          <div class="weather-card-place">Current</div>
          <div class="weather-card-city">${name}</div>
          ${country ? `<div class="weather-card-country">${country}</div>` : ''}
        </div>
        <div class="weather-card-icon">
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="" width="64" height="64">
        </div>
      </div>
      <div class="weather-card-temp">${temp}°C</div>
      <div class="weather-card-feels">Feels like ${feels}°C</div>
      <div class="weather-card-desc">${desc}</div>
      <div class="weather-card-stats">
        <span>Humidity <strong>${humidity}%</strong></span>
        <span>Wind <strong>${wind} km/h</strong></span>
      </div>
    </article>`;
}

async function fetchOpenWeather(lat, lon, key) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
}

async function searchOpenWeatherCities(query, key) {
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=8&appid=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

async function initWeatherPage() {
  const grid = document.getElementById('weather-grid');
  if (!grid) return;

  const key = getOpenWeatherKey();
  const notice = document.getElementById('weather-api-notice');
  const searchInput = document.getElementById('weatherSearchInput');
  const searchResults = document.getElementById('weatherSearchResults');

  if (!key) {
    if (notice) {
      notice.hidden = false;
      notice.innerHTML = 'Add your OpenWeather API key in <code>js/config.js</code> as <code>OPENWEATHER_API_KEY</code> to load live weather. Get a free key at <a href="https://home.openweathermap.org/api_keys" target="_blank" rel="noopener" style="color:var(--red);font-weight:700;">openweathermap.org</a>.';
    }
    grid.innerHTML = '<p class="loading" style="grid-column:1/-1;">Weather data requires an API key.</p>';
    return;
  }

  if (notice) notice.hidden = true;

  let cities = [];
  try {
    const res = await fetch(WEATHER_CITIES_URL);
    cities = await res.json();
  } catch {
    grid.innerHTML = '<p class="loading">Could not load city list.</p>';
    return;
  }

  const loadedIds = new Set();

  async function addCityToGrid(city, prepend = false) {
    const id = weatherCardId(city);
    if (loadedIds.has(id)) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    loadedIds.add(id);

    const placeholder = document.createElement('div');
    placeholder.className = 'weather-card';
    placeholder.id = id;
    placeholder.innerHTML = '<div class="loading" style="padding:24px;"><div class="loading-spinner"></div></div>';
    if (prepend) grid.prepend(placeholder);
    else grid.appendChild(placeholder);

    try {
      const data = await fetchOpenWeather(city.lat, city.lon, key);
      placeholder.outerHTML = renderWeatherCard(data, city);
    } catch {
      placeholder.innerHTML = `<p style="font-family:var(--font-ui);font-size:13px;color:var(--red);padding:12px;">Could not load ${city.name}</p>`;
    }
  }

  grid.innerHTML = '';
  await Promise.all(cities.map(c => addCityToGrid(c, false)));

  let searchTimer;
  if (searchInput && searchResults) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      const q = searchInput.value.trim();
      if (q.length < 2) {
        searchResults.classList.remove('open');
        searchResults.innerHTML = '';
        return;
      }
      searchTimer = setTimeout(async () => {
        try {
          const hits = await searchOpenWeatherCities(q, key);
          if (!hits.length) {
            searchResults.innerHTML = '<div class="weather-search-result" style="cursor:default;color:var(--ink-faint);">No cities found</div>';
          } else {
            searchResults.innerHTML = hits.map(h => `
              <button type="button" class="weather-search-result" data-lat="${h.lat}" data-lon="${h.lon}" data-name="${h.name}" data-country="${h.country}">
                ${h.name}${h.state ? `, ${h.state}` : ''}
                <small>${h.country}</small>
              </button>
            `).join('');
          }
          searchResults.classList.add('open');
        } catch {
          searchResults.innerHTML = '<div class="weather-search-result" style="cursor:default;">Search unavailable</div>';
          searchResults.classList.add('open');
        }
      }, 350);
    });

    searchResults.addEventListener('click', async e => {
      const btn = e.target.closest('.weather-search-result[data-lat]');
      if (!btn) return;
      searchResults.classList.remove('open');
      searchInput.value = btn.dataset.name;
      await addCityToGrid({
        name: btn.dataset.name,
        country: btn.dataset.country,
        lat: parseFloat(btn.dataset.lat),
        lon: parseFloat(btn.dataset.lon)
      }, true);
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('.weather-page-search-wrap')) {
        searchResults.classList.remove('open');
      }
    });
  }
}

/* ── Live scores ──────────────────────────────────── */
async function initLiveScores() {
  const track = document.getElementById('live-scores-track');
  if (!track) return;
  
  const section = track.closest('.live-scores-section');
  let scores = [];
  const key = window.JSO_CONFIG?.FOOTBALL_DATA_API_KEY;

  if (key) {
    try {
      const today = new Date();
      const fromDate = new Date(today);
      fromDate.setDate(today.getDate() - 2);
      const toDate = new Date(today);
      toDate.setDate(today.getDate() + 7);
      
      const formatDate = d => d.toISOString().split('T')[0];
      const apiUrl = `https://api.football-data.org/v4/matches?dateFrom=${formatDate(fromDate)}&dateTo=${formatDate(toDate)}`;

      const res = await fetch(apiUrl, {
        headers: { 'X-Auth-Token': key }
      });
      
      console.log('Football Data API Rate Limit Remaining:', res.headers.get('x-requests-available-minute'));
      
      if (res.ok) {
        const data = await res.json();
        if (data.matches?.length) {
          scores = data.matches.slice(0, 15).map(m => {
            const isLive = ['IN_PLAY', 'PAUSED', 'LIVE'].includes(m.status);
            const isScheduled = m.status === 'TIMED' || m.status === 'SCHEDULED';
            const isFinished = m.status === 'FINISHED';
            
            let statusText = m.status;
            if (isLive) statusText = `${m.minute || 'Live'}'`;
            else if (isScheduled) {
              const d = new Date(m.utcDate);
              statusText = d.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' });
            }
            else if (isFinished) statusText = 'FT';

            return {
              comp: m.competition?.name || 'Football',
              home: m.homeTeam?.shortName || m.homeTeam?.name,
              away: m.awayTeam?.shortName || m.awayTeam?.name,
              homeScore: m.score?.fullTime?.home ?? m.score?.regularTime?.home,
              awayScore: m.score?.fullTime?.away ?? m.score?.regularTime?.away,
              status: statusText,
              live: isLive
            };
          });
          
          const hasLive = scores.some(s => s.live);
          if (note) note.textContent = hasLive ? 'Live & Upcoming' : 'Upcoming Matches';
        }
      }
    } catch (e) {
      console.error("Could not fetch live scores:", e);
    }
  }

  // Hide the entire live scores section if there are no matches or no API key
  if (scores.length === 0) {
    if (section) section.style.display = 'none';
    return;
  }
  
  const title = document.querySelector('.live-scores-title');
  if (title) title.textContent = 'Matches';

  track.innerHTML = scores.map(s => `
    <div class="score-card">
      <div class="score-comp">${s.comp}</div>
      <div class="score-teams">
        <div class="score-row"><span>${s.home}</span><span class="score-num">${s.homeScore ?? '–'}</span></div>
        <div class="score-row"><span>${s.away}</span><span class="score-num">${s.awayScore ?? '–'}</span></div>
      </div>
      <div class="score-status ${s.live ? 'live' : ''}">${s.live ? '● Live · ' : ''}${s.status}</div>
    </div>
  `).join('');
}

/* ── Hero slideshow + typewriter ──────────────────── */
class HeroSlideshow {
  constructor(container, slides) {
    this.container = container;
    this.slides = slides;
    this.index = 0;
    this.timer = null;
    this.typeTimer = null;
    this.build();
    this.go(0);
    this.timer = setInterval(() => this.next(), 7000);
  }

  build() {
    this.container.innerHTML = `
      ${this.slides.map((s, i) => `
        <a href="${slugToUrl(s.slug)}" class="hero-slide ${i === 0 ? 'active' : ''}" data-idx="${i}">
          <img src="${s.imageUrl}" alt="" loading="${i === 0 ? 'eager' : 'lazy'}">
          <div class="hero-slide-overlay">
            <span class="hero-slide-kicker">${s.category}</span>
            <h2 class="hero-slide-headline" data-headline="${encodeURIComponent(s.title)}"></h2>
            <p class="hero-slide-meta">${s.author} · ${formatDate(s.date)}</p>
          </div>
        </a>
      `).join('')}
      <div class="hero-dots" role="tablist">
        ${this.slides.map((_, i) => `<button type="button" class="hero-dot ${i === 0 ? 'active' : ''}" data-dot="${i}" aria-label="Slide ${i + 1}"></button>`).join('')}
      </div>`;

    this.container.querySelectorAll('.hero-dot').forEach(dot => {
      dot.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        this.go(Number(dot.dataset.dot));
      });
    });
  }

  next() { this.go((this.index + 1) % this.slides.length); }

  go(idx) {
    clearTimeout(this.typeTimer);
    const prev = this.index;
    this.index = idx;

    this.container.querySelectorAll('.hero-slide').forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });
    this.container.querySelectorAll('.hero-dot').forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });

    const headlineEl = this.container.querySelector(`.hero-slide[data-idx="${idx}"] .hero-slide-headline`);
    const newText = decodeURIComponent(headlineEl.dataset.headline);
    const oldEl = prev !== idx ? this.container.querySelector(`.hero-slide[data-idx="${prev}"] .hero-slide-headline`) : null;

    if (oldEl && prev !== idx) {
      this.backspaceThenType(oldEl, headlineEl, newText);
    } else {
      this.typeText(headlineEl, newText);
    }
  }

  backspaceThenType(oldEl, newEl, newText) {
    let text = oldEl.textContent.replace(/\|$/, '').trim();
    const backspace = () => {
      if (text.length > 0) {
        text = text.slice(0, -1);
        oldEl.innerHTML = text + '<span class="typewriter-cursor"></span>';
        this.typeTimer = setTimeout(backspace, 28);
      } else {
        oldEl.innerHTML = '';
        this.typeText(newEl, newText);
      }
    };
    backspace();
  }

  typeText(el, text) {
    let i = 0;
    const step = () => {
      if (i <= text.length) {
        el.innerHTML = text.slice(0, i) + '<span class="typewriter-cursor"></span>';
        i++;
        this.typeTimer = setTimeout(step, i === 1 ? 200 : 42);
      }
    };
    step();
  }
}

/* ── Homepage ─────────────────────────────────────── */
async function initHomepage() {
  const heroMount = document.getElementById('hero-slideshow');
  const editorial = document.getElementById('editorial-grid');
  const mostRead = document.getElementById('most-read-list');
  if (!heroMount && !editorial) return;

  let articles;
  try {
    articles = await fetchArticles();
  } catch {
    if (heroMount) heroMount.innerHTML = '<p class="loading">Could not load articles.</p>';
    return;
  }

  const featured = articles.filter(a => a.featured);
  const heroSlides = (featured.length >= 2 ? featured : articles).slice(0, 4);

  if (heroMount) new HeroSlideshow(heroMount, heroSlides);

  const editorialList = articles.filter(a => !heroSlides.find(h => h.slug === a.slug)).slice(0, 4);
  if (editorial) {
    editorial.innerHTML = editorialList.map(a => `
      <a href="${slugToUrl(a.slug)}" class="editorial-card">
        <img class="editorial-card-img" src="${a.imageUrl}" alt="" loading="lazy">
        <div class="editorial-card-kicker">${a.category}</div>
        <h3 class="editorial-card-title">${a.title}</h3>
        <p class="editorial-card-deck">${a.subtitle}</p>
      </a>
    `).join('');
  }

  if (mostRead) {
    mostRead.innerHTML = articles.slice(0, 5).map((a, i) => `
      <a href="${slugToUrl(a.slug)}" class="sidebar-item" style="display:grid;">
        <div class="sidebar-num">${i + 1}</div>
        <div>
          <div class="sidebar-title">${a.title}</div>
          <div class="sidebar-meta">${a.category}</div>
        </div>
      </a>
    `).join('');
  }
}

/* ── Stories page ─────────────────────────────────── */
async function initStoriesPage() {
  const grid = document.getElementById('stories-grid');
  if (!grid) return;
  try {
    const stories = await fetchStories();
    grid.innerHTML = stories.map(s => `
      <article class="story-card">
        <span class="story-card-time">${s.time}</span>
        <div class="story-card-kicker">${s.kicker}</div>
        <h2 class="story-card-title">${s.title}</h2>
        <p class="story-card-excerpt">${s.excerpt}</p>
      </article>
    `).join('');
  } catch {
    grid.innerHTML = '<p class="loading">Could not load stories.</p>';
  }
}

/* ── Article page (Defector layout) ───────────────── */
async function initArticlePage() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const heroEl = document.getElementById('article-defector-hero');
  const metaEl = document.getElementById('article-meta');
  const bodyEl = document.getElementById('article-body');
  const relEl = document.getElementById('related-articles');
  if (!slug || !bodyEl) return;

  let articles;
  try { articles = await fetchArticles(); }
  catch {
    bodyEl.innerHTML = '<p style="color:var(--red);font-family:var(--font-ui);">Could not load article.</p>';
    return;
  }

  const article = articles.find(a => a.slug === slug);
  if (!article) {
    bodyEl.innerHTML = '<p style="color:var(--red);font-family:var(--font-ui);">Article not found.</p>';
    return;
  }

  document.title = `${article.title} — JustStepover`;

  if (heroEl) {
    heroEl.innerHTML = `
      <span class="article-category-badge">${article.category}</span>
      <h1 class="article-headline-defector">${article.title}</h1>
      <p class="article-standfirst-defector">${article.subtitle}</p>
      <img class="article-defector-img" src="${article.imageUrl}" alt="">
      ${article.imageCaption ? `<p class="article-img-caption">${article.imageCaption}</p>` : ''}
    `;
  }

  if (metaEl) {
    metaEl.innerHTML = `
      <span class="article-meta-author">${article.author}</span>
      <span style="color:var(--border-strong)">·</span>
      <span>${formatDate(article.date)}</span>
      <span style="color:var(--border-strong)">·</span>
      <span>${article.category}</span>
    `;
  }

  bodyEl.innerHTML = article.content.map(block => {
    if (block.type === 'paragraph') return `<p>${block.text}</p>`;
    if (block.type === 'subheading') return `<h2>${block.text}</h2>`;
    if (block.type === 'quote') return `
      <blockquote class="article-blockquote">
        <p>${block.text}</p>
        ${block.attribution ? `<cite>— ${block.attribution}</cite>` : ''}
      </blockquote>`;
    if (block.type === 'image') return `
      <img src="${block.src}" alt="${block.caption || ''}" style="width:100%;margin-bottom:8px;border-radius:var(--radius-md);">
      ${block.caption ? `<p class="article-img-caption">${block.caption}</p>` : ''}`;
    return '';
  }).join('');

  initReadProgress();

  const related = articles.filter(a => a.slug !== slug).slice(0, 3);
  if (related.length && relEl) {
    relEl.innerHTML = `
      <div class="page-wrap" style="padding-top:32px;padding-bottom:48px;">
        <div style="height:3px;background:var(--red);"></div>
        <div style="display:inline-block;background:var(--red);color:var(--white);font-family:var(--font-condensed);font-size:13px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;padding:3px 10px;margin:16px 0;">More from JustStepover</div>
        <div class="related-grid">
          ${related.map(a => `
            <a href="${slugToUrl(a.slug)}" class="related-card">
              <img class="related-card-img" src="${a.imageUrl}" alt="" loading="lazy">
              <div class="related-card-kicker">${a.category}</div>
              <div class="related-card-title">${a.title}</div>
              <div class="related-card-meta">${formatDate(a.date)}</div>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }
}

/* ── Init ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadPartial('./partials/header.html', 'site-header'),
    loadPartial('./partials/footer.html', 'site-footer')
  ]);

  initTheme();
  setDate();
  markActiveNav();
  initDesktopNav();
  initDrawer();
  initModals();

  initWeatherPage();
  initLiveScores();
  initHomepage();
  initStoriesPage();
  initArticlePage();
});
