import { mkdir, open, readFile, unlink, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { loadLoopManifest, validateLoopManifest } from "./loop-manifest.js";

const manifest = validateLoopManifest(await loadLoopManifest());
const work = JSON.parse(await readFile(manifest.workDiscovery.source, "utf8"));
await mkdir(manifest.state.path.slice(0, manifest.state.path.lastIndexOf("/")), { recursive: true });

let lease;
try {
  lease = await open(manifest.state.claimLease, "wx");
  await lease.writeFile(`${JSON.stringify({ loopId: manifest.id, pid: process.pid, claimedAt: new Date().toISOString() })}\n`);
} catch (error) {
  if (error.code !== "EEXIST") throw error;
  console.error(`ESCALATED ${manifest.id}: another runner owns ${manifest.state.claimLease}`);
  process.exitCode = 1;
}

if (lease) {
  try {
    await runOnce();
  } finally {
    await lease.close();
    await unlink(manifest.state.claimLease).catch(() => {});
  }
}

async function runOnce() {
  let state;
  try {
    state = JSON.parse(await readFile(manifest.state.path, "utf8"));
  } catch {
    state = {
      loopId: manifest.id,
      terminalState: "running",
      iteration: 0,
      items: work.items.map((item) => ({ ...item, status: "pending" })),
      history: []
    };
  }

  if (state.terminalState !== "running") {
    console.log(`NOOP ${manifest.id}: terminal state is ${state.terminalState}`);
    return;
  }
  if (state.iteration >= manifest.budgets.maximumIterations) {
    state.terminalState = "budget_exceeded";
    await persist(state);
    console.error(`STOP ${manifest.id}: maximum iteration budget reached`);
    process.exitCode = 1;
    return;
  }

  const item = state.items.find((candidate) => candidate.status === "pending");
  if (!item) {
    state.terminalState = "complete";
    await persist(state);
    console.log(`COMPLETE ${manifest.id}: every eligible work item has evidence`);
    return;
  }

  state.iteration += 1;
  const result = spawnSync("npm", ["run", "--silent", item.command], { encoding: "utf8" });
  item.status = result.status === 0 ? "complete" : "blocked";
  item.evidence = `${item.command} exited ${result.status}`;
  item.iteration = state.iteration;
  state.history.push({ iteration: state.iteration, item: item.id, command: item.command, result: item.status });
  state.terminalState = result.status === 0
    ? (state.items.every((candidate) => candidate.status === "complete") ? "complete" : "running")
    : "blocked";
  await persist(state);

  console.log(`ITERATION ${state.iteration}: selected ${item.id}; ${item.evidence}; state=${state.terminalState}`);
  if (result.status !== 0) process.exitCode = 1;
}

async function persist(state) {
  await writeFile(manifest.state.path, `${JSON.stringify(state, null, 2)}\n`);
}
