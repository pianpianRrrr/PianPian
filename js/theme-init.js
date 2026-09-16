// Run before CSS to prevent a flash of the wrong theme.
try {
  const saved = localStorage.getItem('blog-theme');
  document.documentElement.dataset.theme = saved === 'light' || saved === 'dark' ? saved : matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
} catch { document.documentElement.dataset.theme = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; }
