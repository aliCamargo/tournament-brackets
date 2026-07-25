import type { MatchInput } from '../domain/interfaces/match.interface';
import type { Player } from '../domain/interfaces/player.interface';
import type { ScorePeriod } from '../domain/interfaces/score.interface';
import type { NormalizedScore } from '../domain/types/score.types';

/**
 * Normalize match scores.
 *
 * Single (football): [2, 1]
 * Sets (tennis): [[6, 4], [3, 6], [7, 5]]
 * Nested periods: [[[6, 7], [7, 9]], [6, 3]]
 */
export class ScoreHelper {
  static normalize(
    raw: unknown,
    scoreType?: string | null,
  ): NormalizedScore | null {
    if (raw == null) return null;

    if (!Array.isArray(raw) || raw.length === 0) return null;

    if (Array.isArray(raw[0])) {
      const values = raw
        .map(ScoreHelper.normalizePeriod)
        .filter((v): v is ScorePeriod => v != null);
      if (!values.length) return null;
      return {
        mode: 'sets',
        values,
        type: scoreType || 'sets',
      };
    }

    if (raw.length < 2) return null;
    return {
      mode: 'single',
      values: [
        ScoreHelper.toScoreNumber(raw[0]),
        ScoreHelper.toScoreNumber(raw[1]),
      ],
      type: scoreType || 'goals',
    };
  }

  private static normalizePeriod(period: unknown): ScorePeriod | null {
    if (!Array.isArray(period) || period.length < 2) return null;
    if (Array.isArray(period[0])) {
      const main = period[0];
      const extra = Array.isArray(period[1]) ? period[1] : null;
      if (!Array.isArray(main) || main.length < 2) return null;
      return {
        main: [
          ScoreHelper.toScoreNumber(main[0]),
          ScoreHelper.toScoreNumber(main[1]),
        ],
        extra:
          extra && extra.length >= 2
            ? [
                ScoreHelper.toScoreNumber(extra[0]),
                ScoreHelper.toScoreNumber(extra[1]),
              ]
            : null,
      };
    }
    return {
      main: [
        ScoreHelper.toScoreNumber(period[0]),
        ScoreHelper.toScoreNumber(period[1]),
      ],
      extra: null,
    };
  }

  /**
   * Build score from match.score or per-player score fields.
   */
  static resolveMatchScore(
    rawMatch: MatchInput | null | undefined,
    p1: Player | null,
    p2: Player | null,
  ): NormalizedScore | null {
    if (!rawMatch || typeof rawMatch !== 'object') return null;
    if (rawMatch.score != null) {
      return ScoreHelper.normalize(rawMatch.score, rawMatch.scoreType);
    }
    const s1 = rawMatch.player1?.score;
    const s2 = rawMatch.player2?.score;
    if (s1 == null && s2 == null) return null;
    return ScoreHelper.normalize([s1 ?? 0, s2 ?? 0], rawMatch.scoreType);
  }

  private static toScoreNumber(value: unknown): number {
    if (value == null || value === '') return 0;
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  /** Per-player display value (single or sets). */
  static formatScoreForSlot(
    score: NormalizedScore | null | undefined,
    slotIndex: number,
  ): string | null {
    if (!score) return null;
    if (score.mode === 'single') {
      const v = score.values[slotIndex];
      return v == null ? null : String(v);
    }
    if (score.mode === 'sets') {
      const parts = score.values
        .map((period) => period?.main?.[slotIndex])
        .filter((v): v is number => v != null);
      if (!parts.length) return null;
      return parts.join(' ');
    }
    return null;
  }

  /** Per-player value for single-score mode */
  static singleScoreForSlot(
    score: NormalizedScore | null | undefined,
    slotIndex: number,
  ): number | null {
    if (!score || score.mode !== 'single') return null;
    const v = score.values[slotIndex];
    return v == null ? null : v;
  }

  static clone(
    score: NormalizedScore | null | undefined,
  ): NormalizedScore | null {
    if (!score) return null;
    if (score.mode === 'single') {
      return {
        mode: 'single',
        type: score.type,
        values: [...score.values],
      };
    }
    return {
      mode: 'sets',
      type: score.type,
      values: score.values.map((period) => ({
        main: [...period.main] as [number, number],
        extra: period.extra
          ? ([...period.extra] as [number, number])
          : null,
      })),
    };
  }

  static appendForSlot(
    parent: Element | null | undefined,
    score: NormalizedScore | null | undefined,
    slotIndex: number,
  ): boolean {
    if (!score || !parent) return false;
    if (score.mode === 'single') {
      const v = score.values[slotIndex];
      if (v == null) return false;
      parent.textContent = String(v);
      return true;
    }
    if (score.mode !== 'sets' || !score.values?.length) return false;
    let any = false;
    score.values.forEach((period) => {
      const main = period?.main?.[slotIndex];
      if (main == null) return;
      any = true;
      const cell = document.createElement('span');
      cell.className = 'jb-score__period';
      cell.appendChild(document.createTextNode(String(main)));
      const extra = period.extra?.[slotIndex];
      if (extra != null) {
        const sup = document.createElement('sup');
        sup.className = 'jb-score__extra';
        sup.textContent = String(extra);
        cell.appendChild(sup);
      }
      parent.appendChild(cell);
    });
    return any;
  }
}
