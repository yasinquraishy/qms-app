import { ref } from 'vue'

/**
 * observabilityHelper — "M1" in the plan.
 *
 * Replaces a plain instance field with a Vue ref exposed via a custom
 * getter/setter pair. The setter writes the new value into the ref (triggers
 * reactive re-renders) and notifies the model via onSet so it can record the
 * field as dirty.
 *
 * @param {object}   instance      - The model instance.
 * @param {string}   name          - Field name.
 * @param {Function} onSet         - Called with (instance, name) whenever the
 *                                   value changes.
 */
export function observabilityHelper(instance, name, onSet) {
  // Capture any value already placed on the instance by a field initializer.
  const existing = Object.getOwnPropertyDescriptor(instance, name)
  const initialValue = existing?.value
  // updatedAt is non-reactive (skips re-renders on auto-bumped saves), so
  // we keep its current value in a plain variable rather than the ref.
  let updatedAtValue = initialValue
  const box = ref(initialValue)

  // Watch deeply so internal mutations of arrays/objects also flag dirty.
  // _propertyChanged is idempotent (Set.add) so spurious fires are no-ops.
  watch(box, () => onSet(instance, name), { deep: true })

  Object.defineProperty(instance, name, {
    enumerable: true,
    configurable: true,
    get() {
      if (name === 'updatedAt') {
        return updatedAtValue
      }
      return box.value
    },
    set(newVal) {
      if (name === 'updatedAt') {
        updatedAtValue = newVal
        onSet(instance, name)
      } else {
        box.value = newVal
      }
    },
  })
}
