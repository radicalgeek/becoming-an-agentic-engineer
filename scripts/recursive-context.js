import { readFile } from "node:fs/promises";

const task = JSON.parse(await readFile("examples/02-context/recursive-task.json", "utf8"));
const corpus = await Promise.all(task.corpus.map(async (source) => ({ source, text: await readFile(source, "utf8") })));
const trace = [];
const findings = inspect(corpus, 0);
const categories = new Set(findings.map((finding) => finding.category));
const passed = task.requiredFindings.every((category) => categories.has(category));

console.log(JSON.stringify({
  strategy: "recursive partition, inspect, aggregate",
  question: task.question,
  trace,
  findings,
  verdict: passed ? "PASS" : "FAIL"
}, null, 2));
if (!passed) process.exitCode = 1;

function inspect(items, depth) {
  const size = items.reduce((total, item) => total + item.text.length, 0);
  trace.push({ depth, sources: items.map((item) => item.source), characters: size });
  if (depth >= task.maximumDepth || (size <= task.maximumLeafCharacters && items.length === 1)) {
    return items.flatMap(inspectLeaf);
  }
  if (items.length === 1) {
    const item = items[0];
    const middle = Math.ceil(item.text.length / 2);
    return [
      { source: `${item.source}#part-1`, text: item.text.slice(0, middle) },
      { source: `${item.source}#part-2`, text: item.text.slice(middle) }
    ].flatMap((part) => inspect([part], depth + 1));
  }
  const middle = Math.ceil(items.length / 2);
  return [items.slice(0, middle), items.slice(middle)].flatMap((partition) => inspect(partition, depth + 1));
}

function inspectLeaf(item) {
  const lower = item.text.toLowerCase();
  const output = [];
  if (lower.includes("register") || lower.includes("registration")) output.push({ category: "registration", source: item.source });
  if (lower.includes("422") || lower.includes("201") || lower.includes("response contract")) output.push({ category: "contract", source: item.source });
  if (lower.includes("login") || lower.includes("credentials")) output.push({ category: "login", source: item.source });
  return output;
}
