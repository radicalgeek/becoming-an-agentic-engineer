import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const template = JSON.parse(await readFile("examples/03-workflow/ralph-plan.json", "utf8"));
const workspace = ".course-output/ralph";
const planFile = `${workspace}/plan.json`;
await rm(workspace, { recursive: true, force: true });
await mkdir(workspace, { recursive: true });
await writeFile(planFile, `${JSON.stringify({ ...template, items: template.items.map((item) => ({ ...item, status: "pending" })) }, null, 2)}\n`);

for (let iteration = 1; iteration <= template.maximumIterations; iteration += 1) {
  const run = spawnSync(process.execPath, ["scripts/ralph-iteration.js", planFile, String(iteration)], { encoding: "utf8" });
  process.stdout.write(run.stdout);
  if (run.status !== 0) {
    process.stderr.write(run.stderr);
    process.exitCode = 1;
    break;
  }
  const current = JSON.parse(await readFile(planFile, "utf8"));
  if (current.items.every((item) => item.status === "complete")) {
    console.log(`DONE: deterministic plan check passed after ${iteration} fresh iterations`);
    break;
  }
  if (iteration === template.maximumIterations) {
    console.error("STOP: maximum iteration budget reached");
    process.exitCode = 1;
  }
}
