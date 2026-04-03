// ModelValidator.js
import ModelRegistry from "./ModelRegistry.js";

/**
 * Error thrown when @Property validation fails.
 */
export class ValidationError extends Error {
  constructor(errors) {
    super(`Validation failed: ${errors.map((e) => e.message).join("; ")}`);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

/**
 * Validates model instance properties against their declared schema constraints.
 * Extracted from BaseModel to satisfy Single Responsibility Principle.
 */
export const ModelValidator = {
  /**
   * Validate all @Property fields on an instance against the schema.
   * @param {object} instance - model instance
   * @param {string} modelName - registered model name
   * @throws {ValidationError} if any field fails validation
   */
  validate(instance, modelName) {
    const schema = ModelRegistry.getSchema(modelName);
    if (!schema) return;

    const errors = [];

    for (const prop of schema.properties.values()) {
      const { name, options } = prop;
      if (!options) continue;

      const { type, required } = options;
      if (!type) continue;

      const value = instance[name];

      // required check
      if (required && (value === undefined || value === null || value === "")) {
        errors.push({ field: name, message: `Field '${name}' is required` });
        continue;
      }

      // type check (skip if null/undefined and not required)
      if (value === undefined || value === null) continue;

      let valid = false;
      if (type === Date) valid = value instanceof Date && !isNaN(value);
      else if (type === Array) valid = Array.isArray(value);
      else valid = value.constructor === type;

      if (!valid) {
        const typeStr = type.name;
        errors.push({
          field: name,
          message: `Field '${name}' must be of type ${typeStr}`,
        });
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  },
};
