import { ref, watch } from 'vue'

/**
 * observabilityHelper — "M1" in the plan.
 *
 * Replaces a plain instance field with a MobX observable box exposed via a
 * custom getter/setter pair. The setter:
 *   1. Writes the new value into the MobX box (triggers reactive re-renders).
 *   2. Calls onSet(instance, name, oldValue) so the model can record the
 *      previous value in modifiedProperties for UpdateTransaction.
 *
 * @param {object}   instance      - The model instance.
 * @param {string}   name          - Field name.
 * @param {Function} onSet         - Called with (instance, name, oldValue)
 *                                   whenever the value changes.
 */
export function observabilityHelper(instance, name, onSet) {
  // Capture any value already placed on the instance by a field initializer.
  const existing = Object.getOwnPropertyDescriptor(instance, name)
  const initialValue = existing?.value

  const box = ref(initialValue)

  // direct check in setter doesn't work for objects/arrays because of reference equality,
  //  so we use a deep equality check in a watch to detect mutations (e.g., push, splice) and call onSet with the old value.
  watch(
    box,
    (_, oldVal) => {
      onSet(instance, name, oldVal)
    },
    { deep: true },
  )

  Object.defineProperty(instance, name, {
    enumerable: true,
    configurable: true,
    get() {
      return box.value
    },
    set(newVal) {
      box.value = newVal
    },
  })
}
