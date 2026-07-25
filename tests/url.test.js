import { describe, it, expect } from 'vitest';
import { sanitizeUrl } from '../src/facade/url.facade';

describe('sanitizeUrl', () => {
  it('allows https and http', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    expect(sanitizeUrl('http://example.com/a')).toBe('http://example.com/a');
  });

  it('allows relative paths', () => {
    expect(sanitizeUrl('/players/1')).toBe('/players/1');
    expect(sanitizeUrl('players/1')).toBe('players/1');
  });

  it('rejects javascript and other schemes', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeUrl('data:text/html,hi')).toBeNull();
  });
});
