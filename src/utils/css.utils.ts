export class CssUtils {
  static escape(value: string): string {
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
      return CSS.escape(value);
    }
    return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  /** Normalize radius option to a CSS length. */
  static formatRadius(value: unknown): string | null {
    if (value == null || value === '') return null;
    if (typeof value === 'number' && Number.isFinite(value)) {
      return `${Math.max(0, value)}px`;
    }
    const s = String(value).trim();
    if (s === '') return null;
    if (/^\d+(\.\d+)?$/.test(s)) return `${Math.max(0, Number(s))}px`;
    return s;
  }
}
