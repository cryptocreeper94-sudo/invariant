const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const INVARIANT_DIST = path.join(__dirname, 'dist');

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
copyDir('D:\\lume-v-site\\dist', path.join(INVARIANT_DIST, 'lume-v'));

// 3. Merge Meridian (Static Build)
console.log("   [+] Ingesting Meridian...");
copyDir('D:\\meridian-ui\\dist', path.join(INVARIANT_DIST, 'meridian'));

// 4. Merge Hydrocore (Root Static Files)
console.log("   [+] Ingesting Hydrocore...");
fs.mkdirSync(path.join(INVARIANT_DIST, 'hydrocore'), { recursive: true });
const hydrocoreAssets = [
    'index.html', 'style.css', 'main.js', 'engine3d.js', 
    'steam3d.js', 'vehicle3d.js', 'organism3d.js', 
    'images', 'models', 'pwa', 'hero-bg.png'
];
hydrocoreAssets.forEach(asset => {
    const srcP = path.join('D:\\hydrocore', asset);
    const destP = path.join(INVARIANT_DIST, 'hydrocore', asset);
    if (fs.existsSync(srcP)) {
        if (fs.statSync(srcP).isDirectory()) {
            copyDir(srcP, destP);
        } else {
            fs.copyFileSync(srcP, destP);
        }
    }
});

console.log("\n✦ Ecosystem Merge Complete. All sub-systems physically unified in D:\\invariant\\dist\\");
