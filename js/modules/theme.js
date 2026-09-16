import { $, icon, storage } from './core.js';
export function initTheme() {
  const toggle = $('#themeToggle');
  const system = matchMedia('(prefers-color-scheme: light)');
  function sync() {
    const light = document.documentElement.dataset.theme === 'light';
    toggle.innerHTML = icon(light ? 'moon' : 'sun');
    toggle.setAttribute('aria-label', light ? '切换到深色主题' : '切换到浅色主题');
    toggle.title = toggle.getAttribute('aria-label');
    $('meta[name="theme-color"]').content = light ? '#f4f3eb' : '#111c18';
  }
  toggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    storage.set('blog-theme', next); sync();
  });
  system.addEventListener('change', event => {
    if (!storage.get('blog-theme')) { document.documentElement.dataset.theme = event.matches ? 'light' : 'dark'; sync(); }
  });
  sync();
}
