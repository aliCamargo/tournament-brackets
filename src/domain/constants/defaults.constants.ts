import { BracketsTheme } from '../enums/brackets-theme.enum';
import { ShowScoresMode } from '../enums/show-scores-mode.enum';
import type { BracketsOptions } from '../interfaces/brackets.interface';

export const DEFAULT_LABELS = Object.freeze({
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
} as const);

export const DEFAULT_OPTIONS: BracketsOptions = Object.freeze({
  rounds: null,
  titles: false,
  thirdPlace: false,
  theme: BracketsTheme.Default,
  radius: 8,
  matchWidth: null,
  showScores: ShowScoresMode.Auto,
  roundNav: false,
  viewFromRound: 0,
  labels: Object.freeze({ ...DEFAULT_LABELS }),
  onChange: null,
  onRoundChange: null,
});
