/**
 * HydroCore.dev — 3D Engine Visualizations
 * Scene 1: Hero particle field
 * Scene 2: Bench engine with generator, power output, OrbitControls
 * DarkWave Studios LLC — Copyright 2026
 */

// ═══════════════════════════════════════════════════════════
// SCENE 1: HERO — Particle field with organism ring
// ═══════════════════════════════════════════════════════════
(function initHero() {
  try {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const scene = new THREE.Scene();
  const w = canvas.clientWidth || canvas.width || 800;
  const h = canvas.clientHeight || canvas.height || 500;
  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
  camera.position.set(0, 0, 30);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const pGeo = new THREE.BufferGeometry();
  const pCount = 2000;
  const positions = new Float32Array(pCount * 3);
  const colors = new Float32Array(pCount * 3);
  const palette = [[0.08,0.4,0.75],[0,0.41,0.36],[0,0.9,1],[0.37,0.49,0.55]];
  for (let i = 0; i < pCount; i++) {
    positions[i*3] = (Math.random()-0.5)*80;
    positions[i*3+1] = (Math.random()-0.5)*60;
    positions[i*3+2] = (Math.random()-0.5)*40;
    const c = palette[Math.floor(Math.random()*palette.length)];
    colors[i*3]=c[0]; colors[i*3+1]=c[1]; colors[i*3+2]=c[2];
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.15, vertexColors: true, transparent: true, opacity: 0.6 });
  scene.add(new THREE.Points(pGeo, pMat));

  const ringGeo = new THREE.TorusGeometry(8, 0.06, 16, 100);
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x00695C, transparent: true, opacity: 0.3 }));
  scene.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(6, 0.04, 16, 80), new THREE.MeshBasicMaterial({ color: 0x1565C0, transparent: true, opacity: 0.2 }));
  scene.add(ring2);

  for (let i = 0; i < 42; i++) {
    const a = (i / 42) * Math.PI * 2;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), new THREE.MeshBasicMaterial({ color: [0x1565C0,0x00695C,0xB71C1C,0x607D8B][Math.floor(i/10.5)] }));
    dot.position.set(Math.cos(a)*8, Math.sin(a)*8, 0);
    scene.add(dot);
  }

  function animate() {
    requestAnimationFrame(animate);
    const t = Date.now() * 0.0003;
    ring.rotation.z = t * 0.5;
    ring2.rotation.z = -t * 0.3;
    camera.position.x = Math.sin(t * 0.2) * 2;
    camera.position.y = Math.cos(t * 0.15) * 1.5;
    const pos = pGeo.attributes.position.array;
    for (let i = 0; i < pCount; i++) pos[i*3+1] += Math.sin(t + i * 0.01) * 0.003;
    pGeo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  }
  animate();
  window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });
  } catch(e) {
    console.error('[HydroCore] Hero scene error:', e);
    var p = canvas.parentElement; if(p) p.innerHTML = '<p style="color:#ef4444;padding:20px;text-align:center;font-size:13px">Hero: '+e.message+'</p>';
  }
})();

