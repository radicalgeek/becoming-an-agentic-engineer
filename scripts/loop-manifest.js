import { readFile } from "node:fs/promises";

export const manifestPath = "examples/03-workflow/loop.json";

export async function loadLoopManifest() {
  return JSON.parse(await readFile(manifestPath, "utf8"));
}

export function validateLoopManifest(manifest) {
  const required = ["id", "trigger", "workDiscovery", "goal", "context", "isolation", "architecture", "verification", "state", "progress", "budgets", "terminalStates"];
  const missing = required.filter((field) => manifest[field] === undefined);
  if (missing.length) throw new Error(`Loop manifest is missing: ${missing.join(", ")}`);

  for (const field of ["complete", "blocked", "budget_exceeded", "escalated"]) {
    if (!manifest.terminalStates[field]) throw new Error(`Loop manifest needs terminal state: ${field}`);
  }
  if (manifest.architecture.makerCheckerSeparated !== true) throw new Error("The reference loop must separate worker and checker");
  if (!manifest.state.path || !manifest.state.claimLease) throw new Error("Loop state needs a durable path and an exclusive claim lease");
  if (!manifest.progress.retryRequiresOneOf?.includes("changed strategy") || !manifest.progress.retryRequiresOneOf?.includes("new evidence")) {
    throw new Error("Retries must require a changed strategy or new evidence");
  }
  if (!Number.isInteger(manifest.budgets.maximumIterations) || manifest.budgets.maximumIterations < 1) {
    throw new Error("maximumIterations must be a positive integer");
  }
  return manifest;
}
