# Issue tracker: GitHub

Issues and specs for this repository live in its GitHub Issues:
[chechulina89/ai-for-developers-project-387](https://github.com/chechulina89/ai-for-developers-project-387/issues).
Use the `gh` CLI from the repository root; the configured Git remote identifies
the repository.

## Project history

This repository continues the first project,
[chechulina89/ai-for-developers-project-386](https://github.com/chechulina89/ai-for-developers-project-386).

- Original specification:
  [chechulina89/ai-for-developers-project-386#17 — Спецификация системы бронирования встреч](https://github.com/chechulina89/ai-for-developers-project-386/issues/17).
- Decisions of the first project are transferred into this repository and live
  in `docs/adr/` (see `docs/agents/domain.md`).

## Conventions

- Create an issue only when requested:
  `gh issue create --title "..." --body "..."`.
- Read an issue:
  `gh issue view <number> --json number,title,body,labels,comments`.
- List issues:
  `gh issue list --state open --json number,title,body,labels,comments`.
- Apply or remove labels with `gh issue edit <number> --add-label "..."`
  or `--remove-label "..."`.
- Do not create real issues during setup or configuration checks.

## Pull requests as a triage surface

**PRs as a request surface: no.** Keep external pull requests out of the issue
triage queue unless this repository's maintainers explicitly change this
policy.

## When a skill says “publish to the issue tracker”

Create a GitHub issue only when the user explicitly asks to publish it. Before
the first issue creation in a session, verify the target with
`gh repo view --json nameWithOwner` and confirm it is this repository.

## Wayfinding

Use GitHub Issues for maps and child tickets. A map uses `wayfinder:map`; child
tickets use `wayfinder:research`, `wayfinder:prototype`,
`wayfinder:grilling`, or `wayfinder:task`. Use GitHub sub-issues and native
issue dependencies when available; otherwise record parent and blocking
relationships in issue bodies.
