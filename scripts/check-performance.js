import { performance } from "node:perf_hooks";
import { validateRegistration } from "../src/accounts.js";

const samples = 10000;
const input = { email: "ada@example.com", password: "CorrectHorse9", name: "Ada Lovelace" };
const started = performance.now();
for (let index = 0; index < samples; index += 1) validateRegistration(input);
const elapsedMs = performance.now() - started;
const averageMs = elapsedMs / samples;
const budgetMs = 0.2;

console.log(JSON.stringify({ samples, elapsedMs: Number(elapsedMs.toFixed(2)), averageMs: Number(averageMs.toFixed(5)), budgetMs }, null, 2));
if (averageMs >= budgetMs) process.exitCode = 1;
