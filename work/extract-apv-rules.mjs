import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync("work/apv.html", "utf8");
const start = html.indexOf("const allRules = [");
const end = html.indexOf("function buildAccordion", start);

if (start === -1 || end === -1) {
  throw new Error("Could not find APV rules block.");
}

const source = `${html.slice(start, end)}\nglobalThis.__rules = allRules;`;
const context = {};
vm.createContext(context);
vm.runInContext(source, context);

const rules = context.__rules.map((rule) => ({
  num: String(rule.num),
  title: String(rule.title),
  sanction: String(rule.sanctie),
  category: String(rule.catClass).replace("cat", "").replace("-var", "var"),
  content: String(rule.content),
}));

const output = `window.APV_RULES = ${JSON.stringify(rules, null, 2)};\n`;
fs.writeFileSync("outputs/assets/apv-rules.js", output, "utf8");
console.log(`Extracted ${rules.length} APV rules.`);
