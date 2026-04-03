import { observable, action as mobxAction } from "mobx";

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
  const existing = Object.getOwnPropertyDescriptor(instance, name);
  const initialValue = existing?.value;

  const box = observable.box(initialValue, { name });

  Object.defineProperty(instance, name, {
    enumerable: true,
    configurable: true,
    get() {
      return box.get();
    },
    set: mobxAction(`${name}=`, function (newVal) {
      const old = box.get();
      box.set(newVal);
      if (old !== newVal) onSet(instance, name, old);
    }),
  });
}
