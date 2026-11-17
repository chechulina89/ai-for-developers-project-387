# Meetly

[![hexlet-check](https://github.com/chechulina89/ai-for-developers-project-387/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/chechulina89/ai-for-developers-project-387/actions/workflows/hexlet-check.yml)

**Working app:** https://meetly-booking.onrender.com (deployed from the
previous project; Render Free sleeps after 15 idle minutes, so the first
request can take 50+ seconds). If the address is unavailable, run the app
locally with the commands in [Development](#development) or [Docker](#docker).

This repository continues the "Календарь звонков" project. The application was
transferred from
[chechulina89/ai-for-developers-project-386](https://github.com/chechulina89/ai-for-developers-project-386)
together with its Dockerfile, tests, linters, workflows, agent setup, glossary,
and decisions. The original specification is issue
[chechulina89/ai-for-developers-project-386#17](https://github.com/chechulina89/ai-for-developers-project-386/issues/17);
decisions live in [`docs/adr/`](./docs/adr/).

Meetly demonstrates a client booking flow for owner-configured online meeting
types. Guests can choose a meeting type, duration, date, and available time,
submit their name and phone number, and receive a confirmation. The owner signs
in at `/owner` to create meeting types and see upcoming bookings.

The current profile is explicitly a demo placeholder. Bookings, idempotency
keys, and owner sessions are held in memory by one API process and can be lost
when it restarts. Do not enter real personal data.

## AI Agent Workflow

The repository runs the [opencode](https://opencode.ai) agent from GitHub issue
comments. The workflow lives in
[`.github/workflows/opencode.yml`](./.github/workflows/opencode.yml) and uses
the `anomalyco/opencode/github` action.

- **Event:** `issue_comment` with `types: [created]` only.
- **Model:** `groq/openai/gpt-oss-120b`, read from the `GROQ_API_KEY`
  repository secret (a free [Groq Cloud](https://console.groq.com/keys) key;
  no card needed, the free tier allows thousands of requests per day).
  Earlier setups were abandoned, all recorded here as deliberate decisions:
  free opencode Zen models (`deepseek-v4.1-flash-free`,
  `glm-5.3-flash-free`) exhaust their daily quota in one or two agent
  sessions (`FreeUsageLimitError`, reset at UTC midnight); a Google AI
  Studio key for `google/gemini-2.5-flash` was rejected with account-level
  `403 ACCESS_DENIED`; OpenRouter's no-purchase free tier (~50 requests/day)
  was exhausted by a handful of agent sessions (`402 Insufficient credits`);
  Groq's `llama-3.3-70b-versatile` was moved to the Enterprise plan
  (`Model not found` on the free key), so the free-plan production model
  `openai/gpt-oss-120b` is used instead.
  The same model and secret are used by all four agent workflows; the key
  reaches the composite action via job-level `env` (step-level `env` on a
  `uses:` step is not propagated).
- **Purpose:** answer questions about issues, triage them, and propose fixes
  from a comment command.
- **Results:** the agent replies as an issue comment and links its workflow
  run in the Actions tab.
- **`mentions`:** `/oc,/opencode` — only these command prefixes trigger a run.
- **`share`:** `false` — sessions are not published to opencode.ai; output is
  only visible in the issue comment and the Actions log.

### GitHub App

The workflow uses the standard OIDC mode: the
[**opencode-agent**](https://github.com/apps/opencode-agent) GitHub App must be
installed on this repository, and the action exchanges an OIDC token
(`id-token: write`) for an App token used to post comments. Checkout uses
`persist-credentials: false`, so no Git credentials stay on the runner. The
alternative `use_github_token: true` mode (no App installation, broader
`contents: write`/`issues: write` permissions on `GITHUB_TOKEN`) was rejected:
OIDC keeps the workflow permissions minimal (`contents: read`,
`id-token: write`).

### Invoking the agent

In any issue, add a comment starting with one of the `mentions` commands:

```
/oc explain this issue
/opencode triage
```

Runs are restricted to trusted participants: comments from bots are ignored,
and the job only starts when the comment author has `OWNER`, `MEMBER`, or
`COLLABORATOR` association with the repository. Untrusted fork contributors
never receive secrets. Runs are limited per issue (`concurrency` cancels the
previous run) and time out after 30 minutes. See
[`docs/agents/setup-workflow.md`](./docs/agents/setup-workflow.md) for setup
details and [`AGENTS.md`](./AGENTS.md) for available skills.

### Auto-triage of new issues

[`.github/workflows/opencode-triage.yml`](./.github/workflows/opencode-triage.yml)
triages every newly opened issue (`issues: [opened]`) with a fixed `prompt`:
the agent reads the request against the existing app (`apps/web`, `apps/api`),
the glossary, and the triage rules, then applies exactly one triage label from
[`docs/agents/triage-labels.md`](./docs/agents/triage-labels.md) and posts a
summary comment.

- **Trusted authors only:** the job starts only for `OWNER`, `MEMBER`, or
  `COLLABORATOR` authors; bot-opened issues are ignored.
- **Skill tickets are not re-triaged:** tickets published by the `to-spec` /
  `to-tickets` skills carry the `ready-for-agent` label at creation and are
  skipped by the job condition (and again by the prompt as a safeguard).
- **Limits:** 15 minute timeout; one run per issue (`concurrency` cancels the
  previous run). Same OIDC permissions as the agent workflow
  (`contents: read`, `id-token: write`, checkout with
  `persist-credentials: false`).

### Independent pull request review

[`.github/workflows/opencode-review.yml`](./.github/workflows/opencode-review.yml)
starts an independent author review on `pull_request` events (`opened`,
`synchronize`, and `reopened`). The reviewer receives the mandatory calendar
criteria from [`REVIEW.md`](./REVIEW.md), reads the linked GitHub Issues
specification and the PR diff, and leaves both an overall verdict and
line-level findings without changing the branch.

- **Trusted authors only:** bot PRs and PRs from untrusted contributors are
  skipped. The workflow uses least-privilege `contents: read`,
  `pull-requests: write`, and `id-token: write` permissions.
- **Stale review cancellation:** a new commit cancels the review for the
  previous head of that PR; every review has a 15-minute timeout.
- **Run budget before the model:** [`scripts/review-budget.mjs`](./scripts/review-budget.mjs)
  checks the number of earlier workflow runs for the PR branch before the
  model step. At the `MAX_REVIEW_RUNS` limit (currently three), it refuses the
  review, comments with the exact head SHA and Actions-log URL, and never
  calls the model.
- **PR evidence:** [the PR template](./.github/pull_request_template.md)
  requires issue/specification links, human approval, checks, an impact-based
  risk rationale, and a rollback procedure.

### Scheduled audit

[`.github/workflows/scheduled-audit.yml`](./.github/workflows/scheduled-audit.yml)
runs a periodic audit **once per day at 06:00 UTC** (`schedule`) and manually
via `workflow_dispatch` (**Run workflow** on the Actions page). The job is
limited to 10 minutes (`timeout-minutes`), and concurrent audits are grouped
by `concurrency: scheduled-audit`. Permissions are minimal for what it does:
`contents: read` plus `issues: write` for opening a finding issue.

- **Inputs:** optional repository variable `APP_URL`
  (**Settings → Secrets and variables → Actions → Variables**) is passed to
  the job; when it is missing the report records a warning instead of
  failing.
- **Output:** the report is written to `audit-report/report.md` and saved as
  a workflow artifact (`scheduled-audit-report-<run_id>`, kept 30 days).
  Reports never enter commits.
- **Deduplication:** every finding carries a stable key; before creating an
  issue the workflow lists issues with the `scheduled-audit` label and skips
  creation when the key already exists in a title or body.
- **Verified runs:**
  [43842291470](https://github.com/chechulina89/ai-for-developers-project-387/actions/runs/43842291470)
  created issue #13 (demo finding); repeat run
  [43842933535](https://github.com/chechulina89/ai-for-developers-project-387/actions/runs/43842933535)
  reported "Existing audit issue found; duplicate was not created."

**Личные выводы.** Агент оказался полезен как исполнитель механических шагов,
но потребовались три уточнения постановки: (1) дедупликацию нельзя строить на
GitHub search по заголовку — ключ с двоеточием там не матчится, пришлось
перейти на точное сравнение через `jq` и локальный прогон фильтра; (2) `gh` в
workflow не поддерживает `--arg`, это всплыло только на живом запуске;
(3) доступ к настройкам репозитория (переменные, rerun, workflow permissions)
из-под токена приложения ограничен 403, поэтому часть действий осталась
ручными через UI. Изменения в настройках/постановке по итогу: создана метка
`scheduled-audit`, два раза исправлен фильтр дедупликации, добавлена
толерантность к отсутствующему `APP_URL` (warning вместо падения).

## Development

Use the versions in `mise.toml`, install dependencies with `npm ci`, then run:

```sh
OWNER_LOGIN=demo-owner OWNER_PASSWORD='replace-this-locally' npm run dev:api
npm run dev:web
```

The API listens on port 3000 and the Vite development server proxies `/api` to
it. Owner credentials enable owner sign-in and must not be committed. If both
are unset, the API starts but owner sign-in returns `503`; setting only one
credential is a startup error.

## Docker

Build and run the production image from the repository root:

```sh
docker build -t meetly .
PORT=8080
docker run --rm -p "$PORT:$PORT" \
  -e PORT \
  -e OWNER_LOGIN \
  -e OWNER_PASSWORD \
  meetly
```

Set `OWNER_LOGIN` and `OWNER_PASSWORD` in the shell before running the
container. `PORT` defaults to `3000`; set it to the internal container port and
publish the same port as shown above. Open `http://localhost:8080`. The API
serves the built web app and `/api` from the same process. Bookings and sessions
remain in memory and are lost when the container restarts.

## Render deployment

Public app URL: [https://meetly-booking.onrender.com](https://meetly-booking.onrender.com).
The service is deployed on Render Free; auto-deploy is disabled.

The project OpenCode MCP configuration is in [`opencode.json`](./opencode.json).
Render MCP uses `RENDER_API_KEY` from the environment; do not put the key in
this repository. Set it before starting OpenCode, then check the connection
with `opencode mcp list`. Create the key through the Render Dashboard and grant
only the access needed for the chosen workspace.

Render MCP can build the Dockerfile from the connected Git repository. The
Render MCP tool's documented plan list omits Free, but this service was created
on the Free plan. Check the service's **Instance Type** in Render Dashboard
before relying on its cost. The smallest paid web-service instance is about
$7/month as of November 2026 (Hobby workspace is $0/month plus compute).
Render Free services sleep after 15 idle minutes; the first request after a
sleep can be delayed by 50 seconds or more. They have 750 instance hours per
workspace/month and are not suitable for production data. See
[`docs/research/render-mcp-opencode-deploy.md`](./docs/research/render-mcp-opencode-deploy.md)
for current limits and source links.

To enable owner sign-in, set both `OWNER_LOGIN` and `OWNER_PASSWORD` in the
hosting environment; the API starts with both unset but owner sign-in returns
`503`. Setting only one is a startup error. Render provides `PORT` to the
container. `NODE_ENV` is set to production by the Docker image.

Bookings, idempotency keys, and owner sessions currently exist only in API
process memory. They are lost on restart, redeploy, or instance spin-down.
Render Postgres is a suitable persistent store (currently from $6/month), but
this app does not yet integrate with a database. Do not use real personal data
until persistent storage and production data handling are implemented.

Run `mise run check` for contract generation checks, lint, formatting, type
checks, Vitest unit/API/component tests, production builds, API smoke tests,
Playwright Chromium E2E tests, and `hk check --all`. Install Chromium for local
browser tests with `npx playwright install --with-deps chromium`.

`packages/api-contract/main.tsp` is the API source of truth. Generate OpenAPI
and the Orval client with `npm run generate`; do not edit the generated files
manually.
