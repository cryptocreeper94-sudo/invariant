/**
 * HydroCore.dev — Main JS (cockpit, scroll, interactions)
 * DarkWave Studios LLC — Copyright 2026
 */

// ── Ambient Particle System ──
(function initParticles() {
  var c = document.getElementById('ambient-particles');
  if (!c) return;
  var ctx = c.getContext('2d');
  function resize() { c.width = window.innerWidth; c.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);
  var pts = [];
  for (var i = 0; i < 45; i++) {
    pts.push({ x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 1.2 + 0.4, a: Math.random() * 0.3 + 0.05 });
  }
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0;
      if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,229,255,' + p.a + ')'; ctx.fill();
      for (var j = i + 1; j < pts.length; j++) {
        var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.sqrt(dx*dx + dy*dy);
        if (d < 100) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = 'rgba(0,229,255,' + (0.08 * (1 - d / 100)) + ')'; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── Cockpit Clock ──
(function initClock() {
  const el = document.getElementById('hc-clock');
  if (!el) return;
  function tick() {
    const d = new Date();
    el.textContent = d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  tick();
  setInterval(tick, 1000);
})();

// ── Cockpit Mode Cycling ──
(function initModeCycle() {
  const el = document.getElementById('hc-mode');
  if (!el) return;
  const modes = [
    { name: 'STABILITY', color: '#00E5FF' },
    { name: 'POWER',     color: '#22c55e' },
    { name: 'BALANCE',   color: '#8b5cf6' },
    { name: 'RECOVERY',  color: '#f59e0b' },
    { name: 'STABILITY', color: '#00E5FF' },
    { name: 'STABILITY', color: '#00E5FF' },
  ];
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % modes.length;
    el.textContent = modes[idx].name;
    el.style.color = modes[idx].color;
  }, 5000);
})();

// ── Dock Active State ──
(function initDock() {
  const dock = document.getElementById('hc-dock');
  if (!dock) return;
  const links = dock.querySelectorAll('a');
  const sections = ['hero', 'organism', 'engine', 'drive', 'papers'];

  function updateActive() {
    const scrollY = window.scrollY + window.innerHeight / 3;
    let activeIdx = 0;
    sections.forEach((id, i) => {
      const sec = document.getElementById(id);
      if (sec && sec.offsetTop <= scrollY) activeIdx = i;
    });
    links.forEach((l, i) => l.classList.toggle('hc-d-active', i === activeIdx));
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();

// ── Scroll Reveal (staggered) ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
      e.target.querySelectorAll('.prim-bar-fill').forEach(bar => {
        bar.style.width = bar.style.width;
      });
    }
  });
}, { threshold: 0.1 });

// Assign staggered delays to card groups
var cardGroups = ['.primitive-card', '.spec-card', '.paper-card', '.dstat', '.flow-node', '.doi-link'];
cardGroups.forEach(function(sel) {
  document.querySelectorAll(sel).forEach(function(el, i) {
    el.style.transitionDelay = (i * 80) + 'ms';
  });
});

document.querySelectorAll('.section, .primitive-card, .spec-card, .paper-card, .dstat, .flow-node, .doi-link, .coupling-node, .mode-item, .v2g-note').forEach(el => {
  // Don't hide sections containing 3D canvases — they need to be visible for WebGL to render
  if (el.classList.contains('section') && el.querySelector('canvas')) return;
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});
const revStyle = document.createElement('style');
revStyle.textContent = '.revealed { opacity: 1 !important; transform: translateY(0) !important; }';
document.head.appendChild(revStyle);

// ── Count-Up Animation ──
var countObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (!e.isIntersecting) return;
    var el = e.target;
    var target = parseInt(el.getAttribute('data-target'));
    if (!target || el.dataset.counted) return;
    el.dataset.counted = '1';
    var start = 0, duration = 1200, startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(function(el) { countObserver.observe(el); });

// ── Smooth Nav ──
document.querySelectorAll('.hc-s-right a, .hc-dock-pill a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ── Status Bar Opacity ──
window.addEventListener('scroll', () => {
  const bar = document.querySelector('.hc-status');
  if (bar) bar.style.background = window.scrollY > 50
    ? 'linear-gradient(to right,rgba(4,6,12,0.98),rgba(8,12,22,0.98))'
    : 'linear-gradient(to right,rgba(4,6,12,0.92),rgba(8,12,22,0.92))';
}, { passive: true });

console.log('⬡ HydroCore.dev loaded — Cockpit Active — DarkWave Studios LLC © 2026');
