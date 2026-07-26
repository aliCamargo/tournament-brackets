# tournament-brackets

Reusable **single-elimination** tournament brackets. Vanilla ESM core, optional jQuery adapter, CSS-variable themes. Display-only (read-only) — winners come from your data.

> Evolved from [jquery-brackets](https://github.com/aliCamargo/jquery-brackets). This project is framework-agnostic; a thin React adapter is available, with Vue / Angular on the roadmap.

## Install

```bash
npm install @ali.camargo/tournament-brackets
```

## Usage (ESM)

```js
import { Brackets } from '@ali.camargo/tournament-brackets';
import '@ali.camargo/tournament-brackets/style.css';

const el = document.querySelector('#bracket');
const api = Brackets.create(el, {
  rounds,
  titles: true,           // or string[]
  thirdPlace: true,       // optional 3rd-place game (semifinal losers)
  radius: 8,              // 0 = square corners
  matchWidth: 200,        // column width in px (optional)
  roundNav: true,         // clickable rounds; bracket starts from selected stage
  theme: 'default',       // 'default' | 'dark'
  onChange(state) {
    console.log(state);
  },
});

api.getState();
api.setRounds(rounds);
api.destroy();
```

Live `setRounds` updates reuse the existing `.jb-root` element and replace its contents. Any sibling nodes in the mount element are cleared during the paint.

### TypeScript

```ts
import { Brackets, create } from '@ali.camargo/tournament-brackets';
import type { BracketsOptions, Match, Player } from '@ali.camargo/tournament-brackets/types';
import '@ali.camargo/tournament-brackets/style.css';

const options: BracketsOptions = { rounds, theme: 'dark' };
const api = Brackets.create(el, options);
```

Types also ship on the main entry (`import type { BracketsOptions } from '@ali.camargo/tournament-brackets'`).

Internals use a layered class architecture (services + controller); the public API above is unchanged.

### Rounds data

```js
const rounds = [
  [
    {
      player1: { name: 'Player 1', id: 1, winner: true, url: 'https://example.com' },
      player2: { name: 'Player 2', id: 2 },
    },
  ],
  [{ player1: { name: 'Player 1', id: 1 } }],
];
```

Players use `id`. Non–power-of-two first rounds are padded with byes.

```js
{ name: 'J. Sinner', id: 1, image: 'https://example.com/it.svg' }
// Image column auto-appears when any player has image; others get a default avatar.
```

### Match scores

```js
// Football / single result — shown on each player row
{ player1: {…}, player2: {…}, score: [2, 1] }

// Tennis / multi-period — each player's set scores on their row
{ player1: {…}, player2: {…}, score: [[6, 4], [3, 6], [7, 5]], scoreType: 'sets' }
// → Player 1: 6 3 7   |   Player 2: 4 6 5

// Tie-break / extra (nested pair) — superscript on each player row
{
  score: [
    [[6, 7], [7, 9]], // → 6⁷ / 7⁹
    [[7, 6], [7, 2]], // → 7⁷ / 6²
    [6, 3],
    [6, 4],
  ],
  scoreType: 'sets',
}

// Or per-player
{ player1: { name: 'A', score: 2 }, player2: { name: 'B', score: 1 } }
```

### Match status badge

```js
{ player1: {…}, player2: {…}, status: 'in_progress' }
// scheduled | in_progress | final | retired | walkover
// Auto: winner → final, score without winner → in_progress, else scheduled
```

## jQuery adapter

```html
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="dist/jquery-adapter.umd.cjs"></script>
```

```js
import $ from 'jquery';
import '@ali.camargo/tournament-brackets/jquery';
import '@ali.camargo/tournament-brackets/style.css';

$('.brackets').brackets({
  rounds,
  titles: true,
  theme: 'default',
});

const api = $('.brackets').data('brackets');
```

See also `demo/jquery.html`.

## Usage (React)

Peer dependencies: `react` and `react-dom` >= 17.

```tsx
import { useRef } from 'react';
import { Brackets } from '@ali.camargo/tournament-brackets/react';
import type { BracketsApi } from '@ali.camargo/tournament-brackets';
import '@ali.camargo/tournament-brackets/style.css';

function Tournament({ rounds }) {
  const apiRef = useRef<BracketsApi>(null);

  return (
    <Brackets
      ref={apiRef}
      rounds={rounds}
      theme="dark"
      titles
      thirdPlace
      roundNav
      onChange={(state) => console.log(state)}
    />
  );
}
```

Props mirror vanilla `BracketsOptions`, plus `className` / `style` on the host element. The `ref` exposes `getState`, `setRounds`, `setViewFromRound`, and `destroy`.

Keep `rounds` referentially stable (for example, memoize derived data) when `onChange` updates parent state; a new `rounds` identity triggers a live `setRounds` update. `viewFromRound` is an initial and imperative-synced value rather than a fully controlled prop: round-nav clicks may diverge from it until you pass a new value or call `setViewFromRound` through the ref.

See also `demo/react.html`.

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `rounds` | required | Nested match arrays |
| `titles` | `false` | `true` for auto labels, or `string[]` |
| `thirdPlace` | `false` | Show 3rd-place match (semifinal losers); or pass a match object to seed it. Also `data-third-place` |
| `radius` | `8` | Corner radius in px (`0` = square). Also `data-radius` |
| `matchWidth` | — | Match card column width in px (or CSS length). Also `data-match-width`. Default 168px / 200px with scores |
| `showScores` | `'auto'` | `true` \| `false` \| `'auto'` (show when any match has `score`) |
| `roundNav` | `false` | Clickable round pills; late stages collapse into “Semifinals & Championship”. Also `data-round-nav` |
| `viewFromRound` | `0` | Initial stage index when `roundNav` is on |
| `theme` | `'default'` | `'default'` \| `'dark'` |
| `labels` | Round / Semifinal / Final / Champion / 3rd Place | Auto title strings |
| `onChange` | — | Fired after `setRounds` / data updates |

## Theming

```css
.jb-root {
  --jb-bg: #f4f6f8;
  --jb-surface: #fff;
  --jb-border: #c5ced6;
  --jb-text: #1a2330;
  --jb-accent: #0b6e4f;
  --jb-winner: #0b6e4f;
  --jb-radius: 8px;
}
```

## Motion

Short left-to-right entrance on paint (including round-nav changes). Matches with `status: 'in_progress'` show a soft badge pulse. Disabled under `prefers-reduced-motion: reduce`.

## Scripts

```bash
pnpm install
pnpm test
pnpm dev     # / = vanilla, /jquery.html = jQuery, /react.html = React
pnpm build   # dist/ ESM + UMD + CSS
```

## Roadmap

Thin framework adapters on the same core (no UI rewrite):

1. ~~React~~ — available via `@ali.camargo/tournament-brackets/react`
2. Vue
3. Angular
## Predecessor

Active development moved here from **jquery-brackets**. The old repo remains as a historical reference.

## Author

* [Ali Camargo](https://github.com/aliCamargo)
