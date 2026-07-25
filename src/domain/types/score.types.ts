import type {
  SetsScore,
  SingleScore,
} from '../interfaces/score.interface';

/** Raw score arrays as documented in README. */
export type ScorePair = [number | string, number | string];
export type ScorePeriodInput = ScorePair | [ScorePair, ScorePair];
export type ScoreInput = ScorePair | ScorePeriodInput[];

export type NormalizedScore = SingleScore | SetsScore;
