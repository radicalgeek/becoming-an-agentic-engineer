import { readFile } from "node:fs/promises";

const corpus = [
  "spec/registration-validation.md",
  "src/accounts.js",
  "src/server.js",
  "tests/registration.test.js",
  "tests/api-contract.test.js",
  "tests/login-regression.test.js"
];
const evaluation = JSON.parse(await readFile("examples/02-context/retrieval-evaluation.json", "utf8"));
const documents = await Promise.all(corpus.map(async (source) => ({ source, text: await readFile(source, "utf8") })));

const runs = evaluation.queries.map(({ query, requiredSource }) => {
  const results = documents
    .map((document) => ({ ...document, score: score(query, document) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ source, score: rankScore, text }) => ({ source, score: rankScore, excerpt: excerpt(query, text) }));
  return { query, requiredSource, passed: results.some((result) => result.source === requiredSource), results };
});

console.log(JSON.stringify({ method: "source-aware lexical retrieval", runs, verdict: runs.every((run) => run.passed) ? "PASS" : "FAIL" }, null, 2));
if (!runs.every((run) => run.passed)) process.exitCode = 1;

function tokens(value) {
  return value.toLowerCase().match(/[a-z][a-z0-9_-]{2,}/g) || [];
}

function score(query, document) {
  const queryTokens = tokens(query);
  const body = document.text.toLowerCase();
  const path = document.source.toLowerCase();
  return queryTokens.reduce((total, token) => total + (path.includes(token) ? 8 : 0) + Math.min(5, body.split(token).length - 1), 0);
}

function excerpt(query, text) {
  const lines = text.split("\n");
  const queryTokens = tokens(query);
  const index = Math.max(0, lines.findIndex((line) => queryTokens.some((token) => line.toLowerCase().includes(token))));
  return lines.slice(index, index + 3).join(" ").trim().slice(0, 220);
}
