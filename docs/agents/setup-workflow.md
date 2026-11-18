# Agent Workflow Setup

This document describes how the opencode agent workflow is configured and how
to complete its setup.

## Workflow Overview

**File:** `.github/workflows/opencode.yml`

The workflow runs the [opencode](https://opencode.ai) agent
(`anomalyco/opencode/github` action) when a trusted participant posts a
comment command in an issue.

### Configuration summary

| Setting     | Value                                                                                                                                                       |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Event       | `issue_comment`, `types: [created]` only                                                                                                                    |
| Model       | `openrouter/nvidia/nemotron-3.5-lightning:free` for `opencode`, `opencode-review`, `scheduled-audit`; `zai/glm-4.5-flash` (free tier) for `opencode-triage` |
| `mentions`  | `/oc,/opencode`                                                                                                                                             |
| `share`     | `false` (sessions are not published)                                                                                                                        |
| Permissions | `contents: read`, `id-token: write`                                                                                                                         |
| Timeout     | 30 minutes                                                                                                                                                  |
| Concurrency | one run per issue, previous run is cancelled                                                                                                                |
| Auth        | OIDC token exchange with the opencode-agent GitHub App                                                                                                      |

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

Two providers are configured today:

- `opencode`, `opencode-review`, `scheduled-audit` run on
  `openrouter/nvidia/nemotron-3.5-lightning:free` and need the
  `OPENROUTER_API_KEY` repository secret (free key at
  [OpenRouter → Keys](https://openrouter.ai/keys), no card, ~50
  requests/day on the no-purchase tier).
- `opencode-triage` runs on `zai/glm-4.5-flash` and needs the
  `ZHIPU_API_KEY` repository secret (free key at
  [z.ai → API keys](https://z.ai/manage-apikey/apikey-list), no card).
  Chosen on 2026-11-18 because it was the only provider that completed the
  full triage loop while both daily quotas above were exhausted. The z.ai
  free tier occasionally answers `1305 service temporarily overloaded`;
  re-triggering the issue (close + open a new one) usually gets through.

The provider key is passed as job-level `env`: step-level `env` on a
`uses:` step is not propagated into the composite opencode action. The
triage job additionally sets `GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` and
`issues: write`, so the agent's own `gh` commands can apply the label and
post the comment.

Earlier setups and why they were replaced:

- Free opencode Zen models (`opencode/nemotron-3.5-lightning-free`,
  `opencode/deepseek-v4.1-flash-free`, `opencode/glm-5.3-flash-free`) need
  no key, but the daily free quota is exhausted by one or two agent
  sessions (`FreeUsageLimitError`, reset at UTC midnight) — acceptable for
  a one-day demo, not for regular use.
- `google/gemini-2.5-flash` with a Google AI Studio key failed with
  account-level `403 ACCESS_DENIED` from `generativelanguage.googleapis.com`
  (new-format `AQ.` keys; the project/account was denied the service), so it
  never produced a single answer.
- Groq's free plan: `llama-3.3-70b-versatile` was retired (`Model
not found` on the free key); the free replacements
  `groq/openai/gpt-oss-120b` and `groq/openai/gpt-oss-20b` hard-cap single
  requests at 8000 TPM while an agent context inevitably exceeds ~24K
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
