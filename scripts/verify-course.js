import { access, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const required = [
  "examples/01-classification/task-classification.json",
  "examples/02-context/context-pack.json",
  "examples/02-context/retrieval-evaluation.json",
  "examples/02-context/recursive-task.json",
  "examples/03-workflow/workflow.json",
  "examples/03-workflow/loop.json",
  "examples/03-workflow/loop-work.json",
  "examples/03-workflow/ralph-plan.json",
  "examples/04-evidence/merge-readiness-plan.json",
  "examples/05-routing/routing-policy.json",
  "examples/06-multi-agent/role-cards.json",
  "examples/07-gated-delivery/gate-set.json",
  "examples/07-gated-delivery/product-review-charter.md",
  "examples/07-gated-delivery/rebuild-rule.md",
  "examples/08-adoption/thirty-day-plan.md"
];
for (const file of required) await access(file);

const gateSet = JSON.parse(await readFile("examples/07-gated-delivery/gate-set.json", "utf8"));
if (gateSet.gates.length !== 7) throw new Error("The reference gate set must contain seven gates");
if (!gateSet.gates.every((gate) => gate.id && gate.script && gate.failureRoute)) throw new Error("Every gate needs an id, script and failure route");

for (const script of ["example:classify", "example:context", "example:rag", "example:recursive-context", "example:workflow", "loop:validate", "loop:simulate", "example:ralph", "example:route", "example:team"]) {
  const result = spawnSync("npm", ["run", "--silent", script], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${script} failed: ${result.stderr}`);
}

console.log(`Course verification passed: ${required.length} completed artefacts and ${gateSet.gates.length} executable gates`);
