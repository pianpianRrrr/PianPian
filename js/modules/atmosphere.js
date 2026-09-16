import { $, storage } from './core.js';
import { reducedMotion } from './motion.js';

// All decorative nodes are bounded, non-interactive and removed after playback.
export function initAtmosphere() {
  const layer = document.createElement('div');
  layer.className = 'forest-atmosphere';
  layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);
  const fireflies = document.createElement('div');
  fireflies.className = 'ambient-fireflies';
  layer.append(fireflies);
  const toggle = $('#atmosphereToggle');
  const compact = matchMedia('(max-width: 640px)');
  let enabled = storage.get('blog-atmosphere', 'on') !== 'off';
  let leafTimer, birdTimer, spiritTimer;
  let lastSpark = 0;
  const random = (min, max) => min + Math.random() * (max - min);
  const active = () => enabled && !reducedMotion.matches && !document.hidden;

  function particle(className, variables = {}) {
    const node = document.createElement('span');
    node.className = className;
    for (const [key, value] of Object.entries(variables)) node.style.setProperty(key, value);
    // Nested sway/wing animations bubble; only the outer journey ends the particle.
    node.addEventListener('animationend', event => { if (event.target === node) node.remove(); });
    layer.append(node);
    return node;
  }

  function dropLeaf() {
    if (!active()) return;
    const limit = compact.matches ? 8 : 18;
    if (layer.querySelectorAll('.ambient-leaf').length < limit) {
      const leaf = particle('ambient-leaf', {
        '--start': `${random(3, 96)}%`,
        '--duration': `${random(13, 21)}s`,
        '--drift': `${random(-190, 190)}px`,
        '--sway': `${random(35, 80)}px`,
        '--turn': `${random(140, 390)}deg`,
        '--size': `${random(16, 29)}px`,
        '--sway-duration': `${random(2.4, 4.2)}s`,
        '--leaf-hue': `${random(65, 110)}`
      });
      leaf.innerHTML = '<span class="leaf-sway"><i class="leaf-blade"></i></span>';
    }
    leafTimer = setTimeout(dropLeaf, random(compact.matches ? 1400 : 650, compact.matches ? 2200 : 1200));
  }

  function flyBirds() {
    if (!active()) return;
    if (document.documentElement.dataset.theme === 'light' && document.body.dataset.page === 'home' && !compact.matches) {
      for (let i = 0; i < 3; i++) particle('ambient-bird', {
        '--altitude': `${random(14, 24)}vh`,
        '--duration': `${random(17, 22)}s`,
        '--delay': `${i * 1.4}s`
       }).innerHTML = `<svg class="side-bird" viewBox="0 0 32 24" aria-hidden="true" shape-rendering="crispEdges">
        <path class="bird-far-wing" d="M14 12h4V8h3V5h2V3h-5v3h-3v3h-1z"/>
        <path class="bird-body" d="M2 10h4v2h5v-1h9V9h3V7h5v2h2v2h-3v3h-5v2h-9v-1H9v-1H5v-2H2z"/>
        <path class="bird-beak" d="M28 9h4v2h-4z"/>
        <path class="bird-near-wing wing-up" d="M12 12V8h-2V5H8V2h5v3h3v3h3v5z"/>
        <path class="bird-near-wing wing-down" d="M12 12h7v3h-3v3h-3v3H9v-4h2v-3h1z"/>
        <path class="bird-eye" d="M25 8h1v1h-1z"/>
      </svg>`;
    }
    birdTimer = setTimeout(flyBirds, random(16000, 26000));
  }

  function summonSpirit() {
    if (!active() || layer.querySelectorAll('.ambient-spirit').length >= 3) return;
    const spirit = particle('ambient-spirit', {
      '--origin-x': `${random(55, 84)}vw`, '--origin-y': `${random(22, 52)}vh`,
      '--journey-x': `${random(-160, 80)}px`, '--journey-y': `${random(-160, -80)}px`,
      '--duration': `${random(7, 11)}s`
    });
    spirit.innerHTML = '<i class="spirit-wing wing-left"></i><i class="spirit-core"></i><i class="spirit-wing wing-right"></i><i class="spirit-tail"></i>';
  }

  function visitSpirit() {
    if (!active()) return;
    if (document.body.dataset.page === 'home') {
      summonSpirit();
      if (!compact.matches && layer.querySelectorAll('.pixel-shooting-star').length < 1) {
        particle('pixel-shooting-star', {'--star-x': `${random(20, 80)}vw`, '--star-y': `${random(12, 32)}vh`});
      }
    }
    spiritTimer = setTimeout(visitSpirit, random(14000, 23000));
  }

  document.addEventListener('forestwish', () => {
    if (!active()) return;
    summonSpirit();
    if (!compact.matches) summonSpirit();
    if (layer.querySelectorAll('.tree-wish-ring').length < 1) particle('tree-wish-ring');
  });

  function seedFireflies() {
    fireflies.replaceChildren();
    for (let i = 0; i < (compact.matches ? 12 : 28); i++) {
      const dot = document.createElement('i');
      dot.style.cssText = `left:${random(2,98)}%;top:${random(16,94)}%;--glow-duration:${random(3.5,7)}s;--glow-delay:-${random(0,10)}s;--wander:${random(-45,45)}px`;
      fireflies.append(dot);
    }
  }

  function sync() {
    clearTimeout(leafTimer); clearTimeout(birdTimer); clearTimeout(spiritTimer);
    layer.querySelectorAll('.ambient-leaf, .ambient-bird, .ambient-spark, .ambient-spirit, .pixel-shooting-star, .tree-wish-ring').forEach(node => node.remove());
    const running = active();
    layer.hidden = !running;
    document.body.classList.toggle('atmosphere-off', !enabled || reducedMotion.matches);
    toggle.setAttribute('aria-pressed', String(enabled && !reducedMotion.matches));
    toggle.setAttribute('aria-label', enabled ? '关闭森林动效' : '开启森林动效');
    toggle.title = reducedMotion.matches ? '已遵循系统的减少动态效果设置' : (enabled ? '关闭森林动效' : '开启森林动效');
    toggle.disabled = reducedMotion.matches;
    if (running) {
      seedFireflies();
      dropLeaf();
      birdTimer = setTimeout(flyBirds, 5000);
      spiritTimer = setTimeout(visitSpirit, 3200);
    }
  }

  toggle.addEventListener('click', () => { enabled = !enabled; storage.set('blog-atmosphere', enabled ? 'on' : 'off'); sync(); });
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  compact.addEventListener('change', sync);
  document.addEventListener('click', event => {
    if (!active() || !event.detail || !event.target.closest('a, button') || event.target.closest('#atmosphereToggle') || performance.now() - lastSpark < 180) return;
    lastSpark = performance.now();
    if (layer.querySelectorAll('.ambient-spark').length > 18) return;
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI * 2 / 8;
      const distance = random(25, 48);
      particle('ambient-spark', {
        '--x': `${event.clientX}px`, '--y': `${event.clientY}px`,
        '--dx': `${Math.cos(angle) * distance}px`, '--dy': `${Math.sin(angle) * distance - 12}px`
      });
    }
  });
  sync();
}
