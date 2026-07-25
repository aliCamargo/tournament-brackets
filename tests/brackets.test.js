import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Brackets } from '../src/index';
import { BracketsController } from '../src/controller/brackets.controller';
import { BracketRenderer } from '../src/ui/bracket.renderer';

const sampleRounds = [
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

describe('renderBracket security', () => {
  it('does not interpret HTML in player names', () => {
    const root = BracketRenderer.render(
      {
        rounds: [
          [
            {
              roundIndex: 0,
              matchIndex: 0,
              winnerId: null,
              slots: [
                { id: 'x', name: '<img src=x onerror=alert(1)>', url: null },
                null,
              ],
            },
          ],
        ],
      },
      {},
    );
    expect(root.querySelectorAll('img')).toHaveLength(0);
    expect(root.textContent).toContain('<img src=x onerror=alert(1)>');
  });

  it('rejects javascript: urls', () => {
    const root = BracketRenderer.render(
      {
        rounds: [
          [
            {
              roundIndex: 0,
              matchIndex: 0,
              winnerId: null,
              slots: [
                { id: 'x', name: 'Hack', url: 'javascript:alert(1)' },
                null,
              ],
            },
          ],
        ],
      },
      {},
    );
    expect(root.querySelector('a')).toBeNull();
  });
});

describe('Brackets.create', () => {
  let el;
  let errorSpy;

  beforeEach(() => {
    el = document.createElement('div');
    document.body.appendChild(el);
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    el.remove();
    errorSpy.mockRestore();
  });

  it('renders matches into the mount element', () => {
    Brackets.create(el, { rounds: sampleRounds, titles: true });
    expect(el.querySelectorAll('.jb-match').length).toBeGreaterThan(0);
    expect(el.querySelectorAll('.jb-player').length).toBeGreaterThan(0);
  });

  it('mounts through the controller with the same public API', () => {
    const api = BracketsController.mount(el, { rounds: sampleRounds });

    expect(api).toEqual(
      expect.objectContaining({
        setRounds: expect.any(Function),
        getState: expect.any(Function),
        destroy: expect.any(Function),
        setViewFromRound: expect.any(Function),
      }),
    );
    expect(el.querySelectorAll('.jb-match').length).toBeGreaterThan(0);
  });

  it('is read-only: player clicks do not change winners', () => {
    const onChange = vi.fn();
    const api = Brackets.create(el, {
      rounds: sampleRounds,
      onChange,
    });
    onChange.mockClear();
    const before = api.getState().rounds[0][0].winnerId;
    el.querySelector('.jb-player[data-player-id="b"]').click();
    expect(onChange).not.toHaveBeenCalled();
    expect(api.getState().rounds[0][0].winnerId).toBe(before);
  });

  it('destroy clears the mount element', () => {
    const api = Brackets.create(el, { rounds: sampleRounds });
    api.destroy();
    expect(el.childNodes).toHaveLength(0);
  });

  it('logs error and shows empty state without rounds', () => {
    Brackets.create(el, {});
    expect(errorSpy).toHaveBeenCalled();
    expect(el.querySelector('.jb-empty')).toBeTruthy();
  });

  it('applies radius 0 as square corners', () => {
    Brackets.create(el, { rounds: sampleRounds, radius: 0 });
    expect(el.querySelector('.jb-root').style.getPropertyValue('--jb-radius')).toBe(
      '0px',
    );
  });

  it('honors data-radius over options.radius', () => {
    el.setAttribute('data-radius', '0');
    Brackets.create(el, { rounds: sampleRounds, radius: 12 });
    expect(el.querySelector('.jb-root').style.getPropertyValue('--jb-radius')).toBe(
      '0px',
    );
  });

  it('applies matchWidth to column CSS variable', () => {
    Brackets.create(el, { rounds: sampleRounds, matchWidth: 240 });
    expect(
      el.querySelector('.jb-root').style.getPropertyValue('--jb-match-width'),
    ).toBe('240px');
  });

  it('honors data-match-width over options.matchWidth', () => {
    el.setAttribute('data-match-width', '220');
    Brackets.create(el, { rounds: sampleRounds, matchWidth: 180 });
    expect(
      el.querySelector('.jb-root').style.getPropertyValue('--jb-match-width'),
    ).toBe('220px');
  });

  it('renders single scores on player rows', () => {
    Brackets.create(el, {
      rounds: [
        [
          {
            player1: { name: 'A', id: 'a', winner: true },
            player2: { name: 'B', id: 'b' },
            score: [2, 1],
          },
        ],
        [{ player1: { name: 'A', id: 'a' } }],
      ],
      showScores: true,
    });
    const scores = [...el.querySelectorAll('.jb-player__score')].map(
      (n) => n.textContent,
    );
    expect(scores).toEqual(['2', '1']);
  });

  it('renders tie-break extras as superscripts', () => {
    Brackets.create(el, {
      rounds: [
        [
          {
            player1: { name: 'A', id: 'a', winner: true },
            player2: { name: 'B', id: 'b' },
            score: [
              [[6, 7], [7, 9]],
              [[7, 6], [7, 2]],
              [6, 3],
            ],
            scoreType: 'sets',
          },
        ],
        [{ player1: { name: 'A', id: 'a' } }],
      ],
      showScores: true,
    });
    const row0 = el.querySelector('.jb-player[data-player-id="a"] .jb-player__score');
    const row1 = el.querySelector('.jb-player[data-player-id="b"] .jb-player__score');
    expect([...row0.querySelectorAll('.jb-score__extra')].map((n) => n.textContent)).toEqual([
      '7',
      '7',
    ]);
    expect([...row1.querySelectorAll('.jb-score__extra')].map((n) => n.textContent)).toEqual([
      '9',
      '2',
    ]);
  });

  it('renders sets per player inside each row', () => {
    Brackets.create(el, {
      rounds: [
        [
          {
            player1: { name: 'A', id: 'a', winner: true },
            player2: { name: 'B', id: 'b' },
            score: [
              [6, 4],
              [7, 5],
            ],
          },
        ],
        [{ player1: { name: 'A', id: 'a' } }],
      ],
      showScores: true,
    });
    const scores = [...el.querySelectorAll('.jb-player__score')].map((n) =>
      [...n.querySelectorAll('.jb-score__period')].map((p) => p.textContent).join(' '),
    );
    expect(scores).toEqual(['6 7', '4 5']);
    expect(el.querySelector('.jb-match__sets')).toBeNull();
  });

  it('shows match status on the card badge', () => {
    Brackets.create(el, {
      rounds: [
        [
          {
            player1: { name: 'A', id: 'a' },
            player2: { name: 'B', id: 'b' },
            status: 'in_progress',
            score: [1, 0],
          },
        ],
        [{ player1: { name: 'A', id: 'a' } }],
      ],
    });
    expect(el.querySelector('.jb-match__badge')?.textContent).toBe('In Progress');
    const winner = el.querySelector('.jb-player--winner');
    // No fill highlight on winners (Wimbledon-style: bold + mark only)
    expect(winner).toBeNull();
  });

  it('round nav collapses late stages into one pill', () => {
    const onRoundChange = vi.fn();
    // 8 players → SF at index 2
    const big = [
      [
        { player1: { name: 'A', id: 'a', winner: true }, player2: { name: 'B', id: 'b' } },
        { player1: { name: 'C', id: 'c', winner: true }, player2: { name: 'D', id: 'd' } },
        { player1: { name: 'E', id: 'e', winner: true }, player2: { name: 'F', id: 'f' } },
        { player1: { name: 'G', id: 'g', winner: true }, player2: { name: 'H', id: 'h' } },
      ],
      [
        { player1: { name: 'A', id: 'a', winner: true }, player2: { name: 'C', id: 'c' } },
        { player1: { name: 'E', id: 'e', winner: true }, player2: { name: 'G', id: 'g' } },
      ],
      [
        { player1: { name: 'A', id: 'a', winner: true }, player2: { name: 'E', id: 'e' } },
      ],
      [{ player1: { name: 'A', id: 'a' } }],
    ];
    Brackets.create(el, {
      rounds: big,
      titles: true,
      roundNav: true,
      onRoundChange,
    });
    const labels = [...el.querySelectorAll('.jb-round-nav__btn')].map(
      (b) => b.textContent,
    );
    expect(labels.at(-1)).toBe('Semifinals & Championship');
    el.querySelector('.jb-round-nav__btn:last-child').click();
    expect(onRoundChange).toHaveBeenCalled();
    expect(el.querySelector('.jb-round-nav__btn--active')?.textContent).toBe(
      'Semifinals & Championship',
    );
    // No champion-only column — final + semi only
    expect(el.querySelectorAll('.jb-match__badge').length).toBeGreaterThan(0);
    expect(el.querySelector('.jb-header')).toBeNull();
    expect(el.querySelectorAll('.jb-match').length).toBe(3);
  });

  it('hides lead-in lines on first round and shows them when viewing later stages', () => {
    const big = [
      [
        { player1: { name: 'A', id: 'a', winner: true }, player2: { name: 'B', id: 'b' } },
        { player1: { name: 'C', id: 'c', winner: true }, player2: { name: 'D', id: 'd' } },
        { player1: { name: 'E', id: 'e', winner: true }, player2: { name: 'F', id: 'f' } },
        { player1: { name: 'G', id: 'g', winner: true }, player2: { name: 'H', id: 'h' } },
      ],
      [
        { player1: { name: 'A', id: 'a', winner: true }, player2: { name: 'C', id: 'c' } },
        { player1: { name: 'E', id: 'e', winner: true }, player2: { name: 'G', id: 'g' } },
      ],
      [
        { player1: { name: 'A', id: 'a', winner: true }, player2: { name: 'E', id: 'e' } },
      ],
      [{ player1: { name: 'A', id: 'a' } }],
    ];
    const api = Brackets.create(el, {
      rounds: big,
      roundNav: true,
      viewFromRound: 0,
    });
    expect(el.querySelectorAll('.jb-connector--lead-in')).toHaveLength(0);

    api.setViewFromRound(1); // round with 2 matches (semis)
    const leadIns = el.querySelectorAll('.jb-connector--lead-in');
    expect(leadIns.length).toBe(2);
    expect(el.querySelector('.jb-bracket--lead-in')).toBeTruthy();
  });

  it('keeps round nav outside the horizontal scroll region', () => {
    const big = [
      [
        { player1: { name: 'A', id: 'a', winner: true }, player2: { name: 'B', id: 'b' } },
        { player1: { name: 'C', id: 'c', winner: true }, player2: { name: 'D', id: 'd' } },
        { player1: { name: 'E', id: 'e', winner: true }, player2: { name: 'F', id: 'f' } },
        { player1: { name: 'G', id: 'g', winner: true }, player2: { name: 'H', id: 'h' } },
      ],
      [
        { player1: { name: 'A', id: 'a', winner: true }, player2: { name: 'C', id: 'c' } },
        { player1: { name: 'E', id: 'e', winner: true }, player2: { name: 'G', id: 'g' } },
      ],
      [
        { player1: { name: 'A', id: 'a', winner: true }, player2: { name: 'E', id: 'e' } },
      ],
      [{ player1: { name: 'A', id: 'a' } }],
    ];
    Brackets.create(el, { rounds: big, roundNav: true });
    const nav = el.querySelector('.jb-round-nav');
    const scroll = el.querySelector('.jb-scroll');
    expect(nav).toBeTruthy();
    expect(scroll).toBeTruthy();
    expect(scroll.contains(nav)).toBe(false);
    expect(scroll.querySelector('.jb-bracket')).toBeTruthy();
  });

  it('marks in-progress badges as live for pulse animation', () => {
    Brackets.create(el, {
      rounds: [
        [
          {
            player1: { name: 'A', id: 'a' },
            player2: { name: 'B', id: 'b' },
            status: 'in_progress',
            score: [1, 0],
          },
        ],
        [{ player1: { name: 'A', id: 'a' } }],
      ],
    });
    const badge = el.querySelector('.jb-match__badge--in_progress');
    expect(badge).toBeTruthy();
    expect(badge.classList.contains('jb-match__badge--live')).toBe(true);
    expect(el.querySelector('.jb-match__badge--final')?.classList.contains('jb-match__badge--live')).toBeFalsy();
    el.querySelectorAll('.jb-match__badge:not(.jb-match__badge--in_progress)').forEach((b) => {
      expect(b.classList.contains('jb-match__badge--live')).toBe(false);
    });
  });

  it('adds entrance delay hooks to matches and connectors', () => {
    Brackets.create(el, { rounds: sampleRounds });
    const matches = [...el.querySelectorAll('.jb-match')];
    expect(matches.length).toBeGreaterThan(0);
    matches.forEach((m) => {
      expect(m.classList.contains('jb-enter')).toBe(true);
      expect(m.style.getPropertyValue('--jb-enter-delay')).toMatch(/ms$/);
    });
    const connectors = [...el.querySelectorAll('.jb-connector')];
    expect(connectors.length).toBeGreaterThan(0);
    connectors.forEach((c) => {
      expect(c.classList.contains('jb-enter')).toBe(true);
      expect(c.style.getPropertyValue('--jb-enter-delay')).toMatch(/ms$/);
    });
    // First-column first match should be earliest (0ms)
    const first = el.querySelector('.jb-match[data-round="0"][data-match="0"]');
    expect(first.style.getPropertyValue('--jb-enter-delay')).toBe('0ms');
  });

  it('shows images when any player has image, with default for missing', () => {
    Brackets.create(el, {
      rounds: [
        [
          {
            player1: {
              name: 'A',
              id: 'a',
              winner: true,
              image: 'https://cdn.example/a.svg',
            },
            player2: { name: 'B', id: 'b' },
          },
        ],
        [{ player1: { name: 'A', id: 'a' } }],
      ],
    });
    expect(el.querySelector('.jb-bracket--images')).toBeTruthy();
    const imgA = el.querySelector('.jb-player[data-player-id="a"] img.jb-player__image');
    expect(imgA?.getAttribute('src')).toBe('https://cdn.example/a.svg');
    const defB = el.querySelector(
      '.jb-player[data-player-id="b"] .jb-player__image--default',
    );
    expect(defB).toBeTruthy();
  });

  it('hides image slots when no player has an image', () => {
    Brackets.create(el, {
      rounds: [
        [
          {
            player1: { name: 'A', id: 'a', winner: true },
            player2: { name: 'B', id: 'b' },
          },
        ],
        [{ player1: { name: 'A', id: 'a' } }],
      ],
    });
    expect(el.querySelector('.jb-player__image')).toBeNull();
    expect(el.querySelector('.jb-bracket--images')).toBeNull();
  });
});
