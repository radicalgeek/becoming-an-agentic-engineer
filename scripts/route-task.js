import { readFile } from "node:fs/promises";

const policy = JSON.parse(await readFile("examples/05-routing/routing-policy.json", "utf8"));
const request = {
  step: process.env.STEP || "implement",
  dataClass: process.env.DATA_CLASS || "internal"
};
const rule = policy.rules[request.step];

if (!rule) throw new Error(`Unknown step: ${request.step}`);
const allowed = policy.dataRules[request.dataClass];
if (!allowed) throw new Error(`Unknown data class: ${request.dataClass}`);

const lane = allowed.includes(rule.lane) ? rule.lane : allowed.includes(rule.fallback) ? rule.fallback : "stop";
const decision = {
  ...request,
  lane,
  reason: lane === "stop" ? "No approved lane for this data class" : `${lane} is approved for ${request.step} with ${request.dataClass} data`,
  fallback: rule.fallback
};

console.log(JSON.stringify(decision, null, 2));
if (lane === "stop") process.exitCode = 2;
