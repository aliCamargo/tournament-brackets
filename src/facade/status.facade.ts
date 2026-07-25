import { MATCH_STATUSES } from '../domain/index';
import { StatusHelper } from '../helpers/status.helper';

export { MATCH_STATUSES };

export const normalizeStatus = StatusHelper.normalize.bind(StatusHelper);
export const resolveMatchStatus = StatusHelper.resolve.bind(StatusHelper);
export const formatStatusLabel = StatusHelper.formatLabel.bind(StatusHelper);
