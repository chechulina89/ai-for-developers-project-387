# Agent Workflow Setup

This document describes how the opencode agent workflow is configured and how
to complete its setup.

## Workflow Overview

**File:** `.github/workflows/opencode.yml`

The workflow runs the [opencode](https://opencode.ai) agent
(`anomalyco/opencode/github` action) when a trusted participant posts a
comment command in an issue.

### Configuration summary

| Setting     | Value                                                      |
| ----------- | ---------------------------------------------------------- |
| Event       | `issue_comment`, `types: [created]` only                   |
| Model       | `google/gemini-2.5-flash` (key in `GEMINI_API_KEY` secret) |
| `mentions`  | `/oc,/opencode`                                            |
| `share`     | `false` (sessions are not published)                       |
| Permissions | `contents: read`, `id-token: write`                        |
| Timeout     | 30 minutes                                                 |
| Concurrency | one run per issue, previous run is cancelled               |
| Auth        | OIDC token exchange with the opencode-agent GitHub App     |

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

The configured model `google/gemini-2.5-flash` reads the provider key from
the `GEMINI_API_KEY` environment variable, supplied from a repository secret:

1. Create a free API key in [Google AI Studio](https://aistudio.google.com/apikey).
2. Settings → Secrets and variables → Actions → New repository secret:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** the created key

All four agent workflows (`opencode`, `opencode-triage`, `opencode-review`,
`scheduled-audit`) use the same model and secret.

The earlier setup used the free opencode Zen models
(`opencode/deepseek-v4.1-flash-free`, then `opencode/glm-5.3-flash-free`),
which need no key. That was abandoned because the daily free quota is
exhausted by one or two agent sessions (`FreeUsageLimitError`, reset at UTC
midnight), which made triage and review runs unreliable.

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
