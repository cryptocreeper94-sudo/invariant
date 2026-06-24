/* ═══ VERDARA ULTRA — UI RENDERER ═══ */

// ── Canvas Ring Renderer ──
const canvas = document.getElementById('ring-canvas');
const ctx = canvas.getContext('2d');
let ringW, ringH, cx, cy, ringR, nodeR;

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  ringW = rect.width; ringH = rect.height;
  canvas.width = ringW * dpr; canvas.height = ringH * dpr;
  canvas.style.width = ringW + 'px'; canvas.style.height = ringH + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx = ringW / 2; cy = ringH / 2;
  ringR = Math.min(cx, cy) * 0.72;
  nodeR = Math.min(14, ringR * 0.06);
}

function nodePos(i) {
  const angle = (i / 42) * Math.PI * 2 - Math.PI / 2;
  return { x: cx + ringR * Math.cos(angle), y: cy + ringR * Math.sin(angle), angle };
}

function drawRing() {
  ctx.clearRect(0, 0, ringW, ringH);
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  // Orbit rings
  [0.4, 0.6, 0.8, 1.0].forEach(s => {
    ctx.beginPath();
    ctx.arc(cx, cy, ringR * s, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Flow sector arcs
  const sectors = [
    { start: 0, count: 10, color: FLOWS.terrain.color },
    { start: 10, count: 10, color: FLOWS.weather.color },
    { start: 20, count: 11, color: FLOWS.enviro.color },
    { start: 31, count: 11, color: FLOWS.bio.color },
  ];

  sectors.forEach(s => {
    const a1 = (s.start / 42) * Math.PI * 2 - Math.PI / 2;
    const a2 = ((s.start + s.count) / 42) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR + nodeR + 8, a1, a2);
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.25;
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  // Connection lines to center
  NODES.forEach((n, i) => {
    const p = nodePos(i);
    const val = state.nodes[n.id];
    const status = getStatus(val);
    const col = getStatusColor(status);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = col;
    ctx.globalAlpha = state.selected === n.id ? 0.5 : 0.06;
    ctx.lineWidth = state.selected === n.id ? 2 : 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  // Nodes
  NODES.forEach((n, i) => {
    const p = nodePos(i);
    const val = state.nodes[n.id];
    const status = getStatus(val);
    const col = getStatusColor(status);
    const flowCol = FLOWS[n.flow].color;
    const isSel = state.selected === n.id;
    const r = isSel ? nodeR * 1.4 : nodeR;

    // Glow
    if (status === 'critical' || isSel) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 6, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.15 + Math.sin(state.tick * 0.1) * 0.05;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Node circle
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? 'rgba(10,18,16,0.9)' : 'rgba(255,255,255,0.9)';
    ctx.fill();
    ctx.strokeStyle = isSel ? '#fff' : col;
    ctx.lineWidth = isSel ? 2.5 : 1.5;
    ctx.stroke();

    // Inner fill based on value
    const fillR = r * Math.max(0.15, (val + 1) / 2);
    ctx.beginPath();
    ctx.arc(p.x, p.y, fillR, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.4;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Label
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(26,46,40,0.5)';
    ctx.font = `${isSel ? 'bold ' : ''}${isSel ? 9 : 7}px Inter`;
    ctx.textAlign = 'center';
    ctx.fillText(n.id, p.x, p.y + r + 12);
  });

  // Center core
  const eq = equilibrium();
  const eqCol = getStatusColor(getStatus(eq));
  ctx.beginPath();
  ctx.arc(cx, cy, 32, 0, Math.PI * 2);
  ctx.fillStyle = isDark ? 'rgba(10,18,16,0.8)' : 'rgba(255,255,255,0.8)';
  ctx.fill();
  ctx.strokeStyle = eqCol;
  ctx.lineWidth = 2;
  ctx.stroke();

  // 4-axis pressure lines
  const axes = ['terrain','weather','enviro','bio'];
  axes.forEach((f, i) => {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
    const p = flowPressure(f);
    const len = 28 * Math.max(0, (p + 1) / 2);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + len * Math.cos(a), cy + len * Math.sin(a));
    ctx.strokeStyle = FLOWS[f].color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7;
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
}

// ── Click Detection ──
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  let clicked = null;
  NODES.forEach((n, i) => {
    const p = nodePos(i);
    const dx = mx - p.x, dy = my - p.y;
    if (dx * dx + dy * dy < (nodeR + 6) * (nodeR + 6)) clicked = n.id;
  });
  state.selected = clicked;
  updateInspector();
});

// ── Inspector ──
function updateInspector() {
  const empty = document.getElementById('inspector-empty');
  const content = document.getElementById('inspector-content');
  if (!state.selected) {
    empty.style.display = 'flex'; content.style.display = 'none'; return;
  }
  empty.style.display = 'none'; content.style.display = 'block';
  const node = NODES.find(n => n.id === state.selected);
  const val = state.nodes[node.id];
  const status = getStatus(val);
  const col = getStatusColor(status);
  const flowCol = FLOWS[node.flow].color;

  document.getElementById('insp-icon').textContent = node.id;
  document.getElementById('insp-icon').style.background = FLOWS[node.flow].glow;
  document.getElementById('insp-icon').style.color = FLOWS[node.flow].color;
  document.getElementById('insp-icon').style.fontFamily = 'var(--font-mono)';
  document.getElementById('insp-icon').style.fontSize = '12px';
  document.getElementById('insp-icon').style.fontWeight = '800';
  document.getElementById('insp-name').textContent = `${node.id} — ${node.name}`;
  document.getElementById('insp-flow').textContent = FLOWS[node.flow].label;
  document.getElementById('insp-flow').style.color = flowCol;
  document.getElementById('insp-value').textContent = (val >= 0 ? '+' : '') + val.toFixed(3);
  document.getElementById('insp-value').style.color = col;

  const gauge = document.getElementById('insp-gauge');
  const pct = ((val + 1) / 2) * 100;
  gauge.style.width = pct + '%';
  gauge.style.background = `linear-gradient(90deg, ${col}, ${flowCol})`;

  document.getElementById('insp-advisory').textContent = node.advisory;
  document.getElementById('insp-caution').textContent = node.caution;
  document.getElementById('insp-critical').textContent = node.critical;

  const statusEl = document.getElementById('insp-status');
  statusEl.textContent = status.toUpperCase();
  statusEl.style.background = col + '18';
  statusEl.style.color = col;

  drawSparkline();
}

function drawSparkline() {
  if (!state.selected) return;
  const c = document.getElementById('insp-sparkline');
  const sctx = c.getContext('2d');
  const w = c.offsetWidth; const h = 48;
  c.width = w * 2; c.height = h * 2;
  c.style.width = w + 'px'; c.style.height = h + 'px';
  sctx.setTransform(2, 0, 0, 2, 0, 0);
  sctx.clearRect(0, 0, w, h);

  const hist = state.history[state.selected] || [];
  if (hist.length < 2) return;
  const node = NODES.find(n => n.id === state.selected);
  const col = FLOWS[node.flow].color;

  sctx.beginPath();
  hist.forEach((v, i) => {
    const x = (i / (hist.length - 1)) * w;
    const y = h - ((v + 1) / 2) * h;
    i === 0 ? sctx.moveTo(x, y) : sctx.lineTo(x, y);
  });
  sctx.strokeStyle = col;
  sctx.lineWidth = 1.5;
  sctx.stroke();

  // Fill under
  sctx.lineTo(w, h);
  sctx.lineTo(0, h);
  sctx.closePath();
  sctx.fillStyle = col + '15';
  sctx.fill();
}

// ── Flow Dashboard ──
function updateDashboard() {
  ['terrain','weather','enviro','bio'].forEach(f => {
    const p = flowPressure(f);
    const s = flowStatus(f);
    document.getElementById(f + '-pressure').textContent = (p >= 0 ? '+' : '') + p.toFixed(2);
    const statusEl = document.getElementById(f + '-status');
    statusEl.textContent = s.toUpperCase();
    statusEl.className = 'flow-status status-' + s;

    const container = document.getElementById(f + '-nodes');
    const flowNodes = NODES.filter(n => n.flow === f);
    container.innerHTML = flowNodes.map(n => {
      const v = state.nodes[n.id];
      const ns = getStatus(v);
      const c = getStatusColor(ns);
      return `<div class="flow-node-row">
        <span class="flow-node-name">${n.id} ${n.name}</span>
        <span class="flow-node-val" style="color:${c}">${v >= 0 ? '+' : ''}${v.toFixed(2)}</span>
      </div>`;
    }).join('');
  });
}

// ── Equilibrium Display ──
function updateEquilibrium() {
  const eq = equilibrium();
  const s = getStatus(eq);
  const c = getStatusColor(s);
  document.getElementById('ring-score').textContent = (eq >= 0 ? '+' : '') + eq.toFixed(2);
  document.getElementById('ring-score').style.color = c;
  document.getElementById('eq-score').textContent = `EQUILIBRIUM: ${eq >= 0 ? '+' : ''}${eq.toFixed(2)}`;
  document.getElementById('eq-dot').style.background = c;
}

// ── Routing ──
document.getElementById('btn-route').addEventListener('click', () => {
  const r = computeRoute();
  document.getElementById('score-risk').textContent = r.risk;
  document.getElementById('score-effort').textContent = r.effort;
  document.getElementById('score-progress').textContent = r.progress;
  document.getElementById('score-resilience').textContent = r.resilience;
  const wEl = document.getElementById('route-warnings');
  if (r.warnings.length === 0) {
    wEl.innerHTML = '<strong style="color:var(--nominal)">✓ ALL CLEAR</strong> — No constraints violated. Route is deterministically safe.';
  } else {
    wEl.innerHTML = r.warnings.slice(0, 6).map(w => `<div style="margin-bottom:4px">${w}</div>`).join('') +
      (r.warnings.length > 6 ? `<div style="color:var(--text-muted);margin-top:6px">+${r.warnings.length - 6} more warnings</div>` : '');
  }
});

// ── Scenarios ──
function renderScenarios() {
  const grid = document.getElementById('scenario-grid');
  grid.innerHTML = SCENARIOS.map(s => `
    <div class="scenario-card" data-id="${s.id}" id="sc-${s.id}">
      <img class="scenario-img" src="${s.img}" alt="${s.name}">
      <div class="scenario-info">
        <div class="scenario-name">${s.name}</div>
        <div class="scenario-desc">${s.desc}</div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.scenario-card').forEach(card => {
    card.addEventListener('click', () => {
      state.scenario = card.dataset.id;
      grid.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      document.getElementById('btn-scenario').disabled = false;
      document.getElementById('scenario-status').textContent = `Selected: ${SCENARIOS.find(s => s.id === state.scenario).name}`;
    });
  });
}

document.getElementById('btn-scenario').addEventListener('click', () => {
  if (!state.scenario) return;
  const sc = SCENARIOS.find(s => s.id === state.scenario);
  applyScenario(state.scenario);
  document.getElementById('scenario-status').textContent = `\u25b6 Running: ${sc.name} \u2014 engine adapting...`;
  setTimeout(() => {
    document.getElementById('scenario-status').textContent = `\u2713 ${sc.name} applied \u2014 observe the ring`;
  }, 800);
});

// ── Theme Toggle ──
document.getElementById('theme-toggle').addEventListener('click', () => {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  document.getElementById('theme-toggle').textContent = next === 'dark' ? '\u263D' : '\u2600';
});

// ── Main Loop ──
function frame() {
  tickState();
  drawRing();
  updateEquilibrium();
  if (state.selected) updateInspector();
  if (state.tick % 10 === 0) updateDashboard();
}

// ── Init ──
window.addEventListener('resize', () => { resizeCanvas(); drawRing(); });
initState();
resizeCanvas();
renderScenarios();
updateDashboard();
updateEquilibrium();
drawRing();
setInterval(frame, 500);
