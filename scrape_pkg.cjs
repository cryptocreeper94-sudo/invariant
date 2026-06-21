const fs = require("fs");
const path = require("path");

const repos = {
  meridian: "D:/meridian",
  hydrocore: "D:/hydrocore",
  verdara: "D:/verdara-ultra",
  lumev: "D:/Lume-V",
  biocore: "D:/biocore",
  neurocore: "D:/neurocore",
  sociocore: "D:/sociocore",
  governancecore: "D:/governancecore",
  axiomcore: "D:/axiom42-engine",
  axiomnews: "D:/axiom-news",
  truthengine: "D:/truth-engine-core",
  trustlayer: "D:/trust-layer",
  lumecortex: "D:/lume-cortex",
  daemons: "D:/edmp_repo"
};

for (const [name, dir] of Object.entries(repos)) {
    const p = path.join(dir, "package.json");
    if (fs.existsSync(p)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(p, "utf8"));
            console.log(`[${name.toUpperCase()}]`);
            console.log(`  Pkg Desc: ${pkg.description || "N/A"}`);
        } catch(e) {}
    }
}
