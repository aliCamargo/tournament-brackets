import { DEFAULT_OPTIONS } from '../domain/constants/defaults.constants';
import {
  BracketsTheme,
  ShowScoresMode,
  type BracketsApi,
  type BracketsLabels,
  type BracketsOptions,
  type BracketsState,
  type Match,
  type MatchInput,
  type Rounds,
  type RoundsInput,
  type ShowScores,
} from '../domain/index';
import { BracketService } from '../services/bracket.service';
import { BracketRenderer } from '../ui/bracket.renderer';
import { CssUtils } from '../utils/css.utils';
import { EventEmitter } from '../utils/event-emitter.utils';
import '../ui/layout.css';
import '../ui/theme.css';

type InternalState = {
  rounds: Rounds;
  thirdPlace: Match | null;
  titles: boolean | string[];
  theme: BracketsTheme;
  labels: BracketsLabels;
  showScores: ShowScores;
  roundNav: boolean;
  viewFromRound: number;
  thirdPlaceEnabled: boolean;
};

export class BracketsController {
  private static readonly instances = new WeakMap<HTMLElement, BracketsApi>();

  private readonly bus = new EventEmitter();
  private readonly bracketService = new BracketService();
  private readonly opts: BracketsOptions;
  private readonly thirdPlaceOpt: boolean | MatchInput;
  private readonly radiusCss: string | null;
  private readonly matchWidthCss: string | null;
  private state: InternalState;
  readonly api: BracketsApi;

  static mount(
    element: HTMLElement,
    options: BracketsOptions = {},
  ): BracketsApi | null {
    if (!element) {
      console.error('Brackets: mount element not found');
      return null;
    }

    BracketsController.instances.get(element)?.destroy();
    return new BracketsController(element, options).api;
  }

  private constructor(
    private readonly element: HTMLElement,
    options: BracketsOptions,
  ) {
    this.opts = { ...DEFAULT_OPTIONS, ...options };
    this.thirdPlaceOpt = this.resolveThirdPlace();
    this.radiusCss = this.resolveRadius();
    this.matchWidthCss = this.resolveMatchWidth();
    const roundNav = element.hasAttribute('data-round-nav')
      ? element.getAttribute('data-round-nav') !== 'false'
      : !!this.opts.roundNav;

    this.state = {
      rounds: [],
      thirdPlace: null,
      titles: this.opts.titles ?? false,
      theme: this.opts.theme ?? BracketsTheme.Default,
      labels: { ...DEFAULT_OPTIONS.labels, ...this.opts.labels },
      showScores: this.opts.showScores ?? ShowScoresMode.Auto,
      roundNav,
      viewFromRound: Math.max(0, Number(this.opts.viewFromRound) || 0),
      thirdPlaceEnabled: !!this.thirdPlaceOpt,
    };

    if (typeof this.opts.onChange === 'function') {
      this.bus.on('change', (payload) =>
        this.opts.onChange!(payload as BracketsState),
      );
    }
    if (typeof this.opts.onRoundChange === 'function') {
      this.bus.on('roundChange', (payload) =>
        this.opts.onRoundChange!(payload as number),
      );
    }

    this.element.addEventListener('click', this.onClick);
    this.element.addEventListener('mouseover', this.onOver);
    this.element.addEventListener('mouseout', this.onOut);

    this.api = {
      setRounds: this.setRounds,
      getState: this.getState,
      destroy: this.destroy,
      setViewFromRound: this.setViewFromRound,
    };
    BracketsController.instances.set(this.element, this.api);

    if (!this.opts.rounds) {
      console.error('Brackets: rounds not found');
      this.paint();
    } else {
      this.setRounds(this.opts.rounds);
    }
  }

  private resolveThirdPlace(): boolean | MatchInput {
    if (this.element.hasAttribute('data-third-place')) {
      return this.element.getAttribute('data-third-place') !== 'false';
    }
    return this.opts.thirdPlace ?? false;
  }

  private resolveRadius(): string | null {
    if (this.element.hasAttribute('data-radius')) {
      return CssUtils.formatRadius(this.element.getAttribute('data-radius'));
    }
    if (this.opts.radius != null) return CssUtils.formatRadius(this.opts.radius);
    return CssUtils.formatRadius(DEFAULT_OPTIONS.radius);
  }

