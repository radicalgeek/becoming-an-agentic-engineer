import test from "node:test";
import assert from "node:assert/strict";
import { createAccountsService, validateRegistration } from "../src/accounts.js";

test("validation reports each malformed field", () => {
  const result = validateRegistration({ email: "wrong", password: "short", name: " " });
  assert.equal(result.valid, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ["email", "name", "password"]);
});

test("valid registration preserves the public response contract", () => {
  const service = createAccountsService();
  const result = service.register({ email: "ADA@EXAMPLE.COM ", password: "CorrectHorse9", name: " Ada " });
  assert.equal(result.status, 201);
  assert.equal(result.body.email, "ada@example.com");
  assert.equal(result.body.name, "Ada");
  assert.equal(typeof result.body.id, "string");
  assert.equal("password" in result.body, false);
  assert.equal(service.count(), 1);
});

test("duplicate registration returns a conflict", () => {
  const service = createAccountsService();
  const input = { email: "ada@example.com", password: "CorrectHorse9", name: "Ada" };
  assert.equal(service.register(input).status, 201);
  assert.equal(service.register(input).status, 409);
});
