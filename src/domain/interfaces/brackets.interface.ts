import type { BracketsTheme } from '../enums/brackets-theme.enum';
import type { MatchStatus } from '../enums/match-status.enum';
import type { MatchInput } from './match.interface';
import type { NormalizedScore } from '../types/score.types';
import type { RoundsInput } from '../types/rounds.types';
import type { ShowScores } from '../types/show-scores.types';

export interface BracketsLabels {
  round?: string;
  semifinal?: string;
  final?: string;
  champion?: string;
  thirdPlace?: string;
  lateStages?: string;
  statusScheduled?: string;
  statusInProgress?: string;
  statusFinal?: string;
  statusRetired?: string;
  statusWalkover?: string;
}

export interface BracketsOptions {
  rounds?: RoundsInput | null;
  titles?: boolean | string[];
  thirdPlace?: boolean | MatchInput;
  theme?: BracketsTheme;
  radius?: number | string;
  matchWidth?: number | string | null;
  showScores?: ShowScores;
  roundNav?: boolean;
  viewFromRound?: number;
  labels?: BracketsLabels;
  onChange?: ((state: BracketsState) => void) | null;
  onRoundChange?: ((index: number) => void) | null;
}

export interface BracketsState {
  titles: boolean | string[];
  rounds: Array<
    Array<{
      roundIndex: number | 'thirdPlace';
      matchIndex: number;
      winnerId: string | null;
      score: NormalizedScore | null;
      status: MatchStatus;
      slots: Array<{
        id: string;
        name: string;
        url: string | null;
        image: string | null;
      } | null>;
      kind?: 'thirdPlace';
    }>
  >;
  thirdPlace?: {
    roundIndex: number | 'thirdPlace';
    matchIndex: number;
    winnerId: string | null;
    score: NormalizedScore | null;
    status: MatchStatus;
    slots: Array<{
      id: string;
      name: string;
      url: string | null;
      image: string | null;
    } | null>;
    kind: 'thirdPlace';
  } | null;
  viewFromRound?: number;
}

export interface BracketsApi {
  setRounds: (
    rawRounds: RoundsInput | null | undefined,
    thirdPlaceOverride?: boolean | MatchInput,
  ) => void;
  getState: () => BracketsState;
  destroy: () => void;
  setViewFromRound: (index: number) => void;
}
