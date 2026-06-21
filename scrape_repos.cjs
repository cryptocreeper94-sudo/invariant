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
    let found = false;
    const searchPaths = ["index.html", "src/index.html", "public/index.html", "dist/index.html", "web/index.html", "app/index.html"];
    
    for (const sp of searchPaths) {
        const p = path.join(dir, sp);
        if (fs.existsSync(p)) {
            const html = fs.readFileSync(p, "utf8");
            const titleMatch = html.match(/<title>(.*?)<\/title>/i);
            const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
            console.log(`[${name.toUpperCase()}]`);
            console.log(`  Title: ${titleMatch ? titleMatch[1] : "N/A"}`);
            console.log(`  Desc:  ${descMatch ? descMatch[1] : "N/A"}`);
            console.log("");
            found = true;
            break;
        }
    }
    if (!found) console.log(`[${name.toUpperCase()}] - NO HTML FOUND`);
}
