import type {
  BracketsState,
  Match,
  MatchInput,
  NormalizedScore,
  Player,
  PlayerInput,
  Rounds,
  RoundsInput,
  WinnerState,
} from '../types';
import { ScoreHelper } from './score.helper';
import { StatusHelper } from './status.helper';
import { MatchStatus } from '../domain/enums/match-status.enum';
import { UrlUtils } from '../utils/url.utils';

export class BracketModelHelper {
  private static idSeq = 0;

  private static nextId(): string {
    BracketModelHelper.idSeq += 1;
    return `gen-${BracketModelHelper.idSeq}`;
  }

  private static nextPowerOfTwo(n: number): number {
    let p = 1;
    while (p < n) p *= 2;
    return p;
  }

  static normalizePlayer(
    raw: PlayerInput | null | undefined,
  ): Player | null {
    if (!raw || typeof raw !== 'object') return null;
    const id =
      raw.id != null ? String(raw.id) : BracketModelHelper.nextId();
    return {
      id,
      name: raw.name != null ? String(raw.name) : '',
      url: UrlUtils.sanitize(raw.url),
      image: UrlUtils.sanitize(raw.image),
    };
  }

  private static clonePlayer(player: Player | null | undefined): Player | null {
    if (!player) return null;
    return {
      id: player.id,
      name: player.name,
      url: player.url,
      image: player.image ?? null,
    };
  }

  private static createMatch(
    roundIndex: number | 'thirdPlace',
    matchIndex: number,
    player1: Player | null,
    player2: Player | null,
    winnerId: string | null = null,
    score: NormalizedScore | null = null,
    status: unknown = null,
  ): Match {
    return {
      roundIndex,
      matchIndex,
      slots: [player1, player2],
      winnerId,
      score,
      status: StatusHelper.resolve({ status, winnerId, score }),
    };
  }

  private static resolveWinnerId(
    rawMatch: MatchInput | null | undefined,
    p1: Player | null,
    p2: Player | null,
  ): string | null {
    if (rawMatch?.winnerId != null) return String(rawMatch.winnerId);
    if (rawMatch?.player1?.winner && p1) return p1.id;
    if (rawMatch?.player2?.winner && p2) return p2.id;
    if (p1 && !p2) return p1.id;
    if (p2 && !p1) return p2.id;
    return null;
  }

  /** Round with exactly 2 matches (semifinals). Null if bracket is too small. */
  static getSemifinalRoundIndex(rounds: Rounds): number | null {
    for (let r = rounds.length - 1; r >= 0; r--) {
      if (rounds[r].length === 2) return r;
    }
    return null;
  }

  /** Final is the 1-match round just before the champion display round (or last 1-match). */
  static getFinalRoundIndex(rounds: Rounds): number | null {
    if (!rounds.length) return null;
    for (let r = rounds.length - 1; r >= 0; r--) {
      if (rounds[r].length !== 1) continue;
      const match = rounds[r][0];
      const looksLikeChampion =
        r === rounds.length - 1 &&
        match.slots[0] &&
        !match.slots[1] &&
        rounds.length > 1;
      if (looksLikeChampion) continue;
      return r;
    }
    if (rounds.length >= 2 && rounds[rounds.length - 2].length === 1) {
      return rounds.length - 2;
    }
    return rounds.length - 1;
  }

  private static loserOf(match: Match | null | undefined): Player | null {
    if (!match?.winnerId) return null;
    return match.slots.find((slot) => slot && slot.id !== match.winnerId) || null;
  }

  private static buildThirdPlaceFromSemis(
    rounds: Rounds,
    seed: MatchInput | null | undefined,
  ): Match | null {
    const semiIdx = BracketModelHelper.getSemifinalRoundIndex(rounds);
    if (semiIdx == null) return null;

    const semis = rounds[semiIdx];
    let p1 = BracketModelHelper.normalizePlayer(seed?.player1);
    let p2 = BracketModelHelper.normalizePlayer(seed?.player2);

    const loser0 = BracketModelHelper.loserOf(semis[0]);
    const loser1 = BracketModelHelper.loserOf(semis[1]);
    if (!p1 && loser0) p1 = BracketModelHelper.clonePlayer(loser0);
    if (!p2 && loser1) p2 = BracketModelHelper.clonePlayer(loser1);

    const winnerId = BracketModelHelper.resolveWinnerId(seed ?? {}, p1, p2);
    const score = seed ? ScoreHelper.resolveMatchScore(seed, p1, p2) : null;
    const status = seed ? seed.status : null;

    return {
      roundIndex: 'thirdPlace',
      matchIndex: 0,
      kind: 'thirdPlace',
      slots: [p1, p2],
      winnerId,
      score,
      status: StatusHelper.resolve({ status, winnerId, score }),
    };
  }

