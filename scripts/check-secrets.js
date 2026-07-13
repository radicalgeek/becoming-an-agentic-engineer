import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const roots = ["src", "tests", "scripts", "examples", "spec"];
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /(?:api[_-]?key|secret|token)\s*[:=]\s*["'][A-Za-z0-9_\-]{20,}["']/i,
  /ghp_[A-Za-z0-9]{30,}/
];
const findings = [];

for (const root of roots) {
  for (const file of await filesUnder(root)) {
    const content = await readFile(file, "utf8");
    if (patterns.some((pattern) => pattern.test(content))) findings.push(file);
  }
}

console.log(JSON.stringify({ filesScanned: roots, findings }, null, 2));
if (findings.length) process.exitCode = 1;

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await filesUnder(target));
    else output.push(target);
  }
  return output;
}
