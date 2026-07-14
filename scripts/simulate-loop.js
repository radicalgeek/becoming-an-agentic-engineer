import { rm, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { loadLoopManifest, validateLoopManifest } from "./loop-manifest.js";

const manifest = validateLoopManifest(await loadLoopManifest());
await rm(manifest.state.path, { force: true });

console.log(`TRIGGER ${manifest.trigger.type}: discover -> select -> isolate -> execute -> verify -> persist`);
for (let iteration = 1; iteration <= manifest.budgets.maximumIterations; iteration += 1) {
  const run = spawnSync(process.execPath, ["scripts/run-loop-once.js"], { encoding: "utf8" });
  process.stdout.write(run.stdout);
  if (run.status !== 0) {
    process.stderr.write(run.stderr);
    process.exitCode = 1;
    break;
  }
  const state = JSON.parse(await readFile(manifest.state.path, "utf8"));
  if (state.terminalState === "complete") {
    console.log(`TERMINAL complete after ${state.iteration} fresh scheduled runs`);
    break;
  }
}
