/* ═══ VERDARA ULTRA — ORGANISM ENGINE ═══ */

const FLOWS = {
  terrain: { color: '#10b981', glow: 'rgba(16,185,129,0.25)', label: 'Terrain Flow' },
  weather: { color: '#06b6d4', glow: 'rgba(6,182,212,0.25)', label: 'Weather Flow' },
  enviro:  { color: '#f59e0b', glow: 'rgba(245,158,11,0.25)', label: 'Environmental Flow' },
  bio:     { color: '#f43f5e', glow: 'rgba(244,63,94,0.25)', label: 'Biological Flow' }
};

const NODES = [
  // Terrain T1-T10
  { id:'T1',  flow:'terrain', name:'Elevation',           advisory:'10k ft', caution:'12k ft', critical:'14k ft' },
  { id:'T2',  flow:'terrain', name:'Slope/Grade',         advisory:'15%',    caution:'25%',    critical:'35%' },
  { id:'T3',  flow:'terrain', name:'Terrain Type',        advisory:'gravel', caution:'scree',  critical:'ice' },
  { id:'T4',  flow:'terrain', name:'Surface Stability',   advisory:'moderate',caution:'low',   critical:'collapse' },
  { id:'T5',  flow:'terrain', name:'Technicality',        advisory:'Class 2',caution:'Class 3',critical:'Class 4-5' },
  { id:'T6',  flow:'terrain', name:'Trail Quality',       advisory:'faint', caution:'intermittent',critical:'off-trail' },
  { id:'T7',  flow:'terrain', name:'Obstacle Density',    advisory:'moderate',caution:'high',  critical:'impassable' },
  { id:'T8',  flow:'terrain', name:'Traction Quality',    advisory:'reduced',caution:'poor',   critical:'none' },
  { id:'T9',  flow:'terrain', name:'Water Crossing',      advisory:'ankle', caution:'knee',    critical:'waist+' },
  { id:'T10', flow:'terrain', name:'Route Ambiguity',     advisory:'2-3',   caution:'4-5',     critical:'>5' },
  // Weather W1-W10
  { id:'W1',  flow:'weather', name:'Temperature',         advisory:'<40/>80°F',caution:'<32/>90°F',critical:'<20/>100°F' },
  { id:'W2',  flow:'weather', name:'Wind Speed',          advisory:'15 mph', caution:'25 mph', critical:'40 mph' },
  { id:'W3',  flow:'weather', name:'Wind Direction',      advisory:'headwind',caution:'crosswind',critical:'gusting' },
  { id:'W4',  flow:'weather', name:'Precipitation Type',  advisory:'light', caution:'heavy',   critical:'hail/whiteout' },
  { id:'W5',  flow:'weather', name:'Precip Intensity',    advisory:'moderate',caution:'heavy',  critical:'extreme' },
  { id:'W6',  flow:'weather', name:'Storm Proximity',     advisory:'10 mi', caution:'5 mi',    critical:'2 mi' },
  { id:'W7',  flow:'weather', name:'Lightning Risk',      advisory:'elevated',caution:'high',   critical:'imminent' },
  { id:'W8',  flow:'weather', name:'Thermal Load',        advisory:'moderate',caution:'high',   critical:'extreme' },
  { id:'W9',  flow:'weather', name:'Weather Volatility',  advisory:'unstable',caution:'rapid',  critical:'chaotic' },
  { id:'W10', flow:'weather', name:'Safe Window',         advisory:'<2h',   caution:'<1h',     critical:'<30m' },
  // Environmental E1-E11
  { id:'E1',  flow:'enviro', name:'Humidity',             advisory:'70%',   caution:'85%',     critical:'95%' },
  { id:'E2',  flow:'enviro', name:'Dew Point',            advisory:'10°F Δ',caution:'5°F Δ',   critical:'= temp' },
  { id:'E3',  flow:'enviro', name:'Fog/Cloud',            advisory:'patchy',caution:'dense',   critical:'whiteout' },
  { id:'E4',  flow:'enviro', name:'Visibility',           advisory:'500m',  caution:'200m',    critical:'50m' },
  { id:'E5',  flow:'enviro', name:'Sunlight Intensity',   advisory:'low',   caution:'very low',critical:'dark' },
  { id:'E6',  flow:'enviro', name:'UV Index',             advisory:'6',     caution:'8',       critical:'10' },
  { id:'E7',  flow:'enviro', name:'Air Quality',          advisory:'AQI 75',caution:'AQI 125', critical:'AQI 175' },
  { id:'E8',  flow:'enviro', name:'Pressure Trend',       advisory:'falling',caution:'rapid',   critical:'collapse' },
  { id:'E9',  flow:'enviro', name:'Day/Night Phase',      advisory:'dusk',  caution:'twilight', critical:'night' },
  { id:'E10', flow:'enviro', name:'Light Pollution',      advisory:'moderate',caution:'low',    critical:'none' },
  { id:'E11', flow:'enviro', name:'Sensory Clarity',      advisory:'reduced',caution:'poor',    critical:'extreme poor' },
  // Biological B1-B11
  { id:'B1',  flow:'bio', name:'Wildlife Density',        advisory:'moderate',caution:'high',   critical:'very high' },
  { id:'B2',  flow:'bio', name:'Wildlife Risk',           advisory:'possible',caution:'likely',  critical:'confirmed' },
  { id:'B3',  flow:'bio', name:'Insect Density',          advisory:'moderate',caution:'heavy',   critical:'extreme' },
  { id:'B4',  flow:'bio', name:'Pathogen Risk',           advisory:'suspected',caution:'likely',  critical:'confirmed' },
  { id:'B5',  flow:'bio', name:'Vegetation Density',      advisory:'moderate',caution:'heavy',   critical:'impassable' },
  { id:'B6',  flow:'bio', name:'Edible Resources',        advisory:'scarce', caution:'very scarce',critical:'none' },
  { id:'B7',  flow:'bio', name:'Water Availability',      advisory:'3 mi',  caution:'6 mi',    critical:'10 mi' },
  { id:'B8',  flow:'bio', name:'Allergen Load',           advisory:'moderate',caution:'high',   critical:'extreme' },
  { id:'B9',  flow:'bio', name:'Human Density',           advisory:'moderate',caution:'high',   critical:'very high' },
  { id:'B10', flow:'bio', name:'Land Use Constraints',    advisory:'advisory',caution:'restricted',critical:'illegal' },
  { id:'B11', flow:'bio', name:'Rescue Accessibility',    advisory:'2h',    caution:'4h',      critical:'8h' },
];