// ═══════════════════════════════════════════════════════════
// SCENE 2: BENCH ENGINE — with generator, power output, OrbitControls
// ═══════════════════════════════════════════════════════════
(function initEngine() {
  try {
  const canvas = document.getElementById('engine-canvas');
  if (!canvas) return;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x080c16, 0.025);
  const w = canvas.clientWidth || canvas.width || 800;
  const h = canvas.clientHeight || canvas.height || 500;
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
  camera.position.set(10, 8, 14);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x080c16);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Bloom post-processing
  var composer;
  try {
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    var bloom = new THREE.UnrealBloomPass(new THREE.Vector2(w, h), 0.6, 0.4, 0.85);
    composer.addPass(bloom);
  } catch(e) { composer = null; }

  // OrbitControls
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.target.set(1.5, 1.5, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.minDistance = 6;
  controls.maxDistance = 35;
  controls.maxPolarAngle = Math.PI * 0.85;

  // Lighting — 3-point cinematic setup
  const hemiLight = new THREE.HemisphereLight(0x4466aa, 0x111122, 0.6);
  scene.add(hemiLight);
  const keyLight = new THREE.DirectionalLight(0x88bbff, 1.2);
  keyLight.position.set(8, 12, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 30;
  keyLight.shadow.camera.left = -10;
  keyLight.shadow.camera.right = 10;
  keyLight.shadow.camera.top = 10;
  keyLight.shadow.camera.bottom = -5;
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0x00695C, 0.4);
  fillLight.position.set(-5, 6, -3);
  scene.add(fillLight);
  const rimLight = new THREE.PointLight(0x00E5FF, 0.8, 25);
  rimLight.position.set(-3, 4, 5);
  scene.add(rimLight);
  const pl = new THREE.PointLight(0x00695C, 1, 20);
  pl.position.set(-3, 3, 3);
  scene.add(pl);

  // Materials — premium PBR with emissive glow for bloom
  const matChamber = new THREE.MeshPhysicalMaterial({ color: 0x1a3a5c, metalness: 0.5, roughness: 0.25, transparent: true, opacity: 0.75, clearcoat: 0.3, clearcoatRoughness: 0.2 });
  const matMetal = new THREE.MeshPhysicalMaterial({ color: 0x6a7a8a, metalness: 0.85, roughness: 0.15, clearcoat: 0.5, clearcoatRoughness: 0.1 });
  const matValve = new THREE.MeshPhysicalMaterial({ color: 0x00897B, metalness: 0.6, roughness: 0.3, emissive: 0x004D40, emissiveIntensity: 0.6, clearcoat: 0.4 });
  const matPipe = new THREE.MeshPhysicalMaterial({ color: 0x37474F, metalness: 0.6, roughness: 0.35, clearcoat: 0.2 });
  const matReservoir = new THREE.MeshPhysicalMaterial({ color: 0x0D47A1, metalness: 0.3, roughness: 0.4, transparent: true, opacity: 0.65, clearcoat: 0.6, clearcoatRoughness: 0.15 });
  const matWater = new THREE.MeshPhysicalMaterial({ color: 0x1565C0, transparent: true, opacity: 0.5, emissive: 0x0D47A1, emissiveIntensity: 0.4, roughness: 0.1 });
  const matESP = new THREE.MeshPhysicalMaterial({ color: 0x2E7D32, metalness: 0.4, roughness: 0.4, emissive: 0x1B5E20, emissiveIntensity: 0.5, clearcoat: 0.3 });
  const matSensor = new THREE.MeshPhysicalMaterial({ color: 0xD32F2F, metalness: 0.6, roughness: 0.3, emissive: 0xB71C1C, emissiveIntensity: 0.8 });
  const matCopper = new THREE.MeshPhysicalMaterial({ color: 0xb87333, metalness: 0.9, roughness: 0.15, emissive: 0x5D4037, emissiveIntensity: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.1 });
  const matPower = new THREE.MeshPhysicalMaterial({ color: 0xFFC107, emissive: 0xFFB300, emissiveIntensity: 1.2, transparent: true, opacity: 0.85 });

  // ── RESERVOIR (left) ──
  const reservoir = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.5, 24), matReservoir);
  reservoir.position.set(-5, 1.25, 0);
  scene.add(reservoir);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 1.8, 24), matWater);
  water.position.set(-5, 1, 0);
  scene.add(water);
  addLabel3D(scene, -5, 3, 0, 'WATER\nRESERVOIR', 0x1565C0);

  // ── INLET PIPE ──
  const inletPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 4, 12), matPipe);
  inletPipe.rotation.z = Math.PI / 2;
  inletPipe.position.set(-2.5, 1.5, 0);
  scene.add(inletPipe);

  // ── VALVE V1 ──
  const v1Body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.6), matValve);
  v1Body.position.set(-1.5, 1.5, 0);
  scene.add(v1Body);
  scene.add(assignProps(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.5, 8), matMetal), {position: new THREE.Vector3(-1.5, 2.1, 0)}));
  addLabel3D(scene, -1.5, 2.8, 0, 'V1\nINLET', 0x00695C);

  // ── PRESSURE CHAMBER ──
  const chamber = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 5, 24, 1, true), matChamber);
  chamber.rotation.z = Math.PI / 2;
  chamber.position.set(1.5, 1.5, 0);
  scene.add(chamber);
  const chamberCap1 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 24, 12, 0, Math.PI), matMetal);
  chamberCap1.position.set(-0.9, 1.5, 0);
  chamberCap1.rotation.set(0, 0, Math.PI / 2);
  scene.add(chamberCap1);
  const chamberCap2 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 24, 12, 0, Math.PI), matMetal);
  chamberCap2.position.set(3.9, 1.5, 0);
  chamberCap2.rotation.set(0, 0, -Math.PI / 2);
  scene.add(chamberCap2);
  addLabel3D(scene, 1.5, 3.2, 0, 'PRESSURE\nCHAMBER', 0x1a3a5c);

  // Heat exchanger fins on chamber
  for (let i = 0; i < 8; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.2, 1.0), new THREE.MeshPhysicalMaterial({ color: 0x4a5a6a, metalness: 0.6, roughness: 0.3 }));
    fin.position.set(-0.5 + i * 0.6, 1.5, 0);
    scene.add(fin);
  }

  // ── TURBINE ──
  const turbine = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.08, 12, 16), matMetal);
  turbine.position.set(1.5, 1.5, 0);
  turbine.rotation.y = Math.PI / 2;
  scene.add(turbine);
  const blades = [];
  for (let i = 0; i < 8; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.02, 0.12), matMetal);
    const a = (i / 8) * Math.PI * 2;
    blade.position.set(1.5, 1.5 + Math.sin(a) * 0.3, Math.cos(a) * 0.3);
    blade.rotation.x = a;
    scene.add(blade);
    blades.push({ mesh: blade, angle: a });
  }
  addLabel3D(scene, 1.5, 0.3, 0, 'TURBINE\n100 Hz', 0x607D8B);

  // ── GENERATOR / DYNAMO (after turbine — the PURPOSE) ──
  const genBody = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.2, 16), matCopper);
  genBody.rotation.z = Math.PI / 2;
  genBody.position.set(5.5, 1.5, 0);
  scene.add(genBody);
  // Copper windings
  for (let i = 0; i < 5; i++) {
    const winding = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.03, 8, 20), matCopper);
    winding.position.set(5.0 + i * 0.25, 1.5, 0);
    winding.rotation.y = Math.PI / 2;
    scene.add(winding);
  }
  // Generator endcaps
  scene.add(assignProps(new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.08, 16), matMetal), {position: new THREE.Vector3(4.9, 1.5, 0), rotation: new THREE.Euler(0, 0, Math.PI/2)}));
  scene.add(assignProps(new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.08, 16), matMetal), {position: new THREE.Vector3(6.1, 1.5, 0), rotation: new THREE.Euler(0, 0, Math.PI/2)}));
  addLabel3D(scene, 5.5, 3, 0, 'GENERATOR\nOUTPUT: 2.4 kW', 0xFFC107);

  // ── VALVE V2 ──
  const v2 = v1Body.clone();
  v2.position.set(4.2, 1.5, 0);
  scene.add(v2);
  addLabel3D(scene, 4.2, 2.8, 0, 'V2\nOUTLET', 0x00695C);

  // Pipe chamber→V2→generator
  scene.add(assignProps(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8), matPipe), {position: new THREE.Vector3(4.85, 1.5, 0), rotation: new THREE.Euler(0, 0, Math.PI/2)}));

  // ── RELIEF VALVE V3 ──
  scene.add(assignProps(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.5, 8), new THREE.MeshPhysicalMaterial({ color: 0xB71C1C, metalness: 0.5, roughness: 0.3 })), {position: new THREE.Vector3(1.5, 2.5, 0)}));
  addLabel3D(scene, 1.5, 3.5, 0.8, 'V3 RELIEF', 0xB71C1C);

  // ── RETURN PIPE ──
  const retPipe1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.5, 8), matPipe);
  retPipe1.position.set(6.5, 0.75, 0);
  scene.add(retPipe1);
  const retPipe2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 12, 8), matPipe);
  retPipe2.rotation.z = Math.PI / 2;
  retPipe2.position.set(0.5, 0, 0);
  scene.add(retPipe2);
  const retPipe3 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8), matPipe);
  retPipe3.position.set(-5, 0.6, 0);
  scene.add(retPipe3);

  // ── SENSORS ──
  const addSensor = (x, y, z) => {
    scene.add(assignProps(new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), matSensor), {position: new THREE.Vector3(x, y, z)}));
    scene.add(assignProps(new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshBasicMaterial({ color: 0xB71C1C, transparent: true, opacity: 0.12 })), {position: new THREE.Vector3(x, y, z)}));
  };
  addSensor(-0.5, 1.8, 0.8);
  addSensor(3.5, 1.8, 0.8);
  addSensor(-0.8, 1.5, -0.8);
  addSensor(3.8, 1.5, -0.8);
  addSensor(1.5, 2.3, 0.7);
  addSensor(1.5, 0.7, 0.7);

  // ── ESP32 ──
  const esp = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.15, 1.0), matESP);
  esp.position.set(1.5, -0.8, 2.5);
  scene.add(esp);
  scene.add(assignProps(new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.35), new THREE.MeshBasicMaterial({ color: 0x111111 })), {position: new THREE.Vector3(1.5, -0.72, 2.5)}));
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
  led.position.set(2.0, -0.7, 2.9);
  scene.add(led);
  addLabel3D(scene, 1.5, -1.5, 2.5, 'ESP32-S3\nCONTROLLER', 0x22c55e);

  // ── POWER OUTPUT CABLE ──
  const cablePoints = [
    new THREE.Vector3(6.1, 1.5, 0),
    new THREE.Vector3(6.5, 1.0, 0.5),
    new THREE.Vector3(5.0, 0, 1.5),
    new THREE.Vector3(2.5, -0.6, 2.5),
    new THREE.Vector3(1.5, -0.8, 2.5),
  ];
  const cableCurve = new THREE.CatmullRomCurve3(cablePoints);
  const cableGeo = new THREE.TubeGeometry(cableCurve, 30, 0.04, 8, false);
  scene.add(new THREE.Mesh(cableGeo, new THREE.MeshBasicMaterial({ color: 0xFFC107, transparent: true, opacity: 0.6 })));

  // Wires from sensors to ESP
  const wireMat = new THREE.LineBasicMaterial({ color: 0x00695C, transparent: true, opacity: 0.3 });
  [[-0.5,1.8,0.8],[3.5,1.8,0.8],[1.5,0.7,0.7]].forEach(p => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...p), new THREE.Vector3(p[0],p[1]-0.3,p[2]+0.5), new THREE.Vector3(1.5,-0.5,2.5), new THREE.Vector3(1.5,-0.8,2.5)]);
    scene.add(new THREE.Line(g, wireMat));
  });

  // ── BASE PLATFORM ──
  scene.add(assignProps(new THREE.Mesh(new THREE.BoxGeometry(15, 0.1, 7), new THREE.MeshPhysicalMaterial({ color: 0x1a1a2a, metalness: 0.3, roughness: 0.7 })), {position: new THREE.Vector3(0.5, -1, 0.5)}));

  // ── FLOW PARTICLES ──
  const flowParticles = [];
  const fpMat = new THREE.MeshBasicMaterial({ color: 0x1565C0, transparent: true, opacity: 0.8 });
  for (let i = 0; i < 25; i++) {
    const fp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), fpMat);
    fp.userData.t = Math.random();
    fp.userData.speed = 0.003 + Math.random() * 0.003;
    flowParticles.push(fp);
    scene.add(fp);
  }

  // ── ELECTRICITY PARTICLES (generator → ESP) ──
  const sparkParts = [];
  for (let i = 0; i < 15; i++) {
    const sp = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), matPower);
    sp.userData.t = Math.random();
    sp.userData.speed = 0.008 + Math.random() * 0.008;
    sparkParts.push(sp);
    scene.add(sp);
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    const t = Date.now() * 0.001;

    // Turbine + blades spin
    turbine.rotation.x = t * 3;
    blades.forEach(b => {
      const a = b.angle + t * 3;
      b.mesh.position.set(1.5, 1.5 + Math.sin(a) * 0.3, Math.cos(a) * 0.3);
      b.mesh.rotation.x = a;
    });

    // Water flow
    for (const fp of flowParticles) {
      fp.userData.t += fp.userData.speed;
      if (fp.userData.t > 1) fp.userData.t = 0;
      const p = fp.userData.t;
      if (p < 0.3) {
        fp.position.set(-5 + p * 12, 1.5, (Math.random()-0.5)*0.15);
      } else if (p < 0.65) {
        const cp = (p - 0.3) / 0.35;
        fp.position.set(-0.9 + cp * 4.8, 1.5 + Math.sin(cp*Math.PI*4)*0.12, (Math.random()-0.5)*0.2);
      } else {
        const rp = (p - 0.65) / 0.35;
        fp.position.set(6.5 - rp * 11.5, rp < 0.15 ? 1.5 - rp*10 : 0, (Math.random()-0.5)*0.15);
      }
    }

    // Electricity sparks along cable
    for (const sp of sparkParts) {
      sp.userData.t += sp.userData.speed;
      if (sp.userData.t > 1) sp.userData.t = 0;
      const pt = cableCurve.getPoint(sp.userData.t);
      sp.position.copy(pt);
      sp.position.x += (Math.random()-0.5)*0.06;
      sp.position.y += (Math.random()-0.5)*0.06;
      sp.material.opacity = 0.4 + Math.sin(sp.userData.t * Math.PI) * 0.5;
    }

    led.material.color.setHSL(0.35, 1, 0.4 + Math.sin(t*4)*0.2);
    pl.intensity = 0.8 + Math.sin(t*2)*0.3;
    rimLight.intensity = 0.5 + Math.sin(t*1.5)*0.3;
    if (composer) composer.render(); else renderer.render(scene, camera);
  }
  animate();
  window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });
  } catch(e) {
    console.error('[HydroCore] Engine scene error:', e);
    var v = document.querySelector('.engine-viewer'); if(v) v.innerHTML = '<p style="color:#ef4444;padding:20px;text-align:center;font-size:13px">Engine: '+e.message+'</p>';
  }
})();

