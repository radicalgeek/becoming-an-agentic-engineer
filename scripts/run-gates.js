import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const manifest = JSON.parse(await readFile("examples/07-gated-delivery/gate-set.json", "utf8"));
const results = [];

for (const gate of manifest.gates) {
  const result = spawnSync("npm", ["run", "--silent", gate.script], {
    encoding: "utf8",
    env: process.env
  });
  const passed = result.status === 0;
  results.push({
    gate: gate.id,
    passed,
    exitCode: result.status,
    failureRoute: passed ? null : gate.failureRoute,
    output: concise(result.stdout || result.stderr)
  });
  console.log(`${passed ? "PASS" : "FAIL"} ${gate.id}`);
  if (!passed && gate.failureRoute === "stop") break;
}

const allRan = results.length === manifest.gates.length;
const report = {
  gateSet: manifest.name,
  version: manifest.version,
  taskClass: manifest.taskClass,
  generatedAt: new Date().toISOString(),
  results,
  verdict: allRan && results.every((result) => result.passed) ? "MERGE" : "STOP"
};

await mkdir(".course-output", { recursive: true });
await writeFile(".course-output/gate-report.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(`\nVERDICT: ${report.verdict}`);
console.log("Report: .course-output/gate-report.json");
if (report.verdict !== "MERGE") process.exitCode = 1;

function concise(text) {
  return text.trim().split("\n").filter(Boolean).slice(-4).join("\n");
}
