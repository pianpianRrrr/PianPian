// Network-first updates, scoped caches, offline fallback; compatible with subdirectory hosting.
const CACHE = 'pianpian-v18';
const ASSETS = ['./','./index.html','./style.css','./css/tokens.css','./css/layout.css','./css/components.css','./css/motion.css','./css/world-tree.css','./assets/world-tree-pixel.png','./css/pixel-ui.css','./css/frame-motion.css','./css/hanging-vines.css','./assets/pixel-vine-drape.svg','./assets/pixel-vine-cord.svg','./assets/pixel-header-vine.svg','./assets/quill-cursor.svg','./assets/quill-active.svg','./assets/pixel-vine-corner.svg','./js/theme-init.js','./js/app.js','./js/modules/core.js','./js/modules/theme.js','./js/modules/motion.js','./js/modules/atmosphere.js','./js/modules/articles.js','./js/modules/comments.js','./js/modules/router.js','./article-data.js','./avatar.webp','./404-forest.png','./favicon-384.png','./manifest.json','./feed.xml','./404.html','./article-detail.html'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('pianpian-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try { const response = await fetch(event.request); if (response.ok && response.type === 'basic') await cache.put(event.request, response.clone()); return response; }
    catch { const cached = await cache.match(event.request); if (cached) return cached; if (event.request.mode === 'navigate') return await cache.match('./index.html'); return Response.error(); }
  })());
});
