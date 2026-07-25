export { Brackets, create, formatRadius } from './facade/create.facade';
export {
  normalizeRounds,
  normalizePlayer,
  setWinner,
  getSerializableState,
  getSemifinalRoundIndex,
  getFinalRoundIndex,
} from './facade/model.facade';
export {
  normalizeScore,
  resolveMatchScore,
  formatScoreForSlot,
  appendScoreForSlot,
} from './facade/score.facade';
export {
  resolveMatchStatus,
  formatStatusLabel,
  MATCH_STATUSES,
} from './facade/status.facade';
export { sanitizeUrl } from './facade/url.facade';

export type {
  MatchStatus,
  BracketsTheme,
  ShowScores,
  PlayerInput,
  Player,
  ScorePair,
  ScorePeriodInput,
  ScoreInput,
  ScorePeriod,
  SingleScore,
  SetsScore,
  NormalizedScore,
  MatchInput,
  Match,
  RoundsInput,
  Rounds,
  BracketsLabels,
  BracketsOptions,
  BracketsState,
  BracketsApi,
} from './types';
