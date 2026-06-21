/**
 * HydroCore.dev — Steam Turbine Power Plant 3D Scene
 * Cross-section industrial steam cycle with organism governance ring
 * DarkWave Studios LLC — Copyright 2026
 */

(function initSteam() {
  try {
  const canvas = document.getElementById('steam-canvas');
  if (!canvas) return;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06091a, 0.008);
  const w = canvas.clientWidth || canvas.width || 800;
  const h = canvas.clientHeight || canvas.height || 500;
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200);
  camera.position.set(16, 12, 22);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x06091a);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.8;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Bloom
  var sComposer;
  try {
    sComposer = new THREE.EffectComposer(renderer);
    sComposer.addPass(new THREE.RenderPass(scene, camera));
    sComposer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(w, h), 0.7, 0.3, 0.8));
  } catch(e) { sComposer = null; }

  // OrbitControls
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.target.set(0, 3, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;
  controls.minDistance = 10;
  controls.maxDistance = 45;

  // Cinematic lighting — bright enough to see all components
  scene.add(new THREE.AmbientLight(0x223344, 0.5));
  scene.add(new THREE.HemisphereLight(0x6688bb, 0x222233, 0.8));
  const keyLight = new THREE.DirectionalLight(0xaaccff, 1.4);
  keyLight.position.set(10, 15, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  scene.add(keyLight);
  var fl = new THREE.DirectionalLight(0xFF6633, 0.5);
  fl.position.set(-12, 8, -5);
  scene.add(fl);
  var fl2 = new THREE.DirectionalLight(0x88aadd, 0.6);
  fl2.position.set(8, 6, 12);
  scene.add(fl2);
  var rimL = new THREE.PointLight(0x00E5FF, 0.8, 45);
  rimL.position.set(-6, 6, 10);
  scene.add(rimL);
  var boilerLight = new THREE.PointLight(0xFF6633, 0.8, 12);
  boilerLight.position.set(-8, 5, 2);
  scene.add(boilerLight);
  var genLight = new THREE.PointLight(0xFFC107, 0.6, 12);
  genLight.position.set(8.5, 5, 2);
  scene.add(genLight);

  // ── MATERIALS ──
  var matBoiler = new THREE.MeshPhysicalMaterial({ color: 0xBB2222, metalness: 0.7, roughness: 0.3, emissive: 0x661111, emissiveIntensity: 0.8, clearcoat: 0.3 });
  var matHeat = new THREE.MeshBasicMaterial({ color: 0xFF6633, transparent: true, opacity: 0.7 });
  var matSuperheater = new THREE.MeshPhysicalMaterial({ color: 0xEE5522, metalness: 0.6, roughness: 0.25, emissive: 0xDD4411, emissiveIntensity: 1.0, clearcoat: 0.4 });
  var matTurbine = new THREE.MeshPhysicalMaterial({ color: 0x7899AA, metalness: 0.85, roughness: 0.12, emissive: 0x334455, emissiveIntensity: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.05 });
  var matBlade = new THREE.MeshPhysicalMaterial({ color: 0x90A4AE, metalness: 0.9, roughness: 0.08, emissive: 0x445566, emissiveIntensity: 0.2, clearcoat: 1.0 });
  var matGen = new THREE.MeshPhysicalMaterial({ color: 0xD4944A, metalness: 0.85, roughness: 0.15, emissive: 0x8B6914, emissiveIntensity: 0.7, clearcoat: 0.6 });
  var matCond = new THREE.MeshPhysicalMaterial({ color: 0x2288DD, metalness: 0.5, roughness: 0.3, transparent: true, opacity: 0.75, emissive: 0x1166BB, emissiveIntensity: 0.5 });
  var matPump = new THREE.MeshPhysicalMaterial({ color: 0x00AA88, metalness: 0.7, roughness: 0.25, emissive: 0x006644, emissiveIntensity: 0.6, clearcoat: 0.4 });
  var matPipe = new THREE.MeshPhysicalMaterial({ color: 0x556677, metalness: 0.6, roughness: 0.3, emissive: 0x223344, emissiveIntensity: 0.2, clearcoat: 0.3 });
  var matFrame = new THREE.MeshPhysicalMaterial({ color: 0x3D5060, metalness: 0.8, roughness: 0.2, emissive: 0x1A2833, emissiveIntensity: 0.3, clearcoat: 0.5 });
  var matSteam = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
  var matWater = new THREE.MeshBasicMaterial({ color: 0x1565C0, transparent: true, opacity: 0.8 });
  var matPower = new THREE.MeshBasicMaterial({ color: 0xFFC107, transparent: true, opacity: 0.8 });

  // ══════════════════════════════════════════
  // BOILER / STEAM GENERATOR (left side)
  // ══════════════════════════════════════════
  var boilerBody = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 5, 24), matBoiler);
  boilerBody.position.set(-8, 3.5, 0);
  scene.add(boilerBody);
  // Heat source glow inside
  var heatCore = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), matHeat);
  heatCore.position.set(-8, 2.5, 0);
  scene.add(heatCore);
  var heatGlow = new THREE.PointLight(0xFF4500, 1.5, 8);
  heatGlow.position.set(-8, 2.5, 0);
  scene.add(heatGlow);
  // Boiler cap
  scene.add(assignProps(new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.85, 0.15, 24), matFrame), {position: new THREE.Vector3(-8, 6.1, 0)}));
  scene.add(assignProps(new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.85, 0.15, 24), matFrame), {position: new THREE.Vector3(-8, 0.95, 0)}));
  addLabel3D(scene, -8, 7.2, 0, 'BOILER\nSTEAM GENERATOR', 0xB71C1C);

  // ══════════════════════════════════════════
  // SUPERHEATER (above boiler)
  // ══════════════════════════════════════════
  var superheater = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 2.5), matSuperheater);
  superheater.position.set(-5, 5.5, 0);
  scene.add(superheater);
  // Tube banks
  for (var ti = 0; ti < 6; ti++) {
    var tube = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.3, 8), matSuperheater);
    tube.position.set(-5, 5.5, -1 + ti * 0.4);
    tube.rotation.z = Math.PI / 2;
    scene.add(tube);
  }
  addLabel3D(scene, -5, 7, 0, 'SUPERHEATER\n700°C', 0xD84315);

  // ══════════════════════════════════════════
  // HP TURBINE
  // ══════════════════════════════════════════
  var hpCasing = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.5, 20), matTurbine);
  hpCasing.position.set(-1.5, 4.5, 0);
  hpCasing.rotation.z = Math.PI / 2;
  scene.add(hpCasing);
  // HP Blades
  var hpBlades = [];
  for (var bi = 0; bi < 3; bi++) {
    var bladeRing = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.04, 8, 16), matBlade);
    bladeRing.position.set(-1.5 - 0.8 + bi * 0.8, 4.5, 0);
    bladeRing.rotation.y = Math.PI / 2;
    scene.add(bladeRing);
    hpBlades.push(bladeRing);
  }
  // HP shaft
  scene.add(assignProps(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3, 8), matFrame), {position: new THREE.Vector3(-1.5, 4.5, 0), rotation: new THREE.Euler(0, 0, Math.PI/2)}));
  addLabel3D(scene, -1.5, 6.5, 0, 'HP TURBINE\n3000 RPM', 0x607D8B);

  // ══════════════════════════════════════════
  // REHEATER (between HP and LP)
  // ══════════════════════════════════════════
  var reheater = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 1.8), matSuperheater);
  reheater.position.set(1.5, 5.5, 0);
  scene.add(reheater);
  addLabel3D(scene, 1.5, 7, 0, 'REHEATER', 0xD84315);

  // ══════════════════════════════════════════
  // LP TURBINE (larger)
  // ══════════════════════════════════════════
  var lpCasing = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 3.5, 20), matTurbine);
  lpCasing.position.set(5, 4.5, 0);
  lpCasing.rotation.z = Math.PI / 2;
  scene.add(lpCasing);
  // LP Blades (larger)
  var lpBlades = [];
  for (var li = 0; li < 4; li++) {
    var lBlade = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.05, 8, 20), matBlade);
    lBlade.position.set(5 - 1.2 + li * 0.8, 4.5, 0);
    lBlade.rotation.y = Math.PI / 2;
    scene.add(lBlade);
    lpBlades.push(lBlade);
  }
  // LP shaft
  scene.add(assignProps(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 4, 8), matFrame), {position: new THREE.Vector3(5, 4.5, 0), rotation: new THREE.Euler(0, 0, Math.PI/2)}));
  addLabel3D(scene, 5, 7, 0, 'LP TURBINE', 0x607D8B);

  // ══════════════════════════════════════════
  // GENERATOR
  // ══════════════════════════════════════════
  var genBody = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 2.0, 20), matGen);
  genBody.position.set(8.5, 4.5, 0);
  genBody.rotation.z = Math.PI / 2;
  scene.add(genBody);
  // Copper windings
  for (var wi = 0; wi < 6; wi++) {
    var winding = new THREE.Mesh(new THREE.TorusGeometry(1.02, 0.04, 8, 20), matGen);
    winding.position.set(8.5 - 0.75 + wi * 0.3, 4.5, 0);
    winding.rotation.y = Math.PI / 2;
    scene.add(winding);
  }
  // Gen endcaps
  scene.add(assignProps(new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.1, 20), matFrame), {position: new THREE.Vector3(7.5, 4.5, 0), rotation: new THREE.Euler(0, 0, Math.PI/2)}));
  scene.add(assignProps(new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.1, 20), matFrame), {position: new THREE.Vector3(9.5, 4.5, 0), rotation: new THREE.Euler(0, 0, Math.PI/2)}));
  addLabel3D(scene, 8.5, 6.5, 0, 'GENERATOR\n1 GW OUTPUT', 0xFFC107);

  // ══════════════════════════════════════════
  // CONDENSER (below LP turbine)
  // ══════════════════════════════════════════
  var condBody = new THREE.Mesh(new THREE.BoxGeometry(3, 1.5, 2.5), matCond);
  condBody.position.set(5, 1.5, 0);
  scene.add(condBody);
  addLabel3D(scene, 5, 0, 0, 'CONDENSER\nSTEAM → WATER', 0x1565C0);

  // ══════════════════════════════════════════
  // FEEDWATER PUMP (bottom, returning to boiler)
  // ══════════════════════════════════════════
  var pumpBody = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.2, 16), matPump);
  pumpBody.position.set(-2, 1.0, 0);
  scene.add(pumpBody);
  addLabel3D(scene, -2, -0.5, 0, 'FEEDWATER\nPUMP', 0x00695C);

  // ══════════════════════════════════════════
  // CONNECTING PIPES (steam flow path)
  // ══════════════════════════════════════════
  var createPipe = function(points, mat) {
    var curve = new THREE.CatmullRomCurve3(points);
    var geo = new THREE.TubeGeometry(curve, 32, 0.12, 8, false);
    var mesh = new THREE.Mesh(geo, mat || matPipe);
    scene.add(mesh);
    return mesh;
  };

  // Boiler → Superheater
  createPipe([new THREE.Vector3(-8, 6, 0), new THREE.Vector3(-6.5, 6, 0), new THREE.Vector3(-5, 5.5, 0)]);
  // Superheater → HP Turbine
  createPipe([new THREE.Vector3(-5, 5.5, 0), new THREE.Vector3(-3.5, 5, 0), new THREE.Vector3(-2.8, 4.5, 0)]);
  // HP Turbine → Reheater
  createPipe([new THREE.Vector3(-0.2, 4.5, 0), new THREE.Vector3(0.5, 5.2, 0), new THREE.Vector3(1.5, 5.5, 0)]);
  // Reheater → LP Turbine
  createPipe([new THREE.Vector3(1.5, 5.5, 0), new THREE.Vector3(2.5, 5, 0), new THREE.Vector3(3.2, 4.5, 0)]);
  // LP Turbine → Generator (shaft)
  createPipe([new THREE.Vector3(6.8, 4.5, 0), new THREE.Vector3(7.5, 4.5, 0)]);
  // LP Turbine exhaust → Condenser
  createPipe([new THREE.Vector3(5, 2.8, 0), new THREE.Vector3(5, 2.3, 0)]);
  // Condenser → Feedwater pump
  createPipe([new THREE.Vector3(5, 0.75, 0), new THREE.Vector3(2, 0.5, 0), new THREE.Vector3(-2, 1.0, 0)]);
  // Feedwater pump → Boiler
  createPipe([new THREE.Vector3(-2, 1.0, 0), new THREE.Vector3(-5, 0.5, 0), new THREE.Vector3(-8, 1.0, 0)]);

  // ══════════════════════════════════════════
  // FLOW PARTICLES — Steam (white/hot) + Water (blue/cool)
  // ══════════════════════════════════════════
  var steamPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-8, 6, 0),
    new THREE.Vector3(-5, 5.5, 0),
    new THREE.Vector3(-2.8, 4.5, 0),
    new THREE.Vector3(-0.2, 4.5, 0),
    new THREE.Vector3(1.5, 5.5, 0),
    new THREE.Vector3(3.2, 4.5, 0),
    new THREE.Vector3(5, 4.5, 0),
    new THREE.Vector3(5, 2.8, 0),
    new THREE.Vector3(5, 1.5, 0)
  ]);

  var waterPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(5, 0.75, 0),
    new THREE.Vector3(2, 0.5, 0),
    new THREE.Vector3(-2, 1.0, 0),
    new THREE.Vector3(-5, 0.5, 0),
    new THREE.Vector3(-8, 1.0, 0),
    new THREE.Vector3(-8, 3.5, 0)
  ]);

  var steamParticles = [];
  for (var si = 0; si < 30; si++) {
    var sp = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), matSteam.clone());
    sp.userData.t = Math.random();
    sp.userData.speed = 0.002 + Math.random() * 0.003;
    steamParticles.push(sp);
    scene.add(sp);
  }

  var waterParticles = [];
  for (var wpi = 0; wpi < 20; wpi++) {
    var wp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), matWater.clone());
    wp.userData.t = Math.random();
    wp.userData.speed = 0.003 + Math.random() * 0.002;
    waterParticles.push(wp);
    scene.add(wp);
  }

  // Power output particles (generator → right)
  var powerParticles = [];
  for (var pi = 0; pi < 12; pi++) {
    var pp = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 4), matPower.clone());
    pp.userData.t = Math.random();
    pp.userData.speed = 0.006 + Math.random() * 0.006;
    powerParticles.push(pp);
    scene.add(pp);
  }

  // ══════════════════════════════════════════
  // ORGANISM RING (overhead governance)
  // ══════════════════════════════════════════
  var orgRing = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.04, 20, 80), new THREE.MeshBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.5 }));
  orgRing.position.set(0, 9, 0);
  scene.add(orgRing);
  var orgRing2 = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.03, 16, 60), new THREE.MeshBasicMaterial({ color: 0x00695C, transparent: true, opacity: 0.25 }));
  orgRing2.position.set(0, 9, 0);
  scene.add(orgRing2);
  var orgGlow = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.2, 8, 40), new THREE.MeshBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.06 }));
  orgGlow.position.set(0, 9, 0);
  scene.add(orgGlow);

  // 42 nodes on ring
  for (var ni = 0; ni < 42; ni++) {
    var a = (ni / 42) * Math.PI * 2;
    var nc = [0x1565C0, 0x00695C, 0xB71C1C, 0x607D8B][Math.floor(ni / 10.5)];
    var node = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: nc }));
    node.position.set(Math.cos(a) * 3, 9, Math.sin(a) * 3);
    scene.add(node);
  }

  // Governance beams from ring to components
  [[-8, 0xB71C1C], [-1.5, 0x607D8B], [5, 0x607D8B], [8.5, 0xFFC107]].forEach(function(pair) {
    var pts = [new THREE.Vector3(pair[0], 9, 0), new THREE.Vector3(pair[0], 7, 0)];
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: pair[1], transparent: true, opacity: 0.15 })));
  });

  addLabel3D(scene, 0, 10.5, 0, 'LUME 4/42\nORGANISM', 0x00E5FF);

  // ══════════════════════════════════════════
  // GROUND PLATFORM
  // ══════════════════════════════════════════
  var ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshPhysicalMaterial({ color: 0x060810, metalness: 0.5, roughness: 0.6 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  var grid = new THREE.GridHelper(30, 30, 0x0a1520, 0x080c14);
  grid.position.y = 0.01;
  grid.material.transparent = true;
  grid.material.opacity = 0.12;
  scene.add(grid);

  // ══════════════════════════════════════════
  // ANIMATION LOOP
  // ══════════════════════════════════════════
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    var t = Date.now() * 0.001;

    // Spin turbine blades
    hpBlades.forEach(function(b) { b.rotation.x = t * 4; });
    lpBlades.forEach(function(b) { b.rotation.x = t * 3; });

    // Organism ring rotation
    orgRing.rotation.y = t * 0.3;
    orgRing2.rotation.y = -t * 0.2;
    orgGlow.rotation.y = t * 0.15;
    orgGlow.material.opacity = 0.04 + Math.sin(t * 2) * 0.02;

    // Heat source pulse
    heatCore.material.opacity = 0.4 + Math.sin(t * 3) * 0.2;
    heatGlow.intensity = 1.2 + Math.sin(t * 2.5) * 0.5;

    // Steam flow particles
    steamParticles.forEach(function(p) {
      p.userData.t += p.userData.speed;
      if (p.userData.t > 1) p.userData.t = 0;
      var pt = steamPath.getPoint(p.userData.t);
      p.position.copy(pt);
      p.position.x += (Math.random() - 0.5) * 0.08;
      p.position.y += (Math.random() - 0.5) * 0.08;
      p.position.z += (Math.random() - 0.5) * 0.15;
      // Fade steam as it reaches condenser
      p.material.opacity = 0.8 - p.userData.t * 0.5;
    });

    // Water return particles
    waterParticles.forEach(function(p) {
      p.userData.t += p.userData.speed;
      if (p.userData.t > 1) p.userData.t = 0;
      var pt = waterPath.getPoint(p.userData.t);
      p.position.copy(pt);
      p.position.x += (Math.random() - 0.5) * 0.06;
      p.position.z += (Math.random() - 0.5) * 0.12;
    });

    // Power output sparks
    powerParticles.forEach(function(p) {
      p.userData.t += p.userData.speed;
      if (p.userData.t > 1) p.userData.t = 0;
      p.position.set(9.5 + p.userData.t * 4, 4.5 + (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3);
      p.material.opacity = 0.5 + Math.sin(p.userData.t * Math.PI) * 0.4;
    });

    // Rim light pulse
    rimL.intensity = 0.3 + Math.sin(t * 1.5) * 0.2;

    // HUD updates
    var shVals = document.querySelectorAll('.steam-hud .shud-val');
    if (shVals.length >= 3) {
      shVals[0].textContent = Math.round(680 + Math.sin(t * 0.5) * 15) + '°C';
      shVals[1].textContent = (25.0 + Math.sin(t * 0.3) * 1.5).toFixed(1) + ' MPa';
      shVals[2].textContent = Math.round(985 + Math.sin(t * 0.4) * 12) + ' MW';
    }

    if (sComposer) sComposer.render(); else renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', function() {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });
  } catch(e) {
    console.error('[HydroCore] Steam scene error:', e);
    var v = document.querySelector('.steam-viewer');
    if (v) v.innerHTML = '<p style="color:#ef4444;padding:20px;text-align:center;font-size:13px">Steam: ' + e.message + '</p>';
  }
})();
