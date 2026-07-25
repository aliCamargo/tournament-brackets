import type { Match } from '../interfaces/match.interface';
import type { Rounds } from './rounds.types';

export type WinnerState = {
  rounds: Rounds;
  thirdPlace?: Match | null;
  [key: string]: unknown;
};
