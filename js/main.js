/* ─── JustStepover Main JS ─────────────────────────── */

const ARTICLES_URL = './articles.json';

/* ── Helpers ── */
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function slugToUrl(slug) {
  return `article.html?slug=${slug}`;
}

function getCategoryColor(cat) {
  const map = {
    'Premier League': 'var(--mint)',
    'Champions League': 'var(--red)',
    'Culture': 'var(--mint)',
    'Opinion': 'var(--red)',
  };
  return map[cat] || 'var(--mint)';
}

/* ── Fetch articles ── */
async function fetchArticles() {
  const res = await fetch(ARTICLES_URL);
  if (!res.ok) throw new Error('Could not load articles');
  return res.json();
}

/* ── Set today's date in top bar ── */
function setDate() {
  const el = document.getElementById('today-date');
  if (el) {
    el.textContent = new Date().toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}

/* ════════════════════════════════════════════════════
   HOMEPAGE
══════════════════════════════════════════════════════ */
async function initHomepage() {
  setDate();

  const articles = await fetchArticles();
  const featured = articles.filter(a => a.featured);
  const all = articles;

  renderHero(featured, all);
  renderGrid(all);
}

function renderHero(featured, all) {
  const heroMain = document.getElementById('hero-main');
  const heroSide = document.getElementById('hero-side');
  if (!heroMain || !heroSide) return;

  const main = featured[0] || all[0];

  heroMain.innerHTML = `
    <a href="${slugToUrl(main.slug)}" style="display:block;overflow:hidden;">
      <img class="hero-main-img" src="${main.imageUrl}" alt="${main.title}" loading="eager">
    </a>
    <div class="hero-main-body">
      <div class="hero-main-category">${main.category}</div>
      <a href="${slugToUrl(main.slug)}">
        <h1 class="hero-main-title">${main.title}</h1>
      </a>
      <p class="hero-main-subtitle">${main.subtitle}</p>
      <div class="hero-main-meta">
        <span>${main.author}</span>
        <span class="meta-dot"></span>
        <span>${formatDate(main.date)}</span>
      </div>
    </div>
  `;

  const sideItems = (featured.length > 1 ? featured.slice(1) : all.slice(1)).slice(0, 2);
  heroSide.innerHTML = sideItems.map(a => `
    <a href="${slugToUrl(a.slug)}" class="hero-side-item" style="display:flex;flex-direction:column;">
      <div>
        <div class="side-category">${a.category}</div>
        <div class="side-title">${a.title}</div>
        <div class="side-subtitle">${a.subtitle}</div>
      </div>
      <img class="side-img" src="${a.imageUrl}" alt="${a.title}" loading="lazy">
    </a>
  `).join('');
}

function renderGrid(articles) {
  const grid = document.getElementById('articles-grid');
  if (!grid) return;

  grid.innerHTML = articles.map(a => `
    <a href="${slugToUrl(a.slug)}" class="article-card">
      <div class="card-img-wrap">
        <img class="card-img" src="${a.imageUrl}" alt="${a.title}" loading="lazy">
      </div>
      <div class="card-category">${a.category}</div>
      <div class="card-title">${a.title}</div>
      <div class="card-subtitle">${a.subtitle}</div>
      <div class="card-meta">${a.author} &mdash; ${formatDate(a.date)}</div>
    </a>
  `).join('');
}

/* ════════════════════════════════════════════════════
   ARTICLE PAGE
══════════════════════════════════════════════════════ */
async function initArticlePage() {
  setDate();

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');

  if (!slug) {
    showArticleError('No article specified.');
    return;
  }

  const articles = await fetchArticles();
  const article = articles.find(a => a.slug === slug);

  if (!article) {
    showArticleError('Article not found.');
    return;
  }

  document.title = `${article.title} — JustStepover`;
  renderArticleHero(article);
  renderArticleBody(article);
  renderRelated(articles, article);
}

function renderArticleHero(article) {
  const hero = document.getElementById('article-hero');
  if (!hero) return;

  hero.innerHTML = `
    <img class="article-hero-img" src="${article.imageUrl}" alt="${article.title}">
    <div class="article-hero-overlay">
      <div class="article-hero-inner">
        <span class="article-category-badge">${article.category}</span>
        <h1 class="article-headline">${article.title}</h1>
        <p class="article-standfirst">${article.subtitle}</p>
      </div>
    </div>
  `;
}

function renderArticleBody(article) {
  const meta = document.getElementById('article-meta');
  const body = document.getElementById('article-body');
  if (!meta || !body) return;

  meta.innerHTML = `
    <span class="article-meta-author">${article.author}</span>
    <span class="meta-dot" style="width:3px;height:3px;border-radius:50%;background:var(--border-strong);display:inline-block;"></span>
    <span>${formatDate(article.date)}</span>
    <span class="meta-dot" style="width:3px;height:3px;border-radius:50%;background:var(--border-strong);display:inline-block;"></span>
    <span>${article.category}</span>
  `;

  body.innerHTML = article.content.map(block => {
    if (block.type === 'paragraph') {
      return `<p>${block.text}</p>`;
    }
    if (block.type === 'subheading') {
      return `<h2>${block.text}</h2>`;
    }
    if (block.type === 'quote') {
      return `
        <blockquote class="article-blockquote">
          <p>${block.text}</p>
          ${block.attribution ? `<cite>— ${block.attribution}</cite>` : ''}
        </blockquote>
      `;
    }
    if (block.type === 'image') {
      return `
        <img src="${block.src}" alt="${block.caption || ''}" style="width:100%;border-radius:2px;margin-bottom:8px;">
        ${block.caption ? `<p class="article-img-caption">${block.caption}</p>` : ''}
      `;
    }
    return '';
  }).join('');

  if (article.imageCaption) {
    body.insertAdjacentHTML('afterbegin', `<p class="article-img-caption" style="text-align:center;margin-top:0;">${article.imageCaption}</p>`);
  }
}

function renderRelated(articles, current) {
  const related = document.getElementById('related-articles');
  if (!related) return;

  const others = articles.filter(a => a.slug !== current.slug).slice(0, 3);
  if (!others.length) return;

  related.innerHTML = `
    <div class="page-wrap" style="padding-top:48px;padding-bottom:48px;">
      <div class="section-label">More from JustStepover</div>
      <div class="content-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);">
        ${others.map(a => `
          <a href="${slugToUrl(a.slug)}" class="article-card">
            <div class="card-img-wrap">
              <img class="card-img" src="${a.imageUrl}" alt="${a.title}" loading="lazy">
            </div>
            <div class="card-category">${a.category}</div>
            <div class="card-title">${a.title}</div>
            <div class="card-meta">${formatDate(a.date)}</div>
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

function showArticleError(msg) {
  const body = document.getElementById('article-body');
  if (body) body.innerHTML = `<p style="color:var(--red);font-family:var(--font-ui);">${msg}</p>`;
}

/* ── Newsletter form ── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.newsletter-btn');
      btn.textContent = 'You\'re in!';
      btn.style.background = 'var(--mint)';
    });
  });
});

/* ── Auto-init ── */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('hero-main')) initHomepage();
  if (document.getElementById('article-hero')) initArticlePage();
});