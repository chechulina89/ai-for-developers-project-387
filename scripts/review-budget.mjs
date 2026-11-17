// Enforces the per-PR auto-review run budget BEFORE any model call.
// Exits non-zero (refusal) once the budget is exhausted so the review
// workflow never reaches the model step after the limit.
//
// A "Re-run" in the Actions UI keeps the same run id and only bumps its
// attempt number, so the budget counts run *attempts*, not run ids;
// otherwise a re-run would be free.
//
// Required env: GH_TOKEN, PR_NUMBER, HEAD_BRANCH, HEAD_SHA
// Optional env: MAX_REVIEW_RUNS (default 3), GITHUB_RUN_ID, GITHUB_SERVER_URL,
//               GITHUB_REPOSITORY, POST_COMMENT (set to "1" to comment on the PR)

import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// Sums the review attempts already consumed on the branch. `gh run list`
// reports the latest attempt number per run, so each finished run
// contributes that many attempts; the attempt currently in progress is
// excluded from its own run.
export function countUsedAttempts(runs, currentRunId) {
  return runs.reduce((total, run) => {
    const attempts = run.attempt ?? 1;
    const isCurrent =
      currentRunId != null && String(run.databaseId) === String(currentRunId);
    return total + (isCurrent ? attempts - 1 : attempts);
  }, 0);
}

function main() {
  const {
    PR_NUMBER,
    HEAD_BRANCH,
    HEAD_SHA,
    MAX_REVIEW_RUNS = '3',
    GITHUB_RUN_ID,
    GITHUB_SERVER_URL = 'https://github.com',
    GITHUB_REPOSITORY,
    POST_COMMENT,
  } = process.env;

  for (const name of ['PR_NUMBER', 'HEAD_BRANCH', 'HEAD_SHA']) {
    if (!process.env[name]) {
      console.error(`review-budget: missing required env ${name}`);
      process.exit(2);
    }
  }

  const limit = Number.parseInt(MAX_REVIEW_RUNS, 10);

  const raw = execFileSync(
    'gh',
    [
      'run',
      'list',
      '--workflow',
      'opencode-review.yml',
      '--branch',
      HEAD_BRANCH,
      '--json',
      'databaseId,attempt',
      '--limit',
      '100',
    ],
    { encoding: 'utf8' },
  );
  const usedAttempts = countUsedAttempts(JSON.parse(raw), GITHUB_RUN_ID);

  console.log(
    `review-budget: PR #${PR_NUMBER} (${HEAD_BRANCH}) already used ` +
      `${usedAttempts}/${limit} review attempts (re-runs included)`,
  );

  if (usedAttempts < limit) {
    process.exit(0);
  }

  const logsUrl =
    GITHUB_RUN_ID && GITHUB_REPOSITORY
      ? `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`
      : '(local run, no logs URL)';
  const message =
    `⛔ Авторевью отклонено: исчерпан предел попыток на PR ` +
    `(${usedAttempts}/${limit} использовано, повторные Re-run считаются).\n\n` +
    `- Причина: бюджет авторевью на один pull request исчерпан, новый вызов модели не выполнялся.\n` +
    `- head SHA: \`${HEAD_SHA}\`\n` +
    `- Логи отказа: ${logsUrl}\n\n` +
    `Лимит задаётся переменной \`MAX_REVIEW_RUNS\` в \`.github/workflows/opencode-review.yml\`. ` +
    `Для повторного ревью договоритесь с мейнтейнером о повышении лимита.`;

  console.log(message);

  if (POST_COMMENT === '1') {
    execFileSync(
      'gh',
      ['pr', 'review', PR_NUMBER, '--comment', '--body', message],
      { stdio: 'inherit' },
    );
  }

  process.exit(1);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}
