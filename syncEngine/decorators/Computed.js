import { computed as mobxComputed } from "mobx";

/**
 * @Computed — getter decorator.
 *
 * Wraps a `get` accessor in a per-instance MobX computed so the result is
 * memoised and only recomputed when a tracked dependency changes.
 *
 * Computed values are never stored in IndexedDB and never produce transactions;
 * they are pure derivations reconstructed from persisted data after hydration.
 *
 * Usage:
 *   @Computed
 *   get parents() { return this.parentIds.map(id => ModelRegistry.get('Issue', id)); }
 */

// WeakMap keeps one MobX computed per (instance, getter) pair without leaking.
const computedCache = new WeakMap();

export function Computed(getter, context) {
  if (context.kind !== "getter") {
    throw new Error("@Computed must be applied to a getter accessor");
  }

  return function () {
    let cache = computedCache.get(this);
    if (!cache) {
      cache = new Map();
      computedCache.set(this, cache);
    }

    const name = context.name;
    if (!cache.has(name)) {
      cache.set(name, mobxComputed(getter.bind(this), { name }));
    }

    return cache.get(name).get();
  };
}
