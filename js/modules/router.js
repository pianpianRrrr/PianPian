import { $, $$ } from './core.js';
import { animatePage, reducedMotion, reveal } from './motion.js';
const titles = {home:'林间手记',categories:'翠叶藏书',archive:'时光年轮',about:'关于旅人',contact:'风之信使','not-found':'迷路了'};
export function initRouter(articles) {
  let current = '';
  function route(initial = false) {
    let segments;
    try { segments = decodeURIComponent(location.hash.slice(1) || 'home').split('/'); } catch { segments = ['not-found']; }
    const [target, id, anchor] = segments;
    let page = target === 'journal' ? 'home' : target;
    if (!(page in titles) && page !== 'article') page = 'not-found';
    const key = page === 'article' ? 'article/' + id : page;
    if (key !== current) {
      articles.cleanup();
      if (page === 'article' && !articles.open(id)) page = 'not-found';
      $$('.page').forEach(node => node.hidden = node.id !== 'page-' + page);
      $$('[data-page]').forEach(link => { if (link.dataset.page === page) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); });
      if (page !== 'article') document.title = `${titles[page]} · 片片公子`;
      document.body.dataset.page = page;
      const node = $('#page-' + page);
      if (!initial) { animatePage(node); $('#main-content').focus({preventScroll:true}); }
      reveal(node); current = key;
    }
    $('#primaryNav').classList.remove('open'); $('#menuToggle').setAttribute('aria-expanded','false'); $('#menuToggle').setAttribute('aria-label','打开导航');
    requestAnimationFrame(() => {
      const destination = target === 'journal' ? $('#journal') : page === 'article' && anchor ? document.getElementById(anchor) : null;
      if (destination && (target === 'journal' || destination.closest('#articleContent'))) destination.scrollIntoView({behavior: initial || reducedMotion.matches ? 'instant' : 'smooth'});
      else scrollTo({top:0,behavior:'instant'});
      document.dispatchEvent(new Event('pagechange'));
    });
  }
  addEventListener('hashchange', () => route());
  route(true);
}
