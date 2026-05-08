import { ref } from 'vue'

/**
 * observabilityHelper — wraps an instance field in a Vue ref exposed via a
 * custom getter/setter pair so Vue's reactivity tracks reads and writes for
 * template re-renders and watchers.
 *
 * No dirty tracking: the syncEngine is now remote-first — `directSaveStrategy`
 * computes the UPDATE patch by diffing the in-memory instance against the
 * latest persisted IDB row at save time, so there is no per-field "is this
 * field locally modified?" state to maintain.
 *
 * `updatedAt` keeps a non-reactive code path so the server's autoUpdate
 * timestamp landing via hydrate() doesn't trigger a render storm.
 *
 * @param {object} instance - The model instance.
 * @param {string} name     - Field name.
 */
export function observabilityHelper(instance, name) {
  const existing = Object.getOwnPropertyDescriptor(instance, name)
  const initialValue = existing?.value
  let updatedAtValue = initialValue
  const box = ref(initialValue)

  Object.defineProperty(instance, name, {
    enumerable: true,
    configurable: true,
    get() {
      if (name === 'updatedAt') return updatedAtValue
      return box.value
    },
    set(newVal) {
      if (name === 'updatedAt') {
        updatedAtValue = newVal
      } else {
        box.value = newVal
      }
    },
  })
}
