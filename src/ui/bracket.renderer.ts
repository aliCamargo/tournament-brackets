import { BracketModelHelper } from '../helpers/bracket-model.helper';
import { ScoreHelper } from '../helpers/score.helper';
import { StatusHelper } from '../helpers/status.helper';
import { UrlUtils } from '../utils/url.utils';
import type {
  BracketsLabels,
  Match,
  Player,
  Rounds,
} from '../types';
import type {
  RenderOptions,
  RenderState,
  RoundNavItem,
} from './interfaces/render.interface';

export class BracketRenderer {
  static readonly COLUMN_ENTER_STEP_MS = 100;
  static readonly MATCH_ENTER_STEP_MS = 35;

  static enterDelayMs(relColumn: number, matchIndex: number): number {
    return (
      relColumn * BracketRenderer.COLUMN_ENTER_STEP_MS +
      matchIndex * BracketRenderer.MATCH_ENTER_STEP_MS
    );
  }

  private static applyEnter(el: HTMLElement, delayMs: number): void {
    el.classList.add('jb-enter');
    el.style.setProperty('--jb-enter-delay', `${delayMs}ms`);
  }

  static resolveTitles(
    roundCount: number,
    titles: boolean | string[] | undefined,
    labels: BracketsLabels = {},
  ): string[] | null {
    if (Array.isArray(titles)) return titles;
    if (titles === false) return null;

    const L = {
      round: 'Round ',
      semifinal: 'Semifinal',
      final: 'Final',
      champion: 'Champion',
      ...labels,
    };
    const out: string[] = [];
    for (let i = 1; i <= roundCount; i++) {
      if (i === roundCount) out.push(L.champion!);
      else if (i === roundCount - 1 && roundCount > 2) out.push(L.final!);
      else if (i === roundCount - 2 && roundCount > 3) out.push(L.semifinal!);
      else out.push(`${L.round}${i}`);
    }
    return out;
  }

  private static isChampionOnlyRound(
    round: Match[] | undefined,
    roundIndex: number,
    totalRounds: number,
  ): boolean {
    if (totalRounds < 2) return false;
    if (roundIndex !== totalRounds - 1 || !round?.length) return false;
    const match = round[0];
    return !!(match?.slots?.[0] && !match.slots[1]);
  }

  static buildRoundNavItems(
    rounds: Rounds,
    titles: boolean | string[] | undefined,
    labels: BracketsLabels = {},
  ): RoundNavItem[] {
    const allTitles =
      BracketRenderer.resolveTitles(
        rounds.length,
        titles === false ? true : (titles ?? true),
        labels,
      ) || rounds.map((_, i) => `Round ${i + 1}`);

    const semiIdx = BracketModelHelper.getSemifinalRoundIndex(rounds);
    const L = {
      lateStages: 'Semifinals & Championship',
      ...labels,
    };

    const items: RoundNavItem[] = [];
    if (semiIdx != null && semiIdx > 0 && rounds.length - semiIdx >= 2) {
      for (let i = 0; i < semiIdx; i++) {
        items.push({ label: allTitles[i], viewFromRound: i });
      }
      items.push({
        label: L.lateStages!,
        viewFromRound: semiIdx,
        collapsesToEnd: true,
      });
    } else {
      allTitles.forEach((label, i) => {
        items.push({ label, viewFromRound: i });
      });
    }
    return items;
  }

  private static bracketHasImages(state: RenderState): boolean {
    const inRounds = (state.rounds || []).some((round) =>
      round.some((m) => m.slots?.some((s) => s?.image)),
    );
    return inRounds || !!state.thirdPlace?.slots?.some((s) => s?.image);
  }

  private static createDefaultImageEl(): HTMLElement {
    const wrap = document.createElement('span');
    wrap.className = 'jb-player__image jb-player__image--default';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" focusable="false">' +
      '<circle cx="8" cy="8" r="8" fill="currentColor" opacity="0.15"/>' +
      '<circle cx="8" cy="6" r="2.5" fill="currentColor" opacity="0.45"/>' +
      '<path d="M3.5 13.5c1.2-2 2.8-3 4.5-3s3.3 1 4.5 3" fill="currentColor" opacity="0.45"/>' +
      '</svg>';
    return wrap;
  }

