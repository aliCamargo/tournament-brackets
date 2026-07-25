import type { MatchStatus } from '../enums/match-status.enum';
import type { Player, PlayerInput } from '../interfaces/player.interface';
import type { NormalizedScore, ScoreInput } from '../types/score.types';

export interface MatchInput {
  player1?: PlayerInput | null;
  player2?: PlayerInput | null;
  winnerId?: string | number | null;
  score?: ScoreInput | null;
  scoreType?: string | null;
  status?: string | null;
}

export interface Match {
  roundIndex: number | 'thirdPlace';
  matchIndex: number;
  slots: [Player | null, Player | null];
  winnerId: string | null;
  score: NormalizedScore | null;
  status: MatchStatus;
  kind?: 'thirdPlace';
}
