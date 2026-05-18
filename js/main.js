/* ═══════════════════════════════════════════════════
   JustStepover — main.js
   Handles: nav, drawer, modals, homepage, article page
═══════════════════════════════════════════════════ */

const ARTICLES_URL = './articles.json';

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

/* ── Date ─────────────────────────────────────────── */
function setDate() {
  const el = document.getElementById('today-date');
  if (el) {
    el.textContent = new Date().toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}

/* ════════════════════════════════════════════════════
   NAVIGATION — desktop dropdowns
══════════════════════════════════════════════════════ */
function initDesktopNav() {
  const tabs = document.querySelectorAll('[data-tab]');
  tabs.forEach(tab => {
    const btn = tab.querySelector('[data-tab-btn]');
    if (!btn) return;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = tab.classList.contains('open');
      // close all
      tabs.forEach(t => t.classList.remove('open'));
      if (!isOpen) tab.classList.add('open');
    });
  });
  document.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('open'));
  });
}

/* ════════════════════════════════════════════════════
   MOBILE DRAWER
══════════════════════════════════════════════════════ */
function initDrawer() {
  const drawer  = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const hamBtn  = document.getElementById('hamburgerBtn');
  const closeBtn = document.getElementById('drawerClose');
  if (!drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    hamBtn.classList.add('open');
    hamBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    hamBtn.classList.remove('open');
    hamBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamBtn?.addEventListener('click', () => {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  closeBtn?.addEventListener('click', closeDrawer);
  overlay?.addEventListener('click', closeDrawer);

  // Drawer accordion sub-menus
  document.querySelectorAll('[data-drawer-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.drawer-nav-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.drawer-nav-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // Drawer CTA buttons
  document.getElementById('drawerSubscribe')?.addEventListener('click', e => {
    e.preventDefault();
    closeDrawer();
    openModal('subscribeModal');
  });
  document.getElementById('drawerSearch')?.addEventListener('click', e => {
    e.preventDefault();
    closeDrawer();
    openModal('searchModal');
    document.getElementById('searchInput')?.focus();
  });
}

/* ════════════════════════════════════════════════════
   MODALS
══════════════════════════════════════════════════════ */
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
  document.body.style.overflow = '';
}

function initModals() {
  // Search
  document.getElementById('searchBtn')?.addEventListener('click', () => {
    openModal('searchModal');
    setTimeout(() => document.getElementById('searchInput')?.focus(), 50);
  });
  document.getElementById('searchClose')?.addEventListener('click', () => closeModal('searchModal'));

  // Subscribe
  document.getElementById('subscribeBtn')?.addEventListener('click', () => openModal('subscribeModal'));
  document.getElementById('subscribeClose')?.addEventListener('click', () => closeModal('subscribeModal'));
  document.getElementById('topBarSupport')?.addEventListener('click', e => { e.preventDefault(); openModal('subscribeModal'); });

  // Close modals on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(m => closeModal(m.id));
    }
  });

  // Subscribe form
  document.getElementById('subscribeForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = e.target.querySelector('.subscribe-btn');
    btn.textContent = '✓ You\'re subscribed!';
    btn.style.background = '#27ae60';
    setTimeout(() => closeModal('subscribeModal'), 1600);
  });

  // Newsletter forms (inline on page)
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.newsletter-btn');
      btn.textContent = '✓ Subscribed!';
      btn.style.background = 'var(--ink)';
      btn.disabled = true;
    });
  });

  // Search — simple client-side filter
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
          if (hits.length === 1) {
            window.location.href = slugToUrl(hits[0].slug);
          } else if (hits.length > 1) {
            // On homepage, scroll to and highlight
            alert(`Found ${hits.length} results for "${query}". Check the articles list below.`);
          } else {
            alert(`No articles found for "${query}".`);
          }
        } catch {}
      }
    });
  }
}

