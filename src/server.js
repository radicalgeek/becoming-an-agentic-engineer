import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { createAccountsService } from "./accounts.js";

export function buildServer(accounts = createAccountsService()) {
  return createServer(async (request, response) => {
    if (request.method === "GET" && request.url === "/health") {
      return send(response, 200, { status: "ok" });
    }

    const handlers = {
      "POST /api/register": (body) => accounts.register(body),
      "POST /api/login": (body) => accounts.login(body)
    };
    const handler = handlers[`${request.method} ${request.url}`];
    if (!handler) return send(response, 404, { error: "Not found" });

    try {
      const body = await readJson(request);
      const result = handler(body);
      return send(response, result.status, result.body);
    } catch {
      return send(response, 400, { error: "Request body must be valid JSON" });
    }
  });
}

function send(response, status, body) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  buildServer().listen(port, () => console.log(`accounts-api listening on http://localhost:${port}`));
}
