# Agent Workflow Setup

This document describes how the opencode agent workflow is configured and how
to complete its setup.

## Workflow Overview

**File:** `.github/workflows/opencode.yml`

The workflow runs the [opencode](https://opencode.ai) agent
(`anomalyco/opencode/github` action) when a trusted participant posts a
comment command in an issue.

### Configuration summary

| Setting     | Value                                                                        |
| ----------- | ---------------------------------------------------------------------------- |
| Event       | `issue_comment`, `types: [created]` only                                     |
| Model       | `opencode/nemotron-3.5-lightning-free` (free opencode Zen model, no API key) |
| `mentions`  | `/oc,/opencode`                                                              |
| `share`     | `false` (sessions are not published)                                         |
| Permissions | `contents: read`, `id-token: write`                                          |
| Timeout     | 30 minutes                                                                   |
| Concurrency | one run per issue, previous run is cancelled                                 |
| Auth        | OIDC token exchange with the opencode-agent GitHub App                       |

### Access control

The job's `if` condition enforces all of the following:

1. `github.event.comment.user.type != 'Bot'` — bot commands are ignored.
2. The comment body contains `/oc` — plain discussion never triggers a run.
3. `author_association` is `OWNER`, `MEMBER`, or `COLLABORATOR` — only
   trusted participants can start the agent. Untrusted fork contributors
   fail this check before any step runs, so they never receive secrets.

## Setup Instructions

### 1. Install the GitHub App

Install [**opencode-agent**](https://github.com/apps/opencode-agent) on this
repository. In OIDC mode (the default) the action exchanges an OIDC token for
an App installation token, which supplies the permissions used to comment and
push changes. This keeps the workflow permissions at `contents: read` and
`id-token: write` only.

The alternative `use_github_token: true` mode skips the App but requires
granting `contents: write`, `issues: write`, and `pull-requests: write` to
`GITHUB_TOKEN`. It was rejected for this repository; if it is ever adopted,
record the reason here and in `README.md`.

### 2. Model key

The configured model `opencode/nemotron-3.5-lightning-free` is a free opencode
Zen model and needs **no provider key** — nothing to create in the repository
secrets for the model itself. It replaced `opencode/deepseek-v4.1-flash-free`
on 2026-11-18 because DeepSeek agent sessions hung until the run timeout on
triage runs; nemotron answers a probe instantly and is verified working by the
agent step of the scheduled-audit run on main. If the Zen quota runs out
again, the documented fallbacks below apply.

All four agent workflows (`opencode`, `opencode-triage`, `opencode-review`,
`scheduled-audit`) use the same model. When a provider key is configured, it
is passed as job-level `env`: step-level `env` on a `uses:` step is not
propagated into the composite opencode action.

Earlier setups and why they were replaced:

- `openrouter/nvidia/nemotron-3.5-lightning:free` (`OPENROUTER_API_KEY`
  secret, free key at [OpenRouter → Keys](https://openrouter.ai/keys), no
  card): worked reliably, but the no-purchase tier is capped at ~50
  requests/day (`402 Insufficient credits`) and the demo's probe runs
  exhausted it mid-day; the UTC-midnight reset proved unreliable, so the
  demo could not wait for it. Still the better option for regular use.
- Free opencode Zen models (`opencode/deepseek-v4.1-flash-free`,
  `opencode/glm-5.3-flash-free`) need no key, but the daily free quota is
  exhausted by one or two agent sessions (`FreeUsageLimitError`, reset at
  UTC midnight) — acceptable for a one-day demo, not for regular use.
  `deepseek-v4.1-flash-free` additionally stalled on triage runs (no output
  until the 15-minute timeout), so the current choice within Zen is
  `opencode/nemotron-3.5-lightning-free`.
- `google/gemini-2.5-flash` with a Google AI Studio key failed with
  account-level `403 ACCESS_DENIED` from `generativelanguage.googleapis.com`
  (new-format `AQ.` keys; the project/account was denied the service), so it
  never produced a single answer.
- Groq's free plan: `llama-3.3-70b-versatile` moved to Enterprise (`Model
not found` on the free key); the free replacement `groq/openai/gpt-oss-120b`
  caps at 8000 TPM while one agent request with tools and context is ~25K
  tokens (`Request too large`), so the Groq free tier cannot serve agent
  prompts at all.
- Cerebras Cloud ended its no-card free tier in July 2026: a payment
  method is required even to activate the $5 trial credit.

### 3. Verify the run

1. Open any issue and comment `/oc explain this issue`.
2. The agent replies in the issue with a comment.
3. The run is visible under Actions → opencode.

## Available skills on the runner

The runner checks out this repository, so the skills from the first project
(`.agents/skills/`, tracked in git) and the GitHub Issues settings in
`docs/agents/` are available to the agent:

- `docs/agents/issue-tracker.md` — issue tracker conventions (`gh` CLI)
- `docs/agents/triage-labels.md` — the five triage labels
- `docs/agents/domain.md` — glossary and ADR usage

## Troubleshooting

- **No run in Actions:** the workflow must be on the default branch; comments
  posted before the workflow was merged do not trigger it — post a new one.
- **Run fails on OIDC exchange:** the opencode-agent App is not installed on
  the repository.
- **Run fails on model call:** the model ID is wrong for the configured
  provider, or (paid models only) the provider secret is missing.
- **Comment ignored:** the author is a bot, lacks the required association,
  or the comment does not contain a `mentions` command.
