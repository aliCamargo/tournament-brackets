/** Loose player as accepted from consumers. */
export interface PlayerInput {
  id?: string | number;
  name?: string;
  url?: string | null;
  image?: string | null;
  winner?: boolean;
  score?: number | string | null;
}

/** Normalized player. */
export interface Player {
  id: string;
  name: string;
  url: string | null;
  image: string | null;
}
