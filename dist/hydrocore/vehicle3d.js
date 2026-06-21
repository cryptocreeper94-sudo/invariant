/**
 * HydroCore.dev — Vehicle Cutaway & Meridian Road 3D
 * With OrbitControls, curved vehicle body, improved labels
 * DarkWave Studios LLC — Copyright 2026
 */

// ═══════════════════════════════════════════════════════════
// SCENE 3: VEHICLE CUTAWAY
// ═══════════════════════════════════════════════════════════
(function initVehicle() {
  try {
  const canvas = document.getElementById('vehicle-canvas');
  if (!canvas) return;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04060c, 0.018);
  const w = canvas.clientWidth || canvas.width || 800;
  const h = canvas.clientHeight || canvas.height || 500;
  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 200);
  camera.position.set(14, 9, 18);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x04060c);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Bloom
  var vComposer;
  try {
    vComposer = new THREE.EffectComposer(renderer);
    vComposer.addPass(new THREE.RenderPass(scene, camera));
    vComposer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(w, h), 0.5, 0.3, 0.85));
  } catch(e) { vComposer = null; }

  // OrbitControls
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.target.set(0, 2, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.4;
  controls.minDistance = 8;
  controls.maxDistance = 40;

  // Cinematic lighting
  scene.add(new THREE.HemisphereLight(0x334466, 0x111118, 0.5));
  const vKey = new THREE.DirectionalLight(0x88aadd, 1.0);
  vKey.position.set(8, 12, 5);
  vKey.castShadow = true;
  vKey.shadow.mapSize.set(1024, 1024);
  scene.add(vKey);
  scene.add(assignProps(new THREE.DirectionalLight(0x00695C, 0.3), {position: new THREE.Vector3(-6, 8, -4)}));
  const vRim = new THREE.PointLight(0x00E5FF, 0.6, 30);
  vRim.position.set(-5, 5, 8);
  scene.add(vRim);
  const tl = new THREE.PointLight(0x00695C, 0.8, 25); tl.position.set(0,3,0); scene.add(tl);

  // Materials — premium with strong emissive glow for bloom
  const matBody = new THREE.MeshPhysicalMaterial({ color: 0x334455, metalness: 0.8, roughness: 0.2, transparent: true, opacity: 0.55, clearcoat: 1.0, clearcoatRoughness: 0.1 });
  const matFrame = new THREE.MeshPhysicalMaterial({ color: 0x37474F, metalness: 0.85, roughness: 0.15, clearcoat: 0.6 });
  const matWire = new THREE.MeshBasicMaterial({ color: 0x00E5FF, wireframe: true, transparent: true, opacity: 0.55 });
  const matWater = new THREE.MeshPhysicalMaterial({ color: 0x1565C0, metalness: 0.3, roughness: 0.2, transparent: true, opacity: 0.7, emissive: 0x0D47A1, emissiveIntensity: 1.0 });
  const matElectro = new THREE.MeshPhysicalMaterial({ color: 0xFFC107, metalness: 0.5, roughness: 0.15, emissive: 0xFF8F00, emissiveIntensity: 1.2, clearcoat: 0.5 });
  const matH2 = new THREE.MeshPhysicalMaterial({ color: 0x00897B, metalness: 0.6, roughness: 0.15, emissive: 0x004D40, emissiveIntensity: 1.2, clearcoat: 0.6 });
  const matFuelCell = new THREE.MeshPhysicalMaterial({ color: 0x00E5FF, metalness: 0.5, roughness: 0.15, emissive: 0x0097A7, emissiveIntensity: 1.5, clearcoat: 0.5 });
  const matBattery = new THREE.MeshPhysicalMaterial({ color: 0x6A1B9A, metalness: 0.5, roughness: 0.2, emissive: 0x4A148C, emissiveIntensity: 1.0, clearcoat: 0.4 });
  const matMotor = new THREE.MeshPhysicalMaterial({ color: 0x78909C, metalness: 0.8, roughness: 0.15, emissive: 0x455A64, emissiveIntensity: 0.5, clearcoat: 0.6 });
  const matWheel = new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, metalness: 0.3, roughness: 0.8 });

  // ── VEHICLE BODY — Group-based system for clean type swapping ──
  const vehicleBodyGroup = new THREE.Group();
  scene.add(vehicleBodyGroup);
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x4488cc, transparent: true, opacity: 0.2, metalness: 0.95, roughness: 0.02, clearcoat: 1.0 });
  const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffee });
  const tlMat = new THREE.MeshBasicMaterial({ color: 0xcc2222 });

  function clearVehicleBody() {
    while (vehicleBodyGroup.children.length > 0) {
      var child = vehicleBodyGroup.children[0];
      vehicleBodyGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
    }
  }

  function addExtrudedBody(shape, depth, bevelThick, bevelSize) {
    var settings = { depth: depth, bevelEnabled: true, bevelThickness: bevelThick || 0.15, bevelSize: bevelSize || 0.15, bevelSegments: 4 };
    var geo = new THREE.ExtrudeGeometry(shape, settings);
    geo.translate(0, 0, -depth / 2);
    var mesh = new THREE.Mesh(geo, matBody);
    mesh.castShadow = true;
    vehicleBodyGroup.add(mesh);
    var wire = new THREE.Mesh(geo.clone(), matWire);
    vehicleBodyGroup.add(wire);
  }

  function addGlass(shape, depth) {
    var geo = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false });
    geo.translate(0, 0, -depth / 2);
    vehicleBodyGroup.add(new THREE.Mesh(geo, glassMat));
  }

  // ── SEDAN — smooth flowing roofline, classic 3-box ──
  function buildSedan() {
    clearVehicleBody();

    // Main body — refined sedan profile
    var s = new THREE.Shape();
    s.moveTo(-5, 1.2);
    s.lineTo(-5, 1.9);
    s.quadraticCurveTo(-4.9, 2.3, -4.2, 2.45);     // rear bumper → trunk
    s.lineTo(-3, 2.5);                                 // trunk lid
    s.quadraticCurveTo(-2.3, 2.55, -2, 2.9);          // trunk → rear glass
    s.quadraticCurveTo(-1.5, 3.25, -0.8, 3.3);        // rear glass curve
    s.lineTo(1.2, 3.3);                                // roofline
    s.quadraticCurveTo(2.0, 3.3, 2.6, 3.0);           // front of roof
    s.quadraticCurveTo(3.2, 2.65, 3.6, 2.4);          // windshield
    s.lineTo(4.4, 2.15);                               // hood
    s.quadraticCurveTo(5.0, 2.0, 5.3, 1.85);          // hood → nose
    s.quadraticCurveTo(5.5, 1.7, 5.5, 1.5);           // nose curve
    s.lineTo(5.5, 1.2);
    s.lineTo(-5, 1.2);
    addExtrudedBody(s, 3.5, 0.15, 0.15);

    // Windshield glass
    var ws = new THREE.Shape();
    ws.moveTo(1.2, 3.28);
    ws.quadraticCurveTo(2.0, 3.28, 2.6, 2.98);
    ws.quadraticCurveTo(3.2, 2.63, 3.6, 2.38);
    ws.lineTo(3.6, 2.55);
    ws.quadraticCurveTo(2.8, 2.9, 1.2, 3.28);
    addGlass(ws, 3.2);

    // Rear window glass
    var rw = new THREE.Shape();
    rw.moveTo(-2, 2.88);
    rw.quadraticCurveTo(-1.5, 3.22, -0.8, 3.28);
    rw.lineTo(-0.8, 3.18);
    rw.quadraticCurveTo(-1.4, 3.1, -2, 2.88);
    addGlass(rw, 3.0);

    // Side windows (left + right)
    [-1.65, 1.65].forEach(function(z) {
      var sw = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.7), glassMat.clone());
      sw.position.set(0.4, 2.95, z);
      sw.material.opacity = 0.12;
      vehicleBodyGroup.add(sw);
    });

    // Round headlights
    [-1.2, 1.2].forEach(function(z) {
      var hl = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), hlMat);
      hl.position.set(5.45, 1.8, z);
      vehicleBodyGroup.add(hl);
      var glow = new THREE.PointLight(0xffffdd, 0.25, 6);
      glow.position.set(5.6, 1.8, z);
      vehicleBodyGroup.add(glow);
    });

    // Rectangular taillights
    [-1.2, 1.2].forEach(function(z) {
      var tl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.4), tlMat);
      tl.position.set(-5.05, 2.15, z);
      vehicleBodyGroup.add(tl);
    });

    // Chrome trim strip along beltline
    var trimGeo = new THREE.BoxGeometry(9.5, 0.04, 0.04);
    [-1.72, 1.72].forEach(function(z) {
      var trim = new THREE.Mesh(trimGeo, new THREE.MeshBasicMaterial({ color: 0x999999 }));
      trim.position.set(0.2, 2.48, z);
      vehicleBodyGroup.add(trim);
    });
  }

  // ── SPORT — low, wide, aggressive ──
  function buildSport() {
    clearVehicleBody();

    // Low-slung sport body
    var s = new THREE.Shape();
    s.moveTo(-4.2, 1.0);
    s.lineTo(-4.2, 1.5);
    s.quadraticCurveTo(-4.1, 1.7, -3.6, 1.78);       // rear diffuser → rear
    s.lineTo(-3.0, 1.82);                               // rear deck
    s.quadraticCurveTo(-2.4, 1.85, -2.0, 2.15);       // rear → cabin rise
    s.quadraticCurveTo(-1.5, 2.55, -0.8, 2.62);       // rear glass
    s.lineTo(0.3, 2.65);                                // short roofline
    s.quadraticCurveTo(1.0, 2.65, 1.6, 2.4);          // roof → windshield
    s.quadraticCurveTo(2.4, 2.0, 3.0, 1.78);          // windshield (very raked)
    s.lineTo(4.8, 1.55);                                // long hood
    s.quadraticCurveTo(5.2, 1.45, 5.4, 1.3);          // nose
    s.quadraticCurveTo(5.5, 1.2, 5.5, 1.1);           // front lip
    s.lineTo(5.5, 1.0);
    s.lineTo(-4.2, 1.0);
    addExtrudedBody(s, 4.0, 0.12, 0.12);

    // Raked windshield glass
    var ws = new THREE.Shape();
    ws.moveTo(0.3, 2.63);
    ws.quadraticCurveTo(1.0, 2.63, 1.6, 2.38);
    ws.quadraticCurveTo(2.4, 1.98, 3.0, 1.76);
    ws.lineTo(3.0, 1.92);
    ws.quadraticCurveTo(2.2, 2.2, 0.3, 2.63);
    addGlass(ws, 3.7);

    // Rear glass (small, fast)
    var rw = new THREE.Shape();
    rw.moveTo(-2.0, 2.13);
    rw.quadraticCurveTo(-1.5, 2.52, -0.8, 2.6);
    rw.lineTo(-0.8, 2.52);
    rw.quadraticCurveTo(-1.4, 2.4, -2.0, 2.13);
    addGlass(rw, 3.5);

    // Rear spoiler / wing
    var spoilerTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.06, 3.8),
      new THREE.MeshPhysicalMaterial({ color: 0x223344, metalness: 0.85, roughness: 0.15, clearcoat: 0.8 })
    );
    spoilerTop.position.set(-4.0, 2.2, 0);
    vehicleBodyGroup.add(spoilerTop);
    // Spoiler endplates
    [-1.7, 1.7].forEach(function(z) {
      var plate = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.35, 0.06),
        new THREE.MeshPhysicalMaterial({ color: 0x223344, metalness: 0.85, roughness: 0.15 })
      );
      plate.position.set(-4.0, 2.02, z);
      vehicleBodyGroup.add(plate);
    });

    // Slim LED headlights
    [-1.5, 1.5].forEach(function(z) {
      var hl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.6), hlMat);
      hl.position.set(5.45, 1.25, z);
      vehicleBodyGroup.add(hl);
      var glow = new THREE.PointLight(0xffffdd, 0.3, 5);
      glow.position.set(5.55, 1.25, z);
      vehicleBodyGroup.add(glow);
    });

    // Full-width LED taillight bar
    var tlBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 3.6), tlMat);
    tlBar.position.set(-4.25, 1.65, 0);
    vehicleBodyGroup.add(tlBar);

    // Front splitter
    var splitter = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.04, 4.0),
      new THREE.MeshPhysicalMaterial({ color: 0x111111, metalness: 0.3, roughness: 0.8 })
    );
    splitter.position.set(5.2, 1.0, 0);
    vehicleBodyGroup.add(splitter);

    // Side intakes
    [-1.9, 1.9].forEach(function(z) {
      var intake = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.15, 0.06), new THREE.MeshBasicMaterial({ color: 0x080808 }));
      intake.position.set(1.5, 1.15, z);
      vehicleBodyGroup.add(intake);
    });
  }

  // ── SUV — tall, commanding, upright ──
  function buildSUV() {
    clearVehicleBody();

    // Tall boxy SUV body
    var s = new THREE.Shape();
    s.moveTo(-5.5, 1.4);
    s.lineTo(-5.5, 2.8);
    s.quadraticCurveTo(-5.4, 3.4, -5.2, 3.6);         // rear D-pillar
    s.quadraticCurveTo(-5.0, 3.85, -4.4, 3.9);         // rear roof corner
    s.lineTo(0.8, 3.9);                                  // flat roofline
    s.quadraticCurveTo(1.5, 3.9, 2.0, 3.7);            // front of roof
    s.quadraticCurveTo(2.8, 3.2, 3.3, 2.8);            // upright windshield
    s.lineTo(4.2, 2.45);                                 // short hood
    s.quadraticCurveTo(4.8, 2.3, 5.2, 2.15);           // hood → grille
    s.quadraticCurveTo(5.5, 2.0, 5.6, 1.7);            // front face
    s.lineTo(5.6, 1.4);
    s.lineTo(-5.5, 1.4);
    addExtrudedBody(s, 4.2, 0.15, 0.15);

    // Large upright windshield
    var ws = new THREE.Shape();
    ws.moveTo(0.8, 3.88);
    ws.quadraticCurveTo(1.5, 3.88, 2.0, 3.68);
    ws.quadraticCurveTo(2.8, 3.18, 3.3, 2.78);
    ws.lineTo(3.3, 2.98);
    ws.quadraticCurveTo(2.5, 3.4, 0.8, 3.88);
    addGlass(ws, 3.8);

    // Rear window (tall)
    var rw = new THREE.Shape();
    rw.moveTo(-5.18, 3.58);
    rw.quadraticCurveTo(-5.0, 3.82, -4.4, 3.88);
    rw.lineTo(-4.4, 3.78);
    rw.quadraticCurveTo(-4.9, 3.72, -5.18, 3.58);
    addGlass(rw, 3.5);

    // Side windows (larger)
    [-2.0, 2.0].forEach(function(z) {
      var sw = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 0.9), glassMat.clone());
      sw.position.set(-1.0, 3.3, z);
      sw.material.opacity = 0.1;
      vehicleBodyGroup.add(sw);
    });

    // Roof rails
    [-1.9, 1.9].forEach(function(z) {
      var rail = new THREE.Mesh(
        new THREE.BoxGeometry(5.5, 0.1, 0.1),
        new THREE.MeshPhysicalMaterial({ color: 0x999999, metalness: 0.95, roughness: 0.05, clearcoat: 1.0 })
      );
      rail.position.set(-1.8, 4.05, z);
      vehicleBodyGroup.add(rail);
      // Rail supports
      [-4.0, -2.0, 0.0].forEach(function(x) {
        var support = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.12, 0.08),
          new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.1 })
        );
        support.position.set(x, 3.98, z);
        vehicleBodyGroup.add(support);
      });
    });

    // Big square headlights
    [-1.4, 1.4].forEach(function(z) {
      var hl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.5), hlMat);
      hl.position.set(5.6, 2.0, z);
      vehicleBodyGroup.add(hl);
      var glow = new THREE.PointLight(0xffffdd, 0.3, 6);
      glow.position.set(5.7, 2.0, z);
      vehicleBodyGroup.add(glow);
    });

    // Tall taillights
    [-1.5, 1.5].forEach(function(z) {
      var tl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.35), tlMat);
      tl.position.set(-5.55, 2.9, z);
      vehicleBodyGroup.add(tl);
    });

    // Front grille
    var grille = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.5, 3.0),
      new THREE.MeshPhysicalMaterial({ color: 0x111111, metalness: 0.4, roughness: 0.6 })
    );
    grille.position.set(5.58, 1.95, 0);
    vehicleBodyGroup.add(grille);

    // Running boards
    [-2.15, 2.15].forEach(function(z) {
      var board = new THREE.Mesh(
        new THREE.BoxGeometry(6, 0.06, 0.35),
        new THREE.MeshPhysicalMaterial({ color: 0x222222, metalness: 0.3, roughness: 0.8 })
      );
      board.position.set(-0.5, 1.38, z);
      vehicleBodyGroup.add(board);
    });
  }

  // ── Swap handler ──
  function swapBody(type) {
    if (type === 'sport') buildSport();
    else if (type === 'suv') buildSUV();
    else buildSedan();
  }

  // Button click handler
  document.querySelectorAll('.vtype-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.vtype-btn').forEach(function(b) {
        b.classList.remove('vtype-active');
      });
      btn.classList.add('vtype-active');
      swapBody(btn.dataset.vtype);
    });
  });

  // Build initial sedan
  buildSedan();



  // Frame rails
  scene.add(assignProps(new THREE.Mesh(new THREE.BoxGeometry(12, 0.2, 0.3), matFrame), {position: new THREE.Vector3(0, 1, 1.2)}));
  scene.add(assignProps(new THREE.Mesh(new THREE.BoxGeometry(12, 0.2, 0.3), matFrame), {position: new THREE.Vector3(0, 1, -1.2)}));

  // Wheels
  const wheels = [];
  [[-3.5,0.7,2.1],[-3.5,0.7,-2.1],[4,0.7,2.1],[4,0.7,-2.1]].forEach(p => {
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.25, 16, 28), matWheel);
    tire.position.set(...p);
    scene.add(tire);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16), new THREE.MeshPhysicalMaterial({ color: 0x666666, metalness: 0.95, roughness: 0.05, clearcoat: 1.0 }));
    rim.position.set(...p);
    rim.rotation.z = Math.PI / 2;
    scene.add(rim);
    wheels.push(tire);
  });

  // ── SUBSYSTEMS — compact cluster in front half, rear is cabin ──
  const waterTank = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.4, 20), matWater);
  waterTank.position.set(-3.2, 2.1, 0); waterTank.rotation.z = Math.PI / 2;
  scene.add(waterTank);

  const electrolyzer = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 1.0), matElectro);
  electrolyzer.position.set(-1.8, 2.1, 0);
  scene.add(electrolyzer);
  for (let i = 0; i < 4; i++) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.45, 0.9), new THREE.MeshBasicMaterial({ color: 0xFFD54F, transparent: true, opacity: 0.4 }));
    plate.position.set(-1.8 - 0.3 + i * 0.2, 2.1, 0); scene.add(plate);
  }

  const h2Tank = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.6, 20), matH2);
  h2Tank.position.set(-0.5, 2.3, 0); h2Tank.rotation.z = Math.PI / 2;
  scene.add(h2Tank);
  // Rounded endcaps
  [-1.3, 0.3].forEach(x => {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 8), matH2);
    cap.position.set(x, 2.3, 0); scene.add(cap);
  });

  const fuelCell = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.8), matFuelCell);
  fuelCell.position.set(0.8, 2.1, 0);
  scene.add(fuelCell);

  const battery = new THREE.Mesh(new THREE.BoxGeometry(6, 0.35, 2.2), matBattery);
  battery.position.set(0, 1.3, 0);
  scene.add(battery);

  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.0, 20), matMotor);
  motor.position.set(4.2, 1.5, 0); motor.rotation.x = Math.PI / 2;
  scene.add(motor);

  // Receiver coil
  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.06, 8, 24), new THREE.MeshBasicMaterial({ color: 0xFFC107, transparent: true, opacity: 0.5 }));
  coil.position.set(0, 0.7, 0); coil.rotation.x = Math.PI / 2;
  scene.add(coil);
  addLabel3D(scene, 0, 0.2, 1.8, 'MERIDIAN\nRECEIVER', 0xFFC107);

  // Organism ring — double ring with glow halo
  const orgRing = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.03, 20, 80), new THREE.MeshBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.5 }));
  orgRing.position.set(0, 4.8, 0); scene.add(orgRing);
  const orgRing2 = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.02, 16, 60), new THREE.MeshBasicMaterial({ color: 0x00695C, transparent: true, opacity: 0.25 }));
  orgRing2.position.set(0, 4.8, 0); scene.add(orgRing2);
  const orgGlow = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.15, 8, 40), new THREE.MeshBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.08 }));
  orgGlow.position.set(0, 4.8, 0); scene.add(orgGlow);
  for (let i = 0; i < 42; i++) {
    const a = (i / 42) * Math.PI * 2;
    const nc = [0x1565C0,0x00695C,0xB71C1C,0x607D8B][Math.floor(i/10.5)];
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: nc }));
    node.position.set(Math.cos(a)*1.5, 4.8, Math.sin(a)*1.5); scene.add(node);
  }
  // Vertical connection beams from ring to subsystems
  [[-3.2, 0x1565C0], [-1.8, 0xFFC107], [-0.5, 0x00695C], [0.8, 0x00E5FF]].forEach(function(pair) {
    var pts = [new THREE.Vector3(pair[0], 4.8, 0), new THREE.Vector3(pair[0], 3.6, 0)];
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: pair[1], transparent: true, opacity: 0.2 })));
  });

  // Flow Tubes with Custom Shader
  const flowUniforms = { time: { value: 0 } };
  const flowShader = {
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color;
      varying vec2 vUv;
      void main() {
        float flow = fract(vUv.x * 5.0 - time * 2.0);
        float alpha = smoothstep(0.1, 0.5, flow) * smoothstep(0.9, 0.5, flow);
        gl_FragColor = vec4(color, alpha * 0.8);
      }
    `
  };

  const createTube = (points, colorHex) => {
    const curve = new THREE.CatmullRomCurve3(points);
    const geo = new THREE.TubeGeometry(curve, 32, 0.08, 8, false);
    const mat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([ flowUniforms, { color: { value: new THREE.Color(colorHex) } } ]),
      vertexShader: flowShader.vertexShader,
      fragmentShader: flowShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    return mesh;
  };

  createTube([new THREE.Vector3(-3.2, 2.1, 0), new THREE.Vector3(-2.5, 2.1, 0), new THREE.Vector3(-1.8, 2.1, 0)], 0x1565C0); // Water
  createTube([new THREE.Vector3(-1.8, 2.1, 0), new THREE.Vector3(-1.1, 2.4, 0), new THREE.Vector3(-0.5, 2.3, 0)], 0x00E5FF); // H2 to Buffer
  createTube([new THREE.Vector3(-0.5, 2.3, 0), new THREE.Vector3(0.1, 2.3, 0), new THREE.Vector3(0.8, 2.1, 0)], 0x00E5FF); // Buffer to FC
  createTube([new THREE.Vector3(0.8, 2.1, 0), new THREE.Vector3(2.5, 1.8, 0), new THREE.Vector3(4.2, 1.5, 0)], 0xFFC107); // Power

  // Ground — subtle reflective platform
  const vGround = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshPhysicalMaterial({ color: 0x060810, metalness: 0.5, roughness: 0.6 }));
  vGround.rotation.x = -Math.PI / 2; vGround.receiveShadow = true; scene.add(vGround);
  const gridHelper = new THREE.GridHelper(30, 30, 0x0a1520, 0x080c14);
  gridHelper.position.y = 0.01;
  gridHelper.material.transparent = true; gridHelper.material.opacity = 0.15;
  scene.add(gridHelper);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    const t = Date.now() * 0.001;
    orgRing.rotation.y = t * 0.3;
    orgRing2.rotation.y = -t * 0.2;
    orgGlow.rotation.y = t * 0.15;
    orgGlow.material.opacity = 0.05 + Math.sin(t * 2) * 0.03;
    coil.material.opacity = 0.3 + Math.sin(t * 3) * 0.2;
    flowUniforms.time.value = t;
    wheels.forEach(w => { w.rotation.z += 0.02; });
    vRim.intensity = 0.4 + Math.sin(t*1.5)*0.2;
    
    // Live vehicle HUD data
    var vhVals = document.querySelectorAll('.vehicle-hud .vhud-val');
    if (vhVals.length >= 3) {
      vhVals[0].textContent = Math.round(68 + Math.sin(t * 0.4) * 8) + '%';
      vhVals[1].textContent = (3.0 + Math.sin(t * 0.3) * 0.4).toFixed(1) + ' gal';
    }
    if (vComposer) vComposer.render(); else renderer.render(scene, camera);
  }
  animate();
  window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });
  } catch(e) {
    console.error('[HydroCore] Vehicle scene error:', e);
    var v = document.querySelector('.vehicle-viewer'); if(v) v.innerHTML = '<p style="color:#ef4444;padding:20px;text-align:center;font-size:13px">Vehicle: '+e.message+'</p>';
  }
})();

// ═══════════════════════════════════════════════════════════
// SCENE 4: MERIDIAN SMART ROAD
// ═══════════════════════════════════════════════════════════
(function initRoad() {
  try {
  const canvas = document.getElementById('road-canvas');
  if (!canvas) return;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060e1a);
  scene.fog = new THREE.FogExp2(0x060e1a, 0.005);
  const w = canvas.clientWidth || canvas.width || 800;
  const h = canvas.clientHeight || canvas.height || 500;
  const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 300);
  camera.position.set(12, 6, 18);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x060e1a);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.8;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Bloom — dramatic glow for nighttime energy effects
  var rComposer;
  try {
    rComposer = new THREE.EffectComposer(renderer);
    rComposer.addPass(new THREE.RenderPass(scene, camera));
    rComposer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(w, h), 1.2, 0.4, 0.6));
  } catch(e) { rComposer = null; }

  // OrbitControls — cinematic
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.target.set(0, 1.5, -3);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.minDistance = 8;
  controls.maxDistance = 50;

  scene.add(new THREE.AmbientLight(0x1a2a4a, 0.6));
  scene.add(new THREE.HemisphereLight(0x2244aa, 0x0a0a18, 0.7));
  // Moonlight — cool directional, strong enough to read surfaces
  const moon = new THREE.DirectionalLight(0x6688cc, 1.2);
  moon.position.set(-20, 40, -30);
  moon.castShadow = true;
  moon.shadow.mapSize.width = 1024;
  moon.shadow.mapSize.height = 1024;
  scene.add(moon);
  // Secondary fill for road surface visibility
  const fill = new THREE.DirectionalLight(0x334466, 0.5);
  fill.position.set(20, 15, 30);
  scene.add(fill);
  // Backfill so trees and ground aren't pitch black
  const backFill = new THREE.DirectionalLight(0x223344, 0.3);
  backFill.position.set(0, 10, 50);
  scene.add(backFill);
  // Starfield
  const starGeo = new THREE.BufferGeometry();
  const starCount = 500;
  const starPos = new Float32Array(starCount * 3);
  for (let si = 0; si < starCount; si++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.45; // upper hemisphere only
    const r = 120 + Math.random() * 50;
    starPos[si*3] = r * Math.sin(phi) * Math.cos(theta);
    starPos[si*3+1] = r * Math.cos(phi);
    starPos[si*3+2] = r * Math.sin(phi) * Math.sin(theta);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.4, transparent: true, opacity: 0.6 })));

  // Realistic Asphalt Road — lighter so it's visible at night
  const road = new THREE.Mesh(new THREE.PlaneGeometry(12, 200), new THREE.MeshStandardMaterial({ color: 0x1a1a20, roughness: 0.85, metalness: 0.15 }));
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0, -50);
  road.receiveShadow = true;
  scene.add(road);

  // Concrete Shoulders
  [-6.5, 6.5].forEach(x => {
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(1, 200), new THREE.MeshStandardMaterial({ color: 0x22221e, roughness: 1.0 }));
    sh.rotation.x = -Math.PI / 2; sh.position.set(x, 0.01, -50); scene.add(sh);
  });

  // Lane markings
  const laneGroup = new THREE.Group();
  scene.add(laneGroup);
  for (let i = -100; i < 50; i += 4) {
    laneGroup.add(assignProps(new THREE.Mesh(new THREE.PlaneGeometry(0.15, 2), new THREE.MeshBasicMaterial({ color: 0xffffff })), {rotation: new THREE.Euler(-Math.PI/2, 0, 0), position: new THREE.Vector3(0, 0.02, i)}));
  }
  [-5.8, 5.8].forEach(x => {
    laneGroup.add(assignProps(new THREE.Mesh(new THREE.PlaneGeometry(0.1, 200), new THREE.MeshBasicMaterial({ color: 0xffcc00 })), {rotation: new THREE.Euler(-Math.PI/2, 0, 0), position: new THREE.Vector3(x, 0.02, -50)}));
  });

  // Charging pads
  const pads = [];
  for (let i = 0; i < 12; i++) {
    const padMat = new THREE.MeshBasicMaterial({ color: 0xFFC107, transparent: true, opacity: 0.08 });
    const pad = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.05, 1.5), padMat);
    pad.position.set(0, 0.03, i * 6 - 35);
    scene.add(pad);
    pads.push(pad);
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.03, 8, 20), new THREE.MeshBasicMaterial({ color: 0xFFC107, transparent: true, opacity: 0.15 }));
    coil.position.set(0, 0.06, i * 6 - 35);
    coil.rotation.x = Math.PI / 2;
    scene.add(coil);
  }

  // Vehicle group (Realistic Paint and Glass)
  const vGroup = new THREE.Group();
  // Curved body - Recognizable sedan profile with hood, cabin, trunk
  const vShape = new THREE.Shape();
  vShape.moveTo(-2.8, 0.4);                        // Rear bumper bottom
  vShape.lineTo(-2.8, 1.0);                        // Rear bumper vertical
  vShape.lineTo(-2.0, 1.1);                        // Trunk deck
  vShape.quadraticCurveTo(-1.2, 1.3, -0.8, 2.2);  // Rear windshield slope
  vShape.lineTo(0.6, 2.4);                         // Roof
  vShape.quadraticCurveTo(1.0, 2.4, 1.6, 1.6);    // Front windshield slope
  vShape.lineTo(2.4, 1.2);                         // Hood
  vShape.quadraticCurveTo(2.8, 1.1, 2.8, 0.6);    // Front bumper/grille
  vShape.lineTo(2.8, 0.4);
  vShape.lineTo(-2.8, 0.4);                        // Chassis bottom
  const vBodyGeo = new THREE.ExtrudeGeometry(vShape, { depth: 2.2, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 4 });
  vBodyGeo.translate(0, 0, -1.1); vBodyGeo.rotateY(Math.PI / 2);
  const vBody = new THREE.Mesh(vBodyGeo, new THREE.MeshPhysicalMaterial({ color: 0xc0c8d0, metalness: 0.85, roughness: 0.15, clearcoat: 1.0 }));
  vGroup.add(vBody);
  
  // Dark Glass Canopy
  const wsMat = new THREE.MeshPhysicalMaterial({ color: 0x111122, metalness: 0.95, roughness: 0.05, transparent: true, opacity: 0.7 });
  const wShape = new THREE.Shape();
  wShape.moveTo(-0.75, 2.22); wShape.lineTo(0.6, 2.42); wShape.lineTo(1.6, 1.62); wShape.lineTo(-0.75, 1.32);
  const wGeo = new THREE.ExtrudeGeometry(wShape, { depth: 2.1, bevelEnabled: false });
  wGeo.translate(0, 0, -1.05); wGeo.rotateY(Math.PI / 2);
  vGroup.add(new THREE.Mesh(wGeo, wsMat));
  
  // Underbody
  vGroup.add(new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.15, 2.0), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 })));

  // Headlights
  const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  [-0.7, 0.7].forEach(z => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.4), hlMat);
    hl.position.set(2.85, 0.85, z); vGroup.add(hl);
    const hlLight = new THREE.PointLight(0xffffee, 1.0, 20);
    hlLight.position.set(3.2, 0.85, z); vGroup.add(hlLight);
  });
  // Taillights
  [-0.7, 0.7].forEach(z => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.4), new THREE.MeshBasicMaterial({ color: 0xff2222 }));
    tl.position.set(-2.85, 0.85, z); vGroup.add(tl);
  });

  // Wheels - Proper torus tires with cylindrical rims
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.95 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.85, roughness: 0.15 });
  [[-1.8,0.4,-1.15],[-1.8,0.4,1.15],[1.8,0.4,-1.15],[1.8,0.4,1.15]].forEach(p => {
    const wGroup = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.14, 16, 32), tireMat);
    tire.rotation.y = Math.PI / 2;
    wGroup.add(tire);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 20), rimMat);
    rim.rotation.z = Math.PI / 2;
    wGroup.add(rim);
    wGroup.position.set(...p);
    wGroup.userData.isWheel = true;
    vGroup.add(wGroup);
  });

  // Receiver coil
  const vCoil = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.04, 8, 20), new THREE.MeshBasicMaterial({ color: 0xFFC107, transparent: true, opacity: 0.4 }));
  vCoil.position.set(0, 0.4, 0); vCoil.rotation.x = Math.PI / 2;
  vGroup.add(vCoil);

  // Organism ring
  const vOrgRing = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.02, 12, 40), new THREE.MeshBasicMaterial({ color: 0x00695C, transparent: true, opacity: 0.4 }));
  vOrgRing.position.set(0, 3.8, 0);
  vGroup.add(vOrgRing);

  // Glow inside for electrolyzer
  vGroup.add(assignProps(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.8), new THREE.MeshBasicMaterial({ color: 0xFFC107, transparent: true, opacity: 0.15 })), {position: new THREE.Vector3(0, 1.5, -1)}));
  scene.add(vGroup);

  // Realistic Highway Transponder Gantries
  const gantryGroup = new THREE.Group();
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.7, roughness: 0.4 });
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  const towers = [];
  for (let i = 0; i < 4; i++) {
    const gantry = new THREE.Group();
    // Pillars
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 10, 8), metalMat); p1.position.set(-8, 5, 0); gantry.add(p1);
    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 10, 8), metalMat); p2.position.set(8, 5, 0); gantry.add(p2);
    // Crossbeam
    const beam = new THREE.Mesh(new THREE.BoxGeometry(16, 0.8, 0.8), metalMat); beam.position.set(0, 9.5, 0); gantry.add(beam);
    // Sensors
    for(let j=-4; j<=4; j+=4) {
      const sensor = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 1.2), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 }));
      sensor.position.set(j, 9.1, 0); gantry.add(sensor);
      const led = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), ledMat);
      led.position.set(j, 9.1, 0.61); gantry.add(led);
      towers.push({ beacon: led });
    }
    gantry.position.set(0, 0, i * -40);
    gantryGroup.add(gantry);
  }
  scene.add(gantryGroup);

  // Organism Coupling Beams (Visualizing data/energy transfer)
  const dataBeamMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending });
  const dataBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.8, 5.3, 16), dataBeamMat);
  scene.add(dataBeam);
  
  const powerBeamMat = new THREE.MeshBasicMaterial({ color: 0xFFC107, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending });
  const powerBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.8, 16), powerBeamMat);
  scene.add(powerBeam);

  // Nature (Pine Trees and Dirt) — brighter foliage for moonlit visibility
  const treeGroup = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2a1e10, roughness: 0.9 });
  const leavesMat = new THREE.MeshStandardMaterial({ color: 0x122a14, roughness: 0.8 });
  for(let i = 0; i < 60; i++) {
    const t = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 2, 5), trunkMat);
    trunk.position.y = 1; t.add(trunk);
    const leaves1 = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3, 5), leavesMat);
    leaves1.position.y = 2.5; t.add(leaves1);
    const leaves2 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.5, 5), leavesMat);
    leaves2.position.y = 4; t.add(leaves2);
    
    const side = Math.random() > 0.5 ? 1 : -1;
    t.position.set(side * (12 + Math.random() * 30), 0, -100 + Math.random() * 200);
    const s = 0.8 + Math.random() * 1.5;
    t.scale.set(s, s, s);
    treeGroup.add(t);
  }
  scene.add(treeGroup);

  // Ground — moonlit dark earth, not pitch black
  const rGround = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ color: 0x0c1208, roughness: 0.95 }));
  rGround.rotation.x = -Math.PI / 2;
  rGround.position.y = -0.1;
  rGround.receiveShadow = true;
  scene.add(rGround);

  function animate() {
    requestAnimationFrame(animate);
    const t = Date.now() * 0.001;
    const speed = 0.6; // Slower to show transponder handshakes
    
    // Active suspension bounce
    vGroup.position.y = Math.sin(t * 18) * 0.02 + Math.sin(t * 7) * 0.015;
    vOrgRing.rotation.y = t * 0.8;
    
    // Roll tires
    vGroup.children.forEach(c => {
       if (c.userData.isWheel) c.rotation.x -= speed * 0.2;
    });

    controls.update();

    // Scroll Environment
    laneGroup.children.forEach(l => {
      l.position.z += speed;
      if(l.position.z > 20 && l.geometry.type !== 'PlaneGeometry') l.position.z -= 100;
    });
    // Manually wrap the dashed lane markings
    laneGroup.children.forEach(l => {
      if(l.geometry.parameters.height === 2) { // dashed lines
         if(l.position.z > 20) l.position.z -= 150;
      }
    });

    treeGroup.children.forEach(tree => {
      tree.position.z += speed;
      if(tree.position.z > 30) {
         tree.position.z -= 200;
         tree.position.x = (Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 30);
      }
    });

    let closestGantryDist = Infinity;
    let closestGantryZ = 0;
    gantryGroup.children.forEach(g => {
      g.position.z += speed;
      if(g.position.z > 40) g.position.z -= 160;
      const dist = Math.abs(g.position.z - vGroup.position.z);
      if(dist < closestGantryDist) { closestGantryDist = dist; closestGantryZ = g.position.z; }
    });

    // Meridian Data Handshake (Gantry overhead)
    if (closestGantryDist < 3.5) {
      dataBeam.position.set(0, 6.45, closestGantryZ);
      dataBeam.material.opacity = 0.8 * (1 - closestGantryDist / 3.5) * (0.5 + Math.random()*0.5); // Flickering data effect
    } else {
      dataBeam.material.opacity = 0;
    }

    let closestPadDist = Infinity;
    let closestPadZ = 0;
    pads.forEach(pad => {
      pad.position.z += speed;
      if(pad.position.z > 20) pad.position.z -= 70;
      const dist = Math.abs(pad.position.z - vGroup.position.z);
      if(dist < closestPadDist) { closestPadDist = dist; closestPadZ = pad.position.z; }
      pad.material.opacity = dist < 4 ? 0.3 * (1 - dist / 4) : 0.05;
    });

    // Inductive Power Transfer (Ground Pad)
    if (closestPadDist < 2.5) {
      powerBeam.position.set(0, 0.4, closestPadZ);
      powerBeam.material.opacity = 0.9 * (1 - closestPadDist / 2.5);
    } else {
      powerBeam.material.opacity = 0;
    }

    // Remove energy particle animation since we replaced them with realistic trees and roads
    towers.forEach(tw => { tw.beacon.material.opacity = 0.5 + Math.sin(t * 8) * 0.5; }); // Flash LEDs
    vCoil.material.opacity = 0.3 + Math.sin(t * 5) * 0.2;

    // Dynamic HUD updates
    var rhItems = document.querySelectorAll('.road-hud-item');
    if (rhItems.length >= 4) {
      var meridianKW = (8.0 + Math.sin(t * 0.7) * 0.8).toFixed(1);
      var h2prod = (0.10 + Math.sin(t * 0.5) * 0.03).toFixed(2);
      var rangeExt = Math.round(60 + Math.sin(t * 0.3) * 12);
      rhItems[0].innerHTML = '<span class="rh-label">MERIDIAN INPUT</span>' + meridianKW + ' kW';
      rhItems[1].innerHTML = '<span class="rh-label">H\u2082 PRODUCTION</span>' + h2prod + ' kg/hr';
      rhItems[3].innerHTML = '<span class="rh-label">RANGE EXTENSION</span>+' + rangeExt + ' mi/hr';
    }
    if (rComposer) rComposer.render(); else renderer.render(scene, camera);
  }
  animate();
  window.addEventListener('resize', () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });
  } catch(e) {
    console.error('[HydroCore] Road scene error:', e);
    var v = document.querySelector('.road-viewer'); if(v) v.innerHTML = '<p style="color:#ef4444;padding:20px;text-align:center;font-size:13px">Road: '+e.message+'</p>';
  }
})();

// ═══════════════════════════════════════════════════════════
// SCENE 5: COMPONENT MODAL VIEWER
// ═══════════════════════════════════════════════════════════
(function initCompModal() {
  const canvas = document.getElementById('comp-modal-canvas');
  const modal = document.getElementById('comp-modal');
  const closeBtn = document.getElementById('comp-modal-close');
  const titleEl = document.getElementById('comp-modal-title');
  const descEl = document.getElementById('comp-modal-desc');
  if (!canvas || !modal) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0f18, 0.015);
  const camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 100);
  camera.position.set(3, 2, 4);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 2.5;

  let composer;
  try {
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(500, 400), 1.0, 0.4, 0.8));
  } catch(e) { composer = null; }

  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.0;

  // Lighting — bright enough to see GLB models clearly
  scene.add(new THREE.AmbientLight(0x334466, 0.8));
  scene.add(new THREE.HemisphereLight(0x6688bb, 0x222244, 1.5));
  const light = new THREE.DirectionalLight(0xffffff, 1.8);
  light.position.set(5, 8, 4);
  light.castShadow = true;
  scene.add(light);
  const fillLight = new THREE.DirectionalLight(0xaaccff, 0.9);
  fillLight.position.set(-6, 4, 8);
  scene.add(fillLight);
  const backLight = new THREE.DirectionalLight(0x00E5FF, 0.8);
  backLight.position.set(-5, -2, -5);
  scene.add(backLight);
  const rimLight = new THREE.PointLight(0x00E5FF, 0.6, 20);
  rimLight.position.set(0, 5, -3);
  scene.add(rimLight);

  // High-tech holographic wireframe fallbacks
  const mats = {
    water: new THREE.MeshPhysicalMaterial({ color: 0x1565C0, emissive: 0x0D47A1, emissiveIntensity: 2.0, wireframe: true }),
    electrolyzer: new THREE.MeshPhysicalMaterial({ color: 0xFFC107, emissive: 0xFF8F00, emissiveIntensity: 2.0, wireframe: true }),
    h2buffer: new THREE.MeshPhysicalMaterial({ color: 0x00897B, emissive: 0x004D40, emissiveIntensity: 2.0, wireframe: true }),
    fuelcell: new THREE.MeshPhysicalMaterial({ color: 0x00E5FF, emissive: 0x0097A7, emissiveIntensity: 2.0, wireframe: true }),
    battery: new THREE.MeshPhysicalMaterial({ color: 0x6A1B9A, emissive: 0x4A148C, emissiveIntensity: 2.0, wireframe: true }),
    motor: new THREE.MeshPhysicalMaterial({ color: 0x78909C, emissive: 0x455A64, emissiveIntensity: 2.0, wireframe: true })
  };

  let currentMesh = null;
  let animFrame = null;

  const loader = typeof THREE.GLTFLoader !== 'undefined' ? new THREE.GLTFLoader() : null;

  function buildComponent(type) {
    if (currentMesh) { scene.remove(currentMesh); currentMesh = null; }
    
    // Set UI copy
    if (type === 'water') {
      titleEl.innerText = "Water Reservoir";
      descEl.innerText = "Holds purified H₂O for the electrolysis process. Integrated sensors monitor purity levels to ensure maximum PEM efficiency without membrane degradation.";
    } 
    else if (type === 'electrolyzer') {
      titleEl.innerText = "PEM Electrolyzer";
      descEl.innerText = "Splits water into hydrogen and oxygen using excess grid or regenerative braking power. Capable of ramping from 0 to 100% load in under 50ms.";
    }
    else if (type === 'h2buffer') {
      titleEl.innerText = "H₂ Buffer Tank";
      descEl.innerText = "Stores pressurized hydrogen at 10 bar. Acts as a dynamic energy buffer, decoupling power generation from immediate consumption demands.";
    }
    else if (type === 'fuelcell') {
      titleEl.innerText = "PEM Fuel Cell";
      descEl.innerText = "Converts stored hydrogen back into electricity with zero emissions (only water exhaust). Operates at peak efficiency during steady-state cruising.";
    }
    else if (type === 'battery') {
      titleEl.innerText = "Battery Pack";
      descEl.innerText = "High C-rate lithium-ion pack. Handles transient power spikes (acceleration) and captures regenerative braking energy that the electrolyzer can't immediately process.";
    }
    else if (type === 'motor') {
      titleEl.innerText = "Electric Motor";
      descEl.innerText = "High-torque traction motor. Governed deterministically by the HydroCore organism to ensure flawless power delivery blending from both battery and fuel cell.";
    }
    else if (type === 'boiler') {
      titleEl.innerText = "Boiler / Steam Generator";
      descEl.innerText = "Converts thermal energy into high-pressure steam at 25+ MPa. Accepts nuclear, coal, gas, or solar thermal input. Organism-governed temperature and pressure ramp with SL5 safety interlocks.";
    }
    else if (type === 'superheater') {
      titleEl.innerText = "Superheater / Reheater";
      descEl.innerText = "Raises steam temperature to 700°C supercritical conditions through serpentine tube banks. Manages pseudocritical transition with SL5 creep monitoring on all tube surfaces.";
    }
    else if (type === 'turbine') {
      titleEl.innerText = "HP / LP Turbine Stages";
      descEl.innerText = "High-pressure and low-pressure expansion stages driving the 3,000 RPM synchronous shaft. Blade erosion monitoring via organism sensors. Exhaust directed to condenser.";
    }
    else if (type === 'generator') {
      titleEl.innerText = "Synchronous Generator";
      descEl.innerText = "1 GW synchronous generator with copper windings and excitation control. Grid synchronization maintained by organism governance for frequency stability.";
    }
    else if (type === 'condenser') {
      titleEl.innerText = "Condenser";
      descEl.innerText = "Steam-to-water phase transition via cooling tube bundles. Maintains condenser vacuum for turbine efficiency. Thermal rejection governance by organism control loop.";
    }
    else if (type === 'feedwater') {
      titleEl.innerText = "Feedwater Pump";
      descEl.innerText = "Returns condensed water to the boiler completing the Rankine cycle. Includes deaeration and preheating stages. Flow rate governed by organism demand signal.";
    }

    const finishSetup = (group) => {
      // Add wireframe glow halo
      const halo = new THREE.Group();
      group.children.forEach(c => {
        if (c.geometry) {
          const w = new THREE.Mesh(c.geometry, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.1 }));
          w.position.copy(c.position); w.rotation.copy(c.rotation);
          w.scale.copy(c.scale).multiplyScalar(1.05);
          halo.add(w);
        }
      });
      group.add(halo);

      currentMesh = group;
      scene.add(group);
      
      // Auto-adjust camera
      camera.position.set(3, 2, 4);
      controls.target.set(0, 0, 0);
      controls.update();
    };

    const buildFallback = () => {
      const group = new THREE.Group();
      const solidMat = (color) => new THREE.MeshPhysicalMaterial({ color, metalness: 0.7, roughness: 0.3, clearcoat: 0.3 });
      const pipeMat = new THREE.MeshPhysicalMaterial({ color: 0x777777, metalness: 0.85, roughness: 0.2 });

      if (type === 'water') {
        group.add(new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 3, 32), solidMat(0x1565C0)));
      } 
      else if (type === 'electrolyzer') {
        group.add(new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 2.5), solidMat(0xFFC107)));
        for (let i = 0; i < 8; i++) {
          const plate = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.4, 2.3), new THREE.MeshBasicMaterial({ color: 0xFFD54F, transparent: true, opacity: 0.5 }));
          plate.position.set(-0.8 + i * 0.22, 0, 0); group.add(plate);
        }
      }
      else if (type === 'h2buffer') {
        const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 3.5, 32), solidMat(0x00897B));
        tank.rotation.z = Math.PI / 2; group.add(tank);
        [-1.75, 1.75].forEach(x => {
          const cap = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 16), solidMat(0x00897B));
          cap.position.set(x, 0, 0); group.add(cap);
        });
      }
      else if (type === 'fuelcell') {
        group.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 1.8), solidMat(0x00E5FF)));
      }
      else if (type === 'battery') {
        group.add(new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 3), solidMat(0x6A1B9A)));
      }
      else if (type === 'motor') {
        const motor = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.5, 32), solidMat(0x78909C));
        motor.rotation.z = Math.PI / 2; group.add(motor);
      }
      // ── Steam plant components ──
      else if (type === 'boiler') {
        const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3.5, 32), solidMat(0x8B0000));
        group.add(drum);
        [-1.75, 1.75].forEach(y => {
          const cap = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI*2, 0, Math.PI/2), solidMat(0x8B0000));
          cap.position.y = y; cap.rotation.x = y > 0 ? 0 : Math.PI; group.add(cap);
        });
        for(let i=0; i<6; i++) {
          const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4, 8), pipeMat);
          tube.position.set(Math.cos(i*Math.PI/3)*0.7, 0, Math.sin(i*Math.PI/3)*0.7); group.add(tube);
        }
        const inlet = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.5, 12), pipeMat);
        inlet.rotation.z = Math.PI/2; inlet.position.set(1.8, 1, 0); group.add(inlet);
        const glow = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), new THREE.MeshBasicMaterial({ color:0xff4400, transparent:true, opacity:0.3 }));
        glow.position.y = -1.5; group.add(glow);
      }
      else if (type === 'superheater') {
        group.add(new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.2, 1.8), solidMat(0xD84315)));
        for(let row=0; row<3; row++) {
          for(let col=0; col<4; col++) {
            const tube = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.04, 8, 20, Math.PI), pipeMat);
            tube.position.set(-0.9+col*0.6, 0.8+row*0.5, 0);
            tube.rotation.z = col%2===0 ? 0 : Math.PI; group.add(tube);
          }
        }
      }
      else if (type === 'turbine') {
        const casing = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.3, 3.5, 32), solidMat(0x607D8B));
        casing.rotation.z = Math.PI/2; group.add(casing);
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5, 16), solidMat(0x999999));
        shaft.rotation.z = Math.PI/2; group.add(shaft);
        for(let i=0; i<5; i++) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5+i*0.1, 0.02, 6, 24), solidMat(0xB0BEC5));
          ring.position.x = -1.2+i*0.6; ring.rotation.y = Math.PI/2; group.add(ring);
        }
      }
      else if (type === 'generator') {
        const stator = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 2.5, 32, 1, true), solidMat(0xFFC107));
        stator.rotation.z = Math.PI/2; group.add(stator);
        const rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.8, 32), solidMat(0x555555));
        rotor.rotation.z = Math.PI/2; group.add(rotor);
        const copperMat = new THREE.MeshPhysicalMaterial({ color:0xB87333, metalness:0.9, roughness:0.2 });
        for(let i=0; i<6; i++) {
          const coil = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.06, 6, 24), copperMat);
          coil.position.x = -1+i*0.4; coil.rotation.y = Math.PI/2; group.add(coil);
        }
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 4.5, 12), solidMat(0x888888));
        shaft.rotation.z = Math.PI/2; group.add(shaft);
      }
      else if (type === 'condenser') {
        group.add(new THREE.Mesh(new THREE.BoxGeometry(3, 2, 2), solidMat(0x1565C0)));
        for(let row=0; row<4; row++) {
          for(let col=0; col<6; col++) {
            const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.2, 8), pipeMat);
            tube.rotation.z = Math.PI/2;
            tube.position.set(0, -0.6+row*0.4, -0.6+col*0.24); group.add(tube);
          }
        }
        const hotwell = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.5, 16), solidMat(0x0D47A1));
        hotwell.position.y = -1.5; group.add(hotwell);
      }
      else if (type === 'feedwater') {
        const volute = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.4, 16, 32, Math.PI*1.7), solidMat(0x00695C));
        group.add(volute);
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.8, 24), solidMat(0x00695C));
        hub.rotation.x = Math.PI/2; group.add(hub);
        const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.5, 16), pipeMat);
        motor.position.z = -1.1; motor.rotation.x = Math.PI/2; group.add(motor);
      }
      finishSetup(group);
    };

    if (loader) {
      loader.load(`models/${type}.glb`, function (gltf) {
        // Center the loaded GLTF model
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        gltf.scene.position.sub(center);
        
        // Ensure PBR materials react to our lighting — boost brightness
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.envMapIntensity = 1.5;
              if (child.material.emissive) {
                child.material.emissiveIntensity = Math.max(child.material.emissiveIntensity || 0, 0.15);
              }
              if (child.material.metalness !== undefined) {
                child.material.roughness = Math.min(child.material.roughness, 0.6);
              }
            }
          }
        });
        finishSetup(gltf.scene);
      }, undefined, function (error) {
        console.warn(`[HydroCore] Could not load models/${type}.glb. Falling back to programmatic geometry.`);
        buildFallback();
      });
    } else {
      buildFallback();
    }
  }

  function animate() {
    animFrame = requestAnimationFrame(animate);
    controls.update();
    if (composer) composer.render(); else renderer.render(scene, camera);
  }

  // Event Listeners
  document.querySelectorAll('.comp-card').forEach(card => {
    card.addEventListener('click', () => {
      const type = card.dataset.comp;
      buildComponent(type);
      modal.classList.add('active');
      
      // Fix size
      const rect = canvas.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      if(composer) composer.setSize(rect.width, rect.height);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();

      if (!animFrame) animate();
    });
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    }
  });

})();
