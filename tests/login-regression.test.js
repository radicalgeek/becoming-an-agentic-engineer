import test from "node:test";
import assert from "node:assert/strict";
import { createAccountsService } from "../src/accounts.js";

const existingUser = {
  id: "user-existing",
  email: "existing@example.com",
  name: "Existing User",
  password: "ExistingPass7"
};

test("existing credentials still log in", () => {
  const result = createAccountsService([existingUser]).login({
    email: existingUser.email,
    password: existingUser.password
  });
  assert.deepEqual(result, {
    status: 200,
    body: { id: existingUser.id, email: existingUser.email, name: existingUser.name }
  });
});

test("incorrect credentials still return 401", () => {
  const result = createAccountsService([existingUser]).login({
    email: existingUser.email,
    password: "not-the-password"
  });
  assert.equal(result.status, 401);
});
