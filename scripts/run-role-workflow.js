import { readFile } from "node:fs/promises";

const cards = JSON.parse(await readFile("examples/06-multi-agent/role-cards.json", "utf8"));
const requiredRoles = ["orchestrator", "implementer", "reviewer", "merge-agent"];
const roles = new Map(cards.roles.map((role) => [role.name, role]));

for (const roleName of requiredRoles) {
  const role = roles.get(roleName);
  if (!role) throw new Error(`Missing role card: ${roleName}`);
  if (!role.allowed.length || !role.blocked.length || !role.output) throw new Error(`Incomplete role card: ${roleName}`);
}

if (!roles.get("reviewer").blocked.includes("edit")) throw new Error("Reviewer must remain read-only");
if (cards.handoff.length !== 5) throw new Error("Handoff contract must contain five fields");

const workflow = requiredRoles.map((name, index) => ({
  order: index + 1,
  role: name,
  output: roles.get(name).output,
  writesCode: roles.get(name).allowed.some((permission) => permission.includes("edit"))
}));
console.log(JSON.stringify({ valid: true, workflow, handoff: cards.handoff }, null, 2));
