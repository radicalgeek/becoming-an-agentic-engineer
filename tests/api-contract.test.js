import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { buildServer } from "../src/server.js";

async function withServer(run) {
  const server = buildServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
    await once(server, "close");
  }
}

test("malformed registration returns 422 and field errors", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "bad", password: "short", name: "" })
    });
    const body = await response.json();
    assert.equal(response.status, 422);
    assert.deepEqual(Object.keys(body.errors).sort(), ["email", "name", "password"]);
  });
});

test("valid registration returns the documented response", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "grace@example.com", password: "CompilerNavy6", name: "Grace" })
    });
    const body = await response.json();
    assert.equal(response.status, 201);
    assert.deepEqual(Object.keys(body).sort(), ["email", "id", "name"]);
  });
});