/* ════════════════════════════════════════════════════
   HOMEPAGE — Guardian layout
══════════════════════════════════════════════════════ */
async function initHomepage() {
  const leadSection = document.getElementById('lead-section');
  const mostRead    = document.getElementById('most-read-list');
  if (!leadSection) return;

  let articles;
  try {
    articles = await fetchArticles();
  } catch {
    leadSection.innerHTML = `<p style="padding:40px;color:var(--red);font-family:var(--font-ui);">Could not load articles. Check articles.json is valid.</p>`;
    return;
  }

  const featured  = articles.filter(a => a.featured);
  const lead      = featured[0] || articles[0];
  const secondary = (featured.length > 1 ? featured.slice(1) : articles.slice(1)).slice(0, 2);
  const rest      = articles.filter(a => a.slug !== lead.slug && !secondary.find(s => s.slug === a.slug));

  // Lead section
  leadSection.innerHTML = `
    <!-- Top: lead + secondary -->
    <div class="lead-top">
      <!-- Main lead -->
      <div class="lead-primary">
        <a href="${slugToUrl(lead.slug)}" class="lead-img-wrap" style="display:block;">
          <img class="lead-img" src="${lead.imageUrl}" alt="${lead.title}" loading="eager">
        </a>
        <div class="lead-kicker">${lead.category}</div>
        <a href="${slugToUrl(lead.slug)}">
          <div class="lead-title">${lead.title}</div>
        </a>
        <div class="lead-standfirst">${lead.subtitle}</div>
        <div class="lead-meta">
          <span>${lead.author}</span>
          <span style="color:var(--border-strong)">·</span>
          <span>${formatDate(lead.date)}</span>
        </div>
      </div>

      <!-- Secondary items -->
      <div class="lead-secondary">
        ${secondary.map(a => `
          <div class="lead-secondary-item">
            <a href="${slugToUrl(a.slug)}" style="display:block;">
              <img class="sec-img" src="${a.imageUrl}" alt="${a.title}" loading="lazy">
            </a>
            <div class="sec-kicker">${a.category}</div>
            <a href="${slugToUrl(a.slug)}"><div class="sec-title">${a.title}</div></a>
            <div class="sec-standfirst">${a.subtitle}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Rest as ruled rows -->
    <div class="articles-list">
      ${rest.map(a => `
        <a href="${slugToUrl(a.slug)}" class="article-row" style="display:grid;">
          <div class="article-row-text">
            <div class="row-kicker">${a.category}</div>
            <div class="row-title">${a.title}</div>
            <div class="row-standfirst">${a.subtitle}</div>
            <div class="row-meta">${a.author} · ${formatDate(a.date)}</div>
          </div>
          <img class="row-img" src="${a.imageUrl}" alt="${a.title}" loading="lazy">
        </a>
      `).join('')}
    </div>
  `;

  // Most read sidebar
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

/* ════════════════════════════════════════════════════
   ARTICLE PAGE
══════════════════════════════════════════════════════ */
async function initArticlePage() {
  const params  = new URLSearchParams(window.location.search);
  const slug    = params.get('slug');
  const heroEl  = document.getElementById('article-hero');
  const metaEl  = document.getElementById('article-meta');
  const bodyEl  = document.getElementById('article-body');
  const relEl   = document.getElementById('related-articles');

  if (!slug || !heroEl) return;

  let articles;
  try { articles = await fetchArticles(); }
  catch { bodyEl.innerHTML = `<p style="color:var(--red);font-family:var(--font-ui);">Could not load article.</p>`; return; }

  const article = articles.find(a => a.slug === slug);
  if (!article) { bodyEl.innerHTML = `<p style="color:var(--red);font-family:var(--font-ui);">Article not found.</p>`; return; }

  document.title = `${article.title} — JustStepover`;

  // Hero
  heroEl.innerHTML = `
    <img class="article-hero-img" src="${article.imageUrl}" alt="${article.title}">
    <div class="article-hero-overlay">
      <div class="article-hero-inner">
        <span class="article-category-badge">${article.category}</span>
        <h1 class="article-headline">${article.title}</h1>
        <p class="article-standfirst">${article.subtitle}</p>
      </div>
    </div>
  `;

  // Meta bar
  metaEl.innerHTML = `
    <span class="article-meta-author">${article.author}</span>
    <span style="color:var(--border-strong)">·</span>
    <span>${formatDate(article.date)}</span>
    <span style="color:var(--border-strong)">·</span>
    <span>${article.category}</span>
  `;

  // Body
  if (article.imageCaption) {
    bodyEl.innerHTML += `<p class="article-img-caption">${article.imageCaption}</p>`;
  }
  bodyEl.innerHTML += article.content.map(block => {
    if (block.type === 'paragraph') return `<p>${block.text}</p>`;
    if (block.type === 'subheading') return `<h2>${block.text}</h2>`;
    if (block.type === 'quote') return `
      <blockquote class="article-blockquote">
        <p>${block.text}</p>
        ${block.attribution ? `<cite>— ${block.attribution}</cite>` : ''}
      </blockquote>`;
    if (block.type === 'image') return `
      <img src="${block.src}" alt="${block.caption || ''}" style="width:100%;margin-bottom:8px;">
      ${block.caption ? `<p class="article-img-caption">${block.caption}</p>` : ''}`;
    return '';
  }).join('');

  // Related articles
  const related = articles.filter(a => a.slug !== slug).slice(0, 3);
  if (related.length && relEl) {
    relEl.innerHTML = `
      <div class="page-wrap" style="padding-top:32px;padding-bottom:48px;">
        <div style="height:3px;background:var(--red);margin-bottom:0;"></div>
        <div style="display:inline-block;background:var(--red);color:var(--white);font-family:var(--font-condensed);font-size:13px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;padding:3px 10px;margin-bottom:16px;">More from JustStepover</div>
        <div class="related-grid">
          ${related.map(a => `
            <a href="${slugToUrl(a.slug)}" class="related-card">
              <img class="related-card-img" src="${a.imageUrl}" alt="${a.title}" loading="lazy">
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

/* ════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  setDate();
  initDesktopNav();
  initDrawer();
  initModals();

  if (document.getElementById('lead-section')) initHomepage();
  if (document.getElementById('article-hero')) initArticlePage();
});