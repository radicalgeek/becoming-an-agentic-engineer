import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const plan = JSON.parse(await readFile("examples/04-evidence/merge-readiness-plan.json", "utf8"));
const checks = [];

for (const script of ["test:unit", "test:contract", "test:login", "lint"]) {
  const result = spawnSync("npm", ["run", "--silent", script], { encoding: "utf8" });
  checks.push({
    command: `npm run ${script}`,
    exitCode: result.status,
    summary: lastMeaningfulLine(result.stdout || result.stderr)
  });
}

const evidence = {
  intent: plan.intent,
  filesChanged: process.env.CHANGED_FILES?.split(",").filter(Boolean) || plan.expectedFiles,
  risk: plan.risk,
  checks,
  evidence: `${checks.filter((check) => check.exitCode === 0).length}/${checks.length} checks passed`,
  focusAreas: plan.focusAreas,
  knownGaps: plan.knownGaps,
  rollback: plan.rollback,
  status: checks.every((check) => check.exitCode === 0) ? "verified" : "blocked"
};

await mkdir(".course-output", { recursive: true });
await writeFile(".course-output/evidence-pack.json", `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));
if (evidence.status !== "verified") process.exitCode = 1;

function lastMeaningfulLine(text) {
  return text.trim().split("\n").filter(Boolean).at(-1) || "completed";
}
