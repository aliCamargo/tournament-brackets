import type { BracketsLabels } from '../domain/interfaces/brackets.interface';
import type { NormalizedScore } from '../domain/types/score.types';
import { MatchStatus } from '../domain/enums/match-status.enum';

export class StatusHelper {
  static normalize(raw: unknown): MatchStatus | null {
    if (raw == null || raw === '') return null;
    const key = String(raw).trim().toLowerCase().replace(/[\s-]+/g, '_');
    return (Object.values(MatchStatus) as string[]).includes(key)
      ? (key as MatchStatus)
      : null;
  }

  /**
   * Infer status when not provided explicitly.
   */
  static resolve(
    matchLike: {
      winnerId?: string | null;
      score?: NormalizedScore | null;
      status?: unknown;
    } = {},
  ): MatchStatus {
    const explicit = StatusHelper.normalize(matchLike.status);
    if (explicit) return explicit;

    if (matchLike.winnerId) return MatchStatus.Final;
    if (matchLike.score) return MatchStatus.InProgress;
    return MatchStatus.Scheduled;
  }

  static formatLabel(
    status: MatchStatus,
    labels: BracketsLabels = {},
  ): string {
    const map: Record<MatchStatus, string> = {
      [MatchStatus.Scheduled]: labels.statusScheduled ?? 'Scheduled',
      [MatchStatus.InProgress]: labels.statusInProgress ?? 'In Progress',
      [MatchStatus.Final]: labels.statusFinal ?? 'Final',
      [MatchStatus.Retired]: labels.statusRetired ?? 'Retired',
      [MatchStatus.Walkover]: labels.statusWalkover ?? 'Walkover',
    };
    return map[status] || map[MatchStatus.Scheduled];
  }
}
