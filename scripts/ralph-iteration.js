import { access, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const [planFile, iterationText] = process.argv.slice(2);
const plan = JSON.parse(await readFile(planFile, "utf8"));
const item = plan.items.find((candidate) => candidate.status !== "complete");
if (!item) process.exit(0);

let passed = false;
if (item.check === "spec") {
  try {
    await access("spec/registration-validation.md");
    passed = true;
  } catch {
    passed = false;
  }
} else {
  const result = spawnSync("npm", ["run", "--silent", item.check], { encoding: "utf8" });
  passed = result.status === 0;
}

item.status = passed ? "complete" : "blocked";
item.iteration = Number(iterationText);
item.evidence = passed ? `check ${item.check} passed` : `check ${item.check} failed`;
await writeFile(planFile, `${JSON.stringify(plan, null, 2)}\n`);
console.log(`iteration ${iterationText}: ${item.id} -> ${item.status}; state persisted to ${planFile}`);
if (!passed) process.exitCode = 1;
