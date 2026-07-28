import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  type AfterViewInit,
  type OnChanges,
  type OnDestroy,
  type SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Brackets as CoreBrackets } from '../facade/create.facade';
import type {
  BracketsApi,
  BracketsLabels,
  BracketsState,
  BracketsTheme,
  MatchInput,
  RoundsInput,
  ShowScores,
} from '../types';

const EMPTY_STATE: BracketsState = {
  titles: false,
  rounds: [],
  thirdPlace: null,
};

function remountKeyFrom(inputs: {
  titles?: boolean | string[];
  thirdPlace?: boolean | MatchInput;
  theme?: BracketsTheme;
  radius?: number | string;
  matchWidth?: number | string | null;
  showScores?: ShowScores;
  roundNav?: boolean;
  labels?: BracketsLabels | null;
}): string {
  return JSON.stringify({
    titles: inputs.titles ?? false,
    thirdPlace: inputs.thirdPlace ?? false,
    theme: inputs.theme ?? 'default',
    radius: inputs.radius ?? 8,
    matchWidth: inputs.matchWidth ?? null,
    showScores: inputs.showScores ?? 'auto',
    roundNav: inputs.roundNav ?? false,
    labels: inputs.labels ?? null,
  });
}

@Component({
  selector: 'tb-brackets',
  standalone: true,
  imports: [CommonModule],
  template: `<div #host [class]="class" [ngStyle]="style"></div>`,
})
export class BracketsComponent
  implements BracketsApi, AfterViewInit, OnChanges, OnDestroy
{
  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLDivElement>;

  @Input() rounds: RoundsInput | null | undefined;
  @Input() titles?: boolean | string[];
  @Input() thirdPlace?: boolean | MatchInput;
  @Input() theme?: BracketsTheme;
  @Input() radius?: number | string;
  @Input() matchWidth?: number | string | null;
  @Input() showScores?: ShowScores;
  @Input() roundNav?: boolean;
  @Input() viewFromRound?: number;
  @Input() labels?: BracketsLabels | null;
  @Input() class = '';
  @Input() style: Record<string, string> | null = null;

  @Output() change = new EventEmitter<BracketsState>();
  @Output() roundChange = new EventEmitter<number>();

  private api: BracketsApi | null = null;
  private viewReady = false;
  private lastRemountKey = '';

  ngAfterViewInit(): void {
    this.lastRemountKey = remountKeyFrom(this);
    this.mountInstance();
    this.viewReady = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.viewReady) return;

    const key = remountKeyFrom(this);
    if (key !== this.lastRemountKey) {
      this.lastRemountKey = key;
      this.mountInstance();
      return;
    }

    if (changes['rounds']) {
      this.api?.setRounds(this.rounds ?? null);
    }

    if (changes['viewFromRound'] && this.viewFromRound != null) {
      this.api?.setViewFromRound(this.viewFromRound);
    }
  }

  ngOnDestroy(): void {
    this.teardown();
  }

  getState(): BracketsState {
    return this.api?.getState() ?? EMPTY_STATE;
  }

  setRounds(
    rawRounds: RoundsInput | null | undefined,
    thirdPlaceOverride?: boolean | MatchInput,
  ): void {
    this.api?.setRounds(rawRounds, thirdPlaceOverride);
  }

  setViewFromRound(index: number): void {
    this.api?.setViewFromRound(index);
  }

  destroy(): void {
    this.teardown();
  }

  private mountInstance(): void {
    const el = this.hostRef?.nativeElement;
    if (!el) return;

    this.teardown();

    this.api = CoreBrackets.create(el, {
      rounds: this.rounds,
      titles: this.titles,
      thirdPlace: this.thirdPlace,
      theme: this.theme,
      radius: this.radius,
      matchWidth: this.matchWidth,
      showScores: this.showScores,
      roundNav: this.roundNav,
      viewFromRound: this.viewFromRound,
      labels: this.labels ?? undefined,
      onChange: (state) => {
        queueMicrotask(() => this.change.emit(state));
      },
      onRoundChange: (index) => {
        queueMicrotask(() => this.roundChange.emit(index));
      },
    });
  }

  private teardown(): void {
    this.api?.destroy();
    this.api = null;
  }
}
