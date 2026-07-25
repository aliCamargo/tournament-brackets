import { ScoreHelper } from '../helpers/score.helper';

export const normalizeScore = ScoreHelper.normalize.bind(ScoreHelper);
export const resolveMatchScore =
  ScoreHelper.resolveMatchScore.bind(ScoreHelper);
export const formatScoreForSlot =
  ScoreHelper.formatScoreForSlot.bind(ScoreHelper);
export const singleScoreForSlot =
  ScoreHelper.singleScoreForSlot.bind(ScoreHelper);
export const appendScoreForSlot =
  ScoreHelper.appendForSlot.bind(ScoreHelper);
