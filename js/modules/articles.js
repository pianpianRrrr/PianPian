import { $, $$, escapeHTML as esc, articleURL, icon, copyText } from './core.js';
import { reveal } from './motion.js';
import { mountComments } from './comments.js';
export function createArticles(data) {
  const articles = [...data.articles].sort((a,b) => b.date.localeCompare(a.date));
  const tags = [...new Set(articles.flatMap(article => article.tags))];
  let activeTag = 'all';
  let tocObserver;
  function card(article, index) {
    return `<article class="article-card"><span class="article-card-number" aria-hidden="true">${String(index + 1).padStart(2,'0')}</span><p class="eyebrow">FIELD NOTES · ${esc(article.tags.join(' / '))}</p><h3><a href="${articleURL(article.id)}">${esc(article.title)}</a></h3><div class="article-meta"><time datetime="${esc(article.date)}">${esc(article.date.replaceAll('-','.'))}</time><span>·</span><span>${esc(article.readTime)}</span></div><p class="excerpt" style="margin-top:18px">${esc(article.excerpt)}</p><div class="article-card-bottom"><div>${article.tags.map(tag => `<span class="tag">${esc(tag)}</span>`).join('')}</div><a class="read-link" href="${articleURL(article.id)}" aria-label="阅读：${esc(article.title)}">阅读手记 ${icon('arrow')}</a></div></article>`;
  }
  function filter() {
    const query = $('#searchInput').value.trim().toLocaleLowerCase();
    const result = articles.filter(a => (activeTag === 'all' || a.tags.includes(activeTag)) && `${a.title} ${a.excerpt} ${a.tags.join(' ')}`.toLocaleLowerCase().includes(query));
    $('#articlesContainer').innerHTML = result.length ? result.map(card).join('') : '<div class="empty-state"><h3>这片森林里，还没找到它。</h3><p>换个关键词，或看看全部手记。</p><button class="button secondary" id="resetSearch">清除筛选</button></div>';
    $('#searchStatus').textContent = `找到 ${result.length} 篇手记`;
    $('#articleCount').textContent = String(result.length).padStart(2,'0');
    $$('#filterTags button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === activeTag)));
    $('#resetSearch')?.addEventListener('click', () => { activeTag = 'all'; $('#searchInput').value = ''; filter(); $('#searchInput').focus(); });
    reveal($('#page-home'));
  }
  function init() {
    $('#filterTags').innerHTML = ['all', ...tags].map(tag => `<button class="filter-btn" data-filter="${esc(tag)}" aria-pressed="${tag === 'all'}">${tag === 'all' ? '全部手记' : esc(tag)}</button>`).join('');
    $('#filterTags').addEventListener('click', event => { const button = event.target.closest('[data-filter]'); if (button) { activeTag = button.dataset.filter; filter(); } });
    $('#searchInput').addEventListener('input', filter); filter();
    $('#collections').innerHTML = tags.map(tag => `<section class="collection"><h2>${esc(tag)} <span class="count">${articles.filter(a=>a.tags.includes(tag)).length} 篇</span></h2><div class="collection-grid">${articles.filter(a=>a.tags.includes(tag)).map(card).join('')}</div></section>`).join('');
    const years = [...new Set(articles.map(a => a.date.slice(0,4)))];
    $('#timelineContainer').innerHTML = years.map(year => `<section class="timeline-year"><h2>${esc(year)}</h2><div>${articles.filter(a=>a.date.startsWith(year)).map(a=>`<div class="timeline-entry"><time datetime="${esc(a.date)}">${esc(a.date.slice(5).replace('-','.'))}</time><a href="${articleURL(a.id)}">${esc(a.title)} ↗</a></div>`).join('')}</div></section>`).join('');
  }
  function cleanup() { tocObserver?.disconnect(); }
  function open(id) {
    cleanup();
    const article = Object.hasOwn(data.contents, id) ? data.contents[id] : null;
    if (!article) return false;
    const index = articles.findIndex(a => a.id === id);
    const previous = articles[index - 1]; const next = articles[index + 1];
    $('#articleDetail').innerHTML = `<header class="article-heading"><p class="eyebrow">THE JOURNAL / ${esc(article.tags.join(' · '))}</p><h1>${esc(article.title)}</h1><div class="article-meta"><span>${esc(article.author)}</span><time datetime="${esc(article.date)}">${esc(article.date)}</time><span>${esc(article.readTime)}</span></div></header><div class="reading-layout"><div><div class="prose" id="articleContent"></div><div class="article-bottom"><button class="button secondary" id="shareArticle">复制文章链接 ↗</button><div class="article-neighbors">${previous ? `<a href="${articleURL(previous.id)}">← ${esc(previous.title)}</a>` : ''}${next ? `<a href="${articleURL(next.id)}">${esc(next.title)} →</a>` : ''}</div></div></div><aside class="toc" aria-label="文章目录"><p class="eyebrow">ON THIS PAGE</p><div id="tocLinks"></div></aside></div><section class="comments" id="comments"></section>`;
    // Article HTML is trusted, repository-owned content. Never insert user comments here.
    $('#articleContent').innerHTML = article.content;
    const headings = $$('#articleContent h2, #articleContent h3');
    headings.forEach((heading, i) => heading.id = `section-${i + 1}`);
    $('#tocLinks').innerHTML = headings.map(heading => `<a href="#article/${encodeURIComponent(id)}/${heading.id}">${esc(heading.textContent)}</a>`).join('');
    if ('IntersectionObserver' in window) {
      tocObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) $$('#tocLinks a').forEach(a => a.classList.toggle('active', a.hash.endsWith('/' + entry.target.id))); }), {rootMargin:'-100px 0px -55% 0px'});
      headings.forEach(h => tocObserver.observe(h));
    }
    $$('#articleContent pre').forEach(pre => {
      const button = document.createElement('button'); button.className = 'copy-code'; button.textContent = '复制代码';
      button.addEventListener('click', () => copyText($('code',pre)?.textContent ?? pre.textContent.replace('复制代码',''))); pre.prepend(button);
    });
    $('#shareArticle').addEventListener('click', () => { const url = new URL(location.href); url.hash = articleURL(id); copyText(url.href); });
    mountComments($('#comments'), id);
    document.title = `${article.title} · 片片公子`;
    return true;
  }
  return {init, open, cleanup};
}
