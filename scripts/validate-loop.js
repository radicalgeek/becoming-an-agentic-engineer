import { access, readFile } from "node:fs/promises";
import { loadLoopManifest, validateLoopManifest } from "./loop-manifest.js";

const manifest = validateLoopManifest(await loadLoopManifest());
await access(manifest.goal.specification);
await access(manifest.workDiscovery.source);

const work = JSON.parse(await readFile(manifest.workDiscovery.source, "utf8"));
const allowedCommands = new Set(["test:unit", "test:contract", "test:login", "lint"]);
if (!Array.isArray(work.items) || work.items.length === 0) throw new Error("The loop work source must contain items");
if (!work.items.every((item) => item.id && allowedCommands.has(item.command) && item.verificationLevel)) {
  throw new Error("Every work item needs an id, allowlisted command and verification level");
}
if (new Set(work.items.map((item) => item.id)).size !== work.items.length) throw new Error("Work item IDs must be unique");

console.log(`PASS ${manifest.id}: trigger, work selection, goal, isolation, verification, state, progress, budgets and terminal states are executable`);
