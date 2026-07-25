import type {
  BracketsLabels,
  BracketsTheme,
  Match,
  Rounds,
  ShowScores,
} from '../../types';

export interface RenderState {
  rounds: Rounds;
  thirdPlace?: Match | null;
  titles?: boolean | string[];
}

export interface RenderOptions {
  theme?: BracketsTheme;
  titles?: boolean | string[];
  labels?: BracketsLabels;
  showScores?: ShowScores;
  roundNav?: boolean;
  viewFromRound?: number;
}

export interface RoundNavItem {
  label: string;
  viewFromRound: number;
  collapsesToEnd?: boolean;
}
