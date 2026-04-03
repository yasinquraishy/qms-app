import { computed as vueComputed } from 'vue'

/**
 * @Computed — getter decorator.
 *
 * Wraps a `get` accessor in a per-instance Vue computed so the result is
 * memoised and only recomputed when a tracked dependency changes.
 *
 * Computed values are never stored in IndexedDB and never produce transactions;
 * they are pure derivations reconstructed from persisted data after hydration.
 *
 * Usage:
 *   @Computed
 *   get parents() { return this.parentIds.map(id => ModelRegistry.get('Issue', id)); }
 */

export function Computed(getter, context) {
  if (context.kind !== 'getter') {
    throw new Error('@Computed must be applied to a getter accessor')
  }

  const cacheKey = Symbol(context.name)

  return function () {
    if (!this[cacheKey]) {
      this[cacheKey] = vueComputed(getter.bind(this))
    }
    return this[cacheKey].value
  }
}
