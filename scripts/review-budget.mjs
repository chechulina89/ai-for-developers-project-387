// Enforces the per-PR auto-review run budget BEFORE any model call.
// Exits non-zero (refusal) once the budget is exhausted so the review
// workflow never reaches the model step after the limit.
//
// Required env: GH_TOKEN, PR_NUMBER, HEAD_BRANCH, HEAD_SHA
// Optional env: MAX_REVIEW_RUNS (default 3), GITHUB_RUN_ID, GITHUB_SERVER_URL,
//               GITHUB_REPOSITORY, POST_COMMENT (set to "1" to comment on the PR)

import { execFileSync } from 'node:child_process';

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
    'databaseId',
    '--limit',
    '100',
  ],
  { encoding: 'utf8' },
);
const previousRuns = JSON.parse(raw).filter(
  (run) => String(run.databaseId) !== String(GITHUB_RUN_ID ?? ''),
);

console.log(
  `review-budget: PR #${PR_NUMBER} (${HEAD_BRANCH}) already used ` +
    `${previousRuns.length}/${limit} review runs`,
);

if (previousRuns.length < limit) {
  process.exit(0);
}

const logsUrl =
  GITHUB_RUN_ID && GITHUB_REPOSITORY
    ? `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`
    : '(local run, no logs URL)';
const message =
  `⛔ Авторевью отклонено: исчерпан предел запусков на PR ` +
  `(${previousRuns.length}/${limit} использовано).\n\n` +
  `- Причина: бюджет авторевью на один pull request исчерпан, новый вызов модели не выполнялся.\n` +
  `- head SHA: \`${HEAD_SHA}\`\n` +
  `- Логи отказа: ${logsUrl}\n\n` +
  `Лимит задаётся переменной \`MAX_REVIEW_RUNS\` в \`.github/workflows/opencode-review.yml\`. ` +
  `Для повторного ревью договоритесь с мейнтейнером о повышении лимита.`;

console.log(message);

if (POST_COMMENT === '1') {
  execFileSync('gh', ['pr', 'comment', PR_NUMBER, '--body', message], {
    stdio: 'inherit',
  });
}

process.exit(1);
