const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const INVARIANT_DIST = path.join(__dirname, 'dist');
const LUME_V_SRC    = process.env.LUME_V_SRC    || path.join(__dirname, '..', 'lume-v-site', 'dist');
const MERIDIAN_SRC  = process.env.MERIDIAN_SRC  || path.join(__dirname, '..', 'meridian-ui', 'dist');
const VERDARA_SRC   = process.env.VERDARA_SRC   || path.join(__dirname, '..', 'verdara');
const CORTEX_SRC    = process.env.CORTEX_SRC    || path.join(__dirname, '..', 'LumeCortex', 'dist');
const BIOCORE_SRC   = process.env.BIOCORE_SRC   || path.join(__dirname, '..', 'biocore', 'dist');
const NEUROCORE_SRC = process.env.NEUROCORE_SRC || path.join(__dirname, '..', 'neurocore', 'dist');
const SOCIOCORE_SRC = process.env.SOCIOCORE_SRC || path.join(__dirname, '..', 'sociocore', 'dist');
const GOVERNANCE_SRC= process.env.GOVERNANCE_SRC|| path.join(__dirname, '..', 'governancecore', 'dist');
const FLA_SRC       = process.env.FLA_SRC       || path.join(__dirname, '..', 'FLA', 'dist');

console.log("✦ [INVARIANT OS] Initiating Monorepo Build Pipeline...");

// 1. Compile Invariant Hub
console.log("\n-> Compiling Invariant Hub (DWSC)...");
try {
    execSync('node build.js', { stdio: 'inherit' });
} catch (e) {
    console.error("Fatal Error compiling Invariant:", e.message);
    process.exit(1);
}

console.log("\n-> Merging Ecosystem Projects into Subsystems...");

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });
    let entries = fs.readdirSync(src, { withFileTypes: true });
    for (let entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'src') continue;
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);
        entry.isDirectory() ? copyDir(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
    }
}

// 2. Merge Lume-V (Static Vite Build)
console.log("   [+] Ingesting Lume-V...");
if (fs.existsSync(LUME_V_SRC)) {
  copyDir(LUME_V_SRC, path.join(INVARIANT_DIST, 'lumev'));
  console.log('✓ Lume-V copied');
} else {
  console.warn('⚠ LUME_V_SRC not found — skipping Lume-V copy');
}

// 3. Merge Meridian (Static Build)
console.log("   [+] Ingesting Meridian...");
copyDir(MERIDIAN_SRC, path.join(INVARIANT_DIST, 'meridian'));

// HydroCore removed — canonical at https://hydrocore.dev

// 5. Merge Lume-Cortex (Static Vite Build)
console.log("   [+] Ingesting Lume-Cortex...");
copyDir(CORTEX_SRC, path.join(INVARIANT_DIST, 'lume-cortex'));

// 6. Merge Verdara Ultra
console.log("   [+] Ingesting Verdara Ultra...");
copyDir(VERDARA_SRC, path.join(INVARIANT_DIST, 'verdara'));

// 7. Merge Human OS Nodes
console.log("   [+] Ingesting Human OS Nodes (BioCore, NeuroCore, SocioCore, GovernanceCore)...");
copyDir(BIOCORE_SRC, path.join(INVARIANT_DIST, 'biocore'));
copyDir(NEUROCORE_SRC, path.join(INVARIANT_DIST, 'neurocore'));
copyDir(SOCIOCORE_SRC, path.join(INVARIANT_DIST, 'sociocore'));
copyDir(GOVERNANCE_SRC, path.join(INVARIANT_DIST, 'governancecore'));

// 8. Merge Fractal Ledger Architecture (FLA)
console.log("   [+] Ingesting Fractal Ledger Architecture (FLA)...");
copyDir(FLA_SRC, path.join(INVARIANT_DIST, 'fla'));

console.log("\n✦ Ecosystem Merge Complete. All sub-systems physically unified in dist directory");

