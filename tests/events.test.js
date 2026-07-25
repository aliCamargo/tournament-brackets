import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from '../src/utils/event-emitter.utils';

describe('EventEmitter', () => {
  it('calls subscribed handlers on emit', () => {
    const bus = new EventEmitter();
    const fn = vi.fn();
    bus.on('change', fn);
    bus.emit('change', { ok: true });
    expect(fn).toHaveBeenCalledWith({ ok: true });
  });

  it('off removes handler', () => {
    const bus = new EventEmitter();
    const fn = vi.fn();
    bus.on('change', fn);
    bus.off('change', fn);
    bus.emit('change');
    expect(fn).not.toHaveBeenCalled();
  });
});
