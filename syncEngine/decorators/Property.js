import { observabilityHelper } from "../core/observabilityHelper.js";
import { PROP_TYPE } from "../shared/constants.js";

/**
 * @Property([options]) — field decorator for plain owned fields.
 *
 * - Wraps the field in an observable box via observabilityHelper (M1).
 * - Setter calls instance._propertyChanged(name, oldValue) so BaseModel
 *   can track diffs for UpdateTransaction.
 * - Registers { name, type: 'property', options } in context.metadata._syncProps
 *   so @ClientModel can include the field in the schemaHash.
 *
 * Options:
 *   type — Built-in type constructor (String, Number, Boolean, Date) or custom
 *          class constructor. Required.
 *   required — When true, field value cannot be null/undefined/empty string. Default: false
 *   serializer — { toStore(value): *, fromStore(raw): * }
 *                Controls how the value is encoded for IndexedDB / the wire.
 *
 * Usage:
 *   @Property({ type: String })          title = '';
 *   @Property({ type: Number })          priority = 0;
 *   @Property({ type: Date, required: true })  createdAt = null;
 *   @Property({ type: String, serializer: dateSerializer })  createdAt = null;
 */
export function Property(options = {}) {
  return function (_, context) {
    if (context.kind !== "field") {
      throw new Error("@Property must be applied to a class field");
    }

    const { type, required = false, serializer } = options;

    // type is required
    if (!type) {
      throw new Error(
        `@Property("${context.name}"): 'type' option is required (e.g. { type: String }, { type: Number })`,
      );
    }

    if (typeof required !== "boolean") {
      throw new Error(
        `@Property("${context.name}"): 'required' must be a boolean`,
      );
    }

    const name = context.name;

    // Register in shared metadata so @ClientModel can build the schemaHash.
    context.metadata._syncProps ??= [];
    context.metadata._syncProps.push({
      name,
      type: PROP_TYPE.PROPERTY,
      options: { type, required, serializer },
    });

    // addInitializer runs on each new instance after the field initializer,
    // so `this[name]` already holds the declared default value.
    context.addInitializer(function () {
      observabilityHelper(this, name, (instance, fieldName, oldValue) => {
        instance._propertyChanged?.(fieldName, oldValue);
      });
    });
  };
}