  static normalizeRounds(
    rawRounds: RoundsInput | null | undefined,
    options: { thirdPlace?: boolean | MatchInput } = {},
  ): { rounds: Rounds; thirdPlace: Match | null } {
    if (!Array.isArray(rawRounds) || rawRounds.length === 0) {
      return { rounds: [], thirdPlace: null };
    }

    const first: MatchInput[] = Array.isArray(rawRounds[0])
      ? [...rawRounds[0]]
      : [];
    const targetMatches = BracketModelHelper.nextPowerOfTwo(
      Math.max(first.length, 1),
    );
    while (first.length < targetMatches) {
      first.push({ player1: null, player2: null });
    }

    const rounds: Rounds = [];
    rounds.push(
      first.map((rawMatch, matchIndex) => {
        const p1 = BracketModelHelper.normalizePlayer(rawMatch?.player1);
        const p2 = BracketModelHelper.normalizePlayer(rawMatch?.player2);
        const winnerId = BracketModelHelper.resolveWinnerId(rawMatch, p1, p2);
        const score = ScoreHelper.resolveMatchScore(rawMatch, p1, p2);
        return BracketModelHelper.createMatch(
          0,
          matchIndex,
          p1,
          p2,
          winnerId,
          score,
          rawMatch?.status,
        );
      }),
    );

    const expectedRounds = Math.log2(targetMatches) + 1;
    for (let r = 1; r < expectedRounds; r++) {
      const expectedCount = targetMatches / 2 ** r;
      const rawRound = Array.isArray(rawRounds[r]) ? rawRounds[r] : [];
      const matches: Match[] = [];
      for (let m = 0; m < expectedCount; m++) {
        const rawMatch: MatchInput = rawRound[m] || {};
        let p1 = BracketModelHelper.normalizePlayer(rawMatch.player1);
        let p2 = BracketModelHelper.normalizePlayer(rawMatch.player2);

        const prev = rounds[r - 1];
        const left = prev[m * 2];
        const right = prev[m * 2 + 1];
        if (!p1 && left?.winnerId) {
          p1 = BracketModelHelper.clonePlayer(
            left.slots.find((slot) => slot && slot.id === left.winnerId),
          );
        }
        if (!p2 && right?.winnerId) {
          p2 = BracketModelHelper.clonePlayer(
            right.slots.find((slot) => slot && slot.id === right.winnerId),
          );
        }

        const winnerId = BracketModelHelper.resolveWinnerId(rawMatch, p1, p2);
        const score = ScoreHelper.resolveMatchScore(rawMatch, p1, p2);
        matches.push(
          BracketModelHelper.createMatch(
            r,
            m,
            p1,
            p2,
            winnerId,
            score,
            rawMatch.status,
          ),
        );
      }
      rounds.push(matches);
    }

    BracketModelHelper.applyByeAdvances(rounds);

    const tpOpt = options.thirdPlace;
    let thirdPlace: Match | null = null;
    if (tpOpt) {
      const seed = tpOpt === true ? null : tpOpt;
      thirdPlace = BracketModelHelper.buildThirdPlaceFromSemis(rounds, seed);
    }

    return { rounds, thirdPlace };
  }

  private static applyByeAdvances(rounds: Rounds): void {
    if (!rounds[0]) return;
    for (const match of rounds[0]) {
      const [a, b] = match.slots;
      if (a && !b && !match.winnerId) match.winnerId = a.id;
      if (b && !a && !match.winnerId) match.winnerId = b.id;
    }
    for (let r = 0; r < rounds.length - 1; r++) {
      for (const match of rounds[r]) {
        if (!match.winnerId) continue;
        const next = rounds[r + 1][Math.floor(match.matchIndex / 2)];
        const slot = match.matchIndex % 2;
        const winner = match.slots.find(
          (player) => player && player.id === match.winnerId,
        );
        if (winner && !next.slots[slot]) {
          next.slots[slot] = BracketModelHelper.clonePlayer(winner);
        }
      }
    }
  }

  private static deepCloneRounds(rounds: Rounds): Rounds {
    return rounds.map((round) =>
      round.map((match) => ({
        roundIndex: match.roundIndex,
        matchIndex: match.matchIndex,
        winnerId: match.winnerId,
        score: ScoreHelper.clone(match.score),
        status: match.status,
        slots: match.slots.map(BracketModelHelper.clonePlayer) as [
          Player | null,
          Player | null,
        ],
      })),
    );
  }

  private static cloneThirdPlace(tp: Match | null | undefined): Match | null {
    if (!tp) return null;
    return {
      roundIndex: 'thirdPlace',
      matchIndex: 0,
      kind: 'thirdPlace',
      winnerId: tp.winnerId,
      score: ScoreHelper.clone(tp.score),
      status: tp.status,
      slots: tp.slots.map(BracketModelHelper.clonePlayer) as [
        Player | null,
        Player | null,
      ],
    };
  }

