import { describe, it, expect } from 'vitest';
import {
  normalizeScore,
  resolveMatchScore,
  formatScoreForSlot,
  singleScoreForSlot,
  appendScoreForSlot,
} from '../src/facade/score.facade';
import { normalizeRounds } from '../src/facade/model.facade';

describe('normalizeScore', () => {
  it('treats flat pairs as single scores', () => {
    expect(normalizeScore([2, 1])).toEqual({
      mode: 'single',
      values: [2, 1],
      type: 'goals',
    });
  });

  it('treats nested arrays as sets', () => {
    expect(normalizeScore([[6, 4], [3, 6], [7, 5]], 'sets')).toEqual({
      mode: 'sets',
      values: [
        { main: [6, 4], extra: null },
        { main: [3, 6], extra: null },
        { main: [7, 5], extra: null },
      ],
      type: 'sets',
    });
  });

  it('parses nested main/extra periods', () => {
    expect(
      normalizeScore(
        [
          [[6, 7], [7, 9]],
          [[7, 6], [7, 2]],
          [6, 3],
          [6, 4],
        ],
        'sets',
      ),
    ).toEqual({
      mode: 'sets',
      values: [
        { main: [6, 7], extra: [7, 9] },
        { main: [7, 6], extra: [7, 2] },
        { main: [6, 3], extra: null },
        { main: [6, 4], extra: null },
      ],
      type: 'sets',
    });
  });
});

describe('resolveMatchScore', () => {
  it('reads match.score', () => {
    const score = resolveMatchScore({ score: [1, 0] }, null, null);
    expect(score.mode).toBe('single');
    expect(singleScoreForSlot(score, 0)).toBe(1);
    expect(singleScoreForSlot(score, 1)).toBe(0);
  });

  it('falls back to per-player score fields', () => {
    const score = resolveMatchScore(
      {
        player1: { name: 'A', score: 3 },
        player2: { name: 'B', score: 1 },
      },
      { id: 'a' },
      { id: 'b' },
    );
    expect(score.values).toEqual([3, 1]);
  });
});

describe('formatScoreForSlot', () => {
  it('formats single scores', () => {
    expect(
      formatScoreForSlot({ mode: 'single', values: [2, 1], type: 'goals' }, 0),
    ).toBe('2');
  });

  it('formats set scores per player', () => {
    const score = {
      mode: 'sets',
      values: [
        { main: [6, 4], extra: null },
        { main: [3, 6], extra: null },
        { main: [7, 5], extra: null },
      ],
      type: 'sets',
    };
    expect(formatScoreForSlot(score, 0)).toBe('6 3 7');
    expect(formatScoreForSlot(score, 1)).toBe('4 6 5');
  });
});

describe('appendScoreForSlot', () => {
  it('builds superscript extras for nested periods', () => {
    const score = normalizeScore(
      [
        [[6, 7], [7, 9]],
        [6, 3],
      ],
      'sets',
    );
    const el = document.createElement('span');
    expect(appendScoreForSlot(el, score, 0)).toBe(true);
    const extras = [...el.querySelectorAll('.jb-score__extra')].map((n) => n.textContent);
    expect(extras).toEqual(['7']);
    expect(el.textContent.replace(/\s+/g, ' ').trim()).toMatch(/6.*7.*6/);
    const el1 = document.createElement('span');
    appendScoreForSlot(el1, score, 1);
    expect([...el1.querySelectorAll('.jb-score__extra')].map((n) => n.textContent)).toEqual(['9']);
  });
});

describe('normalizeRounds with scores', () => {
  it('attaches normalized score to matches', () => {
    const { rounds } = normalizeRounds([
      [
        {
          player1: { name: 'A', id: 'a', winner: true },
          player2: { name: 'B', id: 'b' },
          score: [2, 1],
        },
      ],
      [{ player1: { name: 'A', id: 'a' } }],
    ]);
    expect(rounds[0][0].score).toEqual({
      mode: 'single',
      values: [2, 1],
      type: 'goals',
    });
  });
});
