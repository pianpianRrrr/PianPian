/* ============================================================
   "片片公子" 个人博客 — 交互脚本
   主题切换 · 进度条 · 搜索 · 评论 · TOC · 汉堡菜单
   ============================================================ */

(function () {
  'use strict';

  // ── 工具函数（来自 BlogUtils）──────────────────────────
  var $ = BlogUtils.$;
  var $$ = BlogUtils.$$;
  var formatDate = BlogUtils.formatDate;
  var escapeHtml = BlogUtils.escapeHtml;
  var calcReadTime = BlogUtils.calcReadTime;

  // ════════════════════════════════════════════════════════
  //  1. 主题切换
  // ════════════════════════════════════════════════════════
  function initTheme() {
    var toggle = $('#themeToggle');
    if (!toggle) return;

    var saved = localStorage.getItem('blog-theme');
    if (!saved) {
      // 首次访问：尊重系统偏好
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } else {
      document.documentElement.setAttribute('data-theme', saved);
    }

    // 监听系统主题变化（仅在用户未手动设置时生效）
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      if (!localStorage.getItem('blog-theme')) {
        if (e.matches) {
          document.documentElement.removeAttribute('data-theme');
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
        }
      }
    });

    toggle.addEventListener('click', function() {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'light' ? 'dark' : 'light';
      if (next === 'dark') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', next);
      }
      localStorage.setItem('blog-theme', next);
    });
  }

  // ════════════════════════════════════════════════════════
  //  2. 移动端汉堡菜单
  // ════════════════════════════════════════════════════════
  function initMobileMenu() {
    const hamburger = $('#hamburger');
    const navList = $('#navList');
    if (!hamburger || !navList) return;

    hamburger.addEventListener('click', () => {
      const open = navList.classList.toggle('open');
      hamburger.classList.toggle('active', open);
    });

    // 点击导航链接 — 页面切换 + 关闭菜单
    navList.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        navList.classList.remove('open');
        hamburger.classList.remove('active');
        const page = e.target.dataset.page;
        if (page && page !== 'article') {
          // 不在首页时，统一跳转到 index.html（通过 hash 传递目标页面）
          if (document.body.dataset.page !== 'home') {
            e.preventDefault();
            if (page === 'home') {
              window.location.href = 'index.html';
            } else {
              window.location.href = 'index.html#' + page;
            }
            return;
          }
          e.preventDefault();
          switchPage(page);
        }
      }
    });

    // 点击外部关闭
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navList.contains(e.target)) {
        navList.classList.remove('open');
        hamburger.classList.remove('active');
      }
    });
  }

  // ════════════════════════════════════════════════════════
  //  3. 阅读进度条
  // ════════════════════════════════════════════════════════
  function initProgressBar() {
    const bar = $('#progressBar');
    if (!bar) return;

    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = Math.min(pct, 100) + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ════════════════════════════════════════════════════════
  //  4. 回到顶部
  // ════════════════════════════════════════════════════════
  function initBackToTop() {
    const btn = $('#backToTop');
    if (!btn) return;

    function toggle() {
      btn.classList.toggle('visible', window.scrollY > 300);
    }

    window.addEventListener('scroll', toggle, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    toggle();
  }

  // ════════════════════════════════════════════════════════
  //  5. 导航高亮（当前页面）
  // ════════════════════════════════════════════════════════
  function initNavHighlight() {
    const page = document.body.dataset.page;
    $$('.nav-link').forEach(link => {
      if (link.dataset.page === page) {
        link.classList.add('active');
      }
    });
  }

  // ════════════════════════════════════════════════════════
  //  6. 首页 — 文章数据 & 渲染
  // ════════════════════════════════════════════════════════
  var articleData = BlogData.articles;

  function renderArticles(articles) {
    const container = $('#articlesContainer');
    if (!container) return;

    if (articles.length === 0) {
      container.innerHTML = '<div class="no-results">... 翠叶间未找到匹配的卷轴 ...</div>';
      return;
    }

    container.innerHTML = articles.map(function(a) {
      // 动态计算阅读时长
      var content = BlogData.contents[a.id];
      var readTime = content ? calcReadTime(content.content) : a.readTime;
      return '<article class="article-card" data-tags="' + a.tags.join(',') + '">' +
        '<h2 class="article-title"><a href="' + a.url + '">' + escapeHtml(a.title) + '</a></h2>' +
        '<div class="article-meta"><span>* ' + a.date + '</span><span class="read-time">~ ' + readTime + ' ~</span></div>' +
        '<div class="article-tags">' + a.tags.map(function(t) { return '<span class="tag" data-tag="' + t + '"># ' + t + '</span>'; }).join('') + '</div>' +
        '<p class="article-excerpt">' + escapeHtml(a.excerpt) + '</p>' +
        '<a href="' + a.url + '" class="read-more">[ 展开古老卷轴 ]</a>' +
        '</article>';
    }).join('');
  }

  // ════════════════════════════════════════════════════════
  //  7. 首页 — 搜索 & 标签筛选
  // ════════════════════════════════════════════════════════
  function initSearch() {
    const searchInput = $('#searchInput');
    const filterContainer = $('#filterTags');
    if (!searchInput || !filterContainer) return;

    let activeTag = 'all';

    // 收集所有标签
    const allTags = ['all', ...new Set(articleData.flatMap(a => a.tags))];

    // 渲染标签筛选按钮
    const tagLabels = { all: '全部', '开发': '开发', '笔记': '笔记', '感悟': '感悟', '游戏': '游戏' };
    filterContainer.innerHTML = allTags.map(t =>
      `<button class="filter-btn${t === 'all' ? ' active' : ''}" data-filter="${t}">${tagLabels[t] || t}</button>`
    ).join('');

    function doFilter() {
      const keyword = searchInput.value.trim().toLowerCase();

      let filtered = articleData;

      // 标签筛选
      if (activeTag !== 'all') {
        filtered = filtered.filter(a => a.tags.includes(activeTag));
      }

      // 关键词搜索
      if (keyword) {
        filtered = filtered.filter(a =>
          a.title.toLowerCase().includes(keyword) ||
          a.excerpt.toLowerCase().includes(keyword) ||
          a.tags.some(t => t.toLowerCase().includes(keyword))
        );
      }

      renderArticles(filtered);

      // 搜索高亮
      if (keyword) {
        setTimeout(function() { highlightSearch(keyword); }, 50);
      }

      // 重新绑定标签点击事件
      $$('.article-tags .tag').forEach(function(tagEl) {
        tagEl.addEventListener('click', () => {
          const tag = tagEl.dataset.tag;
          activeTag = tag;
          searchInput.value = '';
          $$('.filter-btn').forEach(b => b.classList.remove('active'));
          const matchBtn = $(`.filter-btn[data-filter="${tag}"]`);
          if (matchBtn) matchBtn.classList.add('active');
          doFilter();
        });
      });
    }

    // 搜索输入
    searchInput.addEventListener('input', doFilter);

    // 标签筛选按钮
    filterContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      activeTag = btn.dataset.filter;
      $$('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      searchInput.value = '';
      doFilter();
    });
  }

  // ════════════════════════════════════════════════════════
  //  8. 文章详情 — 目录生成
  // ════════════════════════════════════════════════════════
  function initTOC() {
    const tocContainer = $('#tocContainer');
    const content = $('#articleContent');
    if (!tocContainer || !content) return;

    const headings = $$('h2', content);
    if (headings.length === 0) {
      tocContainer.style.display = 'none';
      return;
    }

    const items = headings.map((h, i) => {
      const id = 'section-' + (i + 1);
      h.id = id;
      return `<li><a href="#${id}">${escapeHtml(h.textContent)}</a></li>`;
    });

    tocContainer.innerHTML = `
      <div class="toc">
        <div class="toc-title">* 翠叶目录 *</div>
        <ul class="toc-list">${items.join('')}</ul>
      </div>
    `;
  }

  // ════════════════════════════════════════════════════════
  //  9. 文章详情 — 评论区
  // ════════════════════════════════════════════════════════
  function initComments() {
    const form = $('#commentForm');
    const list = $('#commentList');
    if (!form || !list) return;

    // 获取文章 ID（从 URL 参数或 body data 属性）
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('id') || document.body.dataset.articleId || 'default';

    const STORAGE_KEY = 'blog-comments-' + articleId;

    function loadComments() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      } catch (e) {
        return [];
      }
    }

    function saveComments(comments) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    }

    function renderComments() {
      const comments = loadComments();
      if (comments.length === 0) {
        list.innerHTML = '<div class="no-comments">... 精灵议事厅静候第一位旅人的声音 ...</div>';
        return;
      }
      list.innerHTML = comments.map((c, i) => `
        <div class="comment-item">
          <div class="comment-header">
            <span class="comment-author">${escapeHtml(c.author)}</span>
            <div>
              <span class="comment-time">${formatDate(c.time)}</span>
              <button class="comment-delete" data-index="${i}">删除</button>
            </div>
          </div>
          <div class="comment-body">${escapeHtml(c.body)}</div>
        </div>
      `).join('');

      // 删除按钮事件
      $$('.comment-delete', list).forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index);
          const comments = loadComments();
          comments.splice(idx, 1);
          saveComments(comments);
          renderComments();
        });
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const authorInput = $('#commentAuthor');
      const bodyInput = $('#commentBody');
      const author = authorInput.value.trim();
      const body = bodyInput.value.trim();

      if (!author || !body) {
        if (!author) authorInput.focus();
        else bodyInput.focus();
        return;
      }

      const comments = loadComments();
      comments.unshift({
        author,
        body,
        time: Date.now()
      });
      saveComments(comments);

      authorInput.value = '';
      bodyInput.value = '';
      renderComments();
    });

    renderComments();
  }

  // ════════════════════════════════════════════════════════
  //  10. 文章详情 — 加载文章内容
  // ════════════════════════════════════════════════════════
  var articleContents = BlogData.contents;

  function loadArticleContent() {
    const container = $('#articleContent');
    const titleEl = $('#articleDetailTitle');
    const metaEl = $('#articleDetailMeta');
    if (!container || !titleEl) return;

    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('id');

    // 如果没有 id 参数，默认显示第一篇
    const id = articleId || 'mc-server';
    const article = articleContents[id] || articleContents['mc-server'];

    document.body.dataset.articleId = id;
    document.title = article.title + ' - 片片公子';

    // 动态计算阅读时长
    var computedReadTime = calcReadTime(article.content);

    titleEl.textContent = article.title;
    metaEl.innerHTML = `
      + ${article.date} &nbsp;|&nbsp;
      旅人: ${article.author} &nbsp;|&nbsp;
      ~ ${computedReadTime} ~ &nbsp;|&nbsp;
      ${article.tags.map(function(t) { return '<span class="tag"># ' + t + '</span>'; }).join(' ')}
    `;
    container.innerHTML = article.content;

    // 动态更新 OG 标签
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', article.title + ' - 片片公子');
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      var tempDiv = document.createElement('div');
      tempDiv.innerHTML = article.content;
      var firstP = tempDiv.querySelector('p');
      if (firstP) ogDesc.setAttribute('content', firstP.textContent.substring(0, 160));
    }
    var ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', window.location.href);

    // 设置上一篇/下一篇导航
    setupArticleNav(articleId);

    // 渲染完内容后生成 TOC
    initTOC();
  }

  function setupArticleNav(currentId) {
    const ids = Object.keys(articleContents);
    const idx = ids.indexOf(currentId);
    const prevEl = $('#prevArticle');
    const nextEl = $('#nextArticle');

    if (idx > 0 && prevEl) {
      const prev = articleContents[ids[idx - 1]];
      prevEl.href = 'article-detail.html?id=' + ids[idx - 1];
      prevEl.querySelector('.nav-title').textContent = prev.title;
      prevEl.style.display = '';
    } else if (prevEl) {
      prevEl.style.display = 'none';
    }

    if (idx < ids.length - 1 && nextEl) {
      const next = articleContents[ids[idx + 1]];
      nextEl.href = 'article-detail.html?id=' + ids[idx + 1];
      nextEl.querySelector('.nav-title').textContent = next.title;
      nextEl.style.display = '';
    } else if (nextEl) {
      nextEl.style.display = 'none';
    }
  }

  // ════════════════════════════════════════════════════════
  //  11. 卡片滚动渐入 (IntersectionObserver)
  // ════════════════════════════════════════════════════════
  function initRevealOnScroll() {
    var cards = $$('.article-card');
    if (!cards.length) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    cards.forEach(function(card) { observer.observe(card); });
  }

  // ════════════════════════════════════════════════════════
  //  12. 光标精灵尘拖尾
  // ════════════════════════════════════════════════════════
  function initCursorSparkles() {
    var ticking = false;
    var lastX = 0, lastY = 0;
    function spawnSparkle(x, y) {
      var s = document.createElement('div');
      s.className = 'cursor-sparkle';
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      document.body.appendChild(s);
      s.addEventListener('animationend', function() { s.remove(); });
    }
    document.addEventListener('mousemove', function(e) {
      if (!ticking) {
        requestAnimationFrame(function() {
          var dx = e.clientX - lastX;
          var dy = e.clientY - lastY;
          if (Math.sqrt(dx*dx + dy*dy) > 30) {
            spawnSparkle(e.clientX, e.clientY);
            lastX = e.clientX;
            lastY = e.clientY;
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // ════════════════════════════════════════════════════════
  // ════════════════════════════════════════════════════════
  //  13a. 天体星辰环绕（暗夜可见）
  // ════════════════════════════════════════════════════════
  function initCelestialParticles() {
    var body = document.querySelector('.celestial-body');
    if (!body) return;
    var container = document.createElement('div');
    container.className = 'celestial-particles';
    for (var i = 0; i < 8; i++) {
      var angle = (i / 8) * Math.PI * 2;
      var radius = 28 + Math.random() * 14;
      var x = Math.cos(angle) * radius;
      var y = Math.sin(angle) * radius;
      var particle = document.createElement('div');
      particle.className = 'celestial-particle';
      particle.style.cssText = 'left:' + x.toFixed(0) + 'px;top:' + y.toFixed(0) + 'px;' +
        '--star-dur:' + (1.5 + Math.random() * 2.5).toFixed(1) + 's;' +
        '--star-delay:' + (Math.random() * 3).toFixed(1) + 's;';
      container.appendChild(particle);
    }
    body.appendChild(container);
  }

  //  13b. 天际飞鸟（白日可见）
  // ════════════════════════════════════════════════════════
  function initSkyBirds() {
    var container = document.getElementById('skyBirds');
    if (!container) return;
    var html = '';
    for (var i = 0; i < 6; i++) {
      var top = (8 + Math.random() * 25).toFixed(0);
      var dur = (12 + Math.random() * 16).toFixed(1);
      var delay = (Math.random() * 20).toFixed(1);
      var size = (0.6 + Math.random() * 1.2).toFixed(2);
      html += '<div class="bird" style="top:' + top + '%;--fly-dur:' + dur + 's;--fly-delay:-' + delay + 's;transform:scale(' + size + ');"></div>';
    }
    container.innerHTML = html;
  }

  //  14. 精灵光点生成
  // ════════════════════════════════════════════════════════
  function generateFireflies() {
    var container = document.getElementById('fireflies');
    if (!container) return;
    var html = '';
    var easings = ['ease-in-out', 'ease', 'ease-in', 'ease-out', 'cubic-bezier(0.34,1.56,0.64,1)'];
    for (var i = 0; i < 28; i++) {
      var waveAmp = (12 + Math.random() * 40).toFixed(0);
      var peak = (0.6 + Math.random() * 0.4).toFixed(2);
      html += '<div class="firefly" style="left:' + (Math.random()*95).toFixed(1) + '%;top:' +
        (Math.random()*90).toFixed(1) + '%;--dur:' + (2.5+Math.random()*6).toFixed(1) +
        's;--delay:' + (Math.random()*7).toFixed(1) + 's;' +
        '--wave-amp:' + waveAmp + 'px;' +
        '--peak-opacity:' + peak + ';' +
        '--easing:' + easings[Math.floor(Math.random() * easings.length)] + ';"></div>';
    }
    container.innerHTML = html;
  }

  //  15. 飘落翠叶
  // ════════════════════════════════════════════════════════
  function initFallingLeaves() {
    var container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:995;';
    document.body.appendChild(container);
    var easings = ['linear', 'ease', 'ease-in-out', 'cubic-bezier(0.4,0,0.2,1)'];
    for (var i = 0; i < 12; i++) {
      var leaf = document.createElement('div');
      leaf.className = 'falling-leaf';
      var left = (Math.random() * 96).toFixed(1);
      var dur = (9 + Math.random() * 14).toFixed(1);
      var delay = (Math.random() * 18).toFixed(1);
      var drift = ((Math.random() - 0.5) * 200).toFixed(0);
      var spin = (360 + Math.random() * 720).toFixed(0);
      var size = (7 + Math.random() * 10).toFixed(0);
      var swayDur = (2.5 + Math.random() * 4).toFixed(1);
      leaf.style.cssText = 'left:' + left + '%;top:-20px;';
      leaf.innerHTML = '<div class="leaf-inner" style="--fall-dur:' + dur + 's;--fall-delay:-' + delay +
        's;--drift:' + drift + 'px;--spin:' + spin + 'deg;--leaf-size:' + size + 'px;' +
        '--sway-dur:' + swayDur + 's;--fall-easing:' + easings[Math.floor(Math.random() * easings.length)] + ';"></div>';
      container.appendChild(leaf);
    }
  }

  // ════════════════════════════════════════════════════════
  //  16. TOC 滚动高亮
  // ════════════════════════════════════════════════════════
  function initTOCSpy() {
    var tocLinks = $$('.toc-list a');
    var headings = $$('.article-content h2');
    if (!tocLinks.length || !headings.length) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          tocLinks.forEach(function(l) { l.classList.remove('toc-active'); });
          var active = $('.toc-list a[href="#' + entry.target.id + '"]');
          if (active) active.classList.add('toc-active');
        }
      });
    }, { threshold: 0.5, rootMargin: '-80px 0px -60% 0px' });
    headings.forEach(function(h) { observer.observe(h); });
  }


  // ════════════════════════════════════════════════════════
  //  17. 页面切换
  // ════════════════════════════════════════════════════════
  function switchPage(page) {
    $$('.nav-link').forEach(function(l) { l.classList.remove('active'); });
    var nl = $('.nav-link[data-page="' + page + '"]');
    if (nl) nl.classList.add('active');
    var main = $('.blog-main');
    var search = $('.search-section');
    var sidebar = $('.sidebar');
    $$('.page-section').forEach(function(s) { s.classList.remove('active'); });
    if (page === 'home') {
      if (main) main.style.display = '';
      if (search) search.style.display = '';
      if (sidebar) sidebar.style.display = '';
    } else {
      if (main) main.style.display = 'none';
      var map = { categories: 'page-categories', about: 'page-about', archive: 'page-archive', contact: 'page-contact' };
      var sec = document.getElementById(map[page]);
      if (sec) sec.classList.add('active');
      
    }
  }


  // ════════════════════════════════════════════════════════
  //  18. 代码块复制按钮
  // ════════════════════════════════════════════════════════
  function initCodeCopyButtons() {
    var pres = document.querySelectorAll('.article-content pre');
    pres.forEach(function(pre) {
      var btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.textContent = '[ 复制 ]';
      btn.addEventListener('click', function() {
        var code = pre.querySelector('code');
        var text = code ? code.textContent : pre.textContent;
        navigator.clipboard.writeText(text).then(function() {
          btn.textContent = '[ 已复制 ]';
          setTimeout(function() { btn.textContent = '[ 复制 ]'; }, 2000);
        }).catch(function() {
          btn.textContent = '[ 失败 ]';
          setTimeout(function() { btn.textContent = '[ 复制 ]'; }, 2000);
        });
      });
      pre.style.position = 'relative';
      pre.appendChild(btn);
    });
  }

  // ════════════════════════════════════════════════════════
  //  19. 键盘快捷键
  // ════════════════════════════════════════════════════════
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
      // 忽略输入框中的按键
      var tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      // '/' 聚焦搜索
      if (e.key === '/' && document.body.dataset.page === 'home') {
        e.preventDefault();
        var searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.focus();
      }

      // 't' 切换主题
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        var toggle = document.getElementById('themeToggle');
        if (toggle) toggle.click();
      }

      // 'Escape' 关闭菜单 / 清除搜索
      if (e.key === 'Escape') {
        var navList = document.getElementById('navList');
        var hamburger = document.getElementById('hamburger');
        if (navList && navList.classList.contains('open')) {
          navList.classList.remove('open');
          if (hamburger) hamburger.classList.remove('active');
        }
        var searchInput = document.getElementById('searchInput');
        if (searchInput && document.activeElement === searchInput) {
          searchInput.blur();
        }
      }
    });
  }

  // ════════════════════════════════════════════════════════
  //  20. 搜索结果高亮
  // ════════════════════════════════════════════════════════
  function highlightSearch(keyword) {
    if (!keyword || keyword.length === 0) return;
    var cards = document.querySelectorAll('.article-excerpt, .article-title a');
    cards.forEach(function(el) {
      var text = el.innerHTML;
      // 只高亮文本节点（简单实现）
      var escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var regex = new RegExp('(' + escaped + ')', 'gi');
      // 避免高亮已存在的 mark 标签
      if (!el.querySelector('mark')) {
        el.innerHTML = text.replace(regex, '<mark class="search-highlight">$1</mark>');
      }
    });
  }

  // ════════════════════════════════════════════════════════
  //  21. 文章归档时间线
  // ════════════════════════════════════════════════════════
  function renderTimeline() {
    var container = document.getElementById('timelineContainer');
    if (!container) return;
    var articles = BlogData.articles.slice().sort(function(a, b) {
      return b.date.localeCompare(a.date);
    });
    var years = {};
    articles.forEach(function(a) {
      var y = a.date.substring(0, 4);
      if (!years[y]) years[y] = [];
      years[y].push(a);
    });
    var html = '';
    Object.keys(years).sort().reverse().forEach(function(year) {
      html += '<div class="timeline-year"><h3 class="timeline-year-title">' + year + ' 年</h3>';
      years[year].forEach(function(a) {
        html += '<div class="timeline-item"><span class="timeline-date">' + a.date + '</span>' +
          '<a href="' + a.url + '" class="timeline-link">' + escapeHtml(a.title) + '</a>' +
          '<span class="timeline-tags">' + a.tags.map(function(t) { return '<span class="tag"># ' + t + '</span>'; }).join(' ') + '</span></div>';
      });
      html += '</div>';
    });
    container.innerHTML = html || '<p style="text-align:center;color:var(--text-muted);">* 年轮尚在描画中...</p>';
  }

  // ════════════════════════════════════════════════════════
  //  22a. 按钮点击涟漪
  // ════════════════════════════════════════════════════════
  function initButtonRipple() {
    document.addEventListener('click', function(e) {
      var btn = e.target.closest('.read-more, .comment-submit, .filter-btn, .share-btn, .contact-qq-btn');
      if (!btn) return;
      var ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      ripple.style.cssText = 'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + (e.clientX - rect.left - size/2) + 'px;' +
        'top:' + (e.clientY - rect.top - size/2) + 'px;';
      btn.style.position = btn.style.position || 'relative';
      btn.style.overflow = btn.style.overflow || 'hidden';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', function() { ripple.remove(); });
    });
  }

  //  22b. 卡片 3D 倾斜悬停（仅桌面端）
  // ════════════════════════════════════════════════════════
  function initCardTilt() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var cards = document.querySelectorAll('.article-card, .project-card, .widget');
    cards.forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = ((y - centerY) / centerY) * -4;
        var rotateY = ((x - centerX) / centerX) * 4;
        card.style.transform = 'perspective(800px) rotateX(' + rotateX.toFixed(1) + 'deg) rotateY(' + rotateY.toFixed(1) + 'deg) translateY(-3px)';
        card.style.transition = 'transform 0.1s ease-out, box-shadow 0.25s ease, border-color 0.25s ease';
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s ease, box-shadow 0.25s ease, border-color 0.25s ease';
      });
    });
  }

  //  22c. 主题切换粒子爆发
  // ════════════════════════════════════════════════════════
  function initThemeBurst() {
    var toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    toggle.addEventListener('click', function(e) {
      var count = 14;
      for (var i = 0; i < count; i++) {
        var particle = document.createElement('div');
        particle.className = 'theme-particle';
        var angle = (i / count) * Math.PI * 2;
        var dist = 30 + Math.random() * 50;
        var size = 3 + Math.random() * 5;
        particle.style.cssText =
          '--tx:' + (Math.cos(angle) * dist).toFixed(0) + 'px;' +
          '--ty:' + (Math.sin(angle) * dist).toFixed(0) + 'px;' +
          '--p-size:' + size + 'px;' +
          '--p-color:' + (i % 3 === 0 ? '#ffe890' : i % 3 === 1 ? '#80e8c0' : '#60e0ff') + ';' +
          'left:' + e.clientX + 'px;top:' + e.clientY + 'px;';
        document.body.appendChild(particle);
        particle.addEventListener('animationend', function() { particle.remove(); });
      }
    });
  }

  //  23. 文章分享按钮
  // ════════════════════════════════════════════════════════
  function initShareButtons() {
    var btn = document.getElementById('copyLinkBtn');
    if (!btn) return;
    btn.addEventListener('click', function() {
      navigator.clipboard.writeText(window.location.href).then(function() {
        btn.textContent = '[ 链接已复制 ]';
        setTimeout(function() { btn.textContent = '[ 复制卷轴链接 ]'; }, 2000);
      }).catch(function() {
        btn.textContent = '[ 复制失败 ]';
        setTimeout(function() { btn.textContent = '[ 复制卷轴链接 ]'; }, 2000);
      });
    });
  }

  // ════════════════════════════════════════════════════════
  //  23. 初始化入口
  // ════════════════════════════════════════════════════════
  function init() {
    /* 所有页面共用 */
    initTheme();
    initMobileMenu();
    initProgressBar();
    initBackToTop();
    initNavHighlight();
    initCursorSparkles();
    initCelestialParticles();
    initSkyBirds();
    initFallingLeaves();
    generateFireflies();
    initKeyboardShortcuts();
    initButtonRipple();
    initThemeBurst();

    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }

    var page = document.body.dataset.page;
    if (page === 'home') {
      renderArticles(articleData);
      initSearch();
      initRevealOnScroll();
      renderTimeline();
      setTimeout(function() { initCardTilt(); }, 200);
      // 处理从其他页面带来的 hash 定位（如 index.html#categories）
      if (window.location.hash) {
        var hash = window.location.hash.replace('#', '');
        if (hash && hash !== 'home') {
          switchPage(hash);
        }
      }
    }

    if (page === 'article') {
      loadArticleContent();
      initComments();
      initShareButtons();
      setTimeout(function() {
        initRevealOnScroll();
        initTOCSpy();
        initCodeCopyButtons();
        initCardTilt();
      }, 150);
    }
  }

  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
