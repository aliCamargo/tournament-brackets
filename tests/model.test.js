import { describe, it, expect } from 'vitest';
import {
  normalizeRounds,
  normalizePlayer,
  setWinner,
} from '../src/facade/model.facade';
import { BracketModelHelper } from '../src/helpers/bracket-model.helper';

describe('BracketModelHelper', () => {
  it('exposes model normalization through static methods', () => {
    const player = BracketModelHelper.normalizePlayer({
      id: 'player-1',
      name: 'Player One',
    });

    expect(player).toEqual({
      id: 'player-1',
      name: 'Player One',
      url: null,
      image: null,
    });
  });
});

describe('normalizeRounds', () => {
  it('maps id and winner flags', () => {
    const { rounds } = normalizeRounds([
      [
        {
          player1: { name: 'A', id: 1, winner: true },
          player2: { name: 'B', id: 2 },
        },
      ],
      [{ player1: { name: 'A', id: 1 } }],
    ]);
    expect(rounds[0][0].slots[0].id).toBe('1');
    expect(rounds[0][0].winnerId).toBe('1');
  });

  it('pads first round to next power of two with byes', () => {
    const { rounds } = normalizeRounds([
      [
        { player1: { name: 'A', id: 'a' }, player2: { name: 'B', id: 'b' } },
        { player1: { name: 'C', id: 'c' }, player2: { name: 'D', id: 'd' } },
        { player1: { name: 'E', id: 'e' }, player2: { name: 'F', id: 'f' } },
      ],
    ]);
    expect(rounds[0]).toHaveLength(4);
    const bye = rounds[0][3];
    expect(bye.slots[0] == null && bye.slots[1] == null).toBe(true);
  });
});

describe('setWinner', () => {
  it('advances winner and clears downstream on change', () => {
    const { rounds } = normalizeRounds([
      [
        {
          player1: { name: 'A', id: 'a', winner: true },
          player2: { name: 'B', id: 'b' },
        },
        {
          player1: { name: 'C', id: 'c', winner: true },
          player2: { name: 'D', id: 'd' },
        },
      ],
      [
        {
          player1: { name: 'A', id: 'a' },
          player2: { name: 'C', id: 'c' },
        },
      ],
      [{ player1: { name: 'A', id: 'a' } }],
    ]);
    let state = { rounds };
    state = setWinner(state, 0, 0, 'b');
    expect(state.rounds[0][0].winnerId).toBe('b');
    expect(state.rounds[1][0].slots[0].id).toBe('b');
    expect(state.rounds[1][0].winnerId).toBeNull();
  });
});

describe('thirdPlace', () => {
  const fourPlayer = [
    [
      {
        player1: { name: 'A', id: 'a', winner: true },
        player2: { name: 'B', id: 'b' },
      },
      {
        player1: { name: 'C', id: 'c', winner: true },
        player2: { name: 'D', id: 'd' },
      },
    ],
    [
      {
        player1: { name: 'A', id: 'a' },
        player2: { name: 'C', id: 'c' },
      },
    ],
    [{ player1: { name: 'A', id: 'a' } }],
  ];

  it('is omitted by default', () => {
    const { thirdPlace } = normalizeRounds(fourPlayer);
    expect(thirdPlace).toBeNull();
  });

  it('fills from semifinal losers when enabled', () => {
    const { rounds, thirdPlace } = normalizeRounds(fourPlayer, {
      thirdPlace: true,
    });
    expect(thirdPlace).toBeTruthy();
    expect(thirdPlace.slots[0].id).toBe('b');
    expect(thirdPlace.slots[1].id).toBe('d');
    expect(rounds[0]).toHaveLength(2);
  });

  it('updates third-place slots when a semifinal winner changes', () => {
    let state = normalizeRounds(fourPlayer, { thirdPlace: true });
    state = setWinner(state, 0, 0, 'b');
    expect(state.thirdPlace.slots[0].id).toBe('a');
    expect(state.thirdPlace.winnerId).toBeNull();
  });

  it('sets third-place winner without touching the main bracket', () => {
    let state = normalizeRounds(fourPlayer, { thirdPlace: true });
    state = setWinner(state, 'thirdPlace', 0, 'b');
    expect(state.thirdPlace.winnerId).toBe('b');
    expect(state.rounds[1][0].winnerId).toBeNull();
  });
});

describe('player image', () => {
  it('keeps safe image URLs and rejects javascript:', () => {
    expect(
      normalizePlayer({ name: 'A', id: 'a', image: 'https://cdn.example/it.svg' }).image,
    ).toBe('https://cdn.example/it.svg');
    expect(
      normalizePlayer({ name: 'A', id: 'a', image: 'javascript:alert(1)' }).image,
    ).toBeNull();
  });

  it('serializes image on getSerializableState path via normalizeRounds', () => {
    const { rounds } = normalizeRounds([
      [
        {
          player1: { name: 'A', id: 'a', winner: true, image: 'https://cdn.example/a.png' },
          player2: { name: 'B', id: 'b' },
        },
      ],
      [{ player1: { name: 'A', id: 'a' } }],
    ]);
    expect(rounds[0][0].slots[0].image).toBe('https://cdn.example/a.png');
    expect(rounds[0][0].slots[1].image).toBeNull();
  });
});
