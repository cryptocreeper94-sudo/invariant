/**
 * HydroCore.dev — Interactive 4/42 Organism Ring
 * Canvas-based polar ring visualization with slider-driven state
 * DarkWave Studios LLC — Copyright 2026
 */
(function initOrganismRing() {
  const canvas = document.getElementById('organism-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // HydroCore palette
  const PRIMS = [
    { id: 'flow',     name: 'Flow Stability',      color: '#1565C0', nodes: 10, startAngle: -Math.PI/2 },
    { id: 'pressure', name: 'Pressure Regulation',  color: '#00695C', nodes: 10, startAngle: 0 },
    { id: 'thermal',  name: 'Thermal Balance',      color: '#B71C1C', nodes: 11, startAngle: Math.PI/2 },
    { id: 'load',     name: 'Structural Load',      color: '#607D8B', nodes: 11, startAngle: Math.PI },
  ];

  // State: 4 primitive values from sliders (0-100 → normalized)
  const state = { values: [0.33, 0.44, 0.22, 0.56] };

  // 42 nodes with individual jitter for organic feel
  const nodes = [];
  let angleOffset = 0;
  PRIMS.forEach((prim, pi) => {
    for (let i = 0; i < prim.nodes; i++) {
      const angle = (angleOffset / 42) * Math.PI * 2 - Math.PI / 2;
      nodes.push({
        primIdx: pi,
        angle: angle,
        jitter: (Math.random() - 0.5) * 0.06,
        pulsePhase: Math.random() * Math.PI * 2,
      });
      angleOffset++;
    }
  });

  // Mode selection (deterministic hierarchy)
  function selectMode(vals) {
    const normalized = vals.map(v => (v - 0.5) * 2); // → -1 to +1
    const anyBelowCrit = normalized.some(v => v < -0.6);
    const anyBelowCaut = normalized.some(v => v < -0.2);
    const allHealthy = normalized.every(v => v > 0.2);
    const highPower = normalized[0] > 0.5 && normalized[1] > 0.5;

    if (anyBelowCrit) return { name: 'SAFETY', color: '#ef4444', level: 'critical' };
    if (anyBelowCaut) return { name: 'RECOVERY', color: '#f59e0b', level: 'caution' };
    if (normalized[0] < 0 && normalized[1] < 0) return { name: 'BALANCE', color: '#8b5cf6', level: 'advisory' };
    if (highPower && allHealthy) return { name: 'POWER', color: '#22c55e', level: 'optimal' };
    return { name: 'STABILITY', color: '#00E5FF', level: 'optimal' };
  }

  // Deterministic hash
  function computeHash(vals, modeName) {
    const parts = vals.map(v => Math.round(v * 100).toString().padStart(2, '0'));
    return 'HC-' + parts.join('') + '-' + modeName[0];
  }

  // Canvas rendering
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    canvas.width = w * dpr;
    canvas.height = w * dpr;
    canvas.style.height = w + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  let t = 0;
  function draw() {
    requestAnimationFrame(draw);
    t += 0.016;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const baseR = w * 0.32;

    ctx.clearRect(0, 0, w, h);

    // Background glow
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 1.5);
    grd.addColorStop(0, 'rgba(0,105,92,0.03)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    // Draw base ring (subtle)
    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();

    // Draw primitive axis lines
    PRIMS.forEach((prim, i) => {
      const val = state.values[i];
      const angle = prim.startAngle;
      const len = baseR * (0.3 + val * 0.7);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
      ctx.strokeStyle = prim.color;
      ctx.lineWidth = 2 * dpr;
      ctx.globalAlpha = 0.4 + val * 0.4;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Axis end dot
      const ex = cx + Math.cos(angle) * len;
      const ey = cy + Math.sin(angle) * len;
      ctx.beginPath();
      ctx.arc(ex, ey, 4 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = prim.color;
      ctx.fill();

      // Axis label
      const lx = cx + Math.cos(angle) * (baseR + 20 * dpr);
      const ly = cy + Math.sin(angle) * (baseR + 20 * dpr);
      ctx.font = `${9 * dpr}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const shortName = ['FS', 'PR', 'TB', 'SL'][i];
      ctx.fillText(shortName, lx, ly);
    });

    // Draw lobe shapes (filled primitive areas)
    ctx.beginPath();
    PRIMS.forEach((prim, i) => {
      const val = state.values[i];
      const angle = prim.startAngle;
      const len = baseR * (0.3 + val * 0.7);
      const x = cx + Math.cos(angle) * len;
      const y = cy + Math.sin(angle) * len;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,229,255,0.03)';
    ctx.strokeStyle = 'rgba(0,229,255,0.08)';
    ctx.lineWidth = 1 * dpr;
    ctx.fill();
    ctx.stroke();

    // Draw 42 nodes on ring
    nodes.forEach((node, i) => {
      const prim = PRIMS[node.primIdx];
      const val = state.values[node.primIdx];
      const pulse = Math.sin(t * 2 + node.pulsePhase) * 0.05;
      const radial = baseR * (0.8 + val * 0.25 + node.jitter + pulse);

      const x = cx + Math.cos(node.angle) * radial;
      const y = cy + Math.sin(node.angle) * radial;

      // Node status color
      const normalized = (val - 0.5) * 2;
      let fillColor;
      if (normalized >= 0.2) fillColor = '#22c55e';
      else if (normalized >= -0.2) fillColor = '#eab308';
      else if (normalized >= -0.6) fillColor = '#f97316';
      else fillColor = '#ef4444';

      // Node dot
      const sz = (3 + Math.sin(t * 1.5 + i * 0.3) * 0.8) * dpr;
      ctx.beginPath();
      ctx.arc(x, y, sz, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.globalAlpha = 0.6 + val * 0.4;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Glow on critical/caution nodes
      if (normalized < -0.2) {
        ctx.beginPath();
        ctx.arc(x, y, sz * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.globalAlpha = 0.1;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    });

    // Draw arc segments per primitive
    PRIMS.forEach((prim, i) => {
      const val = state.values[i];
      let startA = -Math.PI / 2;
      for (let j = 0; j < i; j++) startA += (PRIMS[j].nodes / 42) * Math.PI * 2;
      const sweep = (prim.nodes / 42) * Math.PI * 2;

      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 1.08, startA, startA + sweep);
      ctx.strokeStyle = prim.color;
      ctx.lineWidth = 3 * dpr;
      ctx.globalAlpha = 0.15 + val * 0.45;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Center organism label
    ctx.font = `bold ${11 * dpr}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('4/42', cx, cy - 6 * dpr);
    ctx.font = `${8 * dpr}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillText('HYDROCORE', cx, cy + 8 * dpr);
  }
  draw();

  // Slider input handlers
  const sliders = document.querySelectorAll('#org-sliders input[type="range"]');
  const valLabels = document.querySelectorAll('#org-sliders .org-slider-val');
  const modeDisplay = document.getElementById('org-mode-display');
  const hashDisplay = document.getElementById('org-hash');

  function updateFromSliders() {
    sliders.forEach((slider, i) => {
      const raw = parseInt(slider.value);
      const normalized = (raw - 50) / 50; // → -1 to +1
      state.values[i] = raw / 100; // → 0 to 1
      valLabels[i].textContent = normalized >= 0 ? '+' + normalized.toFixed(2) : normalized.toFixed(2);
    });

    const mode = selectMode(state.values);
    if (modeDisplay) {
      modeDisplay.querySelector('.org-mode-name').textContent = mode.name + ' MODE';
      modeDisplay.querySelector('.org-mode-dot').style.background = mode.color;
    }
    if (hashDisplay) {
      hashDisplay.textContent = computeHash(state.values, mode.name);
    }
  }

  sliders.forEach(s => s.addEventListener('input', updateFromSliders));
  updateFromSliders();
})();
