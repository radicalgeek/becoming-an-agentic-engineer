# Registration validation specification

Version: 1.0.0

## Goal

Reject malformed public registration requests with useful field-level errors while preserving valid registration and all existing login behaviour.

## Contract

`POST /api/register` accepts JSON with `email`, `password`, and `name`.

- `email` must be a syntactically valid email address.
- `password` must contain at least 12 characters, one uppercase letter, one lowercase letter, and one number.
- `name` must contain 2 to 80 non-whitespace characters.
- An invalid request returns HTTP 422 and `{ "errors": { "field": "message" } }`.
- A valid request returns HTTP 201 and a public user object containing `id`, `email`, and `name`.
- A duplicate email returns HTTP 409.

## Protected behaviour

- The internal user record remains `{ id, email, name, password }`.
- `POST /api/login` continues to accept the same credentials and return HTTP 200 with the public user object.
- No database or migration files are part of this task.

## Evidence

The unit suite, API contract suite, login regression suite, scope check, secret scan, and performance budget must all pass.
