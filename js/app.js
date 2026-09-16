import { $, $$, hydrateIcons, copyText, toast } from './modules/core.js';
import { initAtmosphere } from './modules/atmosphere.js';
import { initTheme } from './modules/theme.js';
import { initMotion } from './modules/motion.js';
import { createArticles } from './modules/articles.js';
import { initRouter } from './modules/router.js';
function init() {
  hydrateIcons(); initTheme(); initMotion(); initAtmosphere();
  const articles = createArticles(window.BlogData); articles.init(); initRouter(articles);
  $('#year').textContent = new Date().getFullYear();
  const menu = $('#menuToggle'); const nav = $('#primaryNav');
  const closeMenu = () => {nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','打开导航');};
  $('.skip-link').addEventListener('click', event => { event.preventDefault(); $('#main-content').focus({preventScroll:true}); $('#main-content').scrollIntoView(); });
  menu.addEventListener('click', () => {const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? '关闭导航' : '打开导航');});
  document.addEventListener('click', event => {if (!nav.contains(event.target) && !menu.contains(event.target)) closeMenu();});
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); }
    const editing = event.target.closest('input, textarea, [contenteditable]');
    if (event.key === '/' && !editing && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      if (document.body.dataset.page !== 'home') { location.hash = 'home'; document.addEventListener('pagechange', () => $('#searchInput').focus(), {once:true}); }
      else $('#searchInput').focus();
    }
  });
  $('#summonSpirit').addEventListener('click', () => { document.dispatchEvent(new Event('forestwish')); toast(document.body.classList.contains('atmosphere-off') ? '森林正在静静休息。开启叶子按钮可唤醒树灵。' : '树灵醒了，送你一点森林的微光。'); });
  $('#copyQQ').addEventListener('click', () => copyText('1240778501'));
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(error => console.warn('Offline support unavailable:', error.message));
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
