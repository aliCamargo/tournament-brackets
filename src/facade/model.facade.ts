import { BracketModelHelper } from '../helpers/bracket-model.helper';

export const normalizePlayer =
  BracketModelHelper.normalizePlayer.bind(BracketModelHelper);
export const normalizeRounds =
  BracketModelHelper.normalizeRounds.bind(BracketModelHelper);
export const setWinner = BracketModelHelper.setWinner.bind(BracketModelHelper);
export const getSerializableState =
  BracketModelHelper.getSerializableState.bind(BracketModelHelper);
export const getSemifinalRoundIndex =
  BracketModelHelper.getSemifinalRoundIndex.bind(BracketModelHelper);
export const getFinalRoundIndex =
  BracketModelHelper.getFinalRoundIndex.bind(BracketModelHelper);