const SCENARIOS = [
  { id:'alpine', img:'img/sc-alpine.jpg', name:'Alpine Storm', desc:'W6/W7 escalating, steep terrain, scarce water',
    overrides: { W6:-0.6, W7:-0.8, W9:-0.3, T2:-0.5, T5:-0.4, B7:-0.7, E8:-0.6, W2:-0.5 }},
  { id:'desert', img:'img/sc-desert.jpg', name:'Desert Crossing', desc:'Extreme heat, high UV, critical water',
    overrides: { W1:-0.7, W8:-0.9, E6:-0.8, B7:-1.0, E1:-0.2, B6:-0.8, E4:0.9, T6:-0.3 }},
  { id:'forest', img:'img/sc-forest.jpg', name:'Night Forest', desc:'Low visibility, wildlife active, off-trail',
    overrides: { E9:-0.7, E4:-0.6, E5:-0.8, B1:-0.5, B2:-0.4, T6:-0.6, E10:0.8, B3:-0.4 }},
  { id:'flood', img:'img/sc-flood.jpg', name:'River Flood', desc:'Extreme water crossings, heavy rain',
    overrides: { T9:-0.9, W4:-0.7, W5:-0.8, T4:-0.6, T8:-0.7, E3:-0.5, B7:0.9, E8:-0.5 }},
  { id:'ridge', img:'img/sc-ridge.jpg', name:'High Ridge', desc:'14k+ altitude, Class 4, 40mph winds',
    overrides: { T1:-0.8, T5:-0.7, W2:-0.9, T2:-0.6, W8:-0.4, E1:-0.3, B11:-0.6, W9:-0.5 }},
];

// State model
const state = { nodes: {}, history: {}, selected: null, scenario: null, tick: 0 };

function initState() {
  NODES.forEach(n => {
    state.nodes[n.id] = 0.5 + Math.random() * 0.5; // start nominal
    state.history[n.id] = [];
  });
}

function getStatus(val) {
  if (val >= 0.3) return 'nominal';
  if (val >= -0.1) return 'advisory';
  if (val >= -0.5) return 'caution';
  return 'critical';
}

function getStatusColor(status) {
  return { nominal:'#10b981', advisory:'#f59e0b', caution:'#f97316', critical:'#ef4444' }[status];
}

function flowPressure(flowId) {
  const flowNodes = NODES.filter(n => n.flow === flowId);
  const sum = flowNodes.reduce((s, n) => s + state.nodes[n.id], 0);
  return sum / flowNodes.length;
}

function flowStatus(flowId) {
  const p = flowPressure(flowId);
  return getStatus(p);
}

function equilibrium() {
  const all = Object.values(state.nodes);
  return all.reduce((s, v) => s + v, 0) / all.length;
}

function applyScenario(scenarioId) {
  // Reset all nodes to nominal first
  NODES.forEach(n => { state.nodes[n.id] = 0.5 + Math.random() * 0.3; });
  const sc = SCENARIOS.find(s => s.id === scenarioId);
  if (!sc) return;
  Object.entries(sc.overrides).forEach(([id, val]) => {
    if (state.nodes[id] !== undefined) state.nodes[id] = val;
  });
}

function tickState() {
  state.tick++;
  NODES.forEach(n => {
    // Add small drift
    const drift = (Math.random() - 0.5) * 0.04;
    state.nodes[n.id] = Math.max(-1, Math.min(1, state.nodes[n.id] + drift));
    state.history[n.id].push(state.nodes[n.id]);
    if (state.history[n.id].length > 30) state.history[n.id].shift();
  });
}

function computeRoute() {
  const risk = Math.max(0, 1 + Math.min(flowPressure('terrain'), flowPressure('weather')));
  const effort = Math.max(0, 1 - Math.abs(flowPressure('terrain')) * 0.5);
  const progress = Math.max(0, (1 + equilibrium()) / 2);
  const resilience = Math.max(0, (1 + Math.min(flowPressure('bio'), flowPressure('enviro'))) / 2);
  const warnings = [];
  NODES.forEach(n => {
    const s = getStatus(state.nodes[n.id]);
    if (s === 'critical') warnings.push(`[CRITICAL] ${n.name} — halt/reroute`);
    else if (s === 'caution') warnings.push(`[CAUTION] ${n.name} — monitor closely`);
  });
  return { risk: risk.toFixed(2), effort: effort.toFixed(2), progress: progress.toFixed(2), resilience: resilience.toFixed(2), warnings };
}