  private static createPlayerImageEl(player: Player): HTMLElement {
    if (player.image) {
      const img = document.createElement('img');
      img.className = 'jb-player__image';
      img.src = player.image;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener(
        'error',
        () => {
          img.replaceWith(BracketRenderer.createDefaultImageEl());
        },
        { once: true },
      );
      return img;
    }
    return BracketRenderer.createDefaultImageEl();
  }

  private static createPlayerEl(
    player: Player | null,
    match: Match,
    slotIndex: number,
    showScores: boolean,
    showImages: boolean,
  ): HTMLElement {
    const el = document.createElement('div');
    el.className = 'jb-player';
    if (!player) {
      el.classList.add('jb-player--bye');
      el.textContent = match.kind === 'thirdPlace' ? 'TBD' : 'Bye';
      return el;
    }

    el.dataset.playerId = player.id;
    const isWinner = match.winnerId === player.id;
    if (isWinner) el.classList.add('jb-player--winner');
    else if (match.winnerId) el.classList.add('jb-player--loser');

    const mark = document.createElement('span');
    mark.className = 'jb-player__mark';
    if (isWinner) mark.classList.add('jb-player__mark--on');
    mark.setAttribute('aria-hidden', 'true');
    el.appendChild(mark);

    if (showImages) el.appendChild(BracketRenderer.createPlayerImageEl(player));

    const safeUrl = UrlUtils.sanitize(player.url);
    if (safeUrl) {
      const a = document.createElement('a');
      a.className = 'jb-player__name';
      a.href = safeUrl;
      a.textContent = player.name;
      el.appendChild(a);
    } else {
      const span = document.createElement('span');
      span.className = 'jb-player__name';
      span.textContent = player.name;
      el.appendChild(span);
    }

    if (showScores && match.score) {
      const scoreEl = document.createElement('span');
      scoreEl.className = 'jb-player__score';
      if (match.score.mode === 'sets') {
        scoreEl.classList.add('jb-player__score--sets');
      }
      if (ScoreHelper.appendForSlot(scoreEl, match.score, slotIndex)) {
        el.appendChild(scoreEl);
      }
    }

    return el;
  }

  private static roundColumn(roundIndex: number, leadInOffset = 0): number {
    return leadInOffset + roundIndex * 2 + 1;
  }

  private static connectorColumn(roundIndex: number, leadInOffset = 0): number {
    return leadInOffset + roundIndex * 2 + 2;
  }

  private static buildColumnTemplate(
    roundCount: number,
    { leadIn = false }: { leadIn?: boolean } = {},
  ): string[] {
    const colTemplate: string[] = [];
    if (leadIn) colTemplate.push('var(--jb-lead-in-width)');
    for (let r = 0; r < roundCount; r++) {
      colTemplate.push('var(--jb-col-width)');
      if (r < roundCount - 1) colTemplate.push('var(--jb-connector-width)');
    }
    return colTemplate;
  }

  private static createMatchEl(
    match: Match,
    {
      champion = false,
      showScores = true,
      showImages = false,
      labels = {},
      enterDelayMs: delayMs,
    }: {
      champion?: boolean;
      showScores?: boolean;
      showImages?: boolean;
      labels?: BracketsLabels;
      enterDelayMs?: number;
    } = {},
  ): HTMLElement {
    const matchEl = document.createElement('div');
    matchEl.className = 'jb-match';
    if (match.kind === 'thirdPlace') matchEl.classList.add('jb-match--third-place');
    if (champion) matchEl.classList.add('jb-match--champion');
    if (match.status) matchEl.dataset.status = match.status;

    matchEl.dataset.round = String(match.roundIndex);
    matchEl.dataset.match = String(match.matchIndex);

    const badgeEl = document.createElement('div');
    const status = match.status || 'scheduled';
    badgeEl.className = `jb-match__badge jb-match__badge--${status}`;
    if (status === 'in_progress') {
      badgeEl.classList.add('jb-match__badge--live');
    }
    badgeEl.textContent = StatusHelper.formatLabel(status, labels);
    matchEl.appendChild(badgeEl);

    const body = document.createElement('div');
    body.className = 'jb-match__body';

    match.slots.forEach((player, slotIndex) => {
      if (champion && !player && match.slots[0]) return;
      body.appendChild(
        BracketRenderer.createPlayerEl(
          player,
          match,
          slotIndex,
          showScores,
          showImages,
        ),
      );
    });

    matchEl.appendChild(body);
    if (delayMs != null) BracketRenderer.applyEnter(matchEl, delayMs);
    return matchEl;
  }

