import { randomUUID } from "node:crypto";

export function validateRegistration(input) {
  const errors = {};
  const email = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input?.password === "string" ? input.password : "";
  const name = typeof input?.name === "string" ? input.name.trim() : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address";
  }
  if (password.length < 12 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    errors.password = "Use at least 12 characters with upper, lower, and numeric characters";
  }
  if (name.length < 2 || name.length > 80) {
    errors.name = "Use between 2 and 80 characters";
  }

  return { valid: Object.keys(errors).length === 0, errors, value: { email, password, name } };
}

export function createAccountsService(seedUsers = []) {
  const users = new Map(seedUsers.map((user) => [user.email.toLowerCase(), { ...user }]));

  return {
    register(input) {
      const result = validateRegistration(input);
      if (!result.valid) return { status: 422, body: { errors: result.errors } };
      if (users.has(result.value.email)) return { status: 409, body: { error: "Email already registered" } };

      const user = { id: randomUUID(), ...result.value };
      users.set(user.email, user);
      return { status: 201, body: publicUser(user) };
    },

    login(input) {
      const email = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
      const user = users.get(email);
      if (!user || user.password !== input?.password) {
        return { status: 401, body: { error: "Invalid credentials" } };
      }
      return { status: 200, body: publicUser(user) };
    },

    count() {
      return users.size;
    }
  };
}

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name };
}
