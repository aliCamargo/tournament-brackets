import { describe, it, expect } from 'vitest';
import {
  normalizeStatus,
  resolveMatchStatus,
  formatStatusLabel,
} from '../src/facade/status.facade';
import { normalizeRounds } from '../src/facade/model.facade';

describe('normalizeStatus', () => {
  it('accepts canonical values (case / spacing tolerant)', () => {
    expect(normalizeStatus('in_progress')).toBe('in_progress');
    expect(normalizeStatus('In Progress')).toBe('in_progress');
    expect(normalizeStatus('FINAL')).toBe('final');
  });

  it('rejects synonyms', () => {
    expect(normalizeStatus('live')).toBe(null);
    expect(normalizeStatus('Completed')).toBe(null);
    expect(normalizeStatus('w/o')).toBe(null);
  });
});

describe('resolveMatchStatus', () => {
  it('prefers explicit status', () => {
    expect(resolveMatchStatus({ status: 'retired', winnerId: 'a' })).toBe(
      'retired',
    );
  });

  it('infers final from winner', () => {
    expect(resolveMatchStatus({ winnerId: 'a' })).toBe('final');
  });

  it('infers in_progress from score without winner', () => {
    expect(
      resolveMatchStatus({ score: { mode: 'single', values: [1, 0] } }),
    ).toBe('in_progress');
  });

  it('defaults to scheduled', () => {
    expect(resolveMatchStatus({})).toBe('scheduled');
  });
});

describe('formatStatusLabel', () => {
  it('uses defaults', () => {
    expect(formatStatusLabel('in_progress')).toBe('In Progress');
    expect(formatStatusLabel('final')).toBe('Final');
  });
});

describe('normalizeRounds status', () => {
  it('stores status on matches', () => {
    const { rounds } = normalizeRounds([
      [
        {
          player1: { name: 'A', id: 'a' },
          player2: { name: 'B', id: 'b' },
          status: 'in_progress',
          score: [1, 0],
        },
      ],
      [{ player1: { name: 'A', id: 'a' } }],
    ]);
    expect(rounds[0][0].status).toBe('in_progress');
  });
});
