<p align="center">
  <img src="assets/radical-geek-logo.png" alt="Radical Geek Technology Solutions" width="210">
</p>

# Becoming an Agentic Engineer

Runnable companion repository for the Radical Geek course **Becoming an Agentic Engineer: From Software Engineer to Agentic Engineer**.

The course follows one change from ordinary software work to evidence-gated delivery: add validation to `POST /api/register` without changing the user data shape or login behaviour. This repository makes that example executable.

## Start here

Requirements: Node.js 20 or later. There are no runtime dependencies and no install step.

```bash
npm test
npm run verify:course
npm run gate
npm run review:product
```

Start the example service:

```bash
npm start
```

Then call `http://localhost:3000/api/register` or `http://localhost:3000/api/login`.

## Course path

| Module | What changes in the engineer's work | Runnable example |
|---|---|---|
| 1. Classify | Bound the work before delegating it | `npm run example:classify` |
| 2. Context | Give the agent a finite working set | `npm run example:context` |
| 3. Workflow | Select a delivery loop and stop conditions | `npm run example:workflow` |
| 4. Evidence | Define and collect proof of the change | `npm run example:evidence` |
| 5. Routing | Route each step by capability, risk and data | `npm run example:route` |
| 6. Multi-agent | Separate planning, implementation, review and merge | `npm run example:team` |
| 7. Gated delivery | Let deterministic evidence issue the verdict | `npm run gate` |
| 8. Operate | Review the product and improve the system | `npm run review:product` |

Each directory under `examples/` contains a completed reference artefact. The commands validate those artefacts rather than merely printing prose.

## What the gates prove

The gate set in `examples/07-gated-delivery/gate-set.json` checks:

- the evidence pack has the required fields;
- registration validation behaves as specified;
- the public API contract has not drifted;
- login behaviour still passes unchanged;
- changed files stay inside the allowed task boundary;
- source and course artefacts contain no obvious committed secrets;
- validation remains inside its performance budget.

`npm run gate` writes a machine-readable report to `.course-output/gate-report.json`. A failed gate stops the verdict.

## Try a failure deliberately

Set an out-of-scope changed file and run the gate set:

```bash
CHANGED_FILES="src/accounts.js,migrations/001-users.sql" npm run gate
```

The scope gate refuses the run before a merge verdict can be issued.

## Repository map

- `src/` — the small `accounts-api` service.
- `tests/` — behaviour, contract and protected-login checks.
- `spec/` — the change specification the examples are anchored to.
- `examples/` — completed outputs for Modules 1–8.
- `scripts/` — executable routing, evidence, review and gate machinery.
- `.github/workflows/ci.yml` — the same verification path in CI.

Copyright 2026 Radical Geek. Code is available under the MIT License.
