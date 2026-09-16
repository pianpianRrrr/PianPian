import { $, $$ } from './core.js';
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let revealObserver;
export function reveal(root = document) {
  revealObserver?.disconnect();
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
  revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.remove('reveal-pending'); entry.target.classList.add('reveal-in'); revealObserver.unobserve(entry.target); }
  }), { threshold: .08 });
  $$('.article-card, .profile-card, .timeline-year', root).forEach(node => { node.classList.add('reveal-pending'); revealObserver.observe(node); });
}
export function animatePage(page) {
  if (!reducedMotion.matches) page.animate([{opacity:0, transform:'translateY(10px)'}, {opacity:1, transform:'translateY(0)'}], {duration:280, easing:'cubic-bezier(.2,.7,.2,1)'});
}
export function initMotion() {
  const bar = $('#progressBar');
  const back = $('#backToTop');
  let pending = false;
  function update() {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0})`;
    back.hidden = scrollY < 450; pending = false;
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(update); } }
  addEventListener('scroll', schedule, {passive:true}); addEventListener('resize', schedule);
  document.addEventListener('pagechange', schedule);
  back.addEventListener('click', () => scrollTo({top:0, behavior:reducedMotion.matches ? 'instant' : 'smooth'}));
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('motion-paused', document.hidden));
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) { revealObserver?.disconnect(); $$('.reveal-pending').forEach(node => node.classList.remove('reveal-pending')); }
  });
  update();
}
