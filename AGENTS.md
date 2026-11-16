# Agent Configuration

## Invoking the agent

The [opencode](https://opencode.ai) agent responds to commands in GitHub issue
comments using `/oc` or `/opencode` (the configured `mentions`). See
[`.github/workflows/opencode.yml`](./.github/workflows/opencode.yml) for the
workflow implementation. Only trusted participants (`OWNER`, `MEMBER`,
`COLLABORATOR`) can trigger it; bot comments are ignored. Sessions are not
shared publicly (`share: false`).

### Example commands

```
/oc explain this issue
/opencode triage
```

### Available skills

The agent has access to:

- **issue-tracker**: GitHub Issues management with `gh` CLI
- **triage-labels**: Apply triage labels from the configured set
- **domain**: Access to `GLOSSARY.md` and decisions in `docs/adr/`
- **code-review**: Review code changes for standards and specifications
- **diagnosing-bugs**: Debug and diagnose issues
- **research**: Deep investigation with verified sources

See [`docs/agents/`](./docs/agents/) for detailed configuration.

### Verification command

Run `mise run check` to verify all linting, types, tests, builds, and checks
that the agent would perform on your code.

## Project Architecture

- `apps/web` is the React, Vite, and Mantine frontend.
- `apps/api` is the Fastify backend; keep its OpenAPI contract in sync.
- `packages/api-contract/main.tsp` is the API source of truth. The generated
  OpenAPI file at
  `packages/api-contract/openapi/@typespec/openapi3/openapi.yaml` and the
  client SDK at `packages/api-client/src/generated/api.ts` must not be edited
  by hand. Run `npm run generate` after changing the contract.

## Development

- Use the exact tool versions in `mise.toml`: run `mise install`, then `npm ci`.
- Start the frontend with `npm run dev:web`; configure `OWNER_LOGIN` and
  `OWNER_PASSWORD` before starting `npm run dev:api`.
- The current booking store is in-memory and single-process for demonstration;
  bookings and sessions can disappear when the API restarts.
- Run `mise run check` for generation, lint, formatting, type checks, unit and
  API tests, production builds, smoke, browser E2E, and hk checks.
- Run `hk install` to enable local Git hooks and `hk check --all` to run hk
  checks manually.

## Conventions

- Keep TypeScript strict and follow the existing ESLint and Prettier settings.
- Use Conventional Commits. Every implementation commit must reference the
  GitHub Issue it addresses, for example `feat: add available slots (#19)`.
- Add backend tests with Vitest; use Fastify injection for route-level tests.
- Do not edit or rename `.github/workflows/hexlet-check.yml`; it is reserved
  for the Hexlet project checks.

## Agent configuration details

### Issue tracker

Issues are tracked in this repository's GitHub Issues. Use `gh` from this
repository; see [`docs/agents/issue-tracker.md`](./docs/agents/issue-tracker.md).

### Triage labels

Use the default labels `needs-triage`, `needs-info`, `ready-for-agent`,
`ready-for-human`, and `wontfix`; see [`docs/agents/triage-labels.md`](./docs/agents/triage-labels.md).

### Domain docs

Use one shared glossary at `GLOSSARY.md` and shared decisions in
`docs/adr/`; see [`docs/agents/domain.md`](./docs/agents/domain.md).