  private static syncThirdPlaceFromSemis(
    rounds: Rounds,
    thirdPlace: Match,
  ): Match | null {
    const next = BracketModelHelper.cloneThirdPlace(thirdPlace);
    if (!next) return null;
    const semiIdx = BracketModelHelper.getSemifinalRoundIndex(rounds);
    if (semiIdx == null) return next;

    const semis = rounds[semiIdx];
    const prevSlots = next.slots.map((slot) => slot?.id ?? null);
    next.slots[0] = BracketModelHelper.clonePlayer(
      BracketModelHelper.loserOf(semis[0]),
    );
    next.slots[1] = BracketModelHelper.clonePlayer(
      BracketModelHelper.loserOf(semis[1]),
    );

    const newIds = next.slots.map((slot) => slot?.id ?? null);
    if (prevSlots[0] !== newIds[0] || prevSlots[1] !== newIds[1]) {
      next.winnerId = null;
    } else if (
      next.winnerId &&
      !next.slots.some((slot) => slot && slot.id === next.winnerId)
    ) {
      next.winnerId = null;
    }

    return next;
  }

  static setWinner(
    state: WinnerState,
    roundIndex: number | 'thirdPlace',
    matchIndex: number,
    playerId: string,
  ): WinnerState {
    if (roundIndex === 'thirdPlace' || roundIndex === -1) {
      const thirdPlace = BracketModelHelper.cloneThirdPlace(state.thirdPlace);
      if (!thirdPlace) return state;
      const inSlots = thirdPlace.slots.some((slot) => slot && slot.id === playerId);
      if (!inSlots) return state;
      thirdPlace.winnerId = playerId;
      thirdPlace.status = StatusHelper.resolve({
        status:
          thirdPlace.status === 'retired' || thirdPlace.status === 'walkover'
            ? thirdPlace.status
            : 'final',
        winnerId: playerId,
        score: thirdPlace.score,
      });
      return { ...state, thirdPlace };
    }

    const rounds = BracketModelHelper.deepCloneRounds(state.rounds);
    const match = rounds[roundIndex]?.[matchIndex];
    if (!match) return { ...state, rounds };

    const inSlots = match.slots.some((slot) => slot && slot.id === playerId);
    if (!inSlots) return { ...state, rounds };

    const prevWinner = match.winnerId;
    match.winnerId = playerId;
    if (
      match.status !== MatchStatus.Retired &&
      match.status !== MatchStatus.Walkover
    ) {
      match.status = MatchStatus.Final;
    }

    if (prevWinner !== playerId) {
      BracketModelHelper.clearDownstream(rounds, roundIndex, matchIndex);
    }

    BracketModelHelper.advanceWinner(rounds, roundIndex, matchIndex);

    let thirdPlace = state.thirdPlace
      ? BracketModelHelper.cloneThirdPlace(state.thirdPlace)
      : null;
    const semiIdx = BracketModelHelper.getSemifinalRoundIndex(rounds);
    if (thirdPlace && semiIdx != null && roundIndex === semiIdx) {
      thirdPlace = BracketModelHelper.syncThirdPlaceFromSemis(rounds, thirdPlace);
    } else if (thirdPlace && semiIdx != null && roundIndex < semiIdx) {
      thirdPlace = BracketModelHelper.syncThirdPlaceFromSemis(rounds, thirdPlace);
    }

    return { ...state, rounds, thirdPlace };
  }

  private static clearDownstream(
    rounds: Rounds,
    roundIndex: number,
    matchIndex: number,
  ): void {
    let r = roundIndex;
    let m = matchIndex;
    while (r < rounds.length - 1) {
      const nextIndex = Math.floor(m / 2);
      const slot = m % 2;
      const next = rounds[r + 1][nextIndex];
      if (!next) break;
      next.slots[slot] = null;
      next.winnerId = null;
      next.score = null;
      next.status = StatusHelper.resolve({
        winnerId: null,
        score: null,
        status: null,
      });
      r += 1;
      m = nextIndex;
    }
  }

  private static advanceWinner(
    rounds: Rounds,
    roundIndex: number,
    matchIndex: number,
  ): void {
    if (roundIndex >= rounds.length - 1) return;
    const match = rounds[roundIndex][matchIndex];
    const winner = match.slots.find((slot) => slot && slot.id === match.winnerId);
    if (!winner) return;
    const next = rounds[roundIndex + 1][Math.floor(matchIndex / 2)];
    const slot = matchIndex % 2;
    next.slots[slot] = BracketModelHelper.clonePlayer(winner);
  }

  static getSerializableState(state: {
    titles: boolean | string[];
    rounds: Rounds;
    thirdPlace?: Match | null;
  }): BracketsState {
    const serializeMatch = (match: Match) => ({
      roundIndex: match.roundIndex,
      matchIndex: match.matchIndex,
      winnerId: match.winnerId,
      score: ScoreHelper.clone(match.score),
      status: match.status,
      slots: match.slots.map((slot) =>
        slot
          ? {
              id: slot.id,
              name: slot.name,
              url: slot.url,
              image: slot.image ?? null,
            }
          : null,
      ),
    });

    const out: BracketsState = {
      titles: state.titles,
      rounds: state.rounds.map((round) => round.map(serializeMatch)),
    };
    if (state.thirdPlace) {
      out.thirdPlace = {
        ...serializeMatch(state.thirdPlace),
        kind: 'thirdPlace',
      };
    }
    return out;
  }
}
