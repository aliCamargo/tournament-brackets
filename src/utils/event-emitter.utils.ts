type Handler = (payload: unknown) => void;

export class EventEmitter {
  #map = new Map<string, Set<Handler>>();

  on(type: string, fn: Handler): void {
    if (!this.#map.has(type)) this.#map.set(type, new Set());
    this.#map.get(type)!.add(fn);
  }

  off(type: string, fn: Handler): void {
    this.#map.get(type)?.delete(fn);
  }

  emit(type: string, payload?: unknown): void {
    this.#map.get(type)?.forEach((fn) => fn(payload));
  }
}
