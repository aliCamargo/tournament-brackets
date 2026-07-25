import { BracketModelHelper } from '../helpers/bracket-model.helper';
import type {
  BracketsState,
  Match,
  MatchInput,
  Player,
  PlayerInput,
  Rounds,
  RoundsInput,
  WinnerState,
} from '../types';

export class BracketService {
  normalizePlayer(raw: PlayerInput | null | undefined): Player | null {
    return BracketModelHelper.normalizePlayer(raw);
  }

  normalizeRounds(
    rawRounds: RoundsInput | null | undefined,
    options: { thirdPlace?: boolean | MatchInput } = {},
  ): { rounds: Rounds; thirdPlace: Match | null } {
    return BracketModelHelper.normalizeRounds(rawRounds, options);
  }

  setWinner(
    state: WinnerState,
    roundIndex: number | 'thirdPlace',
    matchIndex: number,
    playerId: string,
  ): WinnerState {
    return BracketModelHelper.setWinner(state, roundIndex, matchIndex, playerId);
  }

  getSerializableState(state: {
    titles: boolean | string[];
    rounds: Rounds;
    thirdPlace?: Match | null;
  }): BracketsState {
    return BracketModelHelper.getSerializableState(state);
  }

  getSemifinalRoundIndex(rounds: Rounds): number | null {
    return BracketModelHelper.getSemifinalRoundIndex(rounds);
  }

  getFinalRoundIndex(rounds: Rounds): number | null {
    return BracketModelHelper.getFinalRoundIndex(rounds);
  }
}
