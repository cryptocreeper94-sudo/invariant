const fs = require("fs");
const path = require("path");

const distDir = "D:/invariant/dist";
const nodes = ["meridian", "hydrocore", "verdara", "lume-v", "biocore", "neurocore", "sociocore", "governancecore", "lume-cortex"];

nodes.forEach(node => {
    const p = path.join(distDir, node, "index.html");
    if (fs.existsSync(p)) {
        const html = fs.readFileSync(p, "utf8");
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
        console.log(`[${node.toUpperCase()}]`);
        console.log(`  Title: ${titleMatch ? titleMatch[1] : "N/A"}`);
        console.log(`  Desc:  ${descMatch ? descMatch[1] : "N/A"}`);
        console.log("");
    } else {
        console.log(`[${node.toUpperCase()}] - NOT FOUND`);
    }
});
