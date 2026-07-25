/**
 * Allow http(s) and relative URLs; reject other schemes (e.g. javascript:).
 */
export class UrlUtils {
  static sanitize(url: unknown): string | null {
    if (url == null || url === '') return null;
    const s = String(url).trim();
    if (/^(https?:)/i.test(s)) return s;
    if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return null;
    if (s.startsWith('/') || !s.includes(':')) return s;
    return null;
  }
}
