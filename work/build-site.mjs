import fs from "node:fs";
import path from "node:path";

const requiredFiles = [
  "index.html",
  "status.html",
  "regels.html",
  "faq.html",
  "privacy.html",
  "cookies.html",
  "changelog.html",
  "script.js",
  "styles.css",
];

const outputDir = path.resolve("outputs");
const missing = requiredFiles.filter((fileName) => !fs.existsSync(path.join(outputDir, fileName)));

if (missing.length) {
  console.error("Build mist statische outputbestanden: " + missing.join(", "));
  process.exit(1);
}

console.log("Amsterdam Roleplay main site is klaar voor deploy.");
