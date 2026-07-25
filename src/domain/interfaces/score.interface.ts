export interface ScorePeriod {
  main: [number, number];
  extra: [number, number] | null;
}

export interface SingleScore {
  mode: 'single';
  type: string;
  values: number[];
}

export interface SetsScore {
  mode: 'sets';
  type: string;
  values: ScorePeriod[];
}
