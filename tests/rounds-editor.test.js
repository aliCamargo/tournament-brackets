import { describe, it, expect } from 'vitest';
import { formatRounds, parseRoundsJson } from '../demo/rounds-editor.js';

describe('formatRounds', () => {
  it('pretty-prints rounds JSON', () => {
    expect(formatRounds([{ a: 1 }])).toBe('[\n  {\n    "a": 1\n  }\n]');
  });
});

describe('parseRoundsJson', () => {
  it('accepts a non-empty rounds array', () => {
    const result = parseRoundsJson('[[{"player1":{"name":"A","id":1}}]]');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.rounds).toHaveLength(1);
  });

  it('rejects invalid JSON', () => {
    const result = parseRoundsJson('{');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/^Invalid JSON:/);
  });

  it('rejects empty array', () => {
    const result = parseRoundsJson('[]');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Rounds must be a non-empty array');
  });

  it('rejects non-array', () => {
    const result = parseRoundsJson('{"rounds":[]}');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('Rounds must be a non-empty array');
  });
});