  private static bracketHasScores(state: RenderState): boolean {
    const inRounds = (state.rounds || []).some((round) =>
      round.some((m) => m.score),
    );
    return inRounds || !!state.thirdPlace?.score;
  }

  private static createRoundNav(
    items: RoundNavItem[],
    viewFromRound: number,
  ): HTMLElement {
    const nav = document.createElement('div');
    nav.className = 'jb-round-nav jb-enter';
    nav.style.setProperty('--jb-enter-delay', '0ms');
    nav.setAttribute('role', 'tablist');
    nav.setAttribute('aria-label', 'Tournament rounds');

    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'jb-round-nav__btn';
      const active = item.collapsesToEnd
        ? viewFromRound >= item.viewFromRound
        : viewFromRound === item.viewFromRound;
      if (active) {
        btn.classList.add('jb-round-nav__btn--active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.setAttribute('aria-selected', 'false');
      }
      btn.dataset.roundIndex = String(item.viewFromRound);
      btn.textContent = item.label;
      btn.setAttribute('role', 'tab');
      nav.appendChild(btn);
    });

    return nav;
  }

  static render(
    state: RenderState,
    options: RenderOptions = {},
  ): HTMLElement {
    const {
      theme = 'default',
      titles = false,
      labels = {
        round: 'Round ',
        semifinal: 'Semifinal',
        final: 'Final',
        champion: 'Champion',
        thirdPlace: '3rd Place',
        lateStages: 'Semifinals & Championship',
        statusScheduled: 'Scheduled',
        statusInProgress: 'In Progress',
        statusFinal: 'Final',
        statusRetired: 'Retired',
        statusWalkover: 'Walkover',
      },
      showScores = 'auto',
      roundNav = false,
      viewFromRound = 0,
    } = options;

    const root = document.createElement('div');
    root.className = `jb-root jb-theme-${theme}`;

    const scoresVisible =
      showScores === true ||
      (showScores === 'auto' && BracketRenderer.bracketHasScores(state));

    const showImages = BracketRenderer.bracketHasImages(state);

    const rounds = state.rounds || [];
    if (!rounds.length) {
      const empty = document.createElement('p');
      empty.className = 'jb-empty';
      empty.textContent = 'No rounds to display.';
      root.appendChild(empty);
      return root;
    }

    const from = Math.max(0, Math.min(viewFromRound, rounds.length - 1));

    let sliceStart = from;
    if (
      BracketRenderer.isChampionOnlyRound(
        rounds[from],
        from,
        rounds.length,
      )
    ) {
      sliceStart = Math.max(0, from - 1);
    }
    const visibleSource = rounds
      .map((round, i) => ({ round, absolute: i }))
      .filter(
        ({ round, absolute }) =>
          absolute >= sliceStart &&
          !BracketRenderer.isChampionOnlyRound(round, absolute, rounds.length),
      );

    const layout = document.createElement('div');
    layout.className = 'jb-layout';

    if (roundNav) {
      const navItems = BracketRenderer.buildRoundNavItems(rounds, titles, labels);
      layout.appendChild(BracketRenderer.createRoundNav(navItems, sliceStart));
    }

    if (!visibleSource.length) {
      root.appendChild(layout);
      return root;
    }

    const firstCount = visibleSource[0].round.length;
    const leadIn = sliceStart > 0;
    const leadInOffset = leadIn ? 1 : 0;
    const colTemplate = BracketRenderer.buildColumnTemplate(
      visibleSource.length,
      { leadIn },
    );

    const finalIdx =
      BracketModelHelper.getFinalRoundIndex(rounds) ?? rounds.length - 2;
    const showThirdPlace = !!(state.thirdPlace && finalIdx >= sliceStart);

    const container = document.createElement('div');
    container.className = 'jb-bracket';
    if (scoresVisible) container.classList.add('jb-bracket--scores');
    if (showImages) container.classList.add('jb-bracket--images');
    if (leadIn) container.classList.add('jb-bracket--lead-in');
    if (showThirdPlace) container.classList.add('jb-bracket--third-place');
    container.style.gridTemplateColumns = colTemplate.join(' ');
    container.style.gridTemplateRows = `repeat(${firstCount}, var(--jb-slot-height))`;
    container.style.setProperty('--jb-first-count', String(firstCount));

    if (leadIn) {
      visibleSource[0].round.forEach((_, m) => {
        const line = document.createElement('div');
        line.className = 'jb-connector jb-connector--lead-in';
        line.setAttribute('aria-hidden', 'true');
        line.style.gridColumn = '1';
        line.style.gridRow = `${m + 1} / ${m + 2}`;
        BracketRenderer.applyEnter(line, BracketRenderer.enterDelayMs(0, m));
        container.appendChild(line);
      });
    }

    visibleSource.forEach(({ round, absolute }, rel) => {
      const span = 2 ** rel;
      const isFinalCol =
        absolute ===
        (BracketModelHelper.getFinalRoundIndex(rounds) ?? rounds.length - 1);

      round.forEach((match, m) => {
        const isChampion = isFinalCol && round.length === 1;
        const matchEl = BracketRenderer.createMatchEl(match, {
          champion: isChampion,
          showScores: scoresVisible,
          showImages,
          labels,
          enterDelayMs: BracketRenderer.enterDelayMs(rel, m),
        });
        const gridColumn = String(
          BracketRenderer.roundColumn(rel, leadInOffset),
        );
        const gridRow = `${m * span + 1} / ${(m + 1) * span + 1}`;

        // Final stays vertically centered; 3rd place hangs a few px under it.
        if (isChampion && showThirdPlace && state.thirdPlace) {
          const stack = document.createElement('div');
          stack.className = 'jb-final-stack';
          stack.style.gridColumn = gridColumn;
          stack.style.gridRow = gridRow;

          const anchor = document.createElement('div');
          anchor.className = 'jb-final-stack__anchor';
          anchor.appendChild(matchEl);

          const third = document.createElement('div');
          third.className = 'jb-third-place';
          const thirdDelay = BracketRenderer.enterDelayMs(rel, 0);
          const title = document.createElement('div');
          title.className = 'jb-third-place__title';
          title.textContent = labels.thirdPlace || '3rd Place';
          BracketRenderer.applyEnter(title, thirdDelay);
          third.appendChild(title);
          third.appendChild(
            BracketRenderer.createMatchEl(state.thirdPlace, {
              showScores: scoresVisible,
              showImages,
              labels,
              enterDelayMs: thirdDelay,
            }),
          );
          anchor.appendChild(third);
          stack.appendChild(anchor);
          container.appendChild(stack);
          return;
        }

        matchEl.style.gridColumn = gridColumn;
        matchEl.style.gridRow = gridRow;
        container.appendChild(matchEl);
      });

      if (rel < visibleSource.length - 1) {
        const pairSpan = span * 2;
        for (let m = 0; m < round.length; m += 2) {
          const line = document.createElement('div');
          line.className = 'jb-connector';
          line.setAttribute('aria-hidden', 'true');
          line.style.gridColumn = String(
            BracketRenderer.connectorColumn(rel, leadInOffset),
          );
          line.style.gridRow = `${m * span + 1} / ${m * span + pairSpan + 1}`;
          BracketRenderer.applyEnter(
            line,
            BracketRenderer.enterDelayMs(rel, m),
          );
          container.appendChild(line);
        }
      }
    });

    const scroll = document.createElement('div');
    scroll.className = 'jb-scroll';
    scroll.appendChild(container);

    layout.appendChild(scroll);
    root.appendChild(layout);
    return root;
  }
}
