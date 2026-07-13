import { once } from "node:events";
import { mkdir, writeFile } from "node:fs/promises";
import { buildServer } from "../src/server.js";

const server = buildServer();
server.listen(0, "127.0.0.1");
await once(server, "listening");
const baseUrl = `http://127.0.0.1:${server.address().port}`;

try {
  const probes = [];
  probes.push(await post("malformed registration", "/api/register", { email: "bad", password: "short", name: "" }, 422));
  probes.push(await post("valid registration", "/api/register", { email: "review@example.com", password: "ReviewReady8", name: "Review User" }, 201));
  probes.push(await post("login after registration", "/api/login", { email: "review@example.com", password: "ReviewReady8" }, 200));
  probes.push(await post("bad login remains unauthorized", "/api/login", { email: "review@example.com", password: "wrong" }, 401));

  const report = {
    charter: "examples/07-gated-delivery/product-review-charter.md",
    context: "fresh, product-facing, read-only",
    probes,
    verdict: probes.every((probe) => probe.passed) ? "PASS" : "FINDINGS"
  };
  await mkdir(".course-output", { recursive: true });
  await writeFile(".course-output/product-review.json", `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (report.verdict !== "PASS") process.exitCode = 1;
} finally {
  server.close();
  await once(server, "close");
}

async function post(name, path, body, expectedStatus) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  return { name, expectedStatus, actualStatus: response.status, passed: response.status === expectedStatus };
}