// ═══════════════════════════════════════════════════════════
// HELPER: Better 3D labels using sprites
// ═══════════════════════════════════════════════════════════
function addLabel3D(scene, x, y, z, text, color) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  const hex = '#' + color.toString(16).padStart(6, '0');

  // Rounded rect — manual path for cross-browser compatibility
  function roundedRect(ctx, rx, ry, rw, rh, r) {
    ctx.beginPath();
    ctx.moveTo(rx + r, ry);
    ctx.lineTo(rx + rw - r, ry);
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
    ctx.lineTo(rx + rw, ry + rh - r);
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
    ctx.lineTo(rx + r, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
    ctx.lineTo(rx, ry + r);
    ctx.quadraticCurveTo(rx, ry, rx + r, ry);
    ctx.closePath();
  }

  // Background pill
  ctx.fillStyle = 'rgba(8,12,22,0.7)';
  roundedRect(ctx, 10, 10, 492, 108, 12);
  ctx.fill();
  ctx.strokeStyle = hex;
  ctx.lineWidth = 2;
  roundedRect(ctx, 10, 10, 492, 108, 12);
  ctx.stroke();

  ctx.fillStyle = hex;
  ctx.font = 'bold 28px Inter, sans-serif';
  ctx.textAlign = 'center';
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    ctx.fillText(line, 256, 50 + i * 34);
  });

  const tex = new THREE.CanvasTexture(c);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.85 }));
  sprite.position.set(x, y, z);
  sprite.scale.set(4, 1, 1);
  scene.add(sprite);
}
