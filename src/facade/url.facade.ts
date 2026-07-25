import { UrlUtils } from '../utils/url.utils';

export function sanitizeUrl(url: unknown): string | null {
  return UrlUtils.sanitize(url);
}
