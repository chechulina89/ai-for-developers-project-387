import { describe, expect, it } from 'vitest';

import { countUsedAttempts } from './review-budget.mjs';

describe('countUsedAttempts', () => {
  it('counts one attempt per run', () => {
    const runs = [{ databaseId: 1 }, { databaseId: 2 }];
    expect(countUsedAttempts(runs, 3)).toBe(2);
  });

  it('counts every attempt of a re-run, not just the run id', () => {
    const runs = [{ databaseId: 1, attempt: 3 }];
    expect(countUsedAttempts(runs, 2)).toBe(3);
  });

  it('excludes only the in-progress attempt of the current run', () => {
    const runs = [
      { databaseId: 1, attempt: 1 },
      { databaseId: 2, attempt: 3 },
    ];
    expect(countUsedAttempts(runs, 2)).toBe(3);
  });

  it('counts all runs for local execution without a current run id', () => {
    const runs = [{ databaseId: 1, attempt: 2 }];
    expect(countUsedAttempts(runs, undefined)).toBe(2);
  });

  it('returns zero when there are no runs', () => {
    expect(countUsedAttempts([], 1)).toBe(0);
  });
});