  private resolveMatchWidth(): string | null {
    if (this.element.hasAttribute('data-match-width')) {
      return CssUtils.formatRadius(
        this.element.getAttribute('data-match-width'),
      );
    }
    if (this.opts.matchWidth != null) {
      return CssUtils.formatRadius(this.opts.matchWidth);
    }
    return null;
  }

  private readonly onClick = (event: MouseEvent): void => {
    const target = event.target as Element | null;
    const navBtn = target?.closest('.jb-round-nav__btn') as HTMLElement | null;
    if (!navBtn) return;
    event.preventDefault();
    event.stopPropagation();
    const next = Number(navBtn.dataset.roundIndex);
    if (!Number.isFinite(next) || next === this.state.viewFromRound) return;
    this.setViewFromRound(next);
  };

  private readonly onOver = (event: MouseEvent): void => {
    const target = event.target as Element | null;
    const playerEl = target?.closest('.jb-player') as HTMLElement | null;
    if (!playerEl?.dataset.playerId) return;
    const id = playerEl.dataset.playerId;
    this.element
      .querySelectorAll(`.jb-player[data-player-id="${CssUtils.escape(id)}"]`)
      .forEach((node) => node.classList.add('jb-player--hover'));
  };

  private readonly onOut = (): void => {
    this.element
      .querySelectorAll('.jb-player--hover')
      .forEach((node) => node.classList.remove('jb-player--hover'));
  };

  private paint(): void {
    const tree = BracketRenderer.render(this.state, {
      theme: this.state.theme,
      titles: this.state.titles,
      labels: this.state.labels,
      showScores: this.state.showScores,
      roundNav: this.state.roundNav,
      viewFromRound: this.state.viewFromRound,
    });

    const existing = this.element.firstElementChild;
    if (
      existing instanceof HTMLElement &&
      existing.classList.contains('jb-root')
    ) {
      existing.className = tree.className;
      existing.replaceChildren(...tree.childNodes);
      if (this.radiusCss != null) {
        existing.style.setProperty('--jb-radius', this.radiusCss);
      } else {
        existing.style.removeProperty('--jb-radius');
      }
      if (this.matchWidthCss != null) {
        existing.style.setProperty('--jb-match-width', this.matchWidthCss);
      } else {
        existing.style.removeProperty('--jb-match-width');
      }
      this.element.replaceChildren(existing);
      return;
    }

    if (this.radiusCss != null) {
      tree.style.setProperty('--jb-radius', this.radiusCss);
    }
    if (this.matchWidthCss != null) {
      tree.style.setProperty('--jb-match-width', this.matchWidthCss);
    }
    this.element.replaceChildren(tree);
  }

  private readonly setViewFromRound = (index: number): void => {
    const max = Math.max(0, (this.state.rounds?.length || 1) - 1);
    const next = Math.max(0, Math.min(Number(index) || 0, max));
    this.state = { ...this.state, viewFromRound: next };
    this.paint();
    this.bus.emit('roundChange', next);
  };

  private readonly setRounds = (
    rawRounds: RoundsInput | null | undefined,
    thirdPlaceOverride?: boolean | MatchInput,
  ): void => {
    if (!rawRounds) {
      console.error('Brackets: rounds not found');
      this.state = { ...this.state, rounds: [], thirdPlace: null };
      this.paint();
      return;
    }

    const thirdPlace =
      thirdPlaceOverride !== undefined
        ? thirdPlaceOverride
        : this.thirdPlaceOpt;
    const normalized = this.bracketService.normalizeRounds(rawRounds, {
      thirdPlace,
    });
    const max = Math.max(0, normalized.rounds.length - 1);
    this.state = {
      ...this.state,
      rounds: normalized.rounds,
      thirdPlace: normalized.thirdPlace,
      thirdPlaceEnabled: !!thirdPlace,
      viewFromRound: Math.min(this.state.viewFromRound, max),
    };
    this.paint();
    this.bus.emit('change', this.getState());
  };

  private readonly getState = (): BracketsState => ({
    ...this.bracketService.getSerializableState(this.state),
    viewFromRound: this.state.viewFromRound,
  });

  private readonly destroy = (): void => {
    this.element.removeEventListener('click', this.onClick);
    this.element.removeEventListener('mouseover', this.onOver);
    this.element.removeEventListener('mouseout', this.onOut);
    this.element.replaceChildren();
    BracketsController.instances.delete(this.element);
  };
}
