/**
 * Converts snake_case | PascalCase | kebab-case string to camelCase.
 * @param {string} input - The input string to convert.
 * @returns {string} - The camelCased string.
 */
export function toCamelCase(input) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  return (
    input
      // Insert a space before capital letters (PascalCase → Pascal Case)
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      // Replace underscores and hyphens with spaces
      .replace(/[_-]+/g, ' ')
      .trim()
      .split(/\s+/)
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join('')
  );
}

/**
 *
 * @param {object | Array} obj
 * @returns {object | Array} New object or array with all keys converted to camelCase.
 */
export function keysToCamelCase(obj) {
  return keysToCase(obj, toCamelCase);
}

/**
 * Converts camelCase | PascalCase | kebab-case string to snake_case.
 * @param {string} input - The input string to convert.
 * @returns {string} - The snake_cased string.
 */
export function toSnakeCase(input) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  return (
    input
      // Replace hyphens with underscores
      .replace(/-/g, '_')
      // Insert underscore between lowerCase/number and UpperCase (e.g. camelCase → camel_Case)
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      // Handle consecutive capitals properly (e.g. "APIResponse" → "api_response")
      .replace(/([A-Z]+)([A-Z][a-z0-9])/g, '$1_$2')
      // Lowercase everything
      .toLowerCase()
  );
}

export function keysToSnakeCase(obj) {
  return keysToCase(obj, toSnakeCase);
}

function keysToCase(obj, caseFn) {
  if (Array.isArray(obj)) {
    return obj.map(item => keysToCase(item, caseFn));
  } else if (typeof obj === 'object' && obj !== null && obj instanceof Date === false) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[caseFn(key)] = keysToCase(value, caseFn);
      return acc;
    }, {});
  }
  return obj;
}
